import api from './axios';

export const networkApi = {
  getConnections: async () => {
    const res = await api.get('/network/connections');
    return res.data;
  },
  getPendingRequests: async () => {
    const res = await api.get('/network/requests');
    return res.data;
  },
  getSuggestions: async () => {
    const res = await api.get('/network/suggestions');
    return res.data;
  },
  sendRequest: async (userId) => {
    const res = await api.post('/network/request', { user_id: userId });
    return res.data;
  },
  acceptRequest: async (userId) => {
    const res = await api.post('/network/accept', { user_id: userId });
    return res.data;
  },
  declineRequest: async (userId) => {
    const res = await api.post('/network/decline', { user_id: userId });
    return res.data;
  }
};
