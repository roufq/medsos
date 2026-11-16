import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Heart, MessageCircle, MoreVertical, LayoutGrid, List, ChevronDown, BadgeCheck, Image, Play, Loader2 } from 'lucide-react';
import AppLayout from '../components/modern/AppLayout';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../api/postApi';
import { postUrl } from '../utils/postUrl';
import { profileUrl } from '../utils/profileUrl';
import { timeAgo } from '../utils/postFormat';
import { copyToClipboard } from '../utils/clipboard';
import './ExplorePage.css';

const TOPICS=[['all','Semua'],['poster','Poster'],['design','Desain'],['art','Seni'],['photography','Fotografi'],['fashion','Fashion'],['technology','Teknologi'],['travel','Travel'],['lifestyle','Lifestyle'],['business','Bisnis']];
const MORE_TOPICS=[['food','Kuliner'],['music','Musik'],['sport','Olahraga'],['nature','Alam'],['education','Pendidikan'],['automotive','Otomotif']];
const count=value=>new Intl.NumberFormat('id-ID',{notation:'compact',maximumFractionDigits:1}).format(value||0);
const PAGE_SIZE=24;

function ExplorePin({post,onUpdate,onNotice}) {
  const {user}=useAuth();const navigate=useNavigate();
  const [saving,setSaving]=useState(false),[liking,setLiking]=useState(false);
  const image=post.media?.find(item=>item.media_type==='image');
  const video=post.media?.find(item=>item.media_type==='video');
  const thumbnail=image?.media_url||video?.thumbnail_url||post.link?.image_url;
  const title=post.title||'Postingan';const author=post.user||{};
  const save=async()=>{
    if(!user){navigate('/login');return;}if(saving)return;
    setSaving(true);
    try{const result=await postApi.toggleSave(post.public_hash);onUpdate(post.id,{is_saved_by_me:result.saved});onNotice(result.saved?'Postingan disimpan.':'Postingan dikeluarkan dari koleksi.');}
    catch(e){onNotice(e.response?.data?.error||'Gagal menyimpan postingan.');}finally{setSaving(false);}
  };
  const like=async()=>{
    if(!user){navigate('/login');return;}if(liking)return;
    setLiking(true);
    try{const result=await postApi.toggleLike(post.public_hash);onUpdate(post.id,{is_liked_by_me:result.liked,likes_count:result.likes_count??Math.max(0,(post.likes_count||0)+(result.liked?1:-1))});}
    catch(e){onNotice(e.response?.data?.error||'Gagal menyukai postingan.');}finally{setLiking(false);}
  };
  return <article className="explore-pin">
    <div className={`explore-pin-media ${!thumbnail?'explore-pin-text':''}`}>
      <Link className="explore-pin-image-link" to={postUrl(post)} aria-label={`Buka postingan ${title}`}>
        {thumbnail?<img src={thumbnail} alt={title} loading="lazy" decoding="async"/>:video?<video src={video.media_url} muted playsInline preload="metadata"/>:<div className="explore-text-preview"><Image size={24}/><strong>{title}</strong><p>{(post.content||'').slice(0,220)}</p></div>}
      </Link>
      {post.is_sponsored&&<span className="explore-sponsored">Iklan</span>}
      {video&&<span className="explore-video-badge"><Play size={12} fill="currentColor"/>Video</span>}
      <button className={`explore-bookmark ${post.is_saved_by_me?'is-saved':''}`} aria-label={`${post.is_saved_by_me?'Batal simpan':'Simpan ke koleksi'}: ${title}`} aria-pressed={Boolean(post.is_saved_by_me)} disabled={saving} onClick={save}>{post.is_saved_by_me?<BookmarkCheck size={17}/>:<Bookmark size={17}/>}</button>
      <div className="explore-pin-overlay"><div className="explore-pin-counts"><button onClick={like} disabled={liking} aria-pressed={Boolean(post.is_liked_by_me)} aria-label={`Sukai ${title}`}><Heart size={14} fill={post.is_liked_by_me?'currentColor':'none'}/><span>{count(post.likes_count)}</span></button><Link to={postUrl(post)} aria-label={`Komentar ${title}`}><MessageCircle size={14}/><span>{count(post.comments_count)}</span></Link></div><button className="explore-save" disabled={saving} onClick={save}>{saving?<Loader2 size={12} className="animate-spin"/>:post.is_saved_by_me?'Tersimpan':'Simpan'}</button></div>
    </div>
    <div className="explore-pin-info"><h2><Link to={postUrl(post)}>{title}</Link></h2><p className="explore-excerpt">{post.content}</p><div className="explore-pin-author"><Link to={profileUrl(author)} className="explore-author-link"><img src={author.avatar_url||`${import.meta.env.BASE_URL}images/postter-logo.png`} alt="" loading="lazy"/><div><span>oleh <strong>{author.name||author.username||'Pengguna'}</strong>{author.is_blue_verified&&<BadgeCheck size={12} className="explore-verified" aria-label="Terverifikasi"/>}</span><time dateTime={post.created_at}>{timeAgo(post.created_at)}</time></div></Link><details className="explore-pin-menu"><summary aria-label={`Pilihan postingan ${title}`}><MoreVertical size={15}/></summary><div><Link to={postUrl(post)}>Lihat postingan</Link><button onClick={async event=>{const menu=event.currentTarget.closest('details');try{await copyToClipboard(new URL(postUrl(post),window.location.origin).href);onNotice('Tautan disalin.');}catch{onNotice('Tautan belum dapat disalin.');}menu?.removeAttribute('open');}}>Salin tautan</button></div></details></div></div>
  </article>;
}

