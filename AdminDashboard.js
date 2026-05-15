// src/components/Admin/AdminDashboard.js

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from '../../firebase';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminDashboardContent from './AdminDashboardContent';

import CurriculumPlanPage from '../CurriculumPlan/CurriculumPlanPage';
import SchedulePage from './SchedulePage';

import {
  Users,
  GraduationCap,
  BriefcaseBusiness,
  FileText,
  BookOpen,
  Activity,
  Clock3,
  UserRound,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Camera,
  Save,
  X,
  Edit3,
  CalendarDays,
  CheckCircle2,
  FolderOpen,
  BarChart3,
  Award
} from 'lucide-react';

import './AdminDashboard.css';

const ADMIN_ID = 'admin_user';

const defaultAccess = {
  users: 'none',
  teachers: 'none',
  students: 'none',
  schedule: 'none',
  plans: 'none',
  programs: 'none',
  documents: 'none',

  reportsCurator: 'none',
  reportsDepartment: 'none',

  practices: 'none',
  achievements: 'none'
};

const formatActionDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString('ru-RU');
};

const normalizeText = (value = '') => String(value || '').trim().toLowerCase();

const normalizeComparableValue = (value) => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).trim();
};

const removeUndefinedFields = (obj = {}) => {
  const cleaned = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

const normalizePositionToRole = (position = '', currentRole = 'teacher') => {
  const value = normalizeText(position);

  if (value.includes('лаборант') || value.includes('laborant') || value.includes('lab')) {
    return 'lab';
  }

  if (value.includes('администратор') || value.includes('admin')) {
    return 'admin';
  }

  if (value.includes('преподаватель') || value.includes('teacher')) {
    return 'teacher';
  }

  return currentRole || 'teacher';
};

const normalizeUser = (id, data = {}) => {
  const entered =
    data.hasLoggedIn === true ||
    data.loginStatus === 'entered' ||
    Boolean(data.lastLoginAt || data.loginDate);

  const roleFromPosition =
    data.position && data.role !== 'student'
      ? normalizePositionToRole(data.position, data.role)
      : data.role;

  return {
    id,
    ...data,
    name: data.name || data.fullName || '',
    fullName: data.fullName || data.name || '',
    role: roleFromPosition || data.role || 'teacher',
    position: data.position || '',
    access: {
      ...defaultAccess,
      ...(data.access || {})
    },
    loginStatus: entered ? 'entered' : 'waiting',
    isRegistered: entered,
    hasLoggedIn: entered
  };
};

const firestoreSnapshotToArray = (snapshot) => {
  if (!snapshot || snapshot.empty) return [];

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() || {})
  }));
};

