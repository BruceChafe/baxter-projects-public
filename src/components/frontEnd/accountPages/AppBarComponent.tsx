import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Link,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface AppBarProps {
  currentPage: string;
}

const AppBarComponent: React.FC<AppBarProps> = ({ currentPage }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const renderButton = () => {
    const buttonProps = {
      variant: "contained" as const,
      sx: {
        bgcolor: "#ff4081",
        color: "#fff",
        px: 3,
        py: 1,
        fontSize: "0.95rem",
        fontWeight: 600,
        textTransform: "none",
        borderRadius: 2,
        boxShadow: "0 4px 14px 0 rgba(255, 64, 129, 0.4)",
        "&:hover": {
          bgcolor: "#f50057",
          boxShadow: "0 6px 20px 0 rgba(255, 64, 129, 0.5)",
          transform: "translateY(-1px)",
        },
        transition: "all 0.2s ease",
      },
    };

    if (currentPage === "signup") {
      return (
        <Button
          {...buttonProps}
          component={RouterLink}
          to="/signin"
        >
          Sign In
        </Button>
      );
    } else if (currentPage === "signin") {
      return (
        <Button
          {...buttonProps}
          component={RouterLink}
          to="/signup"
        >
          Sign Up
        </Button>
      );
    }
    return null;
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "linear-gradient(to right, #4A3D6A, #6C5A91)",
        boxShadow: "0 1px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Container maxWidth="lg">
      <Toolbar sx={{ py: { xs: 1.5, md: 2 } }}>

          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              color: "#fff",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.3s ease",
              "&:hover": {
                color: "rgba(255, 255, 255, 0.85)",
              },
            }}
          >
              baxter-projects
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {renderButton()}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default AppBarComponent;
