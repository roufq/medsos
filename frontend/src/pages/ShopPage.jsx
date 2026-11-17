import { useLanguage } from "../context/LanguageContext";import { useEffect, useState } from 'react';
import { Loader2, ShoppingBag, Shuffle, Gift, ArrowRight } from 'lucide-react';
import AppLayout from '../components/modern/AppLayout';
import DiscoveryCard from '../components/modern/DiscoveryCard';
import { useAuth } from '../context/AuthContext';
import { postApi } from '../api/postApi';
const PAGE_SIZE = 20;
export default function ShopPage() {const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [category,setCategory] = useState('all');
  const [randomOrder,setRandomOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const userId = user?.id;
  const requestKey = `${userId || ''}:${authLoading}`;
  const [loadedRequest, setLoadedRequest] = useState(requestKey);
  if (loadedRequest !== requestKey) {
    setLoadedRequest(requestKey); setLoading(true); setError(''); setProducts([]); setHasMore(false); setCategory('all'); setRandomOrder(null);
  }
  useEffect(() => {
    if (authLoading) return;
    let active = true;
    postApi.getFeed(PAGE_SIZE, 0, null, null, 'shop', !userId).then((data) => {
      if (active) {setProducts(data || []);setHasMore((data || []).length === PAGE_SIZE);}
    }).catch((err) => {if (active) setError(err.response?.data?.error || 'Gagal memuat produk.');}).
    finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, [userId, authLoading]);
  const addProduct = (post) => {if (post.post_type === 'shop') setProducts((current) => [post, ...current.filter((item) => item.id !== post.id)]);};
  const loadMore = async () => {
    if (loadingMore || !products.length) return;
    setLoadingMore(true);setError('');
    try {
      const more = await postApi.getFeed(PAGE_SIZE, 0, null, products[products.length - 1].id, 'shop', !user);
      setProducts((current) => [...current, ...(more || []).filter((post) => !current.some((item) => item.id === post.id))]);
      setHasMore((more || []).length === PAGE_SIZE);
    } catch (err) {setError(err.response?.data?.error || 'Gagal memuat produk berikutnya.');} finally
    {setLoadingMore(false);}
  };
  const categories=[...new Set(products.map(post=>post.shop?.category).filter(Boolean))];
  const visible=products.filter(post=>category==='all' || post.shop?.category===category);
  const shown=randomOrder ? [...visible].sort((a,b)=>randomOrder.indexOf(a.id)-randomOrder.indexOf(b.id)) : visible;
  const shuffle=()=>{
    const ids=products.map(post=>post.id);
    for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
    setRandomOrder(ids);
  };
  return <AppLayout wide currentTab="shop" onPostCreated={addProduct}><div className="reference-shop"><main className="reference-shop-main">
    <div className="reference-shop-heading"><div><h1><ShoppingBag size={29}/>{t('Shop')}</h1><p>{t('Temukan produk terbaru dari komunitas.')}</p></div><button className="reference-shop-banner" onClick={shuffle}><Gift size={46}/><span><strong>{t('Temukan produk pilihan')}</strong><small>{t('Jelajahi produk dan terhubung langsung dengan penjual.')}</small></span><ArrowRight size={18}/></button></div>
    <nav className="video-reference-topics" aria-label={t('Kategori produk')}><button className={category==='all'?'active':''} onClick={()=>setCategory('all')} aria-pressed={category==='all'}>{t('Semua')}</button>{categories.map(name=><button key={name} className={category===name?'active':''} aria-pressed={category===name} onClick={()=>setCategory(name)}>{t(name)}</button>)}</nav>
    <div className="reference-shop-selection"><div><h2><Shuffle size={22}/>{t('Pilihan produk')}</h2><p>{t('Temukan produk terbaru dari komunitas.')}</p></div><button onClick={shuffle} disabled={!products.length}><Shuffle size={15}/>{t('Acak Lagi')}</button></div>
    {loading && <p role="status" className="reference-empty"><Loader2 className="animate-spin"/>{t('Memuat…')}</p>}
    {error && <p role="alert" className="video-error">{t(error)}</p>}
    {!loading && !error && !shown.length && <p className="reference-empty">{t('Belum ada produk yang dapat ditampilkan.')}</p>}
    <div className="reference-shop-grid">{shown.map(post=><DiscoveryCard key={post.id} post={post} product onUpdated={updated=>setProducts(current=>current.map(item=>item.id===updated.id?updated:item))}/>)}</div>
    {hasMore && <button className="video-load-more" disabled={loadingMore} onClick={loadMore}>{loadingMore&&<Loader2 size={15} className="animate-spin"/>}{t('Muat lebih banyak')}</button>}
  </main><aside className="reference-shop-side"><section><h2>{t('Kategori produk')}</h2><button className={category==='all'?'active':''} onClick={()=>setCategory('all')}><ShoppingBag size={16}/>{t('Semua')}<span>{products.length}</span></button>{categories.map(name=><button key={name} className={category===name?'active':''} onClick={()=>setCategory(name)}>{t(name)}<span>{products.filter(post=>post.shop?.category===name).length}</span></button>)}</section><section className="reference-shop-side-banner"><Gift size={40}/><h2>{t('Temukan produk pilihan')}</h2><p>{t('Jelajahi produk dan terhubung langsung dengan penjual.')}</p><button onClick={shuffle}>{t('Acak Lagi')}<ArrowRight size={16}/></button></section></aside></div></AppLayout>;
}
