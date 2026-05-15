// src/components/Teacher/TeacherDashboard.js

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale/ru';
import 'react-datepicker/dist/react-datepicker.css';

import { CalendarDays, X } from 'lucide-react';

import {
  db,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from '../../firebase';

import TeacherSidebar from './TeacherSidebar';
import TeacherTopbar from './TeacherTopbar';
import TeacherDashboardContent from './TeacherDashboardContent';

import CurriculumPlanPage from '../CurriculumPlan/CurriculumPlanPage';
import SchedulePage from '../Admin/SchedulePage';

import './TeacherDashboard.css';

registerLocale('ru', ru);

const ADMIN_ID = 'admin_main';

const defaultYears = ['2024-2025', '2025-2026', '2026-2027', '2027-2028'];

const allAccessSections = [
  'schedule',
  'plans',
  'programs',
  'documents',
  'teacherFiles',
  'students',
  'teachers',

  // Отчеттордун ички доступтары
  'reports',
  'reportsCurator',
  'reportsDepartment',

  'practices',
  'achievements'
];

const emptyAccess = {
  schedule: 'none',
  plans: 'none',
  programs: 'none',
  documents: 'none',
  teacherFiles: 'none',
  students: 'none',
  teachers: 'none',
  reports: 'none',
  reportsCurator: 'none',
  reportsDepartment: 'none',
  practices: 'none',
  achievements: 'none'
};

const defaultAccessByRole = {
  teacher: {
    schedule: 'read',
    plans: 'read',
    programs: 'edit',
    documents: 'read',
    teacherFiles: 'edit',
    students: 'none',
    teachers: 'none',
    reports: 'none',
    reportsCurator: 'none',
    reportsDepartment: 'none',
    practices: 'none',
    achievements: 'none'
  },

  lab: {
    schedule: 'read',
    students: 'read',
    teachers: 'read',
    plans: 'none',
    programs: 'none',
    documents: 'none',
    teacherFiles: 'none',
    reports: 'none',
    reportsCurator: 'none',
    reportsDepartment: 'none',
    practices: 'none',
    achievements: 'none'
  }
};

const monthNames = {
  ru: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
  ],
  kg: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
};

