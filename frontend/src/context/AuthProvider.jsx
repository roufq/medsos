import { AuthContext } from './AuthContext';
import IdleSession from '../components/common/IdleSession';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tokens live in httpOnly cookies now, so JS can't check for their
    // presence up front - just ask the API who's logged in and treat a
    // failure (401) as "not authenticated".
    const loadCurrentUser = async () => {
      try {
        const currentUser = await userApi.getProfile('me');
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadCurrentUser();
  }, []);

  // `loading` only covers the initial session check; toggling it here would
  // unmount the login/register page (PublicRoute) and lose its error state.
  const login = useCallback(async (email, password, otp) => {
    const data = await authApi.login(email, password, otp);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password, extra = {}) => {
    const data = await authApi.register(name, email, password, extra);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      if('serviceWorker' in navigator){try{const registration=await navigator.serviceWorker.getRegistration('/');const subscription=await registration?.pushManager.getSubscription();if(subscription){await authApi.unsubscribePush(subscription.toJSON());await subscription.unsubscribe();}}catch{/* Logout still completes when push cleanup is unavailable. */}}
      await authApi.logout();
    } catch (e) {
      console.error('Logout API failed:', e);
    }
    setUser(null);
    try { localStorage.setItem('theposter-logout', String(Date.now())); } catch { /* storage disabled */ }
  }, []);

  const updateProfileState = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    updateProfileState,
    isAuthenticated: !!user,
  }), [user, loading, login, register, logout, updateProfileState]);

  return (
    <AuthContext.Provider value={value}>
      <IdleSession key={user?.id || "guest"} />
      {children}
    </AuthContext.Provider>
  );
};

