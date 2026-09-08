import api from './axios';

export const userApi = {
  getProfile: async (id = 'me') => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await api.put('/users/profile', profileData);
    return res.data;
  },
	updateSettings: async (settings) => (await api.put('/users/settings', settings)).data,
	deleteAccount: async (password) => (await api.post('/users/account/delete', { password })).data,
	blockUser: async (id) => (await api.post(`/users/${id}/block`)).data,
	unblockUser: async (id) => (await api.delete(`/users/${id}/block`)).data,
	getBlockedUsers: async () => (await api.get('/users/blocked')).data,
	follow: async (id) => (await api.post(`/users/${id}/follow`)).data,
	unfollow: async (id) => (await api.delete(`/users/${id}/follow`)).data,
	getFollowers: async (id, q = '') => (await api.get(`/users/${id}/followers?q=${encodeURIComponent(q)}`)).data,
	getFollowing: async (id, q = '') => (await api.get(`/users/${id}/following?q=${encodeURIComponent(q)}`)).data,
	getSavedPosts: async () => (await api.get('/users/saved-posts')).data,
  getPortfolios: async (userId) => {
    const res = await api.get(`/users/${userId}/portfolios`);
    return res.data;
  },
  createPortfolio: async (portfolioData) => {
    const res = await api.post('/users/profile/portfolios', portfolioData);
    return res.data;
  },
  deletePortfolio: async (id) => {
    const res = await api.delete(`/users/profile/portfolios/${id}`);
    return res.data;
  },
};
