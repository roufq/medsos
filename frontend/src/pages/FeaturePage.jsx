import { Suspense, lazy, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import AppLayout from '../components/modern/AppLayout';
import PageLoader from '../components/common/PageLoader';
import { useAuth } from '../context/AuthContext';
import { messageApi } from '../api/messageApi';
const Network = lazy(() => import('../components/modern/Network'));
const Messages = lazy(() => import('../components/modern/Messages'));

const FeaturePage = ({ page }) => {
  const { t: translateUI } = useLanguage();

  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUser = useMemo(() => ({ id: user?.id, name: user?.name || '', title: user?.title || '', avatar: user?.avatar_url || '/favicon.svg' }), [user?.id, user?.name, user?.title, user?.avatar_url]);

  const handleNavigateToMessages = async (userId) => {
    if (!userId) {
      navigate('/messages');
      return;
    }
    try {
      const { token } = await messageApi.createIntent({ user_id: String(userId) });
      navigate(`/messages?t=${encodeURIComponent(token)}`);
    } catch {
      navigate('/messages');
    }
  };

  return (
    <AppLayout currentTab={page}>
          <Suspense fallback={<PageLoader />}>
            {page === 'network' && <Network onNavigateToMessages={handleNavigateToMessages} onOpenProfile={(userId) => navigate(`/profile/${userId}`)} />}
            {page === 'messages' && <Messages currentUser={currentUser} />}
          </Suspense>
          {page === 'analytics' && (
            <div className="bg-white rounded-2xl border border-border-subtle/40 shadow-sm flex flex-col items-center justify-center text-center p-6 sm:p-12 min-h-[calc(100dvh-190px)] md:h-[calc(100dvh-130px)]">
              <div className="bg-surface-container-low p-6 rounded-full mb-6">
                <Construction size={48} className="text-primary" />
              </div>
              <h1 className="text-3xl font-black text-text-primary mb-3">{translateUI("Analytics is Coming Soon!")}</h1>
              <p className="text-text-secondary text-lg max-w-md mb-8">{translateUI("We are currently building this feature to give you the best data analytics experience. Stay tuned!")}</p>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-full shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                <ArrowLeft size={20} />{translateUI("Back to Home")}</button>
            </div>
          )}
    </AppLayout>
  );
};

export default FeaturePage;
