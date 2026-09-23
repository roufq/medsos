import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import Header from '../components/modern/Header';
import Sidebar from '../components/modern/Sidebar';
import CreatePostModal from '../components/modern/CreatePostModal';
import Network from '../components/modern/Network';
import Jobs from '../components/modern/Jobs';
import Messages from '../components/modern/Messages';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../api/postApi';

const FeaturePage = ({ title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/thanks');
  };
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = {
    id: user?.id,
    name: user?.name || '',
    title: user?.title || '',
    avatar: user?.avatar_url || '/favicon.svg',
  };

  const handleNavigate = (tab) => {
    if (tab === 'profile') navigate(`/profile/${currentUser.id}`);
    else if (tab === 'home') navigate(`/`);
    else navigate(`/${tab}`);
  };

  const handleCreatePostSubmit = async ({ title, text, imageUrl, linkUrl, hashtags, mentions }) => {
    let pType = 'text';
    if (linkUrl) pType = 'link';
    else if (imageUrl) pType = 'image';

    const postData = {
      title: title,
      content: text,
      post_type: pType,
      media_urls: imageUrl ? [imageUrl] : [],
      link_url: linkUrl || '',
      hashtags: hashtags || [],
      mentions: mentions || [],
    };

    await postApi.createPost(postData);
    setIsCreatePostOpen(false);
    navigate('/');
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-sans flex flex-col">
      <Header 
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigate={handleNavigate}
        onOpenProfile={(userId) => navigate(`/profile/${userId}`)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <main className="max-w-7xl mx-auto flex gap-6 px-6 py-6 flex-grow w-full">
        <Sidebar 
          currentTab={title.toLowerCase()}
          onNavigate={handleNavigate}
          onRequestCreatePost={() => setIsCreatePostOpen(true)}
          onLogout={handleLogout}
        />

        <div className="flex-grow min-w-0">
          {title === 'Network' && <Network onNavigateToMessages={(userId) => navigate(userId ? `/messages?user_id=${userId}` : '/messages')} onOpenProfile={(userId) => navigate(`/profile/${userId}`)} />}
          {title === 'Jobs' && <Jobs />}
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
        </div>
      </main>

      <CreatePostModal 
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleCreatePostSubmit}
        currentUser={currentUser}
      />
    </div>
  );
};

export default FeaturePage;
