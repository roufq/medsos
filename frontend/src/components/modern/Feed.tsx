import { useState } from 'react';
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  FileText, 
  MoreHorizontal, 
  Send,
  Trash2,
  X,
  Globe
} from 'lucide-react';
import { Post, User } from '../types';
import { postApi } from '../../api/postApi';

interface FeedProps {
  posts: Post[];
  currentUser: User;
  searchQuery: string;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onRequestCreatePost: () => void;
  onNavigate: (tab: 'home' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics') => void;
  onOpenProfile: (userId: string | number) => void;
  onDeletePost?: (postId: string) => void;
}

export default function Feed({
  posts,
  currentUser,
  searchQuery,
  onLikePost,
  onAddComment,
  onRequestCreatePost,
  onNavigate,
  onOpenProfile,
  onDeletePost
}: FeedProps) {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [loadedComments, setLoadedComments] = useState<Record<string, any[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [commentsHasMore, setCommentsHasMore] = useState<Record<string, boolean>>({});
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const mapComment = (comment: any) => ({ id: comment.id, authorName: comment.user?.name || 'Unknown', authorAvatar: comment.user?.avatar_url || '/favicon.svg', content: comment.content, timeAgo: new Date(comment.created_at).toLocaleString() });

  const refreshComments = async (postId: string) => {
    setCommentsLoading((state) => ({ ...state, [postId]: true }));
    try {
      const { comments, has_more } = await postApi.getComments(postId);
      setLoadedComments((state) => ({ ...state, [postId]: (comments || []).map(mapComment) }));
      setCommentsHasMore((state) => ({ ...state, [postId]: Boolean(has_more) }));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to load comments');
    } finally {
      setCommentsLoading((state) => ({ ...state, [postId]: false }));
    }
  };

  const loadEarlierComments = async (postId: string) => {
    const oldest = loadedComments[postId]?.[0];
    if (!oldest) return;
    setCommentsLoading((state) => ({ ...state, [postId]: true }));
    try {
      const { comments, has_more } = await postApi.getComments(postId, oldest.id);
      setLoadedComments((state) => ({ ...state, [postId]: [...(comments || []).map(mapComment), ...(state[postId] || [])] }));
      setCommentsHasMore((state) => ({ ...state, [postId]: Boolean(has_more) }));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to load comments');
    } finally {
      setCommentsLoading((state) => ({ ...state, [postId]: false }));
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    try {
      await onAddComment(postId, text);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      await refreshComments(postId);
    } catch (error) {
      // The page handler displays the request error and keeps the text available.
    }
  };

  const toggleComments = async (postId: string) => {
    const willOpen = !expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: willOpen }));
    if (willOpen && !loadedComments[postId]) await refreshComments(postId);
  };

