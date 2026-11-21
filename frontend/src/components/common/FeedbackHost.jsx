import {useEffect,useSyncExternalStore} from 'react';
import {createPortal} from 'react-dom';
import {CheckCircle2,AlertCircle,Info,X} from 'lucide-react';
import {useLanguage} from '../../context/LanguageContext';
import {subscribeFeedback,feedbackSnapshot,emptyFeedbackSnapshot,dismissFeedback,notify,fieldValidationMessage} from '../../utils/feedback';
import './FeedbackHost.css';

function FeedbackItem({item}){
 const {t}=useLanguage();
 const duration=item.type==='error'?7000:4000;
 useEffect(()=>{
  const timer=setTimeout(()=>dismissFeedback(item.id),duration);
  return()=>clearTimeout(timer);
 },[item.id,duration]);
 const Icon=item.type==='success'?CheckCircle2:item.type==='error'?AlertCircle:Info;
 return <div className={`form-feedback form-feedback-${item.type}`} role={item.type==='error'?'alert':'status'} aria-atomic="true" style={{'--feedback-duration':`${duration}ms`}}>
  <Icon size={19} aria-hidden="true"/><p>{t(item.message)}</p>
  <button type="button" onClick={()=>dismissFeedback(item.id)} aria-label={t('Tutup pemberitahuan')}><X size={16}/></button>
  <span className="form-feedback-countdown" aria-hidden="true"/>
 </div>;
}
export default function FeedbackHost(){
 const items=useSyncExternalStore(subscribeFeedback,feedbackSnapshot,emptyFeedbackSnapshot);
 useEffect(()=>{
  let queued=false,active=true;
  const invalid=event=>{
   if(queued)return;queued=true;const message=fieldValidationMessage(event.target);
   queueMicrotask(()=>{queued=false;if(active)notify.error(message);});
  };
  document.addEventListener('invalid',invalid,true);
  return()=>{active=false;document.removeEventListener('invalid',invalid,true);};
 },[]);
 if(typeof document==='undefined')return null;
 return createPortal(<div className="form-feedback-stack">{items.map(item=><FeedbackItem key={item.id} item={item}/>)}</div>,document.body);
}
