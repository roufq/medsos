import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Mail, Settings, Menu, BriefcaseBusiness, Package, FileText, Home, UserRound, ShoppingBag, SquarePlay, SquarePen, ChevronDown, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { socialApi } from '../../api/socialApi';
import { useNotifications } from '../../hooks/useNotifications';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  currentTab?: string;
  onRequestCreatePost?: () => void;
  onLogout?: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (tab: 'home' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics') => void;
  onOpenProfile?: (userId: string) => void;
  onToggleMobileSidebar: () => void;
}

const emptyResults = { users: [], posts: [], jobs: [], products: [] };

export default function Header({ currentUser, searchQuery, setSearchQuery, onNavigate, onOpenProfile, onToggleMobileSidebar, currentTab, onRequestCreatePost, onLogout }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = async () => {
    if (!onLogout || loggingOut) return;
    setLoggingOut(true);
    try { await onLogout(); } finally { setLoggingOut(false); }
  };
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState<any>(emptyResults);
  const navigate = useNavigate();
  const openPost = (id: number) => { setIsFocused(false); navigate(`/post/${id}`); };
  const {
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    notificationsLoading,
    unreadCount,
    loadNotifications,
    openNotification,
  } = useNotifications((notification: any) => {
    if (notification.entity_type === 'post' && notification.entity_id) navigate(`/post/${notification.entity_id}`);
    else if (notification.actor?.id) navigate(`/profile/${notification.actor.id}`);
  });

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setResults(emptyResults);
      setSearchError('');
      setIsSearching(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const data = await socialApi.search(query);
        if (active) setResults({ ...emptyResults, ...(data || {}) });
      } catch (error: any) {
        if (active) {
          setResults(emptyResults);
          setSearchError(error.response?.data?.error || 'Search failed');
        }
      } finally {
        if (active) setIsSearching(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const totalResults = results.users.length + results.posts.length + results.jobs.length + results.products.length;
  const openUser = (id: string | number) => {
    setIsFocused(false);
    if (onOpenProfile) onOpenProfile(String(id));
    else onNavigate('network');
  };

  return (
    <header className="poster-header w-full sticky top-0 z-40">
      <div className="poster-header-inner">
        <div className="poster-header-start">
          <button type="button" onClick={onToggleMobileSidebar} className="md:hidden text-text-secondary hover:text-primary transition-colors cursor-pointer p-1" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>

          <div onClick={() => onNavigate('home')} className="poster-logo">theposter</div>

          <div className="poster-search relative hidden md:block">
            <div className="poster-search-input flex items-center rounded-full px-4 py-2">
              <Search className="w-5 h-5 text-outline" />
              <input type="search" value={searchQuery} onFocus={() => setIsFocused(true)} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && searchQuery.trim().length >= 2) { setIsFocused(false); navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); } }} placeholder="Cari judul, #hashtag, lokasi, @username…" className="bg-transparent border-none outline-none focus:ring-0 text-sm ml-2 w-full text-text-primary placeholder:text-outline" aria-label="Search application" />
            </div>

            {isFocused && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-12 max-h-[70vh] overflow-y-auto rounded-2xl border border-border-subtle bg-white p-2 shadow-xl text-text-primary">
                {isSearching && <p className="px-3 py-4 text-sm text-text-secondary">Searching database...</p>}
                {!isSearching && searchError && <p className="px-3 py-4 text-sm text-error">{searchError}</p>}
                {!isSearching && !searchError && totalResults === 0 && <p className="px-3 py-4 text-sm text-text-secondary">No matching data found.</p>}

                {results.users.slice(0, 6).map((user: any) => (
                  <button key={`user-${user.id}`} type="button" onClick={() => openUser(user.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-secondary-container flex items-center justify-center font-bold text-primary">{user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : user.name?.slice(0, 1).toUpperCase()}</div>
                    <div className="min-w-0"><div className="truncate text-sm font-bold">{user.name}</div><div className="truncate text-xs text-text-secondary">@{user.username || 'user'} · User</div></div>
                  </button>
                ))}

                {results.jobs.slice(0, 4).map((job: any) => (
                  <button key={`job-${job.id}`} type="button" onClick={() => { setIsFocused(false); onNavigate('jobs'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low">
                    <BriefcaseBusiness className="h-5 w-5 text-primary" /><div className="min-w-0"><div className="truncate text-sm font-bold">{job.title}</div><div className="truncate text-xs text-text-secondary">{job.company} · Job</div></div>
                  </button>
                ))}

                {results.products.slice(0, 4).map((post: any) => (
                  <button key={`product-${post.id}`} type="button" onClick={() => openPost(post.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low">
                    <Package className="h-5 w-5 text-primary" /><div className="min-w-0"><div className="truncate text-sm font-bold">{post.title || post.content || 'Product'}</div><div className="truncate text-xs text-text-secondary">{post.shop?.category || 'Product'}</div></div>
                  </button>
                ))}

                {results.posts.slice(0, 4).map((post: any) => (
                  <button key={`post-${post.id}`} type="button" onClick={() => openPost(post.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low">
                    <FileText className="h-5 w-5 text-primary" /><div className="min-w-0"><div className="truncate text-sm font-bold">{post.title || post.content || 'Post'}</div><div className="truncate text-xs text-text-secondary">{post.user?.name || 'Post'}</div></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="poster-top-nav" aria-label="Navigasi utama">
          <button className={currentTab === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}><Home size={19} />Home</button>
          <button className={currentTab === 'profile' ? 'active' : ''} onClick={() => onNavigate('profile')}><UserRound size={19} />Profile</button>
          <button onClick={() => navigate('/search?q=shop')}><ShoppingBag size={19} />Shop</button>
          <button className={currentTab === 'shorts' ? 'active' : ''} onClick={() => navigate('/shorts')}><SquarePlay size={19} />Video</button>
          <button className={currentTab === 'newpost' ? 'active' : ''} onClick={onRequestCreatePost}><SquarePen size={19} />New Post</button>
        </nav>
        <div className="poster-account flex items-center gap-5">
          <button type="button" className="poster-theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'} title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'} aria-pressed={theme === 'dark'}>{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
          <div className="flex gap-1">
            <div className="relative">
              <button type="button" onClick={() => { const next = !notificationsOpen; setNotificationsOpen(next); setIsFocused(false); if (next) loadNotifications(); }} className="relative p-2 text-text-secondary hover:text-primary transition-all rounded-full hover:bg-surface-container-low cursor-pointer" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute right-0 top-0 min-w-4 h-4 px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-11 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-border-subtle bg-white p-2 shadow-xl text-text-primary">
                  <div className="flex items-center justify-between px-3 py-2"><span className="text-sm font-bold">Notifications</span><span className="text-xs text-text-secondary">{unreadCount} unread</span></div>
                  {notificationsLoading && notifications.length === 0 && <p className="px-3 py-4 text-xs text-text-secondary">Loading notifications...</p>}
                  {!notificationsLoading && notifications.length === 0 && <p className="px-3 py-4 text-xs text-text-secondary">No notifications yet.</p>}
                  {notifications.map((notification) => (
                    <button key={notification.id} type="button" onClick={() => openNotification(notification)} className={`flex w-full gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface-container-low ${notification.read_at ? '' : 'bg-secondary-container/40'}`}>
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold">{notification.actor?.avatar_url ? <img src={notification.actor.avatar_url} alt="" className="h-full w-full object-cover" /> : notification.actor?.name?.slice(0, 1).toUpperCase() || '!'}</div>
                      <div className="min-w-0"><p className="text-xs text-text-primary"><span className="font-bold">{notification.actor?.name || 'System'}</span> {notification.actor ? String(notification.message).replace(/^Someone\s+/i, '') : notification.message}</p><p className="mt-1 text-[10px] text-outline">{new Date(notification.created_at).toLocaleString()}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={() => onNavigate('messages')} className="relative p-2 text-text-secondary hover:text-primary transition-all rounded-full hover:bg-surface-container-low cursor-pointer" aria-label="Messages"><Mail className="w-5 h-5" /></button>
            <button type="button" onClick={() => navigate('/settings')} className="p-2 text-text-secondary hover:text-primary transition-all rounded-full hover:bg-surface-container-low cursor-pointer" aria-label="Pengaturan akun"><Settings className="w-5 h-5" /></button>
          </div>

          <div onClick={() => onNavigate('profile')} className="w-9 h-9 rounded-full overflow-hidden border border-border-subtle cursor-pointer active:scale-95 hover:shadow-sm transition-all">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <button onClick={() => navigate('/settings')} aria-label="Pengaturan akun" className="poster-account-chevron"><ChevronDown size={16} /></button>
          {onLogout && <button type="button" onClick={handleLogout} disabled={loggingOut} className="poster-logout" aria-label="Keluar" title="Keluar dari akun"><LogOut size={18} /><span>{loggingOut ? 'Keluar...' : 'Keluar'}</span></button>}
        </div>
      </div>
    </header>
  );
}
