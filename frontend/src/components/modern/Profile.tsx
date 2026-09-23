import { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  LayoutGrid, 
  List, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Edit3,
  Globe,
  Settings as SettingsIcon,
  Trash2,
  X,
  Send
} from 'lucide-react';
import { User, Post } from '../types';
import { postApi } from '../../api/postApi';
import { userApi } from '../../api/userApi';
import AddPortfolioModal from './AddPortfolioModal';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onNavigateToMessages: () => void;
  profilePosts: Post[];
  onLikePost: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  isCurrentUser?: boolean;
}

export default function Profile({
  user,
  onUpdateUser,
  onNavigateToMessages,
  profilePosts,
  onLikePost,
  onDeletePost,
  isCurrentUser
}: ProfileProps) {
  const [isFollowing, setIsFollowing] = useState(Boolean(user.isFollowing));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeLayout, setActiveLayout] = useState<'grid' | 'list'>('grid');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isAddPortfolioModalOpen, setIsAddPortfolioModalOpen] = useState(false);
  const [followStatus, setFollowStatus] = useState(user.isFollowing ? 'accepted' : 'none');
  const [followersCount, setFollowersCount] = useState(user.followersCount || 0);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [commentsHasMore, setCommentsHasMore] = useState<Record<string, boolean>>({});
  const [commentCountDeltas, setCommentCountDeltas] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user?.id) {
      userApi.getPortfolios(user.id).then(data => {
        setPortfolios(data || []);
      }).catch(console.error);
    }
  }, [user.id]);

  useEffect(() => {
    setIsFollowing(Boolean(user.isFollowing));
    setFollowStatus(user.isFollowing ? 'accepted' : 'none');
    setFollowersCount(user.followersCount || 0);
  }, [user.id, user.isFollowing, user.followersCount]);

  const handleAddPortfolio = (newPortfolio: any) => {
    userApi.createPortfolio(newPortfolio).then(saved => {
      setPortfolios([saved, ...portfolios]);
    }).catch(e => alert('Error saving portfolio: ' + e.message));
  };

  const handleDeletePortfolio = (portfolioId: string) => {
    if (window.confirm('Are you sure you want to delete this featured work?')) {
      userApi.deletePortfolio(portfolioId).then(() => {
        setPortfolios(portfolios.filter(p => p.id !== portfolioId));
      }).catch(e => alert('Error deleting portfolio: ' + e.message));
    }
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Edit fields backup inside state
  const [editName, setEditName] = useState(user.name);
  const [editTitle, setEditTitle] = useState(user.title);
  const [editCompany, setEditCompany] = useState(user.company);
  const [editLocation, setEditLocation] = useState(user.location || '');
  const [editBio, setEditBio] = useState(user.bio || '');
  const [editWebsite, setEditWebsite] = useState(user.website || '');

  const handleEditSave = () => {
    if (editWebsite && !editWebsite.startsWith('http')) {
      alert('Website URL must start with http:// or https://');
      return;
    }

    onUpdateUser({
      ...user,
      name: editName,
      title: editTitle,
      company: editCompany,
      location: editLocation,
      bio: editBio,
      website: editWebsite
    });
    setIsEditModalOpen(false);
  };

  const handleFollow = async () => {
    try {
      if (isFollowing || followStatus === 'pending') {
        await userApi.unfollow(user.id);
        if (isFollowing) setFollowersCount((count) => Math.max(0, count - 1));
        setIsFollowing(false);
        setFollowStatus('none');
      } else {
        const result = await userApi.follow(user.id);
        const status = result?.status || 'accepted';
        setFollowStatus(status);
        setIsFollowing(status === 'accepted');
        if (status === 'accepted') setFollowersCount((count) => count + 1);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update follow status');
    }
  };

  const mapComment = (comment: any) => ({
    id: comment.id,
    authorName: comment.user?.name || 'Unknown',
    authorAvatar: comment.user?.avatar_url || '/favicon.svg',
    content: comment.content,
    timeAgo: new Date(comment.created_at).toLocaleString()
  });

  const togglePostComments = async (postId: string) => {
    const willOpen = !expandedComments[postId];
    setExpandedComments((state) => ({ ...state, [postId]: willOpen }));
    if (!willOpen || commentsByPost[postId]) return;
    setCommentsLoading((state) => ({ ...state, [postId]: true }));
    try {
      const { comments, has_more } = await postApi.getComments(postId);
      setCommentsByPost((state) => ({ ...state, [postId]: (comments || []).map(mapComment) }));
      setCommentsHasMore((state) => ({ ...state, [postId]: Boolean(has_more) }));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to load comments');
    } finally {
      setCommentsLoading((state) => ({ ...state, [postId]: false }));
    }
  };

  const loadEarlierPostComments = async (postId: string) => {
    const oldest = commentsByPost[postId]?.[0];
    if (!oldest) return;
    setCommentsLoading((state) => ({ ...state, [postId]: true }));
    try {
      const { comments, has_more } = await postApi.getComments(postId, oldest.id);
      setCommentsByPost((state) => ({ ...state, [postId]: [...(comments || []).map(mapComment), ...(state[postId] || [])] }));
      setCommentsHasMore((state) => ({ ...state, [postId]: Boolean(has_more) }));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to load comments');
    } finally {
      setCommentsLoading((state) => ({ ...state, [postId]: false }));
    }
  };

  const submitPostComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    try {
      const comment = await postApi.addComment(postId, content);
      setCommentsByPost((state) => ({ ...state, [postId]: [...(state[postId] || []), mapComment(comment)] }));
      setCommentCountDeltas((state) => ({ ...state, [postId]: (state[postId] || 0) + 1 }));
      setCommentInputs((state) => ({ ...state, [postId]: '' }));
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send comment');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsUploading(true);
        const res = await postApi.uploadMedia(e.target.files[0]);
        const avatarUrl = res.url;
        onUpdateUser({ ...user, avatar: avatarUrl });
      } catch (err) {
        alert('Failed to upload avatar');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsUploading(true);
        const res = await postApi.uploadMedia(e.target.files[0]);
        const coverUrl = res.url;
        onUpdateUser({ ...user, coverImage: coverUrl });
      } catch (err) {
        alert('Failed to upload cover');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto py-8">
      {/* Profile Hero section */}
      <div className="relative mb-8">
        {/* Cover image wrap */}
        <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden relative shadow-sm border border-border-subtle/50 bg-surface-container">
          {user.coverImage && <img src={user.coverImage} alt="Cover background" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
          {/* Cover editor selector */}
          {isCurrentUser && <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => coverInputRef.current?.click()}
              className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-md bg-white text-text-primary flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all"
              title="Upload Custom Cover"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>}
          <input 
            type="file" 
            ref={coverInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleCoverUpload} 
          />
        </div>

        {/* Profile Info alignment overlap */}
        <div className="px-8 -mt-16 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 select-none">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-background bg-background shadow-md overflow-hidden flex-shrink-0 relative group">
              {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary bg-secondary-container">{user.name?.slice(0, 1).toUpperCase()}</div>}
              {isCurrentUser && <div
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
                title="Change Avatar"
              >
                <Camera className="w-6 h-6" />
              </div>}
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
              />
            </div>

            <div className="text-center md:text-left pb-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="font-bold text-2xl md:text-3xl text-text-primary tracking-tight">{user.name}</h2>
                {isCurrentUser && <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-text-secondary hover:text-primary p-1 rounded-full cursor-pointer transition-colors"
                  title="Edit profile information"
                >
                  <Edit3 className="w-4 h-4" />
                </button>}
              </div>
              <p className="font-semibold text-sm text-text-secondary mb-1">
                {user.title} @ <span className="text-primary font-bold">{user.company}</span>
              </p>
              {user.location && (
                <p className="text-xs text-outline flex items-center justify-center md:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{user.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Social connections actions button panel */}
          {!isCurrentUser && <div className="flex gap-3 pb-2 justify-center">
            <button 
              onClick={handleFollow}
              className={`px-6 py-2.5 rounded-full font-bold shadow-sm transition-all text-xs cursor-pointer select-none ${
                isFollowing 
                  ? 'bg-success text-white hover:brightness-105' 
                  : 'bg-primary text-white hover:brightness-110 active:scale-95'
              }`}
            >
              {followStatus === 'pending' ? 'Requested' : isFollowing ? 'Following' : 'Follow'}
            </button>
            <button 
              onClick={onNavigateToMessages}
              className="bg-secondary-container text-on-secondary-container px-6 py-2.5 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer selection:bg-transparent"
            >
              Message
            </button>
          </div>}
        </div>
      </div>

      {/* Profile Main Content Layout (Left card column + Featured Work grid column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column info metadata stats */}
        <div className="lg:col-span-1 flex flex-col gap-6 select-none">
          {/* Bio about details block */}
          <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm">
            <h3 className="font-bold text-text-primary text-base mb-4">About</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {user.bio}
            </p>
            <div className="space-y-3 pt-3 border-t border-border-subtle/20">
              {user.website && (
                <div className="flex items-center gap-3 text-text-secondary">
                  <LinkIcon className="w-4 h-4 text-primary" />
                  <a className="text-xs font-semibold text-primary hover:underline" href={user.website} target="_blank" rel="noreferrer">
                    {user.website}
                  </a>
                </div>
              )}
              {user.joinedDate && (
                <div className="flex items-center gap-3 text-text-secondary">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">{user.joinedDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills expertise badges */}
          <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm">
            <h3 className="font-bold text-text-primary text-base mb-4">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {user.expertise?.map((tag) => (
                <span 
                  key={tag} 
                  className="bg-secondary-fixed text-on-secondary-fixed-variant px-3.5 py-1.5 rounded-full font-semibold text-xs text-primary"
                >
                  {tag}
                </span>
              ))}
              {!user.expertise?.length && <span className="text-xs text-text-secondary">No expertise added.</span>}
            </div>
          </div>

          {/* Network fast connections preview */}
          <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm animate-fadeIn">
            <h3 className="font-bold text-text-primary text-base mb-4">Network</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-surface-container-low p-3"><div className="text-lg font-black text-primary">{followersCount}</div><div className="text-xs text-text-secondary">Followers</div></div>
              <div className="rounded-xl bg-surface-container-low p-3"><div className="text-lg font-black text-primary">{user.followingCount || 0}</div><div className="text-xs text-text-secondary">Following</div></div>
            </div>
          </div>
        </div>

        {/* Right column bento grid + activity posts */}
        <div className="lg:col-span-2">
          
          {/* Header layout controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-text-primary text-xl tracking-tight">Featured Work</h3>
              {isCurrentUser && (
                <button 
                  onClick={() => setIsAddPortfolioModalOpen(true)}
                  className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  + Add
                </button>
              )}
            </div>
            <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-border-subtle/50 shadow-sm select-none">
              <button 
                onClick={() => setActiveLayout('grid')}
                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                  activeLayout === 'grid' 
                    ? 'bg-secondary-container text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <LayoutGrid className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={() => setActiveLayout('list')}
                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                  activeLayout === 'list' 
                    ? 'bg-secondary-container text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <List className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Bento grid layout screen */}
          {portfolios.length === 0 ? (
            <div className="bg-surface-container rounded-2xl p-8 flex flex-col items-center justify-center text-text-secondary border border-dashed border-border-subtle mb-8">
              <p className="text-sm font-medium">No featured work added yet.</p>
            </div>
          ) : activeLayout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 select-none">
              {portfolios.map((item, idx) => {
                const isLarge = idx % 3 === 0;
                return (
                  <div 
                    key={item.id} 
                    className={`${isLarge ? 'md:col-span-2 md:row-span-2 min-h-[320px]' : 'min-h-[160px]'} bg-white rounded-2xl overflow-hidden border border-border-subtle/50 shadow-sm relative group cursor-pointer`}
                    onClick={() => item.link_url && window.open(item.link_url, '_blank')}
                  >
                    {item.image_url ? (
                      <img 
                        src={item.image_url}
                        alt={item.title} 
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105`}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
                        <span className="text-text-secondary text-xs">No Image</span>
                      </div>
                    )}
                    
                    <div className={`absolute inset-0 bg-gradient-to-t ${isLarge ? 'from-black/80 via-black/20' : 'from-black/70'} to-transparent flex flex-col justify-end p-4 ${isLarge ? 'md:p-6' : ''} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                      <span className="text-primary-fixed-dim text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">{item.project_type}</span>
                      <h4 className="text-white font-bold text-sm md:text-lg mb-1">{item.title}</h4>
                      {isLarge && item.description && (
                        <p className="text-white/80 text-xs leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {isCurrentUser && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeletePortfolio(item.id); }}
                        className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
                        title="Delete Portfolio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8 select-none">
              {portfolios.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-5 rounded-2xl border border-border-subtle/50 shadow-sm flex flex-col gap-1 cursor-pointer hover:border-primary transition-colors relative group"
                  onClick={() => item.link_url && window.open(item.link_url, '_blank')}
                >
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{item.project_type}</span>
                  <h4 className="font-bold text-text-primary text-sm">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{item.description}</p>
                  )}
                  {isCurrentUser && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeletePortfolio(item.id); }}
                      className="absolute top-5 right-5 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                      title="Delete Portfolio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Profile Recent Activity Posts */}
          <div className="mt-8 flex flex-col gap-6">
            <h3 className="font-bold text-text-primary text-lg">Recent Posts</h3>
            
            {profilePosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white p-6 rounded-2xl border border-border-subtle/50 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-text-primary text-sm">{post.author.name}</h5>
                    <p className="text-[11px] text-text-secondary">{post.timeAgo}</p>
                  </div>
                </div>

                {post.title && (
                  <h4 className="font-bold text-base text-text-primary mb-1">{post.title}</h4>
                )}
                <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {post.image && (
                  <div 
                    className="rounded-xl overflow-hidden border border-border-subtle/30 mt-3 bg-surface-container-low max-h-[360px] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setFullscreenImage(post.image)}
                  >
                    <img 
                      src={post.image}
                      alt="Post attachment" 
                      className="w-full h-full object-cover max-h-[360px]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Link Preview standard representation inside post */}
                {post.linkPreview && (
                  <div className="rounded-xl overflow-hidden border border-border-subtle hover:border-primary-container transition-colors">
                    {post.linkPreview.image && (
                      <div className="h-32 overflow-hidden bg-cover img-container">
                        <img src={post.linkPreview.image} alt={post.linkPreview.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4 bg-surface-container-low">
                      <p className="font-medium text-[10px] text-primary uppercase tracking-wider mb-1">
                        {post.linkPreview.url}
                      </p>
                      <h6 className="font-bold text-xs text-text-primary">
                        {post.linkPreview.title}
                      </h6>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-border-subtle/20 select-none relative">
                  <button 
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                      post.isLikedByMe ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <ThumbsUp className={`w-4.5 h-4.5 ${post.isLikedByMe ? 'fill-current' : ''}`} />
                    <span>{post.likesCount} Likes</span>
                  </button>
                  <button type="button" onClick={() => togglePostComments(post.id)} className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary font-semibold cursor-pointer">
                    <MessageCircle className="w-4.5 h-4.5" />
                    <span>{(post.commentsCount || 0) + (commentCountDeltas[post.id] || 0)} Comments</span>
                  </button>
                  
                  {post.author.id === user.id && onDeletePost && (
                    <button 
                      onClick={() => onDeletePost(post.id)}
                      className="absolute right-0 text-text-secondary hover:text-error cursor-pointer p-1.5 rounded-full hover:bg-error/10 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
                {expandedComments[post.id] && (
                  <div className="border-t border-border-subtle/20 pt-4 flex flex-col gap-3">
                    {commentsHasMore[post.id] && (
                      <button
                        type="button"
                        onClick={() => loadEarlierPostComments(post.id)}
                        disabled={commentsLoading[post.id]}
                        className="text-xs font-semibold text-primary hover:underline self-start disabled:opacity-50"
                      >
                        {commentsLoading[post.id] ? 'Loading...' : 'Load earlier comments'}
                      </button>
                    )}
                    {commentsLoading[post.id] && <p className="text-xs text-text-secondary">Loading comments...</p>}
                    {!commentsLoading[post.id] && (commentsByPost[post.id] || []).map((comment) => (
                      <div key={comment.id} className="flex gap-2 items-start"><img src={comment.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" /><div className="bg-surface-container-low rounded-2xl px-3 py-2 flex-1"><div className="text-xs font-bold">{comment.authorName}</div><p className="text-xs text-text-primary">{comment.content}</p><div className="text-[10px] text-outline mt-1">{comment.timeAgo}</div></div></div>
                    ))}
                    {!commentsLoading[post.id] && (commentsByPost[post.id] || []).length === 0 && <p className="text-xs text-text-secondary">No comments yet.</p>}
                    <div className="flex gap-2"><input type="text" value={commentInputs[post.id] || ''} onChange={(event) => setCommentInputs((state) => ({ ...state, [post.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') submitPostComment(post.id); }} placeholder="Write a comment..." className="flex-1 rounded-full border border-border-subtle bg-surface-container-low px-4 py-2 text-xs outline-none focus:border-primary" /><button type="button" onClick={() => submitPostComment(post.id)} className="rounded-full bg-primary p-2 text-white" aria-label="Send comment"><Send className="w-4 h-4" /></button></div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Edit Profile modal block */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-border-subtle flex flex-col gap-4 animate-modalSlideUp select-none">
            <h3 className="font-bold text-text-primary text-lg">Edit Profile Information</h3>
            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Professional Fullname</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Current Role Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Company</label>
                <input 
                  type="text" 
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Location</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Short Bio Statement</label>
                <textarea 
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Personal Portfolio / Website</label>
                <input 
                  type="url" 
                  value={editWebsite}
                  placeholder="https://yourwebsite.com"
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle/20">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high transition-colors font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSave}
                className="px-5 py-2 bg-primary text-white hover:brightness-105 transition-colors font-bold text-xs rounded-xl cursor-pointer"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Add Portfolio Modal */}
      <AddPortfolioModal 
        isOpen={isAddPortfolioModalOpen}
        onClose={() => setIsAddPortfolioModalOpen(false)}
        onSuccess={handleAddPortfolio}
      />

    </div>
  );
}
