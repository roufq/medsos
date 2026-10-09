import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, MapPin, Link as LinkIcon, Calendar, LayoutGrid, Rows3, Edit3, Trash2, Lock, Ban, Search, Heart, MessageCircle, Play, Images, Settings } from 'lucide-react';
import { postApi } from '../../api/postApi';
import { userApi } from '../../api/userApi';
import AddPortfolioModal from './AddPortfolioModal';
import PostCard from './PostCard';
import { Modal } from './PostActionModals';

interface ProfileProps {
  user: any;
  posts: any[];
  isCurrentUser: boolean;
  onUserChange: (user: any) => void;
  onPostsChange: (posts: any[]) => void;
}

const errorText = (error: any, fallback: string) => error?.response?.data?.error || fallback;

function FollowListModal({ userId, kind, onClose }: { userId: number; kind: 'followers' | 'following'; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const data = kind === 'followers' ? await userApi.getFollowers(userId, query.trim()) : await userApi.getFollowing(userId, query.trim());
        setUsers(data || []);
        setError('');
      } catch (err) {
        setError(errorText(err, 'Gagal memuat daftar'));
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [userId, kind, query]);
  return (
    <Modal title={kind === 'followers' ? 'Pengikut' : 'Mengikuti'} onClose={onClose}>
      <div className="flex items-center gap-2 rounded-xl border border-border-subtle px-3 py-2 mb-3">
        <Search className="w-4 h-4 text-outline" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau username" className="flex-1 text-sm outline-none" autoFocus />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {loading && <p className="text-xs text-text-secondary">Memuat…</p>}
      {!loading && !error && users.length === 0 && <p className="text-xs text-text-secondary">Tidak ada akun.</p>}
      <div className="flex flex-col gap-1">
        {users.map((u) => (
          <Link key={u.id} to={`/profile/${u.id}`} onClick={onClose} className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface-container-low">
            <img src={u.avatar_url || '/favicon.svg'} alt="" className="w-9 h-9 rounded-full object-cover" />
            <div className="min-w-0"><div className="text-sm font-bold truncate">{u.name}</div><div className="text-xs text-text-secondary truncate">@{u.username}</div></div>
          </Link>
        ))}
      </div>
    </Modal>
  );
}

function GridTile({ post }: { post: any }) {
  const source = post.original_post || post;
  const image = source.media?.find((m: any) => m.media_type === 'image');
  const video = source.media?.find((m: any) => m.media_type === 'video');
  const imageCount = source.media?.filter((m: any) => m.media_type === 'image').length || 0;
  return (
    <Link to={`/post/${post.id}`} className="relative aspect-square rounded-xl overflow-hidden bg-surface-container group">
      {image ? <img src={image.media_url} alt="" loading="lazy" className="w-full h-full object-cover" /> : (
        <div className="w-full h-full p-3 flex flex-col justify-center bg-gradient-to-br from-primary/10 to-secondary-container">
          <div className="text-xs font-bold line-clamp-2">{source.title}</div>
          <div className="text-[11px] text-text-secondary line-clamp-4 mt-1">{source.content}</div>
        </div>
      )}
      {video && <Play className="absolute top-2 right-2 w-5 h-5 text-white drop-shadow" />}
      {imageCount > 1 && <Images className="absolute top-2 right-2 w-5 h-5 text-white drop-shadow" />}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-bold">
        <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-current" />{post.likes_count || 0}</span>
        <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{post.comments_count || 0}</span>
      </div>
    </Link>
  );
}

