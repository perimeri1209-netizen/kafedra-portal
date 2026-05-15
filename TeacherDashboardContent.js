import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Plus,
  Pencil,
  Save,
  X,
  Trash2,
  Eye,
  Download,
  FolderOpen,
  FileText,
  BarChart3,
  BriefcaseBusiness,
  Award,
  CalendarDays,
  BookOpen,
  GraduationCap,
  Users,
  Activity,
  Clock3,
  Lock
} from 'lucide-react';

import { uploadFileToCloudinary } from '../../utils/cloudinaryUpload';
import './TeacherDashboard.css';

/* =========================
   HELPERS
========================= */

const makeId = (prefix = 'row') =>
  `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const lower = (value = '') => String(value || '').trim().toLowerCase();

const normalizeRole = (value = '') => {
  const role = lower(value);

  if (role === 'lab' || role === 'laborant' || role === 'лаборант') {
    return 'lab';
  }

  return 'teacher';
};

const normalizeAccessValue = (value = 'none') => {
  const access = lower(value);

  if (
    access === 'read' ||
    access === 'view' ||
    access === 'readonly' ||
    access === 'читать' ||
    access === 'просмотр' ||
    access === 'только просмотр'
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

const accessLevel = {
  none: 0,
  read: 1,
  edit: 2
};

const hasAccess = (access = {}, sectionId, requiredLevel = 'read') => {
  const current = normalizeAccessValue(access?.[sectionId]);
  const required = normalizeAccessValue(requiredLevel);

  return accessLevel[current] >= accessLevel[required];
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

const getSafeFileUrl = (row = {}) => {
  return (
    extractUrl(row.fileUrl) ||
    extractUrl(row.secure_url) ||
    extractUrl(row.downloadUrl) ||
    extractUrl(row.pdfUrl) ||
    extractUrl(row.url) ||
    ''
  );
};

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

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('ru-RU');
};

const rowHasUsefulData = (row = {}) => {
  return Boolean(
    String(row.title || '').trim() ||
      String(row.name || '').trim() ||
      String(row.discipline || '').trim() ||
      String(row.description || '').trim() ||
      String(row.fileUrl || '').trim() ||
      String(row.pdfUrl || '').trim() ||
      String(row.url || '').trim() ||
      String(row.fileName || '').trim() ||
      String(row.group || '').trim() ||
      String(row.direction || '').trim() ||
      String(row.category || '').trim() ||
      String(row.responsibleName || '').trim() ||
      String(row.curatorName || '').trim()
  );
};

/* =========================
   DICTIONARY
========================= */

const dict = {
  ru: {
    dashboard: 'Главная',
    schedule: 'Расписание',
    plans: 'Нагрузка',
    programs: 'Рабочие программы',
    documents: 'Документы',
    teacherFiles: 'Личная папка',
    students: 'Студенты',
    teachers: 'Преподаватели',
    reports: 'Отчеты',
    curatorReport: 'Кураторский отчет',
    departmentReport: 'Кафедральный отчет',
    reportCategory: 'Категория',
    responsible: 'Ответственный',
    annualReport: 'Годовой отчет',
    monthlyReport: 'Месячный отчет',
    otherReport: 'Другое',
    backToReports: 'Назад к отчетам',
    openSection: 'Открыть',
    practices: 'Практика',
    achievements: 'Достижения',

    add: 'Добавить',
    edit: 'Редактировать',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    search: 'Поиск...',
    actions: 'Действия',
    file: 'Файл',
    title: 'Название',
    description: 'Описание',
    discipline: 'Дисциплина',
    direction: 'Направление',
    course: 'Курс',
    group: 'Группа',
    fullName: 'ФИО',
    email: 'Email',
    phone: 'Телефон',
    position: 'Должность',
    type: 'Тип',
    teacher: 'Преподаватель',

    open: 'Открыть',
    download: 'Скачать',
    noFile: 'Нет файла',
    chooseFile: 'Выбрать файл',
    uploading: 'Загрузка...',

    noData: 'Данные пока не добавлены',
    noAccess: 'Нет доступа',
    accessDeniedTitle: 'Раздел недоступен',
    accessDeniedText: 'У вас нет доступа к этому разделу.',

    dashboardTitleTeacher: 'Панель преподавателя',
    dashboardTitleLab: 'Панель лаборанта',
   
    portalActivity: 'Активность на портале',
    recentActions: 'Последние действия',
    allActions: 'Все действия',
    showAll: 'Смотреть все',
    week: 'За неделю',
    month: 'За месяц',
    year: 'За год',
    noActions: 'Действий пока нет',

    directionAll: 'Все направления',
    courseAll: 'Все курсы',
    allPractices: 'Все практики',
    academicPractice: 'Учебная практика',
    productionPractice: 'Производственная практика',
    preDiplomaPractice: 'Преддипломная практика',
    allAchievements: 'Все достижения',
    certificates: 'Сертификаты, дипломы, награды',
    scientificArticles: 'Научные статьи',
    other: 'Другое'
  },

  kg: {
    dashboard: 'Башкы бет',
    schedule: 'Расписание',
    plans: 'Нагрузка',
    programs: 'Окуу программалары',
    documents: 'Документтер',
    teacherFiles: 'Жеке папка',
    students: 'Студенттер',
    teachers: 'Окутуучулар',
    reports: 'Отчеттор',
    curatorReport: 'Куратордук отчет',
    departmentReport: 'Кафедралык отчет',
    reportCategory: 'Категория',
    responsible: 'Жооптуу',
    annualReport: 'Жылдык отчет',
    monthlyReport: 'Айлык отчет',
    otherReport: 'Башка',
    backToReports: 'Отчетторго кайтуу',
    openSection: 'Ачуу',
    practices: 'Практика',
    achievements: 'Жетишкендиктер',

    add: 'Кошуу',
    edit: 'Өзгөртүү',
    save: 'Сактоо',
    cancel: 'Жокко чыгаруу',
    delete: 'Өчүрүү',
    search: 'Издөө...',
    actions: 'Аракеттер',
    file: 'Файл',
    title: 'Аталышы',
    description: 'Сүрөттөмө',
    discipline: 'Дисциплина',
    direction: 'Багыт',
    course: 'Курс',
    group: 'Группа',
    fullName: 'Аты-жөнү',
    email: 'Email',
    phone: 'Телефон',
    position: 'Кызматы',
    type: 'Түрү',
    teacher: 'Окутуучу',

    open: 'Ачуу',
    download: 'Скачать',
    noFile: 'Файл жок',
    chooseFile: 'Файл тандоо',
    uploading: 'Жүктөлүүдө...',

    noData: 'Маалымат азырынча жок',
    noAccess: 'Доступ жок',
    accessDeniedTitle: 'Бөлүм жеткиликсиз',
    accessDeniedText: 'Бул бөлүмгө сизде доступ жок.',

    dashboardTitleTeacher: 'Окутуучунун панели',
    dashboardTitleLab: 'Лаборанттын панели',
    dashboardSubtitle: 'Бөлүмдөр жана жеткиликтүү материалдар',
    portalActivity: 'Порталдагы активдүүлүк',
    recentActions: 'Акыркы аракеттер',
    allActions: 'Бардык аракеттер',
    showAll: 'Баарын көрүү',
    week: 'Апта боюнча',
    month: 'Ай боюнча',
    year: 'Жыл боюнча',
    noActions: 'Аракеттер азырынча жок',

    directionAll: 'Бардык багыттар',
    courseAll: 'Бардык курстар',
    allPractices: 'Бардык практикалар',
    academicPractice: 'Окуу практикасы',
    productionPractice: 'Өндүрүштүк практика',
    preDiplomaPractice: 'Диплом алдындагы практика',
    allAchievements: 'Бардык жетишкендиктер',
    certificates: 'Сертификаттар, дипломдор, сыйлыктар',
    scientificArticles: 'Илимий макалалар',
    other: 'Башка'
  }
};

/* =========================
   EMPTY ROWS
========================= */

const emptyProgram = {
  discipline: '',
  name: '',
  title: '',
  direction: 'ИВТ',
  course: '1',
  fileUrl: '',
  pdfUrl: '',
  url: '',
  fileName: '',
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
  groupName: '',
  role: 'student',
  status: 'active'
};

const emptyDocument = {
  title: '',
  description: '',
  fileUrl: '',
  pdfUrl: '',
  url: '',
  fileName: '',
  createdAt: Date.now()
};

const emptyTeacherFile = {
  title: '',
  description: '',
  fileUrl: '',
  pdfUrl: '',
  url: '',
  fileName: '',
  createdAt: Date.now()
};

const emptyReport = {
  reportType: 'curator',
  title: '',
  name: '',
  description: '',
  category: 'Годовой отчет',
  group: '',
  groupName: '',
  curatorName: '',
  responsibleName: '',
  academicYear: '2025-2026',
  fileUrl: '',
  pdfUrl: '',
  url: '',
  fileName: '',
  senderRole: 'teacher',
  parentReportId: '',
  readByAdmin: false,
  readByTeacher: true,
  status: 'sent',
  createdAt: Date.now()
};

const emptyPractice = {
  title: '',
  type: 'Учебная практика',
  direction: 'ИВТ',
  group: '',
  fileUrl: '',
  pdfUrl: '',
  url: '',
  fileName: '',
  createdAt: Date.now()
};

const emptyAchievement = {
  title: '',
  name: '',
  type: 'Сертификаты, дипломы, награды',
  teacherName: '',
  uploadedByRole: 'teacher',
  fileUrl: '',
  pdfUrl: '',
  url: '',
  fileName: '',
  createdAt: Date.now()
};

/* =========================
   SMALL COMPONENTS
========================= */

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

  if (!fileUrl) {
    return <span className="mini-no-file">{text.noFile}</span>;
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="cell-text-wrap file-name-cell"
    >
      {fileName || text.file}
    </a>
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

function OpenAction({ row, text }) {
  const fileUrl = getSafeFileUrl(row);

  if (!fileUrl) return null;

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mini-icon-link"
      title={text.open}
      aria-label={text.open}
    >
      <Eye size={15} />
    </a>
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

      if (!fileUrl) {
        throw new Error('Cloudinary ссылка кайтарган жок');
      }

      onUploaded(row.id, {
        fileUrl,
        fileName:
          uploaded.fileName ||
          uploaded.name ||
          uploaded.original_filename ||
          file.name,
        fileType:
          uploaded.fileType ||
          uploaded.type ||
          uploaded.mimeType ||
          file.type,
        fileSize: Number(uploaded.fileSize || uploaded.size || file.size || 0),
        publicId: uploaded.publicId || uploaded.public_id || '',
        resourceType: uploaded.resourceType || '',
        pdfUrl: '',
        url: ''
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
  canEdit = false,
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

        {canEdit &&
          (!editMode ? (
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
          ))}
      </div>
    </div>
  );
}

function AccessDenied({ text }) {
  return (
    <div className="admin-section-page teacher-section-page">
      <div className="section-shell no-access-shell">
        <div className="no-access-content">
          <Lock size={44} />

          <h3>{text.accessDeniedTitle}</h3>
          <p>{text.accessDeniedText}</p>
        </div>
      </div>
    </div>
  );
}

function RecentActionsModal({ text, actions, onClose }) {
  return createPortal(
    <div className="teacher-actions-modal-backdrop" onClick={onClose}>
      <div
        className="teacher-actions-modal-window"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="teacher-actions-modal-head">
          <div>
            <h3>{text.allActions || 'Все действия'}</h3>
            <p>{text.recentActions || 'Последние действия'}</p>
          </div>

          <button
            type="button"
            className="teacher-actions-modal-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        <div className="teacher-actions-modal-list">
          {actions.length === 0 ? (
            <div className="teacher-actions-empty">
              {text.noActions || 'Действий пока нет'}
            </div>
          ) : (
            actions.map((item, index) => (
              <div
                className="teacher-actions-modal-item"
                key={item.id || index}
              >
                <span className="teacher-actions-modal-icon">
                  {item.icon || '•'}
                </span>

                <div className="teacher-actions-modal-text">
                  <strong>{item.text || item.title || '-'}</strong>
                  <small>{formatDateTime(item.createdAt || item.date)}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
/* =========================
   MAIN COMPONENT
========================= */

export default function TeacherDashboardContent({
  activeMenu = 'dashboard',
  setActiveMenu,

  language = 'ru',
  t = {},

  teacher = {},
  userRole = 'teacher',
  teacherRole = 'teacher',
  teacherAccess = {},
  allowedMenus = [],
  canEditSection,
  canReadSection,

  schedules = [],
  plans = [],
  programs = [],
  documents = [],
  teacherFiles = [],
  files = [],
  students = [],
  teachers = [],
  users = [],
  reports = [],
  practices = [],
  achievements = [],
  recentActions = [],
  activityData = { week: [], month: [], year: [] },
  stats = {},
  currentYear = '2025-2026',

    onSavePrograms,
  onSaveDocuments,
  onSaveTeacherFiles,
  onSaveReports,
  onSavePractices,
  onSaveAchievements,

  onSaveStudents,
  onSaveTeachers,

  handleDelete,
  onDelete
}) {
  const role = normalizeRole(userRole || teacherRole || teacher.role);
  const text = {
    ...(dict[language] || dict.ru),
    ...t
  };

  const [search, setSearch] = useState('');
  const [activityPeriod, setActivityPeriod] = useState('week');

  const [programRows, setProgramRows] = useState([]);
  const [documentRows, setDocumentRows] = useState([]);
  const [fileRows, setFileRows] = useState([]);
  const [reportRows, setReportRows] = useState([]);
  const [practiceRows, setPracticeRows] = useState([]);
  const [achievementRows, setAchievementRows] = useState([]);
  const [studentRows, setStudentRows] = useState([]);
  const [teacherRows, setTeacherRows] = useState([]);

  const [editPrograms, setEditPrograms] = useState(false);
  const [editDocuments, setEditDocuments] = useState(false);
  const [editTeacherFiles, setEditTeacherFiles] = useState(false);
  const [editReports, setEditReports] = useState(false);
  const [editPractices, setEditPractices] = useState(false);
  const [editAchievements, setEditAchievements] = useState(false);
  const [editStudents, setEditStudents] = useState(false);
  const [editTeachers, setEditTeachers] = useState(false);

  const [programDirection, setProgramDirection] = useState('all');
  const [programCourse, setProgramCourse] = useState('all');

  const [practiceType, setPracticeType] = useState('all');
  const [practiceDirection, setPracticeDirection] = useState('all');

  const [achievementType, setAchievementType] = useState('all');

  const [studentDirection, setStudentDirection] = useState('all');
  const [studentCourse, setStudentCourse] = useState('all');
  const [studentType, setStudentType] = useState('active');

  const [showAllActionsModal, setShowAllActionsModal] = useState(false);
  const [reportsPage, setReportsPage] = useState('home');

  const teacherId =
    teacher.id ||
    teacher.uid ||
    teacher.teacherId ||
    localStorage.getItem('teacherId') ||
    '';

  const teacherEmail = teacher.email || localStorage.getItem('teacherEmail') || '';

  const teacherName =
    teacher.fullName ||
    teacher.name ||
    teacher.displayName ||
    localStorage.getItem('teacherName') ||
    (role === 'lab' ? 'Лаборант' : 'Преподаватель');

  const effectiveAccess = useMemo(() => {
    const prepared = {};

    [
      'schedule',
      'plans',
      'programs',
      'documents',
      'teacherFiles',
      'students',
      'teachers',
      'reports',
      'reportsCurator',
      'reportsDepartment',
      'practices',
      'achievements'
    ].forEach((sectionId) => {
      prepared[sectionId] = normalizeAccessValue(teacherAccess?.[sectionId]);
    });

    return prepared;
  }, [teacherAccess]);

  const isSectionVisible = (sectionId) => {
    if (sectionId === 'dashboard') return true;

    if (sectionId === 'reports') {
      if (Array.isArray(allowedMenus) && allowedMenus.length > 0) {
        return (
          allowedMenus.includes('reports') ||
          allowedMenus.includes('reportsCurator') ||
          allowedMenus.includes('reportsDepartment')
        );
      }

      if (typeof canReadSection === 'function') {
        return (
          canReadSection('reports') ||
          canReadSection('reportsCurator') ||
          canReadSection('reportsDepartment')
        );
      }

      return (
        hasAccess(effectiveAccess, 'reports', 'read') ||
        hasAccess(effectiveAccess, 'reportsCurator', 'read') ||
        hasAccess(effectiveAccess, 'reportsDepartment', 'read')
      );
    }

    if (sectionId === 'reportsCurator' || sectionId === 'reportsDepartment') {
      if (Array.isArray(allowedMenus) && allowedMenus.length > 0) {
        return allowedMenus.includes(sectionId) || allowedMenus.includes('reports');
      }

      if (typeof canReadSection === 'function') {
        return canReadSection(sectionId) || canReadSection('reports');
      }

      return (
        hasAccess(effectiveAccess, sectionId, 'read') ||
        hasAccess(effectiveAccess, 'reports', 'read')
      );
    }

    if (Array.isArray(allowedMenus) && allowedMenus.length > 0) {
      return allowedMenus.includes(sectionId);
    }

    if (typeof canReadSection === 'function') {
      return canReadSection(sectionId);
    }

    return hasAccess(effectiveAccess, sectionId, 'read');
  };

  const canEdit = (sectionId) => {
    if (sectionId === 'reports') {
      return canEdit('reportsCurator') || canEdit('reportsDepartment');
    }

    if (sectionId === 'reportsCurator' || sectionId === 'reportsDepartment') {
      if (typeof canEditSection === 'function') {
        return canEditSection(sectionId) || canEditSection('reports');
      }

      return (
        hasAccess(effectiveAccess, sectionId, 'edit') ||
        hasAccess(effectiveAccess, 'reports', 'edit')
      );
    }

    if (typeof canEditSection === 'function') {
      return canEditSection(sectionId);
    }

    return hasAccess(effectiveAccess, sectionId, 'edit');
  };

  useEffect(() => {
    if (!isSectionVisible(activeMenu)) {
      setActiveMenu?.('dashboard');
    }
  }, [activeMenu, effectiveAccess, allowedMenus, setActiveMenu]);

  useEffect(() => {
    setSearch('');
  }, [activeMenu]);

  useEffect(() => {
    setProgramRows(normalizeRows(programs, 'program').map(cleanFileData));
  }, [programs]);

  useEffect(() => {
    setDocumentRows(normalizeRows(documents, 'document').map(cleanFileData));
  }, [documents]);

  useEffect(() => {
    const sourceFiles = teacherFiles.length > 0 ? teacherFiles : files;
    setFileRows(normalizeRows(sourceFiles, 'teacher_file').map(cleanFileData));
  }, [teacherFiles, files]);

  useEffect(() => {
    setReportRows(normalizeRows(reports, 'report').map(cleanFileData));
  }, [reports]);

  useEffect(() => {
    setPracticeRows(normalizeRows(practices, 'practice').map(cleanFileData));
  }, [practices]);

  useEffect(() => {
    setAchievementRows(normalizeRows(achievements, 'achievement').map(cleanFileData));
  }, [achievements]);

  useEffect(() => {
    setStudentRows(normalizeRows(students, 'student').map(cleanFileData));
  }, [students]);

  useEffect(() => {
    const source = normalizeRows(teachers.length > 0 ? teachers : users, 'teacher');

    const onlyTeachers = source.filter((item) => {
      const itemRole = normalizeRole(item.role || item.position);
      return itemRole === 'teacher' || itemRole === 'lab';
    });

    setTeacherRows(onlyTeachers.map(cleanFileData));
  }, [teachers, users]);

  useEffect(() => {
    if (!canEdit('programs')) setEditPrograms(false);
    if (!canEdit('documents')) setEditDocuments(false);
    if (!canEdit('teacherFiles')) setEditTeacherFiles(false);
    if (!canEdit('reportsCurator') && !canEdit('reportsDepartment')) setEditReports(false);
    if (!canEdit('practices')) setEditPractices(false);
    if (!canEdit('achievements')) setEditAchievements(false);
  }, [effectiveAccess]);

  const filterRows = (rows = [], fields = []) => {
    const q = lower(search);

    if (!q) return rows;

    return rows.filter((row) =>
      lower(fields.map((field) => row?.[field] || '').join(' ')).includes(q)
    );
  };

  const updateRow = (setRows, id, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              updatedAt: Date.now()
            }
          : row
      )
    );
  };

  const updateManyFields = (setRows, id, fields) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              ...fields,
              updatedAt: Date.now()
            }
          : row
      )
    );
  };

  const addRow = (setRows, emptyRow, prefix) => {
    setRows((prev) => [
      {
        ...emptyRow,
        id: `new_${makeId(prefix)}`,
        isNew: true,
        teacherId,
        teacherName,
        teacherEmail,
        senderId: teacherId,
        senderName: teacherName,
        senderEmail: teacherEmail,
        senderRole: role,
        createdByRole: role,
        uploadedByRole: role,
        createdAt: Date.now(),
        year: currentYear
      },
      ...prev
    ]);
  };

  const deleteRow = async (type, id, setRows) => {
    if (!id) return;

    if (!window.confirm('Удалить запись?')) return;

    const rowIsNew = String(id).startsWith('new_') || String(id).includes('_new_');

    if (rowIsNew) {
      setRows((prev) => prev.filter((row) => row.id !== id));
      return;
    }

    try {
      if (typeof handleDelete === 'function') {
        await handleDelete(type, id);
      } else if (typeof onDelete === 'function') {
        await onDelete(type, id);
      } else {
        alert('Өчүрүү функциясы туташкан эмес');
        return;
      }

      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (error) {
      alert('Өчүрүүдө ката кетти');
    }
  };

  const prepareCommonRow = (row, type) => {
    const cleanRow = cleanFileData(row);

    return {
      ...row,
      ...cleanRow,
      id: row.id,
      type: row.type || type,
      teacherId: row.teacherId || teacherId,
      teacherName: row.teacherName || teacherName,
      teacherEmail: row.teacherEmail || teacherEmail,
      senderId: row.senderId || teacherId,
      senderName: row.senderName || teacherName,
      senderEmail: row.senderEmail || teacherEmail,
      senderRole: row.senderRole || role,
      createdByRole: row.createdByRole || role,
      uploadedByRole: row.uploadedByRole || role,
      year: row.year || currentYear,
      createdAt: row.createdAt || Date.now(),
      updatedAt: Date.now()
    };
  };

  const filteredSchedules = useMemo(() => {
    return filterRows(normalizeRows(schedules, 'schedule'), [
      'day',
      'time',
      'subject',
      'discipline',
      'teacher',
      'teacherName',
      'group',
      'groupName',
      'room'
    ]);
  }, [schedules, search]);

  const filteredPlans = useMemo(() => {
    return filterRows(normalizeRows(plans, 'plan'), [
      'code',
      'disciplineName',
      'name',
      'group',
      'groupName',
      'direction'
    ]);
  }, [plans, search]);

  const filteredPrograms = useMemo(() => {
    let rows = programRows;

    if (programDirection !== 'all') {
      rows = rows.filter((row) => String(row.direction || '') === String(programDirection));
    }

    if (programCourse !== 'all') {
      rows = rows.filter((row) => String(row.course || '') === String(programCourse));
    }

    return filterRows(rows, [
      'discipline',
      'name',
      'title',
      'direction',
      'course',
      'fileName'
    ]);
  }, [programRows, search, programDirection, programCourse]);

  const filteredDocuments = useMemo(() => {
    return filterRows(documentRows, ['title', 'name', 'description', 'fileName']);
  }, [documentRows, search]);

  const filteredTeacherFiles = useMemo(() => {
    return filterRows(fileRows, ['title', 'name', 'description', 'fileName']);
  }, [fileRows, search]);

  const filteredCuratorReports = useMemo(() => {
    return filterRows(reportRows, [
      'title',
      'name',
      'description',
      'group',
      'groupName',
      'curatorName',
      'academicYear',
      'fileName',
      'senderName',
      'receiverTeacherName'
    ]).filter(
      (row) =>
        !row.parentReportId &&
        (row.reportType || 'curator') === 'curator'
    );
  }, [reportRows, search]);

  const filteredDepartmentReports = useMemo(() => {
    return filterRows(reportRows, [
      'title',
      'name',
      'description',
      'category',
      'responsibleName',
      'academicYear',
      'fileName',
      'senderName',
      'receiverTeacherName'
    ]).filter(
      (row) =>
        !row.parentReportId &&
        row.reportType === 'department'
    );
  }, [reportRows, search]);

  const filteredReports = useMemo(() => {
    return [...filteredCuratorReports, ...filteredDepartmentReports];
  }, [filteredCuratorReports, filteredDepartmentReports]);

  const filteredPractices = useMemo(() => {
    let rows = practiceRows;

    if (practiceType !== 'all') {
      rows = rows.filter((row) => row.type === practiceType);
    }

    if (practiceDirection !== 'all') {
      rows = rows.filter((row) => row.direction === practiceDirection);
    }

    return filterRows(rows, ['title', 'type', 'direction', 'group', 'fileName']);
  }, [practiceRows, search, practiceType, practiceDirection]);

  const filteredAchievements = useMemo(() => {
    let rows = achievementRows;

    if (achievementType !== 'all') {
      rows = rows.filter((row) => row.type === achievementType);
    }

    return filterRows(rows, ['title', 'name', 'type', 'teacherName', 'fileName']);
  }, [achievementRows, search, achievementType]);

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

  setStudentType('active');
};

  const filteredStudents = useMemo(() => {
    let rows = studentRows.filter(
      (student) =>
        !(
          student.isGraduate === true ||
          student.status === 'graduate' ||
          student.studentStatus === 'graduate' ||
          student.course === 'graduate'
        )
    );

    if (studentDirection !== 'all') {
      rows = rows.filter((student) => student.direction === studentDirection);
    }

    if (studentCourse !== 'all') {
      rows = rows.filter(
        (student) => String(student.course || '') === String(studentCourse)
      );
    }

    return filterRows(rows, [
      'fullName',
      'name',
      'email',
      'phone',
      'direction',
      'course',
      'group',
      'groupName'
    ]);
  }, [studentRows, search, studentDirection, studentCourse]);

  const filteredTeachers = useMemo(() => {
    return filterRows(teacherRows, ['fullName', 'name', 'email', 'phone', 'position']);
  }, [teacherRows, search]);

  const saveRows = async (sectionId, rows, saver, setEditMode) => {
    if (!canEdit(sectionId)) {
      alert(text.noAccess);
      return;
    }

    try {
      const preparedRows = rows
        .filter(rowHasUsefulData)
        .map((row) => prepareCommonRow(row, sectionId));

      if (typeof saver === 'function') {
        await saver(preparedRows);
      } else {
        alert('Сактоо функциясы туташкан эмес');
        return;
      }

      setEditMode(false);
    } catch (error) {
      alert(`Сактоодо ката кетти: ${error.message}`);
    }
  };

  const saveReports = async () => {
    if (!canEdit('reportsCurator') && !canEdit('reportsDepartment')) {
      alert(text.noAccess);
      return;
    }

    try {
      const preparedRows = reportRows
        .filter(rowHasUsefulData)
        .map((row) => {
          const reportType = row.reportType || 'curator';

          return prepareCommonRow(
            {
              ...emptyReport,
              ...row,
              reportType,
              category: reportType === 'department' ? row.category || 'Годовой отчет' : '',
              group:
                reportType === 'curator'
                  ? row.group || row.groupName || ''
                  : '',
              groupName:
                reportType === 'curator'
                  ? row.groupName || row.group || ''
                  : '',
              curatorName:
                reportType === 'curator'
                  ? row.curatorName || row.responsibleName || teacherName
                  : '',
              responsibleName:
                reportType === 'department'
                  ? row.responsibleName || row.curatorName || teacherName
                  : '',
              academicYear: row.academicYear || currentYear,
              title: row.title || row.name || '',
              name: row.name || row.title || ''
            },
            'report'
          );
        });

      if (typeof onSaveReports === 'function') {
        await onSaveReports(preparedRows);
      } else {
        alert('Отчет сактоо функциясы туташкан эмес');
        return;
      }

      setEditReports(false);
    } catch (error) {
      alert(`Отчет сактоодо ката кетти: ${error.message}`);
    }
  };

  const dashboardCards = [
    {
      id: 'schedule',
      title: text.schedule,
      value: stats.schedule || normalizeRows(schedules, 'schedule').length || 0,
      icon: CalendarDays
    },
    {
      id: 'plans',
      title: text.plans,
      value: stats.plans || normalizeRows(plans, 'plan').length || 0,
      icon: BookOpen
    },
    {
      id: 'programs',
      title: text.programs,
      value: stats.programs || programRows.length || 0,
      icon: FileText
    },
    {
      id: 'documents',
      title: text.documents,
      value: stats.documents || documentRows.length || 0,
      icon: FolderOpen
    },
    {
      id: 'teacherFiles',
      title: text.teacherFiles,
      value: stats.teacherFiles || fileRows.length || 0,
      icon: Download
    },
    {
      id: 'reports',
      title: text.reports,
      value: stats.reports || filteredReports.length || 0,
      icon: BarChart3
    },
    {
      id: 'practices',
      title: text.practices,
      value: stats.practices || practiceRows.length || 0,
      icon: BriefcaseBusiness
    },
    {
      id: 'achievements',
      title: text.achievements,
      value: stats.achievements || achievementRows.length || 0,
      icon: Award
    },
    {
      id: 'students',
      title: text.students,
      value: stats.students || studentRows.length || 0,
      icon: GraduationCap
    },
    {
      id: 'teachers',
      title: text.teachers,
      value: stats.teachers || teacherRows.length || 0,
      icon: Users
    }
  ].filter((card) => isSectionVisible(card.id));

  const activityRows = Array.isArray(activityData)
    ? activityData
    : activityData?.[activityPeriod] || [];
const renderDashboardIcon = (Icon) => {
  if (!Icon) return null;

  if (React.isValidElement(Icon)) {
    return Icon;
  }

  if (typeof Icon === 'function' || typeof Icon === 'object') {
    return React.createElement(Icon, {
      size: 22,
      strokeWidth: 2.2
    });
  }

  return null;
};

  const renderDashboard = () => {
  const cards = dashboardCards || [];

  const activityItems =
    activityData?.[activityPeriod]?.length > 0
      ? activityData[activityPeriod]
      : [];

  const maxValue = Math.max(
    1,
    ...activityItems.map((item) => Number(item.value || item.count || item.total || 0))
  );

  const shortRecentActions = Array.isArray(recentActions)
    ? recentActions.slice(0, 6)
    : [];

  const getCardColor = (index) => {
    const colors = ['violet', 'green', 'orange', 'violet', 'blue', 'green', 'orange', 'violet'];
    return colors[index % colors.length];
  };

  return (
    <div className="admin-section-page admin-home-look teacher-home-look">
      <div className="admin-main-title">
        <h1>
          {role === 'lab'
            ? text.dashboardTitleLab || 'Панель лаборанта'
            : text.dashboardTitleTeacher || 'Панель преподавателя'}
        </h1>

      </div>

      <div className="modern-stats-row teacher-modern-stats">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              type="button"
              className={`modern-stat-box dashboard-click-card teacher-stat-mini ${getCardColor(index)}`}
              onClick={() => setActiveMenu?.(card.id)}
            >
              <span className={`modern-stat-icon stat-color-${(index % 5) + 1}`}>
                {renderDashboardIcon(Icon)}
              </span>

              <span className="stat-content teacher-stat-info">
                <span className="stat-title">{card.title}</span>
                <strong className="stat-number">{card.value}</strong>
                <span className="stat-trend">
                  {card.meta || card.title}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="admin-home-grid teacher-home-grid">
        <div className="dashboard-card modern-card activity-card teacher-activity-card">
          <div className="card-head modern-card-head">
            <h3>
              <Activity size={18} strokeWidth={2.2} />
              {text.portalActivity || 'Активность на портале'}
            </h3>

            <select
              className="period teacher-period-select"
              value={activityPeriod}
              onChange={(event) => setActivityPeriod(event.target.value)}
            >
              <option value="week">{text.week || 'За неделю'}</option>
              <option value="month">{text.month || 'За месяц'}</option>
              <option value="year">{text.year || 'За год'}</option>
            </select>
          </div>

          {activityItems.length === 0 ? (
            <div className="dashboard-empty-box">
              {text.activityEmpty || 'Активности пока нет.'}
            </div>
          ) : (
            <div
              className={`simple-chart teacher-simple-chart ${
                activityPeriod === 'year' ? 'simple-chart-year' : ''
              }`}
            >
              {activityItems.map((item, index) => {
                const value = Number(item.value || item.count || item.total || 0);
                const height = Math.max(8, (value / maxValue) * 100);
                const label =
                  item.day ||
                  item.label ||
                  item.name ||
                  item.month ||
                  `${index + 1}`;

                return (
                  <div
                    className="simple-chart-item teacher-chart-item"
                    key={`${label}_${index}`}
                  >
                    <div className="simple-chart-value teacher-chart-value">
                      {value}
                    </div>

                    <div className="simple-chart-bar-wrap teacher-chart-bar-wrap">
                      <div
                        className="simple-chart-bar teacher-chart-bar"
                        style={{ height: `${height}%` }}
                      />
                    </div>

                    <div className="simple-chart-label teacher-chart-label">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        
        <div className="dashboard-card modern-card recent-card teacher-recent-card">
          <div className="card-head modern-card-head">
            <h3>
              <Clock3 size={18} strokeWidth={2.2} />
              {text.recentActions || 'Последние действия'}
            </h3>

           <button
  type="button"
  className="modern-link-btn"
  onClick={() => setShowAllActionsModal(true)}
>
  Смотреть все
</button>
          </div>

          <div className="modern-actions-list teacher-recent-actions-list">
            {shortRecentActions.length === 0 ? (
              <div className="dashboard-empty-box">
                {text.actionsEmpty || text.noActions || 'Действий пока нет.'}
              </div>
            ) : (
              shortRecentActions.map((item, index) => (
                <div
                  className="modern-action-item teacher-recent-action-item"
                  key={item.id || index}
                >
                  <span className="modern-action-icon teacher-recent-action-icon">
                    {item.icon || '•'}
                  </span>

                  <div className="modern-action-text teacher-recent-action-text">
                    <strong>{item.text || item.title || '-'}</strong>
                    <small>{formatDateTime(item.createdAt || item.date)}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAllActionsModal && (
        <RecentActionsModal
          text={text}
          actions={Array.isArray(recentActions) ? recentActions : []}
          onClose={() => setShowAllActionsModal(false)}
        />
      )}
    </div>
  );
};
            
  const renderSchedule = () => {
    if (!isSectionVisible('schedule')) return <AccessDenied text={text} />;

    return (
      <div className="admin-section-page teacher-section-page">
        <SectionToolbar
          title={text.schedule}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={false}
          canEdit={false}
        />

        <MiniTable
          columns={['№', 'День', 'Время', 'Дисциплина', text.group, 'Кабинет']}
          minWidth={900}
        >
          {filteredSchedules.length === 0 ? (
            <EmptyRow colSpan={6} text={text.noData} />
          ) : (
            filteredSchedules.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.day || '-'}</td>
                <td>{item.time || '-'}</td>
                <td className="wrap-cell text-cell">
                  {item.subject || item.discipline || item.name || '-'}
                </td>
                <td>{item.group || item.groupName || '-'}</td>
                <td>{item.room || item.auditory || '-'}</td>
              </tr>
            ))
          )}
        </MiniTable>
      </div>
    );
  };

  const renderPlans = () => {
    if (!isSectionVisible('plans')) return <AccessDenied text={text} />;

    return (
      <div className="admin-section-page teacher-section-page">
        <SectionToolbar
          title={text.plans}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={false}
          canEdit={false}
        />

        <MiniTable
          columns={['№', 'Код', text.discipline, text.group, text.direction, 'Кредиты']}
          minWidth={900}
        >
          {filteredPlans.length === 0 ? (
            <EmptyRow colSpan={6} text={text.noData} />
          ) : (
            filteredPlans.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.code || '-'}</td>
                <td className="wrap-cell text-cell">
                  {item.disciplineName || item.name || item.discipline || '-'}
                </td>
                <td>{item.group || item.groupName || '-'}</td>
                <td>{item.direction || '-'}</td>
                <td>{item.credits || '-'}</td>
              </tr>
            ))
          )}
        </MiniTable>
      </div>
    );
  };

  const renderPrograms = () => {
    const sectionId = 'programs';
    const editable = canEdit(sectionId);

    if (!isSectionVisible(sectionId)) return <AccessDenied text={text} />;

    return (
      <div className="admin-section-page teacher-section-page">
        <SectionToolbar
          title={text.programs}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={editPrograms}
          canEdit={editable}
          onEdit={() => setEditPrograms(true)}
          onAdd={() => addRow(setProgramRows, emptyProgram, 'program')}
          onSave={() => saveRows(sectionId, programRows, onSavePrograms, setEditPrograms)}
          onCancel={() => {
            setProgramRows(normalizeRows(programs, 'program').map(cleanFileData));
            setEditPrograms(false);
          }}
        >
          <select
            className="mini-filter-select"
            value={programDirection}
            onChange={(event) => setProgramDirection(event.target.value)}
          >
            <option value="all">{text.directionAll}</option>
            <option value="ИВТ">ИВТ</option>
            <option value="ПИЭ">ПИЭ</option>
          </select>

          <select
            className="mini-filter-select"
            value={programCourse}
            onChange={(event) => setProgramCourse(event.target.value)}
          >
            <option value="all">{text.courseAll}</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </SectionToolbar>

        <MiniTable
          columns={[
            '№',
            text.discipline,
            text.direction,
            text.course,
            text.file,
            text.actions
          ]}
          minWidth={1000}
        >
          {filteredPrograms.length === 0 ? (
            <EmptyRow colSpan={6} text={text.noData} />
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
                      placeholder={text.discipline}
                    />
                  ) : (
                    item.discipline || item.name || item.title || '-'
                  )}
                </td>

                <td>
                  {editPrograms ? (
                    <select
                      value={item.direction || 'ИВТ'}
                      onChange={(event) =>
                        updateRow(setProgramRows, item.id, 'direction', event.target.value)
                      }
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
                      onChange={(event) =>
                        updateRow(setProgramRows, item.id, 'course', event.target.value)
                      }
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
                      onUploaded={(id, data) =>
                        updateManyFields(setProgramRows, id, cleanFileData(data))
                      }
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
                    <OpenAction row={item} text={text} />
                    <DownloadAction row={item} text={text} />
                  </RowActions>
                </td>
              </tr>
            ))
          )}
        </MiniTable>
      </div>
    );
  };

  const renderDocuments = () => {
    const sectionId = 'documents';
    const editable = canEdit(sectionId);

    if (!isSectionVisible(sectionId)) return <AccessDenied text={text} />;

    return (
      <div className="admin-section-page teacher-section-page">
        <SectionToolbar
          title={text.documents}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={editDocuments}
          canEdit={editable}
          onEdit={() => setEditDocuments(true)}
          onAdd={() => addRow(setDocumentRows, emptyDocument, 'document')}
          onSave={() => saveRows(sectionId, documentRows, onSaveDocuments, setEditDocuments)}
          onCancel={() => {
            setDocumentRows(normalizeRows(documents, 'document').map(cleanFileData));
            setEditDocuments(false);
          }}
        />

        <MiniTable columns={['№', text.title, text.description, text.file, text.actions]} minWidth={950}>
          {filteredDocuments.length === 0 ? (
            <EmptyRow colSpan={5} text={text.noData} />
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
                      placeholder={text.title}
                    />
                  ) : (
                    item.title || item.name || '-'
                  )}
                </td>

                <td className="wrap-cell text-cell">
                  {editDocuments ? (
                    <textarea
                      value={item.description || ''}
                      onChange={(event) =>
                        updateRow(setDocumentRows, item.id, 'description', event.target.value)
                      }
                      placeholder={text.description}
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
                      onUploaded={(id, data) =>
                        updateManyFields(setDocumentRows, id, cleanFileData(data))
                      }
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
                    <OpenAction row={item} text={text} />
                    <DownloadAction row={item} text={text} />
                  </RowActions>
                </td>
              </tr>
            ))
          )}
        </MiniTable>
      </div>
    );
  };

  const renderTeacherFiles = () => {
    const sectionId = 'teacherFiles';
    const editable = canEdit(sectionId);

    if (!isSectionVisible(sectionId)) return <AccessDenied text={text} />;

    return (
      <div className="admin-section-page teacher-section-page">
        <SectionToolbar
          title={text.teacherFiles}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={editTeacherFiles}
          canEdit={editable}
          onEdit={() => setEditTeacherFiles(true)}
          onAdd={() => addRow(setFileRows, emptyTeacherFile, 'teacher_file')}
          onSave={() =>
            saveRows(sectionId, fileRows, onSaveTeacherFiles, setEditTeacherFiles)
          }
          onCancel={() => {
            const sourceFiles = teacherFiles.length > 0 ? teacherFiles : files;
            setFileRows(normalizeRows(sourceFiles, 'teacher_file').map(cleanFileData));
            setEditTeacherFiles(false);
          }}
        />

        <MiniTable columns={['№', text.title, text.description, text.file, text.actions]} minWidth={950}>
          {filteredTeacherFiles.length === 0 ? (
            <EmptyRow colSpan={5} text={text.noData} />
          ) : (
            filteredTeacherFiles.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td className="wrap-cell text-cell">
                  {editTeacherFiles ? (
                    <input
                      value={item.title || item.name || ''}
                      onChange={(event) =>
                        updateManyFields(setFileRows, item.id, {
                          title: event.target.value,
                          name: event.target.value
                        })
                      }
                      placeholder={text.title}
                    />
                  ) : (
                    item.title || item.name || '-'
                  )}
                </td>

                <td className="wrap-cell text-cell">
                  {editTeacherFiles ? (
                    <textarea
                      value={item.description || ''}
                      onChange={(event) =>
                        updateRow(setFileRows, item.id, 'description', event.target.value)
                      }
                      placeholder={text.description}
                    />
                  ) : (
                    item.description || '-'
                  )}
                </td>

                <td className="wrap-cell text-cell">
                  {editTeacherFiles ? (
                    <FileInputCell
                      row={item}
                      text={text}
                      onUploaded={(id, data) =>
                        updateManyFields(setFileRows, id, cleanFileData(data))
                      }
                    />
                  ) : (
                    <FileNameCell row={item} text={text} />
                  )}
                </td>

                <td>
                  <RowActions
                    text={text}
                    editMode={editTeacherFiles}
                    onDelete={() => deleteRow('teacherFile', item.id, setFileRows)}
                  >
                    <OpenAction row={item} text={text} />
                    <DownloadAction row={item} text={text} />
                  </RowActions>
                </td>
              </tr>
            ))
          )}
        </MiniTable>
      </div>
    );
  };

  const getReportTitle = (reportType) =>
    reportType === 'department' ? text.departmentReport : text.curatorReport;

  const getReportRows = (reportType) =>
    reportType === 'department' ? filteredDepartmentReports : filteredCuratorReports;

  const getReportCanEdit = (reportType) =>
    reportType === 'department' ? canEdit('reportsDepartment') : canEdit('reportsCurator');

  const renderReportsHome = () => {
    const cards = [
      {
        id: 'curator',
        title: text.curatorReport,
        count: filteredCuratorReports.length,
        visible: isSectionVisible('reportsCurator'),
        icon: GraduationCap
      },
      {
        id: 'department',
        title: text.departmentReport,
        count: filteredDepartmentReports.length,
        visible: isSectionVisible('reportsDepartment'),
        icon: BarChart3
      }
    ].filter((card) => card.visible);

    return (
      <div className="admin-section-page teacher-section-page reports-home-page">
        <div className="reports-clean-grid">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                type="button"
                key={card.id}
                className="report-clean-card"
                onClick={() => setReportsPage(card.id)}
              >
                <span className="report-clean-icon">
                  <Icon size={26} />
                </span>

                <span className="report-clean-info">
                  <strong>{card.title}</strong>
                  <small>{card.count}</small>
                </span>

                <span className="report-clean-open">{text.openSection}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReportTable = (reportType) => {
    const rows = getReportRows(reportType);
    const editable = getReportCanEdit(reportType);
    const isDepartment = reportType === 'department';

    return (
      <div className="admin-section-page teacher-section-page">
        <SectionToolbar
          title={getReportTitle(reportType)}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={editReports}
          canEdit={editable}
          onEdit={() => setEditReports(true)}
          onAdd={() =>
            addRow(
              setReportRows,
              {
                ...emptyReport,
                reportType,
                category: isDepartment ? 'Годовой отчет' : '',
                group: '',
                groupName: '',
                curatorName: isDepartment ? '' : teacherName,
                responsibleName: isDepartment ? teacherName : '',
                academicYear: currentYear
              },
              'report'
            )
          }
          onSave={saveReports}
          onCancel={() => {
            setReportRows(normalizeRows(reports, 'report').map(cleanFileData));
            setEditReports(false);
          }}
        >
          <button
            type="button"
            className="mini-btn cancel"
            onClick={() => {
              setReportsPage('home');
              setSearch('');
            }}
          >
            {text.backToReports}
          </button>
        </SectionToolbar>

        <MiniTable
          columns={
            isDepartment
              ? ['№', text.title, text.reportCategory, text.responsible, 'Учебный год', text.file, text.actions]
              : ['№', text.title, text.group, 'Куратор', 'Учебный год', text.file, text.actions]
          }
          minWidth={1150}
        >
          {rows.length === 0 ? (
            <EmptyRow colSpan={7} text={text.noData} />
          ) : (
            rows.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td className="wrap-cell text-cell">
                  {editReports ? (
                    <input
                      value={item.title || item.name || ''}
                      onChange={(event) =>
                        updateManyFields(setReportRows, item.id, {
                          title: event.target.value,
                          name: event.target.value
                        })
                      }
                      placeholder={text.title}
                    />
                  ) : (
                    item.title || item.name || '-'
                  )}
                </td>

                {isDepartment ? (
                  <>
                    <td>
                      {editReports ? (
                        <select
                          value={item.category || 'Годовой отчет'}
                          onChange={(event) =>
                            updateRow(setReportRows, item.id, 'category', event.target.value)
                          }
                        >
                          <option value="Годовой отчет">{text.annualReport}</option>
                          <option value="Месячный отчет">{text.monthlyReport}</option>
                          <option value="Другое">{text.otherReport}</option>
                        </select>
                      ) : (
                        item.category || '-'
                      )}
                    </td>

                    <td className="wrap-cell text-cell">
                      {editReports ? (
                        <input
                          value={item.responsibleName || ''}
                          onChange={(event) =>
                            updateRow(
                              setReportRows,
                              item.id,
                              'responsibleName',
                              event.target.value
                            )
                          }
                          placeholder={text.responsible}
                        />
                      ) : (
                        item.responsibleName || item.senderName || '-'
                      )}
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      {editReports ? (
                        <input
                          value={item.group || item.groupName || ''}
                          onChange={(event) =>
                            updateManyFields(setReportRows, item.id, {
                              group: event.target.value,
                              groupName: event.target.value
                            })
                          }
                          placeholder={text.group}
                        />
                      ) : (
                        item.group || item.groupName || '-'
                      )}
                    </td>

                    <td className="wrap-cell text-cell">
                      {editReports ? (
                        <input
                          value={item.curatorName || ''}
                          onChange={(event) =>
                            updateRow(setReportRows, item.id, 'curatorName', event.target.value)
                          }
                          placeholder="Куратор"
                        />
                      ) : (
                        item.curatorName || item.senderName || '-'
                      )}
                    </td>
                  </>
                )}

                <td>
                  {editReports ? (
                    <input
                      value={item.academicYear || currentYear}
                      onChange={(event) =>
                        updateRow(setReportRows, item.id, 'academicYear', event.target.value)
                      }
                      placeholder="2025-2026"
                    />
                  ) : (
                    item.academicYear || item.year || currentYear
                  )}
                </td>

                <td className="wrap-cell text-cell">
                  {editReports ? (
                    <FileInputCell
                      row={item}
                      text={text}
                      onUploaded={(id, data) =>
                        updateManyFields(setReportRows, id, cleanFileData(data))
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
                    <OpenAction row={item} text={text} />
                    <DownloadAction row={item} text={text} />
                  </RowActions>
                </td>
              </tr>
            ))
          )}
        </MiniTable>
      </div>
    );
  };

  const renderReports = () => {
    if (!isSectionVisible('reports')) return <AccessDenied text={text} />;

    if (reportsPage === 'curator') return renderReportTable('curator');
    if (reportsPage === 'department') return renderReportTable('department');

    return renderReportsHome();
  };

  const renderPractices = () => {
    const sectionId = 'practices';
    const editable = canEdit(sectionId);

    if (!isSectionVisible(sectionId)) return <AccessDenied text={text} />;

    return (
      <div className="admin-section-page teacher-section-page">
        <SectionToolbar
          title={text.practices}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={editPractices}
          canEdit={editable}
          onEdit={() => setEditPractices(true)}
          onAdd={() => addRow(setPracticeRows, emptyPractice, 'practice')}
          onSave={() =>
            saveRows(sectionId, practiceRows, onSavePractices, setEditPractices)
          }
          onCancel={() => {
            setPracticeRows(normalizeRows(practices, 'practice').map(cleanFileData));
            setEditPractices(false);
          }}
        >
          <select
            className="mini-filter-select"
            value={practiceType}
            onChange={(event) => setPracticeType(event.target.value)}
          >
            <option value="all">{text.allPractices}</option>
            <option value="Учебная практика">{text.academicPractice}</option>
            <option value="Производственная практика">{text.productionPractice}</option>
            <option value="Преддипломная практика">{text.preDiplomaPractice}</option>
          </select>

          <select
            className="mini-filter-select"
            value={practiceDirection}
            onChange={(event) => setPracticeDirection(event.target.value)}
          >
            <option value="all">{text.directionAll}</option>
            <option value="ИВТ">ИВТ</option>
            <option value="ПИЭ">ПИЭ</option>
          </select>
        </SectionToolbar>

        <MiniTable
          columns={['№', 'Тип практики', text.group, text.direction, text.file, text.actions]}
          minWidth={1050}
        >
          {filteredPractices.length === 0 ? (
            <EmptyRow colSpan={6} text={text.noData} />
          ) : (
            filteredPractices.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td>
                  {editPractices ? (
                    <select
                      value={item.type || 'Учебная практика'}
                      onChange={(event) =>
                        updateRow(setPracticeRows, item.id, 'type', event.target.value)
                      }
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
                      onChange={(event) =>
                        updateRow(setPracticeRows, item.id, 'group', event.target.value)
                      }
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
                      onChange={(event) =>
                        updateRow(setPracticeRows, item.id, 'direction', event.target.value)
                      }
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
                      onUploaded={(id, data) =>
                        updateManyFields(setPracticeRows, id, cleanFileData(data))
                      }
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
                    <OpenAction row={item} text={text} />
                    <DownloadAction row={item} text={text} />
                  </RowActions>
                </td>
              </tr>
            ))
          )}
        </MiniTable>
      </div>
    );
  };

  const renderAchievements = () => {
    const sectionId = 'achievements';
    const editable = canEdit(sectionId);

    if (!isSectionVisible(sectionId)) return <AccessDenied text={text} />;

    return (
      <div className="admin-section-page teacher-section-page">
        <SectionToolbar
          title={text.achievements}
          search={search}
          setSearch={setSearch}
          text={text}
          editMode={editAchievements}
          canEdit={editable}
          onEdit={() => setEditAchievements(true)}
          onAdd={() => addRow(setAchievementRows, emptyAchievement, 'achievement')}
          onSave={() =>
            saveRows(sectionId, achievementRows, onSaveAchievements, setEditAchievements)
          }
          onCancel={() => {
            setAchievementRows(normalizeRows(achievements, 'achievement').map(cleanFileData));
            setEditAchievements(false);
          }}
        >
          <select
            className="mini-filter-select"
            value={achievementType}
            onChange={(event) => setAchievementType(event.target.value)}
          >
            <option value="all">{text.allAchievements}</option>
            <option value="Сертификаты, дипломы, награды">{text.certificates}</option>
            <option value="Научные статьи">{text.scientificArticles}</option>
            <option value="Другое">{text.other}</option>
          </select>
        </SectionToolbar>

        <MiniTable columns={['№', text.title, text.type, text.teacher, text.file, text.actions]} minWidth={1050}>
          {filteredAchievements.length === 0 ? (
            <EmptyRow colSpan={6} text={text.noData} />
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
                      placeholder={text.title}
                    />
                  ) : (
                    item.title || item.name || '-'
                  )}
                </td>

                <td>
                  {editAchievements ? (
                    <select
                      value={item.type || 'Сертификаты, дипломы, награды'}
                      onChange={(event) =>
                        updateRow(setAchievementRows, item.id, 'type', event.target.value)
                      }
                    >
                      <option value="Сертификаты, дипломы, награды">{text.certificates}</option>
                      <option value="Научные статьи">{text.scientificArticles}</option>
                      <option value="Другое">{text.other}</option>
                    </select>
                  ) : (
                    item.type || '-'
                  )}
                </td>

                <td className="wrap-cell text-cell">
                  {editAchievements ? (
                    <input
                      value={item.teacherName || teacherName}
                      onChange={(event) =>
                        updateRow(setAchievementRows, item.id, 'teacherName', event.target.value)
                      }
                      placeholder={text.teacher}
                    />
                  ) : (
                    item.teacherName || item.senderName || teacherName || '-'
                  )}
                </td>

                <td className="wrap-cell text-cell">
                  {editAchievements ? (
                    <FileInputCell
                      row={item}
                      text={text}
                      onUploaded={(id, data) =>
                        updateManyFields(setAchievementRows, id, cleanFileData(data))
                      }
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
                    <OpenAction row={item} text={text} />
                    <DownloadAction row={item} text={text} />
                  </RowActions>
                </td>
              </tr>
            ))
          )}
        </MiniTable>
      </div>
    );
  };

  const renderStudents = () => {
  if (!isSectionVisible('students')) return <AccessDenied text={text} />;

  const studentEditAllowed = canEdit('students');

  return (
    <div className="admin-section-page teacher-section-page">
      <SectionToolbar
        title={text.students}
        search={search}
        setSearch={setSearch}
        text={text}
        editMode={editStudents}
        canEdit={studentEditAllowed}
        onEdit={() => setEditStudents(true)}
        onAdd={() => addRow(setStudentRows, emptyStudent, 'student')}
        onSave={() => {
          if (typeof onSaveStudents === 'function') {
            onSaveStudents(studentRows);
          }

          setEditStudents(false);
        }}
        onCancel={() => {
          setStudentRows(normalizeRows(students, 'student'));
          setEditStudents(false);
        }}
      >
        <select
          className="mini-filter-select"
          value={studentType}
          onChange={(event) => setStudentType(event.target.value)}
        >
          <option value="active">{text.students}</option>
          <option value="graduates">{text.graduates || 'Выпускники'}</option>
        </select>

        <select
          className="mini-filter-select"
          value={studentDirection}
          onChange={(event) => setStudentDirection(event.target.value)}
        >
          <option value="all">{text.directionAll}</option>
          <option value="ИВТ">ИВТ</option>
          <option value="ПИЭ">ПИЭ</option>
        </select>

        <select
          className="mini-filter-select"
          value={studentCourse}
          onChange={(event) => setStudentCourse(event.target.value)}
        >
          <option value="all">{text.courseAll}</option>
          <option value="1">1 курс</option>
          <option value="2">2 курс</option>
          <option value="3">3 курс</option>
          <option value="4">4 курс</option>
        </select>

        {studentEditAllowed && (
          <button
            type="button"
            className="mini-btn save"
            onClick={promoteStudentsToNextCourse}
          >
            {text.updateAcademicYear || 'Обновить учебный год'}
          </button>
        )}
      </SectionToolbar>

      <MiniTable
        columns={[
          '№',
          text.fullName,
          text.email,
          text.phone,
          text.direction,
          text.course,
          text.group,
          text.actions
        ]}
        minWidth={1200}
      >
        {filteredStudents.length === 0 ? (
          <EmptyRow colSpan={8} text={text.noData} />
        ) : (
          filteredStudents.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td className="wrap-cell text-cell">
                {editStudents && studentEditAllowed ? (
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

              <td className="wrap-cell text-cell">
                {editStudents && studentEditAllowed ? (
                  <input
                    value={item.email || ''}
                    onChange={(event) =>
                      updateRow(setStudentRows, item.id, 'email', event.target.value)
                    }
                  />
                ) : (
                  item.email || '-'
                )}
              </td>

              <td>
                {editStudents && studentEditAllowed ? (
                  <input
                    value={item.phone || ''}
                    onChange={(event) =>
                      updateRow(setStudentRows, item.id, 'phone', event.target.value)
                    }
                  />
                ) : (
                  item.phone || '-'
                )}
              </td>

              <td>
                {editStudents && studentEditAllowed ? (
                  <select
                    value={item.direction || 'ИВТ'}
                    onChange={(event) =>
                      updateRow(setStudentRows, item.id, 'direction', event.target.value)
                    }
                  >
                    <option value="ИВТ">ИВТ</option>
                    <option value="ПИЭ">ПИЭ</option>
                  </select>
                ) : (
                  item.direction || '-'
                )}
              </td>

              <td>
                {editStudents && studentEditAllowed ? (
                  <select
                    value={item.course || '1'}
                    onChange={(event) =>
                      updateRow(setStudentRows, item.id, 'course', event.target.value)
                    }
                  >
                    <option value="1">1 курс</option>
                    <option value="2">2 курс</option>
                    <option value="3">3 курс</option>
                    <option value="4">4 курс</option>
                    <option value="Выпускник">Выпускник</option>
                  </select>
                ) : item.course === 'Выпускник' ? (
                  'Выпускник'
                ) : item.course ? (
                  `${item.course} курс`
                ) : (
                  '-'
                )}
              </td>

              <td>
                {editStudents && studentEditAllowed ? (
                  <input
                    value={item.group || item.groupName || ''}
                    onChange={(event) =>
                      updateManyFields(setStudentRows, item.id, {
                        group: event.target.value,
                        groupName: event.target.value
                      })
                    }
                  />
                ) : (
                  item.group || item.groupName || '-'
                )}
              </td>

              <td>
                <RowActions
                  text={text}
                  editMode={editStudents && studentEditAllowed}
                  onDelete={() => deleteRow('student', item.id, setStudentRows)}
                />
              </td>
            </tr>
          ))
        )}
      </MiniTable>
    </div>
  );
};

const renderTeachers = () => {
  if (!isSectionVisible('teachers')) return <AccessDenied text={text} />;

  const teacherEditAllowed = canEdit('teachers');

  return (
    <div className="admin-section-page teacher-section-page">
      <SectionToolbar
        title={text.teachers}
        search={search}
        setSearch={setSearch}
        text={text}
        editMode={editTeachers}
        canEdit={teacherEditAllowed}
        onEdit={() => setEditTeachers(true)}
        onSave={() => {
          if (typeof onSaveTeachers === 'function') {
            onSaveTeachers(teacherRows);
          }

          setEditTeachers(false);
        }}
        onCancel={() => {
          setTeacherRows(normalizeRows(teachers, 'teacher'));
          setEditTeachers(false);
        }}
      />

      <MiniTable
        columns={[
          '№',
          text.fullName,
          text.email,
          text.phone,
          text.position,
          text.actions
        ]}
        minWidth={1000}
      >
        {filteredTeachers.length === 0 ? (
          <EmptyRow colSpan={6} text={text.noData} />
        ) : (
          filteredTeachers.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>

              <td className="wrap-cell text-cell">
                {editTeachers && teacherEditAllowed ? (
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

              <td className="wrap-cell text-cell">
                {editTeachers && teacherEditAllowed ? (
                  <input
                    value={item.email || ''}
                    onChange={(event) =>
                      updateRow(setTeacherRows, item.id, 'email', event.target.value)
                    }
                  />
                ) : (
                  item.email || '-'
                )}
              </td>

              <td>
                {editTeachers && teacherEditAllowed ? (
                  <input
                    value={item.phone || ''}
                    onChange={(event) =>
                      updateRow(setTeacherRows, item.id, 'phone', event.target.value)
                    }
                  />
                ) : (
                  item.phone || '-'
                )}
              </td>

              <td>
                {editTeachers && teacherEditAllowed ? (
                  <select
                    value={item.position || 'Преподаватель'}
                    onChange={(event) =>
                      updateManyFields(setTeacherRows, item.id, {
                        position: event.target.value,
                        role: event.target.value === 'Лаборант' ? 'lab' : 'teacher'
                      })
                    }
                  >
                    <option value="Преподаватель">Преподаватель</option>
                    <option value="Лаборант">Лаборант</option>
                  </select>
                ) : (
                  item.position || (item.role === 'lab' ? 'Лаборант' : 'Преподаватель')
                )}
              </td>

              <td>
                <RowActions
                  text={text}
                  editMode={editTeachers && teacherEditAllowed}
                  onDelete={() => deleteRow('teacher', item.id, setTeacherRows)}
                />
              </td>
            </tr>
          ))
        )}
      </MiniTable>
    </div>
  );
};

  if (activeMenu === 'dashboard') return renderDashboard();
  if (activeMenu === 'schedule') return renderSchedule();
  if (activeMenu === 'plans') return renderPlans();
  if (activeMenu === 'programs') return renderPrograms();
  if (activeMenu === 'documents') return renderDocuments();
  if (activeMenu === 'teacherFiles') return renderTeacherFiles();
  if (activeMenu === 'students') return renderStudents();
  if (activeMenu === 'teachers') return renderTeachers();
  if (activeMenu === 'reports') return renderReports();
  if (activeMenu === 'practices') return renderPractices();
  if (activeMenu === 'achievements') return renderAchievements();

  return renderDashboard();
}