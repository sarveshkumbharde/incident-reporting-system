import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { authUser, authRole } = useAuthStore();

  useEffect(() => {
    // 🚩 If user is NOT logged in → go to LOGIN.
    if (!authUser || !authRole) {
      navigate('/login', { replace: true });
      return;
    }

    // 🚀 Redirect logged-in users to their dashboard
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
        navigate('/', { replace: true });
    }
  }, [authUser, authRole, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
