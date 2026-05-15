import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRoundCog,
  CalendarDays,
  BookOpen,
  FileText,
  Settings,
  FolderOpen,
  BarChart3,
  Award,
  BriefcaseBusiness
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({
  activeMenu = 'dashboard',
  setActiveMenu,
  setShowSettings,
  t = {}
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      name: t.sidebarDashboard || 'Главная',
      icon: <LayoutDashboard size={20} strokeWidth={2.2} />
    },
    {
      id: 'users',
      name: t.sidebarUsers || 'Пользователи',
      icon: <Users size={20} strokeWidth={2.2} />
    },
    {
      id: 'teachers',
      name: t.sidebarTeachers || 'Преподаватели',
      icon: <UserRoundCog size={20} strokeWidth={2.2} />
    },
    {
      id: 'students',
      name: t.sidebarStudents || 'Студенты',
      icon: <GraduationCap size={20} strokeWidth={2.2} />
    },
    {
      id: 'schedule',
      name: t.sidebarSchedule || 'Расписание',
      icon: <CalendarDays size={20} strokeWidth={2.2} />
    },
    {
      id: 'plans',
      name: t.sidebarPlans || 'Нагрузка',
      icon: <BookOpen size={20} strokeWidth={2.2} />
    },
    {
      id: 'programs',
      name: t.sidebarPrograms || 'Рабочие программы',
      icon: <FileText size={20} strokeWidth={2.2} />
    },
    {
      id: 'documents',
      name: t.sidebarDocuments || 'Документы',
      icon: <FolderOpen size={20} strokeWidth={2.2} />
    },
    {
      id: 'reports',
      name: t.sidebarReports || 'Отчеты',
      icon: <BarChart3 size={20} strokeWidth={2.2} />
    },
    {
      id: 'practices',
      name: t.sidebarPractices || 'Практика',
      icon: <BriefcaseBusiness size={20} strokeWidth={2.2} />
    },
    {
      id: 'achievements',
      name: t.sidebarAchievements || 'Достижения',
      icon: <Award size={20} strokeWidth={2.2} />
    }
  ];

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
    <aside className="admin-sidebar">
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
            <h2>{t.sidebarLogoTitle || 'Кафедра информационных технологий'}</h2>
            <p>{t.sidebarLogoSubtitle || 'Панель администратора'}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.id)}
            type="button"
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-name">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`settings-btn ${activeMenu === 'settings' ? 'active' : ''}`}
          onClick={handleSettingsClick}
          type="button"
        >
          <span className="nav-icon">
            <Settings size={20} strokeWidth={2.2} />
          </span>
          <span className="nav-name">
            {t.sidebarSettings || 'Настройки'}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;