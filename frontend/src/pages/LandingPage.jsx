import { Link } from 'react-router-dom';
import { ArrowUpRight, Image, Play, ShoppingBag, Users, Sun, Moon, ArrowRight, Compass } from 'lucide-react';
import Brand from '../components/common/Brand';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  return <div className="postter-landing">
    <header className="landing-header"><div className="landing-brand-nav"><Brand /><Link to="/explore" className="landing-explore-link"><Compass size={17}/>Explore</Link></div><nav aria-label="Navigasi pengenalan"><button onClick={toggleTheme} aria-label="Ganti tema">{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button><Link to="/login" className="landing-login">Masuk <ArrowUpRight size={15} /></Link></nav></header>
    <main>
      <section className="landing-hero">
        <div className="landing-intro"><span className="landing-eyebrow"><span /> RUANG UNTUK IDE ANDA</span><h1>Cerita kecil.<br />Koneksi baru.<br /><em>Kemungkinan besar.</em></h1><p>Bagikan karya, temukan inspirasi, dan bertemu orang-orang dengan minat yang sama. Semua berawal dari satu postingan.</p><div className="landing-actions"><Link className="landing-primary" to="/register">Mulai cerita Anda <ArrowRight size={18} /></Link><Link to="/explore">Lihat apa yang baru <ArrowUpRight size={17} /></Link></div><small>Posting gratis. Jadilah bagian dari perjalanan Postter.</small></div>
        <div className="landing-collage" aria-label="Foto, cerita, dan produk bertemu di Postter">
          <div className="landing-story story-one"><div className="landing-art"><div className="art-sun"/><div className="art-hill hill-one"/><div className="art-hill hill-two"/><span>EXPLORE THE EVERYDAY</span></div><div className="story-caption"><span>01 / INSPIRASI</span><strong>Selalu ada sudut pandang baru.</strong><p>#ceritahariini #inspirasi</p></div></div>
          <div className="landing-story story-two"><span className="story-symbol"><Play size={27} fill="currentColor" /></span><span>02 / EKSPRESI</span><strong>Ide Anda.<br />Panggung Anda.</strong><div className="story-lines"><i/><i/><i/></div></div>
          <div className="landing-note"><ShoppingBag size={22}/><div><strong>Dari karya menjadi peluang.</strong><p>Temukan dan bagikan produk pilihan.</p></div><ArrowUpRight size={20}/></div>
        </div>
      </section>
      <section className="landing-features"><div className="landing-section-heading"><span>LEBIH DARI SEKADAR SCROLL</span><h2>Satu tempat.<br />Banyak cara terhubung.</h2></div><div className="landing-feature-grid">{[
        [Image, 'Bagikan perspektif', 'Foto, video, tulisan, atau tautan. Pilih cara Anda bercerita.'],
        [Users, 'Temukan komunitas', 'Ikuti orang yang menginspirasi dan bangun percakapan yang berarti.'],
        [ShoppingBag, 'Dukung karya lokal', 'Jelajahi produk dan terhubung langsung dengan penjual.'],
      ].map(([Icon,title,description]) => <article key={title}><Icon size={25}/><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section className="landing-join"><span>MULAI DARI SINI</span><h2>Cerita berikutnya<br />bisa jadi cerita Anda.</h2><Link to="/register" className="landing-primary">Bergabung dengan Postter <ArrowUpRight size={18}/></Link></section>
    </main><footer className="landing-footer"><Brand/><span>© {new Date().getFullYear()} Postter. Dibuat untuk saling terhubung.</span><Link to="/login">Sudah punya akun? Masuk</Link></footer>
  </div>;
}
