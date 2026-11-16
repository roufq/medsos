import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const PlatformContext = createContext({ uploadLimitsEnabled: false, refreshSettings: async () => {} });
export function PlatformProvider({ children }) {
  const [uploadLimitsEnabled, setEnabled] = useState(false);
  const refreshSettings = async () => {
    const { data } = await api.get('/platform/settings');
    setEnabled(Boolean(data.upload_limits_enabled));
  };
  useEffect(() => { refreshSettings().catch(() => {}); }, []);
  return <PlatformContext.Provider value={{ uploadLimitsEnabled, refreshSettings }}>{children}</PlatformContext.Provider>;
}
export const usePlatform = () => useContext(PlatformContext);
