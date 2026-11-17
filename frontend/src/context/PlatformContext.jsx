import { createContext, useContext } from 'react';

export const PlatformContext = createContext({ uploadLimitsEnabled: false, refreshSettings: async () => {} });

export const usePlatform = () => useContext(PlatformContext);
