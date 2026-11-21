import api from './axios';
import { readAdminPage } from './adminPage';

export const adminApi = {
  consoleUsers: async (params={}) => (await api.get('/admin/console/users',{params})).data,
  consoleUser: async id => (await api.get(`/admin/console/users/${id}`)).data,
  createConsoleUser: async data => (await api.post('/admin/console/users',data)).data,
  saveConsoleUser: async (id,data) => (await api.put(`/admin/console/users/${id}`,data)).data,
  editConsolePost: async (id,data) => (await api.put(`/admin/posts/${id}`,data)).data,
  purgePost: async (id,reason,confirm) => (await api.delete(`/admin/posts/${id}/purge`,{data:{reason,confirm}})).data,
  analytics: async days => (await api.get('/admin/analytics',{params:{days}})).data,
  ads: async () => (await api.get('/admin/ads')).data,
  saveAd: async data => data.id?(await api.put(`/admin/ads/${data.id}`,data)).data:(await api.post('/admin/ads',data)).data,
  deleteAd: async id => (await api.delete(`/admin/ads/${id}`)).data,
  consoleSettings: async () => (await api.get('/admin/console/settings')).data,
  saveConsoleSettings: async data => (await api.put('/admin/console/settings',data)).data,
  revokeSession: async id => (await api.delete(`/admin/sessions/${id}`)).data,
  getSettings: async () => (await api.get('/platform/settings')).data,
  updateSettings: async (enabled) => (await api.put('/admin/settings', { upload_limits_enabled: enabled })).data,
  getPosts: async (q = '', before_id = undefined, status = 'active') => (await api.get('/admin/posts', { params: { q, before_id, status } })).data,
  deletePost: async (id, reason) => (await api.delete(`/admin/posts/${id}`, { data: { reason } })).data,
  restorePost: async (id, reason) => (await api.post(`/admin/posts/${id}/restore`, { reason })).data,
  sponsorPost: async (id, enabled) => (await api.put(`/admin/posts/${id}/sponsor`, { is_sponsored: enabled })).data,
  verifyUser: async (id, verified) => (await api.put(`/admin/users/${id}/verification`, { verified })).data,
  deleteUser: async (id) => (await api.delete(`/admin/users/${id}`)).data,
  getActivity: async (params = {}) => readAdminPage((await api.get('/admin/activity', { params })).data),
  getSessions: async (params = {}) => readAdminPage((await api.get('/admin/sessions', { params })).data),
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
	},
	getReports: async (cursors={}) => {
    const [posts, chats] = await Promise.all([api.get('/admin/reports',{params:{before_id:cursors.post}}), api.get('/admin/conversation-reports',{params:{before_id:cursors.chat}})]);
    return [...posts.data, ...(chats.data || []).map((report) => ({ ...report, id: `chat-${report.id}`, report_type: 'chat' }))]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
	reviewReport: async (id, status, deletePost = false) => (await api.put(String(id).startsWith('chat-') ? `/admin/conversation-reports/${String(id).slice(5)}` : `/admin/reports/${id}`, { status, delete_post: deletePost })).data,
	blockUser: async (id) => (await api.post(`/admin/users/${id}/block`)).data,
	unblockUser: async (id) => (await api.delete(`/admin/users/${id}/block`)).data,
};
