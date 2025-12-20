import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { URLShortenerForm } from '../forms';
import { Button } from '../ui';

interface HeroProps {
  onShortenUrl?: (url: string) => Promise<string>;
  onSignup?: () => void;
}

export function Hero({ onShortenUrl, onSignup }: HeroProps) {
  return (
    <Box
      component="section"
      id="hero"
      sx={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        color: 'var(--text-inverse)',
        padding: { xs: 'var(--spacing-3xl) var(--spacing-lg)', md: 'var(--spacing-3xl) var(--spacing-lg)' },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-50%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 'var(--spacing-2xl)',
            padding: { xs: 'var(--spacing-2xl) 0', md: 'var(--spacing-3xl) 0' },
          }}
        >
          {/* Headline */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: 'var(--font-size-3xl)', md: 'var(--font-size-5xl)' },
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: 'var(--line-height-tight)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            Shorten URLs, Track Performance
          </Typography>

          {/* Subheading */}
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: 'var(--font-size-lg)', md: 'var(--font-size-xl)' },
              fontWeight: 'var(--font-weight-normal)',
              opacity: 0.95,
              maxWidth: '600px',
              lineHeight: 'var(--line-height-relaxed)',
            }}
          >
            Create custom short URLs, monitor traffic in real-time, and gain actionable insights with LinkShort
          </Typography>

          {/* URL Shortener Form */}
          <Box
            sx={{
              width: '100%',
              maxWidth: '600px',
              marginTop: 'var(--spacing-2xl)',
            }}
          >
            <URLShortenerForm onSubmit={onShortenUrl} />
          </Box>

          {/* CTA Button */}
          <Box
            sx={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              flexDirection: { xs: 'column', sm: 'row' },
              marginTop: 'var(--spacing-2xl)',
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={onSignup}
              sx={{
                backgroundColor: 'var(--color-white)',
                color: 'var(--color-primary)',
                '&:hover': {
                  backgroundColor: 'var(--color-gray-100)',
                },
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="#features"
              sx={{
                borderColor: 'var(--text-inverse)',
                color: 'var(--text-inverse)',
                '&:hover': {
                  borderColor: 'var(--text-inverse)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
