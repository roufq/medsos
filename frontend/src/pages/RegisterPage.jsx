import {notify} from '../utils/feedback';
import {useFeedbackState} from '../hooks/useFeedbackState';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Signup from '../components/modern/Signup';
import { userApi } from '../api/userApi';
import { OAUTH_REASONS } from '../utils/oauthReasons';

const RegisterPage = () => {
  const { register, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reason = params.get('oauth_error');
  const [error, setError] = useFeedbackState(OAUTH_REASONS[reason] || '', 'error');

  const handleRegister = async (email, fullName, password, extra) => {
    setError('');
    try {
      const { profile, ...account } = extra || {};
      await register(fullName, email, password, account);
      notify.success('Akun berhasil dibuat.');
      if (profile) {
        try { updateProfileState(await userApi.updateSettings(profile)); }
        catch { notify.error('Akun berhasil dibuat, tetapi profil belum tersimpan. Lengkapi di Pengaturan.'); navigate('/settings'); return; }
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
      />
    </>
  );
};

export default RegisterPage;
