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
            challengeLoadComplete: false,
            userName: '',
            userEmail: '',
            showStatsModal: false,
            showRewardModal: false,
            notificationsEnabled: false,
            notificationTime: '20:00',
            notificationTimer: null,
            siteUpdates: [
                {
                    id: 'site-2026-09-09-user-profile-card',
                    text: 'استبدال عرض معرف Firebase ببطاقة تعرض اسم المستخدم والبريد الإلكتروني المسجل فقط.',
                    date: '2026-09-09T22:33:38+03:00'
                },
                {
                    id: 'site-2026-09-09-favicon-daily-checkbox-tasks',
                    text: 'إضافة أيقونة للموقع واستبدال ملاحظات التحدي بمهام يومية مستقلة على شكل checkboxes لا تدخل في التتبع.',
                    date: '2026-09-09T22:26:11+03:00'
                },
                {
                    id: 'site-2026-09-09-challenge-color-save-tasks',
                    text: 'استبدال صورة التحدي باختيار لون، ونقل زر الحفظ أسفل المهام وتسميته حفظ مهام التحدي.',
                    date: '2026-09-09T22:16:16+03:00'
                },
                {
                    id: 'site-2026-09-09-challenge-loading-final-save-solid-color',
                    text: 'إصلاح ظهور لا يوجد تحدي أثناء التحميل، وإضافة حفظ نهائي ينتظر المزامنة، واستبدال خلفية لوحة التحدي بلون ثابت.',
                    date: '2026-09-09T22:11:14+03:00'
                },
                {
                    id: 'site-2026-09-08-collapsible-updates-name-save',
                    text: 'جعل تحديثات الموقع قابلة للطي وإضافة تأثير حفظ وتبديل إلى تعديل في اسم العرض.',
                    date: '2026-09-08T10:01:01+03:00'
                },
                {
                    id: 'site-2026-09-08-challenge-list-days-section',
                    text: 'تحسين بطاقة التحديات ووضع الاسم مع زري التعديل والحذف في سطر واحد، وحذف قسم أيام التحدي من الصفحة الأولى.',
                    date: '2026-09-08T09:57:54+03:00'
                },
                {
                    id: 'site-2026-09-08-challenge-actions-settings',
                    text: 'إزالة زر الأدوات من الشريط العلوي ونقل تعديل وحذف التحديات إلى جانب اسم كل تحدٍ في الإعدادات.',
                    date: '2026-09-08T09:55:39+03:00'
                },
                {
                    id: 'site-2026-09-08-builder-icon-actions',
                    text: 'تحويل زري الرجوع والحفظ في صفحة الأدوات إلى أيقونات فقط مع عناوين توضيحية.',
                    date: '2026-09-08T09:53:03+03:00'
                },
                {
                    id: 'site-2026-09-08-restore-hero-spacing',
                    text: 'إرجاع تعتيم الخلفية ومسافات بطاقات الهيدر إلى الشكل السابق بناءً على الطلب.',
                    date: '2026-09-08T09:47:58+03:00'
                },
                {
                    id: 'site-2026-09-08-hero-text-spacing',
                    text: 'تقوية وضوح النص فوق خلفية التحدي وإضافة مسافات بين بطاقات الموقع والوقت والتاريخ وحواف الهيدر.',
                    date: '2026-09-08T09:46:15+03:00'
                },
                {
                    id: 'site-2026-09-08-hero-background-reward-card',
                    text: 'تعديل هيدر التحدي: جعل الصورة خلفية كاملة ووضع بطاقة الجائزة الصغيرة يسار اسم التحدي في نفس السطر.',
                    date: '2026-09-08T09:44:15+03:00'
                },
                {
                    id: 'site-2026-09-08-challenge-hero-layout',
                    text: 'إعادة ترتيب تصميم لوحة التحدي: الصورة تغطي المستطيل العلوي بلا فراغات وبطاقة الجائزة أسفلها.',
                    date: '2026-09-08T09:25:54+03:00'
                },
                {
                    id: 'site-2026-09-08-challenge-setup-flow',
                    text: 'تحسين إنشاء التحدي: زر صورة بأيقونة، حفظ مباشر للوحة التتبع، خيار الربط، وزر رجوع لتعديل البيانات.',
                    date: '2026-09-08T09:23:43+03:00'
                },
                {
                    id: 'site-2026-09-08-login-design-password-toggle',
                    text: 'تحسين تصميم صفحة تسجيل الدخول بإضافة حدود واضحة وزر لإظهار وإخفاء كلمة المرور.',
                    date: '2026-09-08T09:15:35+03:00'
                },
                {
                    id: 'site-2026-09-08-fix-vue-startup',
                    text: 'إصلاح توقف الموقع بسبب خطأ في قالب Vue بعد تحديث أدوات المهام.',
                    date: '2026-09-08T09:08:49+03:00'
                },
                {
                    id: 'site-2026-09-08-task-days-delete-challenge',
                    text: 'إضافة حذف أي تحدٍ، وإضافة أيام مخصصة لكل مهمة بين اسم المهمة ونوع أداة التتبع.',
                    date: '2026-09-08T09:06:52+03:00'
                },
                {
                    id: 'site-2026-09-08-task-builder-edit',
                    text: 'حذف نوع الأيام المخصصة للمهمة، جعل المهام الجديدة فارغة، وإضافة تعديل وحذف المهام مع اختيار أيام التحدي.',
                    date: '2026-09-08T09:03:44+03:00'
                },
                {
                    id: 'site-2026-09-08-reward-modal-flash',
                    text: 'إصلاح ظهور نافذة الجائزة والنصوص الخام عند فتح الموقع قبل اكتمال تحميل Vue.',
                    date: '2026-09-08T08:55:10+03:00'
                },
                {
                    id: 'site-2026-09-08-linked-challenges',
                    text: 'إضافة ربط التحديات: إنشاء تحدٍ مستقل أو مرتبط، عرض مهامه داخل التحدي الأساسي، واحتساب تقدمه بشكل فردي ومشترك.',
                    date: '2026-09-08T08:52:09+03:00'
                },
                {
                    id: 'site-2026-09-08-challenge-image',
                    text: 'إضافة صورة اختيارية للتحدي مع معاينتها وحفظها وعرضها أعلى لوحة التحدي.',
                    date: '2026-09-08T08:44:58+03:00'
                },
                {
                    id: 'site-2026-09-08-yes-no-tool',
                    text: 'إضافة أداة تتبع نعم / لا مع كتابة الملاحظات وزر حفظ بجانبها.',
                    date: '2026-09-08T08:39:28+03:00'
                },
                {
                    id: 'site-2026-09-08-settings-log',
                    text: 'إضافة سجل مستقل لتحديثات الموقع مع التاريخ والوقت، وفصلها عن سجل تغييرات التحدي.',
                    date: '2026-09-08T08:34:15+03:00'
                },
                {
                    id: 'site-2026-09-08-remove-status-badges',
                    text: 'حذف شارات المزامنة والتذكير واليوم النشط من لوحة التحدي.',
                    date: '2026-09-08T08:20:00+03:00'
                }
            ],
            syncStatus: 'synced', // 'synced', 'syncing', 'offline'
            currentUserId: null,
            activeChallengeId: null,
            challengeCatalog: [],
            editingChallengeId: null,
            siteUpdatesOpen: false,
            nameEditing: true,
            nameSaveFeedback: false,
            unsubscribeFirestore: null,
            textInputs: {},
            yesNoInputs: {},
            linkedTextInputs: {},
            dailyTaskTitle: '',
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
                image: '',
                color: '#0f172a',
                connectionMode: 'separate',
                linkedToChallengeId: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                selectedDays: [0, 1, 2, 3, 4, 5, 6],
                reward: ''
            },
            simulatedToday: new Date().toISOString().split('T')[0],
            newTask: {
                title: '',
                type: 'checkbox', // 'checkbox', 'text', 'yesno'
                taskDays: [0, 1, 2, 3, 4],
                isMandatory: false
            },
            editingTaskId: null,
            challenge: {
                id: null,
                isCreated: false,
                title: '',
                description: '',
                image: '',
                color: '#0f172a',
                linkedToChallengeId: null,
                startDate: '',
                endDate: '',
                selectedDays: [],
                reward: '',
                tasks: [],
                dailyTasks: {},
                logs: {},
                notes: '',
                updates: [],
                notificationSettings: {
                    enabled: false,
                    time: '20:00'
                },
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
            return hour < 12 ? 'نهارك جميل' : 'نهارك جميل';
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

            this.linkedChallenges.forEach(linkedChallenge => {
                const totals = this.getChallengeTaskTotals(linkedChallenge);
                totalPossibleCheckmarks += totals.total;
                completedCheckmarks += totals.completed;
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

            this.linkedChallenges.forEach(linkedChallenge => {
                const totals = this.getChallengeTaskTotals(linkedChallenge);
                completedCount += totals.completed;
                pendingCount += totals.total - totals.completed;
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
        },
        availableChallenges() {
            return this.challengeCatalog.filter(item => item.isCreated && item.id !== this.challenge.id);
        },
        linkedChallenges() {
            return this.challengeCatalog.filter(item => item.isCreated && item.linkedToChallengeId === this.challenge.id);
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
            this.notificationTimer = window.setInterval(this.checkNotificationSchedule, 30000);
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
                        this.userEmail = user.email || '';
                        if (this.challenge.userProfile) {
                            this.challenge.userProfile.name = this.userName || 'المستخدم النشط';
                        }
                        this.currentStep = this.challenge.isCreated ? 'dashboard' : 'setup';
                        this.listenToFirestoreChallenge();
                    } else {
                        this.currentUserId = null;
                        this.userName = '';
                        this.userEmail = '';
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
                this.nameEditing = false;
                this.nameSaveFeedback = true;
                return;
            }

            try {
                await updateProfile(auth.currentUser, { displayName: trimmedName });
                this.userName = trimmedName;
                if (this.challenge.userProfile) {
                    this.challenge.userProfile.name = trimmedName;
                }
                this.recordUpdate('تم تعديل اسم العرض');
                await this.saveToFirestore();
                this.nameEditing = false;
                this.nameSaveFeedback = true;
            } catch (error) {
                console.error('Error updating user display name:', error);
                alert('تعذر تحديث اسم المستخدم في الحساب، حاول مرة أخرى.');
                this.userName = auth.currentUser.displayName || this.challenge.userProfile?.name || '';
            }
        },
        handleNameAction() {
            if (this.nameEditing) {
                this.syncUserNameToAccount();
                return;
            }
            this.nameEditing = true;
            this.nameSaveFeedback = false;
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
                    if (Array.isArray(data.challengeCatalog) && data.challengeCatalog.length > 0) {
                        this.challengeCatalog = data.challengeCatalog;
                        this.activeChallengeId = data.activeChallengeId || this.challengeCatalog[0].id;
                        const activeChallenge = this.challengeCatalog.find(item => item.id === this.activeChallengeId)
                            || this.challengeCatalog[0];
                        if (activeChallenge) {
                            this.activeChallengeId = activeChallenge.id;
                            this.challenge = Object.assign({}, this.challenge, activeChallenge);
                        }
                    } else {
                        this.challenge = Object.assign({}, this.challenge, data);
                        if (this.challenge.isCreated) {
                            this.challenge.id = this.challenge.id || `challenge-${Date.now()}`;
                            this.activeChallengeId = this.challenge.id;
                            this.challengeCatalog = [JSON.parse(JSON.stringify(this.challenge))];
                        }
                    }
                    if (!auth.currentUser?.displayName && data.userProfile?.name) {
                        this.userName = data.userProfile.name;
                    }
                    if (data.simulatedToday) {
                        this.simulatedToday = data.simulatedToday;
                    }
                    if (data.notificationSettings) {
                        this.notificationTime = data.notificationSettings.time || '20:00';
                        this.notificationsEnabled = !!data.notificationSettings.enabled;
                    }
                    if (this.challenge.isCreated) {
                        this.syncTodayWithCalendar();
                        if (!this.editingChallengeId && this.currentStep === 'setup') {
                            this.currentStep = 'dashboard';
                        }
                    }
                    this.challengeLoadComplete = true;
                    this.syncStatus = 'synced';
                }
                else {
                    this.challengeLoadComplete = true;
                }
            }, (error) => {
                console.error("Firestore listener error:", error);
                this.challengeLoadComplete = true;
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
                this.syncActiveChallengeToCatalog();
                dataToSave.challengeCatalog = JSON.parse(JSON.stringify(this.challengeCatalog));
                dataToSave.activeChallengeId = this.activeChallengeId;
                dataToSave.simulatedToday = this.simulatedToday;
                dataToSave.notificationSettings = {
                    enabled: this.notificationsEnabled,
                    time: this.notificationTime
                };

                await setDoc(challengeDocRef, dataToSave, { merge: true });
                this.syncStatus = 'synced';
                return true;
            } catch (e) {
                console.error("Error saving to Firestore:", e);
                this.syncStatus = 'offline';
                return false;
            }
        },
        syncActiveChallengeToCatalog() {
            if (!this.challenge.isCreated) return;
            if (!this.challenge.id) this.challenge.id = `challenge-${Date.now()}`;
            this.activeChallengeId = this.challenge.id;
            const currentChallenge = JSON.parse(JSON.stringify(this.challenge));
            this.syncChallengeToCatalog(currentChallenge);
        },
        syncChallengeToCatalog(targetChallenge) {
            const index = this.challengeCatalog.findIndex(item => item.id === targetChallenge.id);
            if (index === -1) {
                this.challengeCatalog.push(JSON.parse(JSON.stringify(targetChallenge)));
            } else {
                this.challengeCatalog[index] = JSON.parse(JSON.stringify(targetChallenge));
            }
        },
        recordUpdate(text) {
            if (!Array.isArray(this.challenge.updates)) this.challenge.updates = [];
            this.challenge.updates.unshift({
                id: Date.now(),
                text,
                date: new Date().toISOString()
            });
            this.challenge.updates = this.challenge.updates.slice(0, 50);
        },
        formatUpdateDate(date) {
            return new Date(date).toLocaleString('ar-EG', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
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
            this.recordUpdate(this.notificationsEnabled ? `تم تفعيل الإشعارات لوقت ${this.notificationTime}` : 'تم إيقاف الإشعارات');
            this.saveToFirestore();
        },
        saveNotificationTime() {
            this.recordUpdate(`تم تغيير وقت الإشعار إلى ${this.notificationTime}`);
            this.saveToFirestore();
        },
        checkNotificationSchedule() {
            if (!this.notificationsEnabled || !this.notificationTime || !this.challenge.isCreated) return;
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const currentTime = now.toTimeString().slice(0, 5);
            const storageKey = `habit-notification-${this.currentUserId}-${today}`;
            if (currentTime === this.notificationTime && !sessionStorage.getItem(storageKey)) {
                sessionStorage.setItem(storageKey, 'sent');
                this.sendTaskReminderNotification();
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
        handleChallengeImageUpload(event) {
            const file = event.target.files?.[0];
            if (!file || !file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = () => {
                const image = new Image();
                image.onload = () => {
                    const maxSize = 1200;
                    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(image.width * scale);
                    canvas.height = Math.round(image.height * scale);
                    const context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    this.form.image = canvas.toDataURL('image/jpeg', 0.82);
                };
                image.src = reader.result;
            };
            reader.readAsDataURL(file);
        },
        getTaskDaysFormatted(taskDays) {
            if (!taskDays || taskDays.length === 0) return '';
            return taskDays.map(id => {
                const d = this.weekDays.find(w => w.id === id);
                return d ? d.short : '';
            }).join(' • ');
        },
        getDailyTasks(dateStr) {
            return this.challenge.dailyTasks?.[dateStr] || [];
        },
        addDailyTask() {
            const title = (this.dailyTaskTitle || '').trim();
            if (!title) return;
            if (!this.challenge.dailyTasks) this.challenge.dailyTasks = {};
            if (!this.challenge.dailyTasks[this.simulatedToday]) {
                this.challenge.dailyTasks[this.simulatedToday] = [];
            }
            this.challenge.dailyTasks[this.simulatedToday].push({
                id: `daily-${Date.now()}`,
                title,
                completed: false
            });
            this.dailyTaskTitle = '';
            this.saveToFirestore();
        },
        toggleDailyTask(taskId) {
            const task = this.getDailyTasks(this.simulatedToday).find(item => item.id === taskId);
            if (!task) return;
            task.completed = !task.completed;
            this.saveToFirestore();
        },
        removeDailyTask(taskId) {
            const tasks = this.getDailyTasks(this.simulatedToday);
            const index = tasks.findIndex(item => item.id === taskId);
            if (index === -1) return;
            tasks.splice(index, 1);
            this.saveToFirestore();
        },
        resetChallengeForm() {
            this.form = {
                title: '',
                description: '',
                image: '',
                color: '#0f172a',
                connectionMode: 'separate',
                linkedToChallengeId: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                selectedDays: [0, 1, 2, 3, 4, 5, 6],
                reward: ''
            };
        },
        createChallengeRecord() {
            const linkedToChallengeId = this.form.connectionMode === 'linked'
                ? this.form.linkedToChallengeId || null
                : null;
            return {
                id: `challenge-${Date.now()}`,
                isCreated: true,
                title: this.form.title,
                description: this.form.description,
                image: this.form.image,
                color: this.form.color,
                linkedToChallengeId,
                startDate: this.form.startDate,
                endDate: this.form.endDate,
                selectedDays: [...this.form.selectedDays],
                reward: this.form.reward,
                tasks: [],
                dailyTasks: {},
                logs: {},
                notes: '',
                updates: [],
                notificationSettings: {
                    enabled: false,
                    time: '20:00'
                },
                simulatedToday: this.getFirstActiveDate(this.form.startDate, this.form.selectedDays),
                userProfile: {
                    name: this.userName || 'المستخدم النشط',
                    email: auth.currentUser?.email || 'user@challenges.com'
                }
            };
        },
        proceedToTaskBuilder() {
            if (this.editingChallengeId) {
                const updatedChallenge = Object.assign({}, this.challenge, {
                    title: this.form.title,
                    description: this.form.description,
                    image: this.form.image,
                    color: this.form.color,
                    linkedToChallengeId: this.form.connectionMode === 'linked' ? this.form.linkedToChallengeId || null : null,
                    startDate: this.form.startDate,
                    endDate: this.form.endDate,
                    selectedDays: [...this.form.selectedDays],
                    reward: this.form.reward
                });
                this.challenge = updatedChallenge;
                this.simulatedToday = this.getFirstActiveDate(updatedChallenge.startDate, updatedChallenge.selectedDays);
                this.syncActiveChallengeToCatalog();
                this.recordUpdate('تم تعديل بيانات التحدي');
                this.saveToFirestore();
                this.editingChallengeId = null;
                this.currentStep = 'builder';
                return;
            }

            this.syncActiveChallengeToCatalog();
            this.challenge = this.createChallengeRecord();
            this.activeChallengeId = this.challenge.id;
            this.challengeCatalog.push(JSON.parse(JSON.stringify(this.challenge)));
            this.newTask.taskDays = [...this.challenge.selectedDays];
            this.recordUpdate(this.challenge.linkedToChallengeId ? 'تم إنشاء تحدي جديد وربطه بتحدٍ آخر' : 'تم إنشاء تحدي جديد');
            this.simulatedToday = this.challenge.simulatedToday;
            this.saveToFirestore();
            this.currentStep = 'builder';
        },
        async finishTaskBuilderAndGoToDashboard() {
            this.simulatedToday = this.getFirstActiveDate(this.challenge.startDate, this.challenge.selectedDays);
            const saved = await this.saveToFirestore();
            if (saved !== false) this.currentStep = 'dashboard';
        },
        addNewTask() {
            if (!this.newTask.title.trim()) return;

            const taskData = {
                title: this.newTask.title.trim(),
                type: this.newTask.type === 'days' ? 'checkbox' : this.newTask.type,
                taskDays: [...this.newTask.taskDays],
                isMandatory: this.newTask.isMandatory
            };
            if (this.editingTaskId) {
                const task = this.challenge.tasks.find(item => item.id === this.editingTaskId);
                if (task) Object.assign(task, taskData);
                this.recordUpdate(`تم تعديل المهمة: ${taskData.title}`);
            } else {
                this.challenge.tasks.push({ id: Date.now(), ...taskData });
                this.recordUpdate(`تمت إضافة المهمة: ${taskData.title}`);
            }

            this.cancelTaskEdit();
            this.saveToFirestore();
        },
        editTask(task) {
            this.editingTaskId = task.id;
            this.newTask.title = task.title;
            this.newTask.type = task.type === 'days' ? 'checkbox' : task.type;
            this.newTask.taskDays = task.taskDays?.length ? [...task.taskDays] : [...this.challenge.selectedDays];
            this.newTask.isMandatory = !!task.isMandatory;
        },
        cancelTaskEdit() {
            this.editingTaskId = null;
            this.newTask.title = '';
            this.newTask.type = 'checkbox';
            this.newTask.taskDays = [0, 1, 2, 3, 4];
            this.newTask.isMandatory = false;
        },
        removeTask(taskId) {
            const removedTask = this.challenge.tasks.find(task => task.id === taskId);
            this.challenge.tasks = this.challenge.tasks.filter(t => t.id !== taskId);
            this.recordUpdate(`تم حذف المهمة: ${removedTask?.title || 'مهمة'}`);
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

            if (Array.isArray(task.taskDays) && task.taskDays.length > 0) {
                return task.taskDays.includes(dayOfWeek);
            }
            if (task.type === 'days') {
                return task.taskDays && task.taskDays.includes(dayOfWeek);
            }
            return true;
        },
        getLinkedTrackingDate(targetChallenge) {
            const today = new Date().toISOString().split('T')[0];
            if (!targetChallenge.startDate || !targetChallenge.endDate) return today;
            if (today < targetChallenge.startDate) {
                return this.getFirstActiveDate(targetChallenge.startDate, targetChallenge.selectedDays);
            }
            return today > targetChallenge.endDate ? targetChallenge.endDate : today;
        },
        isTaskApplicableForChallenge(task, targetChallenge, dateStr) {
            const date = new Date(dateStr);
            if (!targetChallenge.selectedDays?.includes(date.getDay())) return false;
            if (Array.isArray(task.taskDays) && task.taskDays.length > 0) {
                return task.taskDays.includes(date.getDay());
            }
            if (task.type === 'days') return task.taskDays?.includes(date.getDay());
            return true;
        },
        getLinkedTaskLog(targetChallenge, dateStr, taskId) {
            return targetChallenge.logs?.[dateStr]?.[taskId];
        },
        isLinkedTaskCompleted(targetChallenge, dateStr, task) {
            const log = this.getLinkedTaskLog(targetChallenge, dateStr, task.id);
            if (!log) return false;
            if (task.type === 'checkbox' || task.type === 'days') return !!log;
            if (task.type === 'yesno') {
                return typeof log === 'object' && (log.answer === true || log.answer === false);
            }
            if (Array.isArray(log)) return log.length > 0;
            return typeof log === 'string' && log.trim().length > 0;
        },
        getChallengeTaskTotals(targetChallenge) {
            if (!targetChallenge.startDate || !targetChallenge.endDate) return { total: 0, completed: 0 };
            let total = 0;
            let completed = 0;
            const date = new Date(targetChallenge.startDate);
            const end = new Date(targetChallenge.endDate);
            while (date <= end) {
                const dateStr = date.toISOString().split('T')[0];
                targetChallenge.tasks.forEach(task => {
                    if (this.isTaskApplicableForChallenge(task, targetChallenge, dateStr)) {
                        total++;
                        if (this.isLinkedTaskCompleted(targetChallenge, dateStr, task)) completed++;
                    }
                });
                date.setDate(date.getDate() + 1);
            }
            return { total, completed };
        },
        getLinkedChallengeProgress(targetChallenge) {
            const totals = this.getChallengeTaskTotals(targetChallenge);
            return totals.total ? Math.round((totals.completed / totals.total) * 100) : 0;
        },
        saveLinkedChallenge(targetChallenge) {
            this.syncChallengeToCatalog(targetChallenge);
            this.saveToFirestore();
        },
        toggleLinkedTaskLog(challengeId, dateStr, taskId) {
            const targetChallenge = this.challengeCatalog.find(item => item.id === challengeId);
            const task = targetChallenge?.tasks.find(item => item.id === taskId);
            if (!targetChallenge || !task || (task.type !== 'checkbox' && task.type !== 'days')) return;
            if (!targetChallenge.logs) targetChallenge.logs = {};
            if (!targetChallenge.logs[dateStr]) targetChallenge.logs[dateStr] = {};
            targetChallenge.logs[dateStr][taskId] = !targetChallenge.logs[dateStr][taskId];
            this.saveLinkedChallenge(targetChallenge);
        },
        setLinkedYesNoAnswer(challengeId, dateStr, taskId, answer) {
            const targetChallenge = this.challengeCatalog.find(item => item.id === challengeId);
            if (!targetChallenge) return;
            if (!targetChallenge.logs) targetChallenge.logs = {};
            if (!targetChallenge.logs[dateStr]) targetChallenge.logs[dateStr] = {};
            const currentLog = this.getLinkedTaskLog(targetChallenge, dateStr, taskId);
            targetChallenge.logs[dateStr][taskId] = {
                ...(currentLog && typeof currentLog === 'object' ? currentLog : {}),
                answer
            };
            this.saveLinkedChallenge(targetChallenge);
        },
        saveLinkedTextLogEntry(challengeId, dateStr, taskId) {
            const noteKey = this.getLinkedTextInputKey(challengeId, taskId);
            const text = (this.linkedTextInputs[noteKey] || '').trim();
            if (!text) return;
            const targetChallenge = this.challengeCatalog.find(item => item.id === challengeId);
            if (!targetChallenge) return;
            if (!targetChallenge.logs) targetChallenge.logs = {};
            if (!targetChallenge.logs[dateStr]) targetChallenge.logs[dateStr] = {};
            const oldValue = targetChallenge.logs[dateStr][taskId];
            const entries = Array.isArray(oldValue) ? oldValue : (oldValue ? [oldValue] : []);
            targetChallenge.logs[dateStr][taskId] = [...entries, text];
            this.linkedTextInputs[noteKey] = '';
            this.saveLinkedChallenge(targetChallenge);
        },
        getLinkedTextInputKey(challengeId, taskId) {
            return `${challengeId}-${taskId}`;
        },
        toggleTaskLog(dateStr, taskId) {
            if (!this.challenge.logs) this.challenge.logs = {};
            if (!this.challenge.logs[dateStr]) this.challenge.logs[dateStr] = {};

            this.challenge.logs[dateStr][taskId] = !this.challenge.logs[dateStr][taskId];
            const task = this.challenge.tasks.find(item => item.id === taskId);
            this.recordUpdate(`${this.challenge.logs[dateStr][taskId] ? 'تم إنجاز' : 'تم إلغاء إنجاز'} المهمة: ${task?.title || 'مهمة'}`);
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
        getYesNoLog(dateStr, taskId) {
            const log = this.challenge.logs?.[dateStr]?.[taskId];
            return log && typeof log === 'object' && !Array.isArray(log) ? log : null;
        },
        getYesNoNote(dateStr, taskId) {
            return this.getYesNoLog(dateStr, taskId)?.note || '';
        },
        setYesNoAnswer(dateStr, taskId, answer) {
            if (!this.challenge.logs) this.challenge.logs = {};
            if (!this.challenge.logs[dateStr]) this.challenge.logs[dateStr] = {};
            const currentLog = this.getYesNoLog(dateStr, taskId) || {};
            this.challenge.logs[dateStr][taskId] = { ...currentLog, answer };
            const task = this.challenge.tasks.find(item => item.id === taskId);
            this.recordUpdate(`تم اختيار ${answer ? 'نعم' : 'لا'} للمهمة: ${task?.title || 'مهمة'}`);
            this.saveToFirestore();
        },
        saveYesNoNote(dateStr, taskId) {
            const note = (this.yesNoInputs[taskId] || '').trim();
            if (!note) return;
            if (!this.challenge.logs) this.challenge.logs = {};
            if (!this.challenge.logs[dateStr]) this.challenge.logs[dateStr] = {};
            const currentLog = this.getYesNoLog(dateStr, taskId) || {};
            this.challenge.logs[dateStr][taskId] = { ...currentLog, note };
            this.recordUpdate('تم حفظ ملاحظة أداة نعم / لا');
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
            } else if (task.type === 'yesno') {
                return typeof log === 'object' && (log.answer === true || log.answer === false);
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
                    break;
                }
            }
        },
        restartChallengeFromBeginning() {
            this.challenge.logs = {};
            this.simulatedToday = this.getFirstActiveDate(this.challenge.startDate, this.challenge.selectedDays);
            this.recordUpdate('تمت إعادة التحدي إلى البداية');
            this.saveToFirestore();
        },
        syncTodayWithCalendar() {
            if (!this.challenge.startDate || !this.challenge.endDate) return;
            const today = new Date().toISOString().split('T')[0];
            this.simulatedToday = today < this.challenge.startDate
                ? this.getFirstActiveDate(this.challenge.startDate, this.challenge.selectedDays)
                : (today > this.challenge.endDate ? this.challenge.endDate : today);
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
        editCurrentChallengeSetup() {
            this.form = {
                title: this.challenge.title || '',
                description: this.challenge.description || '',
                image: this.challenge.image || '',
                color: this.challenge.color || '#0f172a',
                connectionMode: this.challenge.linkedToChallengeId ? 'linked' : 'separate',
                linkedToChallengeId: this.challenge.linkedToChallengeId || '',
                startDate: this.challenge.startDate,
                endDate: this.challenge.endDate,
                selectedDays: [...this.challenge.selectedDays],
                reward: this.challenge.reward || ''
            };
            this.editingChallengeId = this.challenge.id;
            this.currentStep = 'setup';
        },
        editChallenge(challengeId) {
            const targetChallenge = this.challengeCatalog.find(item => item.id === challengeId);
            if (!targetChallenge) return;
            this.challenge = JSON.parse(JSON.stringify(targetChallenge));
            this.activeChallengeId = challengeId;
            this.editCurrentChallengeSetup();
        },
        switchChallenge(challengeId) {
            const targetChallenge = this.challengeCatalog.find(item => item.id === challengeId);
            if (!targetChallenge) return;
            this.syncActiveChallengeToCatalog();
            this.activeChallengeId = challengeId;
            this.challenge = JSON.parse(JSON.stringify(targetChallenge));
            this.syncTodayWithCalendar();
            this.notificationTime = this.challenge.notificationSettings?.time || '20:00';
            this.notificationsEnabled = !!this.challenge.notificationSettings?.enabled;
            this.currentStep = 'dashboard';
            this.saveToFirestore();
        },
        startNewChallengeSetup() {
            this.resetChallengeForm();
            this.editingChallengeId = null;
            this.currentStep = 'setup';
        },
        resetProgressOnly() {
            this.challenge.logs = {};
            this.saveToFirestore();
            this.currentStep = 'dashboard';
        },
        async deleteChallenge(challengeId) {
            const deletedChallengeId = challengeId;
            if (!deletedChallengeId) return;
            const targetChallenge = this.challengeCatalog.find(item => item.id === deletedChallengeId);
            if (!targetChallenge) return;
            if (!window.confirm(`هل أنت متأكد من حذف تحدي "${targetChallenge.title}"؟ لا يمكن التراجع عن هذا الحذف.`)) return;

            this.challengeCatalog = this.challengeCatalog
                .filter(item => item.id !== deletedChallengeId)
                .map(item => item.linkedToChallengeId === deletedChallengeId
                    ? { ...item, linkedToChallengeId: null }
                    : item);

            if (this.challengeCatalog.length > 0) {
                const nextChallenge = this.challengeCatalog[0];
                this.activeChallengeId = nextChallenge.id;
                this.challenge = JSON.parse(JSON.stringify(nextChallenge));
                this.syncTodayWithCalendar();
                await this.saveToFirestore();
                this.currentStep = 'dashboard';
                return;
            }

            this.activeChallengeId = null;
            this.challenge = {
                id: null,
                isCreated: false,
                title: '',
                description: '',
                image: '',
                linkedToChallengeId: null,
                startDate: '',
                endDate: '',
                selectedDays: [],
                reward: '',
                tasks: [],
                dailyTasks: {},
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
        },
        async deleteCurrentChallenge() {
            await this.deleteChallenge(this.challenge.id);
        }
    }
}).mount('#app');
