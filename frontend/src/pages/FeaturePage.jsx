import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import AppLayout from '../components/modern/AppLayout';
import Network from '../components/modern/Network';
import Messages from '../components/modern/Messages';
import { useAuth } from '../context/AuthContext';

const FeaturePage = ({ title }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUser = { id: user?.id, name: user?.name || '', title: user?.title || '', avatar: user?.avatar_url || '/favicon.svg' };

  return (
    <AppLayout currentTab={title.toLowerCase()}>
          {title === 'Network' && <Network onNavigateToMessages={(userId) => navigate(userId ? `/messages?user_id=${userId}` : '/messages')} onOpenProfile={(userId) => navigate(`/profile/${userId}`)} />}
          {title === 'Messages' && <Messages currentUser={currentUser} />}
          {title === 'Analytics' && (
            <div className="bg-white rounded-2xl border border-border-subtle/40 shadow-sm flex flex-col items-center justify-center text-center p-12 h-[calc(100vh-130px)]">
              <div className="bg-surface-container-low p-6 rounded-full mb-6">
                <Construction size={48} className="text-primary" />
              </div>
              <h1 className="text-3xl font-black text-text-primary mb-3">
                Analytics is Coming Soon!
              </h1>
              <p className="text-text-secondary text-lg max-w-md mb-8">
                We are currently building this feature to give you the best data analytics experience. Stay tuned!
              </p>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-full shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                <ArrowLeft size={20} />
                Back to Home
              </button>
            </div>
          )}
    </AppLayout>
  );
};

export default FeaturePage;
