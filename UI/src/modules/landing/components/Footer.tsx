import { Box, Container, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getBrandConfig } from '../../../config/envConfig';

export function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const brandConfig = getBrandConfig();

    const sections = [
        {
            title: t('footer.sections.product.title'),
            links: [
                { label: t('footer.sections.product.features'), href: '#features' },
                { label: t('footer.sections.product.pricing'), href: '#pricing' },
                { label: t('footer.sections.product.security'), href: '#' },
            ],
        },
        {
            title: t('footer.sections.company.title'),
            links: [
                { label: t('footer.sections.company.about'), href: '#' },
                { label: t('footer.sections.company.blog'), href: '#' },
                { label: t('footer.sections.company.careers'), href: '#' },
            ],
        },
        {
            title: t('footer.sections.support.title'),
            links: [
                { label: t('footer.sections.support.helpCenter'), href: '#' },
                { label: t('footer.sections.support.contact'), href: '#' },
                { label: t('footer.sections.support.status'), href: '#' },
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
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: 4,
                        mb: 'var(--spacing-3xl)',
                    }}
                >
                    {sections.map((section) => (
                        <Box key={section.title}>
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
                        </Box>
                    ))}

                    {/* Newsletter */}
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'var(--font-weight-bold)',
                                marginBottom: 'var(--spacing-md)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            {t('footer.sections.newsletter.title')}
                        </Typography>
                        <Typography
                            sx={{
                                color: 'var(--text-secondary)',
                                fontSize: 'var(--font-size-sm)',
                                marginBottom: 'var(--spacing-md)',
                            }}
                        >
                            {t('footer.sections.newsletter.description')}
                        </Typography>
                    </Box>
                </Box>
            </Container>

            {/* Full-width Divider */}
            <Box
                sx={{
                    borderTop: '1px solid var(--border-primary)',
                    marginTop: 'var(--spacing-2xl)',
                    marginBottom: 'var(--spacing-2xl)',
                }}
            />

            {/* Bottom Section */}
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 'var(--spacing-lg)',
                    }}
                >
                    <Typography sx={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        {t('footer.copyright', { year: currentYear, brand: brandConfig.name })}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                        <Link href="#" sx={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                            {t('footer.legal.privacy')}
                        </Link>
                        <Link href="#" sx={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                            {t('footer.legal.terms')}
                        </Link>
                        <Link href="#" sx={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                            {t('footer.legal.cookies')}
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
