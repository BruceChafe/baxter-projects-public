import React from 'react';
import AppBarComponent from './AppBarComponent';
import FooterComponent from '../sharedComponents/FooterComponent';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: "#6C5A91"
      }}
    >
      <Container
        component="main"
        maxWidth={isMobile ? 'sm' : 'md'}
        sx={{
          flexGrow: 1,
          paddingTop: theme.spacing(isMobile ? 8 : 10),
          paddingBottom: theme.spacing(4),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: "100vh",
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
