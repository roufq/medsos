const AdminOverviewTab = ({ stats }) => {
  const growth = stats?.growth || [];
  const recentUsers = stats?.recent_users || [];
  const maxActivity = Math.max(1, ...growth.flatMap((item) => [item.users || 0, item.posts || 0]));

  const metrics = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: 'group', tone: 'bg-primary-fixed text-primary' },
    { label: 'Active Accounts', value: stats?.active_users || 0, icon: 'verified_user', tone: 'bg-success/15 text-success' },
    { label: 'Total Posts', value: stats?.total_posts || 0, icon: 'chat_bubble', tone: 'bg-tertiary-fixed text-tertiary' },
    { label: 'Pending Reports', value: stats?.pending_reports || 0, icon: 'flag', tone: 'bg-error/10 text-error' },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Dashboard Overview</h2>
        <p className="text-text-secondary font-body-md text-body-md mt-1">Metrics below are read directly from the application database.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
            <div className={`p-2.5 rounded-lg w-fit mb-4 ${metric.tone}`}>
              <span className="material-symbols-outlined text-[24px]">{metric.icon}</span>
            </div>
            <p className="text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1">{metric.label}</p>
            <h3 className="font-display-lg text-display-lg text-text-primary">{metric.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-surface-card p-8 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-headline-md text-headline-md text-text-primary">Activity — Last 7 Days</h3>
              <p className="text-text-secondary font-body-md text-body-md">New users and posts grouped by database date</p>
            </div>
            <div className="flex gap-6 text-xs text-text-secondary">
              <span className="flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-primary" />Posts</span>
              <span className="flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-primary-fixed-dim" />Users</span>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-3 px-2 min-h-[300px]">
            {growth.map((item) => (
              <div key={item.date} className="flex-1 flex flex-col justify-end h-full relative" title={`${item.date}: ${item.users} users, ${item.posts} posts`}>
                <div className="absolute bottom-8 left-0 w-1/2 bg-primary-fixed-dim rounded-t" style={{ height: `${Math.max(2, (item.users / maxActivity) * 85)}%` }} />
                <div className="absolute bottom-8 right-0 w-1/2 bg-primary rounded-t" style={{ height: `${Math.max(2, (item.posts / maxActivity) * 85)}%` }} />
                <p className="absolute bottom-0 w-full text-center font-label-sm text-label-sm text-on-surface-variant font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col h-[480px]">
          <h3 className="font-headline-md text-headline-md text-text-primary mb-6">Newest Users</h3>
          <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentUsers.map((recentUser) => (
              <div key={recentUser.id} className="flex gap-4 items-center">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container-high flex items-center justify-center font-bold text-primary">
                  {recentUser.avatar_url ? <img src={recentUser.avatar_url} alt={recentUser.name} className="w-full h-full object-cover" /> : recentUser.name?.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-body-md text-body-md text-text-primary font-bold truncate">{recentUser.name}</p>
                  <p className="font-label-sm text-label-sm text-text-secondary truncate">{recentUser.email}</p>
                  <p className="text-[11px] text-text-secondary">{new Date(recentUser.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && <p className="text-sm text-text-secondary">No users in the database.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewTab;
