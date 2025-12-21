import { Box } from '@mui/material';
import { Header, Footer } from '@/components/common/layout';
import { Hero, Features, Pricing, CTA } from '@/components/landing';
import { useNavigation } from '@/hooks/useNavigation';

/**
 * Landing page component
 * Main entry point with hero section, features, pricing, and CTA
 */
export function LandingPage() {
  const { goLogin } = useNavigation();

  const handleLogin = () => {
    goLogin();
  };

  const handleSignup = () => {
    goLogin(); // Redirect to auth page with signup mode
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

export default LandingPage;
