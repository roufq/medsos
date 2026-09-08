import api from './axios';

export const socialApi = {
	search: async (query) => (await api.get(`/search?q=${encodeURIComponent(query)}`)).data,
	notifications: async () => (await api.get('/notifications')).data,
	readNotification: async (id) => (await api.put(`/notifications/${id}/read`)).data,
};
