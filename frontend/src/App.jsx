import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRouter from './routes/AppRouter';
import { PlatformProvider } from './context/PlatformContext';

function App() {
  return (
    <LanguageProvider>
    <ThemeProvider>
    <AuthProvider>
      <PlatformProvider><AppRouter /></PlatformProvider>
    </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
