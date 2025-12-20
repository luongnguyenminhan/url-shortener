import { useEffect } from 'react';
import { ThemeProvider, Box } from '@mui/material';
import { useTheme } from './hooks/useTheme';
import { createAppTheme } from './theme';
import { Header, Footer } from './components/common/layout';
import { Hero, Features, Pricing, CTA } from './components/landing';
import './styles/globals.css';

function AppContent() {
  const { theme: mode } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const handleSignup = () => {
    console.log('Redirecting to signup...');
    // TODO: Navigate to signup page
  };

  const handleLogin = () => {
    console.log('Redirecting to login...');
    // TODO: Navigate to login page
  };

  const handleShortenUrl = async (url: string) => {
    console.log('Shortening URL:', url);
    // TODO: Call API to shorten URL
    return 'linkshort.io/example';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <Header onLogin={handleLogin} onSignup={handleSignup} />

      <Box component="main" sx={{ flex: 1 }}>
        <Hero onShortenUrl={handleShortenUrl} onSignup={handleSignup} />
        <Features />
        <Pricing onSelectPlan={(plan) => console.log('Selected plan:', plan)} />
        <CTA onGetStarted={handleSignup} />
      </Box>

      <Footer />
    </Box>
  );
}

export default function App() {
  const { theme: mode } = useTheme();
  const theme = createAppTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <AppContent />
    </ThemeProvider>
  );
}