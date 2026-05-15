import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';

const ProtectedRoute = ({ children, user, requiredRole }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  

  const effectiveRole = user.role === 'lab' ? 'teacher' : user.role;
  const required = requiredRole === 'teacher' ? 'teacher' : requiredRole;
  
  if (requiredRole && effectiveRole !== required) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'teacher' || user.role === 'lab') return <Navigate to="/teacher" replace />;

    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('✅ Колдонуучу жүктөлдү:', parsedUser);
      } catch (e) {
        console.error('JSON парсинг катасы:', e);
        localStorage.removeItem('currentUser');
      }
    } else {
      console.log('❌ LocalStorageда колдонуучу жок');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log('✅ Логин ийгиликтүү:', userData);
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);
  };

  const handleLogout = () => {
    console.log('❌ Чыгуу');
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
  };

  if (loading) {
    return <div className="app-loading">Загрузка...</div>;
  }

  return (
    <Router>
      <div className="app-main">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} onLogout={handleLogout} />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/teacher"
            element={
              <ProtectedRoute user={user} requiredRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to={user.role === 'lab' ? '/teacher' : `/${user.role}`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;