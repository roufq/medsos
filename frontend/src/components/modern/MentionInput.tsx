import { useEffect, useState } from 'react';
import { AtSign, X, Loader2 } from 'lucide-react';
import { socialApi } from '../../api/socialApi';
import { networkApi } from '../../api/networkApi';
import { userApi } from '../../api/userApi';
import { parseTokens } from '../../utils/postFormat';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
interface Props { value: string; onChange: (value: string) => void; textMentions: string[]; maximum: number; }
export default function MentionInput({ value, onChange, textMentions, maximum }: Props) {
  const { t } = useLanguage(); const { user } = useAuth();
  const [query, setQuery] = useState(''); const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [highlight, setHighlight] = useState(0);
  const selected = parseTokens(value, '@'); const all = new Set([...selected, ...textMentions]);
  useEffect(() => {
    if (!open) return;
    let active = true; setLoading(true); setError('');
    const timer = window.setTimeout(async () => {
      try {
        const clean = query.trim().replace(/^@+/, '');
        const results = clean.length >= 2 ? (await socialApi.search(clean)).users : !clean ? await networkApi.getSuggestions() : [];
        if (active) { setSuggestions((results || []).filter((item: any) => item.username && String(item.id) !== String(user?.id) && !all.has(item.username.toLowerCase())).slice(0, 6)); setHighlight(0); }
      } catch { if (active) { setSuggestions([]); setError(t('Gagal mencari pengguna.')); } }
      finally { if (active) setLoading(false); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [query, open, value, user?.id]);
  const add = (account: any) => {
    const username = account.username?.toLowerCase();
    if (!username || String(account.id) === String(user?.id)) { setError(t('Pilih pengguna lain untuk mention.')); return; }
    if (all.has(username)) { setQuery(''); return; }
    if (all.size >= maximum) { setError(t('Batas mention sudah tercapai.')); return; }
    onChange([...selected, username].map((name) => '@' + name).join(' ')); setQuery(''); setOpen(false); setError('');
  };
  const addExact = async () => {
    const clean = query.trim().replace(/^@+/, '').toLowerCase();
    if (!/^[a-z0-9_]{3,40}$/.test(clean)) { setError(t('Masukkan username yang valid.')); return; }
    setLoading(true);
    try { add(await userApi.getProfile('@' + clean)); }
    catch { setError(t('Username tidak ditemukan atau tidak dapat di-mention.')); }
    finally { setLoading(false); }
  };
  return <div className="new-post-mentions"><label htmlFor="post-mention-entry">Mention</label><div className="mention-search"><AtSign size={16} /><input id="post-mention-entry" role="combobox" aria-expanded={open} aria-controls="mention-suggestions" autoComplete="off" value={query} placeholder={t('Cari nama atau @username')} onFocus={()=>setOpen(true)} onChange={(event)=>{setQuery(event.target.value);setOpen(true);setError('')}} onKeyDown={(event)=>{if(event.key==='Escape')setOpen(false);if(event.key==='ArrowDown'){event.preventDefault();setHighlight((index)=>Math.min(index+1,suggestions.length-1))}if(event.key==='ArrowUp'){event.preventDefault();setHighlight((index)=>Math.max(0,index-1))}if(event.key==='Enter'){event.preventDefault();if(open&&suggestions.length)add(suggestions[highlight]||suggestions[0]);else addExact()}}}/>{loading&&<Loader2 size={15} className="animate-spin"/>}</div>
    {open && <div id="mention-suggestions" role="listbox" className="mention-suggestions">{suggestions.map((account,index)=><button key={account.id} role="option" aria-selected={highlight===index} type="button" onClick={()=>add(account)} onMouseEnter={()=>setHighlight(index)}>{account.avatar_url?<img src={account.avatar_url} alt=""/>:<span>{account.name?.slice(0,1)}</span>}<div><strong>{account.name}</strong><small>@{account.username}</small></div></button>)}{!loading&&!suggestions.length&&<p>{t(query.trim().length<2?'Ketik minimal 2 karakter untuk mencari pengguna.':'Tidak ada pengguna yang cocok.')}</p>}</div>}
    {selected.length>0&&<div className="new-post-hashtag-chips">{selected.map((name)=><span key={name}>@{name}<button type="button" aria-label={`${t('Hapus mention')} ${name}`} onClick={()=>onChange(selected.filter((item)=>item!==name).map((item)=>'@'+item).join(' '))}><X size={12}/></button></span>)}</div>}
    <small>{all.size}/{maximum} {t('akun')} ? {t('Pilih pengguna dari hasil pencarian.')}</small>{error&&<p role="alert" className="text-error text-xs">{error}</p>}
  </div>;
}
