import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { postUrl } from '../utils/postUrl';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Loader, ChevronLeft } from 'lucide-react';
import { postApi } from '../api/postApi';
import AppLayout from '../components/modern/AppLayout';
import PostCard from '../components/modern/PostCard';

export default function PostPage() {
  const { t: translateUI } = useLanguage();

  const params = useParams();
  const id = params.id || params.token;
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const validId = /^[a-f0-9]{32}$/i.test(id || '');
  const [error, setError] = useState(validId ? '' : 'Postingan tidak ditemukan.');
  const userId = user?.id;
  const requestKey = `${id}:${userId || ''}`;
  const [loadedRequest, setLoadedRequest] = useState(requestKey);
  if (loadedRequest !== requestKey) {
    setLoadedRequest(requestKey); setPost(null);
    setError(validId ? '' : 'Postingan tidak ditemukan.');
  }
  useEffect(() => { if (post) document.title = `${post.title || 'Postingan'} · postter.us`; }, [post]);

  useEffect(() => {
    if (!validId) return;
    let active = true;
    postApi.getPost(id, !userId).then(result => { if (active) setPost(result); })
      .catch(e => { if (active) setError(e.response?.data?.error || 'Postingan tidak ditemukan.'); });
    return () => { active = false; };
  }, [id, userId, validId]);

  useEffect(() => {
    if (post?.public_hash && location.pathname !== postUrl(post)) navigate(postUrl(post), { replace: true });
  }, [post, location.pathname, navigate]);

  return (
    <AppLayout currentTab="post">
      <div className="w-full flex flex-col gap-4">
        <button type="button" onClick={() => navigate(-1)} className="self-start flex items-center gap-1 text-sm font-semibold text-text-secondary hover:text-primary"><ChevronLeft className="w-4 h-4" />{translateUI("Kembali")}</button>
        {error && <div className="bg-white rounded-2xl p-10 text-center text-text-secondary">{translateUI(error)}</div>}
        {!post && !error && <div className="flex justify-center py-20"><Loader className="animate-spin text-primary" size={40} /></div>}
        {post && <PostCard post={post} defaultCommentsOpen={Boolean(user)} onDeleted={() => navigate('/')} onUpdated={setPost} />}
      </div>
    </AppLayout>
  );
}
