import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Signup from '../components/modern/Signup';
import { authApi } from '../api/authApi';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegister = async (email, fullName, password) => {
    try {
      setError('');
      // Use standard password if none provided by the SSO mock button
      await register(fullName, email, password || 'password123');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
      alert(err.response?.data?.error || 'Registration failed. Try again.');
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <Signup 
      onRegister={handleRegister} 
	  onNavigateToLogin={handleNavigateToLogin} 
	  onOAuth={(provider) => { window.location.href = authApi.oauthStartUrl(provider); }}
    />
  );
};

export default RegisterPage;
