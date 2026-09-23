import { useEffect, useState } from 'react';
import { Search, Bell, Mail, Settings, Menu, BriefcaseBusiness, Package, FileText } from 'lucide-react';
import { socialApi } from '../../api/socialApi';
import { useNotifications } from '../../hooks/useNotifications';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (tab: 'home' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics') => void;
  onOpenProfile?: (userId: string) => void;
  onToggleMobileSidebar: () => void;
}

const emptyResults = { users: [], posts: [], jobs: [], products: [] };

export default function Header({ currentUser, searchQuery, setSearchQuery, onNavigate, onOpenProfile, onToggleMobileSidebar }: HeaderProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState<any>(emptyResults);
  const {
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    notificationsLoading,
    unreadCount,
    loadNotifications,
    openNotification,
  } = useNotifications(onOpenProfile ? (actorId: string) => onOpenProfile(actorId) : undefined);

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
    <header className="w-full sticky top-0 bg-white border-b border-border-subtle z-40">
      <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 flex-1">
          <button type="button" onClick={onToggleMobileSidebar} className="md:hidden text-text-secondary hover:text-primary transition-colors cursor-pointer p-1" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>

          <div onClick={() => onNavigate('home')} className="font-headline-lg text-headline-lg font-bold text-primary cursor-pointer tracking-tight select-none">Connect Modern</div>

          <div className="relative hidden md:block w-full max-w-md">
            <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-transparent focus-within:border-primary focus-within:bg-white focus-within:shadow-md transition-all">
              <Search className="w-5 h-5 text-outline" />
              <input type="search" value={searchQuery} onFocus={() => setIsFocused(true)} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search users, jobs, posts, products..." className="bg-transparent border-none outline-none focus:ring-0 text-sm ml-2 w-full text-text-primary placeholder:text-outline" aria-label="Search application" />
            </div>

            {isFocused && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-12 max-h-[70vh] overflow-y-auto rounded-2xl border border-border-subtle bg-white p-2 shadow-xl">
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
                  <button key={`product-${post.id}`} type="button" onClick={() => { setIsFocused(false); onNavigate('home'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low">
                    <Package className="h-5 w-5 text-primary" /><div className="min-w-0"><div className="truncate text-sm font-bold">{post.title || post.content || 'Product'}</div><div className="truncate text-xs text-text-secondary">{post.shop?.category || 'Product'}</div></div>
                  </button>
                ))}

                {results.posts.slice(0, 4).map((post: any) => (
                  <button key={`post-${post.id}`} type="button" onClick={() => { setIsFocused(false); onNavigate('home'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low">
                    <FileText className="h-5 w-5 text-primary" /><div className="min-w-0"><div className="truncate text-sm font-bold">{post.title || post.content || 'Post'}</div><div className="truncate text-xs text-text-secondary">{post.user?.name || 'Post'}</div></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex gap-1">
            <div className="relative">
              <button type="button" onClick={() => { const next = !notificationsOpen; setNotificationsOpen(next); setIsFocused(false); if (next) loadNotifications(); }} className="relative p-2 text-text-secondary hover:text-primary transition-all rounded-full hover:bg-surface-container-low cursor-pointer" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute right-0 top-0 min-w-4 h-4 px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-11 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-border-subtle bg-white p-2 shadow-xl">
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
            <button type="button" onClick={() => onNavigate('profile')} className="p-2 text-text-secondary hover:text-primary transition-all rounded-full hover:bg-surface-container-low cursor-pointer" aria-label="Profile settings"><Settings className="w-5 h-5" /></button>
          </div>

          <div onClick={() => onNavigate('profile')} className="w-9 h-9 rounded-full overflow-hidden border border-border-subtle cursor-pointer active:scale-95 hover:shadow-sm transition-all">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </header>
  );
}
