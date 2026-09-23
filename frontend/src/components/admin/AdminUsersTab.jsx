import { useState } from 'react';

const AdminUsersTab = ({ users, stats, searchQuery = '', onToggleBlock, onOpenProfile }) => {
  const [roleFilter, setRoleFilter] = useState('all');
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredUsers = (users || []).filter((user) => {
    const roleMatches = roleFilter === 'all' || user.role === roleFilter;
    const searchMatches = !normalizedSearch || [user.name, user.email, user.username, user.role, user.account_status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    return roleMatches && searchMatches;
  });

  const exportUsers = () => {
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [['ID', 'Name', 'Email', 'Role', 'Status', 'Created At'], ...filteredUsers.map((user) => [user.id, user.name, user.email, user.role, user.account_status, user.created_at])];
    const blob = new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">User Management</h1>
          <p className="font-body-md text-body-md text-text-secondary mt-1">Manage platform access, roles, and monitoring active user sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportUsers} className="flex items-center gap-2 px-4 py-2.5 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-label-md hover:bg-secondary-fixed transition-colors active:scale-95">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export CSV
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
          <span className="text-text-secondary font-label-md text-label-md">Active Accounts</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="font-display-lg text-display-lg text-text-primary">{stats?.active_users || 0}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-2">
          <span className="text-text-secondary font-label-md text-label-md">Pending Reports</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-text-primary">{stats?.pending_reports || 0}</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-2">
          <span className="text-text-secondary font-label-md text-label-md">Blocked Accounts</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-text-primary">{stats?.blocked_users || 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-border-subtle">
              <span className="material-symbols-outlined text-[18px] text-text-secondary">filter_alt</span>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="bg-transparent border-none p-0 pr-6 focus:ring-0 font-label-md text-label-md text-text-primary cursor-pointer outline-none">
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
          <span className="text-text-secondary font-label-md text-label-md">Showing {filteredUsers.length} users</span>
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
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-border-subtle text-primary focus:ring-primary" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => onOpenProfile(u.id)} className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-border-subtle flex-shrink-0">
                        <img 
                          src={u.avatar_url || '/favicon.svg'}
                          alt={u.name} 
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <div className="flex flex-col">
                        <button type="button" onClick={() => onOpenProfile(u.id)} className="text-left font-label-md text-label-md text-text-primary hover:underline">{u.name}</button>
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
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full w-fit ${u.account_status === 'blocked' ? 'bg-error/10' : 'bg-success/10'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${u.account_status === 'blocked' ? 'bg-error' : 'bg-success'}`}></div>
                      <span className={`font-label-sm text-label-sm ${u.account_status === 'blocked' ? 'text-error' : 'text-success'}`}>{u.account_status || 'active'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-body-md text-body-md text-text-secondary">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'admin' && (
                      <button onClick={() => onToggleBlock(u)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${u.account_status === 'blocked' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {u.account_status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
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
