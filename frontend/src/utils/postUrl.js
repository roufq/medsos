export const postUrl = (post) => `${post?.post_type === 'video' ? '/videos/' : '/post/'}${encodeURIComponent(post?.public_hash || post?.id)}`;
