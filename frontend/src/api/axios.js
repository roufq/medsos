import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // Access/refresh tokens live in httpOnly cookies set by the backend, not
  // in localStorage - the browser attaches them automatically, but
  // withCredentials is required for that to happen on cross-origin requests.
  withCredentials: true,
});

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Cookie-based auth needs a CSRF guard the old Bearer-header flow didn't:
// echo the non-httpOnly csrf_token cookie back as a header so the backend
// can confirm the request actually came from our own frontend JS (see
// pkg/csrf on the backend for why a cross-site page can't forge this).
api.interceptors.request.use((config) => {
  const csrfToken = readCookie('csrf_token');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Intercept 401 responses to rotate the access token via the refresh cookie
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
