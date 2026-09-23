import { useState, useEffect } from 'react';
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
  const { user: authUser, logout, updateProfileState } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/thanks');
  };
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // The logged-in user in modern format
  const currentUser = {
    id: authUser?.id,
    name: authUser?.name || '',
    title: authUser?.title || '',
    company: authUser?.company || '',
    avatar: authUser?.avatar_url || '/favicon.svg',
    coverImage: authUser?.cover_url || '',
    bio: authUser?.bio || '',
    location: authUser?.location || '',
    email: authUser?.email || '',
    networkCount: authUser?.following_count || 0,
    expertise: authUser?.interests || []
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

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const user = await userApi.getProfile(id);
      
      const formattedUser = {
        id: user.id,
        name: user.name || '',
        title: user.title || '',
        company: user.company || '',
        avatar: user.avatar_url || '/favicon.svg',
        coverImage: user.cover_url || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        email: user.email || '',
        networkCount: user.followers_count || 0,
        followersCount: user.followers_count || 0,
        followingCount: user.following_count || 0,
        expertise: user.interests || [],
        isFollowing: Boolean(user.is_followed_by_me),
        joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : ''
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

  useEffect(() => {
    fetchProfileData();
  }, [id]);

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
      if (profileUser?.id === currentUser.id) {
        updateProfileState(response);
      }
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
        onOpenProfile={(userId) => navigate(`/profile/${userId}`)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <main className="max-w-7xl mx-auto flex gap-6 px-6 py-6 min-h-[calc(100vh-80px)]">
        <Sidebar 
          currentTab="profile"
          onNavigate={handleNavigate}
          onRequestCreatePost={() => setIsCreatePostOpen(true)}
          onLogout={handleLogout}
        />

        <div className="flex-grow min-w-0">
          <Profile 
            user={profileUser}
            onUpdateUser={handleProfileUpdated}
            onNavigateToMessages={() => navigate(`/messages?user_id=${profileUser.id}`)}
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
