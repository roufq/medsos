import api from './axios';

export const postApi = {
  getFeed: async (limit = 10, offset = 0, userId = null, beforeId = null) => {
    let url = `/posts?limit=${limit}&offset=${offset}`;
    if (userId) {
      url += `&user_id=${userId}`;
    }
    if (beforeId) {
      url += `&before_id=${beforeId}`;
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
	updatePost: async (id, changes) => (await api.put(`/posts/${id}`, changes)).data,
  toggleLike: async (id) => {
    const res = await api.post(`/posts/${id}/like`);
    return res.data;
  },
  addComment: async (id, content) => {
    const res = await api.post(`/posts/${id}/comment`, { content });
    return res.data;
  },
	getComments: async (id) => (await api.get(`/posts/${id}/comments`)).data,
	replyComment: async (id, parentId, content) => (await api.post(`/posts/${id}/comments/reply`, { parent_id: parentId, content })).data,
	editComment: async (id, content) => (await api.put(`/comments/${id}`, { content })).data,
	deleteComment: async (id) => (await api.delete(`/comments/${id}`)).data,
	toggleSave: async (id) => (await api.post(`/posts/${id}/save`)).data,
	repost: async (id, commentary = '') => (await api.post(`/posts/${id}/repost`, { commentary })).data,
	share: async (id, channel = 'copy') => (await api.post(`/posts/${id}/share`, { channel })).data,
	report: async (id, reason, details = '') => (await api.post(`/posts/${id}/report`, { reason, details })).data,
	recordView: async (id) => (await api.post(`/posts/${id}/view`)).data,
	getEmbedCode: async (id) => (await api.get(`/posts/${id}/embed-code`)).data,
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
