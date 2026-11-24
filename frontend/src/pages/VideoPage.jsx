import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowRight, Loader2, Film, Play } from 'lucide-react';
import VerifiedBadge from '../components/common/VerifiedBadge';
import AppLayout from '../components/modern/AppLayout';
import PostCard from '../components/modern/PostCard';
import VideoPlayer from '../components/modern/VideoPlayer';
import { watchUrl } from '../utils/postUrl';
import { uniquePosts } from '../utils/discovery';
import { postApi } from '../api/postApi';
import { profileUrl } from '../utils/profileUrl';
import { timeAgo } from '../utils/postFormat';
import { useLanguage } from '../context/LanguageContext';
const SIZE = 20;

export default function VideoPage() {
  const { t, language } = useLanguage(), { token } = useParams();
  const navigate = useNavigate(), route = useLocation();
  const [posts,setPosts] = useState([]), [shorts,setShorts] = useState([]), [watching,setWatching] = useState(null);
  const [loading,setLoading] = useState(true), [busy,setBusy] = useState(false), [more,setMore] = useState(false), [error,setError] = useState(''), [topic,setTopic] = useState('all');
  const requestKey = JSON.stringify([token,language]);
  const [loadedRequest,setLoadedRequest] = useState(requestKey);
  if (loadedRequest!==requestKey) {setLoadedRequest(requestKey);setLoading(true);setError('');setWatching(null);setPosts([]);setShorts([]);setMore(false);setTopic('all');}
  useEffect(()=>{
    let active=true;
    const load=async()=>{
      try {
        if(token){
          if(!/^[a-f0-9]{32}$/i.test(token))throw new Error('Video tidak ditemukan.');
          const [post, data] = await Promise.all([
            postApi.getPost(token),
            postApi.getFeed(SIZE,0,null,null,'video'),
          ]);
          if(!post.media?.some(item=>item.media_type==='video'))throw new Error('Video tidak ditemukan.');
          if(active){setWatching(post);setPosts(data || []);setMore((data || []).length===SIZE);}
        } else {
          const [data, shortPosts] = await Promise.all([
            postApi.getFeed(SIZE,0,null,null,'video'),
            postApi.getFeed(SIZE,0,null,null,'shorts'),
          ]);
          if(active){setPosts(data || []);setMore((data || []).length===SIZE);setShorts(shortPosts || []);}
        }
      }catch(e){if(active)setError(e.response?.data?.error || e.message || 'Gagal memuat video.');}
      finally{if(active)setLoading(false);}
    };
    load();return()=>{active=false;};
  },[token,language]);
  const topics = useMemo(() => [...new Set(posts.flatMap(post=>(post.hashtags || []).map(item=>item.tag)))].slice(0,10), [posts]);
  const videos = useMemo(() => posts.filter(post=>post.media?.some(item=>item.media_type==='video') && (topic==='all' || post.hashtags?.some(item=>item.tag===topic))), [posts, topic]);
  const featured = useMemo(() => token?watching:videos.find(post=>post.media?.some(item=>item.media_type==='video' && !item.is_short)) || videos[0], [token, watching, videos]);
  const recommended = useMemo(() => [...videos].filter(post=>post.id!==featured?.id).sort((a,b)=>(b.views_count || 0)-(a.views_count || 0)), [videos, featured?.id]);
  const shortVideos = useMemo(() => uniquePosts([...shorts,...posts]).filter(post=>post.media?.some(item=>item.media_type==='video' && item.is_short)), [shorts, posts]);
  const update=post=>{setPosts(current=>current.map(item=>item.id===post.id?post:item));setShorts(current=>current.map(item=>item.id===post.id?post:item));if(watching?.id===post.id)setWatching(post);};
  const remove=id=>{setPosts(current=>current.filter(post=>post.id!==id));setShorts(current=>current.filter(post=>post.id!==id));if(token)navigate('/videos');};
  const number=value=>new Intl.NumberFormat(language==='en'?'en-US':'id-ID',{notation:'compact',maximumFractionDigits:1}).format(value || 0);
  const loadMore=async()=>{
    if(busy || !posts.length)return;setBusy(true);setError('');
    try{const data=await postApi.getFeed(SIZE,0,null,posts.at(-1).id,'video');setPosts(current=>uniquePosts([...current,...(data || [])]));setMore((data || []).length===SIZE);}
    catch(e){setError(e.response?.data?.error || 'Gagal memuat video.');}finally{setBusy(false);}
  };
  const card=(post,short=false)=><article key={post.id} className={short?'video-reference-short':'video-reference-card'}><VideoPlayer post={post} preview/><Link to={watchUrl(post)}><h3>{post.title || t('Video')}</h3></Link><Link className="video-reference-author" to={profileUrl(post.user || {})}>{post.user?.avatar_url && <img src={post.user.avatar_url} alt="" loading="lazy"/>}{post.user?.name}{post.user?.is_blue_verified && <VerifiedBadge size={13} className="ml-1"/>}</Link><small>{number(post.views_count)} {t('views')} · {timeAgo(post.created_at,language)}</small></article>;
  return <AppLayout wide currentTab="videos"><div className="video-reference-layout"><main className="video-reference-main">
    {!token && <nav className="video-reference-topics" aria-label={t('Filter video')}><button className={topic==='all'?'active':''} aria-pressed={topic==='all'} onClick={()=>setTopic('all')}>{t('Semua')}</button>{topics.map(tag=><button key={tag} className={topic===tag?'active':''} aria-pressed={topic===tag} onClick={()=>setTopic(tag)}>#{tag}</button>)}</nav>}
    {loading && <p role="status" className="reference-empty"><Loader2 className="animate-spin"/>{t('Memuat…')}</p>}
    {error && <p role="alert" className="video-error">{t(error)}</p>}
    {!loading && featured && <section className="video-reference-feature"><VideoPlayer post={featured} autoplay={Boolean(token && route.state?.autoplay)}/><div className="video-reference-feature-copy"><PostCard post={featured} hideMedia defaultCommentsOpen={Boolean(token)} onUpdated={update} onDeleted={remove}/></div></section>}
    {!loading && !featured && !error && <div className="reference-empty"><Film size={32}/>{t('Belum ada video.')}</div>}
    {!token && !loading && <><section className="video-reference-section"><div className="video-reference-section-title"><h2>{t('Video Populer')}</h2>{more && <button disabled={busy} onClick={loadMore}>{t('Muat lebih banyak')}<ArrowRight size={14}/></button>}</div><div className="video-reference-popular">{recommended.map(post=>card(post))}</div>{!recommended.length && <p className="text-sm text-text-secondary">{t('Belum ada video lain.')}</p>}</section><section className="video-reference-section"><div className="video-reference-section-title"><h2><Play size={18} fill="currentColor"/>{t('Shorts')}</h2></div><div className="video-reference-shorts">{shortVideos.map(post=>card(post,true))}</div>{!shortVideos.length && <p className="text-sm text-text-secondary">{t('Belum ada Shorts.')}</p>}</section></>}
  </main><aside className="video-reference-recommendations"><h2>{t('Video yang Direkomendasikan')}</h2>{recommended.slice(0,8).map(post=><article key={post.id}><div className="video-reference-thumb"><VideoPlayer post={post} preview/></div><div><Link to={watchUrl(post)}><h3>{post.title || t('Video')}</h3></Link><Link to={profileUrl(post.user || {})}>{post.user?.name}{post.user?.is_blue_verified && <VerifiedBadge size={12} className="ml-1"/>}</Link><small>{number(post.views_count)} {t('views')} · {timeAgo(post.created_at,language)}</small></div></article>)}{!loading && !recommended.length && <p className="text-sm text-text-secondary">{t('Belum ada rekomendasi video.')}</p>}</aside></div></AppLayout>;
}
