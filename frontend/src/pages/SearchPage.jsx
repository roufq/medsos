import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Search, Image, Play, ShoppingBag, LayoutGrid, Users, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { socialApi } from '../api/socialApi';
import { profileUrl } from '../utils/profileUrl';
import { uniquePosts, filterResults, postKind } from '../utils/discovery';
import AppLayout from '../components/modern/AppLayout';
import DiscoveryCard from '../components/modern/DiscoveryCard';

export default function SearchPage() {
  const { t } = useLanguage();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [input, setInput] = useState(query), [loadedQuery, setLoadedQuery] = useState(query);
  const [kind, setKind] = useState('all'), [sort, setSort] = useState('relevant'), [period, setPeriod] = useState('all'), [location, setLocation] = useState('');
  const [results, setResults] = useState(null), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  if (loadedQuery !== query) { setLoadedQuery(query); setInput(query); setResults(null); setError(''); setKind('all'); setPeriod('all'); setLocation(''); }
  useEffect(() => {
    if (query.trim().length < 2 || query.trim().toLowerCase() === 'shop') return;
    let active = true;
    socialApi.search(query.trim()).then(data => { if (active) setResults(data); }).catch(e => { if (active) setError(e.response?.data?.error || 'Pencarian gagal'); });
    return () => { active = false; };
  }, [query,retry]);
  const posts = uniquePosts([...(results?.posts || []), ...(results?.products || [])]);
  const filtered = filterResults(posts,{kind:kind==='users'?'all':kind,sort,period,location});
  const locations = [...new Set(posts.map(post=>post.location).filter(Boolean))];
  const tabs = [['all','Semua',LayoutGrid,posts.length],['image','Gambar',Image,posts.filter(p=>postKind(p)==='image').length],['video','Video',Play,posts.filter(p=>postKind(p)==='video').length],['shop','Shop',ShoppingBag,posts.filter(p=>postKind(p)==='shop').length],['users','Akun',Users,results?.users?.length || 0]];
  const update = post => setResults(current=>({...current,posts:(current.posts || []).map(p=>p.id===post.id?post:p),products:(current.products || []).map(p=>p.id===post.id?post:p)}));
  if (query.trim().toLowerCase() === 'shop') return <Navigate to="/shop" replace/>;
  return <AppLayout wide currentTab="search"><div className="reference-search">
    <section className="reference-search-main">
      <h1><Search size={27}/>{query ? <>{t('Hasil pencarian untuk')} “{query}”</> : t('Pencarian')}</h1>
      <div className="discovery-toolbar"><nav aria-label={t('Jenis postingan')}>{tabs.map(([id,label,,count])=><button key={id} className={kind===id?'active':''} aria-pressed={kind===id} onClick={()=>setKind(id)}>{t(label)}{results && <small>{count}</small>}</button>)}</nav><label>{t('Urutkan')}<select value={sort} disabled={kind==='users'} onChange={e=>setSort(e.target.value)} aria-label={t('Urutkan hasil pencarian')}><option value="relevant">{t('Relevan')}</option><option value="latest">{t('Terbaru')}</option><option value="popular">{t('Terpopuler')}</option></select></label></div>
      {results && <p className="discovery-result-count">{t('Hasil yang dimuat')}: {kind==='users'?(results.users || []).length:filtered.length}</p>}
      {error && <div role="alert" className="reference-empty"><p>{t(error)}</p><button onClick={()=>{setError('');setRetry(value=>value+1);}}>{t('Coba lagi')}</button></div>}
      {query.trim().length>=2 && !results && !error && <p role="status" className="reference-empty"><Loader2 className="animate-spin"/>{t('Memuat…')}</p>}
      {query.trim().length<2 && <p className="reference-empty">{t('Masukkan minimal 2 karakter untuk mencari.')}</p>}
      {results && kind!=='users' && <div className="discovery-masonry">{filtered.map(post=><DiscoveryCard key={post.id} post={post} onUpdated={update}/>)}</div>}
      {results && kind==='users' && <div className="discovery-users">{(results.users || []).map(user=><Link key={user.id} to={profileUrl(user)}><img src={user.avatar_url || `${import.meta.env.BASE_URL}favicon.svg`} alt=""/><span><strong>{user.name}</strong><small>@{user.username}</small></span></Link>)}</div>}
      {results && (kind==='users' ? !(results.users || []).length : !filtered.length) && <p className="reference-empty">{t('Tidak ada hasil untuk pilihan ini.')}</p>}
    </section>
    <aside className="reference-search-filters">
      <form onSubmit={e=>{e.preventDefault();setParams({q:input.trim()});}}><Search size={16}/><input value={input} onChange={e=>setInput(e.target.value)} aria-label={t('Cari')} placeholder={t('Cari')}/><button type="submit">{t('Cari')}</button></form>
      <fieldset><legend>{t('Filter Pencarian')}</legend>{tabs.map(([id,label,Icon,count])=><button key={id} className={kind===id?'active':''} aria-pressed={kind===id} onClick={()=>setKind(id)}><Icon size={16}/>{t(label)}<span>{count}</span></button>)}</fieldset>
      <fieldset disabled={kind==='users'}><legend>{t('Urutkan Berdasarkan')}</legend>{[['relevant','Relevan'],['latest','Terbaru'],['popular','Terpopuler']].map(([id,label])=><label key={id}><input type="radio" name="result-sort" checked={sort===id} onChange={()=>setSort(id)}/>{t(label)}</label>)}</fieldset>
      <fieldset disabled={kind==='users'}><legend>{t('Waktu')}</legend>{[['all','Semua Waktu'],['today','Hari Ini'],['week','7 hari terakhir'],['month','Sebulan terakhir']].map(([id,label])=><label key={id}><input type="radio" name="result-period" checked={period===id} onChange={()=>setPeriod(id)}/>{t(label)}</label>)}</fieldset>
      <fieldset disabled={kind==='users'}><legend>{t('Lokasi')}</legend><label><input type="radio" name="result-location" checked={!location} onChange={()=>setLocation('')}/>{t('Semua Lokasi')}</label>{locations.map(name=><label key={name}><input type="radio" name="result-location" checked={location===name} onChange={()=>setLocation(name)}/>{name}</label>)}</fieldset>
    </aside>
  </div></AppLayout>;
}
