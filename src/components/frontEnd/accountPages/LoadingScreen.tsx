// LoadingScreen.tsx
import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

const LoadingScreen = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.modal + 1,
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          marginBottom: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: theme.palette.text.primary,
          fontWeight: 500,
        }}
      >
        Setting up your account...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;