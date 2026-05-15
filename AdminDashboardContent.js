// src/components/Admin/AdminDashboardContent.js

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Save,
  X,
  Trash2,
  Eye,
  Users,
  UserRoundCog,
  GraduationCap,
  FileText,
  FolderOpen,
  BarChart3,
  Download,
  ShieldCheck,
  Award,
  BriefcaseBusiness,
  Activity,
  Clock3,
  User
} from 'lucide-react';

import { uploadFileToCloudinary } from '../../utils/cloudinaryUpload';
import './AdminDashboard.css';

const makeId = (prefix = 'row') =>
  `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const lower = (value) => String(value || '').toLowerCase();

const extractUrl = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    return (
      value.fileUrl ||
      value.secure_url ||
      value.downloadUrl ||
      value.pdfUrl ||
      value.url ||
      ''
    );
  }

  return '';
};

const getSafeFileUrl = (row = {}) =>
  extractUrl(row.fileUrl) ||
  extractUrl(row.secure_url) ||
  extractUrl(row.downloadUrl) ||
  extractUrl(row.pdfUrl) ||
  extractUrl(row.url) ||
  extractUrl(row.resumeUrl) ||
  extractUrl(row.resumePdfUrl) ||
  '';

const getSafeFileName = (row = {}) => {
  const fileUrl = getSafeFileUrl(row);
  const fromUrl = fileUrl
    ? decodeURIComponent(fileUrl.split('/').pop()?.split('?')[0] || '')
    : '';

  return (
    row.fileName ||
    row.originalName ||
    row.original_filename ||
    row.publicId ||
    row.public_id ||
    fromUrl ||
    ''
  );
};

const cleanFileData = (row = {}) => {
  const fileUrl = getSafeFileUrl(row);
  const fileName = getSafeFileName(row);

  return {
    ...row,
    fileUrl,
    fileName,
    pdfUrl: row.pdfUrl && row.pdfUrl !== fileUrl ? row.pdfUrl : '',
    url: row.url && row.url !== fileUrl ? row.url : '',
    fileType: row.fileType || row.mimeType || '',
    fileSize: Number(row.fileSize || row.size || 0),
    publicId: row.publicId || row.public_id || '',
    resourceType: row.resourceType || ''
  };
};

const normalizeRows = (items = [], prefix = 'row') => {
  if (Array.isArray(items)) {
    return items.map((item, index) => ({
      id: item?.id || item?.key || `${prefix}_${index}`,
      ...(item || {})
    }));
  }

  return Object.entries(items || {}).map(([id, value]) => ({
    id,
    ...(value || {})
  }));
};

const isNewId = (id = '') => String(id).startsWith('new_');

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('ru-RU');
};

const getPersonName = (item, fallback = '-') =>
  item?.fullName || item?.name || item?.displayName || item?.email || fallback;

const normalizeRole = (value = '') => {
  const role = String(value || '').trim().toLowerCase();

  if (role === 'admin' || role === 'администратор') return 'admin';
  if (role === 'lab' || role === 'laborant' || role === 'лаборант') return 'lab';
  if (role === 'student' || role === 'студент') return 'student';

  return 'teacher';
};

const positionToRole = (position = '') => {
  const value = String(position || '').trim().toLowerCase();

  if (value.includes('администратор') || value.includes('admin')) return 'admin';
  if (value.includes('лаборант') || value.includes('lab') || value.includes('laborant')) return 'lab';
  if (value.includes('студент') || value.includes('student')) return 'student';

  return 'teacher';
};

const getUserRole = (user = {}) => {
  if (user?.role) return normalizeRole(user.role);
  return positionToRole(user?.position || 'Преподаватель');
};

const normalizeAccessValue = (value = 'none') => {
  const access = String(value || '').trim().toLowerCase();

  if (
    access === 'read' ||
    access === 'view' ||
    access === 'readonly' ||
    access === 'просмотр' ||
    access === 'только просмотр' ||
    access === 'читать'
  ) {
    return 'read';
  }

  if (
    access === 'edit' ||
    access === 'write' ||
    access === 'редактирование' ||
    access === 'редактировать' ||
    access === 'изменить'
  ) {
    return 'edit';
  }

  return 'none';
};

const ACCESS_SECTIONS = [
  { id: 'users', labelRu: 'Пользователи', labelKg: 'Колдонуучулар', labelEn: 'Users', roles: ['admin', 'teacher', 'lab'] },
  { id: 'teachers', labelRu: 'Преподаватели', labelKg: 'Окутуучулар', labelEn: 'Teachers', roles: ['admin', 'teacher', 'lab'] },
  { id: 'students', labelRu: 'Студенты', labelKg: 'Студенттер', labelEn: 'Students', roles: ['admin', 'teacher', 'lab'] },
  { id: 'schedule', labelRu: 'Расписание', labelKg: 'Расписание', labelEn: 'Schedule', roles: ['admin', 'teacher', 'lab'] },
  { id: 'plans', labelRu: 'Нагрузка', labelKg: 'Нагрузка', labelEn: 'Workload', roles: ['admin', 'teacher', 'lab'] },
  { id: 'programs', labelRu: 'Рабочие программы', labelKg: 'Жумушчу программалар', labelEn: 'Work programs', roles: ['admin', 'teacher', 'lab'] },
  { id: 'documents', labelRu: 'Документы', labelKg: 'Документтер', labelEn: 'Documents', roles: ['admin', 'teacher', 'lab'] },
  { id: 'teacherFiles', labelRu: 'Личная папка', labelKg: 'Жеке папка', labelEn: 'Personal folder', roles: ['admin', 'teacher', 'lab'] },
  { id: 'reportsCurator', labelRu: 'Кураторский отчет', labelKg: 'Куратордук отчет', labelEn: 'Curator report', roles: ['admin', 'teacher', 'lab'] },
  { id: 'reportsDepartment', labelRu: 'Кафедральный отчет', labelKg: 'Кафедралык отчет', labelEn: 'Department report', roles: ['admin', 'teacher', 'lab'] },
  { id: 'practices', labelRu: 'Практика', labelKg: 'Практика', labelEn: 'Practice', roles: ['admin', 'teacher', 'lab'] },
  { id: 'achievements', labelRu: 'Достижения', labelKg: 'Жетишкендиктер', labelEn: 'Achievements', roles: ['admin', 'teacher', 'lab'] }
];

const ACCESS_BASE_BY_ROLE = {
  admin: {
    users: 'edit',
    teachers: 'edit',
    students: 'edit',
    schedule: 'edit',
    plans: 'edit',
    programs: 'edit',
    documents: 'edit',
    teacherFiles: 'edit',
    reportsCurator: 'edit',
    reportsDepartment: 'edit',
    practices: 'edit',
    achievements: 'edit'
  },
  teacher: {
    users: 'none',
    teachers: 'none',
    students: 'none',
    schedule: 'read',
    plans: 'read',
    programs: 'edit',
    documents: 'read',
    teacherFiles: 'edit',
    reportsCurator: 'none',
    reportsDepartment: 'none',
    practices: 'none',
    achievements: 'none'
  },
  lab: {
    users: 'none',
    teachers: 'read',
    students: 'read',
    schedule: 'read',
    plans: 'none',
    programs: 'none',
    documents: 'none',
    teacherFiles: 'none',
    reportsCurator: 'none',
    reportsDepartment: 'none',
    practices: 'none',
    achievements: 'none'
  },
  student: {
    users: 'none',
    teachers: 'none',
    students: 'none',
    schedule: 'none',
    plans: 'none',
    programs: 'none',
    documents: 'none',
    teacherFiles: 'none',
    reportsCurator: 'none',
    reportsDepartment: 'none',
    practices: 'none',
    achievements: 'none'
  }
};

const getAccessSectionsByRole = (role = 'teacher') => {
  const normalizedRole = normalizeRole(role);
  return ACCESS_SECTIONS.filter((section) => section.roles.includes(normalizedRole));
};

const buildDefaultAccess = (role = 'teacher') => {
  const normalizedRole = normalizeRole(role);
  const base = ACCESS_BASE_BY_ROLE[normalizedRole] || ACCESS_BASE_BY_ROLE.teacher;

  return ACCESS_SECTIONS.reduce((acc, section) => {
    acc[section.id] = base[section.id] || 'none';
    return acc;
  }, {});
};

const buildAccessForUser = (user = {}) => {
  const role = getUserRole(user);
  const defaultAccess = buildDefaultAccess(role);
  const savedAccess = user?.access || {};

  return ACCESS_SECTIONS.reduce((acc, section) => {
    acc[section.id] = normalizeAccessValue(savedAccess[section.id] ?? defaultAccess[section.id]);
    return acc;
  }, {});
};

const cleanAccessByRole = (access = {}, role = 'teacher') => {
  const normalizedRole = normalizeRole(role);
  const visibleSections = getAccessSectionsByRole(normalizedRole);
  const visibleIds = visibleSections.map((section) => section.id);
  const defaultAccess = buildDefaultAccess(normalizedRole);

  return ACCESS_SECTIONS.reduce((acc, section) => {
    if (!visibleIds.includes(section.id)) {
      acc[section.id] = 'none';
      return acc;
    }

    acc[section.id] = normalizeAccessValue(access[section.id] ?? defaultAccess[section.id]);
    return acc;
  }, {});
};

const getAccessSummary = (access = {}, text = {}) => {
  const prepared = ACCESS_SECTIONS.map((section) => normalizeAccessValue(access?.[section.id]));
  const readCount = prepared.filter((value) => value === 'read').length;
  const editCount = prepared.filter((value) => value === 'edit').length;

  if (readCount === 0 && editCount === 0) return text.noAccess || 'Нет доступа';

  return `${text.readOnly || 'Только просмотр'}: ${readCount}, ${
    text.editAccess || 'Редактирование'
  }: ${editCount}`;
};

const teacherPositionOptions = ['Преподаватель', 'Лаборант', 'Администратор'];

const dict = {
  ru: {
    dashboard: 'Главная',
    profile: 'Профиль администратора',
    users: 'Пользователи',
    teachers: 'Преподаватели',
    students: 'Студенты',
    programs: 'Рабочие программы',
    documents: 'Документы',
    reports: 'Отчеты',
    practices: 'Практика',
    achievements: 'Достижения',
    add: 'Добавить',
    edit: 'Редактировать',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    search: 'Поиск...',
    setupAccess: 'Настроить доступ',
    saveAccess: 'Сохранить доступ',
    access: 'Доступ',
    fullName: 'ФИО',
    email: 'Email',
    phone: 'Телефон',
    role: 'Роль',
    loginDate: 'Дата входа',
    loginStatus: 'Статус входа',
    position: 'Должность',
    direction: 'Направление',
    course: 'Курс',
    group: 'Группа',
    discipline: 'Дисциплина',
    file: 'Файл',
    title: 'Название',
    description: 'Описание',
    actions: 'Действия',
    teacher: 'Преподаватель',
    type: 'Тип',
    entered: 'Вошел',
    waiting: 'Ожидает',
    open: 'Открыть',
    download: 'Скачать',
    noFile: 'Нет файла',
    chooseFile: 'Выбрать файл',
    uploading: 'Загрузка...',
    admin: 'Администратор',
    student: 'Студент',
    lab: 'Лаборант',
    allTeachers: 'Всем преподавателям',
    chooseTeacher: 'Выберите преподавателя',
    reportDetails: 'Просмотр отчета',
    emptyUsers: 'Пользователи пока не найдены',
    emptyTeachers: 'Преподаватели пока не добавлены',
    emptyStudents: 'Студенты пока не добавлены',
    emptyPrograms: 'Рабочие программы пока не добавлены',
    emptyDocuments: 'Документы пока не добавлены',
    emptyReports: 'Отчеты пока не добавлены',
    emptyPractices: 'Практика пока не добавлена',
    emptyAchievements: 'Достижения пока не добавлены',
    graduates: 'Выпускники',
    directionAll: 'Все направления',
    courseAll: 'Все курсы',
    allPractices: 'Все практики',
    academicPractice: 'Учебная практика',
    productionPractice: 'Производственная практика',
    preDiplomaPractice: 'Преддипломная практика',
    allAchievements: 'Все достижения',
    certificates: 'Сертификаты, дипломы, награды',
    scientificArticles: 'Научные статьи',
    other: 'Другое',
    noAccess: 'Нет доступа',
    readOnly: 'Только просмотр',
    editAccess: 'Редактирование',
    curatorReport: 'Кураторский отчет',
    departmentReport: 'Кафедральный отчет',
    reportCategory: 'Категория',
    responsible: 'Ответственный',
    annualReport: 'Годовой отчет',
    monthlyReport: 'Месячный отчет',
    otherReport: 'Другое',
    backToReports: 'Назад к отчетам',
    openSection: 'Открыть',

    totalUsers: 'Всего пользователей',
    totalTeachers: 'Всего преподавателей',
    totalStudents: 'Всего студентов',
    totalPrograms: 'Всего рабочих программ',
    totalDocuments: 'Всего документов',
    totalReports: 'Всего отчетов',

    portalActivity: 'Активность на портале',
    week: 'За неделю',
    month: 'За месяц',
    year: 'За год',
    activityEmpty: 'Активности пока нет',
    recentActions: 'Последние действия',
    showAll: 'Смотреть все',
    actionsEmpty: 'Действий пока нет'
  },
  kg: {
    dashboard: 'Башкы бет',
    profile: 'Администратордун профили',
    users: 'Колдонуучулар',
    teachers: 'Окутуучулар',
    students: 'Студенттер',
    programs: 'Окуу программалары',
    documents: 'Документтер',
    reports: 'Отчеттор',
    practices: 'Практика',
    achievements: 'Жетишкендиктер',
    add: 'Кошуу',
    edit: 'Өзгөртүү',
    save: 'Сактоо',
    cancel: 'Жокко чыгаруу',
    delete: 'Өчүрүү',
    search: 'Издөө...',
    setupAccess: 'Доступ жөндөө',
    saveAccess: 'Доступ сактоо',
    access: 'Доступ',
    fullName: 'Аты-жөнү',
    email: 'Email',
    phone: 'Телефон',
    role: 'Роль',
    loginDate: 'Кирген күнү',
    loginStatus: 'Кирүү статусу',
    position: 'Кызматы',
    direction: 'Багыт',
    course: 'Курс',
    group: 'Группа',
    discipline: 'Дисциплина',
    file: 'Файл',
    title: 'Аталышы',
    description: 'Сүрөттөмө',
    actions: 'Аракеттер',
    teacher: 'Мугалим',
    type: 'Түрү',
    entered: 'Кирди',
    waiting: 'Күтүүдө',
    open: 'Ачуу',
    download: 'Скачать',
    noFile: 'Файл жок',
    chooseFile: 'Файл тандоо',
    uploading: 'Жүктөлүүдө...',
    admin: 'Администратор',
    student: 'Студент',
    lab: 'Лаборант',
    allTeachers: 'Бардык мугалимдерге',
    chooseTeacher: 'Мугалим тандаңыз',
    reportDetails: 'Отчетту көрүү',
    emptyUsers: 'Колдонуучулар табылган жок',
    emptyTeachers: 'Окутуучулар кошула элек',
    emptyStudents: 'Студенттер кошула элек',
    emptyPrograms: 'Окуу программалары кошула элек',
    emptyDocuments: 'Документтер кошула элек',
    emptyReports: 'Отчеттор кошула элек',
    emptyPractices: 'Практика кошула элек',
    emptyAchievements: 'Жетишкендиктер кошула элек',
    graduates: 'Бүтүрүүчүлөр',
    directionAll: 'Бардык багыттар',
    courseAll: 'Бардык курстар',
    allPractices: 'Бардык практикалар',
    academicPractice: 'Окуу практикасы',
    productionPractice: 'Өндүрүштүк практика',
    preDiplomaPractice: 'Диплом алдындагы практика',
    allAchievements: 'Бардык жетишкендиктер',
    certificates: 'Сертификаттар, дипломдор, сыйлыктар',
    scientificArticles: 'Илимий макалалар',
    other: 'Башка',
    noAccess: 'Доступ жок',
    readOnly: 'Көрүү гана',
    editAccess: 'Өзгөртүү',
    curatorReport: 'Куратордук отчет',
    departmentReport: 'Кафедралык отчет',
    reportCategory: 'Категория',
    responsible: 'Жооптуу',
    annualReport: 'Жылдык отчет',
    monthlyReport: 'Айлык отчет',
    otherReport: 'Башка',
    backToReports: 'Отчетторго кайтуу',
openSection: 'Ачуу',

totalUsers: 'Бардык колдонуучулар',
totalTeachers: 'Бардык окутуучулар',
totalStudents: 'Бардык студенттер',
totalPrograms: 'Бардык жумушчу программалар',
totalDocuments: 'Бардык документтер',
totalReports: 'Бардык отчеттор',

portalActivity: 'Порталдагы активдүүлүк',
week: 'Бир жума',
month: 'Бир ай',
year: 'Бир жыл',
activityEmpty: 'Активдүүлүк азырынча жок',
recentActions: 'Акыркы аракеттер',
showAll: 'Баарын көрүү',
actionsEmpty: 'Аракеттер азырынча жок'
  },
  en: {
  dashboard: 'Dashboard',
  profile: 'Admin profile',

  users: 'Users',
  teachers: 'Teachers',
  students: 'Students',
  programs: 'Work programs',
  documents: 'Documents',
  reports: 'Reports',
  practices: 'Practice',
  achievements: 'Achievements',

  add: 'Add',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  search: 'Search...',

  setupAccess: 'Configure access',
  saveAccess: 'Save access',
  access: 'Access',

  fullName: 'Full name',
  email: 'Email',
  phone: 'Phone',
  role: 'Role',
  loginDate: 'Login date',
  loginStatus: 'Login status',
  position: 'Position',
  direction: 'Direction',
  course: 'Course',
  group: 'Group',
  discipline: 'Discipline',
  file: 'File',
  title: 'Title',
  description: 'Description',
  actions: 'Actions',
  teacher: 'Teacher',
  type: 'Type',

  entered: 'Logged in',
  waiting: 'Waiting',

  open: 'Open',
  download: 'Download',
  noFile: 'No file',
  chooseFile: 'Choose file',
  uploading: 'Uploading...',

  admin: 'Administrator',
  student: 'Student',
  lab: 'Laboratory assistant',

  allTeachers: 'All teachers',
  chooseTeacher: 'Choose teacher',
  reportDetails: 'Report details',

  emptyUsers: 'No users found',
  emptyTeachers: 'No teachers added yet',
  emptyStudents: 'No students added yet',
  emptyPrograms: 'No work programs added yet',
  emptyDocuments: 'No documents added yet',
  emptyReports: 'No reports added yet',
  emptyPractices: 'No practice records added yet',
  emptyAchievements: 'No achievements added yet',

  graduates: 'Graduates',
  directionAll: 'All directions',
  courseAll: 'All courses',
  allPractices: 'All practices',
  academicPractice: 'Educational practice',
  productionPractice: 'Industrial practice',
  preDiplomaPractice: 'Pre-diploma practice',

  allAchievements: 'All achievements',
  certificates: 'Certificates, diplomas, awards',
  scientificArticles: 'Scientific articles',
  other: 'Other',

  noAccess: 'No access',
  readOnly: 'Read only',
  editAccess: 'Editing',

  curatorReport: 'Curator report',
  departmentReport: 'Department report',
  reportCategory: 'Category',
  responsible: 'Responsible person',
  annualReport: 'Annual report',
  monthlyReport: 'Monthly report',
  otherReport: 'Other',
  backToReports: 'Back to reports',
  openSection: 'Open',

  totalUsers: 'Total users',
  totalTeachers: 'Total teachers',
  totalStudents: 'Total students',
  totalPrograms: 'Total work programs',
  totalDocuments: 'Total documents',
  totalReports: 'Total reports',

  portalActivity: 'Portal activity',
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
  activityEmpty: 'No activity yet.',
  recentActions: 'Recent actions',
  showAll: 'Show all',
  actionsEmpty: 'No actions yet.'
}
};

const emptyTeacher = {
  fullName: '',
  name: '',
  email: '',
  phone: '',
  position: 'Преподаватель',
  role: 'teacher',
  access: {},
  hasLoggedIn: false,
  loginStatus: 'waiting',
  createdAt: Date.now()
};

const emptyStudent = {
  fullName: '',
  name: '',
  email: '',
  phone: '',
  direction: 'ИВТ',
  course: '1',
  group: '',
  role: 'student',
  status: 'active',
  hasLoggedIn: false,
  loginStatus: 'waiting',
  createdAt: Date.now()
};

const emptyProgram = {
  discipline: '',
  name: '',
  title: '',
  direction: 'ИВТ',
  course: '1',
  fileUrl: '',
  fileName: '',
  createdAt: Date.now()
};

const emptyDocument = {
  title: '',
  name: '',
  description: '',
  fileUrl: '',
  fileName: '',
  createdAt: Date.now()
};

const emptyReport = {
  reportType: 'curator',
  title: '',
  description: '',
  category: 'Годовой отчет',
  group: '',
  curatorName: '',
  responsibleName: '',
  academicYear: '2025-2026',
  fileUrl: '',
  fileName: '',
  senderRole: 'admin',
  senderName: 'Администратор',
  receiverType: 'single',
  receiverRole: 'teacher',
  receiverTeacherId: '',
  receiverTeacherEmail: '',
  receiverTeacherName: '',
  readByAdmin: true,
  readByTeacher: false,
  status: 'sent',
  canDeleteByTeacher: false,
  canDeleteByAdmin: true,
  createdAt: Date.now()
};

const emptyPractice = {
  title: '',
  type: 'Учебная практика',
  direction: 'ИВТ',
  group: '',
  fileUrl: '',
  fileName: '',
  createdAt: Date.now()
};

const emptyAchievement = {
  title: '',
  name: '',
  type: 'Сертификаты, дипломы, награды',
  teacherName: '',
  uploadedByRole: 'admin',
  fileUrl: '',
  fileName: '',
  createdAt: Date.now()
};

function IconButton({ title, onClick, children, disabled = false }) {
  return (
    <button
      type="button"
      className="mini-icon-btn"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function FileNameCell({ row, text }) {
  const fileUrl = getSafeFileUrl(row);
  const fileName = getSafeFileName(row);

  if (!fileUrl) return <span className="mini-no-file">{text.noFile}</span>;

  const handleOpen = (event) => {
    event.stopPropagation();
    window.open(fileUrl, '_blank');
  };

  return (
    <button type="button" onClick={handleOpen} className="cell-text-wrap file-name-cell">
      {fileName || text.file}
    </button>
  );
}

function DownloadAction({ row, text }) {
  const fileUrl = getSafeFileUrl(row);

  if (!fileUrl) return null;

  const handleDownload = async (event) => {
    event.stopPropagation();
    event.preventDefault();

    try {
      let fileName = getSafeFileName(row) || 'file';
      let downloadUrl = fileUrl;

      if (fileUrl.includes('cloudinary.com')) {
        downloadUrl = fileUrl.includes('?')
          ? `${fileUrl}&fl_attachment=true`
          : `${fileUrl}?fl_attachment=true`;
      }

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="mini-icon-link"
      title={text.download}
      aria-label={text.download}
    >
      <Download size={15} />
    </button>
  );
}

function MiniTable({ columns = [], children, minWidth = 900 }) {
  return (
    <div className="mini-table-wrap">
      <table className="mini-excel-table" style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="mini-empty-cell">
        {text}
      </td>
    </tr>
  );
}

function RowActions({ text, editMode, onDelete, children }) {
  return (
    <div className="mini-row-actions">
      {children}

      {editMode && (
        <IconButton title={text.delete} onClick={onDelete}>
          <Trash2 size={14} />
        </IconButton>
      )}
    </div>
  );
}

function FileInputCell({ row, text, onUploaded, disabled = false }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || disabled) return;

    try {
      setIsUploading(true);

      const uploaded = await uploadFileToCloudinary(file);
      const fileUrl = extractUrl(uploaded);

      if (!fileUrl) throw new Error('Cloudinary ссылка кайтарган жок');

      onUploaded(row.id, {
        fileUrl,
        fileName:
          uploaded.fileName ||
          uploaded.name ||
          uploaded.original_filename ||
          file.name,
        fileType: uploaded.fileType || uploaded.type || uploaded.mimeType || file.type,
        fileSize: Number(uploaded.fileSize || uploaded.size || file.size || 0),
        publicId: uploaded.publicId || uploaded.public_id || '',
        resourceType: uploaded.resourceType || ''
      });
    } catch (error) {
      alert(`Файл жүктөлгөн жок: ${error.message}`);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="mini-file-cell">
      {!disabled && (
        <label className="mini-upload-btn">
          <input type="file" onChange={handleFileChange} />
          {isUploading ? text.uploading : text.chooseFile}
        </label>
      )}

      <FileNameCell row={row} text={text} />
    </div>
  );
}

function SectionToolbar({
  title,
  search,
  setSearch,
  text,
  editMode,
  onEdit,
  onAdd,
  onSave,
  onCancel,
  children
}) {
  return (
    <div className="mini-section-toolbar">
      <div className="mini-toolbar-title">
        <h2>{title}</h2>
      </div>

      <div className="mini-toolbar-actions">
        <label className="mini-search">
          <Search size={15} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={text.search}
          />
        </label>

        {children}

        {!editMode ? (
          <button type="button" className="mini-btn add" onClick={onEdit}>
            <Pencil size={14} />
            {text.edit}
          </button>
        ) : (
          <>
            <button type="button" className="mini-btn add" onClick={onAdd}>
              <Plus size={14} />
              {text.add}
            </button>

            <button type="button" className="mini-btn save" onClick={onSave}>
              <Save size={14} />
              {text.save}
            </button>

            <button type="button" className="mini-btn cancel" onClick={onCancel}>
              <X size={14} />
              {text.cancel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AccessModal({ text, language, user, onClose, onSave }) {
  const userRole = getUserRole(user);

  const [access, setAccess] = useState(() =>
    cleanAccessByRole(buildAccessForUser(user), userRole)
  );

  useEffect(() => {
    setAccess(cleanAccessByRole(buildAccessForUser(user), userRole));
  }, [user, userRole]);

  const getSectionLabel = (section) => {
    if (language === 'kg') return section.labelKg;
    if (language === 'en') return section.labelEn;
    return section.labelRu;
  };

  const accessLevels = [
    { value: 'none', label: text.noAccess || 'Нет доступа' },
    { value: 'read', label: text.readOnly || 'Только просмотр' },
    { value: 'edit', label: text.editAccess || 'Редактирование' }
  ];

  const visibleSections = getAccessSectionsByRole(userRole);

  const roleText =
    userRole === 'admin'
      ? text.admin
      : userRole === 'lab'
      ? text.lab
      : userRole === 'student'
      ? text.student
      : text.teacher;

  const changeAccess = (sectionId, value) => {
    setAccess((prev) =>
      cleanAccessByRole(
        {
          ...prev,
          [sectionId]: value
        },
        userRole
      )
    );
  };

  const handleSave = () => {
    onSave(cleanAccessByRole(access, userRole));
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal-window access-modal access-modal-modern"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-head access-modal-head-modern">
          <div>
            <h3>{text.setupAccess}</h3>
            <p>{getPersonName(user)}</p>
            <small>
              {text.role}: {roleText}
            </small>
          </div>

          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="access-radio-table-wrap">
          <table className="access-radio-table">
            <thead>
              <tr>
                <th className="access-section-col">Раздел</th>

                {accessLevels.map((level) => (
                  <th key={level.value}>{level.label}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleSections.map((section) => {
                const currentValue = normalizeAccessValue(access[section.id]);

                return (
                  <tr key={section.id}>
                    <td className="access-section-name">
                      <span>{getSectionLabel(section)}</span>
                    </td>

                    {accessLevels.map((level) => (
                      <td key={level.value} className="access-radio-cell">
                        <label
                          className={`access-radio-dot ${level.value} ${
                            currentValue === level.value ? 'checked' : ''
                          }`}
                          title={`${getSectionLabel(section)}: ${level.label}`}
                        >
                          <input
                            type="radio"
                            name={`access-${section.id}`}
                            value={level.value}
                            checked={currentValue === level.value}
                            onChange={(event) =>
                              changeAccess(section.id, event.target.value)
                            }
                          />

                          <span aria-hidden="true" />
                        </label>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="modal-actions-line access-actions-line">
          <button type="button" className="mini-btn save" onClick={handleSave}>
            <Save size={14} />
            {text.saveAccess}
          </button>

          <button type="button" className="mini-btn cancel" onClick={onClose}>
            <X size={14} />
            {text.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardContent({
  activeMenu = 'dashboard',
  setActiveMenu,
  language = 'ru',
  t = {},
  users = [],
  teachers = [],
  students = [],
  programs = [],
  documents = [],
  reports = [],
  practices = [],
  achievements = [],
  activityData = { week: [], month: [], year: [] },
  recentActions = [],
  setShowAllActionsModal,
  onSaveUsers,
  onSaveTeachers,
  onSaveStudents,
  onSavePrograms,
  onSaveDocuments,
  onSaveReports,
  onSavePractices,
  onSaveAchievements,
  handleDelete,
  onDelete
}) {
  const deleteHandler = handleDelete || onDelete;
  const text = { ...dict.ru, ...(dict[language] || {}), ...t };

  const [search, setSearch] = useState('');
  const [activityPeriod, setActivityPeriod] = useState('week');
  const [accessUser, setAccessUser] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [reportsPage, setReportsPage] = useState('home');

  const [userRows, setUserRows] = useState(() => normalizeRows(users, 'user'));
  const [teacherRows, setTeacherRows] = useState(() => normalizeRows(teachers, 'teacher'));
  const [studentRows, setStudentRows] = useState(() => normalizeRows(students, 'student'));
  const [programRows, setProgramRows] = useState(() => normalizeRows(programs, 'program').map(cleanFileData));
  const [documentRows, setDocumentRows] = useState(() => normalizeRows(documents, 'document').map(cleanFileData));
  const [reportRows, setReportRows] = useState(() => normalizeRows(reports, 'report').map(cleanFileData));
  const [practiceRows, setPracticeRows] = useState(() => normalizeRows(practices, 'practice').map(cleanFileData));
  const [achievementRows, setAchievementRows] = useState(() => normalizeRows(achievements, 'achievement').map(cleanFileData));

  const [editUsers, setEditUsers] = useState(false);
  const [editTeachers, setEditTeachers] = useState(false);
  const [editStudents, setEditStudents] = useState(false);
  const [editPrograms, setEditPrograms] = useState(false);
  const [editDocuments, setEditDocuments] = useState(false);
  const [editReports, setEditReports] = useState(false);
  const [editPractices, setEditPractices] = useState(false);
  const [editAchievements, setEditAchievements] = useState(false);

  const [studentType, setStudentType] = useState('active');
  const [studentDirection, setStudentDirection] = useState('all');
  const [studentCourse, setStudentCourse] = useState('all');
  const [practiceType, setPracticeType] = useState('all');
  const [practiceDirection, setPracticeDirection] = useState('all');
  const [achievementType, setAchievementType] = useState('all');

  useEffect(() => setUserRows(normalizeRows(users, 'user')), [users]);
  useEffect(() => setTeacherRows(normalizeRows(teachers, 'teacher')), [teachers]);
  useEffect(() => setStudentRows(normalizeRows(students, 'student')), [students]);
  useEffect(() => setProgramRows(normalizeRows(programs, 'program').map(cleanFileData)), [programs]);
  useEffect(() => setDocumentRows(normalizeRows(documents, 'document').map(cleanFileData)), [documents]);
  useEffect(() => setReportRows(normalizeRows(reports, 'report').map(cleanFileData)), [reports]);
  useEffect(() => setPracticeRows(normalizeRows(practices, 'practice').map(cleanFileData)), [practices]);
  useEffect(() => setAchievementRows(normalizeRows(achievements, 'achievement').map(cleanFileData)), [achievements]);

  const q = lower(search);

  const filterBySearch = (items, keys) =>
    items.filter((item) => keys.some((key) => lower(item?.[key]).includes(q)));

  const filteredUsers = useMemo(
    () =>
      filterBySearch(
        userRows.filter((user) => getUserRole(user) !== 'student'),
        ['fullName', 'name', 'email', 'role', 'position']
      ),
    [userRows, q]
  );

  const filteredTeachers = useMemo(
    () => filterBySearch(teacherRows, ['fullName', 'name', 'email', 'phone', 'position']),
    [teacherRows, q]
  );

  const filteredStudents = useMemo(() => {
    return filterBySearch(studentRows, ['fullName', 'name', 'email', 'phone', 'direction', 'course', 'group']).filter((student) => {
      const status = lower(student.status || 'active');
      const matchesType =
        studentType === 'graduates'
          ? status === 'graduate' || status === 'graduates'
          : status !== 'graduate' && status !== 'graduates';

      const matchesDirection = studentDirection === 'all' || student.direction === studentDirection;
      const matchesCourse = studentCourse === 'all' || String(student.course || '') === String(studentCourse);

      return matchesType && matchesDirection && matchesCourse;
    });
  }, [studentRows, q, studentType, studentDirection, studentCourse]);

  const filteredPrograms = useMemo(
    () => filterBySearch(programRows, ['discipline', 'name', 'title', 'direction', 'course', 'fileName']),
    [programRows, q]
  );

  const filteredDocuments = useMemo(
    () => filterBySearch(documentRows, ['title', 'name', 'description', 'fileName']),
    [documentRows, q]
  );

  const filteredReports = useMemo(
    () =>
      filterBySearch(reportRows, [
        'title',
        'description',
        'receiverTeacherName',
        'fileName',
        'category',
        'group',
        'curatorName',
        'responsibleName'
      ]),
    [reportRows, q]
  );

  const filteredCuratorReports = useMemo(
    () => filteredReports.filter((report) => (report.reportType || 'curator') === 'curator'),
    [filteredReports]
  );

  const filteredDepartmentReports = useMemo(
    () => filteredReports.filter((report) => report.reportType === 'department'),
    [filteredReports]
  );

  const filteredPractices = useMemo(() => {
    return filterBySearch(practiceRows, ['title', 'type', 'direction', 'group', 'fileName']).filter((item) => {
      const matchesType = practiceType === 'all' || item.type === practiceType;
      const matchesDirection = practiceDirection === 'all' || item.direction === practiceDirection;

      return matchesType && matchesDirection;
    });
  }, [practiceRows, q, practiceType, practiceDirection]);

  const filteredAchievements = useMemo(() => {
    return filterBySearch(achievementRows, ['title', 'name', 'type', 'teacherName', 'fileName']).filter(
      (item) => achievementType === 'all' || item.type === achievementType
    );
  }, [achievementRows, q, achievementType]);

  const updateRow = (setter, id, field, value) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const updateManyFields = (setter, id, values) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...values } : item))
    );
  };

  const addRow = (setter, empty, prefix) => {
    setter((prev) => [
      {
        ...empty,
        id: `new_${makeId(prefix)}`,
        createdAt: Date.now()
      },
      ...prev
    ]);
  };

  const deleteRow = async (type, id, setter) => {
    if (!window.confirm(`${text.delete}?`)) return;

    setter((prev) => prev.filter((item) => item.id !== id));

    if (!isNewId(id) && typeof deleteHandler === 'function') {
      await deleteHandler(type, id);
    }
  };

  const saveUsers = async () => {
    const prepared = userRows
      .filter((user) => getUserRole(user) !== 'student')
      .map((user) => {
        const role = getUserRole(user);

        return {
          ...user,
          role,
          position:
            role === 'admin'
              ? 'Администратор'
              : role === 'lab'
              ? 'Лаборант'
              : 'Преподаватель',
          access: cleanAccessByRole(user.access || buildDefaultAccess(role), role)
        };
      });

    if (typeof onSaveUsers === 'function') await onSaveUsers(prepared);
    setEditUsers(false);
  };

  const saveTeachers = async () => {
    const prepared = teacherRows.map((teacher) => {
      const role = getUserRole(teacher);

      return {
        ...teacher,
        fullName: teacher.fullName || teacher.name || '',
        name: teacher.name || teacher.fullName || '',
        role,
        position:
          role === 'admin'
            ? 'Администратор'
            : role === 'lab'
            ? 'Лаборант'
            : 'Преподаватель',
        access: cleanAccessByRole(teacher.access || buildDefaultAccess(role), role)
      };
    });

    if (typeof onSaveTeachers === 'function') await onSaveTeachers(prepared);
    setEditTeachers(false);
  };

  const saveStudents = async () => {
  const prepared = studentRows.map((student) => ({
    ...student,
    role: 'student',
    status: student.status || 'active',
    fullName: student.fullName || student.name || '',
    name: student.name || student.fullName || '',
    access: student.access || buildDefaultAccess('student')
  }));

  if (typeof onSaveStudents === 'function') await onSaveStudents(prepared);
  setEditStudents(false);
  
};


const promoteStudentsToNextCourse = async () => {
  const confirmed = window.confirm(
    'Учебный год обновится: 1 курс → 2 курс, 2 курс → 3 курс, 3 курс → 4 курс, 4 курс → Выпускник. Продолжить?'
  );

  if (!confirmed) return;

  const updatedRows = studentRows.map((student) => {
    const currentCourse = Number(student.course || 1);

    if (student.status === 'graduate' || student.course === 'Выпускник') {
      return student;
    }

    if (currentCourse >= 4) {
      return {
        ...student,
        course: 'Выпускник',
        status: 'graduate',
        graduatedAt: Date.now()
      };
    }

    return {
      ...student,
      course: String(currentCourse + 1),
      status: student.status || 'active'
    };
  });

  setStudentRows(updatedRows);

  if (typeof onSaveStudents === 'function') {
    await onSaveStudents(updatedRows);
  }

  alert('Учебный год обновлен!');
};
  const savePrograms = async () => {
    const prepared = programRows.map(cleanFileData);
    if (typeof onSavePrograms === 'function') await onSavePrograms(prepared);
    setEditPrograms(false);
  };

  const saveDocuments = async () => {
    const prepared = documentRows.map(cleanFileData);
    if (typeof onSaveDocuments === 'function') await onSaveDocuments(prepared);
    setEditDocuments(false);
  };

  const saveReports = async () => {
    const prepared = reportRows.map((report) => ({
      ...cleanFileData(report),
      title: report.title || '',
      reportType: report.reportType || 'curator',
      category: report.category || 'Годовой отчет',
      academicYear: report.academicYear || '2025-2026',
      senderRole: report.senderRole || 'admin',
      senderName: report.senderName || 'Администратор',
      receiverType: report.receiverType || 'single',
      receiverRole: report.receiverRole || 'teacher',
      status: report.status || 'sent',
      canDeleteByTeacher: report.canDeleteByTeacher === true,
      canDeleteByAdmin: report.canDeleteByAdmin !== false,
      createdAt: report.createdAt || Date.now()
    }));

    if (typeof onSaveReports === 'function') await onSaveReports(prepared);
    setEditReports(false);
  };

  const savePractices = async () => {
    const prepared = practiceRows.map(cleanFileData);
    if (typeof onSavePractices === 'function') await onSavePractices(prepared);
    setEditPractices(false);
  };

  const saveAchievements = async () => {
    const prepared = achievementRows.map(cleanFileData);
    if (typeof onSaveAchievements === 'function') await onSaveAchievements(prepared);
    setEditAchievements(false);
  };

  const saveAccess = async (preparedAccess) => {
    if (!accessUser) return;

    const userRole = getUserRole(accessUser);
    const accessLogText = `Доступ берилди/өзгөртүлдү: ${getPersonName(
      accessUser,
      'Пользователь'
    )} — ${getAccessSummary(preparedAccess, text)}`;

    const prepareUserRow = (row) =>
      row.id === accessUser.id
        ? {
            ...row,
            role: userRole,
            access: preparedAccess,
            updatedAt: Date.now(),
            lastActionText: accessLogText,
            lastAccessLogText: accessLogText
          }
        : row;

    const nextUserRows = userRows.map(prepareUserRow);
    const nextTeacherRows = teacherRows.map(prepareUserRow);

    setUserRows(nextUserRows);
    setTeacherRows(nextTeacherRows);

    if (typeof onSaveUsers === 'function') {
      await onSaveUsers(
        nextUserRows.filter((user) => getUserRole(user) !== 'student'),
        {
          actionType: 'access',
          customActionText: accessLogText,
          targetUserId: accessUser.id,
          targetUserName: getPersonName(accessUser, 'Пользователь')
        }
      );
    }

    if (typeof onSaveTeachers === 'function') {
      await onSaveTeachers(nextTeacherRows, {
        actionType: 'access',
        customActionText: accessLogText,
        targetUserId: accessUser.id,
        targetUserName: getPersonName(accessUser, 'Пользователь')
      });
    }

    setAccessUser(null);
  };

  const renderDashboard = () => {
  const cards = [
  {
    id: 'users',
    title: text.users,
    value: filteredUsers.length,
    meta: text.totalUsers,
    icon: <Users size={22} />
  },
  {
    id: 'teachers',
    title: text.teachers,
    value: teacherRows.length,
    meta: text.totalTeachers,
    icon: <UserRoundCog size={22} />
  },
  {
    id: 'students',
    title: text.students,
    value: studentRows.length,
    meta: text.totalStudents,
    icon: <GraduationCap size={22} />
  },
  {
    id: 'programs',
    title: text.programs,
    value: programRows.length,
    meta: text.totalPrograms,
    icon: <FileText size={22} />
  },
  {
    id: 'documents',
    title: text.documents,
    value: documentRows.length,
    meta: text.totalDocuments,
    icon: <FolderOpen size={22} />
  },
  {
    id: 'reports',
    title: text.reports,
    value: reportRows.length,
    meta: text.totalReports,
    icon: <BarChart3 size={22} />
  }
];

    const activityItems = activityData?.[activityPeriod]?.length > 0 ? activityData[activityPeriod] : [];
    const maxValue = Math.max(1, ...activityItems.map((item) => Number(item.value || 0)));
    const shortRecentActions = Array.isArray(recentActions) ? recentActions.slice(0, 6) : [];

    return (
      <div className="admin-section-page admin-home-look admin-dashboard-polished">
        <div className="admin-main-title">
          <h1>{text.dashboard}</h1>
        </div>

        <div className="modern-stats-row">
          {cards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className="modern-stat-box dashboard-click-card"
              onClick={() => setActiveMenu?.(card.id)}
            >
              <span className={`modern-stat-icon stat-color-${(index % 5) + 1}`}>
                {card.icon}
              </span>

              <span className="stat-content">
                <span className="stat-title">{card.title}</span>
                <strong className="stat-number">{card.value}</strong>
                <span className="stat-trend">{card.meta}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="admin-home-grid">
          <div className="dashboard-card modern-card activity-card">
            <div className="card-head modern-card-head">
              <h3>
                <Activity size={18} />
                {t.portalActivity || 'Активность на портале'}
              </h3>

              <select
                className="period"
                value={activityPeriod}
                onChange={(event) => setActivityPeriod(event.target.value)}
              >
                <option value="week">{t.week || 'За неделю'}</option>
                <option value="month">{t.month || 'За месяц'}</option>
                <option value="year">{t.year || 'За год'}</option>
              </select>
            </div>

            {activityItems.length === 0 ? (
              <div className="dashboard-empty-box">
                {t.activityEmpty || 'Активности пока нет.'}
              </div>
            ) : (
              <div className={`simple-chart ${activityPeriod === 'year' ? 'simple-chart-year' : ''}`}>
                {activityItems.map((item, index) => {
                  const value = Number(item.value || 0);
                  const height = Math.max(8, (value / maxValue) * 100);
                  const label = item.day || item.label || item.name || `${index + 1}`;

                  return (
                    <div className="simple-chart-item" key={`${label}_${index}`}>
                      <div className="simple-chart-value">{value}</div>

                      <div className="simple-chart-bar-wrap">
                        <div className="simple-chart-bar" style={{ height: `${height}%` }} />
                      </div>

                      <div className="simple-chart-label">{label}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dashboard-card modern-card recent-card">
            <div className="card-head modern-card-head">
              <h3>
                <Clock3 size={18} />
                {t.recentActions || 'Последние действия'}
              </h3>

              <button
                type="button"
                className="modern-link-btn"
                onClick={() => setShowAllActionsModal?.(true)}
              >
                {t.showAll || 'Смотреть все'}
              </button>
            </div>

            <div className="modern-actions-list">
              {shortRecentActions.length === 0 ? (
                <div className="dashboard-empty-box">
                  {t.actionsEmpty || 'Действий пока нет.'}
                </div>
              ) : (
                shortRecentActions.map((item, index) => (
                  <div className="modern-action-item" key={item.id || index}>
                    <span className="modern-action-icon">{item.icon || '•'}</span>

                    <div className="modern-action-text">
                      <strong>{item.text || item.title || '-'}</strong>
                      <small>{formatDateTime(item.createdAt || item.date)}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="admin-section-page">
      <SectionToolbar
        title={text.users}
        search={search}
        setSearch={setSearch}
        text={text}
        editMode={editUsers}
        onEdit={() => setEditUsers(true)}
        onAdd={() =>
          addRow(
            setUserRows,
            {
              fullName: '',
              name: '',
              email: '',
              role: 'teacher',
              loginDate: '',
              loginStatus: 'waiting',
              hasLoggedIn: false,
              access: {},
              createdAt: Date.now()
            },
            'user'
          )
        }
        onSave={saveUsers}
        onCancel={() => {
          setUserRows(normalizeRows(users, 'user'));
          setEditUsers(false);
        }}
      />

      <MiniTable
        columns={['№', text.fullName, text.email, text.role, text.access, text.loginDate, text.loginStatus, text.actions]}
        minWidth={1200}
      >
        {filteredUsers.length === 0 ? (
          <EmptyRow colSpan={8} text={text.emptyUsers} />
        ) : (
          filteredUsers.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td className="wrap-cell text-cell">
                {editUsers ? (
                  <input
                    value={item.fullName || item.name || ''}
                    onChange={(event) =>
                      updateManyFields(setUserRows, item.id, {
                        fullName: event.target.value,
                        name: event.target.value
                      })
                    }
                    placeholder={text.fullName}
                  />
                ) : (
                  item.fullName || item.name || '-'
                )}
              </td>

              <td>
                {editUsers ? (
                  <input
                    value={item.email || ''}
                    onChange={(event) => updateRow(setUserRows, item.id, 'email', event.target.value)}
                    placeholder={text.email}
                  />
                ) : (
                  item.email || '-'
                )}
              </td>

              <td>
                {editUsers ? (
                  <select
                    value={getUserRole(item)}
                    onChange={(event) =>
                      updateManyFields(setUserRows, item.id, {
                        role: event.target.value,
                        position:
                          event.target.value === 'admin'
                            ? 'Администратор'
                            : event.target.value === 'lab'
                            ? 'Лаборант'
                            : 'Преподаватель',
                        access: buildDefaultAccess(event.target.value)
                      })
                    }
                  >
                    <option value="teacher">{text.teacher}</option>
                    <option value="lab">{text.lab}</option>
                    <option value="admin">{text.admin}</option>
                  </select>
                ) : getUserRole(item) === 'admin' ? (
                  text.admin
                ) : getUserRole(item) === 'lab' ? (
                  text.lab
                ) : (
                  text.teacher
                )}
              </td>

              <td>
                <button type="button" className="mini-access-btn" onClick={() => setAccessUser(item)}>
                  <ShieldCheck size={14} />
                  {text.setupAccess}
                </button>

                <small className="access-summary">
                  {getAccessSummary(item.access || buildDefaultAccess(getUserRole(item)), text)}
                </small>
              </td>

              <td>{item.loginDate || (item.lastLoginAt ? formatDateTime(item.lastLoginAt) : '-')}</td>

              <td>
                <span className={`status-pill ${item.hasLoggedIn || item.loginStatus === 'entered' ? 'entered' : 'waiting'}`}>
                  {item.hasLoggedIn || item.loginStatus === 'entered' ? text.entered : text.waiting}
                </span>
              </td>

              <td>
                <RowActions
                  text={text}
                  editMode={editUsers}
                  onDelete={() => deleteRow('user', item.id, setUserRows)}
                />
              </td>
            </tr>
          ))
        )}
      </MiniTable>
    </div>
  );

  const renderTeachers = () => (
    <div className="admin-section-page">
      <SectionToolbar
        title={text.teachers}
        search={search}
        setSearch={setSearch}
        text={text}
        editMode={editTeachers}
        onEdit={() => setEditTeachers(true)}
        onAdd={() => addRow(setTeacherRows, emptyTeacher, 'teacher')}
        onSave={saveTeachers}
        onCancel={() => {
          setTeacherRows(normalizeRows(teachers, 'teacher'));
          setEditTeachers(false);
        }}
      />

      <MiniTable columns={['№', text.fullName, text.email, text.phone, text.position, text.actions]} minWidth={1100}>
        {filteredTeachers.length === 0 ? (
          <EmptyRow colSpan={6} text={text.emptyTeachers} />
        ) : (
          filteredTeachers.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td className="wrap-cell text-cell">
                {editTeachers ? (
                  <input
                    value={item.fullName || item.name || ''}
                    onChange={(event) =>
                      updateManyFields(setTeacherRows, item.id, {
                        fullName: event.target.value,
                        name: event.target.value
                      })
                    }
                  />
                ) : (
                  item.fullName || item.name || '-'
                )}
              </td>

              <td>
                {editTeachers ? (
                  <input
                    value={item.email || ''}
                    onChange={(event) => updateRow(setTeacherRows, item.id, 'email', event.target.value)}
                  />
                ) : (
                  item.email || '-'
                )}
              </td>

              <td>
                {editTeachers ? (
                  <input
                    value={item.phone || ''}
                    onChange={(event) => updateRow(setTeacherRows, item.id, 'phone', event.target.value)}
                  />
                ) : (
                  item.phone || '-'
                )}
              </td>

              <td>
                {editTeachers ? (
                  <select
                    value={item.position || 'Преподаватель'}
                    onChange={(event) =>
                      updateManyFields(setTeacherRows, item.id, {
                        position: event.target.value,
                        role: positionToRole(event.target.value),
                        access: buildDefaultAccess(positionToRole(event.target.value))
                      })
                    }
                  >
                    {teacherPositionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  item.position || 'Преподаватель'
                )}
              </td>


              <td>
                <RowActions
                  text={text}
                  editMode={editTeachers}
                  onDelete={() => deleteRow('teacher', item.id, setTeacherRows)}
                />
              </td>
            </tr>
          ))
        )}
      </MiniTable>
    </div>
  );

  const renderStudents = () => (
    <div className="admin-section-page">
      <SectionToolbar
        title={text.students}
        search={search}
        setSearch={setSearch}
        text={text}
        editMode={editStudents}
        onEdit={() => setEditStudents(true)}
        onAdd={() => addRow(setStudentRows, emptyStudent, 'student')}
        onSave={saveStudents}
        onCancel={() => {
          setStudentRows(normalizeRows(students, 'student'));
          setEditStudents(false);
        
        }}
      >
        <select className="mini-filter-select" value={studentType} onChange={(event) => setStudentType(event.target.value)}>
          <option value="active">{text.students}</option>
          <option value="graduates">{text.graduates}</option>
        </select>

        <select className="mini-filter-select" value={studentDirection} onChange={(event) => setStudentDirection(event.target.value)}>
          <option value="all">{text.directionAll}</option>
          <option value="ИВТ">ИВТ</option>
          <option value="ПИЭ">ПИЭ</option>
        </select>

        <select className="mini-filter-select" value={studentCourse} onChange={(event) => setStudentCourse(event.target.value)}>
          <option value="all">{text.courseAll}</option>
          <option value="1">1 курс</option>
          <option value="2">2 курс</option>
          <option value="3">3 курс</option>
          <option value="4">4 курс</option>
        </select>

        <button
  type="button"
  className="mini-btn save"
  onClick={promoteStudentsToNextCourse}
>
  Обновить учебный год
</button>
      </SectionToolbar>

      <MiniTable columns={['№', text.fullName, text.email, text.phone, text.direction, text.course, text.group, text.actions]} minWidth={1200}>
        {filteredStudents.length === 0 ? (
          <EmptyRow colSpan={8} text={text.emptyStudents} />
        ) : (
          filteredStudents.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td className="wrap-cell text-cell">
                {editStudents ? (
                  <input
                    value={item.fullName || item.name || ''}
                    onChange={(event) =>
                      updateManyFields(setStudentRows, item.id, {
                        fullName: event.target.value,
                        name: event.target.value
                      })
                    }
                  />
                ) : (
                  item.fullName || item.name || '-'
                )}
              </td>

              <td>
                {editStudents ? (
                  <input
                    value={item.email || ''}
                    onChange={(event) => updateRow(setStudentRows, item.id, 'email', event.target.value)}
                  />
                ) : (
                  item.email || '-'
                )}
              </td>

              <td>
                {editStudents ? (
                  <input
                    value={item.phone || ''}
                    onChange={(event) => updateRow(setStudentRows, item.id, 'phone', event.target.value)}
                  />
                ) : (
                  item.phone || '-'
                )}
              </td>

              <td>
                {editStudents ? (
                  <select
                    value={item.direction || 'ИВТ'}
                    onChange={(event) => updateRow(setStudentRows, item.id, 'direction', event.target.value)}
                  >
                    <option value="ИВТ">ИВТ</option>
                    <option value="ПИЭ">ПИЭ</option>
                  </select>
                ) : (
                  item.direction || '-'
                )}
              </td>

              <td>
                {editStudents ? (
                  <select
                    value={item.course || '1'}
                    onChange={(event) => updateRow(setStudentRows, item.id, 'course', event.target.value)}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                ) : (
                  item.course || '-'
                )}
              </td>

              <td>
                {editStudents ? (
                  <input
                    value={item.group || ''}
                    onChange={(event) => updateRow(setStudentRows, item.id, 'group', event.target.value)}
                  />
                ) : (
                  item.group || '-'
                )}
              </td>

              <td>
                <RowActions
                  text={text}
                  editMode={editStudents}
                  onDelete={() => deleteRow('student', item.id, setStudentRows)}
                />
              </td>
            </tr>
          ))
        )}
      </MiniTable>
    </div>
  );

  const renderPrograms = () => (
    <div className="admin-section-page">
      <SectionToolbar
        title={text.programs}
        search={search}
        setSearch={setSearch}
        text={text}
        editMode={editPrograms}
        onEdit={() => setEditPrograms(true)}
        onAdd={() => addRow(setProgramRows, emptyProgram, 'program')}
        onSave={savePrograms}
        onCancel={() => {
          setProgramRows(normalizeRows(programs, 'program').map(cleanFileData));
          setEditPrograms(false);
        }}
      />

      <MiniTable columns={['№', text.discipline, text.direction, text.course, text.file, text.actions]} minWidth={950}>
        {filteredPrograms.length === 0 ? (
          <EmptyRow colSpan={6} text={text.emptyPrograms} />
        ) : (
          filteredPrograms.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td className="wrap-cell text-cell">
                {editPrograms ? (
                  <input
                    value={item.discipline || item.name || item.title || ''}
                    onChange={(event) =>
                      updateManyFields(setProgramRows, item.id, {
                        discipline: event.target.value,
                        name: event.target.value,
                        title: event.target.value
                      })
                    }
                  />
                ) : (
                  item.discipline || item.name || item.title || '-'
                )}
              </td>

              <td>
                {editPrograms ? (
                  <select
                    value={item.direction || 'ИВТ'}
                    onChange={(event) => updateRow(setProgramRows, item.id, 'direction', event.target.value)}
                  >
                    <option value="ИВТ">ИВТ</option>
                    <option value="ПИЭ">ПИЭ</option>
                  </select>
                ) : (
                  item.direction || '-'
                )}
              </td>

              <td>
                {editPrograms ? (
                  <select
                    value={item.course || '1'}
                    onChange={(event) => updateRow(setProgramRows, item.id, 'course', event.target.value)}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                ) : (
                  item.course || '-'
                )}
              </td>

              <td className="wrap-cell text-cell">
                {editPrograms ? (
                  <FileInputCell
                    row={item}
                    text={text}
                    onUploaded={(id, data) => updateManyFields(setProgramRows, id, cleanFileData(data))}
                  />
                ) : (
                  <FileNameCell row={item} text={text} />
                )}
              </td>

              <td>
                <RowActions
                  text={text}
                  editMode={editPrograms}
                  onDelete={() => deleteRow('program', item.id, setProgramRows)}
                >
                  <DownloadAction row={item} text={text} />
                </RowActions>
              </td>
            </tr>
          ))
        )}
      </MiniTable>
    </div>
  );

  const renderDocuments = () => (
    <div className="admin-section-page">
      <SectionToolbar
        title={text.documents}
        search={search}
        setSearch={setSearch}
        text={text}
        editMode={editDocuments}
        onEdit={() => setEditDocuments(true)}
        onAdd={() => addRow(setDocumentRows, emptyDocument, 'document')}
        onSave={saveDocuments}
        onCancel={() => {
          setDocumentRows(normalizeRows(documents, 'document').map(cleanFileData));
          setEditDocuments(false);
        }}
      />

      <MiniTable columns={['№', text.title, text.description, text.file, text.actions]} minWidth={900}>
        {filteredDocuments.length === 0 ? (
          <EmptyRow colSpan={5} text={text.emptyDocuments} />
        ) : (
          filteredDocuments.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td className="wrap-cell text-cell">
                {editDocuments ? (
                  <input
                    value={item.title || item.name || ''}
                    onChange={(event) =>
                      updateManyFields(setDocumentRows, item.id, {
                        title: event.target.value,
                        name: event.target.value
                      })
                    }
                  />
                ) : (
                  item.title || item.name || '-'
                )}
              </td>

              <td className="wrap-cell text-cell">
                {editDocuments ? (
                  <textarea
                    value={item.description || ''}
                    onChange={(event) => updateRow(setDocumentRows, item.id, 'description', event.target.value)}
                  />
                ) : (
                  item.description || '-'
                )}
              </td>

              <td className="wrap-cell text-cell">
                {editDocuments ? (
                  <FileInputCell
                    row={item}
                    text={text}
                    onUploaded={(id, data) => updateManyFields(setDocumentRows, id, cleanFileData(data))}
                  />
                ) : (
                  <FileNameCell row={item} text={text} />
                )}
              </td>

              <td>
                <RowActions
                  text={text}
                  editMode={editDocuments}
                  onDelete={() => deleteRow('document', item.id, setDocumentRows)}
                >
                  <DownloadAction row={item} text={text} />
                </RowActions>
              </td>
            </tr>
          ))
        )}
      </MiniTable>
    </div>
  );

  const renderReports = () => {
    const reportCategoryOptions = [
      text.annualReport || 'Годовой отчет',
      text.monthlyReport || 'Месячный отчет',
      text.otherReport || 'Другое'
    ];

    const openCuratorReports = () => {
      setReportsPage('curator');
      setEditReports(false);
    };

    const openDepartmentReports = () => {
      setReportsPage('department');
      setEditReports(false);
    };

    const backToReportsHome = () => {
      setReportsPage('home');
      setEditReports(false);
      setReportRows(normalizeRows(reports, 'report').map(cleanFileData));
    };

    const cancelReports = () => {
      setReportRows(normalizeRows(reports, 'report').map(cleanFileData));
      setEditReports(false);
    };

    const addCuratorReport = () => {
      setReportRows((prev) => [
        {
          ...emptyReport,
          id: `new_${makeId('report')}`,
          isNew: true,
          reportType: 'curator',
          title: '',
          description: '',
          category: '',
          group: '',
          curatorName: '',
          responsibleName: '',
          academicYear: '2025-2026',
          receiverType: 'single',
          receiverRole: 'teacher',
          receiverTeacherId: '',
          receiverTeacherEmail: '',
          receiverTeacherName: '',
          senderRole: 'admin',
          senderName: 'Администратор',
          readByAdmin: true,
          readByTeacher: false,
          status: 'sent',
          canDeleteByTeacher: false,
          canDeleteByAdmin: true,
          createdAt: Date.now()
        },
        ...prev
      ]);

      setEditReports(true);
    };

    const addDepartmentReport = () => {
      setReportRows((prev) => [
        {
          ...emptyReport,
          id: `new_${makeId('report')}`,
          isNew: true,
          reportType: 'department',
          title: '',
          description: '',
          category: text.annualReport || 'Годовой отчет',
          group: '',
          curatorName: '',
          responsibleName: '',
          academicYear: '2025-2026',
          receiverType: 'single',
          receiverRole: 'teacher',
          receiverTeacherId: '',
          receiverTeacherEmail: '',
          receiverTeacherName: '',
          senderRole: 'admin',
          senderName: 'Администратор',
          readByAdmin: true,
          readByTeacher: false,
          status: 'sent',
          canDeleteByTeacher: false,
          canDeleteByAdmin: true,
          createdAt: Date.now()
        },
        ...prev
      ]);

      setEditReports(true);
    };

    const updateReportTeacher = (item, value, nameField) => {
      if (value === '__all__') {
        updateManyFields(setReportRows, item.id, {
          receiverType: 'all',
          receiverTeacherId: '',
          receiverTeacherEmail: '',
          receiverTeacherName: text.allTeachers || 'Всем преподавателям',
          [nameField]: text.allTeachers || 'Всем преподавателям'
        });

        return;
      }

      const selectedTeacher = teacherRows.find((teacher) => teacher.id === value);

      updateManyFields(setReportRows, item.id, {
        receiverType: 'single',
        receiverTeacherId: selectedTeacher?.id || '',
        receiverTeacherEmail: selectedTeacher?.email || '',
        receiverTeacherName:
          selectedTeacher?.fullName ||
          selectedTeacher?.name ||
          selectedTeacher?.email ||
          '',
        [nameField]:
          selectedTeacher?.fullName ||
          selectedTeacher?.name ||
          selectedTeacher?.email ||
          ''
      });
    };

    const renderReportsHome = () => (
      <div className="admin-section-page">
        <SectionToolbar
          title={text.reports}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={false}
          onEdit={() => {}}
          onAdd={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
        />

        <div className="dashboard-cards">
          <button type="button" className="dashboard-card report-card" onClick={openCuratorReports}>
            <div className="card-icon purple">
              <Users size={24} />
            </div>

            <div className="card-content">
              <h3>{text.curatorReport || 'Кураторский отчет'}</h3>
              <p>{filteredCuratorReports.length}</p>
              <span>{text.openSection || 'Открыть'}</span>
            </div>
          </button>

          <button type="button" className="dashboard-card report-card" onClick={openDepartmentReports}>
            <div className="card-icon green">
              <FolderOpen size={24} />
            </div>

            <div className="card-content">
              <h3>{text.departmentReport || 'Кафедральный отчет'}</h3>
              <p>{filteredDepartmentReports.length}</p>
              <span>{text.openSection || 'Открыть'}</span>
            </div>
          </button>
        </div>
      </div>
    );

    const renderReportsHeader = (title, subtitle, count) => (
      <div className="section-header">
        <div>
          <button type="button" className="back-btn" onClick={backToReportsHome}>
            ← {text.backToReports || 'Назад к отчетам'}
          </button>

          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="section-count">
          <strong>{count}</strong>
          
        </div>
      </div>
    );

    const renderCuratorReportsTable = () => (
      <div className="admin-section-page">
        <SectionToolbar
          title={text.curatorReport || 'Кураторский отчет'}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={editReports}
          onEdit={() => setEditReports(true)}
          onAdd={addCuratorReport}
          onSave={saveReports}
          onCancel={cancelReports}
        />

        {renderReportsHeader(
        
          
         
        )}

        <MiniTable columns={['№', text.title, text.group, text.teacher, 'Учебный год', text.file, text.actions]} minWidth={1100}>
          {filteredCuratorReports.length === 0 ? (
            <EmptyRow colSpan={7} text={text.emptyReports} />
          ) : (
            filteredCuratorReports.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td className="wrap-cell text-cell">
                  {editReports ? (
                    <input
                      value={item.title || ''}
                      onChange={(event) => updateRow(setReportRows, item.id, 'title', event.target.value)}
                      placeholder={text.title}
                    />
                  ) : (
                    <span className="cell-text-wrap">{item.title || '-'}</span>
                  )}
                </td>

                <td>
                  {editReports ? (
                    <input
                      value={item.group || ''}
                      onChange={(event) => updateRow(setReportRows, item.id, 'group', event.target.value)}
                      placeholder={text.group}
                    />
                  ) : (
                    item.group || '-'
                  )}
                </td>

                <td className="wrap-cell teacher-cell">
                  {editReports ? (
                    <select
                      value={item.receiverType === 'all' ? '__all__' : item.receiverTeacherId || ''}
                      onChange={(event) => updateReportTeacher(item, event.target.value, 'curatorName')}
                    >
                      <option value="">{text.chooseTeacher}</option>
                      <option value="__all__">{text.allTeachers}</option>

                      {teacherRows.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.fullName || teacher.name || teacher.email}
                        </option>
                      ))}
                    </select>
                  ) : (
                    item.curatorName || item.receiverTeacherName || '-'
                  )}
                </td>

                <td>
                  {editReports ? (
                    <input
                      value={item.academicYear || '2025-2026'}
                      onChange={(event) => updateRow(setReportRows, item.id, 'academicYear', event.target.value)}
                      placeholder="2025-2026"
                    />
                  ) : (
                    item.academicYear || '2025-2026'
                  )}
                </td>

                <td className="wrap-cell text-cell">
                  {editReports ? (
                    <FileInputCell
                      row={item}
                      text={text}
                      onUploaded={(id, data) =>
                        updateManyFields(setReportRows, id, {
                          ...cleanFileData(data),
                          reportType: 'curator'
                        })
                      }
                    />
                  ) : (
                    <FileNameCell row={item} text={text} />
                  )}
                </td>

                <td>
                  <RowActions
                    text={text}
                    editMode={editReports}
                    onDelete={() => deleteRow('report', item.id, setReportRows)}
                  >
                    <IconButton title={text.open} onClick={() => setReportDetails(item)}>
                      <Eye size={14} />
                    </IconButton>

                    <DownloadAction row={item} text={text} />
                  </RowActions>
                </td>
              </tr>
            ))
          )}
        </MiniTable>
      </div>
    );

    const renderDepartmentReportsTable = () => (
      <div className="admin-section-page">
        <SectionToolbar
          title={text.departmentReport || 'Кафедральный отчет'}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={editReports}
          onEdit={() => setEditReports(true)}
          onAdd={addDepartmentReport}
          onSave={saveReports}
          onCancel={cancelReports}
        />

        {renderReportsHeader(
         
          
        )}

        <MiniTable columns={['№', text.title, text.reportCategory || 'Категория', text.responsible || 'Ответственный', 'Учебный год', text.file, text.actions]} minWidth={1150}>
          {filteredDepartmentReports.length === 0 ? (
            <EmptyRow colSpan={7} text={text.emptyReports} />
          ) : (
            filteredDepartmentReports.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td className="wrap-cell text-cell">
                  {editReports ? (
                    <input
                      value={item.title || ''}
                      onChange={(event) => updateRow(setReportRows, item.id, 'title', event.target.value)}
                      placeholder={text.title}
                    />
                  ) : (
                    <span className="cell-text-wrap">{item.title || '-'}</span>
                  )}
                </td>

                <td>
                  {editReports ? (
                    <select
                      value={item.category || text.annualReport || 'Годовой отчет'}
                      onChange={(event) => updateRow(setReportRows, item.id, 'category', event.target.value)}
                    >
                      {reportCategoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  ) : (
                    item.category || '-'
                  )}
                </td>

                <td className="wrap-cell teacher-cell">
                  {editReports ? (
                    <select
                      value={item.receiverType === 'all' ? '__all__' : item.receiverTeacherId || ''}
                      onChange={(event) => updateReportTeacher(item, event.target.value, 'responsibleName')}
                    >
                      <option value="">{text.chooseTeacher}</option>
                      <option value="__all__">{text.allTeachers}</option>

                      {teacherRows.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.fullName || teacher.name || teacher.email}
                        </option>
                      ))}
                    </select>
                  ) : (
                    item.responsibleName || item.receiverTeacherName || '-'
                  )}
                </td>

                <td>
                  {editReports ? (
                    <input
                      value={item.academicYear || '2025-2026'}
                      onChange={(event) => updateRow(setReportRows, item.id, 'academicYear', event.target.value)}
                      placeholder="2025-2026"
                    />
                  ) : (
                    item.academicYear || '2025-2026'
                  )}
                </td>

                <td className="wrap-cell text-cell">
                  {editReports ? (
                    <FileInputCell
                      row={item}
                      text={text}
                      onUploaded={(id, data) =>
                        updateManyFields(setReportRows, id, {
                          ...cleanFileData(data),
                          reportType: 'department'
                        })
                      }
                    />
                  ) : (
                    <FileNameCell row={item} text={text} />
                  )}
                </td>

                <td>
                  <RowActions
                    text={text}
                    editMode={editReports}
                    onDelete={() => deleteRow('report', item.id, setReportRows)}
                  >
                    <IconButton title={text.open} onClick={() => setReportDetails(item)}>
                      <Eye size={14} />
                    </IconButton>

                    <DownloadAction row={item} text={text} />
                  </RowActions>
                </td>
              </tr>
            ))
          )}
        </MiniTable>
      </div>
    );

    if (reportsPage === 'curator') return renderCuratorReportsTable();
    if (reportsPage === 'department') return renderDepartmentReportsTable();

    return renderReportsHome();
  };

  const renderPractices = () => (
    <div className="admin-section-page">
      <SectionToolbar
        title={text.practices}
        search={search}
        setSearch={setSearch}
        text={text}
        editMode={editPractices}
        onEdit={() => setEditPractices(true)}
        onAdd={() => addRow(setPracticeRows, emptyPractice, 'practice')}
        onSave={savePractices}
        onCancel={() => {
          setPracticeRows(normalizeRows(practices, 'practice').map(cleanFileData));
          setEditPractices(false);
        }}
      >
        <select className="mini-filter-select" value={practiceType} onChange={(event) => setPracticeType(event.target.value)}>
          <option value="all">{text.allPractices}</option>
          <option value="Учебная практика">{text.academicPractice}</option>
          <option value="Производственная практика">{text.productionPractice}</option>
          <option value="Преддипломная практика">{text.preDiplomaPractice}</option>
        </select>

        <select className="mini-filter-select" value={practiceDirection} onChange={(event) => setPracticeDirection(event.target.value)}>
          <option value="all">{text.directionAll}</option>
          <option value="ИВТ">ИВТ</option>
          <option value="ПИЭ">ПИЭ</option>
        </select>
      </SectionToolbar>

      <MiniTable columns={['№', 'Тип практики', 'Группа', text.direction, text.file, text.actions]} minWidth={950}>
        {filteredPractices.length === 0 ? (
          <EmptyRow colSpan={6} text={text.emptyPractices} />
        ) : (
          filteredPractices.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td>
                {editPractices ? (
                  <select
                    value={item.type || 'Учебная практика'}
                    onChange={(event) => updateRow(setPracticeRows, item.id, 'type', event.target.value)}
                  >
                    <option value="Учебная практика">{text.academicPractice}</option>
                    <option value="Производственная практика">{text.productionPractice}</option>
                    <option value="Преддипломная практика">{text.preDiplomaPractice}</option>
                  </select>
                ) : (
                  item.type || '-'
                )}
              </td>

              <td>
                {editPractices ? (
                  <input
                    value={item.group || ''}
                    onChange={(event) => updateRow(setPracticeRows, item.id, 'group', event.target.value)}
                    placeholder={text.group}
                  />
                ) : (
                  item.group || '-'
                )}
              </td>

              <td>
                {editPractices ? (
                  <select
                    value={item.direction || 'ИВТ'}
                    onChange={(event) => updateRow(setPracticeRows, item.id, 'direction', event.target.value)}
                  >
                    <option value="ИВТ">ИВТ</option>
                    <option value="ПИЭ">ПИЭ</option>
                  </select>
                ) : (
                  item.direction || '-'
                )}
              </td>

              <td className="wrap-cell text-cell">
                {editPractices ? (
                  <FileInputCell
                    row={item}
                    text={text}
                    onUploaded={(id, data) => updateManyFields(setPracticeRows, id, cleanFileData(data))}
                  />
                ) : (
                  <FileNameCell row={item} text={text} />
                )}
              </td>

              <td>
                <RowActions
                  text={text}
                  editMode={editPractices}
                  onDelete={() => deleteRow('practice', item.id, setPracticeRows)}
                >
                  <DownloadAction row={item} text={text} />
                </RowActions>
              </td>
            </tr>
          ))
        )}
      </MiniTable>
    </div>
  );

  const renderAchievements = () => (
    <div className="admin-section-page">
      <SectionToolbar
        title={text.achievements}
        search={search}
        setSearch={setSearch}
        text={text}
        editMode={editAchievements}
        onEdit={() => setEditAchievements(true)}
        onAdd={() => addRow(setAchievementRows, emptyAchievement, 'achievement')}
        onSave={saveAchievements}
        onCancel={() => {
          setAchievementRows(normalizeRows(achievements, 'achievement').map(cleanFileData));
          setEditAchievements(false);
        }}
      >
        <select className="mini-filter-select" value={achievementType} onChange={(event) => setAchievementType(event.target.value)}>
          <option value="all">{text.allAchievements}</option>
          <option value="Сертификаты, дипломы, награды">{text.certificates}</option>
          <option value="Научные статьи">{text.scientificArticles}</option>
          <option value="Другое">{text.other}</option>
        </select>
      </SectionToolbar>

      <MiniTable columns={['№', text.title, text.type, text.teacher, text.file, text.actions]} minWidth={1000}>
        {filteredAchievements.length === 0 ? (
          <EmptyRow colSpan={6} text={text.emptyAchievements} />
        ) : (
          filteredAchievements.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td className="wrap-cell text-cell">
                {editAchievements ? (
                  <input
                    value={item.title || item.name || ''}
                    onChange={(event) =>
                      updateManyFields(setAchievementRows, item.id, {
                        title: event.target.value,
                        name: event.target.value
                      })
                    }
                  />
                ) : (
                  item.title || item.name || '-'
                )}
              </td>

              <td>
                {editAchievements ? (
                  <select
                    value={item.type || 'Сертификаты, дипломы, награды'}
                    onChange={(event) => updateRow(setAchievementRows, item.id, 'type', event.target.value)}
                  >
                    <option value="Сертификаты, дипломы, награды">{text.certificates}</option>
                    <option value="Научные статьи">{text.scientificArticles}</option>
                    <option value="Другое">{text.other}</option>
                  </select>
                ) : (
                  item.type || '-'
                )}
              </td>

              <td>
                {editAchievements ? (
                  <input
                    value={item.teacherName || ''}
                    onChange={(event) => updateRow(setAchievementRows, item.id, 'teacherName', event.target.value)}
                  />
                ) : (
                  item.teacherName || '-'
                )}
              </td>

              <td className="wrap-cell text-cell">
                {editAchievements ? (
                  <FileInputCell
                    row={item}
                    text={text}
                    onUploaded={(id, data) => updateManyFields(setAchievementRows, id, cleanFileData(data))}
                  />
                ) : (
                  <FileNameCell row={item} text={text} />
                )}
              </td>

              <td>
                <RowActions
                  text={text}
                  editMode={editAchievements}
                  onDelete={() => deleteRow('achievement', item.id, setAchievementRows)}
                >
                  <DownloadAction row={item} text={text} />
                </RowActions>
              </td>
            </tr>
          ))
        )}
      </MiniTable>
    </div>
  );

  const renderProfile = () => (
    <div className="admin-section-page">
      <div className="admin-profile-card">
        <div className="admin-profile-avatar">
          <User size={42} />
        </div>

        <div>
          <h2>{text.profile}</h2>
          <p>{t.profileSubtitle || 'Личные данные администратора портала'}</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderDashboard();

      case 'users':
        return renderUsers();

      case 'teachers':
        return renderTeachers();

      case 'students':
        return renderStudents();

      case 'programs':
        return renderPrograms();

      case 'documents':
        return renderDocuments();

      case 'reports':
        return renderReports();

      case 'practices':
        return renderPractices();

      case 'achievements':
        return renderAchievements();

      case 'profile':
        return renderProfile();

      default:
        return renderDashboard();
    }
  };

  return (
    <>
      {renderContent()}

      {accessUser && (
        <AccessModal
          text={text}
          language={language}
          user={accessUser}
          onClose={() => setAccessUser(null)}
          onSave={saveAccess}
        />
      )}

      {reportDetails && (
        <div className="admin-modal-backdrop" onClick={() => setReportDetails(null)}>
          <div
            className="admin-modal-window large"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-head">
              <div>
                <h3>{text.reportDetails || 'Просмотр отчета'}</h3>
                <p>{reportDetails.title || '-'}</p>
              </div>

              <button type="button" className="modal-close" onClick={() => setReportDetails(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="report-details-body">
              <p>
                <b>{text.description}:</b> {reportDetails.description || '-'}
              </p>

              <p>
                <b>{text.file}:</b> <FileNameCell row={reportDetails} text={text} />
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}