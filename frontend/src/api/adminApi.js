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
	getReports: async () => (await api.get('/admin/reports')).data,
	reviewReport: async (id, status, deletePost = false) => (await api.put(`/admin/reports/${id}`, { status, delete_post: deletePost })).data,
	blockUser: async (id) => (await api.post(`/admin/users/${id}/block`)).data,
	unblockUser: async (id) => (await api.delete(`/admin/users/${id}/block`)).data,
};
