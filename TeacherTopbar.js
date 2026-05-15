// src/components/Teacher/TeacherTopbar.js

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Building2,
  Briefcase,
  Camera,
  Globe2,
  LogOut,
  Mail,
  Moon,
  PencilLine,
  Phone,
  Save,
  Settings,
  Sun,
  UserRound,
  X
} from 'lucide-react';

import './TeacherTopbar.css';

const defaultProfile = {
  id: '',
  fullName: '',
  name: '',
  email: '',
  phone: '',
  position: '',
  role: 'teacher',
  department: 'Кафедра информационных технологий',
  info: '',
  bio: '',
  photoUrl: '',
  avatar: ''
};

const normalizeRole = (value = '') => {
  const role = String(value || '').trim().toLowerCase();

  if (
    role === 'lab' ||
    role === 'laborant' ||
    role === 'лаборант'
  ) {
    return 'lab';
  }

  return 'teacher';
};

const TeacherTopbar = ({
  onLogout,
  darkMode = false,
  onToggleDarkMode,

  language = 'ru',
  onLanguageChange,

  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,

  setShowSettings,

  teacher = {},
  teacherProfile = {},
  onSaveProfile,

  userRole = '',

  t = {}
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const mergedProfile = useMemo(() => {
    return {
      ...defaultProfile,
      ...teacher,
      ...teacherProfile,
      fullName:
        teacherProfile.fullName ||
        teacherProfile.name ||
        teacherProfile.displayName ||
        teacher.fullName ||
        teacher.name ||
        teacher.displayName ||
        '',
      photoUrl:
        teacherProfile.photoUrl ||
        teacherProfile.avatar ||
        teacher.photoUrl ||
        teacher.avatar ||
        '',
       role:
  teacherProfile.role ||
  teacher.role ||
  userRole ||
  defaultProfile.role ||
  'teacher'
    };
  }, [teacher, teacherProfile, userRole]);

  const [profile, setProfile] = useState(mergedProfile);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      ...mergedProfile,
      fullName:
        mergedProfile.fullName ||
        prev.fullName ||
        '',
      photoUrl:
        mergedProfile.photoUrl ||
        prev.photoUrl ||
        '',
      role:
        mergedProfile.role ||
        prev.role ||
        userRole ||
        'teacher'
    }));
  }, [mergedProfile, userRole]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setShowProfileModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const languages = useMemo(
    () => [
      { code: 'kg', label: 'KG' },
      { code: 'ru', label: 'RU' },
      { code: 'en', label: 'EN' }
    ],
    []
  );

  const role = normalizeRole(
  teacherProfile.role ||
    teacher.role ||
    profile.role ||
    userRole ||
    profile.position ||
    'teacher'
);

  const isLab = role === 'lab';

  const roleLabel = isLab
    ? t.labPanel || 'Лаборант'
    : t.teacherPanelShort || 'Преподаватель';

  const cabinetTitle = isLab
    ? t.labCabinet || 'Кабинет лаборанта'
    : t.teacherCabinet || 'Кабинет преподавателя';

  const profileTitle = isLab
    ? t.labProfileTitle || 'Профиль лаборанта'
    : t.profileTitle || 'Профиль преподавателя';

  const finalName =
    profile.fullName ||
    profile.name ||
    profile.displayName ||
    (isLab ? 'Лаборант' : 'Преподаватель');

  const finalPosition = isLab
    ? 'Лаборант'
    : profile.position || t.teacherPanelShort || 'Преподаватель';

  const firstLetter = finalName.trim().charAt(0).toUpperCase() || (isLab ? 'Л' : 'П');

  const formatTime = (timestamp) => {
    if (!timestamp) return t.justNow || 'только что';

    const createdTime =
      typeof timestamp === 'number'
        ? timestamp
        : new Date(timestamp).getTime();

    if (Number.isNaN(createdTime)) {
      return t.justNow || 'только что';
    }

    const diff = Date.now() - createdTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t.justNow || 'только что';

    if (minutes < 60) {
      if (language === 'kg') return `${minutes} мүнөт мурун`;
      if (language === 'en') return `${minutes} min ago`;
      return `${minutes} мин назад`;
    }

    if (hours < 24) {
      if (language === 'kg') return `${hours} саат мурун`;
      if (language === 'en') return `${hours} hours ago`;
      return `${hours} час назад`;
    }

    if (days === 1) {
      if (language === 'kg') return 'кечээ';
      if (language === 'en') return 'yesterday';
      return 'вчера';
    }

    if (language === 'kg') return `${days} күн мурун`;
    if (language === 'en') return `${days} days ago`;
    return `${days} дней назад`;
  };

  const handleLanguageChange = (code) => {
    if (typeof onLanguageChange === 'function') {
      onLanguageChange(code);
    } else {
      localStorage.setItem('siteLanguage', code);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.isRead && typeof onMarkRead === 'function') {
      await onMarkRead(notification.id);
    }
  };

  const handleOpenSettings = () => {
    setShowNotifications(false);
    setShowProfileMenu(false);

    if (typeof setShowSettings === 'function') {
      setShowSettings(true);
    }
  };

  const handleOpenProfile = () => {
    setShowProfileMenu(false);
    setShowNotifications(false);
    setShowProfileModal(true);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    setShowNotifications(false);

    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setProfile((prev) => ({
        ...prev,
        photoFile: file,
        photoUrl: reader.result,
        avatar: reader.result
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      const preparedProfile = {
        ...profile,
        name: profile.fullName || profile.name || '',
        fullName: profile.fullName || profile.name || '',
        role,
        position: isLab ? 'Лаборант' : profile.position || 'Преподаватель',
        bio: profile.bio || profile.info || '',
        info: profile.info || profile.bio || '',
        avatar: profile.avatar || profile.photoUrl || '',
        photoUrl: profile.photoUrl || profile.avatar || ''
      };

      delete preparedProfile.photoFile;

      if (typeof onSaveProfile === 'function') {
        await onSaveProfile(preparedProfile);
      }

      setProfile(preparedProfile);
      setShowProfileModal(false);
    } catch (error) {
      console.error('Profile save error:', error);
      alert(
        t.profileSaveError ||
          'Профилди сактоодо ката кетти. Кайра аракет кылыңыз.'
      );
    }
  };

  return (
    <>
      <header className="teacher-topbar">
        <div className="topbar-left">
          <div className="topbar-title">
            <h2>{cabinetTitle}</h2>
            <p>{t.department || 'Кафедра информационных технологий'}</p>
          </div>
        </div>

        <div className="topbar-right">
          <div className="language-switcher">
            <Globe2 size={18} />

            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`lang-btn ${
                  language === item.code ? 'active' : ''
                }`}
                onClick={() => handleLanguageChange(item.code)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="topbar-icon-btn"
            onClick={() => {
              setShowNotifications(false);
              setShowProfileMenu(false);

              if (typeof onToggleDarkMode === 'function') {
                onToggleDarkMode();
              }
            }}
            title={t.theme || 'Тема'}
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <div className="notification-wrap" ref={notificationRef}>
            <button
              type="button"
              className={`topbar-icon-btn bell-btn ${
                unreadCount > 0 ? 'has-notification' : ''
              }`}
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfileMenu(false);
              }}
              title={t.notifications || 'Уведомления'}
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notifications-panel">
                <div className="notifications-head">
                  <div>
                    <h3>{t.notifications || 'Уведомления'}</h3>
                    <p>
                      {unreadCount > 0
                        ? `${unreadCount} ${t.newNotifications || 'новых'}`
                        : t.noNewNotifications || 'Новых нет'}
                    </p>
                  </div>

                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (typeof onMarkAllRead === 'function') {
                          await onMarkAllRead();
                        }
                      }}
                    >
                      {t.allRead || 'Все прочитано'}
                    </button>
                  )}
                </div>

                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 8).map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={`notification-item ${
                          !item.isRead ? 'unread' : ''
                        }`}
                        onClick={() => handleNotificationClick(item)}
                      >
                        <span className="notification-icon">
                          {item.icon || '🔔'}
                        </span>

                        <span className="notification-info">
                          <strong>
                            {item.title ||
                              t.notificationDefaultTitle ||
                              'Уведомление'}
                          </strong>

                          <small>
                            {item.text ||
                              t.notificationDefaultText ||
                              'Новое действие на портале'}
                          </small>

                          <em>{formatTime(item.createdAt)}</em>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="notification-empty">
                      {t.emptyNotifications || 'Уведомлений пока нет'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="topbar-icon-btn"
            onClick={handleOpenSettings}
            title={t.settings || 'Настройки'}
          >
            <Settings size={19} />
          </button>

          <div className="teacher-profile-wrap" ref={profileRef}>
            <button
              type="button"
              className="teacher-profile-btn"
              onClick={() => {
                setShowProfileMenu((prev) => !prev);
                setShowNotifications(false);
              }}
            >
              <div className="teacher-avatar">
                {profile.photoUrl || profile.avatar ? (
                  <img
                    src={profile.photoUrl || profile.avatar}
                    alt={finalName}
                  />
                ) : (
                  <UserRound size={19} />
                )}
              </div>

              <div className="teacher-profile-text">
                <strong>{finalName}</strong>
                <span>{finalPosition}</span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-head">
                  <div className="profile-dropdown-avatar">
                    {profile.photoUrl || profile.avatar ? (
                      <img
                        src={profile.photoUrl || profile.avatar}
                        alt={finalName}
                      />
                    ) : (
                      <UserRound size={27} />
                    )}
                  </div>

                  <strong>{finalName}</strong>
                  <span>{profile.email || t.emailNotSet || 'Email не указан'}</span>
                  <span>
                    {profile.phone || t.phoneNotSet || 'Телефон не указан'}
                  </span>
                </div>

                <button type="button" onClick={handleOpenProfile}>
                  <UserRound size={16} />
                  {t.profile || 'Профиль'}
                </button>

                <button
                  type="button"
                  className="logout-dropdown-btn"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  {t.logout || 'Выйти'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showProfileModal && (
        <div className="teacher-profile-modal-backdrop">
          <div className="teacher-profile-modal">
            <div className="teacher-profile-modal-head">
              <h2>{profileTitle}</h2>

              <button
                type="button"
                className="teacher-profile-close"
                onClick={() => setShowProfileModal(false)}
                title={t.close || 'Закрыть'}
              >
                <X size={22} />
              </button>
            </div>

            <div className="teacher-profile-modal-body">
              <div className="teacher-profile-left-card">
                <div className="teacher-profile-avatar-big">
                  {profile.photoUrl || profile.avatar ? (
                    <img
                      src={profile.photoUrl || profile.avatar}
                      alt={finalName}
                    />
                  ) : (
                    <span>{firstLetter}</span>
                  )}
                </div>

                <h3>{finalName}</h3>
                <p>{finalPosition}</p>

                <label className="teacher-profile-upload">
                  <Camera size={16} />
                  {t.choosePhoto || 'Сүрөт тандоо'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                  />
                </label>
              </div>

              <div className="teacher-profile-form-card">
                <label>
                  <span>
                    <UserRound size={15} />
                    {t.fullName || 'Аты-жөнү'}
                  </span>

                  <input
                    type="text"
                    value={profile.fullName || profile.name || ''}
                    onChange={(event) =>
                      handleProfileChange('fullName', event.target.value)
                    }
                  />
                </label>

                <label>
                  <span>
                    <Mail size={15} />
                    Email
                  </span>

                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(event) =>
                      handleProfileChange('email', event.target.value)
                    }
                  />
                </label>

                <label>
                  <span>
                    <Phone size={15} />
                    {t.phone || 'Телефон'}
                  </span>

                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(event) =>
                      handleProfileChange('phone', event.target.value)
                    }
                  />
                </label>

                <label>
                  <span>
                    <Briefcase size={15} />
                    {t.position || 'Кызматы'}
                  </span>

                  <input
                    type="text"
                    value={isLab ? 'Лаборант' : profile.position || ''}
                    disabled={isLab}
                    onChange={(event) =>
                      handleProfileChange('position', event.target.value)
                    }
                  />
                </label>

                <label className="wide">
                  <span>
                    <Building2 size={15} />
                    {t.departmentLabel || 'Кафедра'}
                  </span>

                  <input
                    type="text"
                    value={profile.department || ''}
                    onChange={(event) =>
                      handleProfileChange('department', event.target.value)
                    }
                  />
                </label>

                <label className="wide">
                  <span>
                    <PencilLine size={15} />
                    {t.briefInfo || 'Краткая информация'}
                  </span>

                  <textarea
                    value={profile.info || profile.bio || ''}
                    onChange={(event) =>
                      handleProfileChange('info', event.target.value)
                    }
                    placeholder={t.briefInfo || 'Краткая информация'}
                  />
                </label>
              </div>
            </div>

            <div className="teacher-profile-modal-actions">
              <button type="button" className="save" onClick={handleSaveProfile}>
                <Save size={15} />
                {t.save || 'Сохранить'}
              </button>

              <button
                type="button"
                className="cancel"
                onClick={() => setShowProfileModal(false)}
              >
                {t.cancel || 'Отмена'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherTopbar;