import React from 'react';
import { Box, Container, Link, Grid, Typography } from '@mui/material';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Security', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Status', href: '#' },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-primary)',
        padding: 'var(--spacing-3xl) var(--spacing-lg)',
        marginTop: 'var(--spacing-3xl)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 'var(--spacing-3xl)' }}>
          {sections.map((section) => (
            <Grid item xs={12} sm={6} md={3} key={section.title}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--spacing-md)',
                  color: 'var(--text-primary)',
                }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    sx={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)',
                      '&:hover': {
                        color: 'var(--color-primary)',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--spacing-md)',
                color: 'var(--text-primary)',
              }}
            >
              Newsletter
            </Typography>
            <Typography
              sx={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              Subscribe to get updates on new features
            </Typography>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 'var(--spacing-2xl)',
            borderTop: '1px solid var(--border-primary)',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 'var(--spacing-lg)',
          }}
        >
          <Typography sx={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            © {currentYear} LinkShort. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
            <Link href="#" sx={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Privacy
            </Link>
            <Link href="#" sx={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Terms
            </Link>
            <Link href="#" sx={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
