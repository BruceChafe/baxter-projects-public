import React from "react";
import {
  Drawer as MuiDrawer,
  IconButton,
  List,
  Box,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  alpha,
  Typography,
  Avatar,
  Tooltip,
  Button
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { MainListItems } from "./ListItems";
import { useLocation } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface SidebarProps {
  open: boolean;
  toggleDrawer: () => void;
}

const drawerWidth = 260; // Slightly wider for better text readability

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create(["width", "box-shadow"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.95) 
      : theme.palette.background.paper,
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    boxShadow: open 
      ? "0 5px 20px rgba(0,0,0,0.05)" 
      : "0 2px 10px rgba(0,0,0,0.02)",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create(["width", "box-shadow"], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.standard,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2, 3),
  height: 70,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
}));

const DrawerToggle = styled(IconButton)(({ theme }) => ({
  transition: "all 0.3s ease-in-out",
  borderRadius: theme.shape.borderRadius * 1.5,
  width: 36,
  height: 36,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    transform: "scale(1.05)",
  },
}));

const Sidebar: React.FC<SidebarProps> = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const currentPath = location.pathname;
  
  const drawerContent = (
    <>
      <LogoSection sx={{ justifyContent: open ? "space-between" : "center" }}>
        {open && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography 
              variant="h6" 
              color="primary.main"
              sx={{ 
                fontWeight: 600, 
                letterSpacing: "-0.5px", 
                fontSize: "1.2rem",
                display: { xs: "none", sm: "block" } 
              }}
            >
              UpShift
            </Typography>
          </Box>
        )}
        <DrawerToggle onClick={toggleDrawer} aria-label={open ? "Close Drawer" : "Open Drawer"}>
          {open ? (
            <FaChevronLeft size={16} color={theme.palette.primary.main} />
          ) : (
            <FaChevronRight size={16} color={theme.palette.primary.main} />
          )}
        </DrawerToggle>
      </LogoSection>

      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          px: 1.5,
          py: 2,
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
        }}
      >
        <List
          component="nav"
          sx={{ 
            "& .MuiListItemButton-root": { 
              borderRadius: 1.5,
              minHeight: 48
            } 
          }}
        >
          <MainListItems open={open} currentPath={currentPath} />
        </List>
      </Box>
    </>
  );

  return isMobile ? (
    <SwipeableDrawer
      open={open}
      onClose={toggleDrawer}
      onOpen={toggleDrawer}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width: "85vw", 
          height: "100vh",
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.95) 
            : theme.palette.background.paper,
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
          color: theme.palette.text.primary,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        },
      }}
    >
      {drawerContent}
    </SwipeableDrawer>
  ) : (
    <Drawer variant="permanent" open={open}>
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;