export default function Profile({ user, posts, isCurrentUser, onUserChange, onPostsChange }: ProfileProps) {
  const navigate = useNavigate();
  const [layout, setLayout] = useState<'grid' | 'long'>(user.profile_layout === 'long' ? 'long' : 'grid');
  const [tab, setTab] = useState<'posts' | 'saved'>('posts');
  const [saved, setSaved] = useState<any[] | null>(null);
  const [followList, setFollowList] = useState<'' | 'followers' | 'following'>('');
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [form, setForm] = useState({ name: '', title: '', company: '', location: '', bio: '', website: '' });
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => { setLayout(user.profile_layout === 'long' ? 'long' : 'grid'); setTab('posts'); setSaved(null); }, [user.id, user.profile_layout]);
  useEffect(() => {
    if (user.profile_locked) return;
    userApi.getPortfolios(user.id).then((data) => setPortfolios(data || [])).catch(() => setPortfolios([]));
  }, [user.id, user.profile_locked]);
  useEffect(() => {
    if (tab === 'saved' && saved === null) userApi.getSavedPosts().then((data) => setSaved(data || [])).catch(() => setSaved([]));
  }, [tab, saved]);

  const updateProfile = async (changes: any) => {
    try {
      const updated = await userApi.updateProfile(changes);
      onUserChange({ ...user, ...updated });
      return true;
    } catch (err) {
      alert(errorText(err, 'Gagal memperbarui profil'));
      return false;
    }
  };

  const uploadImage = async (file: File | undefined, field: 'avatar_url' | 'cover_url') => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await postApi.uploadMedia(file);
      if (res.media_type !== 'image') throw new Error('File harus berupa gambar');
      await updateProfile({ [field]: res.url });
    } catch (err: any) {
      alert(errorText(err, err?.message || 'Gagal mengunggah gambar'));
    } finally {
      setUploading(false);
    }
  };

  const openEdit = () => {
    setForm({ name: user.name || '', title: user.title || '', company: user.company || '', location: user.location || '', bio: user.bio || '', website: user.website || '' });
    setEditOpen(true);
  };

  const toggleFollow = async () => {
    try {
      if (user.follow_status) {
        await userApi.unfollow(user.id);
        onUserChange({ ...user, follow_status: '', is_followed_by_me: false, followers_count: Math.max(0, (user.followers_count || 0) - (user.follow_status === 'accepted' ? 1 : 0)) });
      } else {
        const { status } = await userApi.follow(user.id);
        onUserChange({ ...user, follow_status: status, is_followed_by_me: status === 'accepted', followers_count: (user.followers_count || 0) + (status === 'accepted' ? 1 : 0) });
        if (status === 'accepted' && user.profile_locked) window.location.reload();
      }
    } catch (err) {
      alert(errorText(err, 'Gagal memperbarui status mengikuti'));
    }
  };

  const toggleBlock = async () => {
    try {
      if (user.is_blocked_by_me) {
        await userApi.unblockUser(user.id);
        onUserChange({ ...user, is_blocked_by_me: false });
      } else {
        if (!window.confirm(`Blokir ${user.name}? Kalian akan saling berhenti mengikuti dan tidak bisa melihat postingan satu sama lain.`)) return;
        await userApi.blockUser(user.id);
        onUserChange({ ...user, is_blocked_by_me: true, follow_status: '', is_followed_by_me: false });
        onPostsChange([]);
      }
    } catch (err) {
      alert(errorText(err, 'Gagal memperbarui blokir'));
    }
  };

  const shownPosts = tab === 'saved' ? saved || [] : posts;
  const replace = (post: any) => (tab === 'saved' ? setSaved((list) => (list || []).map((p) => (p.id === post.id ? post : p))) : onPostsChange(posts.map((p) => (p.id === post.id ? post : p))));
  const remove = (id: number) => (tab === 'saved' ? setSaved((list) => (list || []).filter((p) => p.id !== id)) : onPostsChange(posts.filter((p) => p.id !== id)));
  const field = 'w-full border border-border-subtle px-3 py-2 rounded-xl text-sm outline-none focus:border-primary';

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="relative mb-6">
        <div className="h-48 md:h-72 w-full rounded-2xl overflow-hidden relative bg-surface-container">
          {user.cover_url && <img src={user.cover_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
          {isCurrentUser && (
            <button type="button" onClick={() => coverInput.current?.click()} disabled={uploading} className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold flex items-center gap-1 shadow"><Camera className="w-4 h-4" />Ubah header</button>
          )}
          <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0], 'cover_url')} />
        </div>
        <div className="px-4 md:px-8 -mt-14 flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-background bg-background overflow-hidden relative group flex-shrink-0">
              {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary bg-secondary-container">{user.name?.slice(0, 1).toUpperCase()}</div>}
              {isCurrentUser && <button type="button" onClick={() => avatarInput.current?.click()} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100" aria-label="Ubah foto profil"><Camera className="w-6 h-6" /></button>}
              <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0], 'avatar_url')} />
            </div>
            <div className="text-center md:text-left pb-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="font-bold text-2xl md:text-3xl text-text-primary">{user.name}</h2>
                {user.is_private && <Lock className="w-4 h-4 text-text-secondary" aria-label="Akun private" />}
                {isCurrentUser && <button type="button" onClick={openEdit} className="p-1 text-text-secondary hover:text-primary" aria-label="Edit profil"><Edit3 className="w-4 h-4" /></button>}
              </div>
              <p className="text-sm text-text-secondary">@{user.username}{user.title && ` · ${user.title}`}{user.company && ` @ ${user.company}`}</p>
              <div className="flex gap-4 justify-center md:justify-start mt-1 text-sm">
                <span><strong>{posts.length}</strong> postingan</span>
                <button type="button" disabled={user.profile_locked} onClick={() => setFollowList('followers')} className="hover:underline disabled:no-underline"><strong>{user.followers_count || 0}</strong> pengikut</button>
                <button type="button" disabled={user.profile_locked} onClick={() => setFollowList('following')} className="hover:underline disabled:no-underline"><strong>{user.following_count || 0}</strong> mengikuti</button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-center pb-1">
            {isCurrentUser ? (
              <button type="button" onClick={() => navigate('/settings')} className="rounded-full bg-secondary-container px-5 py-2 text-xs font-bold flex items-center gap-1"><Settings className="w-4 h-4" />Pengaturan</button>
            ) : (
              <>
                {!user.is_blocked_by_me && (
                  <button type="button" onClick={toggleFollow} className={`rounded-full px-6 py-2 text-xs font-bold ${user.follow_status === 'accepted' ? 'bg-success text-white' : user.follow_status === 'pending' ? 'bg-surface-container text-text-primary' : 'bg-primary text-white'}`}>
                    {user.follow_status === 'accepted' ? 'Mengikuti' : user.follow_status === 'pending' ? 'Diminta' : 'Ikuti'}
                  </button>
                )}
                {!user.is_blocked_by_me && <button type="button" onClick={() => navigate(`/messages?user_id=${user.id}`)} className="rounded-full bg-secondary-container px-5 py-2 text-xs font-bold">Pesan</button>}
                <button type="button" onClick={toggleBlock} className={`rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1 ${user.is_blocked_by_me ? 'bg-error text-white' : 'bg-surface-container text-error'}`}><Ban className="w-4 h-4" />{user.is_blocked_by_me ? 'Buka blokir' : 'Blokir'}</button>
              </>
            )}
          </div>
        </div>
      </div>

      {user.is_blocked_by_me ? (
        <div className="bg-white rounded-2xl p-10 text-center text-sm text-text-secondary">Anda memblokir akun ini. Buka blokir untuk melihat postingannya.</div>
      ) : user.profile_locked ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          <Lock className="w-10 h-10 mx-auto text-text-secondary mb-3" />
          <p className="font-bold">Akun ini private</p>
          <p className="text-sm text-text-secondary">Ikuti akun ini untuk melihat postingannya{user.follow_status === 'pending' ? ' — permintaan Anda menunggu persetujuan.' : '.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border border-border-subtle/50">
              <h3 className="font-bold mb-3">Tentang</h3>
              {user.bio ? <p className="text-sm text-text-secondary whitespace-pre-wrap mb-3">{user.bio}</p> : <p className="text-xs text-text-secondary mb-3">Belum ada bio.</p>}
              <div className="space-y-2 text-xs text-text-secondary">
                {user.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{user.location}</div>}
                {user.website && <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-primary" /><a href={user.website} target="_blank" rel="noopener noreferrer nofollow" className="text-primary font-semibold hover:underline break-all">{user.website}</a></div>}
                {user.created_at && <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Bergabung {new Date(user.created_at).toLocaleDateString()}</div>}
              </div>
              {(user.interests || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">{user.interests.map((tag: string) => <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{tag}</span>)}</div>
              )}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-border-subtle/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Featured Work</h3>
                {isCurrentUser && <button type="button" onClick={() => setPortfolioOpen(true)} className="text-xs font-bold text-primary">+ Tambah</button>}
              </div>
              {portfolios.length === 0 && <p className="text-xs text-text-secondary">Belum ada karya unggulan.</p>}
              <div className="flex flex-col gap-2">
                {portfolios.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center group">
                    {item.image_url && <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                    <a href={item.link_url || undefined} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0"><div className="text-xs font-bold truncate">{item.title}</div><div className="text-[11px] text-text-secondary truncate">{item.project_type}</div></a>
                    {isCurrentUser && <button type="button" onClick={async () => { if (window.confirm('Hapus karya ini?')) { await userApi.deletePortfolio(item.id); setPortfolios((list) => list.filter((p) => p.id !== item.id)); } }} className="opacity-0 group-hover:opacity-100 text-error" aria-label="Hapus"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1 rounded-xl bg-white p-1 border border-border-subtle/50 text-sm font-bold">
                <button type="button" onClick={() => setTab('posts')} className={`rounded-lg px-4 py-1.5 ${tab === 'posts' ? 'bg-secondary-container text-primary' : 'text-text-secondary'}`}>Postingan</button>
                {isCurrentUser && <button type="button" onClick={() => setTab('saved')} className={`rounded-lg px-4 py-1.5 ${tab === 'saved' ? 'bg-secondary-container text-primary' : 'text-text-secondary'}`}>Tersimpan</button>}
              </div>
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-border-subtle/50">
                <button type="button" onClick={() => setLayout('grid')} className={`p-1.5 rounded-lg ${layout === 'grid' ? 'bg-secondary-container text-primary' : 'text-text-secondary'}`} aria-label="Tampilan grid"><LayoutGrid className="w-4 h-4" /></button>
                <button type="button" onClick={() => setLayout('long')} className={`p-1.5 rounded-lg ${layout === 'long' ? 'bg-secondary-container text-primary' : 'text-text-secondary'}`} aria-label="Tampilan long card"><Rows3 className="w-4 h-4" /></button>
              </div>
            </div>
            {tab === 'saved' && saved === null && <p className="text-sm text-text-secondary">Memuat…</p>}
            {shownPosts.length === 0 && (tab === 'posts' || saved !== null) && <div className="bg-white rounded-2xl p-8 text-center text-sm text-text-secondary">{tab === 'saved' ? 'Belum ada postingan tersimpan.' : 'Belum ada postingan.'}</div>}
            {layout === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{shownPosts.map((post) => <GridTile key={post.id} post={post} />)}</div>
            ) : (
              <div className="flex flex-col gap-4">{shownPosts.map((post) => <PostCard key={post.id} post={post} onUpdated={replace} onDeleted={remove} />)}</div>
            )}
          </div>
        </div>
      )}

      {followList && <FollowListModal userId={user.id} kind={followList} onClose={() => setFollowList('')} />}

      {editOpen && (
        <Modal title="Edit profil" onClose={() => setEditOpen(false)}>
          <div className="flex flex-col gap-3">
            {([['name', 'Nama lengkap'], ['title', 'Jabatan / peran'], ['company', 'Perusahaan'], ['location', 'Lokasi'], ['website', 'Website (https://…)']] as const).map(([key, label]) => (
              <label key={key} className="text-xs font-semibold flex flex-col gap-1">{label}<input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={field} /></label>
            ))}
            <label className="text-xs font-semibold flex flex-col gap-1">Bio<textarea value={form.bio} maxLength={500} rows={3} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={field} /><span className="text-right text-[10px] text-text-secondary">{form.bio.length}/500</span></label>
            <button type="button" onClick={async () => { if (await updateProfile(form)) setEditOpen(false); }} className="rounded-full bg-primary py-2 text-sm font-bold text-white">Simpan</button>
          </div>
        </Modal>
      )}

      <AddPortfolioModal isOpen={portfolioOpen} onClose={() => setPortfolioOpen(false)} onSuccess={(item: any) => userApi.createPortfolio(item).then((saved) => setPortfolios((list) => [saved, ...list])).catch((e) => alert(errorText(e, 'Gagal menyimpan')))} />
    </div>
  );
}
