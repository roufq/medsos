import {configurePlatformDate} from '../utils/platformDate';
import { PlatformContext } from './PlatformContext';
import {useLanguage} from './LanguageContext';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import api from '../api/axios';


export function PlatformProvider({ children }) {
 const {setLanguage}=useLanguage();const missingLanguage=useRef((()=>{try{return !localStorage.getItem('theposter-language')}catch{return false}})());
  const [uploadLimitsEnabled, setEnabled] = useState(false);
 const [settings,setSettings]=useState(null);
  const refreshSettings = useCallback(async () => {
    const { data } = await api.get('/platform/settings');
    configurePlatformDate(data);setEnabled(Boolean(data.upload_limits_enabled));setSettings(data);
  }, []);
  useEffect(() => {
    let active = true;
    api.get('/platform/settings').then(({ data }) => {
      if (active) {configurePlatformDate(data);setEnabled(Boolean(data.upload_limits_enabled));setSettings(data);}
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(()=>{if(settings?.language&&missingLanguage.current){missingLanguage.current=false;setLanguage(settings.language);}},[settings?.language,setLanguage]);
  const value = useMemo(() => ({ uploadLimitsEnabled, refreshSettings, settings }), [uploadLimitsEnabled, refreshSettings, settings]);
  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}
