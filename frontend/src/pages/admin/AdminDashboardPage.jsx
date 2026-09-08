import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';

import AdminOverviewTab from '../../components/admin/AdminOverviewTab';
import AdminUsersTab from '../../components/admin/AdminUsersTab';
import AdminModerationTab from '../../components/admin/AdminModerationTab';
import AdminSettingsTab from '../../components/admin/AdminSettingsTab';

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers()
      ]);
      setStats(statsData);
      setUsersList(usersData);
    } catch (e) {
      console.error('Failed to load admin data', e);
      alert('Error loading admin data: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
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

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-3 py-2 font-label-md text-label-md transition-all scale-95 active:scale-90 rounded-lg w-full text-left ${
              activeTab === 'settings' 
                ? 'bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-on-secondary-fixed font-bold' 
                : 'text-text-secondary dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
        </nav>

        <button className="mt-4 mb-8 bg-primary-container text-on-primary font-label-md text-label-md py-3 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all w-full">
          Create Post
        </button>

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
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full font-body-md text-body-md focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-text-secondary hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-text-secondary hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined">mail</span>
              </button>
              <button className="p-2 text-text-secondary hover:bg-surface-container-low rounded-full transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="h-8 w-px bg-border-subtle mx-2"></div>
              <div className="flex items-center gap-3 cursor-pointer group">
                <img 
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                  alt="Admin Avatar" 
                  className="w-9 h-9 rounded-full object-cover border border-border-subtle group-hover:ring-2 group-hover:ring-primary transition-all"
                />
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-text-primary leading-tight">{user?.name || 'Admin'}</span>
                  <span className="text-[11px] text-text-secondary">Super Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="pt-24 pb-12 px-6 flex-1 bg-background max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && <AdminOverviewTab stats={stats} />}
          {activeTab === 'users' && <AdminUsersTab users={usersList} stats={stats} />}
          {activeTab === 'moderation' && <AdminModerationTab stats={stats} />}
          {activeTab === 'settings' && <AdminSettingsTab />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
