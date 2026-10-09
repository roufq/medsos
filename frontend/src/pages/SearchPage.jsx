import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader, Search } from 'lucide-react';
import { socialApi } from '../api/socialApi';
import AppLayout from '../components/modern/AppLayout';
import PostCard from '../components/modern/PostCard';

// Searches post titles/descriptions, #hashtags, locations, and usernames.
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [input, setInput] = useState(query);
  const [tab, setTab] = useState('posts');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setInput(query);
    if (query.trim().length < 2) { setResults(null); return; }
    setResults(null);
    setError('');
    socialApi.search(query.trim()).then(setResults).catch((e) => setError(e.response?.data?.error || 'Pencarian gagal'));
  }, [query]);

  const tabs = [
    { id: 'posts', label: 'Postingan', count: results?.posts?.length },
    { id: 'products', label: 'Produk', count: results?.products?.length },
    { id: 'users', label: 'Akun', count: results?.users?.length },
  ];

  return (
    <AppLayout currentTab="">
      <div className="max-w-[680px] mx-auto flex flex-col gap-4">
        <form onSubmit={(e) => { e.preventDefault(); setParams({ q: input.trim() }); }} className="flex items-center gap-2 rounded-full bg-white border border-border-subtle px-4 py-2">
          <Search className="w-5 h-5 text-outline" />
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Judul, deskripsi, #hashtag, lokasi, @username" className="flex-1 text-sm outline-none" />
          <button type="submit" className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white">Cari</button>
        </form>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t.id ? 'bg-primary text-white' : 'bg-white text-text-secondary'}`}>
              {t.label}{t.count !== undefined && ` (${t.count})`}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        {query && !results && !error && <div className="flex justify-center py-10"><Loader className="animate-spin text-primary" size={32} /></div>}
        {results && tab === 'posts' && results.posts.map((post) => <PostCard key={post.id} post={post} />)}
        {results && tab === 'products' && results.products.map((post) => <PostCard key={post.id} post={post} />)}
        {results && tab === 'users' && results.users.map((u) => (
          <Link key={u.id} to={`/profile/${u.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 hover:shadow-sm">
            <img src={u.avatar_url || '/favicon.svg'} alt="" className="w-11 h-11 rounded-full object-cover" />
            <div><div className="font-bold text-sm">{u.name}</div><div className="text-xs text-text-secondary">@{u.username}{u.location ? ` · ${u.location}` : ''}</div></div>
          </Link>
        ))}
        {results && (results[tab] || []).length === 0 && <div className="bg-white rounded-2xl p-8 text-center text-sm text-text-secondary">Tidak ada hasil untuk “{query}”.</div>}
      </div>
    </AppLayout>
  );
}
