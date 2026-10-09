import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { userApi } from '../api/userApi';
import AppLayout from '../components/modern/AppLayout';
import PostCard from '../components/modern/PostCard';

export default function SavedPage() {
  const [posts, setPosts] = useState(null);
  useEffect(() => { userApi.getSavedPosts().then((data) => setPosts(data || [])).catch(() => setPosts([])); }, []);

  // Unsaving from this page removes the post from the list.
  const handleUpdated = (post) => setPosts((list) => (post.is_saved_by_me ? list.map((p) => (p.id === post.id ? post : p)) : list.filter((p) => p.id !== post.id)));

  return (
    <AppLayout currentTab="saved">
      <div className="max-w-[680px] mx-auto flex flex-col gap-4">
        <h1 className="text-xl font-bold">Postingan tersimpan</h1>
        {posts === null && <div className="flex justify-center py-10"><Loader className="animate-spin text-primary" size={32} /></div>}
        {posts?.length === 0 && <div className="bg-white rounded-2xl p-8 text-center text-sm text-text-secondary">Belum ada postingan tersimpan. Gunakan tombol Simpan pada postingan mana pun.</div>}
        {posts?.map((post) => <PostCard key={post.id} post={post} onUpdated={handleUpdated} onDeleted={(id) => setPosts((list) => list.filter((p) => p.id !== id))} />)}
      </div>
    </AppLayout>
  );
}
