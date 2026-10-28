export const profileUrl = (user) => `/profile/${encodeURIComponent(user?.username || 'me')}`;
