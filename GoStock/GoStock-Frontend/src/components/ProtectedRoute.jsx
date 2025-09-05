import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Token yoksa login'e yönlendir
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Eğer belirli roller belirtilmişse, kullanıcının rolünü kontrol et
  if (allowedRoles.length > 0) {
    const userRole = user.role;
    const hasAccess = allowedRoles.some(role => 
      userRole === role || 
      (role === 'admin' && userRole === 'Admin') ||
      (role === 'manager' && userRole === 'Yönetici') ||
      (role === 'user' && userRole === 'Personel')
    );

    if (!hasAccess) {
      // Yetkisiz erişim - ana sayfaya yönlendir
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
