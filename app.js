import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// Firebase Configuration Setup
const appId = typeof __app_id !== 'undefined' ? __app_id : 'habits-89324';
const firebaseConfig = {
    apiKey: "AIzaSyALMYNz8Cnl1DLWlFl2N4jYuVFW7rYh7Ik",
    authDomain: "habits-89324.firebaseapp.com",
    projectId: "habits-89324",
    storageBucket: "habits-89324.firebasestorage.app",
    messagingSenderId: "925221729578",
    appId: "1:925221729578:web:8798fcc42d47d089c05a53",
    measurementId: "G-R0MHT7DKCF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const { createApp } = Vue;

createApp({
    data() {
        return {
            currentStep: 'setup', // 'setup', 'builder', 'dashboard', 'settings'
            userName: '',
            showStatsModal: false,
            showRewardModal: false,
            showFailureModal: false,
            failedTaskName: '',
            notificationsEnabled: false,
            syncStatus: 'synced', // 'synced', 'syncing', 'offline'
            currentUserId: null,
            unsubscribeFirestore: null,
            textInputs: {},
            weekDays: [
                { id: 0, name: 'الأحد', short: 'أحد' },
                { id: 1, name: 'الإثنين', short: 'إثنين' },
                { id: 2, name: 'الثلاثاء', short: 'ثلاثاء' },
                { id: 3, name: 'الأربعاء', short: 'أربعاء' },
                { id: 4, name: 'الخميس', short: 'خميس' },
                { id: 5, name: 'الجمعة', short: 'جمعة' },
                { id: 6, name: 'السبت', short: 'سبت' },
            ],
            form: {
                title: '',
                description: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                selectedDays: [0, 1, 2, 3, 4],
                reward: ''
            },
            simulatedToday: new Date().toISOString().split('T')[0],
            newTask: {
                title: '',
                type: 'checkbox', // 'checkbox', 'days', 'text'
                taskDays: [0, 1, 2, 3, 4],
                isMandatory: false
            },
            challenge: {
                isCreated: false,
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                selectedDays: [],
                reward: '',
                tasks: [],
                logs: {},
                notes: '',
                simulatedToday: new Date().toISOString().split('T')[0],
                userProfile: {
                    name: 'المستخدم النشط',
                    email: 'user@challenges.com'
                }
            }
        }
    },
    computed: {
        currentGreetingText() {
            const hour = new Date().getHours();
            return hour < 12 ? 'صباحك سعيد' : 'مساؤك سعيد';
        },
        currentDate() {
            return new Date().toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        },
        totalDaysCount() {
            if (!this.challenge.startDate || !this.challenge.endDate) return 0;
            const start = new Date(this.challenge.startDate);
            const end = new Date(this.challenge.endDate);
            const diffTime = Math.abs(end - start);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        },
        currentDayIndex() {
            if (!this.challenge.startDate) return 1;
            const start = new Date(this.challenge.startDate);
            const current = new Date(this.simulatedToday);
            const diffTime = current - start;
            const dayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return Math.max(1, Math.min(dayNum, this.totalDaysCount));
        },
        remainingDaysCount() {
            return Math.max(0, this.totalDaysCount - this.currentDayIndex);
        },
        isChallengeFinished() {
            return this.remainingDaysCount === 0 || this.overallProgressPercent >= 100;
        },
        filteredActiveDaysList() {
            if (!this.challenge.startDate || !this.challenge.endDate) return [];
            const list = [];
            let curr = new Date(this.challenge.startDate);
            const end = new Date(this.challenge.endDate);

            while (curr <= end) {
                const dayOfWeek = curr.getDay();
                const dateStr = curr.toISOString().split('T')[0];

                if (this.challenge.selectedDays.includes(dayOfWeek)) {
                    const isCompleted = this.isDayFullyDone(dateStr);
                    list.push({
                        dateStr: dateStr,
                        dayName: this.weekDays.find(d => d.id === dayOfWeek).name,
                        formattedDate: this.formatDateArabic(dateStr),
                        isCompleted: isCompleted,
                        statusText: isCompleted ? 'منجز بالكامل' : (dateStr === this.simulatedToday ? 'جاري اليوم' : 'معلق'),
                        statusClass: isCompleted ? 'bg-emerald-100 text-emerald-800' : (dateStr === this.simulatedToday ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')
                    });
                }
                curr.setDate(curr.getDate() + 1);
            }
            return list;
        },
        todaysApplicableTasks() {
            return this.challenge.tasks.filter(task => this.isTaskApplicableOnDate(task, this.simulatedToday));
        },
        overallProgressPercent() {
            if (this.filteredActiveDaysList.length === 0 || this.challenge.tasks.length === 0) return 0;
            let totalPossibleCheckmarks = 0;
            let completedCheckmarks = 0;

            this.filteredActiveDaysList.forEach(day => {
                this.challenge.tasks.forEach(t => {
                    if (this.isTaskApplicableOnDate(t, day.dateStr)) {
                        totalPossibleCheckmarks++;
                        if (this.isTaskCompleted(day.dateStr, t.id)) {
                            completedCheckmarks++;
                        }
                    }
                });
            });

            if (totalPossibleCheckmarks === 0) return 0;
            return Math.round((completedCheckmarks / totalPossibleCheckmarks) * 100) || 0;
        },
        totalStats() {
            let completedCount = 0;
            let pendingCount = 0;

            this.filteredActiveDaysList.forEach(day => {
                this.challenge.tasks.forEach(t => {
                    if (this.isTaskApplicableOnDate(t, day.dateStr)) {
                        if (this.isTaskCompleted(day.dateStr, t.id)) {
                            completedCount++;
                        } else {
                            pendingCount++;
                        }
                    }
                });
            });

            return { completedCount, pendingCount };
        },
        weeklyStatsList() {
            if (!this.challenge.startDate || !this.challenge.endDate) return [];
            const activeDays = this.filteredActiveDaysList;
            const weeks = [];
            let weekNum = 1;

            for (let i = 0; i < activeDays.length; i += 7) {
                const weekDays = activeDays.slice(i, i + 7);
                let totalTasks = 0;
                let completedTasks = 0;

                weekDays.forEach(day => {
                    this.challenge.tasks.forEach(t => {
                        if (this.isTaskApplicableOnDate(t, day.dateStr)) {
                            totalTasks++;
                            if (this.isTaskCompleted(day.dateStr, t.id)) {
                                completedTasks++;
                            }
                        }
                    });
                });

                const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                weeks.push({
                    weekNumber: weekNum,
                    startDateFormatted: weekDays[0].formattedDate,
                    endDateFormatted: weekDays[weekDays.length - 1].formattedDate,
                    completed: completedTasks,
                    pending: totalTasks - completedTasks,
                    total: totalTasks,
                    percent: percent
                });
                weekNum++;
            }

            return weeks;
        }
    },
    watch: {
        simulatedToday(newDate, oldDate) {
            if (oldDate && newDate > oldDate) {
                this.verifyMandatoryTasksAdherence(oldDate);
            }
        }
    },
    async mounted() {
        if ("Notification" in window && Notification.permission === "granted") {
            this.notificationsEnabled = true;
        }
        await this.initFirebase();
    },
    methods: {
        // Firebase Initializer
        async initFirebase() {
            try {
                onAuthStateChanged(auth, (user) => {
                    if (user) {
                        this.currentUserId = user.uid;
                        const savedName = user.displayName || '';
                        this.userName = savedName.trim();
                        if (this.challenge.userProfile) {
                            this.challenge.userProfile.name = this.userName || 'المستخدم النشط';
                        }
                        this.currentStep = this.challenge.isCreated ? 'dashboard' : 'setup';
                        this.listenToFirestoreChallenge();
                    } else {
                        this.currentUserId = null;
                        this.userName = '';
                        window.location.href = 'login.html';
                    }
                });
            } catch (err) {
                console.error("Firebase auth error:", err);
            }
        },
        async syncUserNameToAccount() {
            if (!auth.currentUser) return;

            const trimmedName = (this.userName || '').trim();
            if (!trimmedName) {
                this.userName = auth.currentUser.displayName || this.challenge.userProfile?.name || '';
                return;
            }

            if (auth.currentUser.displayName === trimmedName) {
                this.challenge.userProfile.name = trimmedName;
                return;
            }

            try {
                await updateProfile(auth.currentUser, { displayName: trimmedName });
                this.userName = trimmedName;
                if (this.challenge.userProfile) {
                    this.challenge.userProfile.name = trimmedName;
                }
                await this.saveToFirestore();
            } catch (error) {
                console.error('Error updating user display name:', error);
                alert('تعذر تحديث اسم المستخدم في الحساب، حاول مرة أخرى.');
                this.userName = auth.currentUser.displayName || this.challenge.userProfile?.name || '';
            }
        },
        async logout() {
            await signOut(auth);
        },
        // Realtime Listener for Firestore Document
        listenToFirestoreChallenge() {
            if (!this.currentUserId) return;
            const challengeDocRef = doc(db, 'artifacts', appId, 'users', this.currentUserId, 'challengeData', 'current');

            this.unsubscribeFirestore = onSnapshot(challengeDocRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    this.challenge = Object.assign({}, this.challenge, data);
                    if (!auth.currentUser?.displayName && data.userProfile?.name) {
                        this.userName = data.userProfile.name;
                    }
                    if (data.simulatedToday) {
                        this.simulatedToday = data.simulatedToday;
                    }
                    if (this.challenge.isCreated) {
                        if (this.currentStep === 'setup') {
                            this.currentStep = 'dashboard';
                        }
                    }
                    this.syncStatus = 'synced';
                }
            }, (error) => {
                console.error("Firestore listener error:", error);
                this.syncStatus = 'offline';
            });
        },
        // Save State to Cloud Firestore
        async saveToFirestore() {
            if (!this.currentUserId) return;
            this.syncStatus = 'syncing';
            try {
                const challengeDocRef = doc(db, 'artifacts', appId, 'users', this.currentUserId, 'challengeData', 'current');
                const dataToSave = JSON.parse(JSON.stringify(this.challenge));
                dataToSave.simulatedToday = this.simulatedToday;

                await setDoc(challengeDocRef, dataToSave, { merge: true });
                this.syncStatus = 'synced';
            } catch (e) {
                console.error("Error saving to Firestore:", e);
                this.syncStatus = 'offline';
            }
        },
        // Web Notifications Switch & Triggering
        async toggleNotifications() {
            if (!("Notification" in window)) {
                alert("متصفحك لا يدعم خاصية الإشعارات.");
                return;
            }
            if (Notification.permission === "granted") {
                this.notificationsEnabled = !this.notificationsEnabled;
                if (this.notificationsEnabled) {
                    this.sendWebNotification("تم تفعيل الإشعارات", "ستصلك تنبيهات حية لمتابعة إنجاز مهام التحدي.");
                }
            } else {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    this.notificationsEnabled = true;
                    this.sendWebNotification("تم تفعيل الإشعارات بنجاح", "جاهز لتلقي التنبيهات والتذكيرات اليومية.");
                }
            }
        },
        sendWebNotification(title, body) {
            if (this.notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
                new Notification(title, {
                    body: body,
                    icon: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png'
                });
            }
        },
        sendTaskReminderNotification() {
            const pendingTasks = this.todaysApplicableTasks.filter(t => !this.isTaskCompleted(this.simulatedToday, t.id));
            if (pendingTasks.length > 0) {
                this.sendWebNotification("تذكير بمهام اليوم 📌", `لديك ${pendingTasks.length} مهام متبقية اليوم تحتاج لإنجازها!`);
            } else {
                this.sendWebNotification("ممتاز جداً! 🎉", "لقد أتممت كافة المهام المخصصة لليوم بالكامل.");
            }
        },
        goHome() {
            if (this.challenge.isCreated) {
                this.currentStep = 'dashboard';
            } else {
                this.currentStep = 'setup';
            }
        },
        getFirstActiveDate(startDate, selectedDays) {
            if (!startDate || !selectedDays || selectedDays.length === 0) return startDate;
            let curr = new Date(startDate);
            for (let i = 0; i < 7; i++) {
                if (selectedDays.includes(curr.getDay())) {
                    return curr.toISOString().split('T')[0];
                }
                curr.setDate(curr.getDate() + 1);
            }
            return startDate;
        },
        toggleDaySelection(dayId) {
            const idx = this.form.selectedDays.indexOf(dayId);
            if (idx > -1) {
                if (this.form.selectedDays.length > 1) {
                    this.form.selectedDays.splice(idx, 1);
                }
            } else {
                this.form.selectedDays.push(dayId);
            }
        },
        toggleNewTaskDay(dayId) {
            const idx = this.newTask.taskDays.indexOf(dayId);
            if (idx > -1) {
                if (this.newTask.taskDays.length > 1) {
                    this.newTask.taskDays.splice(idx, 1);
                }
            } else {
                this.newTask.taskDays.push(dayId);
            }
        },
        getTaskDaysFormatted(taskDays) {
            if (!taskDays || taskDays.length === 0) return '';
            return taskDays.map(id => {
                const d = this.weekDays.find(w => w.id === id);
                return d ? d.short : '';
            }).join(' • ');
        },
        proceedToTaskBuilder() {
            this.challenge.isCreated = true;
            this.challenge.title = this.form.title;
            this.challenge.description = this.form.description;
            this.challenge.startDate = this.form.startDate;
            this.challenge.endDate = this.form.endDate;
            this.challenge.selectedDays = [...this.form.selectedDays];
            this.challenge.reward = this.form.reward;

            if (this.challenge.tasks.length === 0) {
                this.challenge.tasks = [
                    { id: 1, title: 'جدول دوام الجامعة والمحاضرات', type: 'days', taskDays: [0, 1, 2, 3, 4], isMandatory: true },
                    { id: 2, title: 'تمريني الرياضي لليوم', type: 'checkbox', isMandatory: false }
                ];
            }

            this.simulatedToday = this.getFirstActiveDate(this.challenge.startDate, this.challenge.selectedDays);
            this.saveToFirestore();
            this.currentStep = 'builder';
        },
        finishTaskBuilderAndGoToDashboard() {
            this.simulatedToday = this.getFirstActiveDate(this.challenge.startDate, this.challenge.selectedDays);
            this.saveToFirestore();
            this.currentStep = 'dashboard';
        },
        addNewTask() {
            if (!this.newTask.title.trim()) return;

            this.challenge.tasks.push({
                id: Date.now(),
                title: this.newTask.title.trim(),
                type: this.newTask.type,
                taskDays: this.newTask.type === 'days' ? [...this.newTask.taskDays] : [],
                isMandatory: this.newTask.isMandatory
            });

            this.newTask.title = '';
            this.newTask.isMandatory = false;
            this.saveToFirestore();
        },
        removeTask(taskId) {
            this.challenge.tasks = this.challenge.tasks.filter(t => t.id !== taskId);
            this.saveToFirestore();
        },
        isDaySelected(dateStr) {
            const d = new Date(dateStr);
            return this.challenge.selectedDays.includes(d.getDay());
        },
        getDayNameArabic(dateStr) {
            const d = new Date(dateStr);
            const dayObj = this.weekDays.find(w => w.id === d.getDay());
            return dayObj ? dayObj.name : '';
        },
        isTaskApplicableOnDate(task, dateStr) {
            if (!this.isDaySelected(dateStr)) return false;
            const d = new Date(dateStr);
            const dayOfWeek = d.getDay();

            if (task.type === 'days') {
                return task.taskDays && task.taskDays.includes(dayOfWeek);
            }
            return true;
        },
        toggleTaskLog(dateStr, taskId) {
            if (!this.challenge.logs) this.challenge.logs = {};
            if (!this.challenge.logs[dateStr]) this.challenge.logs[dateStr] = {};

            this.challenge.logs[dateStr][taskId] = !this.challenge.logs[dateStr][taskId];
            this.saveToFirestore();
        },
        addTextLogEntry(dateStr, taskId) {
            const text = (this.textInputs[taskId] || '').trim();
            if (!text) return;

            if (!this.challenge.logs) this.challenge.logs = {};
            if (!this.challenge.logs[dateStr]) this.challenge.logs[dateStr] = {};
            if (!Array.isArray(this.challenge.logs[dateStr][taskId])) {
                const oldVal = this.challenge.logs[dateStr][taskId];
                this.challenge.logs[dateStr][taskId] = oldVal && typeof oldVal === 'string' ? [oldVal] : [];
            }

            this.challenge.logs[dateStr][taskId].push(text);
            this.textInputs[taskId] = '';
            this.saveToFirestore();
        },
        removeTextLogEntry(dateStr, taskId, index) {
            if (this.challenge.logs && this.challenge.logs[dateStr] && Array.isArray(this.challenge.logs[dateStr][taskId])) {
                this.challenge.logs[dateStr][taskId].splice(index, 1);
                this.saveToFirestore();
            }
        },
        getTaskTextEntries(dateStr, taskId) {
            if (!this.challenge.logs || !this.challenge.logs[dateStr]) return [];
            const val = this.challenge.logs[dateStr][taskId];
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val.trim().length > 0) return [val];
            return [];
        },
        isTaskCompleted(dateStr, taskId) {
            const task = this.challenge.tasks.find(t => t.id === taskId);
            if (!task || !this.challenge.logs || !this.challenge.logs[dateStr]) return false;

            const log = this.challenge.logs[dateStr][taskId];
            if (!log) return false;

            if (task.type === 'checkbox' || task.type === 'days') {
                return !!log;
            } else if (task.type === 'text') {
                if (Array.isArray(log)) return log.length > 0;
                return typeof log === 'string' && log.trim().length > 0;
            }
            return false;
        },
        isDayFullyDone(dateStr) {
            const applicableTasks = this.challenge.tasks.filter(t => this.isTaskApplicableOnDate(t, dateStr));
            if (applicableTasks.length === 0) return true;
            return applicableTasks.every(t => this.isTaskCompleted(dateStr, t.id));
        },
        verifyMandatoryTasksAdherence(pastDateStr) {
            if (!this.isDaySelected(pastDateStr)) return;

            const mandatoryTasks = this.challenge.tasks.filter(t => t.isMandatory && this.isTaskApplicableOnDate(t, pastDateStr));
            for (let task of mandatoryTasks) {
                if (!this.isTaskCompleted(pastDateStr, task.id)) {
                    this.failedTaskName = task.title;
                    this.showFailureModal = true;
                    this.sendWebNotification("انكسر التحدي! ⚠️", `لم يتم إنجاز المهمة الإلزامية (${task.title}).`);
                    break;
                }
            }
        },
        restartChallengeFromBeginning() {
            this.challenge.logs = {};
            this.simulatedToday = this.getFirstActiveDate(this.challenge.startDate, this.challenge.selectedDays);
            this.showFailureModal = false;
            this.saveToFirestore();
        },
        resetToRealToday() {
            this.simulatedToday = new Date().toISOString().split('T')[0];
            this.updateSimulatedTodayInCloud();
        },
        changeSimulatedToday(dateStr) {
            this.simulatedToday = dateStr;
            this.updateSimulatedTodayInCloud();
        },
        updateSimulatedTodayInCloud() {
            this.saveToFirestore();
        },
        checkRewardStatus() {
            if (this.isChallengeFinished) {
                this.showRewardModal = true;
                this.triggerConfetti();
                this.sendWebNotification("تهانينا! 🎉", `حققت التحدي بنجاح! جائزتك: ${this.challenge.reward}`);
            }
        },
        triggerConfetti() {
            if (typeof confetti === 'function') {
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            }
        },
        exportChallengeData() {
            const element = document.createElement('div');
            element.dir = 'rtl';
            element.style.padding = '25px';
            element.style.fontFamily = "'IBM Plex Sans Arabic', sans-serif";
            element.style.color = '#0f172a';
            element.style.backgroundColor = '#ffffff';

            let tasksHtml = '';
            this.challenge.tasks.forEach((t) => {
                tasksHtml += `<li style="margin-bottom: 6px; font-size: 13px;"><strong>${t.title}</strong> <span style="font-size:11px; color: ${t.isMandatory ? '#e11d48' : '#64748b'};">[${t.isMandatory ? 'إلزامية' : 'اختيارية'}]</span></li>`;
            });

            let daysHtml = '';
            this.filteredActiveDaysList.forEach(day => {
                let taskLogs = '';
                this.challenge.tasks.forEach(t => {
                    if (this.isTaskApplicableOnDate(t, day.dateStr)) {
                        const done = this.isTaskCompleted(day.dateStr, t.id);
                        let entriesHtml = '';
                        if (t.type === 'text') {
                            const entries = this.getTaskTextEntries(day.dateStr, t.id);
                            if (entries.length > 0) {
                                entriesHtml = `<div style="font-size:11px; color:#334155; margin-top:2px; background:#f1f5f9; padding:4px 8px; border-radius:4px;">الملاحظات: ${entries.join(' • ')}</div>`;
                            }
                        }
                        taskLogs += `<div style="margin-right: 15px; margin-top: 6px; font-size: 12px;">• <strong>${t.title}</strong>: <span style="color: ${done ? '#16a34a' : '#dc2626'}; font-weight: bold;">${done ? 'تم الإنجاز ✓' : 'غير منجز ✕'}</span>${entriesHtml}</div>`;
                    }
                });
                daysHtml += `<div style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 10px; background: #f8fafc;">
                    <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${day.dayName} (${day.formattedDate}) - <span style="color:#0284c7;">${day.statusText}</span></div>
                    ${taskLogs}
                </div>`;
            });

            element.innerHTML = `
                <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px;">
                    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0;">تقرير تحدياتي (مترابط مع Firebase) - ${this.challenge.title}</h1>
                    <p style="font-size: 12px; color: #64748b; margin-top: 5px;">${this.challenge.description || ''}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 12px; background: #f1f5f9; padding: 12px; border-radius: 8px;">
                    <div><strong>تاريخ البداية:</strong> ${this.formatDateArabic(this.challenge.startDate)}</div>
                    <div><strong>تاريخ النهاية:</strong> ${this.formatDateArabic(this.challenge.endDate)}</div>
                    <div><strong>نسبة الإنجاز الكلية:</strong> ${this.overallProgressPercent}%</div>
                    <div><strong>الجائزة:</strong> ${this.challenge.reward || 'لا يوجد'}</div>
                </div>
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a;">مهام التحدي المعتمدة</h3>
                    <ol style="padding-right: 20px; margin-top: 8px;">${tasksHtml}</ol>
                </div>
                <div>
                    <h3 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #0f172a;">سجل الأيام والنشاط</h3>
                    <div style="margin-top: 10px;">${daysHtml}</div>
                </div>
            `;

            const opt = {
                margin: 10,
                filename: `تقرير_تحدي_${this.challenge.title || 'تحدياتي'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save();
        },
        formatDateArabic(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' });
        },
        startNewChallengeSetup() {
            this.currentStep = 'setup';
        },
        resetProgressOnly() {
            this.challenge.logs = {};
            this.saveToFirestore();
            this.currentStep = 'dashboard';
        },
        async deleteCurrentChallenge() {
            this.challenge = {
                isCreated: false,
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                selectedDays: [],
                reward: '',
                tasks: [],
                logs: {},
                notes: '',
                simulatedToday: new Date().toISOString().split('T')[0],
                userProfile: {
                    name: 'المستخدم النشط',
                    email: 'user@challenges.com'
                }
            };
            await this.saveToFirestore();
            this.currentStep = 'setup';
        }
    }
}).mount('#app');
