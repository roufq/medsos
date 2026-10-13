import { useLanguage } from "../../context/LanguageContext";import LanguageSwitch from '../common/LanguageSwitch';
import { ReactNode } from 'react';
import { Play, Users, ShoppingBag, Pencil, Heart, MessageCircle, Share2, Eye, MapPin, BadgeCheck, MoreVertical } from 'lucide-react';
export default function AuthShowcase({ signup = false, children }: {signup?: boolean;children: ReactNode;}) {const { t } = useLanguage();
  const benefits = signup ? [['Tonton Video', 'Temukan video terbaik, foto, dan tren dari seluruh dunia.'], [t("Terhubung"), 'Ikuti kreator favorit dan temui orang-orang baru.'], ['Shop', t("Temukan dan beli produk dari penjual terpercaya.")], [t("Buat Konten"), 'Bagikan momen, ide, dan cerita kamu dengan dunia.']] : [[t("Watch & Discover"), t("Find the latest videos, photos, and trends from around the world.")], [t("Connect"), t("Follow your favorite creators and meet new people.")], ['Shop', t("Discover and buy products from trusted sellers.")], [t("Create"), t("Share your moments, ideas and stories with the world.")]];
  const icons = [Play, Users, ShoppingBag, Pencil];
  return <main className={`auth-scene ${signup ? 'auth-signup' : 'auth-signin'}`}>
    <div className="auth-language"><LanguageSwitch /></div><div className="auth-scene-inner">
      <div className="auth-art" aria-label="Inspirasi postingan perjalanan">
        <div className="auth-story auth-story-back"><img src={`${import.meta.env.BASE_URL}images/auth-night.jpg`} alt="" /></div>
        <div className="auth-story auth-story-middle"><img src={`${import.meta.env.BASE_URL}images/auth-mountains.jpg`} alt="" /></div>
        <div className="auth-story auth-story-front"><img className="auth-story-photo" src={`${import.meta.env.BASE_URL}images/auth-mountains.jpg`} alt="Pemandangan pegunungan untuk inspirasi perjalanan" />
          <div className="auth-story-top"><div className="auth-story-avatar">T</div><div><strong>travel.diary <BadgeCheck size={13} /></strong><span>2h ago ? Indonesia</span></div><span className="auth-story-follow">{t("Follow")}</span><MoreVertical size={18} /></div>
          <div className="auth-story-reactions"><span><Heart fill="currentColor" />125.4K</span><span><MessageCircle fill="currentColor" />3.2K</span><span><Share2 fill="currentColor" />1.8K</span><span><Eye />98.7K</span></div>
          <div className="auth-story-caption"><strong>Keindahan Alam yang<br />Wajib Kamu Kunjungi</strong><p>Temukan destinasi wisata terbaik dan bagikan cerita perjalananmu...</p><span><MapPin size={14} />Indonesia</span><div className="auth-story-player"><Play size={24} fill="currentColor" /><span>0:24 / 1:12</span><i /></div></div>
        </div>
      </div>
      <section className="auth-intro"><span className="auth-eyebrow">{signup ? t("Bergabung dengan Postterest") : t("Sign In to Postterest")}</span><h1>{signup ? <>{t("Buat Akun")}<br />Postterest</> : <>{t("Welcome Back")}<br />{t("to Postterest")}</>}</h1><p className="auth-intro-description">{signup ? t("Jadilah bagian dari komunitas global untuk berbagi, menemukan, dan menjelajahi konten menarik setiap hari.") : t("Login to continue exploring amazing content, connect with people, and be part of a global community.")}</p><div className="auth-benefits">{benefits.map(([title, description], index) => {const Icon = icons[index];return <div key={title}><span><Icon size={24} fill={index === 0 ? 'currentColor' : 'none'} /></span><div><h3>{title}</h3><p>{description}</p></div></div>;})}</div>{signup && <blockquote>? Lebih dari sekadar media sosial,<br />ini adalah tempat untuk menemukan<br />dunia baru. ?</blockquote>}</section>
      {children}
    </div>
  </main>;
}
