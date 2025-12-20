import { Box, Container, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Card } from '../common/ui';
import { Button } from '../common/ui';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface PricingProps {
    onSelectPlan?: (plan: 'free' | 'paid') => void;
}

export function Pricing({ onSelectPlan }: PricingProps) {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: 'Forever',
            description: 'Perfect for getting started',
            features: [
                '5 URLs per week',
                'Basic analytics',
                'Standard support',
                'LinkShort branding',
            ],
            cta: 'Get Started',
            highlighted: false,
        },
        {
            name: 'Premium',
            price: '$9.99',
            period: 'Per month',
            description: 'For professionals and businesses',
            features: [
                'Unlimited URLs',
                'Advanced analytics',
                'Priority support',
                'Custom branding',
                'API access',
                'Team collaboration',
            ],
            cta: 'Start Free Trial',
            highlighted: true,
        },
    ];

    return (
        <Box
            component="section"
            id="pricing"
            sx={{
                padding: { xs: 'var(--spacing-3xl) var(--spacing-lg)', md: 'var(--spacing-3xl) var(--spacing-lg)' },
                backgroundColor: 'var(--bg-primary)',
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', marginBottom: 'var(--spacing-3xl)' }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: 'var(--font-size-3xl)', md: 'var(--font-size-4xl)' },
                            fontWeight: 'var(--font-weight-bold)',
                            marginBottom: 'var(--spacing-md)',
                            color: 'var(--text-primary)',
                        }}
                    >
                        Simple Pricing
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 'var(--font-size-lg)',
                            color: 'var(--text-secondary)',
                            maxWidth: '600px',
                            margin: '0 auto',
                        }}
                    >
                        Choose the plan that works best for you. Upgrade or downgrade anytime.
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        gap: 3,
                        justifyItems: 'center',
                        maxWidth: '900px',
                        margin: '0 auto',
                        padding: { xs: 0, sm: '0 var(--spacing-lg)' },
                    }}
                >
                    {plans.map((plan, index) => (
                        <Box key={index} sx={{ width: '100%', maxWidth: '380px' }}>
                            <Card
                                variant={plan.highlighted ? 'elevation' : 'outlined'}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
                                    borderColor: plan.highlighted ? 'var(--color-primary)' : 'var(--border-primary)',
                                    borderWidth: plan.highlighted ? '2px' : '1px',
                                    position: 'relative',
                                    transition: 'all var(--transition-normal)',
                                    overflow: plan.highlighted ? 'visible' : 'hidden',
                                }}
                            >
                                {plan.highlighted && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '-12px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'var(--text-inverse)',
                                            padding: 'var(--spacing-xs) var(--spacing-md)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 'var(--font-weight-bold)',
                                        }}
                                    >
                                        Most Popular
                                    </Box>
                                )}

                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 'var(--font-weight-bold)',
                                            marginBottom: 'var(--spacing-sm)',
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        {plan.name}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: 'var(--text-secondary)',
                                            marginBottom: 'var(--spacing-lg)',
                                            fontSize: 'var(--font-size-sm)',
                                        }}
                                    >
                                        {plan.description}
                                    </Typography>

                                    <Box sx={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <Typography
                                            sx={{
                                                fontSize: 'var(--font-size-4xl)',
                                                fontWeight: 'var(--font-weight-bold)',
                                                color: 'var(--color-primary)',
                                            }}
                                        >
                                            {plan.price}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: 'var(--font-size-sm)',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            {plan.period}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant={plan.highlighted ? 'contained' : 'outlined'}
                                        fullWidth
                                        onClick={() => onSelectPlan?.(plan.name.toLowerCase() as 'free' | 'paid')}
                                        sx={{ marginBottom: 'var(--spacing-lg)' }}
                                    >
                                        {plan.cta}
                                    </Button>

                                    <List sx={{ gap: 'var(--spacing-md)', display: 'flex', flexDirection: 'column' }}>
                                        {plan.features.map((feature, idx) => (
                                            <ListItem
                                                key={idx}
                                                sx={{
                                                    padding: 0,
                                                    gap: 'var(--spacing-md)',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: '24px', color: 'var(--color-success)', marginTop: '2px' }}>
                                                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={feature}
                                                    sx={{
                                                        '& .MuiListItemText-primary': {
                                                            color: 'var(--text-secondary)',
                                                            fontSize: 'var(--font-size-sm)',
                                                        },
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Card>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
