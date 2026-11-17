import { PlatformContext } from './PlatformContext';
import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';


export function PlatformProvider({ children }) {
  const [uploadLimitsEnabled, setEnabled] = useState(false);
  const refreshSettings = useCallback(async () => {
    const { data } = await api.get('/platform/settings');
    setEnabled(Boolean(data.upload_limits_enabled));
  }, []);
  useEffect(() => {
    let active = true;
    api.get('/platform/settings').then(({ data }) => {
      if (active) setEnabled(Boolean(data.upload_limits_enabled));
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return <PlatformContext.Provider value={{ uploadLimitsEnabled, refreshSettings }}>{children}</PlatformContext.Provider>;
}
