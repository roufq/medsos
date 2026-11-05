import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Signup from '../components/modern/Signup';
import { userApi } from '../api/userApi';
import { authApi } from '../api/authApi';
import { OAUTH_REASONS } from './LoginPage';

const RegisterPage = () => {
  const { register, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reason = params.get('oauth_error');
  const [error, setError] = useState(OAUTH_REASONS[reason] || '');

  const handleRegister = async (email, fullName, password, extra) => {
    setError('');
    try {
      const { profile, ...account } = extra || {};
      await register(fullName, email, password, account);
      if (profile) {
        try { updateProfileState(await userApi.updateSettings(profile)); }
        catch { navigate('/settings'); return; }
      }
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
        onOAuth={(provider, ref) => { window.location.href = authApi.oauthStartUrl(provider, { from: 'register', ref }); }}
      />
    </>
  );
};

export default RegisterPage;
