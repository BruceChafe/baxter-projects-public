import React, { useMemo } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip,
  Box,
  Collapse,
  Typography,
  Divider,
  Badge,
  alpha,
  useTheme
} from "@mui/material";
import {
  FaBoxArchive,
  FaRegIdCard,
  FaClipboardList,
  FaTriangleExclamation,
  FaUsers,
  FaCalendarDays,
  FaArrowRight,
  FaCircleChevronRight,
  FaGauge,
  FaBuildingUser,
  FaEnvelopeOpenText,
  FaFileLines,
  FaChartLine,
  FaFolder
} from "react-icons/fa6";
import { Bolt, Business, People } from "@mui/icons-material";

interface NavItemProps {
  to: string;
  primary: string;
  icon: React.ReactNode;
  section: string[];
  badge?: number | null;
  isActive: boolean;
  open: boolean;
  info?: string;
}

interface MainListItemsProps {
  open: boolean;
  currentPath: string;
}

// Enhanced navigation data with better icon selection and optional badges
const listItemsData = [
  {
    to: "/upshift/upsheet",
    primary: "UpSheet",
    icon: <FaRegIdCard />,
    section: ["upshift"],
    badge: null,
    info: "Check-in visitors"
  },
  {
    to: "/upshift",
    primary: "Dashboard",
    icon: <FaGauge />,
    section: ["upshift"],
    badge: null
  },
  {
    to: "/upshift/visits",
    primary: "History",
    icon: <FaBoxArchive />,
    section: ["upshift"],
    badge: null
  },
  {
    to: "/upshift/banned",
    primary: "Banned Visitors",
    icon: <FaTriangleExclamation />,
    section: ["upshift"],
    badge: null,
    // info: "Requires attention"
  },
  {
    to: "/crm/calendar",
    primary: "Calendar",
    icon: <FaCalendarDays />,
    section: ["crm"],
    badge: 2,
    info: "Upcoming events"
  },
  {
    to: "/contacts",
    primary: "Contacts",
    icon: <FaUsers />,
    section: ["crm"],
    badge: null
  },
  {
    to: "/crm/leads",
    primary: "Leads",
    icon: <FaEnvelopeOpenText />,
    section: ["crm"],
    badge: 5,
    info: "New leads"
  },
  {
    to: "/dataarchive/documents",
    primary: "Documents",
    icon: <FaFileLines />,
    section: ["dataarchive"],
    badge: null
  },
  {
    to: "/dataarchive/reports",
    primary: "Reports",
    icon: <FaChartLine />,
    section: ["dataarchive"],
    badge: null
  },
  {
    to: "/upshift",
    primary: "UpShift",
    icon: <People />,
    section: ["home"],
    badge: null
  }, 
  // {
  //   to: "/crm",
  //   primary: "CRM",
  //   icon: <Business />,
  //   section: ["home"],
  //   badge: null,
  //   // info: "Items requiring attention"
  // },
  // {
  //   to: "/leadflow/dashboard",
  //   primary: "LeadFlow",
  //   icon: <Bolt />,
  //   section: ["home"],
  //   badge: null,
  //   // info: "Items requiring attention"
  // },
  // {
  //   to: "/leadflow/dashboard",
  //   primary: "LeadFlow Dashboard",
  //   icon: <Bolt />,
  //   section: ["leadflow"],
  //   badge: null,
  //   // info: "Items requiring attention"
  // },
  
];

