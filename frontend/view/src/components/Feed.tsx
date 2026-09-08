import { useState } from 'react';
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  FileText, 
  MoreHorizontal, 
  Info, 
  UserPlus, 
  UserCheck, 
  Send 
} from 'lucide-react';
import { Post, User } from '../types';
import { mockUsers } from '../data';

interface FeedProps {
  posts: Post[];
  currentUser: User;
  searchQuery: string;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onRequestCreatePost: () => void;
  onNavigate: (tab: 'home' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics') => void;
  onFollowSuggestion: (userId: string) => void;
  followedUsers: string[];
}

export default function Feed({
  posts,
  currentUser,
  searchQuery,
  onLikePost,
  onAddComment,
  onRequestCreatePost,
  onNavigate,
  onFollowSuggestion,
  followedUsers
}: FeedProps) {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => {
    const term = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(term) ||
      post.author.name.toLowerCase().includes(term) ||
      post.author.title.toLowerCase().includes(term) ||
      (post.linkPreview?.title.toLowerCase().includes(term))
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
            <p className="text-xs text-outline">Try searching for keywords like design, distributed, layout, or Sarah.</p>
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
                          if (post.author.id === 'adrian') onNavigate('profile');
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
                            if (post.author.id === 'adrian') onNavigate('profile');
                          }}
                          className={`${post.author.id === 'adrian' ? 'hover:underline cursor-pointer' : ''} font-bold text-text-primary text-sm`}
                        >
                          {post.author.name}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {post.author.title} at {post.author.company} • {post.timeAgo}
                        </div>
                      </div>
                    </div>
                    <button className="text-text-secondary hover:bg-surface-container p-1 rounded-full cursor-pointer transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Content text */}
                  <p className="text-sm font-normal text-text-primary leading-relaxed mb-4 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Standard Image attach if exists */}
                  {post.image && (
                    <div className="rounded-xl overflow-hidden border border-border-subtle/30 mb-4 bg-surface-container-low max-h-[360px] flex items-center justify-center">
                      <img 
                        src={post.image} 
                        alt="Post illustration" 
                        className="w-full h-full object-cover max-h-[360px]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Link Preview box if exists */}
                  {post.linkPreview && (
                    <div className="border border-border-subtle/60 rounded-xl overflow-hidden cursor-pointer group mb-4">
                      {post.linkPreview.image && (
                        <div className="h-44 bg-surface-container-low overflow-hidden">
                          <img 
                            src={post.linkPreview.image} 
                            alt={post.linkPreview.title} 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="p-4 bg-surface-container-low border-t border-border-subtle/50">
                        <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1 select-none">
                          {post.linkPreview.url}
                        </div>
                        <h4 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors">
                          {post.linkPreview.title}
                        </h4>
                        {post.linkPreview.description && (
                          <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                            {post.linkPreview.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick stats bottom */}
                  <div className="flex justify-between items-center text-xs text-text-secondary pb-4 border-b border-border-subtle/20 select-none">
                    <div className="flex items-center gap-1.5 font-medium">
                      <div className="w-4.5 h-4.5 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                        <ThumbsUp className="w-2.5 h-2.5 fill-current" />
                      </div>
                      <span>{post.likesCount + (post.isLikedByMe ? 1 : 0)} likes</span>
                    </div>
                    <div className="font-medium hover:underline cursor-pointer" onClick={() => toggleComments(post.id)}>
                      {post.comments?.length || 0} comments • {post.sharesCount} shares
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
                        {post.comments?.map((comment) => (
                          <div key={comment.id} className="flex gap-3 items-start text-sm">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                              <img src={comment.authorAvatar} alt={comment.authorName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow bg-surface-container-low p-3 rounded-2xl border border-border-subtle/20">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-text-primary text-[13px]">{comment.authorName}</span>
                                <span className="text-[11px] text-outline">{comment.timeAgo}</span>
                              </div>
                              <p className="text-xs text-text-primary leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))}
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
    </div>
  );
}
