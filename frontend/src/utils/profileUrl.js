export const profileUrl = (user) => `/profile/${encodeURIComponent(user?.username || user?.id || 'me')}`;
