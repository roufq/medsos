import { useLanguage } from "../context/LanguageContext";import { useEffect, useState } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';
import AppLayout from '../components/modern/AppLayout';
import PostCard from '../components/modern/PostCard';
import { postApi } from '../api/postApi';
const PAGE_SIZE = 20;
export default function ShopPage() {const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    postApi.getFeed(PAGE_SIZE, 0, null, null, 'shop').then((data) => {
      if (active) {setProducts(data || []);setHasMore((data || []).length === PAGE_SIZE);}
    }).catch((err) => {if (active) setError(err.response?.data?.error || 'Gagal memuat produk.');}).
    finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, []);
  const addProduct = (post) => {if (post.post_type === 'shop') setProducts((current) => [post, ...current.filter((item) => item.id !== post.id)]);};
  const loadMore = async () => {
    if (loadingMore || !products.length) return;
    setLoadingMore(true);setError('');
    try {
      const more = await postApi.getFeed(PAGE_SIZE, 0, null, products[products.length - 1].id, 'shop');
      setProducts((current) => [...current, ...(more || []).filter((post) => !current.some((item) => item.id === post.id))]);
      setHasMore((more || []).length === PAGE_SIZE);
    } catch (err) {setError(err.response?.data?.error || 'Gagal memuat produk berikutnya.');} finally
    {setLoadingMore(false);}
  };
  return <AppLayout currentTab="shop" onPostCreated={addProduct}><div className="mx-auto max-w-5xl"><div className="mb-6"><h1 className="flex items-center gap-3 text-2xl font-bold"><ShoppingBag size={25} />Shop</h1><p className="mt-2 text-sm text-text-secondary">{t("Temukan produk terbaru dari komunitas.")}</p></div>
    {loading && <div className="flex justify-center py-16"><Loader2 className="animate-spin" size={30} /></div>}
    {error && <p role="alert" className="mb-4 rounded-xl bg-error/10 p-4 text-sm text-error">{error}</p>}
    {!loading && !error && !products.length && <div className="rounded-2xl bg-white p-10 text-center text-sm text-text-secondary">{t("Belum ada produk yang dapat ditampilkan.")}</div>}
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">{products.map((post) => <PostCard key={post.id} post={post} onUpdated={(updated) => setProducts((current) => current.map((item) => item.id === updated.id ? updated : item))} onDeleted={(id) => setProducts((current) => current.filter((item) => item.id !== id))} />)}</div>
    {hasMore && <button type="button" disabled={loadingMore} onClick={loadMore} className="mx-auto mt-6 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold disabled:opacity-50">{loadingMore && <Loader2 size={16} className="animate-spin" />}{t("Muat lebih banyak")}</button>}
  </div></AppLayout>;
}
