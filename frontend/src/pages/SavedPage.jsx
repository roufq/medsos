import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader } from 'lucide-react';
import { userApi } from '../api/userApi';
import AppLayout from '../components/modern/AppLayout';
import PostCard from '../components/modern/PostCard';

export default function SavedPage() {
  const { t: translateUI } = useLanguage();

  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestVersion = useRef(0);
  const loadPosts = useCallback(() => {
    const version = ++requestVersion.current;
    return userApi.getSavedPosts().then(data => {
      if (version === requestVersion.current) setPosts(data || []);
    }).catch(e => {
      if (version === requestVersion.current) setError(e.response?.data?.error || 'Gagal memuat postingan tersimpan.');
    }).finally(() => {
      if (version === requestVersion.current) setLoading(false);
    });
  }, []);
  useEffect(() => {
    const requests = requestVersion;
    loadPosts();
    return () => { requests.current++; };
  }, [loadPosts]);
  const retry = () => { setLoading(true); setError(''); loadPosts(); };

  // Unsaving from this page removes the post from the list.
  const handleUpdated = (post) => setPosts((list) => (post.is_saved_by_me ? list.map((p) => (p.id === post.id ? post : p)) : list.filter((p) => p.id !== post.id)));

  return (
    <AppLayout currentTab="saved">
      <div className="w-full flex flex-col gap-4">
        <h1 className="text-xl font-bold">{translateUI("Postingan tersimpan")}</h1>
        {error && <div role="alert" className="rounded-xl bg-error/10 p-4 text-sm text-error"><p>{translateUI(error)}</p><button type="button" disabled={loading} onClick={retry} className="mt-2 underline">{translateUI("Coba lagi")}</button></div>}
        {loading && <div className="flex justify-center py-10"><Loader className="animate-spin text-primary" size={32} /></div>}
        {!loading && !error && posts?.length === 0 && <div className="bg-white rounded-2xl p-8 text-center text-sm text-text-secondary">{translateUI("Belum ada postingan tersimpan. Gunakan tombol Simpan pada postingan mana pun.")}</div>}
        {posts?.map((post) => <PostCard key={post.id} post={post} onUpdated={handleUpdated} onDeleted={(id) => setPosts((list) => list.filter((p) => p.id !== id))} />)}
      </div>
    </AppLayout>
  );
}
