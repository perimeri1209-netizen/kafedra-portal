import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Moon,
  Sun,
  LogOut,
  Settings,
  UserRound,
  Globe2
} from 'lucide-react';
import './AdminTopbar.css';

const AdminTopbar = ({
  onLogout,

  adminName,
  adminPosition,
  adminEmail,
  adminPhone,
  adminPhoto,
  adminProfile = {},

  darkMode,
  onToggleDarkMode,

  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead,

  setShowSettings,
  setActiveMenu,
  openProfileModal,

  language = 'ru',
  onLanguageChange,

  t = {}
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const finalAdminName =
    adminProfile.fullName ||
    adminProfile.name ||
    adminName ||
    t.adminDefault ||
    'Администратор';

  const finalAdminPosition =
    adminProfile.position ||
    adminPosition ||
    t.adminPanelShort ||
    'Администратор портала';

  const finalAdminEmail =
    adminProfile.email ||
    adminEmail ||
    t.emailNotSet ||
    'email не указан';

  const finalAdminPhone =
    adminProfile.phone ||
    adminPhone ||
    t.phoneNotSet ||
    'телефон не указан';

  const finalAdminPhoto =
    adminProfile.photoUrl ||
    adminProfile.avatar ||
    adminPhoto ||
    '';

  const languages = [
    { code: 'kg', label: 'KG' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideNotifications =
        notificationRef.current &&
        notificationRef.current.contains(event.target);

      const clickedInsideProfile =
        profileRef.current &&
        profileRef.current.contains(event.target);

      if (!clickedInsideNotifications) {
        setShowNotifications(false);
      }

      if (!clickedInsideProfile) {
        setShowProfileMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return t.justNow || 'только что';

    let timeValue = timestamp;

    if (typeof timestamp === 'object' && typeof timestamp.toMillis === 'function') {
      timeValue = timestamp.toMillis();
    }

    if (typeof timestamp === 'string') {
      timeValue = new Date(timestamp).getTime();
    }

    if (!timeValue || Number.isNaN(Number(timeValue))) {
      return t.justNow || 'только что';
    }

    const now = Date.now();
    const diff = now - Number(timeValue);

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t.justNow || 'только что';

    if (minutes < 60) {
      return language === 'kg'
        ? `${minutes} мүнөт мурун`
        : language === 'en'
          ? `${minutes} min ago`
          : `${minutes} мин назад`;
    }

    if (hours < 24) {
      return language === 'kg'
        ? `${hours} саат мурун`
        : language === 'en'
          ? `${hours} hours ago`
          : `${hours} час назад`;
    }

    if (days === 1) {
      return language === 'kg'
        ? 'кечээ'
        : language === 'en'
          ? 'yesterday'
          : 'вчера';
    }

    return language === 'kg'
      ? `${days} күн мурун`
      : language === 'en'
        ? `${days} days ago`
        : `${days} дней назад`;
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.id) return;

    if (!notification?.isRead && typeof onMarkRead === 'function') {
      await onMarkRead(notification.id);
    }
  };

  const handleNotificationToggle = (event) => {
    event.stopPropagation();
    setShowNotifications((prev) => !prev);
    setShowProfileMenu(false);
  };

  const handleProfileToggle = (event) => {
    event.stopPropagation();
    setShowProfileMenu((prev) => !prev);
    setShowNotifications(false);
  };

  const handleOpenSettings = (event) => {
    event.stopPropagation();
    setShowNotifications(false);
    setShowProfileMenu(false);

    if (typeof setShowSettings === 'function') {
      setShowSettings(true);
    }

    if (typeof setActiveMenu === 'function') {
      setActiveMenu('settings');
    }
  };

  const handleOpenProfile = (event) => {
    event.stopPropagation();
    setShowNotifications(false);
    setShowProfileMenu(false);

    if (typeof openProfileModal === 'function') {
      openProfileModal();
      return;
    }

    if (typeof setActiveMenu === 'function') {
      setActiveMenu('profile');
    }
  };

  const handleLogout = (event) => {
    event.stopPropagation();
    setShowNotifications(false);
    setShowProfileMenu(false);

    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  const handleMarkAllRead = async (event) => {
    event.stopPropagation();

    if (typeof onMarkAllRead === 'function') {
      await onMarkAllRead();
    }
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <div className="topbar-title">
          <h2>{t.adminPanel || 'Административная панель'}</h2>
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
              className={`lang-btn ${language === item.code ? 'active' : ''}`}
              onClick={(event) => {
                event.stopPropagation();

                if (typeof onLanguageChange === 'function') {
                  onLanguageChange(item.code);
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="topbar-icon-btn"
          onClick={(event) => {
            event.stopPropagation();
            setShowNotifications(false);
            setShowProfileMenu(false);

            if (typeof onToggleDarkMode === 'function') {
              onToggleDarkMode();
            }
          }}
          title={t.theme || 'Тема'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="notification-wrap" ref={notificationRef}>
          <button
            type="button"
            className={`topbar-icon-btn bell-btn ${
              unreadCount > 0 ? 'has-notification' : ''
            }`}
            onClick={handleNotificationToggle}
            title={t.notifications || 'Уведомления'}
          >
            <Bell size={21} />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="notifications-panel"
              onClick={(event) => event.stopPropagation()}
            >
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
                  <button type="button" onClick={handleMarkAllRead}>
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
          <Settings size={20} />
        </button>

        <div className="admin-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="admin-profile-btn"
            onClick={handleProfileToggle}
            title={t.profile || 'Профиль'}
          >
            <div className="admin-avatar">
              {finalAdminPhoto ? (
                <img src={finalAdminPhoto} alt={finalAdminName} />
              ) : (
                <UserRound size={20} />
              )}
            </div>

            <div className="admin-profile-text">
              <strong>{finalAdminName}</strong>
              <span>{finalAdminPosition}</span>
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="profile-dropdown"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="profile-dropdown-head">
                <div className="profile-dropdown-avatar">
                  {finalAdminPhoto ? (
                    <img src={finalAdminPhoto} alt={finalAdminName} />
                  ) : (
                    <UserRound size={28} />
                  )}
                </div>

                <strong>{finalAdminName}</strong>
                <span>{finalAdminEmail}</span>
                <span>{finalAdminPhone}</span>
              </div>

              <button type="button" onClick={handleOpenProfile}>
                <UserRound size={16} />
                {t.profile || 'Профиль'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="logout-dropdown-btn"
              >
                <LogOut size={16} />
                {t.logout || 'Выйти'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;