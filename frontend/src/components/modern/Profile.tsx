import { postUrl } from '../../utils/postUrl';
import { useLanguage } from "../../context/LanguageContext";import { profileUrl } from '../../utils/profileUrl';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, MapPin, Link as LinkIcon, Calendar, LayoutGrid, Rows3, Edit3, Trash2, Lock, Ban, Search, Heart, MessageCircle, Play, Images, Settings, Eye, Flame, ArrowRight, ChevronLeft, ChevronRight, MoreHorizontal, FileText, ShoppingBag } from 'lucide-react';
import { RichText, timeAgo } from '../../utils/postFormat';
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

function FollowListModal({ userId, kind, onClose }: {userId: number;kind: 'followers' | 'following';onClose: () => void;}) {const { t } = useLanguage();
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
    <Modal title={kind === 'followers' ? t("Pengikut") : t("Mengikuti")} onClose={onClose}>
      <div className="flex items-center gap-2 rounded-xl border border-border-subtle px-3 py-2 mb-3">
        <Search className="w-4 h-4 text-outline" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau username" className="flex-1 text-sm outline-none" autoFocus />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {loading && <p className="text-xs text-text-secondary">Memuat…</p>}
      {!loading && !error && users.length === 0 && <p className="text-xs text-text-secondary">Tidak ada akun.</p>}
      <div className="flex flex-col gap-1">
        {users.map((u) =>
        <Link key={u.id} to={profileUrl(u)} onClick={onClose} className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface-container-low">
            <img src={u.avatar_url || '/favicon.svg'} alt="" className="w-9 h-9 rounded-full object-cover" />
            <div className="min-w-0"><div className="text-sm font-bold truncate">{u.name}</div><div className="text-xs text-text-secondary truncate">@{u.username}</div></div>
          </Link>
        )}
      </div>
    </Modal>);

}

