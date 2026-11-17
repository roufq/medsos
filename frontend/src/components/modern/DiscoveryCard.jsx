import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, Heart, MessageCircle, Share2, Play, Image, Link as LinkIcon, MapPin, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { postApi } from '../../api/postApi';
import { messageApi } from '../../api/messageApi';
import { postUrl } from '../../utils/postUrl';
import { profileUrl } from '../../utils/profileUrl';
import { formatPrice, timeAgo } from '../../utils/postFormat';
import { postKind } from '../../utils/discovery';
import { ShareModal } from './PostActionModals';

export default function DiscoveryCard({ post, onUpdated, product = false }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false), [sharing, setSharing] = useState(false), [error, setError] = useState('');
  const image = post.media?.find(item => item.media_type === 'image');
  const video = post.media?.find(item => item.media_type === 'video');
  const thumbnail = image?.media_url || video?.thumbnail_url || post.link?.image_url;
  const kind = postKind(post);
  const Icon = kind === 'shop' ? ShoppingBag : video ? Play : post.link ? LinkIcon : Image;
  const number = value => new Intl.NumberFormat(language === 'en' ? 'en-US' : 'id-ID', {notation:'compact',maximumFractionDigits:1}).format(value || 0);
  const update = changes => onUpdated?.({...post,...changes});
  const like = async () => {
    if (!user) { navigate('/login'); return; }
    if (busy) return;
    setBusy(true); setError('');
    try {
      const result = await postApi.toggleLike(post.public_hash);
      update({is_liked_by_me:result.liked,likes_count:result.likes_count ?? Math.max(0,(post.likes_count || 0)+(result.liked?1:-1))});
    } catch (e) { setError(e.response?.data?.error || 'Gagal menyukai postingan.'); }
    finally { setBusy(false); }
  };
  const contact = async () => {
    if (!user) { navigate('/login'); return; }
    if (busy) return;
    setBusy(true); setError('');
    try {
      const payload = { shop_post_id: post.public_hash };
      if (String(user.id)!==String(post.user_id)) payload.user_id = String(post.user?.public_hash || post.user?.username || post.user_id);
      const { token } = await messageApi.createIntent(payload);
      navigate(`/messages?t=${encodeURIComponent(token)}`);
    } catch (e) { setError(e.response?.data?.error || 'Gagal membuka percakapan.'); }
    finally { setBusy(false); }
  };
  return <article className={`discovery-card discovery-${kind} ${product?'discovery-product-card':''}`}>
    <Link to={postUrl(post)} className="discovery-media" aria-label={`${t('Lihat postingan')}: ${post.title || ''}`}>
      {thumbnail ? <img src={thumbnail} alt={post.title || ''} loading="lazy" /> : video ? <video src={video.media_url} muted playsInline preload="metadata" /> : <div className="discovery-no-media"><Icon size={28}/></div>}
      <span className="discovery-kind"><Icon size={14}/>{kind==='shop' && t('Shop')}</span>
      {post.is_sponsored && <span className="discovery-sponsored">{t('Iklan')}</span>}
      {video && <span className="discovery-duration"><Play size={12} fill="currentColor" />{Math.floor((video.duration_seconds || 0)/60)}:{String((video.duration_seconds || 0)%60).padStart(2,'0')}</span>}
    </Link>
    <div className="discovery-copy">
      <Link to={profileUrl(post.user || {})} className="discovery-author"><img src={post.user?.avatar_url || `${import.meta.env.BASE_URL}favicon.svg`} alt=""/><span><strong>{post.user?.name || t('Pengguna')}{post.user?.is_blue_verified && <BadgeCheck size={12}/>}</strong><time>{timeAgo(post.created_at,language)}</time></span></Link>
      <Link to={postUrl(post)} className="discovery-title">{post.title || t('Postingan')}</Link>
      <p className="discovery-description">{post.content}</p>
      {post.location && <span className="discovery-location"><MapPin size={12}/>{post.location}</span>}
      {kind==='shop' && post.shop && <div className="discovery-product"><strong>{formatPrice(post.shop.price_minor,post.shop.currency,language)}</strong><Link to={postUrl(post)}>{t('Detail Produk')}</Link></div>}
      {product && <button type="button" className="discovery-contact" disabled={busy} onClick={contact}><MessageCircle size={15}/>{t('Chat Penjual / Beli')}</button>}
      <div className="discovery-actions"><button onClick={like} disabled={busy} aria-label={t('Suka')} aria-pressed={Boolean(post.is_liked_by_me)}><Heart size={15} fill={post.is_liked_by_me?'currentColor':'none'}/>{number(post.likes_count)}</button><Link to={postUrl(post)} aria-label={t('Komentar')}><MessageCircle size={15}/>{number(post.comments_count)}</Link><button onClick={()=>user?setSharing(true):navigate('/login')} aria-label={t('Bagikan postingan')}><Share2 size={15}/>{number(post.shares_count)}</button></div>
      {error && <p role="alert" className="text-error text-xs">{t(error)}</p>}
    </div>
    {sharing && <ShareModal postId={post.public_hash} onClose={()=>setSharing(false)} onShared={result=>update({shares_count:result.shares_count})}/>}
  </article>;
}
