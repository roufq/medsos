import {useEffect,useRef} from 'react';
import {thumb,number} from './consoleUtils';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
export function Avatar({user,size=38}){return <img className="console-avatar" src={user?.avatar_url||`${import.meta.env.BASE_URL}images/postter-logo.png`} width={size} height={size} alt=""/>;}
export function Badge({children,tone=''}){return <span className={`console-badge ${tone}`}>{children}</span>;}
export function Verified({user}){return user?.is_blue_verified?<CheckCircle2 size={17} className="console-blue" aria-label="Verified"/>:null;}
export function Cards({items}){return <div className="console-metrics">{items.map(([label,value,Icon])=><article key={label}><span className="console-metric-icon">{Icon&&<Icon size={30}/>}</span><div><strong>{number(value)}</strong><small>{label}</small></div></article>)}</div>;}
export function Pager({page,total,size=20,onChange,disabled=false}){const pages=Math.max(1,Math.ceil(total/size));return <footer className="console-pager"><span>{total?`${(page-1)*size+1}–${Math.min(total,page*size)} / ${number(total)}`:'0'}</span><button aria-label="Previous page" disabled={page<=1||disabled} onClick={()=>onChange(page-1)}><ChevronLeft size={17}/></button><b>{page} / {pages}</b><button aria-label="Next page" disabled={page>=pages||disabled} onClick={()=>onChange(page+1)}><ChevronRight size={17}/></button></footer>;}
export function Modal({title,onClose,children}){
 const ref=useRef(null), close=useRef(onClose);
 useEffect(()=>{close.current=onClose;},[onClose]);
 useEffect(()=>{
  const previous=document.activeElement, dialog=ref.current;
  const controls=()=>Array.from(dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')).filter(el=>el.getClientRects().length);
  controls()[0]?.focus();
  const key=e=>{if(e.key==='Escape'){e.preventDefault();close.current();}if(e.key==='Tab'){const items=controls(),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  dialog.addEventListener('keydown',key);return()=>{dialog.removeEventListener('keydown',key);previous?.focus();};
 },[]);
 return <div className="console-overlay" onClick={onClose}><section ref={ref} className="console-modal" role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()}><header><h2>{title}</h2><button onClick={onClose} aria-label="Close"><X size={20}/></button></header>{children}</section></div>;
}
export function Preview({post}){const image=thumb(post);return image?<img className="console-preview" src={image} alt=""/>:<div className="console-no-preview">{post?.post_type||'Content'}</div>;}
