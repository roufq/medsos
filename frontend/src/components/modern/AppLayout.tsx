import { postUrl } from '../../utils/postUrl';
import { profileUrl } from '../../utils/profileUrl';
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import CreatePostModal from './CreatePostModal';
import { useAuth } from '../../context/AuthContext';

interface AppLayoutProps {
  currentTab: string;
  wide?: boolean;
  children: ReactNode;
  /** Receives posts created from the sidebar/header composer. */
  onPostCreated?: (post: any) => void;
  /** Lets a page open the shared composer (e.g. the feed's "create" card). */
  composerOpen?: boolean;
  composerType?: string;
  onComposerTypeChange?: (type: string) => void;
  setComposerType?: (type?: string) => void;
  setComposerOpen?: (open: boolean) => void;
}

const ROUTES: Record<string, string> = {
  home: '/', shop: '/shop', shorts: '/videos', videos: '/videos', network: '/network', messages: '/messages', saved: '/saved',
  settings: '/settings', admin: '/admin/dashboard', analytics: '/analytics',
};

export function useAppNavigate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (tab: string) => navigate(tab === 'profile' ? profileUrl(user) : ROUTES[tab] || '/');
}

export default function AppLayout({ currentTab, children, onPostCreated, composerOpen, setComposerOpen, wide, composerType, setComposerType, onComposerTypeChange }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const goTo = useAppNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ownComposerType, setOwnComposerType] = useState<string | undefined>();
  const [ownComposer, setOwnComposer] = useState(false);
  const isComposerOpen = composerOpen ?? ownComposer;
  const setComposer = setComposerOpen ?? setOwnComposer;
  const openComposer = () => { onComposerTypeChange?.('image'); (setComposerType ?? setOwnComposerType)(undefined); setComposer(true); };

  const currentUser = { id: user?.id, name: user?.name || '', title: user?.title || '', company: user?.company || '', avatar: user?.avatar_url || `${import.meta.env.BASE_URL}favicon.svg` };

  const handleLogout = async () => {
    await logout();
    navigate('/thanks');
  };

  return (
    <div className="poster-app bg-background text-on-background min-h-screen font-sans">
      <Header
        currentUser={currentUser as any}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigate={goTo as any}
        onOpenProfile={(id) => navigate(`/profile/${id}`)}
        onToggleMobileSidebar={() => setMobileOpen((open) => !open)}
        currentTab={isComposerOpen ? 'newpost' : currentTab}
        onRequestCreatePost={openComposer}
      />
      <main className={`poster-main ${wide ? 'poster-main-wide' : ''}`}>
        <Sidebar currentTab={currentTab} onNavigate={goTo} onRequestCreatePost={openComposer} onLogout={handleLogout} />
        {mobileOpen && <Sidebar currentTab={currentTab} onNavigate={goTo} onRequestCreatePost={openComposer} onLogout={handleLogout} mobileOpen onCloseMobile={() => setMobileOpen(false)} />}
        <div className="flex-grow min-w-0">{children}</div>
      </main>
      <CreatePostModal onTypeChange={onComposerTypeChange} initialType={setComposerType ? composerType : ownComposerType} isOpen={isComposerOpen} onClose={() => setComposer(false)} onSaved={(post) => (onPostCreated ? onPostCreated(post) : navigate(postUrl(post)))} />
    </div>
  );
}
