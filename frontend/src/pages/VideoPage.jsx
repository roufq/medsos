import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Play, ArrowRight, Loader2, Users, Film } from 'lucide-react';
import AppLayout from '../components/modern/AppLayout';
import PostCard from '../components/modern/PostCard';
import VideoPlayer, { watchUrl } from '../components/modern/VideoPlayer';
import { postApi } from '../api/postApi';
import { networkApi } from '../api/networkApi';
import { userApi } from '../api/userApi';
import { profileUrl } from '../utils/profileUrl';
import { timeAgo } from '../utils/postFormat';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
const SIZE = 20;
export default function VideoPage() {
  const { t } = useLanguage(); const { user } = useAuth(); const { token } = useParams(); const navigate = useNavigate(); const route = useLocation();
  const [filter, setFilter] = useState('all'); const [posts, setPosts] = useState([]); const [related, setRelated] = useState([]);
  const [watching, setWatching] = useState(null); const [loading, setLoading] = useState(true); const [more, setMore] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [channels, setChannels] = useState([]);
  useEffect(() => {
    let active = true; setLoading(true); setError(''); setWatching(null);
    const kind = filter === 'all' ? 'video' : filter;
    const load = async () => {
      try {
        if (token) {
          const post = await postApi.getPost(token);
          if (!post.media?.some((item) => item.media_type === 'video')) throw new Error(t('Video tidak ditemukan.'));
          if (active) { setWatching(post); if (String(token) !== post.public_hash && post.public_hash) navigate(watchUrl(post), { replace: true }); }
        }
        const data = await postApi.getFeed(SIZE, 0, null, null, token ? 'video' : kind);
        if (active) { setPosts(data || []); setMore((data || []).length === SIZE); }
        if (!token && kind !== 'video') { const videos = await postApi.getFeed(SIZE, 0, null, null, 'video'); if (active) setRelated(videos || []); }
        else if (active) setRelated(data || []);
      } catch (err) { if (active) setError(err.response?.data?.error || err.message || t('Gagal memuat video.')); }
      finally { if (active) setLoading(false); }
    }; load(); return () => { active = false; };
  }, [token, filter]);
  useEffect(() => { let active = true; networkApi.getSuggestions().then((data) => { if (active) setChannels((data || []).slice(0, 5)); }).catch(() => {}); return () => { active = false; }; }, []);
  const ranking = useMemo(() => [...related].filter((post) => String(post.public_hash || post.id) !== String(token)).sort((a,b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, token ? 8 : 5), [related, token]);
  const update = (post) => { setPosts((current) => current.map((item) => item.id === post.id ? post : item)); if (watching?.id === post.id) setWatching(post); };
  const loadMore = async () => { if (busy || !posts.length) return; setBusy(true); try { const data = await postApi.getFeed(SIZE, 0, null, posts[posts.length-1].id, filter === 'all' ? 'video' : filter); setPosts((current) => [...current,...(data || []).filter((item)=>!current.some((old)=>old.id===item.id))]); setMore((data || []).length===SIZE); } catch { setError(t('Gagal memuat video.')); } finally { setBusy(false); } };
  return <AppLayout wide currentTab="videos"><div className="video-dashboard"><div className="video-main">
    {!token && <nav className="video-filters" aria-label={t('Filter video')}>{[['all','Semua'],['video','Video'],['image','Gambar'],['poster','Poster'],['link','Tautan'],['location','Lokasi'],['shop','Shop']].map(([key,label])=><button key={key} className={filter===key?'active':''} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{t(label)}</button>)}</nav>}
    {loading && <div className="video-loading"><Loader2 className="animate-spin" size={30}/></div>}{error && <p role="alert" className="video-error">{error}</p>}
    {token && watching && <div className="video-watch"><VideoPlayer post={watching} autoplay={Boolean(route.state?.autoplay)}/><div className="video-watch-info"><div className="video-watch-channel"><Link to={profileUrl(watching.user)}>{t('Lihat profil')}</Link>{watching.user_id!==user?.id && <button onClick={async()=>{try{if(watching.user?.is_followed_by_me){await userApi.unfollow(watching.user_id)}else{await userApi.follow(watching.user_id)}setWatching((current)=>({...current,user:{...current.user,is_followed_by_me:!current.user?.is_followed_by_me}}))}catch{setError(t('Gagal mengikuti akun.'))}}}>{t(watching.user?.is_followed_by_me?'Mengikuti':'Ikuti')}</button>}</div><PostCard post={watching} hideMedia defaultCommentsOpen onUpdated={update} onDeleted={()=>navigate('/videos')}/></div></div>}
    {!token && !loading && !posts.length && !error && <div className="video-empty"><Film size={36}/><p>{t('Belum ada video.')}</p></div>}
    {!token && posts.map((post)=><div key={post.id} className="video-feed-card"><VideoPlayer post={post} preview/><div className="video-feed-info"><PostCard post={post} hideMedia onUpdated={update} onDeleted={(id)=>setPosts((current)=>current.filter((item)=>item.id!==id))}/></div></div>)}
    {!token && more && <button className="video-load-more" disabled={busy} onClick={loadMore}>{busy&&<Loader2 size={16} className="animate-spin"/>}{t('Muat lebih banyak')}</button>}
  </div><aside className="video-side"><section className="video-panel"><div className="video-panel-heading"><h2>{t(token?'Video Terkait':'Video Trending')}</h2><Link to="/videos">{t('Lihat Semua')}<ArrowRight size={14}/></Link></div>{ranking.map((post,index)=><div key={post.id} className="video-related-row">{!token&&<span className="video-rank">{index+1}</span>}<div className="video-related-thumb"><VideoPlayer post={post} preview/></div><div><Link to={watchUrl(post)}><h3>{post.title}</h3></Link><p>{post.user?.name}</p><small>{post.views_count||0} views ? {timeAgo(post.created_at)}</small></div></div>)}{!ranking.length&&<p className="video-side-empty">{t('Belum ada video.')}</p>}</section>
    {!token && <section className="video-panel"><div className="video-panel-heading"><h2>{t('Channel Populer')}</h2><Link to="/network">{t('Lihat Semua')}<ArrowRight size={14}/></Link></div>{channels.map((channel)=><div key={channel.id} className="video-channel"><Link to={profileUrl(channel)} className="video-channel-avatar">{channel.avatar_url?<img src={channel.avatar_url} alt=""/>:<Users size={20}/>}</Link><div><Link to={profileUrl(channel)}>{channel.name}</Link><small>{channel.followers_count||0} {t('Followers')}</small></div><button disabled={channel.pending} onClick={async()=>{setChannels((list)=>list.map((item)=>item.id===channel.id?{...item,pending:true}:item));try{if(channel.followed){await userApi.unfollow(channel.id)}else{await userApi.follow(channel.id)}setChannels((list)=>list.map((item)=>item.id===channel.id?{...item,followed:!item.followed,pending:false}:item))}catch{setChannels((list)=>list.map((item)=>item.id===channel.id?{...item,pending:false}:item));setError(t('Gagal mengikuti akun.'))}}}>{t(channel.followed?'Mengikuti':'Ikuti')}</button></div>)}</section>}
    <div className="video-discover"><strong>{t('Jelajahi Dunia dengan Postinganmu')}</strong><p>{t('Bagikan momen terbaikmu di seluruh dunia.')}</p><Link to="/network">{t('Mulai Sekarang')}<ArrowRight size={14}/></Link></div>
  </aside></div></AppLayout>;
}