// Navigation item component with enhanced visual styling
const NavItem: React.FC<NavItemProps> = ({ 
  to, 
  primary, 
  icon, 
  badge, 
  isActive, 
  open, 
  info 
}) => {
  const theme = useTheme();
  const activeColor = theme.palette.primary.main;
  const activeBg = alpha(theme.palette.primary.main, 0.1);
  
  return (
    <ListItem
      component={RouterLink}
      to={to}
      disablePadding
      sx={{ 
        height: "56px",
        mb: 0.5,
        transition: "all 0.2s ease"
      }}
    >
      {open ? (
        <ListItemButton 
          sx={{ 
            height: "100%",
            borderRadius: 1.5,
            backgroundColor: isActive ? activeBg : 'transparent',
            '&:hover': {
              backgroundColor: isActive 
                ? activeBg 
                : theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.common.white, 0.1)
                  : alpha(theme.palette.common.black, 0.04)
            },
            transition: "all 0.2s ease",
            position: 'relative',
            overflow: 'hidden',
            '&::after': isActive ? {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '25%',
              height: '50%',
              width: '4px',
              backgroundColor: activeColor,
              borderRadius: '0 4px 4px 0'
            } : {}
          }}
        >
          <ListItemIcon sx={{ 
            color: isActive ? activeColor : 'text.secondary',
            minWidth: 40,
            ml: 0.5
          }}>
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={primary}
            secondary={info && !isActive ? info : null}
            primaryTypographyProps={{
              sx: {
                color: isActive ? activeColor : 'text.primary',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.95rem'
              },
            }}
            secondaryTypographyProps={{
              sx: {
                fontSize: '0.75rem',
                opacity: 0.7
              }
            }}
          />
          {badge !== null && (
            <Badge 
              badgeContent={badge} 
              color="error"
              sx={{ mr: 1 }}
            />
          )}
        </ListItemButton>
      ) : (
        <Tooltip 
          title={
            <Box>
              <Typography variant="body2">{primary}</Typography>
              {info && (
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {info}
                </Typography>
              )}
            </Box>
          } 
          placement="right" 
          arrow
        >
          <ListItemButton 
            sx={{ 
              height: "100%",
              justifyContent: 'center',
              borderRadius: 1.5,
              backgroundColor: isActive ? activeBg : 'transparent',
              '&:hover': {
                backgroundColor: isActive 
                  ? activeBg 
                  : theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.common.white, 0.1)
                    : alpha(theme.palette.common.black, 0.04)
              },
              transition: "all 0.2s ease",
              position: 'relative',
              overflow: 'hidden',
              '&::after': isActive ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '25%',
                height: '50%',
                width: '4px',
                backgroundColor: activeColor,
                borderRadius: '0 4px 4px 0'
              } : {}
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <ListItemIcon 
                sx={{ 
                  color: isActive ? activeColor : 'text.secondary',
                  minWidth: 'auto',
                  justifyContent: 'center'
                }}
              >
                {icon}
              </ListItemIcon>
              {badge !== null && (
                <Badge 
                  badgeContent={badge} 
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10
                  }}
                />
              )}
            </Box>
          </ListItemButton>
        </Tooltip>
      )}
    </ListItem>
  );
};

// Section header component to group navigation items
const SectionHeader: React.FC<{ title: string, open: boolean }> = ({ title, open }) => {
  if (!open) return null;
  
  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Typography 
        variant="caption" 
        color="text.secondary"
        sx={{ 
          fontWeight: 600, 
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.7rem'
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export const MainListItems: React.FC<MainListItemsProps> = ({ open, currentPath }) => {
  const location = useLocation();
  
  // Determine current section based on URL path
  const currentSection = useMemo(() => {
    if (currentPath.startsWith("/home")) return "home";
    if (currentPath.startsWith("/admin")) return "home";
    if (currentPath.startsWith("/upshift")) return "upshift";
    if (currentPath.startsWith("/crm") || currentPath.startsWith("/contacts")) return "crm";
    if (currentPath.startsWith("/dataarchive")) return "dataarchive"
    if (currentPath.startsWith("/leadflow")) return "leadflow";
    return null;
  }, [currentPath]);

  // Get section title for display
  const getSectionTitle = (section: string) => {
    switch (section) {
      case "home": return "Main Navigation";
      case "upshift": return "UpShift";
      case "crm": return "Customer Relations";
      case "dataarchive": return "Data & Reports";
      case "leadflow": return "LeadFlow";
      default: return "";
    }
  };

  // Filter and group items by section
  const filteredItems = useMemo(() => 
    listItemsData.filter(item => item.section.includes(currentSection as string)),
    [currentSection]
  );
  
  return (
    <>
      <SectionHeader title={getSectionTitle(currentSection as string)} open={open} />
      
      {filteredItems.map((item) => (
        <NavItem
          key={item.to}
          to={item.to}
          primary={item.primary}
          icon={item.icon}
          section={item.section}
          badge={item.badge}
          isActive={location.pathname === item.to}
          open={open}
          info={item.info}
        />
      ))}
      
      {open && filteredItems.length > 0 && (
        <Divider sx={{ mt: 2, mb: 2, mx: 2 }} />
      )}
    </>
  );
};