import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/modern/Login';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (email, password) => {
    try {
      setError('');
      // Use standard password if none provided by the SSO mock button
      await login(email, password || 'password123');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
      alert(err.response?.data?.error || 'Invalid email or password');
    }
  };

  const handleNavigateToSignup = () => {
    navigate('/register');
  };

  return (
    <Login 
      onLogin={handleLogin} 
      onNavigateToSignup={handleNavigateToSignup} 
    />
  );
};

export default LoginPage;