const translations = {
  ru: {
    department: 'Кафедра информационных технологий',
    teacherPanel: 'Преподаватель',
    labPanel: 'Лаборант',

    dashboard: 'Главная',
    schedule: 'Расписание',
    plans: 'Нагрузка',
    programs: 'Рабочие программы',
    documents: 'Документы',
    reports: 'Отчеты',
    practices: 'Практика',
    achievements: 'Достижения',
    teacherFiles: 'Личная папка',
    students: 'Студенты',
    teachers: 'Преподаватели',

    settings: 'Настройки',
    logout: 'Выйти',

    teacherDefaultName: 'Преподаватель',
    teacherDefaultPosition: 'Преподаватель',
    labDefaultName: 'Лаборант',
    labDefaultPosition: 'Лаборант',
    adminDefaultName: 'Администратор',

    notifications: 'Уведомления',
    allRead: 'Все прочитано',
    newNotifications: 'новых',
    noNewNotifications: 'Новых нет',
    emptyNotifications: 'Уведомлений пока нет',
    notificationDefaultTitle: 'Уведомление',
    notificationDefaultText: 'Новое действие на портале',

    search: 'Поиск...',
    add: 'Добавить',
    edit: 'Редактировать',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    download: 'Скачать',
    open: 'Открыть',
    answer: 'Ответить',
    changeAnswer: 'Изменить ответ',
    noData: 'Данные пока не добавлены',

    lightTheme: 'Светлая тема',
    darkTheme: 'Темная тема',
    settingsTitle: 'Настройки кабинета',
    settingsSubtitle: 'Язык, тема и параметры кабинета',
    interfaceLanguage: 'Язык интерфейса',
    themeMode: 'Тема интерфейса',

    academicYear: 'Учебный год',
    calendar: 'Календарь',
    selectedDate: 'Выбранная дата',

    loading: 'Загрузка...',
    error: 'Ошибка: ',
    profileSaved: 'Данные сохранены',

    deleteConfirm: 'Удалить запись?',
    deleteProgramConfirm: 'Удалить рабочую программу?',
    deleteDocumentConfirm: 'Удалить документ?',
    deleteFileConfirm: 'Удалить файл?',
    deleteReportConfirm: 'Удалить отчет?',
    deletePracticeConfirm: 'Удалить практику?',
    deleteAchievementConfirm: 'Удалить достижение?',

    programsSaved: 'Рабочие программы сохранены',
    documentsSaved: 'Документы сохранены',
    filesSaved: 'Личная папка сохранена',
    reportsSaved: 'Отчеты сохранены',
    practicesSaved: 'Практика сохранена',
    achievementsSaved: 'Достижения сохранены',
    reportReplySent: 'Ответ на отчет отправлен',
    dataDeleted: 'Данные удалены',
    reportNotFound: 'Отчет не найден',
    replyPrefix: 'Ответ',

    accessDeniedTitle: 'Раздел недоступен',
    accessDeniedText: 'У вас нет доступа к этому разделу.',

    adminProgramNotificationTitle: 'Рабочая программа',
    adminProgramNotificationText: 'Преподаватель загрузил рабочую программу',
    adminDocumentNotificationTitle: 'Новый документ',
    adminDocumentNotificationText: 'Преподаватель/лаборант загрузил документ',
    adminReportNotificationTitle: 'Новый отчет от преподавателя',
    adminReportNotificationText: 'Преподаватель отправил отчет',
    adminReplyNotificationTitle: 'Ответ на отчет',
    adminReplyNotificationText: 'Преподаватель отправил ответ на отчет',
    adminFileNotificationTitle: 'Новый файл от преподавателя',
    adminFileNotificationText: 'Преподаватель отправил файл в личную папку',
    adminPracticeNotificationTitle: 'Практика',
    adminPracticeNotificationText: 'Преподаватель загрузил практику',
    adminAchievementNotificationTitle: 'Достижение',
    adminAchievementNotificationText: 'Преподаватель загрузил достижение',
    curatorReport: 'Кураторский отчет',
departmentReport: 'Кафедральный отчет',
reportCategory: 'Категория',
responsible: 'Ответственный',
annualReport: 'Годовой отчет',
monthlyReport: 'Месячный отчет',
otherReport: 'Другое',
backToReports: 'Назад к отчетам',
openSection: 'Открыть',
  },

  kg: {
    department: 'Маалыматтык технологиялар кафедрасы',
    teacherPanel: 'Окутуучу',
    labPanel: 'Лаборант',

    dashboard: 'Башкы бет',
    schedule: 'Расписание',
    plans: 'Нагрузка',
    programs: 'Жумушчу программалар',
    documents: 'Документтер',
    reports: 'Отчеттор',
    practices: 'Практика',
    achievements: 'Жетишкендиктер',
    teacherFiles: 'Жеке папка',
    students: 'Студенттер',
    teachers: 'Окутуучулар',

    settings: 'Жөндөөлөр',
    logout: 'Чыгуу',

    teacherDefaultName: 'Окутуучу',
    teacherDefaultPosition: 'Окутуучу',
    labDefaultName: 'Лаборант',
    labDefaultPosition: 'Лаборант',
    adminDefaultName: 'Администратор',

    notifications: 'Билдирүүлөр',
    allRead: 'Баары окулду',
    newNotifications: 'жаңы',
    noNewNotifications: 'Жаңы жок',
    emptyNotifications: 'Билдирүү жок',
    notificationDefaultTitle: 'Билдирүү',
    notificationDefaultText: 'Порталда жаңы аракет болду',

    search: 'Издөө...',
    add: 'Кошуу',
    edit: 'Редактирлөө',
    save: 'Сактоо',
    cancel: 'Жокко чыгаруу',
    delete: 'Өчүрүү',
    download: 'Жүктөп алуу',
    open: 'Ачуу',
    answer: 'Жооп берүү',
    changeAnswer: 'Жоопту өзгөртүү',
    noData: 'Маалымат кошула элек',

    lightTheme: 'Жарык тема',
    darkTheme: 'Кара тема',
    settingsTitle: 'Кабинет жөндөөлөрү',
    settingsSubtitle: 'Тил, тема жана кабинет параметрлери',
    interfaceLanguage: 'Интерфейс тили',
    themeMode: 'Интерфейс темасы',

    academicYear: 'Окуу жылы',
    calendar: 'Календарь',
    selectedDate: 'Тандалган дата',

    loading: 'Жүктөлүүдө...',
    error: 'Ката: ',
    profileSaved: 'Маалымат сакталды',

    deleteConfirm: 'Жазууну өчүрөсүзбү?',
    deleteProgramConfirm: 'Жумушчу программаны өчүрөсүзбү?',
    deleteDocumentConfirm: 'Документти өчүрөсүзбү?',
    deleteFileConfirm: 'Файлды өчүрөсүзбү?',
    deleteReportConfirm: 'Отчетту өчүрөсүзбү?',
    deletePracticeConfirm: 'Практиканы өчүрөсүзбү?',
    deleteAchievementConfirm: 'Жетишкендикти өчүрөсүзбү?',

    programsSaved: 'Жумушчу программалар сакталды',
    documentsSaved: 'Документтер сакталды',
    filesSaved: 'Жеке папка сакталды',
    reportsSaved: 'Отчеттор сакталды',
    practicesSaved: 'Практика сакталды',
    achievementsSaved: 'Жетишкендиктер сакталды',
    reportReplySent: 'Отчетко жооп жөнөтүлдү',
    dataDeleted: 'Маалымат өчүрүлдү',
    reportNotFound: 'Отчет табылган жок',
    replyPrefix: 'Жооп',

    accessDeniedTitle: 'Бөлүм жеткиликсиз',
    accessDeniedText: 'Бул бөлүмгө кирүүгө уруксат жок.',

    adminProgramNotificationTitle: 'Жумушчу программа',
    adminProgramNotificationText: 'Окутуучу жумушчу программаны жүктөдү',
    adminDocumentNotificationTitle: 'Жаңы документ',
    adminDocumentNotificationText: 'Окутуучу/лаборант документ жүктөдү',
    adminReportNotificationTitle: 'Окутуучудан жаңы отчет',
    adminReportNotificationText: 'Окутуучу отчет жөнөттү',
    adminReplyNotificationTitle: 'Отчетко жооп',
    adminReplyNotificationText: 'Окутуучу отчетко жооп жөнөттү',
    adminFileNotificationTitle: 'Окутуучудан жаңы файл',
    adminFileNotificationText: 'Окутуучу жеке папкага файл жүктөдү',
    adminPracticeNotificationTitle: 'Практика',
    adminPracticeNotificationText: 'Окутуучу практика материалын жүктөдү',
    adminAchievementNotificationTitle: 'Жетишкендик',
    adminAchievementNotificationText: 'Окутуучу жетишкендик жүктөдү',
    curatorReport: 'Куратордук отчет',
departmentReport: 'Кафедралык отчет',
reportCategory: 'Категория',
responsible: 'Жооптуу',
annualReport: 'Жылдык отчет',
monthlyReport: 'Айлык отчет',
otherReport: 'Башка',
backToReports: 'Отчетторго кайтуу',
openSection: 'Ачуу',
  },

  en: {
    department: 'Department of Information Technology',
    teacherPanel: 'Teacher',
    labPanel: 'Laboratory assistant',

    dashboard: 'Dashboard',
    schedule: 'Schedule',
    plans: 'Workload',
    programs: 'Working programs',
    documents: 'Documents',
    reports: 'Reports',
    practices: 'Practice',
    achievements: 'Achievements',
    teacherFiles: 'Personal folder',
    students: 'Students',
    teachers: 'Teachers',

    settings: 'Settings',
    logout: 'Logout',

    teacherDefaultName: 'Teacher',
    teacherDefaultPosition: 'Teacher',
    labDefaultName: 'Laboratory assistant',
    labDefaultPosition: 'Laboratory assistant',
    adminDefaultName: 'Administrator',

    notifications: 'Notifications',
    allRead: 'Mark all read',
    newNotifications: 'new',
    noNewNotifications: 'No new',
    emptyNotifications: 'No notifications yet',
    notificationDefaultTitle: 'Notification',
    notificationDefaultText: 'New portal activity',

    search: 'Search...',
    add: 'Add',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    download: 'Download',
    open: 'Open',
    answer: 'Reply',
    changeAnswer: 'Edit reply',
    noData: 'No data yet',

    lightTheme: 'Light theme',
    darkTheme: 'Dark theme',
    settingsTitle: 'Cabinet settings',
    settingsSubtitle: 'Language, theme and cabinet parameters',
    interfaceLanguage: 'Interface language',
    themeMode: 'Theme mode',

    academicYear: 'Academic year',
    calendar: 'Calendar',
    selectedDate: 'Selected date',

    loading: 'Loading...',
    error: 'Error: ',
    profileSaved: 'Data saved',

    deleteConfirm: 'Delete this record?',
    deleteProgramConfirm: 'Delete working program?',
    deleteDocumentConfirm: 'Delete document?',
    deleteFileConfirm: 'Delete file?',
    deleteReportConfirm: 'Delete report?',
    deletePracticeConfirm: 'Delete practice?',
    deleteAchievementConfirm: 'Delete achievement?',

    programsSaved: 'Working programs saved',
    documentsSaved: 'Documents saved',
    filesSaved: 'Personal folder saved',
    reportsSaved: 'Reports saved',
    practicesSaved: 'Practice saved',
    achievementsSaved: 'Achievements saved',
    reportReplySent: 'Report reply sent',
    dataDeleted: 'Data deleted',
    reportNotFound: 'Report not found',
    replyPrefix: 'Reply',

    accessDeniedTitle: 'Section unavailable',
    accessDeniedText: 'You do not have access to this section.',

    adminProgramNotificationTitle: 'Working program',
    adminProgramNotificationText: 'Teacher uploaded a working program',
    adminDocumentNotificationTitle: 'New document',
    adminDocumentNotificationText: 'Teacher/lab uploaded a document',
    adminReportNotificationTitle: 'New report from teacher',
    adminReportNotificationText: 'Teacher sent a report',
    adminReplyNotificationTitle: 'Report reply',
    adminReplyNotificationText: 'Teacher sent a report reply',
    adminFileNotificationTitle: 'New file from teacher',
    adminFileNotificationText: 'Teacher sent a file to personal folder',
    adminPracticeNotificationTitle: 'Practice',
    adminPracticeNotificationText: 'Teacher uploaded practice material',
    adminAchievementNotificationTitle: 'Achievement',
    adminAchievementNotificationText: 'Teacher uploaded achievement',
    curatorReport: 'Curator report',
departmentReport: 'Department report',
reportCategory: 'Category',
responsible: 'Responsible',
annualReport: 'Annual report',
monthlyReport: 'Monthly report',
otherReport: 'Other',
backToReports: 'Back to reports',
openSection: 'Open',
  }
};

const safeKey = (value = '') => String(value || '').replace(/[.#$[\]/]/g, '_');
const safeFieldKey = (value = '') => String(value || '').replace(/[.~*/[\]]/g, '_');
const normalize = (value = '') => String(value || '').trim().toLowerCase();

const normalizeRole = (value = '') => {
  const role = normalize(value);

  if (role === 'lab' || role === 'laborant' || role === 'лаборант') {
    return 'lab';
  }

  return 'teacher';
};

const normalizeAccessValue = (value = 'none') => {
  const access = normalize(value);

  if (
    access === 'view' ||
    access === 'read' ||
    access === 'читать' ||
    access === 'просмотр'
  ) {
    return 'read';
  }

  if (
    access === 'edit' ||
    access === 'write' ||
    access === 'редактировать' ||
    access === 'изменить'
  ) {
    return 'edit';
  }

  return 'none';
};

const hasAccess = (access = {}, sectionId, required = 'read') => {
  const levels = {
    none: 0,
    read: 1,
    edit: 2
  };

  const current = normalizeAccessValue(access?.[sectionId]);
  const needed = normalizeAccessValue(required);

  return levels[current] >= levels[needed];
};

const buildEffectiveAccess = (role = 'teacher', savedAccess = {}) => {
  const normalizedRole = normalizeRole(role);
  const roleDefault = defaultAccessByRole[normalizedRole] || defaultAccessByRole.teacher;

  const hasSavedAccess =
    savedAccess &&
    typeof savedAccess === 'object' &&
    Object.keys(savedAccess).length > 0;

  return allAccessSections.reduce((acc, sectionId) => {
    const fallback = roleDefault[sectionId] || emptyAccess[sectionId] || 'none';

    acc[sectionId] = normalizeAccessValue(
      hasSavedAccess && Object.prototype.hasOwnProperty.call(savedAccess, sectionId)
        ? savedAccess[sectionId]
        : fallback
    );

    return acc;
  }, {});
};

const getAllowedMenus = (access = {}) => {
  const visibleSections = allAccessSections.filter((sectionId) =>
    hasAccess(access, sectionId, 'read')
  );

  const preparedSections = [...visibleSections];

  const hasAnyReportsAccess =
    hasAccess(access, 'reports', 'read') ||
    hasAccess(access, 'reportsCurator', 'read') ||
    hasAccess(access, 'reportsDepartment', 'read');

  if (hasAnyReportsAccess) {
    preparedSections.push('reports');
  }

  return Array.from(new Set(['dashboard', ...preparedSections]));
};

const firestoreSnapshotToArray = (snapshot) => {
  if (!snapshot || snapshot.empty) return [];

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() || {})
  }));
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  } catch (error) {
    return {};
  }
};

