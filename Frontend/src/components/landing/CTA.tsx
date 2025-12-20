import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Button } from '../ui';

interface CTAProps {
  onGetStarted?: () => void;
}

export function CTA({ onGetStarted }: CTAProps) {
  return (
    <Box
      component="section"
      id="cta"
      sx={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        color: 'var(--text-inverse)',
        padding: { xs: 'var(--spacing-3xl) var(--spacing-lg)', md: 'var(--spacing-3xl) var(--spacing-lg)' },
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 'var(--font-size-3xl)', md: 'var(--font-size-4xl)' },
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          Ready to Get Started?
        </Typography>

        <Typography
          sx={{
            fontSize: 'var(--font-size-lg)',
            marginBottom: 'var(--spacing-2xl)',
            opacity: 0.95,
            lineHeight: 'var(--line-height-relaxed)',
          }}
        >
          Join thousands of users who are shortening URLs and tracking performance with LinkShort. Sign up today and get
          5 free URL shortens.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            justifyContent: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={onGetStarted}
            sx={{
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-primary)',
              '&:hover': {
                backgroundColor: 'var(--color-gray-100)',
              },
            }}
          >
            Create Free Account
          </Button>
          <Button
            variant="outlined"
            size="large"
            href="mailto:support@linkshort.io"
            sx={{
              borderColor: 'var(--text-inverse)',
              color: 'var(--text-inverse)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Contact Sales
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
