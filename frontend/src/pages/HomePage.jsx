import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/modern/Header';
import Sidebar from '../components/modern/Sidebar';
import RightSidebar from '../components/modern/RightSidebar';
import Feed from '../components/modern/Feed';
import CreatePostModal from '../components/modern/CreatePostModal';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../api/postApi';
import { userApi } from '../api/userApi';
import { Loader } from 'lucide-react';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/thanks');
  };

  const currentUser = {
    id: user?.id,
    name: user?.name || '',
    title: user?.title || '',
    company: user?.company || '',
    avatar: user?.avatar_url || '/favicon.svg',
    coverImage: user?.cover_url || '',
    bio: user?.bio || '',
    location: user?.location || '',
    email: user?.email || '',
    networkCount: user?.following_count || 0,
    expertise: user?.interests || []
  };

  const formatBackendPost = (post) => {
    return {
      id: post.id,
      author: {
        id: post.user_id,
        name: post.user?.name || 'Unknown',
        title: post.user?.title || 'Member',
        company: post.user?.company || '',
        avatar: post.user?.avatar_url || '/favicon.svg',
      },
      timeAgo: new Date(post.created_at).toLocaleDateString(),
      title: post.title,
      content: post.content,
      image: post.media?.length > 0 && post.media[0].media_type === 'image' ? post.media[0].media_url : undefined,
      likesCount: post.likes_count || 0,
      commentsCount: post.comments_count || 0,
      sharesCount: post.shares_count || 0,
      isLikedByMe: Boolean(post.is_liked_by_me),
      linkPreview: post.post_type === 'link' && post.link ? {
        url: post.link.url,
        title: post.link.title || '',
        description: post.link.description || '',
        image: post.link.image_url || '',
        siteName: post.link.site_name || '',
        status: post.link.preview_status || 'pending'
      } : undefined,
      comments: post.comments ? post.comments.map(c => ({
        id: c.id,
        authorName: c.user?.name || 'Unknown',
        authorAvatar: c.user?.avatar_url || '',
        content: c.content,
        timeAgo: new Date(c.created_at).toLocaleDateString()
      })) : []
    };
  };

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const feed = await postApi.getFeed(30, 0);
      setPosts(feed.map(formatBackendPost));
    } catch (e) {
      console.error('Failed to fetch feed posts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePostSubmit = async ({ title, text, imageUrl, linkUrl, hashtags, mentions }) => {
    let pType = 'text';
    if (linkUrl) pType = 'link';
    else if (imageUrl) pType = 'image';

    const postData = {
      title: title,
      content: text,
      post_type: pType,
      media_urls: imageUrl ? [imageUrl] : [],
      link_url: linkUrl || '',
      hashtags: hashtags || [],
      mentions: mentions || [],
    };

    const newPost = await postApi.createPost(postData);
    setPosts([formatBackendPost(newPost), ...posts]);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postApi.deletePost(postId);
        setPosts(posts.filter((p) => p.id !== postId));
      } catch (e) {
        alert('Failed to delete post: ' + e.message);
      }
    }
  };

  const handleLikePost = async (postId) => {
    // Optimistic UI update
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLikedByMe;
        return { 
          ...post, 
          isLikedByMe: isLiked,
          likesCount: Math.max(0, post.likesCount + (isLiked ? 1 : -1))
        };
      }
      return post;
    }));

    try {
      await postApi.toggleLike(postId);
    } catch (e) {
      console.error('Failed to toggle like', e);
      // Revert if failed
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLikedByMe;
          return { 
            ...post, 
            isLikedByMe: isLiked,
            likesCount: Math.max(0, post.likesCount + (isLiked ? 1 : -1))
          };
        }
        return post;
      }));
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      const newComment = await postApi.addComment(postId, text);
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...post.comments, {
              id: newComment.id,
              authorName: currentUser.name,
              authorAvatar: currentUser.avatar,
              content: newComment.content,
              timeAgo: 'Just now'
            }]
          };
        }
        return post;
      }));
    } catch (e) {
      console.error('Failed to add comment', e);
      alert('Failed to add comment: ' + e.message);
      throw e;
    }
  };

  const handleNavigate = (tab) => {
    if (tab === 'profile') navigate(`/profile/${currentUser.id}`);
    else if (tab === 'home') navigate(`/`);
    else navigate(`/${tab}`);
  };

  const handleFollowSuggestion = async (userId) => {
    if (!followedUsers.includes(userId)) {
      try {
        await userApi.follow(userId);
        setFollowedUsers(prev => [...prev, userId]);
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to follow user');
      }
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <Loader className="animate-spin text-[#0866ff]" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen font-sans">
      <Header 
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigate={handleNavigate}
        onOpenProfile={(userId) => navigate(`/profile/${userId}`)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <main className="max-w-7xl mx-auto flex gap-6 px-6 py-6 min-h-[calc(100vh-80px)]">
        <Sidebar 
          currentTab="home"
          onNavigate={handleNavigate}
          onRequestCreatePost={() => setIsCreatePostOpen(true)}
          onLogout={handleLogout}
        />

        <div className="flex-grow min-w-0">
          <div className="flex gap-6 items-start">
            <Feed 
              posts={posts}
              currentUser={currentUser}
              searchQuery={searchQuery}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onRequestCreatePost={() => setIsCreatePostOpen(true)}
              onNavigate={handleNavigate}
              onOpenProfile={(userId) => navigate(`/profile/${userId}`)}
              onDeletePost={handleDeletePost}
            />
            <RightSidebar 
              posts={posts}
              followedUsers={followedUsers}
              onFollowSuggestion={handleFollowSuggestion}
              onNavigate={handleNavigate}
              onOpenProfile={(userId) => navigate(`/profile/${userId}`)}
            />
          </div>
        </div>
      </main>

      <CreatePostModal 
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleCreatePostSubmit}
        currentUser={currentUser}
      />
    </div>
  );
};

export default HomePage;