const getCurrentTeacherInfo = () => {
  const currentUser = getCurrentUser();
  const email = currentUser.email || localStorage.getItem('teacherEmail') || '';

  const id =
    currentUser.id ||
    currentUser.uid ||
    localStorage.getItem('teacherId') ||
    localStorage.getItem('userId') ||
    localStorage.getItem('currentUserId') ||
    (email ? safeKey(email) : '');

  const fullName =
    currentUser.fullName ||
    currentUser.name ||
    currentUser.displayName ||
    localStorage.getItem('teacherName') ||
    '';

  return { id, email, fullName };
};

const isNewRow = (row = {}) => {
  const id = String(row.id || '');
  return row.isNew === true || id.includes('_new_') || id.startsWith('new_') || !id;
};

const rowHasData = (row = {}) => {
  return Boolean(
    String(row.title || '').trim() ||
      String(row.name || '').trim() ||
      String(row.fullName || '').trim() ||
      String(row.discipline || '').trim() ||
      String(row.description || '').trim() ||
      String(row.fileUrl || '').trim() ||
      String(row.pdfUrl || '').trim() ||
      String(row.url || '').trim() ||
      String(row.fileName || '').trim() ||
      String(row.group || '').trim() ||
      String(row.groupName || '').trim()
  );
};

