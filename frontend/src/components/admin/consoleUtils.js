export function csvText(rows) {
  return '\uFEFF'+rows.map(row=>row.map(value=>{
    let text=String(value??'');
    if (/^[\s]*[=+\-@]/.test(text)) text="'"+text;
    return '"'+text.replaceAll('"','""')+'"';
  }).join(',')).join('\r\n');
}
export function downloadCSV(name,rows){const url=URL.createObjectURL(new Blob([csvText(rows)],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function dateSeries(rows,days,now=new Date()) {const values=new Map(rows.map(row=>[String(row.date).slice(0,10),Number(row.count)||0]));return Array.from({length:days},(_,i)=>{const date=new Date(now);date.setUTCDate(date.getUTCDate()-days+1+i);const key=date.toISOString().slice(0,10);return {date:key,count:values.get(key)||0};});}

export const number=value=>new Intl.NumberFormat('id-ID').format(value||0);
export {platformDate as date} from '../../utils/platformDate.js';
export const thumb=post=>post?.media?.find(media=>media.media_type==='image')?.media_url||post?.media?.find(media=>media.thumbnail_url)?.thumbnail_url||post?.link?.image_url;
