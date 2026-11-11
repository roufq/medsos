import api from './axios';

export const messageApi = {
  getSettings: async (userId) => (await api.get(`/messages/users/${userId}/settings`)).data,
  updateSettings: async (userId, settings) => (await api.put(`/messages/users/${userId}/settings`, settings)).data,
  deleteHistory: async (userId) => (await api.delete(`/messages/users/${userId}/history`)).data,
  report: async (userId, reason, details) => (await api.post(`/messages/users/${userId}/report`, { reason, details })).data,
  getConversations: async () => {
    const res = await api.get('/messages/conversations');
    return res.data;
  },
  getMessages: async (conversationId, beforeId = null) => {
    let url = `/messages?conversation_id=${encodeURIComponent(conversationId)}`;
    if (beforeId) url += `&before_id=${beforeId}`;
    const res = await api.get(url);
    return res.data;
  },
  sendMessage: async (receiverId, content, extra = {}) => {
    const res = await api.post('/messages', {
      receiver_id: receiverId,
      content: content || '',
      ...extra,
    });
    return res.data;
  },
  uploadAttachment: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  createIntent: async (params = {}) => {
    const res = await api.post('/messages/intent', params);
    return res.data;
  },
  resolveIntent: async (token) => {
    const res = await api.post('/messages/intent/resolve', { token });
    return res.data;
  },
  sendCallSignal: async (payload) => {
    const res = await api.post('/messages/call/signal', payload);
    return res.data;
  },
  pollCallSignals: async () => {
    const res = await api.get('/messages/call/poll');
    return res.data;
  },
};
