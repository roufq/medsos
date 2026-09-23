import { useState } from 'react';

const AdminModerationTab = ({ stats, reports = [], onReview }) => {
  const [busyId, setBusyId] = useState(null);

  const review = async (report, status, deletePost = false) => {
    setBusyId(report.id);
    try {
      await onReview(report.id, status, deletePost);
    } catch (error) {
      window.alert(error.response?.data?.error || error.message);
    } finally {
      setBusyId(null);
    }
  };

  const metrics = [
    ['Pending Review', stats?.pending_reports || 0, 'pending_actions'],
    ['Flagged Today', stats?.reports_today || 0, 'flag'],
    ['Resolved', stats?.resolved_reports || 0, 'check_circle'],
    ['Blocked Accounts', stats?.blocked_users || 0, 'block'],
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Content Moderation</h2>
        <p className="text-text-secondary font-body-md text-body-md mt-1">Reports and status values are loaded from the database.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map(([label, value, icon]) => (
          <div key={label} className="bg-surface-card p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
            <span className="material-symbols-outlined text-primary text-[24px] mb-4">{icon}</span>
            <p className="text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1">{label}</p>
            <h3 className="font-display-lg text-display-lg text-text-primary">{Number(value).toLocaleString()}</h3>
          </div>
        ))}
      </div>

      <div className="bg-surface-card rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/30">
          <h3 className="font-headline-md text-headline-md text-text-primary">Moderation Queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 text-text-secondary uppercase tracking-wider">Content</th>
                <th className="px-8 py-4 text-text-secondary uppercase tracking-wider">Author</th>
                <th className="px-8 py-4 text-text-secondary uppercase tracking-wider">Reason</th>
                <th className="px-8 py-4 text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-5 max-w-sm">
                    <p className="font-semibold text-on-surface line-clamp-1">{report.post_title || report.post_content || `Post #${report.post_id}`}</p>
                    {report.details && <p className="text-xs text-text-secondary line-clamp-1 mt-1">{report.details}</p>}
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-semibold text-on-surface">{report.author_name || 'Deleted user'}</span>
                    <p className="text-xs text-text-secondary">Reported by {report.reporter_name || `user #${report.reporter_id}`}</p>
                  </td>
                  <td className="px-8 py-5 text-text-secondary">{report.reason}</td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-[10px] font-bold uppercase">{report.status}</span>
                  </td>
                  <td className="px-8 py-5">
                    {report.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button disabled={busyId === report.id} onClick={() => review(report, 'dismissed')} className="px-3 py-1.5 text-success bg-success/10 rounded-lg text-xs font-bold disabled:opacity-50">Dismiss</button>
                        <button disabled={busyId === report.id} onClick={() => review(report, 'resolved', true)} className="px-3 py-1.5 text-error bg-error/10 rounded-lg text-xs font-bold disabled:opacity-50">Delete post</button>
                      </div>
                    ) : <span className="text-xs text-text-secondary">Reviewed</span>}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan="5" className="px-8 py-10 text-center text-text-secondary">No reports in the database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminModerationTab;
