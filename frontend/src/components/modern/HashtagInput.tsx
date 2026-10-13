import { useLanguage } from '../../context/LanguageContext';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { parseTokens } from '../../utils/postFormat';

interface Props { value: string; onChange: (value: string) => void; textTags: string[]; maximum: number; minimum: number; }
export default function HashtagInput({ value, onChange, textTags, maximum, minimum }: Props) {
  const { t, language } = useLanguage();
  const [entry, setEntry] = useState('');
  const [notice, setNotice] = useState('');
  const tags = parseTokens(value, '#');
  const count = new Set([...tags, ...textTags]).size;
  const commit = (raw = entry) => {
    const incoming = parseTokens(raw.replace(/#/g, ' #'), '#');
    if (!incoming.length) return;
    const invalid = incoming.find((tag) => !/^[\p{L}\p{N}_]{2,63}$/u.test(tag));
    if (invalid) { setNotice('Gunakan 2?63 huruf, angka, atau garis bawah per hashtag.'); return; }
    const merged = [...tags];
    const all = new Set([...tags, ...textTags]);
    let limited = false;
    for (const tag of incoming) {
      if (all.has(tag)) continue;
      if (all.size >= maximum) { limited = true; continue; }
      merged.push(tag); all.add(tag);
    }
    onChange(merged.map((tag) => '#' + tag).join(' '));
    setEntry(''); setNotice(limited ? `Maksimal ${maximum} hashtag unik.` : '');
  };
  return <div className="new-post-hashtags">
    <label htmlFor="post-hashtag-entry">Hashtag</label>
    <div className="new-post-hashtag-entry"><input id="post-hashtag-entry" className="new-post-input" value={entry} placeholder={t("Ketik hashtag, lalu Enter")} onChange={(event) => {
      const raw = event.target.value;
      if (/[\s,]/.test(raw)) commit(raw); else { setEntry(raw); setNotice(''); }
    }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); commit(); } }} onBlur={() => { if (entry.trim()) commit(); }} onPaste={(event) => { const pasted = event.clipboardData.getData('text'); if (/[\s,#]/.test(pasted)) { event.preventDefault(); commit(entry + pasted); } }} /><button type="button" aria-label="Tambah hashtag" onMouseDown={(event) => event.preventDefault()} onClick={() => commit()} disabled={!entry.trim()}><Plus size={17} /></button></div>
    {tags.length > 0 && <div className="new-post-hashtag-chips">{tags.map((tag) => <span key={tag}>#{tag}<button type="button" aria-label={`Hapus hashtag ${tag}`} onClick={() => onChange(tags.filter((item) => item !== tag).map((item) => '#' + item).join(' '))}><X size={12} /></button></span>)}</div>}
    <small>{count}/{maximum} hashtag ? minimal {minimum}. Pisahkan dengan Enter, koma, atau spasi.</small>
    {textTags.length > 0 && <small>{language === 'en' ? 'Hashtags in the description are also counted.' : 'Hashtag dalam deskripsi ikut dihitung.'}</small>}
    {notice && <p role="alert">{notice}</p>}
  </div>;
}
