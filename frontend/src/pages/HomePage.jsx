import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/modern/Header';
import Sidebar from '../components/modern/Sidebar';
import RightSidebar from '../components/modern/RightSidebar';
import Feed from '../components/modern/Feed';
import CreatePostModal from '../components/modern/CreatePostModal';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../api/postApi';
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

  const currentUser = {
    id: user?.id || 'new_user',
    name: user?.name || 'Guest User',
    title: user?.title || 'Professional',
    company: user?.company || '',
    avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
    bio: user?.bio || 'Passionate professional.',
    location: user?.location || 'Global',
    email: user?.email || '',
    networkCount: 120,
    expertise: ['Technology', 'Design']
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const formatBackendPost = (post) => {
    return {
      id: post.id,
      author: {
        id: post.user_id,
        name: post.user?.name || 'Unknown',
        title: post.user?.title || 'Member',
        company: post.user?.company || '',
        avatar: post.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      },
      timeAgo: new Date(post.created_at).toLocaleDateString(),
      title: post.title,
      content: post.content,
      image: post.media?.length > 0 && post.media[0].media_type === 'image' ? post.media[0].media_url : undefined,
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      sharesCount: 0,
      isLikedByMe: false,
      linkPreview: post.post_type === 'link' && post.link ? {
        url: post.link.url,
        title: post.link.title || post.link.url,
        description: post.link.description || '',
        image: post.link.image_url || ''
      } : undefined,
      comments: post.comments ? post.comments.map(c => ({
        id: c.id,
        authorName: c.user?.name || 'Unknown',
        authorAvatar: c.user?.avatar || '',
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

  const handleCreatePostSubmit = async (title, text, imageUrl, linkUrl) => {
    let pType = 'text';
    if (linkUrl) pType = 'link';
    else if (imageUrl) pType = 'image';

    const postData = {
      title: title,
      content: text,
      post_type: pType,
      media_urls: imageUrl ? [imageUrl] : [],
      link_url: linkUrl || ''
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
          likes: isLiked ? post.likes + 1 : post.likes - 1
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
            likes: isLiked ? post.likes + 1 : post.likes - 1
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
    }
  };

  const handleNavigate = (tab) => {
    if (tab === 'profile') navigate(`/profile/${currentUser.id}`);
    else if (tab === 'home') navigate(`/`);
    else navigate(`/${tab}`);
  };

  const handleFollowSuggestion = (userId) => {
    if (followedUsers.includes(userId)) {
      setFollowedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setFollowedUsers(prev => [...prev, userId]);
    }
  };

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
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <main className="max-w-7xl mx-auto flex gap-6 px-6 py-6 min-h-[calc(100vh-80px)]">
        <Sidebar 
          currentTab="home"
          onNavigate={handleNavigate}
          onRequestCreatePost={() => setIsCreatePostOpen(true)}
          onLogout={logout}
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
              onFollowSuggestion={handleFollowSuggestion}
              followedUsers={followedUsers}
              onDeletePost={handleDeletePost}
            />
            <RightSidebar 
              followedUsers={followedUsers}
              onFollowSuggestion={handleFollowSuggestion}
              onNavigate={handleNavigate}
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
