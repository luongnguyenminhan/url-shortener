import React from 'react';
import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';

interface ButtonProps extends MuiButtonProps {
    children: React.ReactNode;
    variant?: 'contained' | 'outlined' | 'text';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'contained',
    size = 'medium',
    fullWidth = false,
    className,
    sx,
    ...props
}: ButtonProps) {
    return (
        <MuiButton
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            sx={{
                textTransform: 'none',
                fontSize: size === 'small' ? 'var(--font-size-sm)' : 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                borderRadius: 'var(--radius-md)',
                padding:
                    size === 'small'
                        ? 'var(--spacing-xs) var(--spacing-md)'
                        : size === 'large'
                            ? 'var(--spacing-md) var(--spacing-xl)'
                            : 'var(--spacing-sm) var(--spacing-lg)',
                transition: 'all var(--transition-fast)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-md)',
                },
                '&:focus': {
                    outline: '2px solid var(--border-focus)',
                    outlineOffset: '2px',
                },
                ...sx,
            }}
            className={className}
            {...props}
        >
            {children}
        </MuiButton>
    );
}
