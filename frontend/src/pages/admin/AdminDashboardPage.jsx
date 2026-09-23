import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
import { useNotifications } from '../../hooks/useNotifications';

import AdminOverviewTab from '../../components/admin/AdminOverviewTab';
import AdminUsersTab from '../../components/admin/AdminUsersTab';
import AdminModerationTab from '../../components/admin/AdminModerationTab';

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const {
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    unreadCount,
    loadNotifications,
    openNotification: handleNotification,
  } = useNotifications((actorId) => navigate(`/profile/${actorId}`));

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsData, usersData, reportsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getReports()
      ]);
      setStats(statsData);
      setUsersList(usersData);
      setReports(reportsData || []);
    } catch (e) {
      console.error('Failed to load admin data', e);
      setError(e.response?.data?.error || e.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewReport = async (id, status, deletePost = false) => {
    await adminApi.reviewReport(id, status, deletePost);
    await fetchAdminData();
  };

  const handleToggleBlock = async (targetUser) => {
    if (targetUser.account_status === 'blocked') {
      await adminApi.unblockUser(targetUser.id);
    } else {
      await adminApi.blockUser(targetUser.id);
    }
    await fetchAdminData();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-text-primary antialiased flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 h-screen w-64 bg-surface-container-lowest dark:bg-surface-dim border-r border-border-subtle dark:border-outline-variant shadow-sm flex flex-col p-4 gap-2 z-50">
        <div className="flex flex-col gap-1 mb-6 px-2">
          <span className="font-headline-md text-headline-md font-black text-primary dark:text-primary-fixed">Connect Modern</span>
          <span className="font-label-md text-label-md text-text-secondary">Professional Suite</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-3 py-2 font-label-md text-label-md transition-all scale-95 active:scale-90 rounded-lg w-full text-left ${
              activeTab === 'overview' 
                ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-on-secondary-fixed font-bold' 
                : 'text-text-secondary dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Admin Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-3 py-2 font-label-md text-label-md transition-all scale-95 active:scale-90 rounded-lg w-full text-left ${
              activeTab === 'users' 
                ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-on-secondary-fixed font-bold' 
                : 'text-text-secondary dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span>User Management</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-3 px-3 py-2 font-label-md text-label-md transition-all scale-95 active:scale-90 rounded-lg w-full text-left ${
              activeTab === 'moderation' 
                ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-on-secondary-fixed font-bold' 
                : 'text-text-secondary dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            <span>Content Moderation</span>
          </button>

        </nav>

        <footer className="mt-auto flex flex-col gap-1 border-t border-border-subtle pt-4">
          <button className="flex items-center gap-3 px-3 py-2 text-text-secondary font-label-md text-label-md hover:bg-surface-container-low rounded-lg transition-all w-full text-left">
            <span className="material-symbols-outlined">help</span>
            <span>Support</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-error font-label-md text-label-md hover:bg-error/10 rounded-lg transition-all w-full text-left">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </footer>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen relative w-full">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 bg-surface dark:bg-surface-dim border-b border-border-subtle dark:border-outline-variant z-40">
          <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">search</span>
              <input 
                type="text" 
                placeholder="Search across users, teams or roles..." 
                value={searchQuery}
                onChange={(event) => { setSearchQuery(event.target.value); setActiveTab('users'); }}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full font-body-md text-body-md focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => { const next = !notificationsOpen; setNotificationsOpen(next); if (next) loadNotifications(); }} className="relative p-2 text-text-secondary hover:bg-surface-container-low rounded-full transition-colors" aria-label="Notifications">
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && <span className="absolute right-0 top-0 min-w-4 h-4 rounded-full bg-error px-1 text-[9px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                </button>
                {notificationsOpen && <div className="absolute right-0 top-12 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-border-subtle bg-white p-2 shadow-xl">
                  <div className="px-3 py-2 text-sm font-bold">Notifications</div>
                  {notifications.length === 0 && <p className="px-3 py-4 text-xs text-text-secondary">No notifications yet.</p>}
                  {notifications.map((notification) => <button key={notification.id} type="button" onClick={() => handleNotification(notification)} className={`flex w-full gap-3 rounded-xl p-3 text-left hover:bg-surface-container-low ${notification.read_at ? '' : 'bg-secondary-container/40'}`}><div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-secondary-container flex items-center justify-center font-bold text-primary">{notification.actor?.avatar_url ? <img src={notification.actor.avatar_url} alt="" className="h-full w-full object-cover" /> : notification.actor?.name?.slice(0,1) || '!'}</div><div><p className="text-xs"><strong>{notification.actor?.name || 'System'}</strong> {notification.actor ? String(notification.message).replace(/^Someone\s+/i, '') : notification.message}</p><p className="mt-1 text-[10px] text-outline">{new Date(notification.created_at).toLocaleString()}</p></div></button>)}
                </div>}
              </div>
              <button onClick={() => navigate('/messages')} className="p-2 text-text-secondary hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined">mail</span>
              </button>
              <button onClick={() => navigate('/settings')} className="p-2 text-text-secondary hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="h-8 w-px bg-border-subtle mx-2"></div>
              <div onClick={() => navigate(`/profile/${user?.id}`)} className="flex items-center gap-3 cursor-pointer group">
                <img 
                  src={user?.avatar_url || '/favicon.svg'}
                  alt="Admin Avatar" 
                  className="w-9 h-9 rounded-full object-cover border border-border-subtle group-hover:ring-2 group-hover:ring-primary transition-all"
                />
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-text-primary leading-tight">{user?.name || 'Admin'}</span>
                  <span className="text-[11px] text-text-secondary">{user?.role || ''}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="pt-24 pb-12 px-6 flex-1 bg-background max-w-7xl mx-auto w-full">
          {error && (
            <div className="mb-6 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-error">
              Failed to load database data: {error}
            </div>
          )}
          {activeTab === 'overview' && <AdminOverviewTab stats={stats} />}
          {activeTab === 'users' && <AdminUsersTab users={usersList} stats={stats} searchQuery={searchQuery} onToggleBlock={handleToggleBlock} onOpenProfile={(id) => navigate(`/profile/${id}`)} />}
          {activeTab === 'moderation' && <AdminModerationTab stats={stats} reports={reports} onReview={handleReviewReport} />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
