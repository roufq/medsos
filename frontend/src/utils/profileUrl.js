const reserved = new Set(['home','me','admin','api','web','frontend','uploads','login','register','forgot-password','thanks','profile','settings','pricing','post','posts','u','p','embed','videos','shorts','search','explore','shop','saved','network','messages','notifications','analytics','jobs']);
export const profileUrl = (user) => user?.username
  ? `${reserved.has(user.username.toLowerCase()) ? '/profile/' : '/'}${encodeURIComponent(user.username)}`
  : `/profile/${encodeURIComponent(user?.public_hash || 'me')}`;
