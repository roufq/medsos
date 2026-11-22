import { useLanguage } from "../../context/LanguageContext";import LanguageSwitch from '../common/LanguageSwitch';
import Brand from '../common/Brand';
import { usePlatform } from '../../context/PlatformContext';
import { postUrl } from '../../utils/postUrl';
import { profileUrl } from '../../utils/profileUrl';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Mail, Settings, Menu, Package, FileText, Home, Compass, UserRound, ShoppingBag, SquarePlay, SquarePen, ChevronDown, ChevronRight, Sun, Moon, BadgeCheck, Palette, HelpCircle, LogOut, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { socialApi } from '../../api/socialApi';
import { useNotifications } from '../../hooks/useNotifications';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  currentTab?: string;
  onRequestCreatePost?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (tab: 'home' | 'explore' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics') => void;
  onOpenProfile?: (userId: string) => void;
  onToggleMobileSidebar: () => void;
  onLogout?: () => void;
}

const emptyResults = { users: [], posts: [], jobs: [], products: [] };

export default function Header({ currentUser, searchQuery, setSearchQuery, onNavigate, onOpenProfile, onToggleMobileSidebar, currentTab, onRequestCreatePost, onLogout }: HeaderProps) {const { t , language: uiLanguage} = useLanguage();
  const { uploadLimitsEnabled } = usePlatform();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState<any>(emptyResults);
  const navigate = useNavigate();
  const openPost = (post: any) => {setIsFocused(false);navigate(typeof post === 'object' ? postUrl(post) : `/post/${post}`);};
  const {
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    notificationsLoading,
    unreadCount,
    loadNotifications,
    openNotification,
    markAllAsRead
  } = useNotifications((notification: any) => {
    if ((notification.entity_type === 'post' || notification.entity_type === 'comment') && notification.entity_hash) navigate(`/post/${notification.entity_hash}`);else
    if (notification.actor?.id) navigate(profileUrl(notification.actor));
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

  const totalResults = results.users.length + results.posts.length + results.products.length;
  const openUser = (id: string | number) => {
    setIsFocused(false);
    if (onOpenProfile) onOpenProfile(String(id));else
    onNavigate('network');
  };

  return (
    <header className="poster-header w-full sticky top-0 z-40">
      <div className="poster-header-inner">
        <div className="poster-header-start">
          <button type="button" onClick={onToggleMobileSidebar} className="md:hidden text-text-secondary hover:text-primary transition-colors cursor-pointer p-1" aria-label={t("Open menu")}>
            <Menu className="w-6 h-6" />
          </button>

          <div className="poster-logo"><Brand /></div>

          <div className="poster-search relative">
            <div className="poster-search-input flex items-center rounded-full px-4 py-2">
              <Search className="w-5 h-5 text-outline" />
              <input type="search" value={searchQuery} onFocus={() => setIsFocused(true)} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => {if (event.key === 'Enter' && searchQuery.trim().length >= 2) {setIsFocused(false);navigate(`${currentTab === 'explore' ? '/explore' : '/search'}?q=${encodeURIComponent(searchQuery.trim())}`);}}} placeholder={t("Cari judul, #hashtag, lokasi, @username…")} className="bg-transparent border-none outline-none focus:ring-0 text-sm ml-2 w-full text-text-primary placeholder:text-outline" aria-label={t("Search application")} />
            </div>

            {isFocused && searchQuery.trim().length >= 2 &&
            <div className="absolute left-0 right-0 top-12 max-h-[70vh] overflow-y-auto rounded-2xl border border-border-subtle bg-white p-2 shadow-xl text-text-primary">
                {isSearching && <p className="px-3 py-4 text-sm text-text-secondary">{t("Searching database...")}</p>}
                {!isSearching && searchError && <p className="px-3 py-4 text-sm text-error">{searchError}</p>}
                {!isSearching && !searchError && totalResults === 0 && <p className="px-3 py-4 text-sm text-text-secondary">{t("No matching data found.")}</p>}

                {results.users.slice(0, 6).map((user: any) =>
              <button key={`user-${user.id}`} type="button" onClick={() => openUser(user.username || user.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-secondary-container flex items-center justify-center font-bold text-primary">{user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : user.name?.slice(0, 1).toUpperCase()}</div>
                    <div className="min-w-0"><div className="truncate text-sm font-bold">{user.name}</div><div className="truncate text-xs text-text-secondary">@{user.username || t("user")} {t("· User")}</div></div>
                  </button>
              )}

                {results.products.slice(0, 4).map((post: any) => {
                  const target = post.original_post || post;
                  const video = target.media?.find((m: any) => m.media_type === 'video');
                  const thumb = target.media?.find((m: any) => m.media_type === 'image')?.media_url
                    || video?.thumbnail_url
                    || (target.link?.image_url && !String(target.link.image_url).includes('google.com/s2/favicons') ? target.link.image_url : '');
                  return (
                    <button key={`product-${post.id}`} type="button" onClick={() => openPost(post)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-surface-container-low flex items-center justify-center">
                        {thumb ? <img src={thumb} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : video?.media_url ? <video src={video.media_url} muted playsInline preload="metadata" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="min-w-0"><div className="truncate text-sm font-bold">{post.title || post.content || t("Product")}</div><div className="truncate text-xs text-text-secondary">{post.shop?.category || t("Product")}</div></div>
                    </button>
                  );
                })}

                {results.posts.slice(0, 4).map((post: any) => {
                  const target = post.original_post || post;
                  const video = target.media?.find((m: any) => m.media_type === 'video');
                  const thumb = target.media?.find((m: any) => m.media_type === 'image')?.media_url
                    || video?.thumbnail_url
                    || (target.link?.image_url && !String(target.link.image_url).includes('google.com/s2/favicons') ? target.link.image_url : '');
                  return (
                    <button key={`post-${post.id}`} type="button" onClick={() => openPost(post)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-container-low">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-surface-container-low flex items-center justify-center">
                        {thumb ? <img src={thumb} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : video?.media_url ? <video src={video.media_url} muted playsInline preload="metadata" className="h-full w-full object-cover" /> : <FileText className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="min-w-0"><div className="truncate text-sm font-bold">{post.title || post.content || t("Post")}</div><div className="truncate text-xs text-text-secondary">{post.user?.name || t("Post")}</div></div>
                    </button>
                  );
                })}
              </div>
            }
          </div>
        </div>

        <nav className="poster-top-nav" aria-label={t("Navigasi utama")}>
          <button className={currentTab === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}><Home size={19} />{t("Home")}</button>
          <button className={currentTab === 'explore' ? 'active' : ''} onClick={() => onNavigate('explore')}><Compass size={19} />{t("Explore")}</button>
          {currentTab !== 'explore' && <button className={currentTab === 'profile' ? 'active' : ''} onClick={() => onNavigate('profile')}><UserRound size={19} />{t("Profile")}</button>}
          <button className={currentTab === 'shop' ? 'active' : ''} aria-current={currentTab === 'shop' ? 'page' : undefined} onClick={() => navigate('/shop')}><ShoppingBag size={19} />{t("Shop")}</button>
          {currentTab === 'explore' ? <button onClick={()=>onNavigate('messages')}><Mail size={19}/>{t('Pesan')}</button> : <><button className={currentTab === 'videos' ? 'active' : ''} onClick={() => navigate('/videos')}><SquarePlay size={19} />{t("Video")}</button><button className={currentTab === 'newpost' ? 'active' : ''} onClick={onRequestCreatePost}><SquarePen size={19} />{t("New Post")}</button></>}
        </nav>
        <div className="poster-account flex items-center gap-5"><LanguageSwitch />
          <button type="button" className="poster-theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? t("Aktifkan mode terang") : t("Aktifkan mode gelap")} title={theme === 'dark' ? t("Mode terang") : t("Mode gelap")} aria-pressed={theme === 'dark'}>{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
          <div className="flex gap-1">
            <div className="relative">
              <button type="button" onClick={() => {const next = !notificationsOpen;setNotificationsOpen(next);setIsFocused(false);if (next) loadNotifications();}} className="relative p-2 text-text-secondary hover:text-primary transition-all rounded-full hover:bg-surface-container-low cursor-pointer" aria-label={t("Notifications")}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute right-0 top-0 min-w-4 h-4 px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {notificationsOpen &&
              <div className="absolute right-0 top-11 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-border-subtle bg-white p-2 shadow-xl text-text-primary">
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="text-sm font-bold">{t("Notifications")}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">{unreadCount} {t("unread")}</span>
                      {unreadCount > 0 && (
                        <button type="button" onClick={markAllAsRead} className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-90 cursor-pointer">{t("Sudah dilihat")}</button>
                      )}
                    </div>
                  </div>
                  {notificationsLoading && notifications.length === 0 && <p className="px-3 py-4 text-xs text-text-secondary">{t("Loading notifications...")}</p>}
                  {!notificationsLoading && notifications.length === 0 && <p className="px-3 py-4 text-xs text-text-secondary">{t("No notifications yet.")}</p>}
                  {notifications.map((notification) =>
                <button key={notification.id} type="button" onClick={() => openNotification(notification)} className={`flex w-full gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface-container-low ${notification.read_at ? '' : 'bg-secondary-container/40'}`}>
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold">{notification.actor?.avatar_url ? <img src={notification.actor.avatar_url} alt="" className="h-full w-full object-cover" /> : notification.actor?.name?.slice(0, 1).toUpperCase() || '!'}</div>
                      <div className="min-w-0"><p className="text-xs text-text-primary"><span className="font-bold">{notification.actor?.name || t("System")}</span> {notification.actor ? String(notification.message).replace(/^Someone\s+/i, '') : notification.message}</p><p className="mt-1 text-[10px] text-outline">{new Date(notification.created_at).toLocaleString(uiLanguage === 'en' ? 'en-US' : 'id-ID')}</p></div>
                    </button>
                )}
                </div>
              }
            </div>
            {/* Messages & Settings removed from top bar to match design */}
            {/* Settings is in the Avatar dropdown */}
          </div>

          <div className="relative shrink-0">
            <div
              role="button"
              tabIndex={0}
              onClick={() => { setProfileMenuOpen((open) => !open); setNotificationsOpen(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setProfileMenuOpen((open) => !open); setNotificationsOpen(false); } }}
              aria-label={t("Menu profil")}
              className="w-9 h-9 rounded-full overflow-hidden border border-white/25 cursor-pointer active:scale-95 hover:shadow-sm transition-all"
            >
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            {profileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-white/10 bg-[#12141f] p-2 text-white shadow-2xl">
                  <button
                    type="button"
                    onClick={() => { setProfileMenuOpen(false); onNavigate('profile'); }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={currentUser.avatar} alt={currentUser.name} className="h-10 w-10 rounded-full object-cover border border-white/15 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">{currentUser.name || t("User")}</div>
                        <div className="truncate text-xs text-slate-400">@{(currentUser as any).username || t("user")}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  <div className="my-1.5 h-px bg-white/10" />

                  <button
                    type="button"
                    onClick={() => { setProfileMenuOpen(false); onNavigate('profile'); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <UserRound className="w-4 h-4 text-slate-400" />
                    <span>{t("Profile")}</span>
                  </button>

                  {uploadLimitsEnabled && <button
                    type="button"
                    onClick={() => { setProfileMenuOpen(false); navigate('/pricing'); }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <BadgeCheck className="w-4 h-4 text-indigo-400" />
                      <span>{t("Pricing")}</span>
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white">{t("Pro")}</span>
                  </button>}

                  <button
                    type="button"
                    onClick={() => { setProfileMenuOpen(false); navigate('/settings'); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>{t("Settings")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { toggleTheme(); }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Palette className="w-4 h-4 text-slate-400" />
                      <span>{t("Appearance")}</span>
                    </span>
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      {theme === 'dark' ? t("Dark") : t("Light")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setProfileMenuOpen(false); setHelpOpen(true); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>{t("Help & Support")}</span>
                  </button>

                  <div className="my-1.5 h-px bg-white/10" />

                  <button
                    type="button"
                    onClick={() => { setProfileMenuOpen(false); if (onLogout) onLogout(); else navigate('/settings'); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("Log Out")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
          {helpOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setHelpOpen(false)}>
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12141f] p-6 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-extrabold flex items-center gap-2"><HelpCircle className="w-5 h-5 text-indigo-400" /> {t("Help & Support")}</h3>
                  <button type="button" onClick={() => setHelpOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <p><strong>{t("• Kuota Posting & Centang Biru:")}</strong> {t("Akun Free mendapat 1x posting/hari (atau 3x/hari selama 1 bulan dengan membagikan kode referral). Paket berbayar mendapat 3x–24x posting/hari + Centang Biru.")}</p>
                  <p><strong>{t("• Berhenti Berlangganan:")}</strong> {t("Centang biru pemberian admin tetap berlaku tanpa langganan. Kuota paket hanya berlaku ketika pembatasan upload diaktifkan.")}</p>
                  <p><strong>{t("• Kontak Bantuan:")}</strong> {t("Hubungi tim support di")} <span className="text-indigo-400">support@postter.us</span> {t("atau kelola akun di halaman")} <button type="button" onClick={() => { setHelpOpen(false); navigate('/settings'); }} className="text-indigo-400 underline font-bold cursor-pointer">{t("Settings")}</button>.</p>
                </div>
              </div>
            </div>
          )}
          <div className="hidden">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <button onClick={() => navigate('/settings')} aria-label={t("Pengaturan akun")} className="hidden"><ChevronDown size={16} /></button>
        </div>
      </div>
    </header>);

}
