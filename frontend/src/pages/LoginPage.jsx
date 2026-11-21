import {notify} from '../utils/feedback';
import {useFeedbackState} from '../hooks/useFeedbackState';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/modern/Login';
import { authApi } from '../api/authApi';

import { OAUTH_REASONS } from '../utils/oauthReasons';

const LoginPage = () => {
  const { t: translateUI } = useLanguage();

  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reason = params.get('reason') || params.get('oauth_error');
  const [error, setError] = useFeedbackState(OAUTH_REASONS[reason] || '', 'error');
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useFeedbackState('', 'success');

  const handleLogin = async (identifier, password, otp) => {
    setError('');
    setMessage('');
    try {
      await login(identifier, password, otp);
      notify.success('Berhasil masuk.');
      navigate('/');
    } catch (err) {
      const text = err.response?.data?.error || 'Email/username atau password salah.';
      setError(text);
      // Offer reactivation within the 30-day window.
      setPending(/pending deletion/i.test(text) ? { identifier, password } : null);
    }
  };

  const reactivate = async () => {
    try {
      await authApi.reactivate(pending.identifier, pending.password);
      setPending(null);
      setError('');
      setMessage('Akun diaktifkan kembali. Mengalihkan…');
      await handleLogin(pending.identifier, pending.password);
    } catch (err) {
      setError(err.response?.data?.error || 'Akun tidak dapat diaktifkan kembali.');
    }
  };

  return (
    <>
      {(error || message) && (
        <div className="fixed top-4 inset-x-4 z-50 mx-auto max-w-md rounded-xl bg-white p-4 shadow-lg border border-border-subtle text-sm" role="alert">
          {error && <p className="text-error font-semibold">{translateUI(error)}</p>}
          {message && <p className="text-success font-semibold">{message}</p>}
          {pending && <button type="button" onClick={reactivate} className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white">{translateUI("Aktifkan kembali akun saya")}</button>}
        </div>
      )}
      <Login
        onLogin={handleLogin}
        onNavigateToSignup={() => navigate('/register')}
        onNavigateToForgot={() => navigate('/forgot-password')}
      />
    </>
  );
};

export default LoginPage;
