export const postUrl = (post) => `${post?.post_type === 'video' ? '/videos/' : '/post/'}${encodeURIComponent(post?.public_hash || post?.id)}`;

export const watchUrl = (post) => `/videos/${post.public_hash || post.id}`;
