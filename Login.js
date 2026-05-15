// src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where
} from '../firebase';

import emailjs from '@emailjs/browser';
import './Login.css';
import { Eye, EyeOff } from 'lucide-react';

const EMAILJS_SERVICE_ID = 'service_lpiuced';
const EMAILJS_TEMPLATE_ID = 'template_u6otsr2';
const EMAILJS_PUBLIC_KEY = 'XxxFlshUiuYTP-SXA';

const ADMIN_ID = 'admin_main';
const ADMIN_EMAIL = 'diprabot2026@gmail.com';
const ADMIN_PASSWORD = 'admin123';

const translations = {
  ru: {
    portalTitle: 'Кафедра информационных технологий',
    loginSubtitle: 'Войдите в свой аккаунт',
    firstLoginSubtitle: 'Создайте новый пароль',
    resetSubtitle: 'Восстановление пароля',
    email: 'Email',
    password: 'Пароль',
    newPassword: 'Новый пароль',
    repeatPassword: 'Повторите пароль',
    code: 'Код',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: 'xxxxxxx',
    newPasswordPlaceholder: 'Новый пароль (мин. 6 символов)',
    repeatPasswordPlaceholder: 'Повторите пароль',
    resetEmailPlaceholder: 'your@email.com',
    codePlaceholder: '6-значный код',
    resetNewPasswordPlaceholder: 'Новый пароль',
    login: 'Войти',
    loggingIn: 'Вход...',
    createPassword: 'Создать пароль',
    saving: 'Сохраняется...',
    forgotPassword: 'Забыли пароль?',
    sendCode: 'Отправить код',
    sending: 'Отправка...',
    changePassword: 'Изменить пароль',
    backToLogin: '← Вернуться ко входу',
    fillEmailPassword: 'Заполните email и пароль',
    userNotFound: 'Пользователь не найден. Обратитесь к администратору.',
    wrongPassword: 'Неверный пароль',
    loginError: 'Ошибка при входе',
    fillPassword: 'Заполните пароль',
    passwordsNotMatch: 'Пароли не совпадают',
    passwordMin: 'Пароль должен содержать минимум 6 символов',
    userNotFoundShort: 'Пользователь не найден',
    createPasswordError: 'Ошибка при сохранении пароля',
    writeEmail: 'Введите email',
    resetUserNotFound: '❌ Пользователь с таким email не найден',
    codeSent: '✅ Код отправлен на ваш email!',
    codeSendError: '❌ Ошибка при отправке кода',
    commonError: '❌ Ошибка',
    writeCode: 'Введите код',
    resetPasswordMin: 'Новый пароль должен содержать минимум 6 символов',
    wrongCode: '❌ Неверный код',
    codeExpired: '❌ Срок действия кода истек',
    passwordChanged: '✅ Пароль успешно изменен! Войдите с новым паролем.',
    userDefaultName: 'Пользователь',
    adminName: 'Администратор',
    
    ru: 'RU',
    kg: 'KG',
    en: 'EN'
  },
  kg: {
    portalTitle: 'Маалыматтык технологиялар кафедрасы',
    loginSubtitle: 'Аккаунтуңузга кириңиз',
    firstLoginSubtitle: 'Жаңы пароль түзүңүз',
    resetSubtitle: 'Парольду калыбына келтирүү',
    email: 'Email',
    password: 'Пароль',
    newPassword: 'Жаңы пароль',
    repeatPassword: 'Парольду кайталаңыз',
    code: 'Код',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: 'xxxxxxx',
    newPasswordPlaceholder: 'Жаңы пароль (мин. 6 символ)',
    repeatPasswordPlaceholder: 'Парольду кайталаңыз',
    resetEmailPlaceholder: 'your@email.com',
    codePlaceholder: '6 сандуу код',
    resetNewPasswordPlaceholder: 'Жаңы пароль',
    login: 'Кирүү',
    loggingIn: 'Кирүүдө...',
    createPassword: 'Пароль түзүү',
    saving: 'Сакталууда...',
    forgotPassword: 'Парольду унуттуңузбу?',
    sendCode: 'Код жөнөтүү',
    sending: 'Жөнөтүлүүдө...',
    changePassword: 'Парольду өзгөртүү',
    backToLogin: '← Кирүү бетине кайтуу',
    fillEmailPassword: 'Email жана пароль толтуруңуз',
    userNotFound: 'Колдонуучу табылган жок. Администраторго кайрылыңыз.',
    wrongPassword: 'Пароль туура эмес',
    loginError: 'Кирүүдө ката кетти',
    fillPassword: 'Парольду толтуруңуз',
    passwordsNotMatch: 'Паролдор дал келбейт',
    passwordMin: 'Пароль кеминде 6 символдон турсун',
    userNotFoundShort: 'Колдонуучу табылган жок',
    createPasswordError: 'Пароль сактоодо ката кетти',
    writeEmail: 'Email дарегиңизди жазыңыз',
    resetUserNotFound: '❌ Бул email менен катталган колдонуучу жок',
    codeSent: '✅ Код email дарегиңизге жөнөтүлдү!',
    codeSendError: '❌ Код жөнөтүүдө ката кетти',
    commonError: '❌ Ката кетти',
    writeCode: 'Кодду жазыңыз',
    resetPasswordMin: 'Жаңы пароль кеминде 6 символдон турсун',
    wrongCode: '❌ Код туура эмес',
    codeExpired: '❌ Коддун мөөнөтү өтүп кетти',
    passwordChanged: '✅ Пароль ийгиликтүү өзгөртүлдү! Жаңы пароль менен кириңиз.',
    userDefaultName: 'Колдонуучу',
    adminName: 'Администратор',
    
    ru: 'RU',
    kg: 'KG',
    en: 'EN'
  },
  en: {
    portalTitle: 'Department of Information Technologies',
    loginSubtitle: 'Sign in to your account',
    firstLoginSubtitle: 'Create a new password',
    resetSubtitle: 'Password recovery',
    email: 'Email',
    password: 'Password',
    newPassword: 'New password',
    repeatPassword: 'Repeat password',
    code: 'Code',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: 'xxxxxxx',
    newPasswordPlaceholder: 'New password (min. 6 characters)',
    repeatPasswordPlaceholder: 'Repeat password',
    resetEmailPlaceholder: 'your@email.com',
    codePlaceholder: '6-digit code',
    resetNewPasswordPlaceholder: 'New password',
    login: 'Sign in',
    loggingIn: 'Signing in...',
    createPassword: 'Create password',
    saving: 'Saving...',
    forgotPassword: 'Forgot password?',
    sendCode: 'Send code',
    sending: 'Sending...',
    changePassword: 'Change password',
    backToLogin: '← Back to login',
    fillEmailPassword: 'Please fill in email and password',
    userNotFound: 'User not found. Please contact the administrator.',
    wrongPassword: 'Incorrect password',
    loginError: 'Login error',
    fillPassword: 'Please enter a password',
    passwordsNotMatch: 'Passwords do not match',
    passwordMin: 'Password must be at least 6 characters',
    userNotFoundShort: 'User not found',
    createPasswordError: 'Error saving password',
    writeEmail: 'Enter your email address',
    resetUserNotFound: '❌ No user registered with this email',
    codeSent: '✅ Code has been sent to your email!',
    codeSendError: '❌ Error sending code',
    commonError: '❌ Error',
    writeCode: 'Enter the code',
    resetPasswordMin: 'New password must be at least 6 characters',
    wrongCode: '❌ Incorrect code',
    codeExpired: '❌ Code has expired',
    passwordChanged: '✅ Password changed successfully! Sign in with your new password.',
    userDefaultName: 'User',
    adminName: 'Administrator',
    
    ru: 'RU',
    kg: 'KG',
    en: 'EN'
  }
};

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(
    localStorage.getItem('siteLanguage') || 'ru'
  );

  const t = translations[language] || translations.ru;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetUser, setResetUser] = useState(null);

  const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem('siteLanguage', nextLanguage);
  };

  const saveLoginState = (userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role || '');

    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('isTeacherLoggedIn');
    localStorage.removeItem('isStudentLoggedIn');

    if (userData.role === 'admin') {
      localStorage.setItem('isAdminLoggedIn', 'true');
    }

    if (userData.role === 'teacher' || userData.role === 'lab') {
      localStorage.setItem('isTeacherLoggedIn', 'true');
    }

    if (userData.role === 'student') {
      localStorage.setItem('isStudentLoggedIn', 'true');
    }
  };

  const goToCabinet = (role) => {
    if (role === 'admin') {
      navigate('/admin');
      return;
    }

    if (role === 'teacher' || role === 'lab') {
      navigate('/teacher');
      return;
    }

    if (role === 'student') {
      navigate('/student');
      return;
    }

    navigate('/admin');
  };

  const makeUserDataForLocalStorage = (user, loginTime = Date.now()) => {
    return {
      uid: user.id,
      id: user.id,
      email: user.email || '',
      role: user.role || '',
      name: user.name || user.fullName || '',
      fullName: user.fullName || user.name || '',
      phone: user.phone || '',
      position: user.position || '',
      direction: user.direction || '',
      course: user.course || '',
      group: user.group || '',
      access: user.access || {},
      isRegistered: true,
      hasLoggedIn: true,
      lastLoginAt: loginTime,
      loginStatus: 'entered'
    };
  };

  const findUserByEmail = async (userEmail) => {
    const normalizedEmail = normalizeEmail(userEmail);

    const usersQuery = query(
      collection(db, 'users'),
      where('emailLower', '==', normalizedEmail)
    );

    const usersSnapshot = await getDocs(usersQuery);

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      return {
        id: userDoc.id,
        ...(userDoc.data() || {})
      };
    }

    const allUsersSnapshot = await getDocs(collection(db, 'users'));

    for (const userDoc of allUsersSnapshot.docs) {
      const user = userDoc.data() || {};
      if (normalizeEmail(user.email) === normalizedEmail) {
        return {
          id: userDoc.id,
          ...user
        };
      }
    }

    return null;
  };

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendCodeToEmail = async (toEmail, name, code) => {
    try {
      const templateParams = {
        to_email: toEmail,
        name: name || t.userDefaultName,
        code,
        email: toEmail
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        {
          publicKey: EMAILJS_PUBLIC_KEY
        }
      );

      return true;
    } catch (sendError) {
      console.error('Email send error:', sendError);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError(t.fillEmailPassword);
      setLoading(false);
      return;
    }

    try {
      const loginTime = Date.now();
      const normalizedEmail = normalizeEmail(email);

      if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const userData = {
          uid: ADMIN_ID,
          id: ADMIN_ID,
          email: normalizedEmail,
          role: 'admin',
          name: t.adminName,
          fullName: t.adminName,
          isRegistered: true,
          hasLoggedIn: true,
          lastLoginAt: loginTime,
          loginStatus: 'entered'
        };

        await setDoc(
          doc(db, 'users', ADMIN_ID),
          {
            id: ADMIN_ID,
            email: userData.email,
            emailLower: normalizedEmail,
            role: 'admin',
            name: userData.name,
            fullName: userData.fullName,
            position: 'Администратор',
            isRegistered: true,
            hasLoggedIn: true,
            canAccessPortal: true,
            loginStatus: 'entered',
            lastLoginAt: loginTime,
            updatedAt: loginTime,
            access: {
              users: 'edit',
              teachers: 'edit',
              students: 'edit',
              schedule: 'edit',
              plans: 'edit',
              programs: 'edit',
              documents: 'edit',
              reports: 'edit',
              practices: 'edit',
              achievements: 'edit'
            }
          },
          { merge: true }
        );

        saveLoginState(userData);
        if (typeof onLogin === 'function') onLogin(userData);
        navigate('/admin');
        setLoading(false);
        return;
      }

      const user = await findUserByEmail(email);

      if (!user) {
        setError(t.userNotFound);
        setLoading(false);
        return;
      }

      if (!user.password || user.password === '') {
        setIsFirstLogin(true);
        setPendingUser(user);
        setLoading(false);
        return;
      }

      if (String(user.password) !== String(password)) {
        setError(t.wrongPassword);
        setLoading(false);
        return;
      }

      await updateDoc(doc(db, 'users', user.id), {
        emailLower: normalizeEmail(user.email || email),
        lastLoginAt: loginTime,
        hasLoggedIn: true,
        isRegistered: true,
        loginStatus: 'entered',
        updatedAt: loginTime
      });

      const userData = makeUserDataForLocalStorage(user, loginTime);
      saveLoginState(userData);
      if (typeof onLogin === 'function') onLogin(userData);
      goToCabinet(user.role);
    } catch (loginError) {
      console.error('Login error:', loginError);
      if (loginError?.code === 'unavailable' || loginError?.message?.includes('offline')) {
        setError('Нет подключения к базе данных. Проверьте интернет.');
      } else if (loginError?.code === 'permission-denied') {
        setError('Доступ запрещен. Проверьте настройки Firebase.');
      } else {
        setError(`${t.loginError}: ${loginError?.message || loginError}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async () => {
    setError('');

    if (!newPassword || !confirmPassword) {
      setError(t.fillPassword);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordsNotMatch);
      return;
    }

    if (newPassword.length < 6) {
      setError(t.passwordMin);
      return;
    }

    if (!pendingUser?.id) {
      setError(t.userNotFoundShort);
      return;
    }

    setLoading(true);

    try {
      const loginTime = Date.now();

      await updateDoc(doc(db, 'users', pendingUser.id), {
        password: newPassword,
        emailLower: normalizeEmail(pendingUser.email),
        isRegistered: true,
        hasLoggedIn: true,
        registeredAt: pendingUser.registeredAt || loginTime,
        lastLoginAt: loginTime,
        loginStatus: 'entered',
        updatedAt: loginTime
      });

      const userData = makeUserDataForLocalStorage(pendingUser, loginTime);
      saveLoginState(userData);
      if (typeof onLogin === 'function') onLogin(userData);
      goToCabinet(pendingUser.role);
    } catch (createError) {
      console.error('Create password error:', createError);
      setError(t.createPasswordError);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetMessage(t.writeEmail);
      return;
    }

    setResetLoading(true);
    setResetMessage('');

    try {
      const user = await findUserByEmail(resetEmail);

      if (!user) {
        setResetMessage(t.resetUserNotFound);
        setResetLoading(false);
        return;
      }

      const code = generateCode();

      await updateDoc(doc(db, 'users', user.id), {
        resetCode: code,
        resetCodeExpires: Date.now() + 5 * 60 * 1000,
        updatedAt: Date.now()
      });

      const sent = await sendCodeToEmail(
        resetEmail,
        user.name || user.fullName,
        code
      );

      if (sent) {
        setResetUser(user);
        setResetStep(2);
        setResetMessage(t.codeSent);
      } else {
        setResetMessage(t.codeSendError);
      }
    } catch (forgotError) {
      console.error('Forgot password error:', forgotError);
      setResetMessage(t.commonError);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode) {
      setResetMessage(t.writeCode);
      return;
    }

    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetMessage(t.resetPasswordMin);
      return;
    }

    if (!resetUser?.id) {
      setResetMessage(t.userNotFoundShort);
      return;
    }

    setResetLoading(true);

    try {
      const userSnapshot = await getDoc(doc(db, 'users', resetUser.id));

      if (!userSnapshot.exists()) {
        setResetMessage(t.userNotFoundShort);
        setResetLoading(false);
        return;
      }

      const userData = userSnapshot.data() || {};

      if (!userData.resetCode || String(userData.resetCode) !== String(resetCode)) {
        setResetMessage(t.wrongCode);
        setResetLoading(false);
        return;
      }

      if (Date.now() > Number(userData.resetCodeExpires || 0)) {
        setResetMessage(t.codeExpired);
        setResetLoading(false);
        return;
      }

      await updateDoc(doc(db, 'users', resetUser.id), {
        password: resetNewPassword,
        isRegistered: true,
        resetCode: null,
        resetCodeExpires: null,
        passwordUpdatedAt: Date.now(),
        updatedAt: Date.now()
      });

      setResetMessage(t.passwordChanged);

      setTimeout(() => {
        setShowReset(false);
        setResetStep(1);
        setResetEmail('');
        setResetCode('');
        setResetNewPassword('');
        setResetUser(null);
        setResetMessage('');
      }, 3000);
    } catch (resetError) {
      console.error('Reset password error:', resetError);
      setResetMessage(t.commonError);
    } finally {
      setResetLoading(false);
    }
  };

  const renderLanguageSwitcher = () => (
    <div className="login-language-switcher">
      {['ru', 'kg', 'en'].map((item) => (
        <button
          key={item}
          type="button"
          className={`login-language-btn ${language === item ? 'active' : ''}`}
          onClick={() => handleLanguageChange(item)}
        >
          {t[item]}
        </button>
      ))}
    </div>
  );

  const renderFirstLoginForm = () => (
    <div className="login-form">
      <div className="input-group">
        <label>{t.email}</label>
        <input
          type="email"
          value={pendingUser?.email || ''}
          disabled
        />
      </div>

      <div className="input-group">
        <label>{t.newPassword}</label>
        <div className="password-box">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder={t.newPasswordPlaceholder}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-eye"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="input-group">
        <label>{t.repeatPassword}</label>
        <div className="password-box">
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder={t.repeatPasswordPlaceholder}
            autoComplete="new-password"
          />
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <button
        type="button"
        className="login-button"
        onClick={handleCreatePassword}
        disabled={loading}
      >
        {loading ? t.saving : t.createPassword}
      </button>
    </div>
  );

  const renderResetForm = () => {
    if (resetStep === 1) {
      return (
        <div className="login-form">
          <div className="input-group">
            <label>{t.email}</label>
            <input
              type="email"
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              placeholder={t.resetEmailPlaceholder}
              autoComplete="email"
            />
          </div>

          {resetMessage && (
            <div className={resetMessage.includes('✅') ? 'reset-success' : 'reset-error'}>
              {resetMessage}
            </div>
          )}

          <button
            type="button"
            className="login-button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
          >
            {resetLoading ? t.sending : t.sendCode}
          </button>
        </div>
      );
    }

    return (
      <div className="login-form">
        <div className="input-group">
          <label>{t.code}</label>
          <input
            type="text"
            value={resetCode}
            onChange={(event) => setResetCode(event.target.value)}
            placeholder={t.codePlaceholder}
            maxLength="6"
            autoComplete="off"
          />
        </div>

        <div className="input-group">
          <label>{t.newPassword}</label>
          <input
            type="password"
            value={resetNewPassword}
            onChange={(event) => setResetNewPassword(event.target.value)}
            placeholder={t.resetNewPasswordPlaceholder}
            autoComplete="new-password"
          />
        </div>

        {resetMessage && (
          <div className={resetMessage.includes('✅') ? 'reset-success' : 'reset-error'}>
            {resetMessage}
          </div>
        )}

        <button
          type="button"
          className="login-button"
          onClick={handleResetPassword}
          disabled={resetLoading}
        >
          {resetLoading ? t.saving : t.changePassword}
        </button>
      </div>
    );
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {renderLanguageSwitcher()}

        <div className="login-header">
          <div className="login-brand-row">
            <img
              src="https://www.knu.kg/ky/ru/wp-content/uploads/sites/2/2024/02/logo_knu_new_810_fin.png"
              alt={t.portalTitle}
              className="login-university-logo"
            />
            <h1>{t.portalTitle}</h1>
          </div>
          <p>
            {isFirstLogin
              ? t.firstLoginSubtitle
              : showReset
                ? t.resetSubtitle
                : t.loginSubtitle}
          </p>
        </div>

        {!isFirstLogin && !showReset ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.emailPlaceholder}
                required
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label>{t.password}</label>
              <div className="password-box">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t.passwordPlaceholder}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-eye"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? t.loggingIn : t.login}
            </button>

            <button
              type="button"
              className="forgot-password"
              onClick={() => {
                setShowReset(true);
                setError('');
              }}
            >
              {t.forgotPassword}
            </button>
          </form>
        ) : isFirstLogin ? (
          renderFirstLoginForm()
        ) : (
          <div>
            {renderResetForm()}
            <button
              type="button"
              className="back-to-login"
              onClick={() => {
                setShowReset(false);
                setResetStep(1);
                setResetEmail('');
                setResetCode('');
                setResetNewPassword('');
                setResetUser(null);
                setResetMessage('');
              }}
            >
              {t.backToLogin}
            </button>
          </div>
        )}

        <div className="login-footer">
          <p className="version">{t.version}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;