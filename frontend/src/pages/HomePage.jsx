import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import AppLayout, { useAppNavigate } from '../components/modern/AppLayout';
import RightSidebar from '../components/modern/RightSidebar';
import Feed from '../components/modern/Feed';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../api/postApi';
import { userApi } from '../api/userApi';

const PAGE_SIZE = 50;

const HomePage = () => {
  const { user, loading: authLoading } = useAuth();
  const goTo = useAppNavigate();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [activeComposerType, setActiveComposerType] = useState('image');
  const [composerType, setComposerType] = useState(undefined);
  const [composerOpen, setComposerOpen] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([]);

  const currentUser = { name: user?.name || '', avatar: user?.avatar_url || '/favicon.svg' };

  const fetchFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const feed = await postApi.getFeed(PAGE_SIZE, 0, null, null, '', !user);
      setPosts(feed || []);
      setHasMore((feed || []).length === PAGE_SIZE);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Gagal memuat postingan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Cursor pagination (before_id) stays correct while new posts arrive.
  const loadMore = async () => {
    const last = posts[posts.length - 1];
    if (!last) return;
    setLoadingMore(true);
    setError('');
    try {
      const more = await postApi.getFeed(PAGE_SIZE, 0, null, last.id, '', !user);
      setPosts((current) => [...current, ...(more || []).filter((p) => !current.some((c) => c.id === p.id))]);
      setHasMore((more || []).length === PAGE_SIZE);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Gagal memuat postingan berikutnya.');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => { if (!authLoading) fetchFeed(); }, [user?.id, authLoading]);

  const addPost = (post) => setPosts((current) => [post, ...current.filter((p) => p.id !== post.id)]);
  const replacePost = (post) => setPosts((current) => current.map((p) => (p.id === post.id ? post : p)));
  const removePost = (id) => setPosts((current) => {
    const removed = current.find((p) => p.id === id);
    return current
      .filter((p) => p.id !== id)
      .map((p) => (removed?.repost_of_id && p.id === removed.repost_of_id
        ? { ...p, is_reposted_by_me: false, reposts_count: Math.max(0, (p.reposts_count || 1) - 1) }
        : p));
  });

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
    <AppLayout currentTab={location.pathname === '/explore' ? 'explore' : 'home'} onPostCreated={addPost} composerOpen={composerOpen} setComposerOpen={setComposerOpen} composerType={composerType} setComposerType={setComposerType} onComposerTypeChange={setActiveComposerType}>
      {error && <div role="alert" className="mb-4 rounded-xl border border-error/30 bg-error/10 p-4 text-sm"><p>{error}</p><button type="button" className="mt-2 font-bold underline" onClick={() => posts.length ? loadMore() : fetchFeed()}>Coba lagi</button></div>}
      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="poster-feed-layout">
          {(!error || posts.length > 0) && <Feed
            canCreate={Boolean(user)}
            activeComposerType={composerOpen ? activeComposerType : undefined}
            posts={posts}
            currentUser={currentUser}
            onRequestCreatePost={(type) => { if (!user) { navigate('/login'); return; } setComposerType(type); setActiveComposerType(type || 'image'); setComposerOpen(true); }}
            onNavigate={goTo}
            onPostDeleted={removePost}
            onPostUpdated={replacePost}
            onPostCreated={addPost}
            onLoadMore={loadMore}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />}
          {user && <RightSidebar posts={posts} followedUsers={followedUsers} onFollowSuggestion={handleFollowSuggestion} onNavigate={goTo} onOpenProfile={(id) => navigate(`/profile/${id}`)} />}
        </div>
      )}
    </AppLayout>
  );
};

export default HomePage;