  const handleShare = async (postId: string) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    try {
      await postApi.share(postId, 'copy');
      await navigator.clipboard.writeText(postUrl);
      alert('Link copied to clipboard!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to share post.');
    }
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => {
    const term = searchQuery.toLowerCase();
    return (
      (post.content || '').toLowerCase().includes(term) ||
      (post.author.name || '').toLowerCase().includes(term) ||
      (post.author.title || '').toLowerCase().includes(term) ||
      Boolean(post.linkPreview?.title?.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex-1 max-w-[680px] flex flex-col gap-6">
      {/* Create Post Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle/30 flex flex-col gap-4">
        <div className="flex gap-4">
          <div 
            onClick={() => onNavigate('profile')}
            className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            type="button"
            onClick={onRequestCreatePost}
            className="flex-grow bg-surface-container-low hover:bg-surface-container text-left px-6 py-3 rounded-full text-text-secondary text-sm font-medium transition-all border border-transparent hover:border-outline-variant cursor-pointer select-none"
          >
            Share a professional insight...
          </button>
        </div>

        <div className="flex justify-between items-center px-2 pt-2 border-t border-border-subtle/20">
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onRequestCreatePost}
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-semibold cursor-pointer"
            >
              <ImageIcon className="w-5 h-5 text-primary" />
              <span>Media</span>
            </button>
            <button 
              type="button"
              onClick={onRequestCreatePost}
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-semibold cursor-pointer"
            >
              <CalendarIcon className="w-5 h-5 text-tertiary" />
              <span>Event</span>
            </button>
            <button 
              type="button"
              onClick={onRequestCreatePost}
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-semibold cursor-pointer"
            >
              <FileText className="w-5 h-5 text-success" />
              <span>Article</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts Feed list */}
      <div className="flex flex-col gap-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-border-subtle/30 text-center shadow-sm">
            <p className="text-text-secondary font-medium mb-1">No matching insights found.</p>
            <p className="text-xs text-outline">Try another keyword or clear the search field.</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isCommentsOpen = expandedComments[post.id] || false;
            return (
              <article 
                key={post.id} 
                className="bg-white rounded-2xl shadow-sm border border-border-subtle/20 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  {/* Post header info */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div 
                        onClick={() => {
                          onOpenProfile(post.author.id);
                        }}
                        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer flex-shrink-0"
                      >
                        <img 
                          src={post.author.avatar} 
                          alt={post.author.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div 
                          onClick={() => {
                            onOpenProfile(post.author.id);
                          }}
                          className="hover:underline cursor-pointer font-bold text-text-primary text-sm"
                        >
                          {post.author.name}
                        </div>
                        <div className="flex items-center text-xs text-text-secondary gap-1 mt-0.5">
                          {[post.author.title, post.author.company].filter(Boolean).length > 0 && <span>{[post.author.title, post.author.company].filter(Boolean).join(' · ')}</span>}
                          <span>•</span>
                          <span>{post.timeAgo}</span>
                          <span>•</span>
                          <Globe className="w-3 h-3 opacity-70" title="Public" />
                        </div>
                      </div>
                    </div>
                    {post.author.id === currentUser.id && onDeletePost ? (
                      <button 
                        onClick={() => onDeletePost(post.id)}
                        className="text-text-secondary hover:bg-error/10 hover:text-error p-1.5 rounded-full cursor-pointer transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="text-text-secondary hover:bg-surface-container p-1 rounded-full cursor-pointer transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Post Title */}
                  {post.title && (
                    <h3 className="text-lg font-bold text-text-primary mb-2 leading-snug">
                      {post.title}
                    </h3>
                  )}

                  {/* Post Content text */}
                  <p className="text-sm font-normal text-text-primary leading-relaxed mb-4 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Standard Image attach if exists */}
                  {post.image && (
                    <div 
                      className="rounded-xl overflow-hidden border border-border-subtle/30 mb-4 bg-surface-container-low max-h-[360px] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setFullscreenImage(post.image)}
                    >
                      <img 
                        src={post.image}
                        alt="Post illustration" 
                        className="w-full h-full object-cover max-h-[360px]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Link Preview — URL line above a preview card, like FB/WhatsApp rich link previews */}
                  {post.linkPreview && (() => {
                    const lp = post.linkPreview;
                    let hostname = lp.url;
                    try { hostname = new URL(lp.url).hostname.replace(/^www\./, ''); } catch { /* keep raw url */ }
                    const hasTitle = Boolean(lp.title && lp.title !== lp.url);
                    const isPending = lp.status === 'pending' || lp.status === 'processing';
                    // A real article photo (fetched from the page itself) can fill a big
                    // banner. A fallback site logo is small/square — stretching it into a
                    // wide banner makes it look broken, so it gets a compact, contained slot.
                    const hasRealImage = Boolean(lp.image) && lp.status === 'ready';
                    const hasFallbackLogo = Boolean(lp.image) && !hasRealImage;

                    const titleNode = hasTitle ? (
                      <h4 className="font-bold text-base leading-snug text-text-primary group-hover:text-primary transition-colors">
                        {lp.title}
                      </h4>
                    ) : (
                      <h4 className="font-medium text-sm text-text-secondary italic group-hover:text-primary transition-colors">
                        {isPending ? 'Fetching article preview…' : lp.url}
                      </h4>
                    );
                    const siteBadge = (
                      <div className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 select-none">
                        {lp.siteName || hostname}
                      </div>
                    );

                    return (
                      <div className="mb-4">
                        <a
                          href={lp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-primary hover:underline break-all mb-2"
                        >
                          {lp.url}
                        </a>

                        {hasRealImage ? (
                          <a
                            href={lp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border border-border-subtle/60 rounded-xl overflow-hidden cursor-pointer group bg-surface-container-low"
                          >
                            <div className="w-full aspect-[1.91/1] bg-surface-container overflow-hidden">
                              <img
                                src={lp.image}
                                alt={lp.title || hostname}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="p-4 border-t border-border-subtle/50">
                              {siteBadge}
                              {titleNode}
                              {lp.description && (
                                <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">
                                  {lp.description}
                                </p>
                              )}
                            </div>
                          </a>
                        ) : (
                          // No real photo available from the source (blocked, still pending, or
                          // the page has none) — compact card with just the site logo, not a
                          // stretched banner.
                          <a
                            href={lp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-border-subtle/60 rounded-xl cursor-pointer group bg-surface-container-low"
                          >
                            <div className="w-14 h-14 shrink-0 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden">
                              {hasFallbackLogo ? (
                                <img
                                  src={lp.image}
                                  alt={lp.siteName || hostname}
                                  className="w-8 h-8 object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <Globe className="w-6 h-6 text-outline" />
                              )}
                            </div>
                            <div className="min-w-0">
                              {siteBadge}
                              {titleNode}
                            </div>
                          </a>
                        )}
                      </div>
                    );
                  })()}

                  {/* Quick stats bottom */}
                  <div className="flex justify-between items-center text-xs text-text-secondary pb-4 border-b border-border-subtle/20 select-none">
                    <div className="flex items-center gap-1.5 font-medium">
                      <div className="w-4.5 h-4.5 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                        <ThumbsUp className="w-2.5 h-2.5 fill-current" />
                      </div>
                      <span>{post.likesCount} likes</span>
                    </div>
                    <div className="font-medium hover:underline cursor-pointer" onClick={() => toggleComments(post.id)}>
                      {post.commentsCount} comments • {post.sharesCount} shares
                    </div>
                  </div>

                  {/* Interaction buttons trigger */}
                  <div className="flex gap-1 pt-2">
                    <button 
                      type="button"
                      onClick={() => onLikePost(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-surface-container-low rounded-xl transition-all cursor-pointer font-semibold text-sm ${
                        post.isLikedByMe ? 'text-primary fill-primary scale-102 font-bold' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${post.isLikedByMe ? 'fill-current' : ''}`} />
                      <span>Like</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => toggleComments(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-surface-container-low rounded-xl transition-all cursor-pointer font-semibold text-sm ${
                        isCommentsOpen ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Comment</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleShare(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-surface-container-low rounded-xl text-text-secondary hover:text-text-primary transition-all cursor-pointer font-semibold text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Expandable comments thread */}
                  {isCommentsOpen && (
                    <div className="mt-4 pt-4 border-t border-border-subtle/20 flex flex-col gap-4 animate-fadeIn">
                      {/* Comments list */}
                      <div className="flex flex-col gap-3">
                        {commentsHasMore[post.id] && (
                          <button
                            type="button"
                            onClick={() => loadEarlierComments(post.id)}
                            disabled={commentsLoading[post.id]}
                            className="text-xs font-semibold text-primary hover:underline self-start disabled:opacity-50"
                          >
                            {commentsLoading[post.id] ? 'Loading...' : 'Load earlier comments'}
                          </button>
                        )}
                        {commentsLoading[post.id] && <p className="text-xs text-text-secondary">Loading comments...</p>}
                        {(loadedComments[post.id] || post.comments || []).map((comment) => (
                          <div key={comment.id} className="flex gap-3 items-start text-sm">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                              <img src={comment.authorAvatar} alt={comment.authorName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow bg-surface-container-low p-3 rounded-2xl border border-border-subtle/20">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-text-primary text-[13px]">{comment.authorName}</span>
                                <span className="text-[11px] text-outline">{comment.timeAgo}</span>
                              </div>
                              <p className="text-xs text-text-primary leading-relaxed">{comment.content || JSON.stringify(comment)}</p>
                            </div>
                          </div>
                        ))}
                        {!commentsLoading[post.id] && (loadedComments[post.id] || post.comments || []).length === 0 && <p className="text-xs text-text-secondary">No comments yet.</p>}
                      </div>

                      {/* Comment Input frame */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow relative flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-border-subtle/30 focus-within:border-primary focus-within:bg-white transition-all">
                          <input 
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCommentSubmit(post.id);
                            }}
                            className="bg-transparent border-none outline-none focus:ring-0 text-xs w-full mr-8 text-text-primary"
                          />
                          <button 
                            type="button"
                            onClick={() => handleCommentSubmit(post.id)}
                            className="absolute right-3 text-primary hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out animate-fadeIn"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen view" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-modalSlideUp"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
