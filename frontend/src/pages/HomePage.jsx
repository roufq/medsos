import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import AppLayout, { useAppNavigate } from '../components/modern/AppLayout';
import RightSidebar from '../components/modern/RightSidebar';
import Feed from '../components/modern/Feed';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../api/postApi';
import { userApi } from '../api/userApi';

const PAGE_SIZE = 20;

const HomePage = () => {
  const { user } = useAuth();
  const goTo = useAppNavigate();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [activeComposerType, setActiveComposerType] = useState('image');
  const [composerType, setComposerType] = useState(undefined);
  const [composerOpen, setComposerOpen] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([]);

  const currentUser = { name: user?.name || '', avatar: user?.avatar_url || '/favicon.svg' };

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const feed = await postApi.getFeed(PAGE_SIZE, 0);
      setPosts(feed || []);
      setHasMore((feed || []).length === PAGE_SIZE);
    } catch (e) {
      console.error('Failed to fetch feed posts:', e);
    } finally {
      setLoading(false);
    }
  };

  // Cursor pagination (before_id) stays correct while new posts arrive.
  const loadMore = async () => {
    const last = posts[posts.length - 1];
    if (!last) return;
    setLoadingMore(true);
    try {
      const more = await postApi.getFeed(PAGE_SIZE, 0, null, last.id);
      setPosts((current) => [...current, ...(more || []).filter((p) => !current.some((c) => c.id === p.id))]);
      setHasMore((more || []).length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  const addPost = (post) => setPosts((current) => [post, ...current.filter((p) => p.id !== post.id)]);
  const replacePost = (post) => setPosts((current) => current.map((p) => (p.id === post.id ? post : p)));
  const removePost = (id) => setPosts((current) => current.filter((p) => p.id !== id));

  const handleFollowSuggestion = async (userId) => {
    if (followedUsers.includes(userId)) return;
    try {
      await userApi.follow(userId);
      setFollowedUsers((prev) => [...prev, userId]);
    } catch (error) {
      alert(error.response?.data?.error || 'Gagal mengikuti pengguna');
    }
  };

  return (
    <AppLayout currentTab="home" onPostCreated={addPost} composerOpen={composerOpen} setComposerOpen={setComposerOpen} composerType={composerType} setComposerType={setComposerType} onComposerTypeChange={setActiveComposerType}>
      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="poster-feed-layout">
          <Feed
            activeComposerType={composerOpen ? activeComposerType : undefined}
            posts={posts}
            currentUser={currentUser}
            onRequestCreatePost={(type) => { setComposerType(type); setActiveComposerType(type || 'image'); setComposerOpen(true); }}
            onNavigate={goTo}
            onPostDeleted={removePost}
            onPostUpdated={replacePost}
            onPostCreated={addPost}
            onLoadMore={loadMore}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
          <RightSidebar posts={posts} followedUsers={followedUsers} onFollowSuggestion={handleFollowSuggestion} onNavigate={goTo} onOpenProfile={(id) => navigate(`/profile/${id}`)} />
        </div>
      )}
    </AppLayout>
  );
};

export default HomePage;
