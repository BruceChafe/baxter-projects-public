import React, { useState } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  alpha,
  Avatar,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Button,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import { AccountCircleOutlined } from "@mui/icons-material";
import { supabase } from "../../../supabase/supabaseClient";

interface HeaderProps {
  open: boolean;
  toggleDrawer: () => void;
  userName?: string;
}

const drawerWidth = 260;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backdropFilter: "blur(20px)",
  backgroundColor: alpha(theme.palette.primary.main, 0.95),
  color: theme.palette.text.primary,
  boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  }),
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: "1.5rem",
  letterSpacing: "-0.5px",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  color: "#fff",
  "& .logo-highlight": {
    color: "#FF4081",
    fontWeight: 800,
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: 38,
  height: 38,
  borderRadius: theme.shape.borderRadius * 1.5,
  backgroundColor: alpha(theme.palette.action.active, 0.04),
  color: theme.palette.text.secondary,
  transition: "all 0.2s ease",
  marginLeft: theme.spacing(1),
  "&:hover": {
    backgroundColor: alpha(theme.palette.action.active, 0.1),
    transform: "translateY(-1px)",
  },
}));

const Header: React.FC<HeaderProps> = ({
  open,
  toggleDrawer,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { user, accessContext } = useAuth();
  const userName = `${user?.user_metadata?.first_name || ""} ${user?.user_metadata?.last_name|| ""}`.trim() || "User";


  // Extract initials from user name
  const userInitials = userName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSettingsClick = () => {
    handleProfileMenuClose();
    navigate("/admin/userprofile");
  };

  return (
    <AppBar position="fixed" open={open} elevation={0}>
      <Toolbar
        sx={{
          height: 70,
          px: { xs: 1.5, sm: 3 },
        }}
      >
        {/* Hamburger menu button for mobile/closed sidebar */}
        {(!open || isMobile) && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{
              mr: 2,
              borderRadius: 1.5,
              "&:hover": {
                backgroundColor: alpha(theme.palette.action.active, 0.1),
              },
            }}
          >
            <MenuIcon sx={{ color: theme.palette.primary.contrastText }} />
          </IconButton>
        )}

        {/* Logo section */}
        <LogoText component={RouterLink} to="/" variant="h6">
          baxter<span className="logo-highlight">-projects</span>
        </LogoText>

        {/* Right side actions */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Admin menu if available */}
          {AdminMenu && <AdminMenu />}

          {/* User profile button */}
          <Tooltip title={userName}>
            <ActionButton
              size="large"
              edge="end"
              aria-label="user account"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: theme.palette.secondary.main, // or any hex like '#FF4081'
                  color: "#fff", // Or `theme.palette.getContrastText(bgcolor)`
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                {userInitials}
              </Avatar>
            </ActionButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Profile menu dropdown */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1.5,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
            minWidth: 180,
            borderRadius: 2,
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {userName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Administrator
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5 }}>
          <AccountCircleOutlined size={16} style={{ marginRight: "10px" }} />
          Profile
        </MenuItem>

        <MenuItem onClick={handleSettingsClick} sx={{ py: 1.5 }}>
          <SettingsIcon sx={{ mr: 1.5, fontSize: 20}} />
          Settings
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            color: theme.palette.error.main,
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
