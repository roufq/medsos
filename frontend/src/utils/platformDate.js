let timezone, locale='id-ID';
export function configurePlatformDate(settings){
 try{if(settings.timezone){new Intl.DateTimeFormat('en',{timeZone:settings.timezone});timezone=settings.timezone;}}catch{timezone=undefined;}
 locale=settings.language==='en'?'en-US':'id-ID';
}
export function platformDate(value){return value?new Date(value).toLocaleString(locale,{timeZone:timezone}):'—';}
