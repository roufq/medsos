import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { postApi } from '../api/postApi';
import Header from '../components/modern/Header';
import Sidebar from '../components/modern/Sidebar';
import Profile from '../components/modern/Profile';
import CreatePostModal from '../components/modern/CreatePostModal';
import { Loader } from 'lucide-react';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // The logged-in user in modern format
  const currentUser = {
    id: authUser?.id || 'new_user',
    name: authUser?.name || 'Guest User',
    title: authUser?.title || 'Professional',
    company: authUser?.company || '',
    avatar: authUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
    bio: authUser?.bio || 'Passionate professional.',
    location: authUser?.location || 'Global',
    email: authUser?.email || '',
    networkCount: 120,
    expertise: ['Technology', 'Design']
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);

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

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const user = await userApi.getProfile(id);
      
      const formattedUser = {
        id: user.id,
        name: user.name || 'User',
        title: user.title || 'Professional',
        company: user.company || '',
        avatar: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
        bio: user.bio || 'Passionate professional.',
        location: user.location || 'Global',
        website: user.website || '',
        email: user.email || '',
        networkCount: user.following_count || 120,
        expertise: ['Technology', 'Design']
      };
      setProfileUser(formattedUser);

      const userPosts = await postApi.getFeed(30, 0, id);
      setPosts(userPosts.map(formatBackendPost));
    } catch (e) {
      console.error('Failed to load profile data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = async (updatedUser) => {
    try {
      const response = await userApi.updateProfile({
        name: updatedUser.name,
        bio: updatedUser.bio,
        avatar_url: updatedUser.avatar,
        cover_url: updatedUser.coverImage,
        title: updatedUser.title,
        company: updatedUser.company,
        location: updatedUser.location,
        website: updatedUser.website
      });
      // The backend returns the updated model.User
      // We map it back to the modern UI format
      setProfileUser({
        ...profileUser,
        name: response.name,
        bio: response.bio,
        avatar: response.avatar_url || profileUser.avatar,
        coverImage: response.cover_url || profileUser.coverImage,
        title: response.title || profileUser.title,
        company: response.company || profileUser.company,
        location: response.location || profileUser.location,
        website: response.website || profileUser.website
      });
    } catch (error) {
      alert('Failed to update profile: ' + error.message);
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
    if (profileUser?.id === currentUser.id) {
      setPosts([formatBackendPost(newPost), ...posts]);
    }
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

  const handleNavigate = (tab) => {
    if (tab === 'profile') navigate(`/profile/${currentUser.id}`);
    else if (tab === 'home') navigate(`/`);
    else navigate(`/${tab}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary font-semibold">User profile not found.</div>
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
          currentTab="profile"
          onNavigate={handleNavigate}
          onRequestCreatePost={() => setIsCreatePostOpen(true)}
          onLogout={logout}
        />

        <div className="flex-grow min-w-0">
          <Profile 
            user={profileUser}
            onUpdateUser={handleProfileUpdated}
            onNavigateToMessages={() => alert('Messaging not fully implemented.')}
            profilePosts={posts}
            onLikePost={handleLikePost}
            onDeletePost={profileUser?.id === currentUser.id ? handleDeletePost : undefined}
            isCurrentUser={profileUser?.id === currentUser.id}
          />
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

export default ProfilePage;
