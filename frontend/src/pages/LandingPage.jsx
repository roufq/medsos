import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Image, Play, ShoppingBag, Users, Sun, Moon, ArrowRight, Compass } from 'lucide-react';
import Brand from '../components/common/Brand';
import LanguageSwitch from '../components/common/LanguageSwitch';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { t: translateUI } = useLanguage();

  const { theme, toggleTheme } = useTheme();
  return <div className="postter-landing">
    <header className="landing-header"><div className="landing-brand-nav"><Brand /><Link to="/explore" className="landing-explore-link"><Compass size={17}/>{translateUI("Explore")}</Link></div><nav aria-label={translateUI("Navigasi pengenalan")}><button onClick={toggleTheme} aria-label={translateUI("Ganti tema")}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button><Link to="/login" className="landing-login">{translateUI("Masuk")} <ArrowUpRight size={15} /></Link></nav></header>
    <main>
      <section className="landing-hero">
        <div className="landing-intro"><span className="landing-eyebrow"><span /> {translateUI("RUANG UNTUK IDE ANDA")}</span><h1>{translateUI("Cerita kecil.")}<br />{translateUI("Koneksi baru.")}<br /><em>{translateUI("Kemungkinan besar.")}</em></h1><p>{translateUI("Bagikan karya, temukan inspirasi, dan bertemu orang-orang dengan minat yang sama. Semua berawal dari satu postingan.")}</p><div className="landing-actions"><Link className="landing-primary" to="/register">{translateUI("Mulai cerita Anda")} <ArrowRight size={18} /></Link><Link to="/explore">{translateUI("Lihat apa yang baru")} <ArrowUpRight size={17} /></Link></div><small>{translateUI("Posting gratis. Jadilah bagian dari perjalanan Postter.")}</small></div>
        <div className="landing-collage" aria-label={translateUI("Foto, cerita, dan produk bertemu di Postter")}>
          <div className="landing-story story-one"><div className="landing-art"><div className="art-sun"/><div className="art-hill hill-one"/><div className="art-hill hill-two"/><span>{translateUI("EXPLORE THE EVERYDAY")}</span></div><div className="story-caption"><span>{translateUI("01 / INSPIRASI")}</span><strong>{translateUI("Selalu ada sudut pandang baru.")}</strong><p>#ceritahariini #inspirasi</p></div></div>
          <div className="landing-story story-two"><span className="story-symbol"><Play size={27} fill="currentColor" /></span><span>{translateUI("02 / EKSPRESI")}</span><strong>{translateUI("Ide Anda.")}<br />{translateUI("Panggung Anda.")}</strong><div className="story-lines"><i/><i/><i/></div></div>
          <div className="landing-note"><ShoppingBag size={22}/><div><strong>{translateUI("Dari karya menjadi peluang.")}</strong><p>{translateUI("Temukan dan bagikan produk pilihan.")}</p></div><ArrowUpRight size={20}/></div>
        </div>
      </section>
      <section className="landing-features"><div className="landing-section-heading"><span>{translateUI("LEBIH DARI SEKADAR SCROLL")}</span><h2>{translateUI("Satu tempat.")}<br />{translateUI("Banyak cara terhubung.")}</h2></div><div className="landing-feature-grid">{[
        [Image, 'Bagikan perspektif', 'Foto, video, tulisan, atau tautan. Pilih cara Anda bercerita.'],
        [Users, 'Temukan komunitas', 'Ikuti orang yang menginspirasi dan bangun percakapan yang berarti.'],
        [ShoppingBag, 'Dukung karya lokal', 'Jelajahi produk dan terhubung langsung dengan penjual.'],
      ].map(([Icon,title,description]) => <article key={title}><Icon size={25}/><h3>{translateUI(title)}</h3><p>{translateUI(description)}</p></article>)}</div></section>
      <section className="landing-join"><span>{translateUI("MULAI DARI SINI")}</span><h2>{translateUI("Cerita berikutnya")}<br />{translateUI("bisa jadi cerita Anda.")}</h2><Link to="/register" className="landing-primary">{translateUI("Bergabung dengan Postter")} <ArrowUpRight size={18}/></Link></section>
    </main><footer className="landing-footer"><Brand/><LanguageSwitch/><span>© {new Date().getFullYear()} {translateUI("Postter. Dibuat untuk saling terhubung.")}</span><Link to="/login">{translateUI("Sudah punya akun? Masuk")}</Link></footer>
  </div>;
}
