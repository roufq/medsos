import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Signup from '../components/modern/Signup';
import { authApi } from '../api/authApi';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegister = async (email, fullName, password, extra) => {
    setError('');
    try {
      await register(fullName, email, password, extra);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Pendaftaran gagal. Coba lagi.');
    }
  };

  return (
    <>
      {error && <div className="fixed top-4 inset-x-4 z-50 mx-auto max-w-md rounded-xl bg-white p-4 shadow-lg border border-border-subtle text-sm text-error font-semibold" role="alert">{error}</div>}
      <Signup
        onRegister={handleRegister}
        onNavigateToLogin={() => navigate('/login')}
        onOAuth={(provider) => { window.location.href = authApi.oauthStartUrl(provider); }}
      />
    </>
  );
};

export default RegisterPage;