function RecentActionsModal({ t, actions, onClose }) {
  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal-window recent-actions-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-head">
          <div>
            <h3>{t.allActions || t.recentActions || 'Все действия'}</h3>
            <p>{t.recentActions || 'Последние действия'}</p>
          </div>

          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body actions-full-list">
          {actions.length === 0 ? (
            <div className="empty-actions">
              {t.noActions || 'Действий нет'}
            </div>
          ) : (
            actions.map((item, index) => (
              <div className="action-full-item" key={item.id || index}>
                <span className="action-icon">{item.icon || '•'}</span>
                <div>
                  <strong>{item.text || item.title || '-'}</strong>
                  <small>{formatActionDate(item.createdAt || item.date)}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const translations = {
  ru: {
    adminPanel: 'Административная панель',
    department: 'Кафедра информационных технологий',
    notifications: 'Уведомления',
    noNewNotifications: 'Новых нет',
    newNotifications: 'новых',
    allRead: 'Все прочитано',
    emptyNotifications: 'Уведомлений пока нет',
    notificationDefaultTitle: 'Уведомление',
    notificationDefaultText: 'Новое действие на портале',
    profile: 'Профиль',
    logout: 'Выйти',
    emailNotSet: 'email не указан',
    phoneNotSet: 'телефон не указан',
    adminDefault: 'Администратор',
    adminPanelShort: 'Админ панель',

    sidebarDashboard: 'Главная',
    sidebarUsers: 'Пользователи',
    sidebarTeachers: 'Преподаватели',
    sidebarStudents: 'Студенты',
    sidebarSchedule: 'Расписание',
    sidebarPlans: 'Нагрузка',
    sidebarPrograms: 'Рабочие программы',
    sidebarDocuments: 'Документы',
    sidebarReports: 'Отчеты',
    sidebarPractices: 'Практика',
    sidebarAchievements: 'Достижения',
    sidebarSettings: 'Настройки',

    sidebarLogoTitle: 'Кафедра информационных технологий',
    sidebarLogoSubtitle: 'Панель администратора',
    logoAlt: 'Кафедра информационных технологий',

    dashboardTitle: 'Главная панель',
    dashboardSubtitle: 'Обзор системы и ключевые показатели',
    totalUsers: 'Всего пользователей',
    students: 'Студентов',
    teachers: 'Преподавателей',
    disciplines: 'Дисциплин',
    plans: 'Нагрузка',
    programs: 'Рабочие программы',
    documents: 'Документы',
    reports: 'Отчеты',
    practices: 'Практика',
    achievements: 'Достижения',
    groups: 'Группы',
    portalActivity: 'Активность на портале',
    week: 'За неделю',
    month: 'За месяц',
    year: 'За год',
    recentActions: 'Последние действия',
    showAll: 'Смотреть все',
    quickActions: 'Быстрые действия',

    addTeacher: 'Добавить преподавателя',
    addStudent: 'Добавить студента',
    addProgram: 'Добавить программу',
    addDocument: 'Добавить документ',
    addReport: 'Добавить отчет',
    addPractice: 'Добавить практику',
    addAchievement: 'Добавить достижение',

    footer: 'Кафедра информационных технологий',
    version: 'Версия 1.0.0',
    loading: 'Загрузка...',
    registered: '✅ Зарегистрирован',
    pending: '⏳ Ожидает',
    active: 'Активная',
    inactive: 'Неактивная',
    activityEmpty: 'Активности пока нет. Когда вы добавите данные, график начнет работать.',
    actionsEmpty: 'Действий пока нет. Когда вы что-то добавите, измените или удалите, это появится здесь.',
    allActions: 'Все действия',
    noActions: 'Действий нет',

    profileTitle: 'Профиль администратора',
    fullNameLabel: 'Аты-жөнү',
    emailLabel: 'Email',
    phoneLabel: 'Телефон',
    positionLabel: 'Кызматы',
    departmentLabel: 'Кафедра',
    fioPlaceholder: 'ФИО',
    phonePlaceholder: 'Телефон',
    departmentPlaceholder: 'Кафедра',
    positionPlaceholder: 'Должность',
    bioPlaceholder: 'Краткая информация',
    save: 'Сохранить',
    cancel: 'Отмена',
    profileSaved: '✅ Профиль успешно обновлен!',
    profileError: '❌ Ошибка: ',

    newUserNotification: 'Новый пользователь',
    userAddedText: 'Добавлен',
    newProgramNotification: 'Новая программа',
    newDocumentNotification: 'Новый документ',
    newReportNotification: 'Новый отчет',
    newPracticeNotification: 'Новая практика',
    newAchievementNotification: 'Новое достижение',

    withoutName: 'Без названия',
    promptNewYear: 'Введите новый учебный год. Например: 2027-2028',

    deleteUserConfirm: 'Удалить пользователя?',
    deleteGroupConfirm: 'Удалить группу?',
    deleteProgramConfirm: 'Удалить программу?',
    deleteDocumentConfirm: 'Удалить документ?',
    deleteReportConfirm: 'Удалить отчет?',
    deletePracticeConfirm: 'Удалить практику?',
    deleteAchievementConfirm: 'Удалить достижение?',
    error: 'Ошибка: ',

    settingsTitle: 'Настройки портала',
    settingsSubtitle: 'Язык, тема',
    interfaceLanguage: 'Язык интерфейса',
    themeMode: 'Тема интерфейса',
    lightTheme: 'Светлая тема',
    darkTheme: 'Темная тема',
    academicYear: 'Учебный год',
    enabled: 'Включено',
    promoteStudents: 'Обновить учебный год',
    promoteConfirm: 'Обновить учебный год? 1 курс станет 2 курсом, 2 курс станет 3 курсом, 3 курс станет 4 курсом, а 4 курс перейдет в выпускники.',
    promoteSuccess: 'Учебный год успешно обновлен',
    noStudents: 'Студенты пока не добавлены',
    academicCalendar: 'Календарь',
    selectedDate: 'Выбранная дата',

    actionLanguageChanged: 'Язык изменен',
    actionDarkModeOn: 'Темная тема включена',
    actionLightModeOn: 'Светлая тема включена',
    actionProfileUpdated: 'Профиль администратора обновлен',
    actionUserAdded: 'Добавлен пользователь',
    actionUserUpdated: 'Изменен пользователь',
    actionUserDeleted: 'Удален пользователь',
    actionGroupAdded: 'Создана группа',
    actionGroupUpdated: 'Изменена группа',
    actionGroupDeleted: 'Удалена группа',
    actionProgramAdded: 'Добавлена учебная программа',
    actionProgramUpdated: 'Изменена учебная программа',
    actionProgramDeleted: 'Удалена учебная программа',
    actionDocumentAdded: 'Добавлен документ',
    actionDocumentUpdated: 'Изменен документ',
    actionDocumentDeleted: 'Удален документ',
    actionReportAdded: 'Добавлен отчет',
    actionReportUpdated: 'Изменен отчет',
    actionReportDeleted: 'Удален отчет и связанные ответы',
    actionPracticeAdded: 'Добавлена практика',
    actionPracticeUpdated: 'Изменена практика',
    actionPracticeDeleted: 'Удалена практика',
    actionAchievementAdded: 'Добавлено достижение',
    actionAchievementUpdated: 'Изменено достижение',
    actionAchievementDeleted: 'Удалено достижение',
    actionYearChanged: 'Учебный год изменен',
    actionYearAdded: 'Добавлен учебный год',

    notificationProgramForTeachers: 'Администратор отправил учебную программу',
    notificationDocumentForTeachers: 'Администратор отправил документ',
    notificationReportForTeachers: 'Администратор отправил отчет',
    notificationPracticeForTeachers: 'Администратор отправил практику',
    notificationAchievementForTeachers: 'Администратор отправил достижение',
    allTeachers: 'Все преподаватели'
  },

  kg: {
    adminPanel: 'Администратор панели',
    department: 'Маалыматтык технологиялар кафедрасы',
    notifications: 'Билдирүүлөр',
    noNewNotifications: 'Жаңы билдирүү жок',
    newNotifications: 'жаңы',
    allRead: 'Баарын окулду кылуу',
    emptyNotifications: 'Азырынча билдирүү жок',
    notificationDefaultTitle: 'Билдирүү',
    notificationDefaultText: 'Порталда жаңы аракет болду',
    profile: 'Профиль',
    logout: 'Чыгуу',
    emailNotSet: 'email көрсөтүлгөн эмес',
    phoneNotSet: 'телефон көрсөтүлгөн эмес',
    adminDefault: 'Администратор',
    adminPanelShort: 'Админ панель',

    sidebarDashboard: 'Башкы бет',
    sidebarUsers: 'Колдонуучулар',
    sidebarTeachers: 'Окутуучулар',
    sidebarStudents: 'Студенттер',
    sidebarSchedule: 'Расписание',
    sidebarPlans: 'Нагрузка',
    sidebarPrograms: 'Окуу программалары',
    sidebarDocuments: 'Документтер',
    sidebarReports: 'Отчеттор',
    sidebarPractices: 'Практика',
    sidebarAchievements: 'Жетишкендиктер',
    sidebarSettings: 'Жөндөөлөр',

    sidebarLogoTitle: 'Маалыматтык технологиялар кафедрасы',
    sidebarLogoSubtitle: 'Администратор панели',
    logoAlt: 'Кафедра порталы',

    dashboardTitle: 'Башкы панель',
    dashboardSubtitle: 'Системанын жалпы абалы жана негизги көрсөткүчтөр',
    totalUsers: 'Бардык колдонуучулар',
    students: 'Студенттер',
    teachers: 'Окутуучулар',
    disciplines: 'Дисциплиналар',
    plans: 'Нагрузка',
    programs: 'Окуу программалары',
    documents: 'Документтер',
    reports: 'Отчеттор',
    practices: 'Практика',
    achievements: 'Жетишкендиктер',
    groups: 'Группалар',
    portalActivity: 'Порталдагы активдүүлүк',
    week: 'Апта боюнча',
    month: 'Ай боюнча',
    year: 'Жыл боюнча',
    recentActions: 'Акыркы аракеттер',
    showAll: 'Баарын көрүү',
    quickActions: 'Тез аракеттер',

    addTeacher: 'Окутуучу кошуу',
    addStudent: 'Студент кошуу',
    addProgram: 'Программа кошуу',
    addDocument: 'Документ кошуу',
    addReport: 'Отчет кошуу',
    addPractice: 'Практика кошуу',
    addAchievement: 'Жетишкендик кошуу',

    footer: 'Кафедра порталы',
    version: 'Версия 1.0.0',
    loading: 'Жүктөлүүдө...',
    registered: '✅ Катталган',
    pending: '⏳ Күтүүдө',
    active: 'Активдүү',
    inactive: 'Активдүү эмес',
    activityEmpty: 'Азырынча активдүүлүк жок. Маалымат кошкондо график иштей баштайт.',
    actionsEmpty: 'Азырынча аракеттер жок. Бир нерсе кошкондо, өзгөрткөндө же өчүргөндө бул жерге жазылат.',
    allActions: 'Бардык аракеттер',
    noActions: 'Аракеттер жок',

    profileTitle: 'Администратордун профили',
    fullNameLabel: 'Аты-жөнү',
    emailLabel: 'Email',
    phoneLabel: 'Телефон',
    positionLabel: 'Кызматы',
    departmentLabel: 'Кафедра',
    fioPlaceholder: 'Аты-жөнү',
    phonePlaceholder: 'Телефон',
    departmentPlaceholder: 'Кафедра',
    positionPlaceholder: 'Кызматы',
    bioPlaceholder: 'Кыскача маалымат',
    save: 'Сактоо',
    cancel: 'Жокко чыгаруу',
    profileSaved: '✅ Профиль ийгиликтүү жаңыртылды!',
    profileError: '❌ Ката кетти: ',

    newUserNotification: 'Жаңы колдонуучу',
    userAddedText: 'Кошулду',
    newProgramNotification: 'Жаңы программа',
    newDocumentNotification: 'Жаңы документ',
    newReportNotification: 'Жаңы отчет',
    newPracticeNotification: 'Жаңы практика',
    newAchievementNotification: 'Жаңы жетишкендик',

    withoutName: 'Аты жок',
    promptNewYear: 'Жаңы окуу жылын жазыңыз. Мисалы: 2027-2028',

    deleteUserConfirm: 'Колдонуучуну өчүрөсүзбү?',
    deleteGroupConfirm: 'Группаны өчүрөсүзбү?',
    deleteProgramConfirm: 'Окуу программасын өчүрөсүзбү?',
    deleteDocumentConfirm: 'Документти өчүрөсүзбү?',
    deleteReportConfirm: 'Отчетту өчүрөсүзбү?',
    deletePracticeConfirm: 'Практиканы өчүрөсүзбү?',
    deleteAchievementConfirm: 'Жетишкендикти өчүрөсүзбү?',
    error: 'Ката: ',

    settingsTitle: 'Порталдын жөндөөлөрү',
    settingsSubtitle: 'Тил, тема',
    interfaceLanguage: 'Интерфейс тили',
    themeMode: 'Интерфейс темасы',
    lightTheme: 'Жарык тема',
    darkTheme: 'Караңгы тема',
    academicYear: 'Окуу жылы',
    enabled: 'Иштеп турат',
    promoteStudents: 'Окуу жылын жаңыртуу',
    promoteConfirm: 'Окуу жылын жаңыртасызбы? 1-курс 2-курс болот, 2-курс 3-курс болот, 3-курс 4-курс болот, 4-курс бүтүрүүчүлөргө өтөт.',
    promoteSuccess: 'Окуу жылы ийгиликтүү жаңыртылды',
    noStudents: 'Студенттер азырынча кошула элек',
    academicCalendar: 'Календарь',
    selectedDate: 'Тандалган дата',

    actionLanguageChanged: 'Тил өзгөртүлдү',
    actionDarkModeOn: 'Караңгы тема күйдү',
    actionLightModeOn: 'Жарык тема күйдү',
    actionProfileUpdated: 'Администратордун профили жаңыртылды',
    actionUserAdded: 'Колдонуучу кошулду',
    actionUserUpdated: 'Колдонуучу өзгөртүлдү',
    actionUserDeleted: 'Колдонуучу өчүрүлдү',
    actionGroupAdded: 'Группа түзүлдү',
    actionGroupUpdated: 'Группа өзгөртүлдү',
    actionGroupDeleted: 'Группа өчүрүлдү',
    actionProgramAdded: 'Окуу программасы кошулду',
    actionProgramUpdated: 'Окуу программасы өзгөртүлдү',
    actionProgramDeleted: 'Окуу программасы өчүрүлдү',
    actionDocumentAdded: 'Документ кошулду',
    actionDocumentUpdated: 'Документ өзгөртүлдү',
    actionDocumentDeleted: 'Документ өчүрүлдү',
    actionReportAdded: 'Отчет кошулду',
    actionReportUpdated: 'Отчет өзгөртүлдү',
    actionReportDeleted: 'Отчет жана ага байланышкан жооптор өчүрүлдү',
    actionPracticeAdded: 'Практика кошулду',
    actionPracticeUpdated: 'Практика өзгөртүлдү',
    actionPracticeDeleted: 'Практика өчүрүлдү',
    actionAchievementAdded: 'Жетишкендик кошулду',
    actionAchievementUpdated: 'Жетишкендик өзгөртүлдү',
    actionAchievementDeleted: 'Жетишкендик өчүрүлдү',
    actionYearChanged: 'Окуу жылы өзгөртүлдү',
    actionYearAdded: 'Жаңы окуу жылы кошулду',

    notificationProgramForTeachers: 'Администратор окуу программасын жиберди',
    notificationDocumentForTeachers: 'Администратор документ жиберди',
    notificationReportForTeachers: 'Администратор отчет жиберди',
    notificationPracticeForTeachers: 'Администратор практика жиберди',
    notificationAchievementForTeachers: 'Администратор жетишкендик жиберди',
    allTeachers: 'Бардык окутуучулар'
  },

  en: {
    adminPanel: 'Admin Panel',
    department: 'Department of Information Technologies',
    notifications: 'Notifications',
    noNewNotifications: 'No new notifications',
    newNotifications: 'new',
    allRead: 'Mark all as read',
    emptyNotifications: 'No notifications yet',
    notificationDefaultTitle: 'Notification',
    notificationDefaultText: 'New activity on the portal',
    profile: 'Profile',
    logout: 'Logout',
    emailNotSet: 'email not specified',
    phoneNotSet: 'phone not specified',
    adminDefault: 'Administrator',
    adminPanelShort: 'Admin panel',

    sidebarDashboard: 'Dashboard',
    sidebarUsers: 'Users',
    sidebarTeachers: 'Teachers',
    sidebarStudents: 'Students',
    sidebarSchedule: 'Schedule',
    sidebarPlans: 'Workload',
    sidebarPrograms: 'Work programs',
    sidebarDocuments: 'Documents',
    sidebarReports: 'Reports',
    sidebarPractices: 'Practice',
    sidebarAchievements: 'Achievements',
    sidebarSettings: 'Settings',

    sidebarLogoTitle: 'Department of Information Technologies',
    sidebarLogoSubtitle: 'Administrator panel',
    logoAlt: 'Department portal',

    dashboardTitle: 'Dashboard',
    dashboardSubtitle: 'System overview and key indicators',
    totalUsers: 'Total users',
    students: 'Students',
    teachers: 'Teachers',
    disciplines: 'Disciplines',
    plans: 'Workload',
    programs: 'Work programs',
    documents: 'Documents',
    reports: 'Reports',
    practices: 'Practice',
    achievements: 'Achievements',
    groups: 'Groups',
    portalActivity: 'Portal activity',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    recentActions: 'Recent actions',
    showAll: 'Show all',
    quickActions: 'Quick actions',

    addTeacher: 'Add teacher',
    addStudent: 'Add student',
    addProgram: 'Add program',
    addDocument: 'Add document',
    addReport: 'Add report',
    addPractice: 'Add practice',
    addAchievement: 'Add achievement',

    footer: 'Department portal',
    version: 'Version 1.0.0',
    loading: 'Loading...',
    registered: '✅ Registered',
    pending: '⏳ Pending',
    active: 'Active',
    inactive: 'Inactive',
    activityEmpty: 'No activity yet. When you add data, the chart will start working.',
    actionsEmpty: 'No actions yet. When you add, edit or delete something, it will appear here.',
    allActions: 'All actions',
    noActions: 'No actions',

    profileTitle: 'Administrator profile',
    fullNameLabel: 'Full name',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    positionLabel: 'Position',
    departmentLabel: 'Department',
    fioPlaceholder: 'Full name',
    phonePlaceholder: 'Phone',
    departmentPlaceholder: 'Department',
    positionPlaceholder: 'Position',
    bioPlaceholder: 'Brief information',
    save: 'Save',
    cancel: 'Cancel',
    profileSaved: '✅ Profile updated successfully!',
    profileError: '❌ Error: ',

    newUserNotification: 'New user',
    userAddedText: 'Added',
    newProgramNotification: 'New program',
    newDocumentNotification: 'New document',
    newReportNotification: 'New report',
    newPracticeNotification: 'New practice',
    newAchievementNotification: 'New achievement',

    withoutName: 'Untitled',
    promptNewYear: 'Enter a new academic year. Example: 2027-2028',

    deleteUserConfirm: 'Delete user?',
    deleteGroupConfirm: 'Delete group?',
    deleteProgramConfirm: 'Delete program?',
    deleteDocumentConfirm: 'Delete document?',
    deleteReportConfirm: 'Delete report?',
    deletePracticeConfirm: 'Delete practice?',
    deleteAchievementConfirm: 'Delete achievement?',
    error: 'Error: ',

    settingsTitle: 'Portal settings',
    settingsSubtitle: 'Language, theme',
    interfaceLanguage: 'Interface language',
    themeMode: 'Interface theme',
    lightTheme: 'Light theme',
    darkTheme: 'Dark theme',
    academicYear: 'Academic year',
    enabled: 'Enabled',
    promoteStudents: 'Promote academic year',
    promoteConfirm: 'Promote students to the next academic year? 1st year becomes 2nd, 2nd becomes 3rd, 3rd becomes 4th, and 4th becomes graduates.',
    promoteSuccess: 'Academic year updated successfully',
    noStudents: 'No students added yet',
    academicCalendar: 'Calendar',
    selectedDate: 'Selected date',

    actionLanguageChanged: 'Language changed',
    actionDarkModeOn: 'Dark theme enabled',
    actionLightModeOn: 'Light theme enabled',
    actionProfileUpdated: 'Administrator profile updated',
    actionUserAdded: 'User added',
    actionUserUpdated: 'User updated',
    actionUserDeleted: 'User deleted',
    actionGroupAdded: 'Group created',
    actionGroupUpdated: 'Group updated',
    actionGroupDeleted: 'Group deleted',
    actionProgramAdded: 'Work program added',
    actionProgramUpdated: 'Work program updated',
    actionProgramDeleted: 'Work program deleted',
    actionDocumentAdded: 'Document added',
    actionDocumentUpdated: 'Document updated',
    actionDocumentDeleted: 'Document deleted',
    actionReportAdded: 'Report added',
    actionReportUpdated: 'Report updated',
    actionReportDeleted: 'Report and related replies deleted',
    actionPracticeAdded: 'Practice added',
    actionPracticeUpdated: 'Practice updated',
    actionPracticeDeleted: 'Practice deleted',
    actionAchievementAdded: 'Achievement added',
    actionAchievementUpdated: 'Achievement updated',
    actionAchievementDeleted: 'Achievement deleted',
    actionYearChanged: 'Academic year changed',
    actionYearAdded: 'Academic year added',

    notificationProgramForTeachers: 'Administrator sent a work program',
    notificationDocumentForTeachers: 'Administrator sent a document',
    notificationReportForTeachers: 'Administrator sent a report',
    notificationPracticeForTeachers: 'Administrator sent a practice file',
    notificationAchievementForTeachers: 'Administrator sent an achievement',
    allTeachers: 'All teachers'
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const footerCalendarRef = useRef(null);

  const [showFooterCalendar, setShowFooterCalendar] = useState(false);
  const [footerSelectedDate, setFooterSelectedDate] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [language, setLanguage] = useState(() => localStorage.getItem('siteLanguage') || 'ru');
  const [currentYear, setCurrentYear] = useState(() => localStorage.getItem('academicYear') || '2025-2026');
  const [availableYears, setAvailableYears] = useState(['2024-2025', '2025-2026', '2026-2027']);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAllActionsModal, setShowAllActionsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [adminProfile, setAdminProfile] = useState({
    id: ADMIN_ID,
    name: 'Бейшеналиева Уулкан Усонбековна',
    fullName: 'Бейшеналиева Уулкан Усонбековна',
    email: 'diprabot2026@gmail.com',
    phone: '+996 700 123 456',
    position: 'Заведующий кафедрой информационных технологий',
    department: 'Кафедра информационных технологий',
    role: 'admin',
    avatar: '',
    bio: ''
  });

  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [plans, setPlans] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [reports, setReports] = useState([]);
  const [practices, setPractices] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [activityData, setActivityData] = useState({ week: [], month: [], year: [] });
  const [recentActions, setRecentActions] = useState([]);

  const t = translations[language] || translations.ru;

  const adminNotifications = useMemo(() => {
    return notifications
      .filter((item) => {
        const receiverRole = normalizeText(item.receiverRole || '');
        const receiverId = String(item.receiverId || '');

        if (!receiverRole && !receiverId) return true;

        return receiverRole === 'admin' || receiverId === ADMIN_ID;
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [notifications]);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalGroups: groups.length,
    totalDisciplines: disciplines.length,
    totalPlans: plans.length,
    totalPrograms: programs.length,
    totalDocuments: documents.length,
    totalReports: reports.filter((item) => !item.parentReportId).length,
    totalPractices: practices.length,
    totalAchievements: achievements.length
  }), [
    users.length,
    students.length,
    teachers.length,
    groups.length,
    disciplines.length,
    plans.length,
    programs.length,
    documents.length,
    reports,
    practices.length,
    achievements.length
  ]);

  const registeredUsers = useMemo(() => {
    return users.filter((item) => item.isRegistered === true || item.hasLoggedIn === true);
  }, [users]);

  const getCollectionData = async (collectionName) => {
    const snap = await getDocs(collection(db, collectionName));
    return firestoreSnapshotToArray(snap);
  };

  const getYearCollectionData = async (collectionName, year) => {
    const snap = await getDocs(collection(db, collectionName, year, 'items'));
    return firestoreSnapshotToArray(snap);
  };

  const getDocumentData = async (collectionName, documentId) => {
    const snap = await getDoc(doc(db, collectionName, documentId));

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...(snap.data() || {})
    };
  };

  const addCollectionData = async (collectionName, data = {}) => {
    const cleanData = removeUndefinedFields({
      ...data,
      createdAt: data.createdAt || Date.now(),
      updatedAt: Date.now()
    });

    const docRef = await addDoc(collection(db, collectionName), cleanData);

    await updateDoc(docRef, {
      id: docRef.id
    });

    return {
      id: docRef.id,
      ...cleanData
    };
  };

  const saveDocumentData = async (collectionName, documentId, data = {}) => {
    const cleanData = removeUndefinedFields({
      ...data,
      id: documentId,
      updatedAt: Date.now()
    });

    await setDoc(doc(db, collectionName, documentId), cleanData, { merge: true });

    return {
      id: documentId,
      ...cleanData
    };
  };

  const updateDocumentData = async (collectionName, documentId, data = {}) => {
    const cleanData = removeUndefinedFields({
      ...data,
      updatedAt: Date.now()
    });

    await updateDoc(doc(db, collectionName, documentId), cleanData);
  };

  const deleteDocumentData = async (collectionName, documentId) => {
    await deleteDoc(doc(db, collectionName, documentId));
  };

  const saveCollectionRows = async (collectionName, rows = []) => {
    const batch = writeBatch(db);

    rows.forEach((row) => {
      const id =
        row.id && !String(row.id).startsWith('new_') && !String(row.id).includes('_temp_')
          ? row.id
          : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

      const rowRef = doc(db, collectionName, id);

      batch.set(
        rowRef,
        removeUndefinedFields({
          ...row,
          id,
          createdAt: row.createdAt || Date.now(),
          updatedAt: Date.now()
        }),
        { merge: true }
      );
    });

    await batch.commit();
  };

  const saveYearCollectionRows = async (collectionName, year, rows = []) => {
    const batch = writeBatch(db);

    rows.forEach((row) => {
      const id =
        row.id && !String(row.id).startsWith('new_') && !String(row.id).includes('_temp_')
          ? row.id
          : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

      const rowRef = doc(db, collectionName, year, 'items', id);

      batch.set(
        rowRef,
        removeUndefinedFields({
          ...row,
          id,
          year,
          createdAt: row.createdAt || Date.now(),
          updatedAt: Date.now()
        }),
        { merge: true }
      );
    });

    await batch.commit();
  };

  const addActivityLog = async ({
    icon = '✅',
    text = '',
    type = 'system',
    senderRole = 'admin',
    senderId = ADMIN_ID,
    senderName = adminProfile.name || adminProfile.fullName || t.adminDefault,
    senderEmail = adminProfile.email || '',
    receiverRole = '',
    receiverType = '',
    receiverId = '',
    receiverName = '',
    receiverEmail = '',
    extra = {}
  }) => {
    try {
      await addCollectionData('activityLogs', {
        icon,
        text,
        type,
        senderRole,
        senderId,
        senderName,
        senderEmail,
        receiverRole,
        receiverType,
        receiverId,
        receiverName,
        receiverEmail,
        createdAt: Date.now(),
        ...extra
      });
    } catch (error) {
      console.log('Activity log error:', error);
    }
  };

  const addNotification = async ({
    title = t.notificationDefaultTitle,
    text = t.notificationDefaultText,
    icon = '🔔',
    type = 'info',
    senderRole = 'admin',
    senderId = ADMIN_ID,
    senderName = adminProfile.name || adminProfile.fullName || t.adminDefault,
    senderEmail = adminProfile.email || '',
    receiverRole = 'admin',
    receiverType = 'single',
    receiverId = ADMIN_ID,
    receiverName = t.adminDefault,
    receiverEmail = '',
    receiverTeacherId = '',
    receiverTeacherName = '',
    receiverTeacherEmail = '',
    toAllTeachers = false,
    extra = {}
  }) => {
    try {
      await addCollectionData('notifications', {
        title,
        text,
        icon,
        type,
        senderRole,
        senderId,
        senderName,
        senderEmail,
        receiverRole,
        receiverType,
        receiverId,
        receiverName,
        receiverEmail,
        receiverTeacherId,
        receiverTeacherName,
        receiverTeacherEmail,
        toAllTeachers,
        isRead: false,
        readBy: {},
        createdAt: Date.now(),
        ...extra
      });
    } catch (error) {
      console.log('Notification error:', error);
    }
  };

  const addNotificationToAdmin = async ({
    title = t.notificationDefaultTitle,
    text = t.notificationDefaultText,
    icon = '🔔',
    type = 'info',
    senderRole = 'teacher',
    senderId = '',
    senderName = '',
    senderEmail = '',
    extra = {}
  }) => {
    await addNotification({
      title,
      text,
      icon,
      type,
      senderRole,
      senderId,
      senderName,
      senderEmail,
      receiverRole: 'admin',
      receiverType: 'single',
      receiverId: ADMIN_ID,
      receiverName: adminProfile.name || adminProfile.fullName || t.adminDefault,
      receiverEmail: adminProfile.email || '',
      extra
    });
  };

  const addNotificationToTeacher = async ({
    teacherId = '',
    teacherName = '',
    teacherEmail = '',
    title = t.notificationDefaultTitle,
    text = t.notificationDefaultText,
    icon = '🔔',
    type = 'info',
    extra = {}
  }) => {
    if (!teacherId && !teacherEmail) return;

    await addNotification({
      title,
      text,
      icon,
      type,
      receiverRole: 'teacher',
      receiverType: 'single',
      receiverId: teacherId,
      receiverName: teacherName,
      receiverEmail: teacherEmail,
      receiverTeacherId: teacherId,
      receiverTeacherName: teacherName,
      receiverTeacherEmail: teacherEmail,
      extra
    });
  };

  const addNotificationToAllTeachers = async ({
    title = t.notificationDefaultTitle,
    text = t.notificationDefaultText,
    icon = '🔔',
    type = 'info',
    extra = {}
  }) => {
    await addNotification({
      title,
      text,
      icon,
      type,
      receiverRole: 'teacher',
      receiverType: 'all',
      receiverId: 'all_teachers',
      receiverName: t.allTeachers,
      toAllTeachers: true,
      extra
    });
  };

  const loadAdminProfile = async () => {
    try {
      const data = await getDocumentData('users', ADMIN_ID);

      if (data) {
        setAdminProfile((prev) => ({
          ...prev,
          ...data,
          id: ADMIN_ID,
          role: 'admin'
        }));
      } else {
        await saveDocumentData('users', ADMIN_ID, {
          ...adminProfile,
          id: ADMIN_ID,
          role: 'admin',
          access: Object.fromEntries(
            Object.keys(defaultAccess).map((key) => [key, 'edit'])
          ),
          loginStatus: 'entered',
          hasLoggedIn: true,
          isRegistered: true
        });
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  };

  const buildActivityData = (actions = []) => {
    const today = new Date();
    const weekLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const weekCounts = Array.from({ length: 7 }, () => 0);

    actions.forEach((item) => {
      const date = new Date(item.createdAt || item.date || 0);
      if (Number.isNaN(date.getTime())) return;

      const diffDays = Math.floor((today - date) / 86400000);
      if (diffDays >= 0 && diffDays < 7) {
        const jsDay = date.getDay();
        const index = jsDay === 0 ? 6 : jsDay - 1;
        weekCounts[index] += 1;
      }
    });

    const week = weekLabels.map((label, index) => ({ label, value: weekCounts[index] }));
    const month = ['1 нед', '2 нед', '3 нед', '4 нед'].map((label, index) => ({
      label,
      value: actions.filter((item) => {
        const date = new Date(item.createdAt || item.date || 0);
        if (Number.isNaN(date.getTime())) return false;
        const diffDays = Math.floor((today - date) / 86400000);
        return diffDays >= index * 7 && diffDays < (index + 1) * 7;
      }).length
    }));

    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const yearCounts = Array.from({ length: 12 }, () => 0);

    actions.forEach((item) => {
      const date = new Date(item.createdAt || item.date || 0);
      if (Number.isNaN(date.getTime())) return;
      if (date.getFullYear() === today.getFullYear()) {
        yearCounts[date.getMonth()] += 1;
      }
    });

    const year = monthNames.map((label, index) => ({ label, value: yearCounts[index] }));

    setActivityData({ week, month, year });
  };

  const loadAllData = async () => {
    setLoading(true);

    try {
      const [
        usersList,
        groupsList,
        programsList,
        documentsList,
        reportsList,
        practicesList,
        achievementsList,
        notificationsList,
        logsList,
        disciplinesList,
        plansList
      ] = await Promise.all([
        getCollectionData('users'),
        getCollectionData('groups'),
        getCollectionData('programs'),
        getCollectionData('documents'),
        getCollectionData('reports'),
        getCollectionData('practices'),
        getCollectionData('achievements'),
        getCollectionData('notifications'),
        getCollectionData('activityLogs'),
        getYearCollectionData('disciplines', currentYear),
        getYearCollectionData('plans', currentYear)
      ]);

      const normalizedUsers = usersList.map((item) => normalizeUser(item.id, item));
      const teachersList = normalizedUsers.filter((item) => ['teacher', 'lab', 'admin'].includes(item.role));
      const studentsList = normalizedUsers.filter((item) => item.role === 'student');

      const sortedLogs = logsList.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
      const sortedNotifications = notificationsList.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

      setUsers(normalizedUsers);
      setTeachers(teachersList);
      setStudents(studentsList);
      setGroups(groupsList);
      setPrograms(programsList);
      setDocuments(documentsList);
      setReports(reportsList);
      setPractices(practicesList);
      setAchievements(achievementsList);
      setNotifications(sortedNotifications);
      setRecentActions(sortedLogs.slice(0, 30));
      setDisciplines(disciplinesList);
      setPlans(plansList);
      setUnreadCount(
        sortedNotifications.filter((item) => {
          const readBy = item.readBy || {};
          return item.isRead === false && readBy[ADMIN_ID] !== true;
        }).length
      );
      buildActivityData(sortedLogs);
    } catch (error) {
      console.error('Load admin data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRows = async ({
  rows = [],
  sourceList = [],
  addFn,
  updateFn,
  options = {}
}) => {
  const sourceMap = new Map(sourceList.map((item) => [item.id, item]));

  for (const row of rows) {
    const isNew =
      !row.id ||
      String(row.id).startsWith('new_') ||
      String(row.id).includes('_temp_');

    if (isNew) {
      await addFn(row, options);
      continue;
    }

    const oldRow = sourceMap.get(row.id);

    const hasChanges =
      !oldRow ||
      Object.keys(row).some(
        (key) =>
          normalizeComparableValue(row[key]) !==
          normalizeComparableValue(oldRow[key])
      );

    if (hasChanges) {
      await updateFn(row.id, row, options);
    }
  }

  await loadAllData();
};
  const addUser = async (data = {}) => {
    const role = data.role || normalizePositionToRole(data.position || '', 'teacher');
    const fullName = data.fullName || data.name || '';

    const newUser = await addCollectionData('users', {
      ...data,
      fullName,
      name: fullName,
      role,
      position: data.position || (role === 'lab' ? 'Лаборант' : role === 'admin' ? 'Администратор' : role === 'student' ? 'Студент' : 'Преподаватель'),
      access: {
        ...defaultAccess,
        ...(data.access || {})
      },
      loginStatus: 'waiting',
      isRegistered: false,
      hasLoggedIn: false
    });

    await addNotificationToAdmin({
      title: t.newUserNotification,
      text: `${t.userAddedText}: ${fullName || data.email || t.withoutName}`,
      icon: '👤',
      type: 'user',
      senderRole: 'admin',
      senderId: ADMIN_ID,
      senderName: adminProfile.name || adminProfile.fullName
    });

    await addActivityLog({
      icon: '👤',
      text: `${t.actionUserAdded}: ${fullName || data.email || t.withoutName}`,
      type: 'user'
    });

    await loadAllData();
    return newUser;
  };

  const updateUser = async (id, data = {}, options = {}) => {
  const role = data.role || normalizePositionToRole(data.position || '', 'teacher');
  const fullName = data.fullName || data.name || '';

  await updateDocumentData('users', id, {
    ...data,
    fullName,
    name: fullName,
    role,
    access: {
  ...defaultAccess,
  ...(data.access || {}),
  reportsCurator:
    data.access?.reportsCurator ||
    data.access?.reports ||
    'none',
  reportsDepartment:
    data.access?.reportsDepartment ||
    data.access?.reports ||
    'none'
},
  });

  const shouldLog = options.shouldLog !== false;

  if (shouldLog) {
    const logText =
      options.customActionText ||
      data.lastActionText ||
      data.lastAccessLogText ||
      `${t.actionUserUpdated}: ${fullName || data.email || t.withoutName}`;

    await addActivityLog({
      icon: options.actionType === 'access' ? '🔐' : '✏️',
      text: logText,
      type: options.actionType || 'user',
      receiverId: options.targetUserId || id,
      receiverName: options.targetUserName || fullName || data.email || '',
      receiverEmail: data.email || '',
      extra: {
        actionType: options.actionType || 'user',
        targetUserId: options.targetUserId || id,
        targetUserName: options.targetUserName || fullName || data.email || ''
      }
    });
  }

  await loadAllData();
};

  const addGroup = async (data = {}) => {
    const result = await addCollectionData('groups', data);
    await addActivityLog({ icon: '👥', text: `${t.actionGroupAdded}: ${data.name || t.withoutName}`, type: 'group' });
    await loadAllData();
    return result;
  };

  const updateGroup = async (id, data = {}) => {
    await updateDocumentData('groups', id, data);
    await addActivityLog({ icon: '✏️', text: `${t.actionGroupUpdated}: ${data.name || t.withoutName}`, type: 'group' });
  };

  const addProgram = async (data = {}) => {
    const result = await addCollectionData('programs', data);
    await addNotificationToAllTeachers({
      title: t.newProgramNotification,
      text: `${t.notificationProgramForTeachers}: ${data.name || data.title || t.withoutName}`,
      icon: '📘',
      type: 'program'
    });
    await addActivityLog({ icon: '📘', text: `${t.actionProgramAdded}: ${data.name || data.title || t.withoutName}`, type: 'program' });
    await loadAllData();
    return result;
  };

  const updateProgram = async (id, data = {}) => {
    await updateDocumentData('programs', id, data);
    await addActivityLog({ icon: '✏️', text: `${t.actionProgramUpdated}: ${data.name || data.title || t.withoutName}`, type: 'program' });
  };

  const addDocument = async (data = {}) => {
    const result = await addCollectionData('documents', data);
    await addNotificationToAllTeachers({
      title: t.newDocumentNotification,
      text: `${t.notificationDocumentForTeachers}: ${data.title || data.name || t.withoutName}`,
      icon: '📄',
      type: 'document'
    });
    await addActivityLog({ icon: '📄', text: `${t.actionDocumentAdded}: ${data.title || data.name || t.withoutName}`, type: 'document' });
    await loadAllData();
    return result;
  };

  const updateDocument = async (id, data = {}) => {
    await updateDocumentData('documents', id, data);
    await addActivityLog({ icon: '✏️', text: `${t.actionDocumentUpdated}: ${data.title || data.name || t.withoutName}`, type: 'document' });
  };

  const addReport = async (data = {}) => {
    const result = await addCollectionData('reports', data);
    await addNotificationToAllTeachers({
      title: t.newReportNotification,
      text: `${t.notificationReportForTeachers}: ${data.title || data.name || t.withoutName}`,
      icon: '📊',
      type: 'report'
    });
    await addActivityLog({ icon: '📊', text: `${t.actionReportAdded}: ${data.title || data.name || t.withoutName}`, type: 'report' });
    await loadAllData();
    return result;
  };

  const updateReport = async (id, data = {}) => {
    await updateDocumentData('reports', id, data);
    await addActivityLog({ icon: '✏️', text: `${t.actionReportUpdated}: ${data.title || data.name || t.withoutName}`, type: 'report' });
  };

  const addPractice = async (data = {}) => {
    const result = await addCollectionData('practices', data);
    await addNotificationToAllTeachers({
      title: t.newPracticeNotification,
      text: `${t.notificationPracticeForTeachers}: ${data.type || data.group || t.withoutName}`,
      icon: '📌',
      type: 'practice'
    });
    await addActivityLog({ icon: '📌', text: `${t.actionPracticeAdded}: ${data.type || data.group || t.withoutName}`, type: 'practice' });
    await loadAllData();
    return result;
  };

  const updatePractice = async (id, data = {}) => {
    await updateDocumentData('practices', id, data);
    await addActivityLog({ icon: '✏️', text: `${t.actionPracticeUpdated}: ${data.type || data.group || t.withoutName}`, type: 'practice' });
  };

  const addAchievement = async (data = {}) => {
    const result = await addCollectionData('achievements', {
      ...data,
      teacherName: data.teacherName || adminProfile.fullName || adminProfile.name,
      uploadedBy: data.uploadedBy || ADMIN_ID,
      uploadedByRole: data.uploadedByRole || 'admin'
    });
    await addNotificationToAllTeachers({
      title: t.newAchievementNotification,
      text: `${t.notificationAchievementForTeachers}: ${data.title || data.name || t.withoutName}`,
      icon: '🏆',
      type: 'achievement'
    });
    await addActivityLog({ icon: '🏆', text: `${t.actionAchievementAdded}: ${data.title || data.name || t.withoutName}`, type: 'achievement' });
    await loadAllData();
    return result;
  };

  const updateAchievement = async (id, data = {}) => {
    await updateDocumentData('achievements', id, data);
    await addActivityLog({ icon: '✏️', text: `${t.actionAchievementUpdated}: ${data.title || data.name || t.withoutName}`, type: 'achievement' });
  };

 const saveUsers = async (rows = [], options = {}) =>
  saveRows({
    rows,
    sourceList: users,
    addFn: addUser,
    updateFn: updateUser,
    options
  });

const saveTeachers = async (rows = [], options = {}) =>
  saveRows({
    rows,
    sourceList: teachers,
    addFn: addUser,
    updateFn: updateUser,
    options:
      options.actionType === 'access'
        ? {
            ...options,
            shouldLog: false
          }
        : options
  });

  const saveStudents = async (rows = []) =>
    saveRows({ rows, sourceList: students, addFn: addUser, updateFn: updateUser });

  const saveGroups = async (rows = []) =>
    saveRows({ rows, sourceList: groups, addFn: addGroup, updateFn: updateGroup });

  const savePrograms = async (rows = []) =>
    saveRows({ rows, sourceList: programs, addFn: addProgram, updateFn: updateProgram });

  const saveDocuments = async (rows = []) =>
    saveRows({ rows, sourceList: documents, addFn: addDocument, updateFn: updateDocument });

  const saveReports = async (rows = []) =>
    saveRows({ rows, sourceList: reports, addFn: addReport, updateFn: updateReport });

  const savePractices = async (rows = []) =>
    saveRows({ rows, sourceList: practices, addFn: addPractice, updateFn: updatePractice });

  const saveAchievements = async (rows = []) =>
    saveRows({ rows, sourceList: achievements, addFn: addAchievement, updateFn: updateAchievement });

  const updateAdminProfile = async (profileData) => {
    try {
      await saveDocumentData('users', ADMIN_ID, {
        ...profileData,
        id: ADMIN_ID,
        role: 'admin',
        loginStatus: 'entered',
        hasLoggedIn: true,
        isRegistered: true
      });

      setAdminProfile((prev) => ({
        ...prev,
        ...profileData,
        id: ADMIN_ID,
        role: 'admin'
      }));

      await addActivityLog({ icon: '👤', text: t.actionProfileUpdated, type: 'profile' });

      alert(t.profileSaved);
      return true;
    } catch (error) {
      alert(t.profileError + error.message);
      return false;
    }
  };

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    localStorage.setItem('siteLanguage', lang);

    await addActivityLog({
      icon: '🌐',
      text: `${t.actionLanguageChanged}: ${lang.toUpperCase()}`,
      type: 'language'
    });
  };

  const toggleDarkMode = async () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', String(next));
    document.body.classList.toggle('dark-mode', next);

    await addActivityLog({ icon: next ? '🌙' : '☀️', text: next ? t.actionDarkModeOn : t.actionLightModeOn, type: 'theme' });
  };

  const promoteStudentsToNextCourse = async () => {
    if (!window.confirm(t.promoteConfirm)) return;

    try {
      const batch = writeBatch(db);

      students.forEach((student) => {
        const currentCourse = Number(student.course || 1);
        const nextCourse = currentCourse >= 4 ? 'graduate' : String(currentCourse + 1);

        batch.set(
          doc(db, 'users', student.id),
          {
            course: nextCourse,
            status: nextCourse === 'graduate' ? 'graduate' : student.status || 'active',
            updatedAt: Date.now()
          },
          { merge: true }
        );
      });

      await batch.commit();
      await addActivityLog({ icon: '🎓', text: t.promoteSuccess, type: 'students' });
      alert(t.promoteSuccess);
      await loadAllData();
    } catch (error) {
      alert(t.error + error.message);
    }
  };

  const addAcademicYear = async () => {
    const year = window.prompt(t.promptNewYear);
    if (!year) return;

    const cleanYear = year.trim();
    if (!cleanYear) return;

    setAvailableYears((prev) => (prev.includes(cleanYear) ? prev : [...prev, cleanYear]));
    setCurrentYear(cleanYear);
    localStorage.setItem('academicYear', cleanYear);

    await addActivityLog({ icon: '📅', text: `${t.actionYearAdded}: ${cleanYear}`, type: 'year' });
  };

  const changeAcademicYear = async (year) => {
    setCurrentYear(year);
    localStorage.setItem('academicYear', year);

    await addActivityLog({ icon: '📅', text: `${t.actionYearChanged}: ${year}`, type: 'year' });
  };

  const markNotificationRead = async (notificationId) => {
    if (!notificationId) return;

    try {
      await setDoc(
        doc(db, 'notifications', notificationId),
        {
          isRead: true,
          readAt: Date.now(),
          readBy: { [ADMIN_ID]: true },
          updatedAt: Date.now()
        },
        { merge: true }
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                isRead: true,
                readAt: Date.now(),
                readBy: { ...(item.readBy || {}), [ADMIN_ID]: true }
              }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(0, Number(prev || 0) - 1));
    } catch (error) {
      console.log('Notification read error:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const batch = writeBatch(db);

      adminNotifications.forEach((item) => {
        if (item.id) {
          batch.set(
            doc(db, 'notifications', item.id),
            {
              isRead: true,
              readAt: Date.now(),
              readBy: { ...(item.readBy || {}), [ADMIN_ID]: true },
              updatedAt: Date.now()
            },
            { merge: true }
          );
        }
      });

      await batch.commit();
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: Date.now(),
          readBy: { ...(item.readBy || {}), [ADMIN_ID]: true }
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.log('Notification read error:', error);
    }
  };

  const openSection = (sectionId) => {
    setShowSettings(false);
    setActiveMenu(sectionId);
  };

  const logout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminId');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('studentId');
    navigate('/login');
  };

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  useEffect(() => {
    loadAllData();
  }, [currentYear]);

  useEffect(() => {
    const unsubscribes = [
      onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const list = firestoreSnapshotToArray(snapshot).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
        setNotifications(list);
        setUnreadCount(
          list.filter((item) => {
            const readBy = item.readBy || {};
            return item.isRead === false && readBy[ADMIN_ID] !== true;
          }).length
        );
      }),
      onSnapshot(collection(db, 'activityLogs'), (snapshot) => {
        const list = firestoreSnapshotToArray(snapshot).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
        setRecentActions(list.slice(0, 30));
        buildActivityData(list);
      })
    ];

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe && unsubscribe());
  }, []);

  useEffect(() => {
    const handleClickOutsideFooterCalendar = (event) => {
      if (footerCalendarRef.current && !footerCalendarRef.current.contains(event.target)) {
        setShowFooterCalendar(false);
      }
    };

    const handleEscapeFooterCalendar = (event) => {
      if (event.key === 'Escape') setShowFooterCalendar(false);
    };

    document.addEventListener('mousedown', handleClickOutsideFooterCalendar);
    document.addEventListener('touchstart', handleClickOutsideFooterCalendar);
    document.addEventListener('keydown', handleEscapeFooterCalendar);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideFooterCalendar);
      document.removeEventListener('touchstart', handleClickOutsideFooterCalendar);
      document.removeEventListener('keydown', handleEscapeFooterCalendar);
    };
  }, []);

  const handleDelete = async (type, id) => {
    if (!id) return;

    const config = {
      user: { collectionName: 'users', confirm: t.deleteUserConfirm, log: t.actionUserDeleted },
      teacher: { collectionName: 'users', confirm: t.deleteUserConfirm, log: t.actionUserDeleted },
      student: { collectionName: 'users', confirm: t.deleteUserConfirm, log: t.actionUserDeleted },
      group: { collectionName: 'groups', confirm: t.deleteGroupConfirm, log: t.actionGroupDeleted },
      program: { collectionName: 'programs', confirm: t.deleteProgramConfirm, log: t.actionProgramDeleted },
      document: { collectionName: 'documents', confirm: t.deleteDocumentConfirm, log: t.actionDocumentDeleted },
      report: { collectionName: 'reports', confirm: t.deleteReportConfirm, log: t.actionReportDeleted },
      practice: { collectionName: 'practices', confirm: t.deletePracticeConfirm, log: t.actionPracticeDeleted },
      achievement: { collectionName: 'achievements', confirm: t.deleteAchievementConfirm, log: t.actionAchievementDeleted }
    }[type];

    if (!config) return;
    if (!window.confirm(config.confirm)) return;

    await deleteDocumentData(config.collectionName, id);
    await addActivityLog({ icon: '🗑️', text: config.log, type });
    await loadAllData();
  };

  function ProfileModal() {
    const [form, setForm] = useState(adminProfile);

    const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    return (
      <div className="admin-modal-backdrop" onClick={() => setShowProfileModal(false)}>
        <div className="admin-modal-window profile-modal" onClick={(event) => event.stopPropagation()}>
          <div className="admin-modal-head">
            <div>
              <h3>{t.profileTitle}</h3>
              <p>{t.department}</p>
            </div>
            <button type="button" className="modal-close" onClick={() => setShowProfileModal(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="profile-form-grid">
            <label>
              <UserRound size={16} /> {t.fullNameLabel}
              <input value={form.fullName || form.name || ''} onChange={(e) => change('fullName', e.target.value)} placeholder={t.fioPlaceholder} />
            </label>
            <label>
              <Mail size={16} /> {t.emailLabel}
              <input value={form.email || ''} onChange={(e) => change('email', e.target.value)} placeholder="email@example.com" />
            </label>
            <label>
              <Phone size={16} /> {t.phoneLabel}
              <input value={form.phone || ''} onChange={(e) => change('phone', e.target.value)} placeholder={t.phonePlaceholder} />
            </label>
            <label>
              <Briefcase size={16} /> {t.positionLabel}
              <input value={form.position || ''} onChange={(e) => change('position', e.target.value)} placeholder={t.positionPlaceholder} />
            </label>
            <label>
              <Building2 size={16} /> {t.departmentLabel}
              <input value={form.department || ''} onChange={(e) => change('department', e.target.value)} placeholder={t.departmentPlaceholder} />
            </label>
            <label>
              <Camera size={16} /> Фото URL
              <input value={form.photoUrl || form.avatar || ''} onChange={(e) => change('photoUrl', e.target.value)} placeholder="https://..." />
            </label>
            <label className="profile-wide">
              <Edit3 size={16} /> Bio
              <textarea value={form.bio || ''} onChange={(e) => change('bio', e.target.value)} placeholder={t.bioPlaceholder} />
            </label>
          </div>

          <div className="admin-modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowProfileModal(false)}>
              <X size={16} /> {t.cancel}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={async () => {
                const ok = await updateAdminProfile({
                  ...form,
                  name: form.fullName || form.name || ''
                });
                if (ok) setShowProfileModal(false);
              }}
            >
              <Save size={16} /> {t.save}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSettings = () => (
    <div className="settings-page admin-section-card">
      <div className="section-header">
        <div>
          <h2>{t.settingsTitle}</h2>
          <p>{t.settingsSubtitle}</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>{t.interfaceLanguage}</h3>
          <div className="settings-actions-row">
            {['kg', 'ru', 'en'].map((lang) => (
              <button key={lang} type="button" className={`btn-secondary ${language === lang ? 'active' : ''}`} onClick={() => handleLanguageChange(lang)}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <h3>{t.themeMode}</h3>
          <button type="button" className="btn-primary" onClick={toggleDarkMode}>
            {darkMode ? t.lightTheme : t.darkTheme}
          </button>
        </div>

        

      </div>
    </div>
  );

  const renderContent = () => {
    if (showSettings || activeMenu === 'settings') return renderSettings();
    if (activeMenu === 'profile') return null;
    if (activeMenu === 'schedule') {
  return (
    <SchedulePage
      mode="admin"
      role="admin"
      language={language}
      t={t}
      currentYear={currentYear}
      teachers={teachers}
      groups={groups}
      students={students}
      disciplines={disciplines}
    />
  );
}
    if (activeMenu === 'plans') return <CurriculumPlanPage mode="admin" language={language} t={t} currentYear={currentYear} />;

    return (
      <AdminDashboardContent
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        openSection={openSection}
        stats={stats}
        registeredUsers={registeredUsers}
        users={users}
        teachers={teachers}
        students={students}
        groups={groups}
        disciplines={disciplines}
        plans={plans}
        programs={programs}
        documents={documents}
        reports={reports}
        practices={practices}
        achievements={achievements}
        activityData={activityData}
        recentActions={recentActions}
        setShowAllActionsModal={setShowAllActionsModal}
        adminProfile={adminProfile}
        onSaveAdminProfile={updateAdminProfile}
        currentYear={currentYear}
        language={language}
        t={t}
        handleDelete={handleDelete}
        onSaveUsers={saveUsers}
        onCreateTeacher={(data) => addUser({ ...data, role: normalizePositionToRole(data.position, data.role || 'teacher') })}
        onSaveTeachers={saveTeachers}
        onCreateStudent={(data) => addUser({ ...data, role: 'student', canAccessPortal: false })}
        onSaveStudents={saveStudents}
        onPromoteStudents={promoteStudentsToNextCourse}
        onCreateGroup={addGroup}
        onSaveGroups={saveGroups}
        onCreateProgram={addProgram}
        onSavePrograms={savePrograms}
        onCreateDocument={addDocument}
        onSaveDocuments={saveDocuments}
        onCreateReport={addReport}
        onSaveReports={saveReports}
        onCreatePractice={addPractice}
        onSavePractices={savePractices}
        onCreateAchievement={addAchievement}
        onSaveAchievements={saveAchievements}
        addNotificationToAdmin={addNotificationToAdmin}
        addNotificationToTeacher={addNotificationToTeacher}
        addNotificationToAllTeachers={addNotificationToAllTeachers}
        addActivityLog={addActivityLog}
      />
    );
  };

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={openSection} setShowSettings={setShowSettings} t={t} />

      <main className="admin-main">
        <AdminTopbar
          onLogout={logout}
          adminProfile={adminProfile}
          adminName={adminProfile.fullName || adminProfile.name}
          adminPosition={adminProfile.position}
          adminEmail={adminProfile.email}
          adminPhone={adminProfile.phone}
          adminPhoto={adminProfile.photoUrl || adminProfile.avatar}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          notifications={adminNotifications}
          unreadCount={unreadCount}
          onMarkRead={markNotificationRead}
          onMarkAllRead={markAllNotificationsAsRead}
          setShowSettings={setShowSettings}
          setActiveMenu={setActiveMenu}
          openProfileModal={() => setShowProfileModal(true)}
          language={language}
          onLanguageChange={handleLanguageChange}
          t={t}
        />

        <div className="admin-content">
          {loading && activeMenu !== 'dashboard' ? <div className="admin-loading">{t.loading}</div> : renderContent()}
        </div>

                {activeMenu === 'dashboard' && (
                  <footer className="admin-footer">
          <span>{t.footer}</span>

          <div className="footer-calendar" ref={footerCalendarRef}>
            <button type="button" onClick={() => setShowFooterCalendar((prev) => !prev)}>
              <CalendarDays size={16} />
              {t.academicCalendar}
            </button>

            {showFooterCalendar && (
              <div className="footer-calendar-popover">
                <DatePicker selected={footerSelectedDate} onChange={(date) => setFooterSelectedDate(date)} inline />
                <p>{t.selectedDate}: {footerSelectedDate.toLocaleDateString('ru-RU')}</p>
              </div>
            )}
          </div>
        </footer>
        )}
      </main>

      {showProfileModal && <ProfileModal />}

      {showAllActionsModal && (
        <RecentActionsModal t={t} actions={recentActions} onClose={() => setShowAllActionsModal(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;