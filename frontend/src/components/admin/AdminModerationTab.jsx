import React from 'react';

const AdminModerationTab = ({ stats }) => {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Content Moderation</h2>
          <p className="text-text-secondary font-body-md text-body-md mt-1">Review and manage flagged content across the platform.</p>
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
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 metric-card-hover transition-all shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-tertiary-fixed rounded-lg">
              <span className="material-symbols-outlined text-tertiary text-[24px]">pending_actions</span>
            </div>
            <span className="text-error font-label-sm text-label-sm flex items-center bg-error/10 px-2 py-0.5 rounded-full font-bold">
              +12
            </span>
          </div>
          <p className="text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1">Pending Review</p>
          <h3 className="font-display-lg text-display-lg text-text-primary">142</h3>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 metric-card-hover transition-all shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-secondary-fixed rounded-lg">
              <span className="material-symbols-outlined text-secondary text-[24px]">flag</span>
            </div>
            <span className="text-error font-label-sm text-label-sm flex items-center bg-error/10 px-2 py-0.5 rounded-full font-bold">
              +5
            </span>
          </div>
          <p className="text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1">Flagged Today</p>
          <h3 className="font-display-lg text-display-lg text-text-primary">28</h3>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 metric-card-hover transition-all shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-success/15 rounded-lg">
              <span className="material-symbols-outlined text-success text-[24px]">check_circle</span>
            </div>
            <span className="text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full font-bold">
              98%
            </span>
          </div>
          <p className="text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1">Resolved</p>
          <h3 className="font-display-lg text-display-lg text-text-primary">1,204</h3>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 metric-card-hover transition-all shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-primary-fixed rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">block</span>
            </div>
            <span className="text-on-surface-variant font-label-sm text-label-sm flex items-center bg-on-surface-variant/10 px-2 py-0.5 rounded-full font-bold">
              Stable
            </span>
          </div>
          <p className="text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1">Auto-Blocked</p>
          <h3 className="font-display-lg text-display-lg text-text-primary">56</h3>
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-text-primary">Moderation Queue</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg hover:bg-primary/90 transition-all">
              Bulk Actions
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider">Content</th>
                <th className="px-8 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider">Author</th>
                <th className="px-8 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider">Report Reason</th>
                <th className="px-8 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-body-md text-body-md text-on-surface line-clamp-1">"This platform is terrible and everyone should leave..."</p>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-secondary text-[10px]">TR</div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">Tom Riddle</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-body-md text-text-secondary">Harassment</span>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 rounded-lg bg-tertiary-fixed-dim/30 text-tertiary text-[10px] font-bold uppercase tracking-tight">Under Review</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex gap-2">
                    <button className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors material-symbols-outlined">check</button>
                    <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors material-symbols-outlined">block</button>
                    <button className="p-2 text-text-secondary hover:bg-surface-container-high rounded-lg transition-colors material-symbols-outlined">delete</button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-body-md text-body-md text-on-surface line-clamp-1">"Check out this amazing crypto opportunity! Link in bio..."</p>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-[10px]">SB</div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">SpamBot99</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-body-md text-text-secondary">Spam</span>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 rounded-lg bg-on-surface-variant/10 text-on-surface-variant text-[10px] font-bold uppercase tracking-tight">Pending</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex gap-2">
                    <button className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors material-symbols-outlined">check</button>
                    <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors material-symbols-outlined">block</button>
                    <button className="p-2 text-text-secondary hover:bg-surface-container-high rounded-lg transition-colors material-symbols-outlined">delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminModerationTab;
