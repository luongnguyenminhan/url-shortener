import React, { useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { Input, Button } from '../ui';

interface URLShortenerFormProps {
  onSubmit?: (url: string) => Promise<string>;
  loading?: boolean;
  error?: string;
}

export function URLShortenerForm({ onSubmit, loading = false, error }: URLShortenerFormProps) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(error);

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setIsError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setIsError('Please enter a valid URL (starting with http:// or https://)');
      return;
    }

    setIsError('');
    setIsLoading(true);

    try {
      if (onSubmit) {
        const shortUrl = await onSubmit(url);
        setResult(shortUrl);
        setUrl('');
      } else {
        // Mock response for demo
        setResult('linkshort.io/abc123');
      }
    } catch (err) {
      setIsError((err as Error).message || 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {isError && (
        <Alert
          severity="error"
          onClose={() => setIsError('')}
          sx={{ marginBottom: 'var(--spacing-md)' }}
        >
          {isError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Input
          placeholder="Enter your long URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading || loading}
          fullWidth
          sx={{ flex: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || loading}
          sx={{
            minWidth: { xs: '100%', sm: '150px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-sm)',
          }}
        >
          {isLoading || loading ? (
            <>
              <CircularProgress size={20} color="inherit" />
              Shortening...
            </>
          ) : (
            'Shorten URL'
          )}
        </Button>
      </Box>

      {result && (
        <Box
          sx={{
            marginTop: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <Box sx={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
            Your shortened URL:
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <Box
              sx={{
                flex: 1,
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-family-mono)',
                color: 'var(--color-primary)',
                wordBreak: 'break-all',
              }}
            >
              {result}
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(result);
              }}
              sx={{
                whiteSpace: 'nowrap',
                minWidth: '100px',
              }}
            >
              Copy
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
