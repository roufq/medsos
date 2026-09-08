import api from './axios';

export const postApi = {
  getFeed: async (limit = 10, offset = 0, userId = null) => {
    let url = `/posts?limit=${limit}&offset=${offset}`;
    if (userId) {
      url += `&user_id=${userId}`;
    }
    const res = await api.get(url);
    return res.data;
  },
  createPost: async (postData) => {
    const isFormData = postData instanceof FormData;
    const res = await api.post('/posts', postData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return res.data;
  },
  deletePost: async (id) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },
  toggleLike: async (id) => {
    const res = await api.post(`/posts/${id}/like`);
    return res.data;
  },
  addComment: async (id, content) => {
    const res = await api.post(`/posts/${id}/comment`, { content });
    return res.data;
  },
  getLinkPreview: async (url) => {
    const res = await api.get(`/posts/link-preview?url=${encodeURIComponent(url)}`);
    return res.data;
  },
  uploadMedia: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
