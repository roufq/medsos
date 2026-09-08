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
