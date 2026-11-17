export function uniquePosts(posts = []) {
  return [...new Map(posts.map(post => [post.public_hash || post.id, post])).values()];
}

export function postKind(post) {
  if (post.post_type === 'shop') return 'shop';
  if (post.media?.some(media => media.media_type === 'video')) return 'video';
  if (post.media?.some(media => media.media_type === 'image') || post.link?.image_url) return 'image';
  return 'post';
}

export function filterResults(posts, { kind = 'all', period = 'all', location = '', sort = 'relevant' } = {}, now = new Date()) {
  const since = new Date(now);
  if (period === 'today') since.setHours(0, 0, 0, 0);
  else if (period === 'week') since.setDate(since.getDate() - 7);
  else if (period === 'month') since.setMonth(since.getMonth() - 1);
  const results = posts.filter(post =>
    (kind === 'all' || postKind(post) === kind) &&
    (period === 'all' || new Date(post.created_at) >= since) &&
    (!location || post.location === location));
  if (sort === 'latest') results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (sort === 'popular') results.sort((a, b) => (b.likes_count || 0) + (b.comments_count || 0) + (b.shares_count || 0) - (a.likes_count || 0) - (a.comments_count || 0) - (a.shares_count || 0));
  return results;
}
