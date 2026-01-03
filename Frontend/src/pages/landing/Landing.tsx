import { Footer, Header } from '@/components/common/layout';
import { CTA, Features, Hero } from '@/components/landing';
import { useNavigation } from '@/hooks/useNavigation';
import { Box } from '@mui/material';

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
        <Hero onSignup={handleSignup} />
        <Features />
        <CTA onGetStarted={handleSignup} />
      </Box>

      <Footer />
    </Box>
  );
}

export default LandingPage;
