import React from 'react';

const AdminOverviewTab = ({ stats }) => {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Dashboard Overview</h2>
          <p className="text-text-secondary font-body-md text-body-md mt-1">Real-time performance metrics and platform health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-surface-card border border-outline-variant/30 px-4 py-2.5 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg font-label-md text-label-md font-bold hover:bg-primary/90 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Metric 1 */}
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-primary-fixed rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">group</span>
            </div>
            <span className="text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full font-bold">
              +12% <span className="material-symbols-outlined text-sm ml-1">trending_up</span>
            </span>
          </div>
          <p className="text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1">Total Users</p>
          <h3 className="font-display-lg text-display-lg text-text-primary">{stats?.total_users?.toLocaleString() || 0}</h3>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-tertiary-fixed rounded-lg">
              <span className="material-symbols-outlined text-tertiary text-[24px]">chat_bubble</span>
            </div>
            <span className="text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full font-bold">
              +8% <span className="material-symbols-outlined text-sm ml-1">trending_up</span>
            </span>
          </div>
          <p className="text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1">New Posts</p>
          <h3 className="font-display-lg text-display-lg text-text-primary">{stats?.new_today?.toLocaleString() || '15,402'}</h3>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-secondary-fixed rounded-lg">
              <span className="material-symbols-outlined text-secondary text-[24px]">flag</span>
            </div>
            <span className="text-error font-label-sm text-label-sm flex items-center bg-error/10 px-2 py-0.5 rounded-full font-bold">
              -3% <span className="material-symbols-outlined text-sm ml-1">trending_down</span>
            </span>
          </div>
          <p className="text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1">Active Reports</p>
          <h3 className="font-display-lg text-display-lg text-text-primary">{stats?.reported_accounts || 0}</h3>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 hover:-translate-y-1 transition-transform duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-success/15 rounded-lg">
              <span className="material-symbols-outlined text-success text-[24px]">payments</span>
            </div>
            <span className="text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full font-bold">
              +24% <span className="material-symbols-outlined text-sm ml-1">trending_up</span>
            </span>
          </div>
          <p className="text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1">Revenue</p>
          <h3 className="font-display-lg text-display-lg text-text-primary">$84,200</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-surface-card p-8 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-headline-md text-headline-md text-text-primary">User Growth</h3>
              <p className="text-text-secondary font-body-md text-body-md">Daily active users vs. New sign-ups</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary shadow-sm"></div>
                <span className="font-label-sm text-label-sm text-text-secondary">DAU</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-fixed-dim shadow-sm"></div>
                <span className="font-label-sm text-label-sm text-text-secondary">New Sign-ups</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-3 px-2 min-h-[300px]">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const heights1 = [40, 55, 30, 65, 45, 80, 50];
              const heights2 = [60, 75, 45, 90, 70, 95, 85];
              return (
                <div key={day} className="flex-1 flex flex-col justify-end group h-full relative">
                  <div 
                    className="absolute bottom-8 w-full bg-primary-fixed-dim/30 rounded-t h-[40%] group-hover:bg-primary-fixed-dim/50 transition-colors shadow-sm"
                    style={{ height: `${heights1[i]}%` }}
                  ></div>
                  <div 
                    className="absolute bottom-8 w-full bg-primary rounded-t h-[60%] group-hover:bg-primary/90 transition-colors shadow-sm"
                    style={{ height: `${heights2[i]}%` }}
                  ></div>
                  <p className="absolute bottom-0 w-full mt-4 text-center font-label-sm text-label-sm text-on-surface-variant font-medium">
                    {day}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md text-text-primary">Recent Activity</h3>
            <button className="text-primary font-label-md text-label-md font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* Activity 1 */}
            <div className="flex gap-4 items-start">
              <div className="relative">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container-high">
                  <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80" alt="Marcus" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-body-md text-body-md text-text-primary"><span className="font-bold">Marcus Chen</span> joined the platform.</p>
                <p className="font-label-sm text-label-sm text-text-secondary mt-0.5">2 minutes ago</p>
              </div>
            </div>
            {/* Activity 2 */}
            <div className="flex gap-4 items-start">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-error/10 flex items-center justify-center border border-error/20">
                  <span className="material-symbols-outlined text-error text-[20px]">flag</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-body-md text-body-md text-text-primary"><span className="font-bold">New Report</span> flagged on post #8291.</p>
                <p className="font-label-sm text-label-sm text-text-secondary mt-0.5">15 minutes ago</p>
              </div>
            </div>
            {/* Activity 3 */}
            <div className="flex gap-4 items-start">
              <div className="relative">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container-high">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Elena" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-body-md text-body-md text-text-primary"><span className="font-bold">Elena Rodriguez</span> verified her account.</p>
                <p className="font-label-sm text-label-sm text-text-secondary mt-0.5">42 minutes ago</p>
              </div>
            </div>
            {/* Activity 4 */}
            <div className="flex gap-4 items-start">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                  <span className="material-symbols-outlined text-success text-[20px]">payments</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-body-md text-body-md text-text-primary"><span className="font-bold">Premium Plan</span> purchased by Sarah K.</p>
                <p className="font-label-sm text-label-sm text-text-secondary mt-0.5">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewTab;
