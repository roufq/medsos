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

// Pages reachable without a session; never bounce these back to /login.
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/thanks'];
const onPublicPage = () => PUBLIC_PATHS.some((path) => window.location.pathname.startsWith(path));

function goToLogin(reason) {
  if (onPublicPage()) return;
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  window.location.href = `/login${query}`;
}

// Refresh tokens are single-use (rotated on every refresh), so concurrent
// 401s must share one refresh request instead of racing with the same token.
let refreshPromise = null;
function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// Intercept 401 responses to rotate the access token via the refresh cookie
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const code = error.response?.data?.code;
    if (status === 403 && code === 'account_inactive') {
      goToLogin('account_inactive');
      return Promise.reject(error);
    }
    const isAuthCall = /\/auth\/(refresh|login|register|logout)/.test(originalRequest.url || '');
    if (status === 401 && !originalRequest._retry && !isAuthCall) {
      originalRequest._retry = true;
      try {
        await refreshSession();
        return api(originalRequest);
      } catch (refreshError) {
        goToLogin(code === 'session_revoked' ? 'session_revoked' : '');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
