import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CTA, Features, Footer, Header, Hero } from '../components';
import { ROUTES } from '../../../constants';


export function LandingPage() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate(ROUTES.LOGIN);
    };

    const handleSignup = () => {
        navigate(ROUTES.LOGIN);
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
