// src/components/Teacher/TeacherSidebar.js

import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  BookOpen,
  FolderOpen,
  FileText,
  GraduationCap,
  Users,
  BarChart3,
  BriefcaseBusiness,
  Award,
  Settings
} from 'lucide-react';

import './TeacherSidebar.css';

const TeacherSidebar = ({
  activeMenu = 'dashboard',
  setActiveMenu,
  setShowSettings,
  t = {},
  teacher = {},
  userRole = 'teacher',
  teacherAccess = {},
  allowedMenus = []
}) => {
  const normalizedRole = String(userRole || teacher.role || 'teacher')
    .trim()
    .toLowerCase();

  const role =
    normalizedRole === 'lab' ||
    normalizedRole === 'laborant' ||
    normalizedRole === 'лаборант'
      ? 'lab'
      : 'teacher';

  const panelSubtitle =
    role === 'lab'
      ? t.labPanel || 'Лаборант'
      : t.teacherPanel || 'Преподаватель';

  const accessValue = (sectionId) => {
    const value = teacherAccess?.[sectionId];

    if (!value) return 'none';

    if (value === true) return 'edit';
    if (value === false) return 'none';

    return String(value).toLowerCase();
  };

  const hasAccess = (sectionId) => {
    if (sectionId === 'dashboard') return true;

    const level = accessValue(sectionId);

    return (
      level === 'read' ||
      level === 'view' ||
      level === 'edit' ||
      level === 'write'
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      name: t.sidebarDashboard || t.dashboard || 'Главная',
      icon: <LayoutDashboard size={20} strokeWidth={2.2} />
    },
    {
      id: 'schedule',
      name: t.sidebarSchedule || t.schedule || 'Расписание',
      icon: <CalendarDays size={20} strokeWidth={2.2} />
    },
    {
      id: 'plans',
      name: t.sidebarPlans || t.plans || 'Нагрузка',
      icon: <ClipboardList size={20} strokeWidth={2.2} />
    },
    {
      id: 'programs',
      name: t.sidebarPrograms || t.programs || 'Рабочие программы',
      icon: <BookOpen size={20} strokeWidth={2.2} />
    },
    {
      id: 'documents',
      name: t.sidebarDocuments || t.documents || 'Документы',
      icon: <FolderOpen size={20} strokeWidth={2.2} />
    },
    {
      id: 'teacherFiles',
      name: t.sidebarTeacherFiles || t.teacherFiles || 'Личная папка',
      icon: <FileText size={20} strokeWidth={2.2} />
    },
    {
      id: 'students',
      name: t.sidebarStudents || t.students || 'Студенты',
      icon: <GraduationCap size={20} strokeWidth={2.2} />
    },
    {
      id: 'teachers',
      name: t.sidebarTeachers || t.teachers || 'Преподаватели',
      icon: <Users size={20} strokeWidth={2.2} />
    },
    {
      id: 'reports',
      name: t.sidebarReports || t.reports || 'Отчеты',
      icon: <BarChart3 size={20} strokeWidth={2.2} />
    },
    {
      id: 'practices',
      name: t.sidebarPractices || t.practices || 'Практика',
      icon: <BriefcaseBusiness size={20} strokeWidth={2.2} />
    },
    {
      id: 'achievements',
      name: t.sidebarAchievements || t.achievements || 'Достижения',
      icon: <Award size={20} strokeWidth={2.2} />
    }
  ];

  const defaultMenuByRole = {
    teacher: [
      'dashboard',
      'schedule',
      'plans',
      'programs',
      'documents',
      'teacherFiles'
    ],
    lab: [
      'dashboard',
      'students',
      'schedule',
      'teachers'
    ]
  };

  const visibleMenuItems = useMemo(() => {
    const defaultMenu = defaultMenuByRole[role] || defaultMenuByRole.teacher;

    const menuIds =
      Array.isArray(allowedMenus) && allowedMenus.length > 0
        ? ['dashboard', ...allowedMenus.filter((id) => id !== 'dashboard')]
        : defaultMenu;

    return menuItems.filter((item) => {
      if (item.id === 'dashboard') return true;

      const isDefault = defaultMenu.includes(item.id);
      const isAllowedMenu = menuIds.includes(item.id);

      if (isDefault && hasAccess(item.id)) return true;
      if (isAllowedMenu && hasAccess(item.id)) return true;

      return false;
    });
  }, [role, allowedMenus, teacherAccess, t]);

  const handleMenuClick = (menuId) => {
    if (typeof setActiveMenu === 'function') {
      setActiveMenu(menuId);
    }

    if (typeof setShowSettings === 'function') {
      setShowSettings(false);
    }
  };

  const handleSettingsClick = () => {
    if (typeof setShowSettings === 'function') {
      setShowSettings(true);
    }

    if (typeof setActiveMenu === 'function') {
      setActiveMenu('settings');
    }
  };

  return (
    <aside className="admin-sidebar teacher-sidebar">
      <div className="sidebar-top">
        <div className="logo">
          <img
            src="/images/logo.png"
            alt={t.logoAlt || 'Кафедра информационных технологий'}
            className="logo-image"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />

          <div className="logo-text">
            <h2>{t.sidebarLogoTitle || t.department || 'Кафедра информационных технологий'}</h2>
            <p>{panelSubtitle}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleMenuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.id)}
            title={item.name}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-name">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className={`settings-btn ${activeMenu === 'settings' ? 'active' : ''}`}
          onClick={handleSettingsClick}
          title={t.sidebarSettings || t.settings || 'Настройки'}
        >
          <span className="nav-icon">
            <Settings size={20} strokeWidth={2.2} />
          </span>
          <span className="nav-name">
            {t.sidebarSettings || t.settings || 'Настройки'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;