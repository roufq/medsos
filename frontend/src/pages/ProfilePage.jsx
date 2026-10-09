import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { postApi } from '../api/postApi';
import AppLayout from '../components/modern/AppLayout';
import Profile from '../components/modern/Profile';

const ProfilePage = () => {
  // /profile/:id or /u/:username (mention links)
  const { id, username } = useParams();
  const key = id || username;
  const { user: authUser, updateProfileState } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const user = await userApi.getProfile(key);
        if (!active) return;
        setProfileUser(user);
        const userPosts = user.profile_locked || user.is_blocked_by_me ? [] : await postApi.getFeed(50, 0, user.id);
        if (active) setPosts(userPosts || []);
      } catch (e) {
        if (active) {
          setProfileUser(null);
          setError(e.response?.data?.error || 'Profil tidak ditemukan.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [key]);

  const isCurrentUser = profileUser?.id === authUser?.id;

  const handleUserChange = (updated) => {
    setProfileUser(updated);
    if (isCurrentUser) updateProfileState({ ...authUser, ...updated });
  };

  const handlePostCreated = (post) => {
    if (isCurrentUser) setPosts((current) => [post, ...current]);
  };

  return (
    <AppLayout currentTab={isCurrentUser ? 'profile' : ''} onPostCreated={handlePostCreated}>
      {loading ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-primary" size={40} /></div>
      ) : !profileUser ? (
        <div className="bg-white rounded-2xl p-10 text-center text-text-secondary font-semibold">{error}</div>
      ) : (
        <Profile user={profileUser} posts={posts} isCurrentUser={isCurrentUser} onUserChange={handleUserChange} onPostsChange={setPosts} />
      )}
    </AppLayout>
  );
};

export default ProfilePage;
