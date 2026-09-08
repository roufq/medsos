import React from 'react';

const AdminUsersTab = ({ users, stats }) => {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">User Management</h1>
          <p className="font-body-md text-body-md text-text-secondary mt-1">Manage platform access, roles, and monitoring active user sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-label-md hover:bg-secondary-fixed transition-colors active:scale-95">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Add New User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-2">
          <span className="text-text-secondary font-label-md text-label-md">Total Users</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-text-primary">{stats?.total_users?.toLocaleString() || 0}</span>
            <span className="text-success text-[12px] font-bold">+{stats?.new_today || 0} new</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-2">
          <span className="text-text-secondary font-label-md text-label-md">Active Now</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="font-display-lg text-display-lg text-text-primary">{stats?.active_now || 0}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-2">
          <span className="text-text-secondary font-label-md text-label-md">Reported Accounts</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-text-primary">{stats?.reported_accounts || 0}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-2">
          <span className="text-text-secondary font-label-md text-label-md">Avg. Activity</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-text-primary">84%</span>
            <span className="text-error text-[12px] font-bold">-2%</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-border-subtle">
              <span className="material-symbols-outlined text-[18px] text-text-secondary">filter_alt</span>
              <select className="bg-transparent border-none p-0 pr-6 focus:ring-0 font-label-md text-label-md text-text-primary cursor-pointer outline-none">
                <option>All Roles</option>
                <option>Admin</option>
                <option>User</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-border-subtle">
              <span className="material-symbols-outlined text-[18px] text-text-secondary">event</span>
              <span className="font-label-md text-label-md text-text-primary">Last 30 Days</span>
            </div>
          </div>
          <span className="text-text-secondary font-label-md text-label-md">Showing {users?.length || 0} users</span>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-subtle">
                <th className="px-6 py-4 w-12">
                  <input type="checkbox" className="rounded border-border-subtle text-primary focus:ring-primary" />
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {users?.map(u => (
                <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-border-subtle text-primary focus:ring-primary" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-border-subtle flex-shrink-0">
                        <img 
                          src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                          alt={u.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-text-primary">{u.name}</span>
                        <span className="text-[12px] text-text-secondary">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-text-primary">
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 px-2 py-1 bg-success/10 rounded-full w-fit">
                      <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                      <span className="font-label-sm text-label-sm text-success">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-body-md text-body-md text-text-secondary">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-text-secondary hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-text-secondary font-body-md">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersTab;
