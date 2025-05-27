import React, { ReactNode, useState, useCallback, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Toolbar,
  useTheme,
  useMediaQuery,
  Paper,
  alpha,
  Fade,
  Backdrop,
  CircularProgress
} from "@mui/material";
import Header from "./Header";
import Sidebar from "./sidebar/Sidebar";
import TrialBanner from "./TrialBanner";

interface LayoutProps {
  children: ReactNode;
  loading?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  loading = false,
}) => {
  const [isSidebarClosed, setSidebarClosed] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Auto-close sidebar on mobile/tablet when the component mounts
  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarClosed(true);
    }
  }, [isMobile, isTablet]);

  // Simulate page transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const toggleDrawer = useCallback(() => {
    setSidebarClosed((prev) => !prev);
  }, []);

  // Dynamic styling for the main content area based on sidebar state and device
  const mainContentStyles = {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
    pt: { xs: 8, sm: 9 },
    px: { xs: 2, sm: 3, md: 4 },
    transition: theme.transitions.create(['margin', 'background'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.standard,
    }),
    background: theme.palette.mode === 'dark' 
      ? `linear-gradient(160deg, ${alpha(theme.palette.background.default, 0.94)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`
      : `linear-gradient(160deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.grey[50], 0.8)} 100%)`,
    position: 'relative',
    ...(isMobile && !isSidebarClosed && {
      filter: 'blur(3px)',
      pointerEvents: 'none',
    }),
    ...((!isMobile && !isSidebarClosed) && {
      marginLeft: { sm: '40px', md: '60px' },
    }),
    scrollbarWidth: "thin",
    scrollbarColor: `${alpha(theme.palette.primary.main, 0.2)} transparent`,
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: alpha(theme.palette.text.secondary, 0.1),
      borderRadius: "20px",
      border: "2px solid transparent",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: alpha(theme.palette.text.secondary, 0.2),
    },
  };

  return (
    <Box sx={{ display: "flex", position: "relative" }}>
      <CssBaseline />

      {/* Loading overlay */}
      <Backdrop
        sx={{ 
          color: theme.palette.primary.main, 
          zIndex: theme.zIndex.drawer + 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(4px)',
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Mobile overlay when sidebar is open */}
      {isMobile && !isSidebarClosed && (
        <Box
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: theme.zIndex.drawer - 1,
            backdropFilter: 'blur(2px)',
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* Header - conditionally shown based on device and sidebar state */}
      {!isMobile || isSidebarClosed ? (
        <Header 
          open={!isSidebarClosed} 
          toggleDrawer={toggleDrawer} 
        />
      ) : null}

      {/* Sidebar component */}
      <Sidebar 
        open={!isSidebarClosed} 
        toggleDrawer={toggleDrawer} 
      />

      {/* Main content area */}
      <Box
        component="main"
        sx={mainContentStyles}
      >
        <Fade in={pageReady} timeout={500}>
          <Box sx={{ 
            // minHeight: "calc(90vh - 180px)", 
            pt: 1,
            position: 'relative',
          }}>
            {children}
          </Box>
        </Fade>

        {/* Trial banner shown at the bottom */}
        <TrialBanner sidebarOpen={!isSidebarClosed}  />
      </Box>
    </Box>
  );
};

export default Layout;