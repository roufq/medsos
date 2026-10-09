import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import CreatePostModal from './CreatePostModal';
import { useAuth } from '../../context/AuthContext';

interface AppLayoutProps {
  currentTab: string;
  children: ReactNode;
  /** Receives posts created from the sidebar/header composer. */
  onPostCreated?: (post: any) => void;
  /** Lets a page open the shared composer (e.g. the feed's "create" card). */
  composerOpen?: boolean;
  setComposerOpen?: (open: boolean) => void;
}

const ROUTES: Record<string, string> = {
  home: '/', shorts: '/shorts', network: '/network', jobs: '/jobs', messages: '/messages', saved: '/saved',
  settings: '/settings', admin: '/admin/dashboard', analytics: '/analytics',
};

export function useAppNavigate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (tab: string) => navigate(tab === 'profile' ? `/profile/${user?.id}` : ROUTES[tab] || '/');
}

export default function AppLayout({ currentTab, children, onPostCreated, composerOpen, setComposerOpen }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const goTo = useAppNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ownComposer, setOwnComposer] = useState(false);
  const isComposerOpen = composerOpen ?? ownComposer;
  const setComposer = setComposerOpen ?? setOwnComposer;

  const currentUser = { id: user?.id, name: user?.name || '', title: user?.title || '', company: user?.company || '', avatar: user?.avatar_url || '/favicon.svg' };

  const handleLogout = async () => {
    await logout();
    navigate('/thanks');
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-sans">
      <Header
        currentUser={currentUser as any}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigate={goTo as any}
        onOpenProfile={(id) => navigate(`/profile/${id}`)}
        onToggleMobileSidebar={() => setMobileOpen((open) => !open)}
      />
      <main className="max-w-7xl mx-auto flex gap-6 px-3 sm:px-6 py-6 min-h-[calc(100vh-80px)]">
        <Sidebar currentTab={currentTab} onNavigate={goTo} onRequestCreatePost={() => setComposer(true)} onLogout={handleLogout} />
        {mobileOpen && <Sidebar currentTab={currentTab} onNavigate={goTo} onRequestCreatePost={() => setComposer(true)} onLogout={handleLogout} mobileOpen onCloseMobile={() => setMobileOpen(false)} />}
        <div className="flex-grow min-w-0">{children}</div>
      </main>
      <CreatePostModal isOpen={isComposerOpen} onClose={() => setComposer(false)} onSaved={(post) => (onPostCreated ? onPostCreated(post) : navigate(`/post/${post.id}`))} />
    </div>
  );
}
