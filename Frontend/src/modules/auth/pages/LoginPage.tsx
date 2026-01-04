import React from 'react';
import { Box, Container } from '@mui/material';
import { DynamicFormContent } from '../components/DynamicFormContent';

const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <DynamicFormContent initialMode="login" />
      </Box>
    </Container>
  );
};

export default LoginPage;