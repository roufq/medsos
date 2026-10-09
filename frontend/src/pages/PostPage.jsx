import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader, ChevronLeft } from 'lucide-react';
import { postApi } from '../api/postApi';
import AppLayout from '../components/modern/AppLayout';
import PostCard from '../components/modern/PostCard';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPost(null);
    setError('');
    postApi.getPost(id).then(setPost).catch((e) => setError(e.response?.data?.error || 'Postingan tidak ditemukan.'));
  }, [id]);

  return (
    <AppLayout currentTab="">
      <div className="max-w-[680px] mx-auto flex flex-col gap-4">
        <button type="button" onClick={() => navigate(-1)} className="self-start flex items-center gap-1 text-sm font-semibold text-text-secondary hover:text-primary"><ChevronLeft className="w-4 h-4" />Kembali</button>
        {error && <div className="bg-white rounded-2xl p-10 text-center text-text-secondary">{error}</div>}
        {!post && !error && <div className="flex justify-center py-20"><Loader className="animate-spin text-primary" size={40} /></div>}
        {post && <PostCard post={post} defaultCommentsOpen onDeleted={() => navigate('/')} onUpdated={setPost} />}
      </div>
    </AppLayout>
  );
}
