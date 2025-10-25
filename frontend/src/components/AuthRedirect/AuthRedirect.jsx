import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { authUser, authRole } = useAuthStore();

  useEffect(() => {
    if (authUser && authRole) {
      console.log('🔄 AuthRedirect - Redirecting user:', { authUser, authRole });
      
      switch (authRole) {
        case 'admin':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'authority':
          navigate('/authority-dashboard', { replace: true });
          break;
        case 'user':
          navigate('/user-dashboard', { replace: true });
          break;
        default:
          console.warn('⚠️ Unknown role, redirecting to home');
          navigate('/', { replace: true });
      }
    }
  }, [authUser, authRole, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;