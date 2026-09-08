import api from './axios';

export const authApi = {
	login: async (identifier, password) => {
    const formData = new FormData();
		formData.append('identifier', identifier);
    formData.append('password', password);
    const res = await api.post('/auth/login', formData);
    return res.data;
  },
	register: async (name, email, password, extra = {}) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
		formData.append('password', password);
		Object.entries(extra).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') formData.append(key, value);
		});
    const res = await api.post('/auth/register', formData);
    return res.data;
  },
	logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
	},
	forgotPassword: async (target, channel = 'email') => (await api.post('/auth/password/forgot', { target, channel })).data,
	resetPassword: async (target, code, newPassword) => (await api.post('/auth/password/reset', { target, code, new_password: newPassword })).data,
	changePassword: async (currentPassword, newPassword) => (await api.put('/auth/password', { current_password: currentPassword, new_password: newPassword })).data,
	requestVerification: async (channel) => (await api.post('/auth/verification/request', { channel })).data,
	confirmVerification: async (purpose, code) => (await api.post('/auth/verification/confirm', { purpose, code })).data,
	reactivate: async (identifier, password) => (await api.post('/auth/account/reactivate', { identifier, password })).data,
	oauthStartUrl: (provider) => `${api.defaults.baseURL}/auth/oauth/${provider}/start`,
};
