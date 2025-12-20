import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface InputProps extends TextFieldProps {
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

export function Input({
  label,
  placeholder,
  error = false,
  helperText,
  variant = 'outlined',
  fullWidth = true,
  size = 'medium',
  sx,
  ...props
}: InputProps) {
  return (
    <TextField
      label={label}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      variant={variant}
      fullWidth={fullWidth}
      size={size}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-base)',
          '& fieldset': {
            borderColor: 'var(--border-primary)',
          },
          '&:hover fieldset': {
            borderColor: 'var(--color-primary)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--border-focus)',
            boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
          },
        },
        '& .MuiInputBase-input::placeholder': {
          color: 'var(--text-tertiary)',
          opacity: 1,
        },
        '& .MuiInputLabel-root': {
          color: 'var(--text-secondary)',
          '&.Mui-focused': {
            color: 'var(--color-primary)',
          },
        },
        ...sx,
      }}
      {...props}
    />
  );
}
