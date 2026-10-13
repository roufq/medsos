import { Link } from 'react-router-dom';
import { Play, Video } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
export const watchUrl = (post) => `/videos/${post.public_hash || post.id}`;
export default function VideoPlayer({ post, preview = false, autoplay = false }) {
  const { t } = useLanguage();
  const media = (post.original_post || post).media || [];
  const video = media.find((item) => item.media_type === 'video');
  const image = media.find((item) => item.media_type === 'image');
  if (!video) return <Link to={`/post/${post.public_hash || post.id}`} className="video-player-placeholder">{image ? <img src={image.media_url} alt="" /> : <Video size={32} />}</Link>;
  const ready = !video.processing_status || video.processing_status === 'ready';
  return <div className={`video-player ${preview ? 'video-player-preview' : ''}`}>
    {ready ? <video key={video.media_url} src={video.media_url} poster={video.thumbnail_url || image?.media_url} controls={!preview} autoPlay={!preview && autoplay} playsInline preload="metadata" /> : <div className="video-player-placeholder"><Video size={30} /><p>{t(video.processing_status === 'failed' ? 'Video gagal diproses.' : 'Video sedang diproses...')}</p></div>}
    {preview && <Link to={watchUrl(post)} state={{ autoplay: true }} className="video-open-player" aria-label={`${t('Putar video')}: ${post.title || ''}`}><span><Play size={32} fill="currentColor" /></span><div><Play size={15} fill="currentColor" /><small>0:00 / {Math.floor((video.duration_seconds || 0) / 60)}:{String((video.duration_seconds || 0) % 60).padStart(2, '0')}</small></div></Link>}
  </div>;
}
