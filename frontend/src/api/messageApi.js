import api from './axios';

export const messageApi = {
  getConversations: async () => {
    const res = await api.get('/messages/conversations');
    return res.data;
  },
  getMessages: async (conversationId, beforeId = null) => {
    let url = `/messages?conversation_id=${conversationId}`;
    if (beforeId) url += `&before_id=${beforeId}`;
    const res = await api.get(url);
    return res.data;
  },
  sendMessage: async (receiverId, content) => {
    const res = await api.post('/messages', { receiver_id: receiverId, content });
    return res.data;
  }
};