const getAcademicYearFromDate = (date) => {
  const selectedDate = date instanceof Date ? date : new Date();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const getDateFromAcademicYear = (academicYear = '2025-2026') => {
  const firstYear = Number(String(academicYear).split('-')[0]);
  return Number.isNaN(firstYear) ? new Date() : new Date(firstYear + 1, 4, 10);
};

const formatDate = (date) => {
  if (!(date instanceof Date)) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

const removeUndefinedFields = (data = {}) => {
  const cleaned = {};

  Object.entries(data || {}).forEach(([key, value]) => {
    if (value !== undefined) cleaned[key] = value;
  });

  return cleaned;
};

const getFileUrl = (row = {}) => {
  return row.fileUrl || row.pdfUrl || row.url || row.downloadUrl || '';
};

const getFileName = (row = {}) => {
  const fileUrl = getFileUrl(row);
  const fromUrl = fileUrl
    ? decodeURIComponent(fileUrl.split('/').pop()?.split('?')[0] || '')
    : '';

  return row.fileName || row.originalName || row.original_filename || fromUrl || '';
};

const normalizeFileFields = (row = {}) => {
  const fileUrl = getFileUrl(row);
  const fileName = getFileName(row);

  return {
    ...row,
    fileUrl,
    pdfUrl: row.pdfUrl && row.pdfUrl !== fileUrl ? row.pdfUrl : '',
    url: row.url && row.url !== fileUrl ? row.url : '',
    fileName,
    fileType: row.fileType || row.mimeType || '',
    fileSize: Number(row.fileSize || row.size || 0),
    publicId: row.publicId || row.public_id || '',
    resourceType: row.resourceType || ''
  };
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const footerCalendarRef = useRef(null);

  const currentTeacher = useMemo(() => getCurrentTeacherInfo(), []);

  const [activeMenu, setActiveMenu] = useState(
    localStorage.getItem('teacherActiveMenu') || 'dashboard'
  );
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('siteLanguage') || 'ru');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [currentYear, setCurrentYear] = useState(
    localStorage.getItem('academicYear') || '2025-2026'
  );
  const [footerSelectedDate, setFooterSelectedDate] = useState(
    getDateFromAcademicYear(localStorage.getItem('academicYear') || '2025-2026')
  );
  const [showFooterCalendar, setShowFooterCalendar] = useState(false);
  const [availableYears, setAvailableYears] = useState(defaultYears);
  const [loading, setLoading] = useState(true);

  const t = translations[language] || translations.ru;

  const [teacher, setTeacher] = useState({
    id: currentTeacher.id,
    uid: currentTeacher.id,
    fullName: currentTeacher.fullName || translations.ru.teacherDefaultName,
    name: currentTeacher.fullName || translations.ru.teacherDefaultName,
    email: currentTeacher.email,
    phone: '',
    position: translations.ru.teacherDefaultPosition,
    department: translations.ru.department,
    role: 'teacher',
    photoUrl: '',
    avatar: '',
    bio: '',
    info: '',
    access: {}
  });

  const role = useMemo(() => normalizeRole(teacher.role), [teacher.role]);

  const teacherAccess = useMemo(
    () => buildEffectiveAccess(role, teacher.access || {}),
    [role, teacher.access]
  );

  const allowedMenus = useMemo(() => getAllowedMenus(teacherAccess), [teacherAccess]);

 const canEditSection = (sectionId) => {
  if (sectionId === 'reports') {
    return (
      hasAccess(teacherAccess, 'reports', 'edit') ||
      hasAccess(teacherAccess, 'reportsCurator', 'edit') ||
      hasAccess(teacherAccess, 'reportsDepartment', 'edit')
    );
  }

  return hasAccess(teacherAccess, sectionId, 'edit');
};

const canReadSection = (sectionId) => {
  if (sectionId === 'reports') {
    return (
      hasAccess(teacherAccess, 'reports', 'read') ||
      hasAccess(teacherAccess, 'reportsCurator', 'read') ||
      hasAccess(teacherAccess, 'reportsDepartment', 'read')
    );
  }

  return hasAccess(teacherAccess, sectionId, 'read');
};

const isMenuAllowed = (menuId) => {
  if (!menuId) return false;
  if (menuId === 'settings') return true;
  if (menuId === 'dashboard') return true;

  if (menuId === 'reports') {
    return canReadSection('reports');
  }

  return allowedMenus.includes(menuId);
};

  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [teacherFiles, setTeacherFiles] = useState([]);
  const [reports, setReports] = useState([]);
  const [practices, setPractices] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const teacherId = teacher.id || teacher.uid || currentTeacher.id;
  const teacherEmail = teacher.email || currentTeacher.email;
  const teacherName =
    teacher.fullName ||
    teacher.name ||
    teacher.displayName ||
    currentTeacher.fullName ||
    (role === 'lab' ? t.labDefaultName : t.teacherDefaultName);

  useEffect(() => {
    if (!isMenuAllowed(activeMenu)) {
      setActiveMenu('dashboard');
      setShowSettings(false);
    }
  }, [activeMenu, allowedMenus]);

  useEffect(() => {
    localStorage.setItem('teacherActiveMenu', activeMenu);
    setShowSettings(activeMenu === 'settings');
  }, [activeMenu]);

  useEffect(() => {
    localStorage.setItem('siteLanguage', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('academicYear', currentYear);
    setFooterSelectedDate(getDateFromAcademicYear(currentYear));
  }, [currentYear]);

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    document.body.classList.toggle('dark-mode', darkMode);

    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, [darkMode]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (footerCalendarRef.current && !footerCalendarRef.current.contains(event.target)) {
        setShowFooterCalendar(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowFooterCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!teacherId) {
      navigate('/login');
      return undefined;
    }

    const teacherDocRef = doc(db, 'users', teacherId);

    const unsubscribe = onSnapshot(
      teacherDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          navigate('/login');
          return;
        }

        const data = snapshot.data() || {};
        const currentRole = normalizeRole(data.role || 'teacher');
        const effectiveAccess = buildEffectiveAccess(currentRole, data.access || {});

        const preparedTeacher = {
          ...data,
          id: teacherId,
          uid: data.uid || teacherId,
          role: currentRole,
          fullName:
            data.fullName ||
            data.name ||
            data.displayName ||
            currentTeacher.fullName ||
            (currentRole === 'lab' ? t.labDefaultName : t.teacherDefaultName),
          name:
            data.name ||
            data.fullName ||
            data.displayName ||
            currentTeacher.fullName ||
            (currentRole === 'lab' ? t.labDefaultName : t.teacherDefaultName),
          email: data.email || currentTeacher.email,
          phone: data.phone || '',
          position:
            data.position ||
            (currentRole === 'lab' ? t.labDefaultPosition : t.teacherDefaultPosition),
          department: data.department || data.kafedra || t.department,
          photoUrl: data.photoUrl || data.avatar || '',
          avatar: data.avatar || data.photoUrl || '',
          bio: data.bio || data.info || '',
          info: data.info || data.bio || '',
          access: effectiveAccess
        };

        setTeacher(preparedTeacher);

        localStorage.setItem('teacherId', preparedTeacher.id);
        localStorage.setItem('teacherEmail', preparedTeacher.email || '');
        localStorage.setItem('teacherName', preparedTeacher.fullName || '');
        localStorage.setItem('userRole', preparedTeacher.role || 'teacher');
        localStorage.setItem('currentUser', JSON.stringify(preparedTeacher));
      },
      (error) => {
        console.error('Teacher profile load error:', error);
        navigate('/login');
      }
    );

    return () => unsubscribe();
  }, [
    teacherId,
    currentTeacher.email,
    currentTeacher.fullName,
    navigate,
    t.teacherDefaultName,
    t.teacherDefaultPosition,
    t.labDefaultName,
    t.labDefaultPosition,
    t.department
  ]);

  useEffect(() => {
    if (!teacherId) return undefined;

    const sessionKey = `teacher_online_saved_${teacherId}`;

    if (!sessionStorage.getItem(sessionKey)) {
      setDoc(
        doc(db, 'users', teacherId),
        {
          loginStatus: 'online',
          hasLoggedIn: true,
          lastLoginAt: Date.now(),
          updatedAt: Date.now()
        },
        { merge: true }
      )
        .then(() => sessionStorage.setItem(sessionKey, 'true'))
        .catch((error) => console.log('Teacher online status error:', error));
    }

    return undefined;
  }, [teacherId]);

  useEffect(() => {
    setLoading(true);

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const rows = firestoreSnapshotToArray(snapshot);

        setUsers(rows);
        setTeachers(
          rows.filter((item) =>
            ['teacher', 'lab', 'laborant', 'лаборант', 'admin'].includes(
              normalize(item.role || '')
            )
          )
        );
        setStudents(rows.filter((item) => normalize(item.role || '') === 'student'));
        setLoading(false);
      },
      (error) => {
        console.error('Users load error:', error);
        setLoading(false);
      }
    );

    const unsubGroups = onSnapshot(
      collection(db, 'groups'),
      (snapshot) => setGroups(firestoreSnapshotToArray(snapshot)),
      (error) => console.error('Groups load error:', error)
    );

    const unsubPrograms = onSnapshot(
      collection(db, 'programs'),
      (snapshot) =>
        setPrograms(firestoreSnapshotToArray(snapshot).map(normalizeFileFields)),
      (error) => console.error('Programs load error:', error)
    );

    const unsubDocuments = onSnapshot(
      collection(db, 'documents'),
      (snapshot) =>
        setDocuments(firestoreSnapshotToArray(snapshot).map(normalizeFileFields)),
      (error) => console.error('Documents load error:', error)
    );

    const unsubTeacherFiles = onSnapshot(
      collection(db, 'teacherFiles'),
      (snapshot) =>
        setTeacherFiles(firestoreSnapshotToArray(snapshot).map(normalizeFileFields)),
      (error) => console.error('Teacher files load error:', error)
    );

    const unsubReports = onSnapshot(
      collection(db, 'reports'),
      (snapshot) =>
        setReports(firestoreSnapshotToArray(snapshot).map(normalizeFileFields)),
      (error) => console.error('Reports load error:', error)
    );

    const unsubPractices = onSnapshot(
      collection(db, 'practices'),
      (snapshot) =>
        setPractices(firestoreSnapshotToArray(snapshot).map(normalizeFileFields)),
      (error) => console.error('Practices load error:', error)
    );

    const unsubAchievements = onSnapshot(
      collection(db, 'achievements'),
      (snapshot) =>
        setAchievements(firestoreSnapshotToArray(snapshot).map(normalizeFileFields)),
      (error) => console.error('Achievements load error:', error)
    );

    const unsubNotifications = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => setNotifications(firestoreSnapshotToArray(snapshot)),
      (error) => console.error('Notifications load error:', error)
    );

    const unsubActivityLogs = onSnapshot(
      collection(db, 'activityLogs'),
      (snapshot) => setActivityLogs(firestoreSnapshotToArray(snapshot)),
      (error) => console.error('Activity logs load error:', error)
    );

    const unsubAcademicYears = onSnapshot(
      doc(db, 'settings', 'academicYears'),
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data() || {};

        if (Array.isArray(data.years) && data.years.length > 0) {
          setAvailableYears(data.years);
        } else if (Array.isArray(data.studyYears) && data.studyYears.length > 0) {
          setAvailableYears(data.studyYears);
        } else if (Array.isArray(data.items) && data.items.length > 0) {
          setAvailableYears(data.items);
        }
      },
      (error) => console.error('Academic years load error:', error)
    );

    return () => {
      unsubUsers();
      unsubGroups();
      unsubPrograms();
      unsubDocuments();
      unsubTeacherFiles();
      unsubReports();
      unsubPractices();
      unsubAchievements();
      unsubNotifications();
      unsubActivityLogs();
      unsubAcademicYears();
    };
  }, []);

  const teacherFields = () => ({
    teacherId,
    teacherName,
    teacherEmail,

    ownerId: teacherId,
    ownerName: teacherName,
    ownerEmail: teacherEmail,

    senderId: teacherId,
    senderName: teacherName,
    senderEmail: teacherEmail,
    senderRole: role,

    createdBy: teacherId,
    createdByName: teacherName,
    createdByEmail: teacherEmail,
    createdByRole: role,

    uploadedById: teacherId,
    uploadedByName: teacherName,
    uploadedByEmail: teacherEmail,
    uploadedByRole: role,

    userId: teacherId,
    sourceCabinet: role,

    toAllTeachers: true,
    receiverType: 'all',
    receiverRole: 'all_teachers',
    targetRole: 'all_teachers',

    updatedAt: Date.now()
  });

  const isForCurrentTeacher = (item = {}) => {
    const currentId = normalize(teacherId);
    const currentEmail = normalize(teacherEmail);
    const currentName = normalize(teacherName);

    const receiverRole = normalize(item.receiverRole || item.targetRole || '');
    const receiverType = normalize(item.receiverType || '');
    const receiverId = normalize(
      item.receiverId || item.receiverTeacherId || item.toTeacherId || item.teacherId || ''
    );
    const receiverEmail = normalize(
      item.receiverEmail ||
        item.receiverTeacherEmail ||
        item.toTeacherEmail ||
        item.teacherEmail ||
        ''
    );
    const receiverName = normalize(
      item.receiverName ||
        item.receiverTeacherName ||
        item.toTeacherName ||
        item.teacherName ||
        ''
    );

    if (item.toAllTeachers === true) return true;
    if (receiverType === 'all') return true;
    if (receiverId === 'all_teachers') return true;
    if (receiverRole === 'allteachers' || receiverRole === 'all_teachers') return true;

    if (
      receiverRole &&
      receiverRole !== 'teacher' &&
      receiverRole !== 'lab' &&
      receiverRole !== 'laborant' &&
      receiverRole !== 'лаборант'
    ) {
      return false;
    }

    return (
      (currentId && receiverId && receiverId === currentId) ||
      (currentEmail && receiverEmail && receiverEmail === currentEmail) ||
      (currentName && receiverName && receiverName === currentName)
    );
  };

  const addActivityLog = async (text, icon = '✅', type = 'teacher', extra = {}) => {
    try {
      if (!teacherId) return;

      const logDocRef = doc(collection(db, 'activityLogs'));

      await setDoc(logDocRef, {
        id: logDocRef.id,
        icon,
        text,
        type,
        role,
        teacherId,
        teacherName,
        teacherEmail,
        ownerId: teacherId,
        senderId: teacherId,
        senderName: teacherName,
        senderEmail: teacherEmail,
        senderRole: role,
        userId: teacherId,
        createdAt: Date.now(),
        ...extra
      });
    } catch (error) {
      console.log('Activity log error:', error);
    }
  };

  const addNotification = async (payload = {}) => {
    try {
      const notificationDocRef = doc(collection(db, 'notifications'));

      await setDoc(notificationDocRef, {
        id: notificationDocRef.id,
        title: payload.title || t.notificationDefaultTitle,
        text: payload.text || t.notificationDefaultText,
        icon: payload.icon || '🔔',
        type: payload.type || 'info',
        isRead: false,
        readBy: {},
        senderId: teacherId,
        senderName: teacherName,
        senderEmail: teacherEmail,
        senderRole: role,
        createdAt: Date.now(),
        ...payload
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
    extra = {}
  }) => {
    await addNotification({
      title,
      text,
      icon,
      type,
      senderId: teacherId,
      senderName: teacherName,
      senderEmail: teacherEmail,
      senderRole: role,
      receiverRole: 'admin',
      receiverType: 'single',
      receiverId: ADMIN_ID,
      receiverName: t.adminDefaultName,
      receiverEmail: '',
      targetRole: 'admin',
      ...extra
    });
  };

  const availableGroups = useMemo(() => {
    const fromGroups = groups
      .map((item) => item.name || item.group || item.groupName)
      .filter(Boolean);

    const fromStudents = students
      .map((item) => item.group || item.groupName)
      .filter(Boolean);

    return Array.from(new Set([...fromGroups, ...fromStudents]));
  }, [groups, students]);

  const teacherPrograms = useMemo(() => {
    return programs
      .filter((item) => {
        const hasOwner =
          item.teacherId || item.teacherEmail || item.teacherName || item.ownerId || item.senderId;

        const byId =
          String(item.teacherId || item.ownerId || item.senderId || '') === String(teacherId);

        const byEmail =
          teacherEmail &&
          normalize(item.teacherEmail || item.email || item.senderEmail || '') ===
            normalize(teacherEmail);

        const byName =
          teacherName &&
          normalize(item.teacherName || item.senderName || '') === normalize(teacherName);

        const fromAdminForTeachers =
          item.senderRole === 'admin' ||
          item.createdByRole === 'admin' ||
          item.toAllTeachers === true ||
          item.receiverRole === 'teacher' ||
          item.receiverRole === 'lab' ||
          item.receiverType === 'all';

        return byId || byEmail || byName || !hasOwner || fromAdminForTeachers;
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [programs, teacherId, teacherEmail, teacherName]);

  const adminDocuments = useMemo(() => {
    return documents
      .filter((item) => {
        if (!item) return false;

        const senderRole = normalize(
          item.senderRole || item.createdByRole || item.uploadedByRole || item.role || ''
        );

        const fromAdmin =
          senderRole === 'admin' || item.adminId || item.adminName;

        const fromTeacherOrLab =
          senderRole === 'teacher' ||
          senderRole === 'lab' ||
          senderRole === 'laborant' ||
          senderRole === 'лаборант' ||
          item.teacherId ||
          item.ownerId ||
          item.senderId;

        const publicForCabinets =
          item.toAllTeachers === true ||
          item.receiverType === 'all' ||
          item.receiverRole === 'all_teachers' ||
          item.receiverRole === 'teacher' ||
          item.receiverRole === 'lab' ||
          item.targetRole === 'all_teachers' ||
          item.targetRole === 'teacher' ||
          item.targetRole === 'lab';

        return fromAdmin || fromTeacherOrLab || publicForCabinets || isForCurrentTeacher(item);
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [documents, teacherId, teacherEmail, teacherName]);

  const teacherPersonalFiles = useMemo(() => {
    return teacherFiles
      .filter((item) => {
        if (!item) return false;

        const senderRole = normalize(
          item.senderRole || item.createdByRole || item.uploadedByRole || item.role || ''
        );

        const byId =
          String(item.teacherId || item.ownerId || item.senderId || item.userId || '') ===
          String(teacherId);

        const byEmail =
          teacherEmail &&
          normalize(item.teacherEmail || item.email || item.senderEmail || '') ===
            normalize(teacherEmail);

        const byName =
          teacherName &&
          normalize(item.teacherName || item.senderName || '') === normalize(teacherName);

        const fromAnyCabinet =
          senderRole === 'admin' ||
          senderRole === 'teacher' ||
          senderRole === 'lab' ||
          senderRole === 'laborant' ||
          senderRole === 'лаборант' ||
          item.toAllTeachers === true ||
          item.receiverType === 'all';

        return byId || byEmail || byName || fromAnyCabinet || isForCurrentTeacher(item);
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [teacherFiles, teacherId, teacherEmail, teacherName]);

  const teacherReports = useMemo(() => {
    return reports
      .filter((item) => {
        if (!item) return false;
        if (item.parentReportId) return false;

        const senderRole = normalize(
          item.senderRole || item.fromRole || item.createdByRole || item.role || ''
        );

        const fromAdmin =
          senderRole === 'admin' ||
          Boolean(item.adminId) ||
          Boolean(item.adminName) ||
          item.canDeleteByTeacher === false;

        if (fromAdmin) return isForCurrentTeacher(item);

        const byId =
          String(item.teacherId || item.ownerId || item.senderId || '') === String(teacherId);

        const byEmail =
          teacherEmail &&
          normalize(item.teacherEmail || item.senderEmail || '') === normalize(teacherEmail);

        return byId || byEmail;
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [reports, teacherId, teacherEmail, teacherName]);

  const allowedPractices = useMemo(() => {
    return practices
      .filter((item) => {
        if (!item) return false;

        if (item.toAllTeachers === true || item.receiverType === 'all') return true;

        const senderRole = normalize(item.senderRole || item.createdByRole || item.uploadedByRole);

        const fromAnyCabinet =
          senderRole === 'admin' ||
          senderRole === 'teacher' ||
          senderRole === 'lab' ||
          item.teacherId ||
          item.ownerId ||
          item.senderId;

        return fromAnyCabinet || isForCurrentTeacher(item);
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [practices, teacherId, teacherEmail, teacherName]);

  const allowedAchievements = useMemo(() => {
    return achievements
      .filter((item) => {
        if (!item) return false;

        if (item.toAllTeachers === true || item.receiverType === 'all') return true;

        const byId =
          String(item.teacherId || item.ownerId || item.senderId || '') === String(teacherId);

        const byEmail =
          teacherEmail &&
          normalize(item.teacherEmail || item.senderEmail || '') === normalize(teacherEmail);

        const byName =
          teacherName &&
          normalize(item.teacherName || item.senderName || '') === normalize(teacherName);

        const fromAdmin =
          item.uploadedByRole === 'admin' ||
          item.createdByRole === 'admin' ||
          item.senderRole === 'admin';

        return byId || byEmail || byName || fromAdmin || !item.teacherId || isForCurrentTeacher(item);
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [achievements, teacherId, teacherEmail, teacherName]);

  const teacherNotifications = useMemo(() => {
    return notifications
      .filter((item) => {
        if (!item) return false;

        const receiverRole = normalize(item.receiverRole || item.targetRole || '');

        if (
          receiverRole !== 'teacher' &&
          receiverRole !== 'lab' &&
          receiverRole !== 'laborant' &&
          receiverRole !== 'лаборант' &&
          receiverRole !== 'allteachers' &&
          receiverRole !== 'all_teachers'
        ) {
          return false;
        }

        return isForCurrentTeacher(item);
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [notifications, teacherId, teacherEmail, teacherName]);

  const unreadCount = useMemo(() => {
    const safeTeacherField = safeFieldKey(teacherId);

    return teacherNotifications.filter((item) => {
      if (item.readBy && item.readBy[safeTeacherField]) return false;
      if (item.readBy && item.readBy[teacherId]) return false;
      return !item.isRead;
    }).length;
  }, [teacherNotifications, teacherId]);

  const recentActions = useMemo(() => {
    return activityLogs
      .filter((item) => {
        if (!item) return false;

        const itemTeacherId = item.teacherId || item.ownerId || item.senderId || item.userId || '';
        const itemTeacherEmail = item.teacherEmail || item.email || item.senderEmail || '';

        const byId = teacherId && String(itemTeacherId) === String(teacherId);
        const byEmail = teacherEmail && normalize(itemTeacherEmail) === normalize(teacherEmail);
        const publicAction = item.toAllTeachers === true || item.receiverType === 'all';

        return byId || byEmail || publicAction;
      })
      .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [activityLogs, teacherId, teacherEmail]);

  const stats = useMemo(
    () => ({
      students: students.length,
      groups: availableGroups.length,
      programs: teacherPrograms.length,
      documents: adminDocuments.length,
      reports: teacherReports.length,
      practices: allowedPractices.length,
      achievements: allowedAchievements.length,
      files: teacherPersonalFiles.length,
      teacherFiles: teacherPersonalFiles.length,
      teachers: teachers.length
    }),
    [
      students.length,
      availableGroups.length,
      teacherPrograms.length,
      adminDocuments.length,
      teacherReports.length,
      allowedPractices.length,
      allowedAchievements.length,
      teacherPersonalFiles.length,
      teachers.length
    ]
  );
const activityData = useMemo(() => {
  const actions = Array.isArray(recentActions) ? recentActions : [];
  const now = new Date();

  const weekLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const week = weekLabels.map((label) => ({
    label,
    value: 0
  }));

  actions.forEach((action) => {
    const date = new Date(action.createdAt || action.date || action.updatedAt);

    if (Number.isNaN(date.getTime())) return;

    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays > 6) return;

    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

    week[dayIndex].value += 1;
  });

  const month = [
    { label: '1 нед', value: 0 },
    { label: '2 нед', value: 0 },
    { label: '3 нед', value: 0 },
    { label: '4 нед', value: 0 }
  ];

  actions.forEach((action) => {
    const date = new Date(action.createdAt || action.date || action.updatedAt);

    if (Number.isNaN(date.getTime())) return;

    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays > 30) return;

    const reverseWeekIndex = Math.min(3, Math.floor(diffDays / 7));
    const weekIndex = 3 - reverseWeekIndex;

    month[weekIndex].value += 1;
  });

  const year = [
    { label: 'Янв', value: 0 },
    { label: 'Фев', value: 0 },
    { label: 'Мар', value: 0 },
    { label: 'Апр', value: 0 },
    { label: 'Май', value: 0 },
    { label: 'Июн', value: 0 },
    { label: 'Июл', value: 0 },
    { label: 'Авг', value: 0 },
    { label: 'Сен', value: 0 },
    { label: 'Окт', value: 0 },
    { label: 'Ноя', value: 0 },
    { label: 'Дек', value: 0 }
  ];

  actions.forEach((action) => {
    const date = new Date(action.createdAt || action.date || action.updatedAt);

    if (Number.isNaN(date.getTime())) return;

    if (date.getFullYear() !== now.getFullYear()) return;

    year[date.getMonth()].value += 1;
  });

  return {
    week,
    month,
    year
  };
}, [recentActions]);
 

    const saveRows = async (collectionName, rows = [], extra = {}) => {
  const batch = writeBatch(db);
  const now = Date.now();

  rows.forEach((row) => {
    if (!rowHasData(row)) return;

    const cleanRow = normalizeFileFields(row);

    const existingId =
      cleanRow.id &&
      !String(cleanRow.id).includes('_new_') &&
      !String(cleanRow.id).startsWith('new_')
        ? String(cleanRow.id)
        : '';

    const rowDocRef = existingId
      ? doc(db, collectionName, existingId)
      : doc(collection(db, collectionName));

    const prepared = removeUndefinedFields({
      ...cleanRow,
      ...extra,
      id: rowDocRef.id,
      collectionName,
      year: cleanRow.year || currentYear,
      updatedAt: now,
      createdAt: cleanRow.createdAt || now
    });

    delete prepared.isNew;

    batch.set(rowDocRef, prepared, { merge: true });
  });

  await batch.commit();
}; 

  const savePrograms = async (rows = []) => {
    if (!canEditSection('programs')) return;

    await saveRows('programs', rows, {
      ...teacherFields(),
      category: 'program',
      documentType: 'program',
      type: 'program',
      createdByRole: role,
      uploadedByRole: role,
      senderRole: role
    });

    await addNotificationToAdmin({
      title: t.adminProgramNotificationTitle,
      text: `${t.adminProgramNotificationText}: ${teacherName}`,
      icon: '📘',
      type: 'program',
      extra: { programSenderId: teacherId, sourceCabinet: role }
    });

    await addActivityLog(t.programsSaved, '📘', 'program', {
      receiverRole: 'admin',
      receiverId: ADMIN_ID
    });
  };

  const saveDocuments = async (rows = []) => {
    if (!canEditSection('documents')) return;

    await saveRows('documents', rows, {
      ...teacherFields(),
      category: 'document',
      documentType: 'document',
      type: 'document',
      createdByRole: role,
      uploadedByRole: role,
      senderRole: role
    });

    await addNotificationToAdmin({
      title: t.adminDocumentNotificationTitle,
      text: `${t.adminDocumentNotificationText}: ${teacherName}`,
      icon: '📄',
      type: 'document',
      extra: { documentSenderId: teacherId, sourceCabinet: role }
    });

    await addActivityLog(t.documentsSaved, '📄', 'document', {
      receiverRole: 'admin',
      receiverId: ADMIN_ID
    });
  };

  const saveTeacherFiles = async (rows = []) => {
    if (!canEditSection('teacherFiles')) return;

    await saveRows('teacherFiles', rows, {
      ...teacherFields(),
      category: 'teacherFile',
      documentType: 'teacherFile',
      fileType: 'teacherFile',
      type: 'teacherFile',
      createdByRole: role,
      uploadedByRole: role,
      senderRole: role
    });

    await addNotificationToAdmin({
      title: t.adminFileNotificationTitle,
      text: `${t.adminFileNotificationText}: ${teacherName}`,
      icon: '📁',
      type: 'teacher-file',
      extra: { fileSenderId: teacherId, sourceCabinet: role }
    });

    await addActivityLog(t.filesSaved, '📁', 'teacher-file', {
      receiverRole: 'admin',
      receiverId: ADMIN_ID
    });
  };

  const saveReports = async (rows = []) => {
  const canEditReports =
    canEditSection('reports') ||
    canEditSection('reportsCurator') ||
    canEditSection('reportsDepartment');

  if (!canEditReports) return;

    await saveRows('reports', rows, {
      ...teacherFields(),
      category: 'report',
      documentType: 'report',
      type: 'report',
      senderId: teacherId,
      senderName: teacherName,
      senderEmail: teacherEmail,
      senderRole: role,
      receiverRole: 'admin',
      receiverType: 'single',
      receiverId: ADMIN_ID,
      receiverName: t.adminDefaultName,
      targetRole: 'admin',
      toAllTeachers: false,
      readByTeacher: true,
      readByAdmin: false,
      status: 'sent'
    });

    await addNotificationToAdmin({
      title: t.adminReportNotificationTitle,
      text: `${t.adminReportNotificationText}: ${teacherName}`,
      icon: '📊',
      type: 'report',
      extra: { reportSenderId: teacherId, sourceCabinet: role }
    });

    await addActivityLog(t.reportsSaved, '📊', 'report', {
      receiverRole: 'admin',
      receiverId: ADMIN_ID
    });
  };

  const savePractices = async (rows = []) => {
    if (!canEditSection('practices')) return;

    await saveRows('practices', rows, {
      ...teacherFields(),
      category: 'practice',
      documentType: 'practice',
      type: 'practice',
      createdByRole: role,
      uploadedByRole: role,
      senderRole: role
    });

    await addNotificationToAdmin({
      title: t.adminPracticeNotificationTitle,
      text: `${t.adminPracticeNotificationText}: ${teacherName}`,
      icon: '🧳',
      type: 'practice',
      extra: { practiceSenderId: teacherId, sourceCabinet: role }
    });

    await addActivityLog(t.practicesSaved, '🧳', 'practice', {
      receiverRole: 'admin',
      receiverId: ADMIN_ID
    });
  };

  const saveAchievements = async (rows = []) => {
    if (!canEditSection('achievements')) return;

    await saveRows('achievements', rows, {
      ...teacherFields(),
      category: 'achievement',
      documentType: 'achievement',
      type: 'achievement',
      createdByRole: role,
      uploadedByRole: role,
      senderRole: role
    });

    await addNotificationToAdmin({
      title: t.adminAchievementNotificationTitle,
      text: `${t.adminAchievementNotificationText}: ${teacherName}`,
      icon: '🏆',
      type: 'achievement',
      extra: { achievementSenderId: teacherId, sourceCabinet: role }
    });

    await addActivityLog(t.achievementsSaved, '🏆', 'achievement', {
      receiverRole: 'admin',
      receiverId: ADMIN_ID
    });
  };

  const createReportReply = async (reportOrPayload, replyData = {}) => {
    if (!canEditSection('reports')) return false;

    const isPayloadOnly =
      reportOrPayload &&
      typeof reportOrPayload === 'object' &&
      (reportOrPayload.parentReportId || reportOrPayload.reportId) &&
      !replyData.reportId;

    const report = isPayloadOnly ? {} : reportOrPayload || {};
    const payloadSource = isPayloadOnly ? reportOrPayload : replyData;
    const reportId = payloadSource.reportId || payloadSource.parentReportId || report.id || '';

    if (!reportId) {
      alert(t.reportNotFound);
      return false;
    }

    const answerDocRef = doc(db, 'reports', reportId, 'answers', teacherId);

    const payload = removeUndefinedFields({
      id: teacherId,
      reportId,
      parentReportId: reportId,
      parentReportTitle: payloadSource.parentReportTitle || report.title || '',
      title:
        payloadSource.title ||
        `${t.replyPrefix}: ${payloadSource.parentReportTitle || report.title || ''}`,
      description: payloadSource.description || payloadSource.text || '',
      text: payloadSource.text || payloadSource.description || '',
      fileUrl: payloadSource.fileUrl || payloadSource.pdfUrl || payloadSource.url || '',
      pdfUrl: payloadSource.pdfUrl || payloadSource.fileUrl || payloadSource.url || '',
      url: payloadSource.url || payloadSource.fileUrl || payloadSource.pdfUrl || '',
      fileName: payloadSource.fileName || '',
      fileType: payloadSource.fileType || '',
      fileSize: Number(payloadSource.fileSize || 0),
      publicId: payloadSource.publicId || '',
      resourceType: payloadSource.resourceType || '',
      senderRole: role,
      senderId: teacherId,
      senderName: teacherName,
      senderEmail: teacherEmail,
      teacherId,
      teacherName,
      teacherEmail,
      receiverRole: 'admin',
      receiverType: 'single',
      receiverId: ADMIN_ID,
      receiverName: t.adminDefaultName,
      targetRole: 'admin',
      status: 'sent',
      readByTeacher: true,
      readByAdmin: false,
      createdAt: payloadSource.createdAt || Date.now(),
      updatedAt: Date.now(),
      date: payloadSource.date || new Date().toISOString().slice(0, 10)
    });

    await setDoc(answerDocRef, payload, { merge: true });

    const safeTeacherField = safeFieldKey(teacherId);

    await setDoc(
      doc(db, 'reports', reportId),
      {
        [`answeredBy.${safeTeacherField}`]: {
          teacherId,
          teacherName,
          teacherEmail,
          answeredAt: Date.now()
        },
        hasAnswer: true,
        lastReplyAt: Date.now(),
        lastReplyBy: teacherName,
        updatedAt: Date.now()
      },
      { merge: true }
    );

    await addNotificationToAdmin({
      title: t.adminReplyNotificationTitle,
      text: `${t.adminReplyNotificationText}: ${teacherName}`,
      icon: '📊',
      type: 'report-reply',
      extra: { reportId, answerTeacherId: teacherId }
    });

    await addActivityLog(t.reportReplySent, '📊', 'report-reply', {
      receiverRole: 'admin',
      receiverId: ADMIN_ID,
      reportId
    });

    return true;
  };

  const saveTeacherProfile = async (profile = {}) => {
    if (!teacherId) return false;

    try {
      const preparedProfile = removeUndefinedFields({
        ...profile,
        id: teacherId,
        uid: profile.uid || teacher.uid || teacherId,
        role,
        fullName: profile.fullName || profile.name || teacherName || t.teacherDefaultName,
        name: profile.name || profile.fullName || teacherName || t.teacherDefaultName,
        email: profile.email || teacherEmail,
        position:
          profile.position ||
          (role === 'lab' ? t.labDefaultPosition : t.teacherDefaultPosition),
        department: profile.department || t.department,
        photoUrl: profile.photoUrl || profile.avatar || '',
        avatar: profile.avatar || profile.photoUrl || '',
        bio: profile.bio || profile.info || '',
        info: profile.info || profile.bio || '',
        access: teacherAccess,
        updatedAt: Date.now()
      });

      await setDoc(doc(db, 'users', teacherId), preparedProfile, { merge: true });

      setTeacher((prev) => ({
        ...prev,
        ...preparedProfile
      }));

      localStorage.setItem('currentUser', JSON.stringify({ ...teacher, ...preparedProfile }));
      localStorage.setItem('teacherId', teacherId);
      localStorage.setItem('teacherEmail', preparedProfile.email || '');
      localStorage.setItem('teacherName', preparedProfile.fullName || '');
      localStorage.setItem('userRole', preparedProfile.role || 'teacher');

      await addActivityLog(t.profileSaved, '👤', 'profile');

      return true;
    } catch (error) {
      alert(`${t.error}${error.message}`);
      return false;
    }
  };

  const handleDelete = async (type, id) => {
    if (!id) return;

    const map = {
      program: {
        path: 'programs',
        confirm: t.deleteProgramConfirm,
        allowed: canEditSection('programs')
      },
      document: {
        path: 'documents',
        confirm: t.deleteDocumentConfirm,
        allowed: canEditSection('documents')
      },
      teacherFile: {
        path: 'teacherFiles',
        confirm: t.deleteFileConfirm,
        allowed: canEditSection('teacherFiles')
      },
      file: {
        path: 'teacherFiles',
        confirm: t.deleteFileConfirm,
        allowed: canEditSection('teacherFiles')
      },
     report: {
  path: 'reports',
  confirm: t.deleteReportConfirm,
  allowed:
    canEditSection('reports') ||
    canEditSection('reportsCurator') ||
    canEditSection('reportsDepartment')
},
      practice: {
        path: 'practices',
        confirm: t.deletePracticeConfirm,
        allowed: canEditSection('practices')
      },
      achievement: {
        path: 'achievements',
        confirm: t.deleteAchievementConfirm,
        allowed: canEditSection('achievements')
      }
    };

    const config = map[type];

    if (!config || !config.allowed) return;

    if (!window.confirm(config.confirm || t.deleteConfirm)) return;

    await deleteDoc(doc(db, config.path, id));
    await addActivityLog(t.dataDeleted, '🗑️', type);
  };

  const markNotificationRead = async (id) => {
    if (!id || !teacherId) return;

    const safeTeacherField = safeFieldKey(teacherId);

    await setDoc(
      doc(db, 'notifications', id),
      {
        [`readBy.${safeTeacherField}`]: true,
        isRead: true,
        readAt: Date.now()
      },
      { merge: true }
    );
  };

  const markAllRead = async () => {
    if (!teacherId) return;

    const batch = writeBatch(db);
    const safeTeacherField = safeFieldKey(teacherId);

    teacherNotifications.forEach((item) => {
      if (!item.id) return;

      batch.set(
        doc(db, 'notifications', item.id),
        {
          [`readBy.${safeTeacherField}`]: true,
          isRead: true,
          readAt: Date.now()
        },
        { merge: true }
      );
    });

    await batch.commit();
  };

  const markReportRead = async (id) => {
    if (!id || !teacherId) return;

    const safeTeacherField = safeFieldKey(teacherId);

    await setDoc(
      doc(db, 'reports', id),
      {
        [`readBy.${safeTeacherField}`]: true,
        [`readAtBy.${safeTeacherField}`]: Date.now()
      },
      { merge: true }
    );
  };

  const handleLogout = async () => {
    if (teacherId) {
      await setDoc(
        doc(db, 'users', teacherId),
        {
          loginStatus: 'offline',
          lastLogoutAt: Date.now(),
          updatedAt: Date.now()
        },
        { merge: true }
      ).catch(() => {});
    }

    localStorage.removeItem('teacherId');
    localStorage.removeItem('teacherName');
    localStorage.removeItem('teacherEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('teacherActiveMenu');

    sessionStorage.removeItem(`teacher_online_saved_${teacherId}`);

    navigate('/login');
  };

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
  };

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const openSection = (menu) => {
    const nextMenu = menu === 'profile' ? 'dashboard' : menu;

    if (!isMenuAllowed(nextMenu)) {
      setShowSettings(false);
      setActiveMenu('dashboard');
      return;
    }

    setShowSettings(false);
    setActiveMenu(nextMenu);
  };

  const openSettings = (value = true) => {
    setShowSettings(value);

    if (value) {
      setActiveMenu('settings');
    } else if (activeMenu === 'settings') {
      setActiveMenu('dashboard');
    }
  };

  const handleFooterDateChange = (date) => {
    if (!date) return;

    const nextAcademicYear = getAcademicYearFromDate(date);

    setFooterSelectedDate(date);
    setCurrentYear(nextAcademicYear);
    setShowFooterCalendar(false);

    if (!availableYears.includes(nextAcademicYear)) {
      setAvailableYears((prev) => Array.from(new Set([...prev, nextAcademicYear])));
    }
  };

  const getMonthTitle = (date) => {
    const months = monthNames[language] || monthNames.ru;
    return `${months[date.getMonth()] || ''} ${date.getFullYear()}`;
  };

  const SettingsPage = () => (
  <div className="teacher-settings-page">
    <div className="teacher-settings-shell">
      <div className="teacher-settings-header">
        <h2>{t.settingsTitle || 'Настройки портала'}</h2>
        <p>{t.settingsSubtitle || 'Язык, тема'}</p>
      </div>

      <div className="teacher-settings-grid">
        <div className="teacher-settings-box">
          <h3>{t.interfaceLanguage || 'Язык интерфейса'}</h3>

          <div className="teacher-settings-buttons">
            {['kg', 'ru', 'en'].map((item) => (
              <button
                key={item}
                type="button"
                className={`teacher-settings-btn ${language === item ? 'active' : ''}`}
                onClick={() => handleLanguageChange(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="teacher-settings-box">
          <h3>{t.themeMode || 'Тема интерфейса'}</h3>

          <div className="teacher-settings-buttons">
            <button
              type="button"
              className={`teacher-settings-btn theme ${darkMode ? 'active' : ''}`}
              onClick={() => setDarkMode((prev) => !prev)}
            >
              {darkMode
                ? t.lightTheme || 'Светлая тема'
                : t.darkTheme || 'Темная тема'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

  const AccessDeniedPage = () => (
    <div className="dashboard-card modern-card">
      <h2>{t.accessDeniedTitle}</h2>
      <p>{t.accessDeniedText}</p>
    </div>
  );

  const renderFooterCalendar = () => (
    <footer className="teacher-footer">
      <span>{t.department}</span>

      <div className="teacher-footer-year-wrap" ref={footerCalendarRef}>
        <button
          type="button"
          className="footer-year-button"
          title={t.academicYear}
          onClick={() => setShowFooterCalendar((prev) => !prev)}
        >
          <CalendarDays size={15} strokeWidth={2.4} />
          <span>{currentYear}</span>
        </button>

        {showFooterCalendar && (
          <div className="teacher-footer-calendar-card">
            <div className="teacher-calendar-head">
              <div>
                <h3>{t.calendar}</h3>
              </div>

              <button
                type="button"
                className="teacher-calendar-close"
                onClick={() => setShowFooterCalendar(false)}
              >
                <X size={20} strokeWidth={2.4} />
              </button>
            </div>

            <div className="teacher-calendar-divider" />

            <DatePicker
              selected={footerSelectedDate}
              onChange={handleFooterDateChange}
              inline
              locale="ru"
              calendarStartDay={1}
              dateFormat="dd.MM.yyyy"
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                changeMonth,
                changeYear
              }) => (
                <div className="teacher-datepicker-custom-head">
                  <button
                    type="button"
                    className="teacher-datepicker-arrow"
                    onClick={decreaseMonth}
                  >
                    ‹
                  </button>

                  <div className="teacher-datepicker-center">
                    <strong>{getMonthTitle(date)}</strong>

                    <div className="teacher-datepicker-selects">
                      <select
                        value={date.getMonth()}
                        onChange={(event) => changeMonth(Number(event.target.value))}
                      >
                        {(monthNames[language] || monthNames.ru).map((month, index) => (
                          <option key={month} value={index}>
                            {month}
                          </option>
                        ))}
                      </select>

                      <select
                        value={date.getFullYear()}
                        onChange={(event) => changeYear(Number(event.target.value))}
                      >
                        {Array.from(
                          { length: 14 },
                          (_, i) => new Date().getFullYear() - 6 + i
                        ).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="teacher-datepicker-arrow"
                    onClick={increaseMonth}
                  >
                    ›
                  </button>
                </div>
              )}
            />

            <div className="teacher-calendar-selected">
              <span>{t.selectedDate}:</span>
              <strong>{formatDate(footerSelectedDate)}</strong>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
  const renderContent = () => {
    if (showSettings || activeMenu === 'settings') {
      return <SettingsPage />;
    }

    if (!isMenuAllowed(activeMenu)) {
      return <AccessDeniedPage />;
    }

    if (activeMenu === 'schedule') {
  return (
    <SchedulePage
      mode={role}
      role={role}
      readOnly={!canEditSection('schedule')}
      readonly={!canEditSection('schedule')}

      teacher={teacher}
      teacherId={teacherId}
      teacherName={teacherName}
      teacherEmail={teacherEmail}

      teachers={teachers}
      users={users}
      students={students}
      groups={groups}
      availableGroups={availableGroups}

      language={language}
      currentYear={currentYear}
      t={t}

      teacherAccess={teacherAccess}
      canEditSection={canEditSection}
      canReadSection={canReadSection}
    />
  );
}

    if (activeMenu === 'plans') {
      return (
        <CurriculumPlanPage
          mode={role}
          role={role}
          readOnly={!canEditSection('plans')}
          readonly={!canEditSection('plans')}
          teacher={teacher}
          teacherId={teacherId}
          language={language}
          currentYear={currentYear}
          t={t}
          teacherAccess={teacherAccess}
          canEditSection={canEditSection}
        />
      );
    }

    return (
      <TeacherDashboardContent
        activeMenu={activeMenu}
        setActiveMenu={openSection}
        teacher={teacher}
        teachers={canReadSection('teachers') ? teachers : []}
        users={users}
        students={canReadSection('students') ? students : []}
        groups={groups}
        availableGroups={availableGroups}
        programs={canReadSection('programs') ? teacherPrograms : []}
        documents={canReadSection('documents') ? adminDocuments : []}
        teacherFiles={canReadSection('teacherFiles') ? teacherPersonalFiles : []}
        files={canReadSection('teacherFiles') ? teacherPersonalFiles : []}
        reports={
          canReadSection('reports') ||
          canReadSection('reportsCurator') ||
          canReadSection('reportsDepartment')
            ? teacherReports
            : []
        }
        practices={canReadSection('practices') ? allowedPractices : []}
        achievements={canReadSection('achievements') ? allowedAchievements : []}
        recentActions={recentActions}
        activityData={activityData}
        stats={stats}
        loading={loading}
        currentYear={currentYear}
        language={language}
        t={t}
        onSavePrograms={canEditSection('programs') ? savePrograms : undefined}
        onSaveDocuments={canEditSection('documents') ? saveDocuments : undefined}
        onSaveTeacherFiles={canEditSection('teacherFiles') ? saveTeacherFiles : undefined}
        onSaveReports={canEditSection('reports') ? saveReports : undefined}
        onSavePractices={canEditSection('practices') ? savePractices : undefined}
        onSaveAchievements={canEditSection('achievements') ? saveAchievements : undefined}
        onCreateReportReply={createReportReply}
        onReplyReport={createReportReply}
        onSaveTeacherProfile={saveTeacherProfile}
        handleDelete={handleDelete}
        onDelete={handleDelete}
        markReportRead={markReportRead}
        teacherRole={role}
        userRole={role}
        teacherAccess={teacherAccess}
        allowedMenus={allowedMenus}
        canEditSection={canEditSection}
        canReadSection={canReadSection}
      />
    );
  };

  if (loading && !teacherId) {
    return <div className="teacher-loading">{t.loading}</div>;
  }

  return (
    <div className={`teacher-dashboard admin-dashboard ${darkMode ? 'dark' : ''}`}>
      <TeacherSidebar
        activeMenu={activeMenu}
        setActiveMenu={openSection}
        setShowSettings={openSettings}
        t={t}
        teacher={teacher}
        userRole={role}
        teacherAccess={teacherAccess}
        allowedMenus={allowedMenus}
      />

      <main className="teacher-main admin-main">
        <TeacherTopbar
          t={t}
          teacherProfile={teacher}
          teacher={teacher}
          onSaveProfile={saveTeacherProfile}
          activeMenu={activeMenu}
          setActiveMenu={openSection}
          currentYear={currentYear}
          onYearChange={setCurrentYear}
          availableYears={availableYears}
          language={language}
          onLanguageChange={handleLanguageChange}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          notifications={teacherNotifications}
          unreadCount={unreadCount}
          onMarkRead={markNotificationRead}
          onMarkAllRead={markAllRead}
          setShowSettings={openSettings}
          openProfileModal={() => openSection('dashboard')}
          onLogout={handleLogout}
        />

        <div className="dashboard-content teacher-content teacher-content-shell">
          {renderContent()}
        </div>

        {renderFooterCalendar()}
      </main>
    </div>
  );
};

export default TeacherDashboard;