export default function ExplorePage() {
  const {user,loading:authLoading}=useAuth();const [params,setParams]=useSearchParams();
  const topic=params.get('topic')||'all',sort=params.get('sort')||'latest',search=params.get('q')||'';
  const [view,setView]=useState('grid'),[posts,setPosts]=useState([]),[loading,setLoading]=useState(true),[loadingMore,setLoadingMore]=useState(false),[hasMore,setMore]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[retry,setRetry]=useState(0);
  const generation=useRef(0);
  const nextOffset=useRef(0);
  const change=(key,value)=>{setParams(current=>{const next=new URLSearchParams(current);if(value==='all'||value==='latest'||!value)next.delete(key);else next.set(key,value);return next;});};
  useEffect(()=>{
    if(authLoading)return;
    let active=true;const version=++generation.current;setLoading(true);setError('');setPosts([]);setMore(false);setLoadingMore(false);
    postApi.explore({limit:PAGE_SIZE,offset:0,topic,sort,q:search},!user).then(result=>{if(active&&generation.current===version){setPosts(result.posts||[]);nextOffset.current=(result.posts||[]).length;setMore(Boolean(result.has_more));}}).catch(e=>{if(active)setError(e.response?.data?.error||'Explore belum dapat dimuat.');}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;generation.current++;};
  },[topic,sort,search,user?.id,authLoading,retry]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(timer);},[notice]);
  const more=async()=>{
    if(loadingMore||!hasMore)return;const version=generation.current;setLoadingMore(true);setError('');
    try{const result=await postApi.explore({limit:PAGE_SIZE,offset:nextOffset.current,topic,sort,q:search},!user);if(generation.current!==version)return;nextOffset.current+=(result.posts||[]).length;setPosts(current=>[...current,...(result.posts||[]).filter(post=>!current.some(existing=>existing.id===post.id))]);setMore(Boolean(result.has_more));}
    catch(e){if(generation.current===version)setError(e.response?.data?.error||'Gagal memuat postingan berikutnya.');}finally{if(generation.current===version)setLoadingMore(false);}
  };
  const update=(id,changes)=>setPosts(current=>current.map(post=>post.id===id?{...post,...changes}:post));
  return <AppLayout currentTab="explore" wide><section className="explore-page" aria-label="Jelajahi postingan publik">
    <h1 className="sr-only">Explore — temukan postingan dari komunitas Postter</h1>
    <div className="explore-toolbar"><div className="explore-topics" aria-label="Kategori postingan">{TOPICS.map(([id,label])=><button key={id} className={topic===id?'selected':''} aria-pressed={topic===id} onClick={()=>change('topic',id)}>{label}</button>)}<label className="explore-more-topics"><select aria-label="Kategori lainnya" value={MORE_TOPICS.some(([id])=>id===topic)?topic:''} onChange={event=>change('topic',event.target.value)}><option value="" disabled>Lainnya</option>{MORE_TOPICS.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><ChevronDown size={13}/></label></div><div className="explore-controls"><div className="explore-view-switch"><button aria-label="Tampilan grid" aria-pressed={view==='grid'} onClick={()=>setView('grid')}><LayoutGrid size={17}/></button><button aria-label="Tampilan daftar" aria-pressed={view==='list'} onClick={()=>setView('list')}><List size={18}/></button></div><label className="explore-sort"><select aria-label="Urutkan postingan" value={sort} onChange={event=>change('sort',event.target.value)}><option value="latest">Terbaru</option><option value="popular">Terpopuler</option></select><ChevronDown size={13}/></label></div></div>
    {search&&<p className="explore-query">Hasil untuk <strong>“{search}”</strong><button onClick={()=>change('q','')}>Hapus pencarian</button></p>}
    {error&&<div className="explore-error" role="alert">{error}<button onClick={()=>posts.length?more():setRetry(value=>value+1)}>Coba lagi</button></div>}
    {loading?<div className="explore-loading" role="status"><Loader2 size={24} className="animate-spin"/><span>Menjelajahi postingan…</span></div>:posts.length?<div className={view==='grid'?'explore-grid':'explore-list'}>{posts.map(post=><ExplorePin key={post.id} post={post} onUpdate={update} onNotice={setNotice}/>)}</div>:!error&&<div className="explore-empty"><Image size={34}/><h2>Belum ada postingan untuk pilihan ini.</h2><p>Coba topik lain atau kembali ke semua postingan.</p><button onClick={()=>setParams({})}>Lihat semua</button></div>}
    {hasMore&&!loading&&<button className="explore-load-more" onClick={more} disabled={loadingMore}>{loadingMore?<><Loader2 size={16} className="animate-spin"/>Memuat…</>:'Lihat lebih banyak'}</button>}
    {notice&&<div className="explore-notice" role="status">{notice}</div>}
  </section></AppLayout>;
}
