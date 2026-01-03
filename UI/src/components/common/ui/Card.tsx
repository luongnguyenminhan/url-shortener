import React from 'react';
import { Card as MuiCard } from '@mui/material';
import type { CardProps as MuiCardProps } from '@mui/material/Card';

interface CardProps extends MuiCardProps {
    children: React.ReactNode;
    variant?: 'outlined' | 'elevation';
    hover?: boolean;
}

export function Card({ children, variant = 'elevation', hover = true, sx, ...props }: CardProps) {
    return (
        <MuiCard
            variant={variant}
            sx={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-lg)',
                transition: 'all var(--transition-normal)',
                boxShadow: variant === 'elevation' ? 'var(--shadow-md)' : 'none',
                border: variant === 'outlined' ? '1px solid var(--border-primary)' : 'none',
                ...(hover && {
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 'var(--shadow-lg)',
                    },
                }),
                ...sx,
            }}
            {...props}
        >
            {children}
        </MuiCard>
    );
}
