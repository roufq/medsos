import FeedbackHost from './components/common/FeedbackHost';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { LanguageProvider } from './context/LanguageProvider';
import AppRouter from './routes/AppRouter';
import { PlatformProvider } from './context/PlatformProvider';

function App() {
  return (
    <LanguageProvider>
    <ThemeProvider>
    <AuthProvider>
      <PlatformProvider><FeedbackHost /><AppRouter /></PlatformProvider>
    </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
