import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <LanguageProvider>
    <ThemeProvider>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
