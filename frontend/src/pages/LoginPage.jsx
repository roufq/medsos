import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/modern/Login';
import { authApi } from '../api/authApi';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (email, password) => {
    try {
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
      alert(err.response?.data?.error || 'Invalid email or password');
    }
  };

  const handleNavigateToSignup = () => {
    navigate('/register');
  };

	const handleOAuth = (provider) => {
		window.location.href = authApi.oauthStartUrl(provider);
	};

  return (
    <Login 
      onLogin={handleLogin} 
	  onNavigateToSignup={handleNavigateToSignup} 
	  onNavigateToForgot={() => navigate('/forgot-password')}
	  onOAuth={handleOAuth}
    />
  );
};

export default LoginPage;
