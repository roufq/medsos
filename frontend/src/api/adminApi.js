import api from './axios';

export const adminApi = {
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
