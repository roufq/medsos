const empty=Object.freeze([]);
let items=empty,sequence=0;
const listeners=new Set();
export function feedbackSnapshot(){return items;}
export function emptyFeedbackSnapshot(){return empty;}
export function subscribeFeedback(listener){listeners.add(listener);return()=>listeners.delete(listener);}
function publish(){for(const listener of listeners)listener();}
export function dismissFeedback(id){items=items.filter(item=>item.id!==id);publish();}
export function clearFeedback(){items=empty;publish();}
export function showFeedback(message,type='info'){
 if(typeof message!=='string'||!message.trim())return;
 const text=message.trim().slice(0,600),now=Date.now();
 if(items.some(item=>item.message===text&&item.type===type&&now-item.created<750))return;
 const item={id:++sequence,message:text,type:['success','error','info'].includes(type)?type:'info',created:now};
 items=[...items.slice(-2),item];publish();return item.id;
}
export const notify={success:message=>showFeedback(message,'success'),error:message=>showFeedback(message,'error'),info:message=>showFeedback(message,'info')};

export function fieldValidationMessage(field){
 const label=field.getAttribute?.('aria-label')||field.labels?.[0]?.textContent||field.getAttribute?.('placeholder')||field.name||'';
 const name=String(label).trim().replace(/\s+/g,' ').slice(0,80);
 const detail=field.validationMessage||'Periksa kembali isian ini.';
 return name?`${name}: ${detail}`:detail;
}
