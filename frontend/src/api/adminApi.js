import api from './axios';

export const adminApi = {
  getSettings: async () => (await api.get('/platform/settings')).data,
  updateSettings: async (enabled) => (await api.put('/admin/settings', { upload_limits_enabled: enabled })).data,
  getPosts: async (q = '', before_id = undefined) => (await api.get('/admin/posts', { params: { q, before_id } })).data,
  deletePost: async (id) => (await api.delete(`/admin/posts/${id}`)).data,
  sponsorPost: async (id, enabled) => (await api.put(`/admin/posts/${id}/sponsor`, { is_sponsored: enabled })).data,
  verifyUser: async (id, verified) => (await api.put(`/admin/users/${id}/verification`, { verified })).data,
  deleteUser: async (id) => (await api.delete(`/admin/users/${id}`)).data,
  getActivity: async () => (await api.get('/admin/activity')).data,
  getSessions: async () => (await api.get('/admin/sessions')).data,
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
	},
	getReports: async () => {
    const [posts, chats] = await Promise.all([api.get('/admin/reports'), api.get('/admin/conversation-reports')]);
    return [...posts.data, ...(chats.data || []).map((report) => ({ ...report, id: `chat-${report.id}`, report_type: 'chat' }))]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
	reviewReport: async (id, status, deletePost = false) => (await api.put(String(id).startsWith('chat-') ? `/admin/conversation-reports/${String(id).slice(5)}` : `/admin/reports/${id}`, { status, delete_post: deletePost })).data,
	blockUser: async (id) => (await api.post(`/admin/users/${id}/block`)).data,
	unblockUser: async (id) => (await api.delete(`/admin/users/${id}/block`)).data,
};
