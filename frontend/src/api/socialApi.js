import api from './axios';

export const socialApi = {
	search: async (query, params = {}) => (await api.get('/search', { params: { q: query, ...params } })).data,
	notifications: async () => (await api.get('/notifications')).data,
	readNotification: async (id) => (await api.put(`/notifications/${id}/read`)).data,
};
