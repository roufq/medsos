import { useLanguage } from "../context/LanguageContext";import { useEffect, useMemo, useState } from 'react';
import { Loader2, ShoppingBag, Shuffle, Gift, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../components/modern/AppLayout';
import DiscoveryCard from '../components/modern/DiscoveryCard';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../api/postApi';
const BATCH_SIZE = 50;
const PER_PAGE = 12;
export default function ShopPage() {const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [category,setCategory] = useState('all');
  const [randomOrder,setRandomOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = user?.id;
  const requestKey = `${userId || ''}:${authLoading}`;
  const [loadedRequest, setLoadedRequest] = useState(requestKey);
  if (loadedRequest !== requestKey) {
    setLoadedRequest(requestKey); setLoading(true); setError(''); setProducts([]); setCategory('all'); setRandomOrder(null); setPage(1);
  }
  useEffect(() => {
    if (authLoading) return;
    let active = true;
    const loadAll = async () => {
      try {
        const all = [];
        const seen = new Set();
        let beforeId = null;
        while (true) {
          const batch = (await postApi.getFeed(BATCH_SIZE, 0, null, beforeId, 'shop', !userId)) || [];
          for (const item of batch) {
            if (!seen.has(item.id)) { seen.add(item.id); all.push(item); }
          }
          if (active) { setProducts([...all]); setLoading(false); }
          if (batch.length < BATCH_SIZE) break;
          beforeId = batch[batch.length - 1].id;
        }
      } catch (err) {
        if (active) setError(err.response?.data?.error || 'Gagal memuat produk.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAll();
    return () => {active = false;};
  }, [userId, authLoading]);
  const addProduct = (post) => {if (post.post_type === 'shop') setProducts((current) => [post, ...current.filter((item) => item.id !== post.id)]);};
  const categories = useMemo(() => [...new Set(products.map(post=>post.shop?.category).filter(Boolean))], [products]);
  const visible = useMemo(() => products.filter(post=>category==='all' || post.shop?.category===category), [products, category]);
  const shown = useMemo(() => {
    if (!randomOrder) return visible;
    const rank = new Map(randomOrder.map((id, idx) => [id, idx]));
    return [...visible].sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
  }, [visible, randomOrder]);
  const pages=Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const currentPage=Math.min(page, pages);
  const pageItems=shown.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const pageNumbers = (() => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const list = [1];
    if (currentPage > 3) list.push('...');
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(pages - 1, currentPage + 1); p++) list.push(p);
    if (currentPage < pages - 2) list.push('...');
    list.push(pages);
    return list;
  })();
  const goToPage = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const shuffle=()=>{
    const ids=products.map(post=>post.id);
    for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
    setRandomOrder(ids); setPage(1);
  };
  return <AppLayout wide currentTab="shop" onPostCreated={addProduct}><div className="reference-shop"><main className="reference-shop-main">
    <div className="reference-shop-heading"><div><h1><ShoppingBag size={29}/>{t('Shop')}</h1><p>{t('Temukan produk terbaru dari komunitas.')}</p></div><button className="reference-shop-banner" onClick={shuffle}><Gift size={46}/><span><strong>{t('Temukan produk pilihan')}</strong><small>{t('Jelajahi produk dan terhubung langsung dengan penjual.')}</small></span><ArrowRight size={18}/></button></div>
    <nav className="video-reference-topics" aria-label={t('Kategori produk')}><button className={category==='all'?'active':''} onClick={()=>{setCategory('all');setPage(1);}} aria-pressed={category==='all'}>{t('Semua')}</button>{categories.map(name=><button key={name} className={category===name?'active':''} aria-pressed={category===name} onClick={()=>{setCategory(name);setPage(1);}}>{t(name)}</button>)}</nav>
    <div className="reference-shop-selection"><div><h2><Shuffle size={22}/>{t('Pilihan produk')}</h2><p>{t('Temukan produk terbaru dari komunitas.')}</p></div><button onClick={shuffle} disabled={!products.length}><Shuffle size={15}/>{t('Acak Lagi')}</button></div>
    {loading && <p role="status" className="reference-empty"><Loader2 className="animate-spin"/>{t('Memuat…')}</p>}
    {error && <p role="alert" className="video-error">{t(error)}</p>}
    {!loading && !error && !shown.length && <p className="reference-empty">{t('Belum ada produk yang dapat ditampilkan.')}</p>}
    <div className="reference-shop-grid">{pageItems.map(post=><DiscoveryCard key={post.id} post={post} product onUpdated={updated=>setProducts(current=>current.map(item=>item.id===updated.id?updated:item))}/>)}</div>
    {pages > 1 && <nav className="profile-pagination mt-6" aria-label={t("Halaman produk")}><button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} aria-label={t("Halaman sebelumnya")}><ChevronLeft size={14} /></button>{pageNumbers.map((item, idx) => item === '...' ? <span key={`dots-${idx}`} className="px-2 text-xs text-text-secondary">…</span> : <button key={item} className={currentPage === item ? 'active' : ''} onClick={() => goToPage(item)} aria-current={currentPage === item ? 'page' : undefined}>{item}</button>)}<button disabled={currentPage === pages} onClick={() => goToPage(currentPage + 1)} aria-label={t("Halaman berikutnya")}><ChevronRight size={14} /></button></nav>}
  </main><aside className="reference-shop-side"><section><h2>{t('Kategori produk')}</h2><button className={category==='all'?'active':''} onClick={()=>{setCategory('all');setPage(1);}}><ShoppingBag size={16}/>{t('Semua')}<span>{products.length}</span></button>{categories.map(name=><button key={name} className={category===name?'active':''} onClick={()=>{setCategory(name);setPage(1);}}>{t(name)}<span>{products.filter(post=>post.shop?.category===name).length}</span></button>)}</section><section className="reference-shop-side-banner"><Gift size={40}/><h2>{t('Temukan produk pilihan')}</h2><p>{t('Jelajahi produk dan terhubung langsung dengan penjual.')}</p><button onClick={shuffle}>{t('Acak Lagi')}<ArrowRight size={16}/></button></section></aside></div></AppLayout>;
}