function ProfileMedia({ post, compact = false }: {post: any;compact?: boolean;}) {
  const source = post.original_post || post;
  const image = source.media?.find((m: any) => m.media_type === 'image');
  const video = source.media?.find((m: any) => m.media_type === 'video');
  const thumbnail = image?.media_url || video?.thumbnail_url || source.link?.image_url;
  return <div className={`profile-card-media ${compact ? 'compact' : ''}`}>
    {thumbnail ? <img src={thumbnail} alt="" loading="lazy" /> : video ? <video src={video.media_url} preload="metadata" muted playsInline /> : <div className="profile-media-placeholder"><FileText size={28} /></div>}
    {video && <span className="profile-play"><Play size={22} fill="currentColor" /></span>}
    {video?.duration_seconds > 0 && <span className="profile-duration">{Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}</span>}
    {source.post_type === 'shop' && <span className="profile-shop-badge"><ShoppingBag size={11} />Shop</span>}
  </div>;
}
function GridTile({ post }: {post: any;}) {const { t } = useLanguage();
  const source = post.original_post || post;
  return <Link to={postUrl(post)} className="profile-grid-card">
    <ProfileMedia post={post} />
    <div className="profile-grid-copy"><h3>{source.title || t("Postingan")}</h3><p>{source.content || ''}</p>{source.location && <span className="profile-card-location"><MapPin size={11} />{source.location}</span>}<div className="profile-card-tags">{(source.hashtags || []).slice(0, 4).map((tag: any) => <span key={tag.tag}>#{tag.tag} </span>)}</div></div>
    <div className="profile-grid-stats"><span><Heart size={12} fill={post.is_liked_by_me ? 'currentColor' : 'none'} />{post.likes_count || 0}</span><span><Eye size={12} />{post.views_count || 0}</span><time>{timeAgo(post.created_at)}</time></div>
  </Link>;
}

export default function Profile({ user, posts, isCurrentUser, onUserChange, onPostsChange }: ProfileProps) {const { t } = useLanguage();
  const navigate = useNavigate();
  const [layout, setLayout] = useState<'grid' | 'long'>(user.profile_layout === 'long' ? 'long' : 'grid');
  const [tab, setTab] = useState<'posts' | 'reels' | 'tagged' | 'shop' | 'location' | 'saved'>('posts');
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState<any[] | null>(null);
  const [followList, setFollowList] = useState<'' | 'followers' | 'following'>('');
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [form, setForm] = useState({ name: '', title: '', company: '', location: '', bio: '', website: '' });
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {setLayout(user.profile_layout === 'long' ? 'long' : 'grid');}, [user.id, user.profile_layout]);
  useEffect(() => {setTab('posts');setSaved(null);setMenuOpen(false);}, [user.id]);
  useEffect(() => {
    setPortfolios([]);
    if (user.profile_locked || user.is_blocked_by_me) return;
    userApi.getPortfolios(user.id).then((data) => setPortfolios(data || [])).catch(() => setPortfolios([]));
  }, [user.id, user.profile_locked, user.is_blocked_by_me]);
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

  const shownPosts = useMemo(() => {
    if (tab === 'saved') return saved || [];
    if (tab === 'reels') return posts.filter((p) => (p.original_post || p).media?.some((m: any) => m.media_type === 'video'));
    if (tab === 'shop') return posts.filter((p) => (p.original_post || p).post_type === 'shop');
    if (tab === 'location') return posts.filter((p) => (p.original_post || p).location);
    if (tab === 'tagged') return posts.filter((p) => (p.mentions || []).some((m: any) => String(m.mentioned_user_id || m.user?.id) === String(user.id)));
    return posts;
  }, [tab, saved, posts, user.id]);
  useEffect(() => {setPage(1);}, [tab, user.id]);
  const pages = Math.max(1, Math.ceil(shownPosts.length / 9));
  const currentPage = Math.min(page, pages);
  const pagePosts = shownPosts.slice((currentPage - 1) * 9, currentPage * 9);
  const latest = useMemo(() => [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5), [posts]);
  const trending = useMemo(() => {
    const groups = new Map<string, {title: string;post: any;count: number;score: number;}>();
    posts.forEach((post) => {
      const source = post.original_post || post;
      const title = source.location || source.hashtags?.[0]?.tag;
      if (!title) return;
      const item = groups.get(title) || { title, post, count: 0, score: 0 };
      item.count++;item.score += (post.likes_count || 0) + (post.views_count || 0);
      groups.set(title, item);
    });
    return [...groups.values()].sort((a, b) => b.score - a.score).slice(0, 4);
  }, [posts]);
  const chooseLayout = async (next: 'grid' | 'long') => {
    setLayout(next);
    if (isCurrentUser) {
      try {const updated = await userApi.updateSettings({ profile_layout: next });onUserChange({ ...user, ...updated });}
      catch {/* Local layout remains available when preferences cannot be saved. */}
    }
  };
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
  const totalViews = posts.reduce((sum, post) => sum + (post.views_count || 0), 0);
  const replace = (post: any) => tab === 'saved' ? setSaved((list) => (list || []).map((p) => p.id === post.id ? post : p)) : onPostsChange(posts.map((p) => p.id === post.id ? post : p));
  const remove = (id: number) => tab === 'saved' ? setSaved((list) => (list || []).filter((p) => p.id !== id)) : onPostsChange(posts.filter((p) => p.id !== id));
  const field = 'w-full border border-border-subtle px-3 py-2 rounded-xl text-sm outline-none focus:border-primary';

  return (
    <div className="profile-dashboard">
      <div className="profile-main-column">
        <section className="profile-summary">
          <div className="profile-identity"><div className="profile-avatar">
            {user.avatar_url ? <img src={user.avatar_url} alt={user.name} /> : <span>{user.name?.slice(0, 1).toUpperCase()}</span>}
            {isCurrentUser && <button type="button" disabled={uploading} onClick={() => avatarInput.current?.click()} aria-label="Ubah foto profil"><Camera size={18} /></button>}
            <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0], 'avatar_url')} />
          </div><div><h2>{user.name}{user.is_private && <Lock size={13} aria-label="Akun private" />}</h2><p>@{user.username || 'user'}</p><p className="profile-bio">{user.bio || user.title || t("Belum ada bio.")}</p>{user.website && <a href={user.website} target="_blank" rel="noopener noreferrer nofollow"><LinkIcon size={12} />{user.website.replace(/^https?:\/\//, '')}</a>}</div></div>
          <div className="profile-summary-right"><div className="profile-summary-top"><div className="profile-numbers"><span>Post<strong>{posts.length}</strong></span><button disabled={user.profile_locked} onClick={() => setFollowList('followers')}>{t("Followers")}<strong>{user.followers_count || 0}</strong></button><button disabled={user.profile_locked} onClick={() => setFollowList('following')}>{t("Following")}<strong>{user.following_count || 0}</strong></button></div>
            {isCurrentUser ? <button className="profile-primary" onClick={openEdit}>{t("Edit Profile")}</button> : !user.is_blocked_by_me && <button className="profile-primary" onClick={toggleFollow}>{user.follow_status === 'accepted' ? t("Mengikuti") : user.follow_status === 'pending' ? t("Diminta") : t("Ikuti")}</button>}
            <div className="profile-options"><button aria-label="Menu profil" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={20} /></button>{menuOpen && <div className="profile-options-menu">{isCurrentUser ? <><button onClick={() => navigate('/settings')}><Settings size={15} />{t("Pengaturan")}</button><button onClick={() => coverInput.current?.click()} disabled={uploading}><Camera size={15} />Ubah gambar sampul</button><button onClick={() => {setPortfolioOpen(true);setMenuOpen(false);}}>Tambah karya</button></> : <><button onClick={() => navigate(`/messages?user_id=${user.id}`)}>{t("Pesan")}</button><button onClick={toggleBlock}><Ban size={15} />{user.is_blocked_by_me ? t("Buka blokir") : t("Blokir")}</button></>}</div>}</div>
          </div><div className="profile-engagement"><span><Heart size={22} /><div>{totalLikes.toLocaleString()}<small>{t("Likes")}</small></div></span><span><Eye size={22} /><div>{totalViews.toLocaleString()}<small>Views</small></div></span></div></div>
          <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0], 'cover_url')} />
        </section>
        {user.is_blocked_by_me || user.profile_locked ? <section className="profile-post-panel profile-empty"><Lock size={28} /><h3>{user.is_blocked_by_me ? 'Anda memblokir akun ini' : 'Akun ini private'}</h3><p>{user.is_blocked_by_me ? 'Buka blokir untuk melihat postingannya.' : 'Ikuti akun ini untuk melihat postingannya.'}</p></section> : <section className="profile-post-panel">
          <div className="profile-toolbar"><div className="profile-tabs" aria-label="Jenis postingan">{[['posts', t("Posts")], ['reels', 'Reels'], ['tagged', 'Tagged'], ['shop', 'Shop'], ['location', t("Location")], ...(isCurrentUser ? [['saved', t("Tersimpan")]] : [])].map(([id, label]) => <button key={id} onClick={() => setTab(id as typeof tab)} className={tab === id ? 'active' : ''} aria-pressed={tab === id}>{label}</button>)}</div><div className="profile-layout-buttons"><button className={layout === 'grid' ? 'active' : ''} aria-label={t("Tampilan grid")} aria-pressed={layout === 'grid'} onClick={() => chooseLayout('grid')}><LayoutGrid size={13} />Grid</button><button className={layout === 'long' ? 'active' : ''} aria-label={t("Tampilan list")} aria-pressed={layout === 'long'} onClick={() => chooseLayout('long')}><Rows3 size={13} />List</button></div></div>
          {shownPosts.length === 0 && <div className="profile-empty"><FileText size={32} /><p>{tab === 'saved' && saved === null ? 'Memuat postingan tersimpan...' : 'Belum ada postingan untuk kategori ini.'}</p></div>}
          {layout === 'grid' ? <div className="profile-post-grid">{pagePosts.map((post) => <GridTile key={post.id} post={post} />)}</div> : <div className="profile-post-list">{pagePosts.map((post) => <PostCard key={post.id} post={post} onUpdated={replace} onDeleted={remove} />)}</div>}
          {pages > 1 && <nav className="profile-pagination" aria-label="Halaman postingan"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label={t("Halaman sebelumnya")}><ChevronLeft size={14} /></button>{Array.from({ length: pages }, (_, index) => <button key={index} className={currentPage === index + 1 ? 'active' : ''} onClick={() => setPage(index + 1)} aria-current={currentPage === index + 1 ? 'page' : undefined}>{index + 1}</button>)}<button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)} aria-label={t("Halaman berikutnya")}><ChevronRight size={14} /></button></nav>}
        </section>}
        {!user.profile_locked && !user.is_blocked_by_me && portfolios.length > 0 && <details className="profile-portfolio"><summary>Karya unggulan ({portfolios.length})</summary>{portfolios.map((item) => <div key={item.id}><a href={item.link_url || undefined} target="_blank" rel="noopener noreferrer">{item.title}</a>{isCurrentUser && <button aria-label="Hapus karya" onClick={async () => {if (window.confirm('Hapus karya ini?')) {await userApi.deletePortfolio(item.id);setPortfolios((list) => list.filter((p) => p.id !== item.id));}}}><Trash2 size={14} /></button>}</div>)}</details>}
      </div>
      {!user.profile_locked && !user.is_blocked_by_me && <aside className="profile-right-column"><section className="profile-side-panel"><div className="profile-panel-heading"><h3><FileText size={15} />{t("Postingan Terbaru")}</h3><button onClick={() => {setTab('posts');setPage(1);chooseLayout('long');}}>{t("Lihat Semua")}<ArrowRight size={13} /></button></div><div className="profile-latest">{latest.map((post) => <Link key={post.id} to={postUrl(post)} className="profile-latest-row"><ProfileMedia post={post} compact /><div className="profile-latest-copy"><div className="profile-latest-author">{user.avatar_url ? <img src={user.avatar_url} alt="" /> : <span>{user.name?.slice(0, 1)}</span>}<div>{user.name}<small>{timeAgo(post.created_at)}</small></div></div><h4>{post.title || t("Postingan")}</h4><p>{post.content}</p>{post.location && <span className="profile-card-location"><MapPin size={11} />{post.location}</span>}<div className="profile-latest-stats"><span><Heart size={14} />{post.likes_count || 0}</span><span><Eye size={14} />{post.views_count || 0}</span></div></div></Link>)}{!latest.length && <p className="profile-side-empty">Belum ada postingan terbaru.</p>}</div></section>
        <section className="profile-side-panel"><div className="profile-panel-heading"><h3><Flame size={16} />Trending</h3><Link to="/search">{t("Lihat Semua")}<ArrowRight size={13} /></Link></div><div className="profile-trending">{trending.map((item, index) => <Link key={item.title} to={`/search?q=${encodeURIComponent(item.title)}`}><div><ProfileMedia post={item.post} compact /><span className="profile-trending-rank">{index + 1}</span></div><h4>{item.title}</h4><p>{item.count} posts</p></Link>)}</div>{!trending.length && <p className="profile-side-empty">Lokasi dan hashtag dari postingan akan muncul di sini.</p>}</section>
      </aside>}
      {followList && <FollowListModal userId={user.id} kind={followList} onClose={() => setFollowList('')} />}

      {editOpen &&
      <Modal title={t("Edit profil")} onClose={() => setEditOpen(false)}>
          <div className="flex flex-col gap-3">
            {([['name', t("Nama lengkap")], ['title', t("Jabatan / peran")], ['company', t("Perusahaan")], ['location', t("Lokasi")], ['website', 'Website (https://…)']] as const).map(([key, label]) =>
          <label key={key} className="text-xs font-semibold flex flex-col gap-1">{label}<input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={field} /></label>
          )}
            <label className="text-xs font-semibold flex flex-col gap-1">{t("Bio")}<textarea value={form.bio} maxLength={500} rows={3} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={field} /><span className="text-right text-[10px] text-text-secondary">{form.bio.length}/500</span></label>
            <button type="button" onClick={async () => {if (await updateProfile(form)) setEditOpen(false);}} className="rounded-full bg-primary py-2 text-sm font-bold text-white">{t("Simpan")}</button>
          </div>
        </Modal>
      }

      <AddPortfolioModal isOpen={portfolioOpen} onClose={() => setPortfolioOpen(false)} onSuccess={(item: any) => userApi.createPortfolio(item).then((saved) => setPortfolios((list) => [saved, ...list])).catch((e) => alert(errorText(e, 'Gagal menyimpan')))} />
    </div>);

}
