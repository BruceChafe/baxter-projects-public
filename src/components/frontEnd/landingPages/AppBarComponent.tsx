import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Container,
  useMediaQuery,
  useTheme,
  Box,
  List,
  ListItem,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { styled } from "@mui/system";

interface AppBarComponentProps {
  forceDarkText?: boolean;
}

const navigationItems = [
  {
    name: "Solutions",
    path: null,
    hasDropdown: true,
    dropdownItems: [
      {
        name: "UpShift",
        path: "/solutions/UpShift",
        description: "ID verification & visitor management",
      },
      {
        name: "CRM",
        path: "/solutions/crm",
        description: "Coming soon",
        disabled: true,
      },
      {
        name: "leadFlow",
        path: "/solutions/leadflow",
        description: "Coming soon",
        disabled: true,
      },
    ],
  },
  { name: "Pricing", path: "/pricing", hasDropdown: false },
  { name: "About Us", path: "/about", hasDropdown: false },
];

const StyledAppBar = styled(AppBar)<{ transparent: number }>(
  ({ transparent }) => ({
    background: transparent ? "transparent" : "rgba(255, 255, 255, 0.95)",
    boxShadow: transparent ? "none" : "0px 2px 20px rgba(0, 0, 0, 0.08)",
    transition: "all 0.4s ease",
    backdropFilter: transparent ? "none" : "blur(10px)",
  })
);

const NavButton = styled(Button)<{
  transparent: number;
  active?: number;
  forceDarkText: number;
}>(({ theme, transparent, active, forceDarkText }) => ({
  color: transparent && !forceDarkText ? "#fff" : "#333",
  padding: theme.spacing(1.5, 2),
  fontSize: "1rem",
  fontWeight: 500,
  textTransform: "none",
  borderRadius: "8px",
  transition: "all 0.3s ease",
  position: "relative",
  "&:hover": {
    backgroundColor:
      transparent && !forceDarkText
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(74, 61, 106, 0.06)",
    color:
      transparent && !forceDarkText ? "rgba(255, 255, 255, 0.9)" : "#4A3D6A",
  },
  ...(active && {
    color: transparent && !forceDarkText ? "#fff" : "#4A3D6A",
    fontWeight: 600,
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 8,
      left: "50%",
      transform: "translateX(-50%)",
      width: "20px",
      height: "3px",
      borderRadius: "10px",
      backgroundColor: transparent && !forceDarkText ? "#fff" : "#FF4081",
    },
  }),
}));

const CTAButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#ff4081",
  color: "#fff",
  padding: theme.spacing(1.2, 3),
  fontSize: "1rem",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "10px",
  boxShadow: "0 4px 14px 0 rgba(255, 64, 129, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#f50057",
    boxShadow: "0 6px 20px 0 rgba(255, 64, 129, 0.6)",
    transform: "translateY(-2px)",
  },
}));

const DropdownMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    overflow: "visible",
    marginTop: "10px",
    minWidth: "280px",
    padding: theme.spacing(1),
    "&:before": {
      content: '""',
      display: "block",
      position: "absolute",
      top: -6,
      left: 32,
      width: 12,
      height: 12,
      transform: "rotate(45deg)",
      bgcolor: "background.paper",
      boxShadow: "-3px -3px 5px rgba(0, 0, 0, 0.04)",
      zIndex: 0,
    },
  },
}));

const MobileNavItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  marginBottom: theme.spacing(1.5),
}));

const MobileNavButton = styled(Button)(({ theme, active }) => ({
  width: "100%",
  color: "#fff",
  fontSize: "1.1rem",
  justifyContent: "flex-start",
  padding: theme.spacing(1.5, 2),
  borderRadius: "10px",
  textTransform: "none",
  position: "relative",
  fontWeight: active ? 600 : 400,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  ...(active && {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    "&::before": {
      content: '""',
      position: "absolute",
      left: "8px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "4px",
      height: "60%",
      borderRadius: "10px",
      backgroundColor: "#FF4081",
    },
  }),
}));

const LogoText = styled(Typography)<{
  transparent: number;
  forceDarkText: number;
}>(({ transparent, forceDarkText }) => ({
  flexGrow: 1,
  color: transparent && !forceDarkText ? "#fff" : "#333",
  textDecoration: "none",
  fontWeight: 700,
  transition: "color 0.3s ease",
  display: "flex",
  alignItems: "center",
  "&:hover": {
    color:
      transparent && !forceDarkText ? "rgba(255, 255, 255, 0.85)" : "#4A3D6A",
  },
  "& .logo-highlight": {
    color: "#FF4081",
    marginLeft: "2px",
  },
}));

const AppBarComponent: React.FC<AppBarComponentProps> = ({
  forceDarkText = false,
}) => {
  const [transparent, setTransparent] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownAnchor, setDropdownAnchor] = useState<null | HTMLElement>(
    null
  );
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setTransparent(window.scrollY < window.innerHeight * 0.1);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDropdownOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setDropdownAnchor(event.currentTarget);
    setOpenDropdownIndex(index);
  };

  const handleDropdownClose = () => {
    setDropdownAnchor(null);
    setOpenDropdownIndex(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const isActive = (path: string) => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const hasActiveChild = (items: { path: string }[]) => {
    return items.some((item) => isActive(item.path));
  };

  return (
      <StyledAppBar position="fixed" transparent={transparent ? 1 : 0}>
        <Container maxWidth="lg">
          <Toolbar sx={{ py: { xs: 1, md: 1.5 } }}>
            {/* Logo */}
            <LogoText
              variant="h5"
              component={RouterLink}
              to="/"
              transparent={transparent ? 1 : 0}
              forceDarkText={forceDarkText ? 1 : 0}
            >
              baxter<span className="logo-highlight">-projects</span>
            </LogoText>

            {/* Mobile Navigation */}
            {isMobile ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    sx={{
                      color: transparent ? "#fff" : "#333",
                    }}
                    onClick={handleUserMenuOpen}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                  <IconButton
                    edge="start"
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                      color: transparent ? "#fff" : "#333",
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>

                {/* Mobile Drawer */}
                <Drawer
                  anchor="right"
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  PaperProps={{
                    sx: {
                      width: "100%",
                      maxWidth: 360,
                      background:
                        "linear-gradient(135deg, #4A3D6A 0%, #6C5A91 100%)",
                      color: "#fff",
                      borderRadius: "20px 0 0 20px",
                    },
                  }}
                >
                  <Box sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 4,
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Menu
                      </Typography>
                      <IconButton
                        onClick={() => setDrawerOpen(false)}
                        sx={{ color: "#fff" }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>

                    <List sx={{ mb: 4 }}>
                      {navigationItems.map((item, index) => (
                        <React.Fragment key={item.name}>
                          {item.hasDropdown ? (
                            <>
                              <MobileNavItem>
                                <MobileNavButton
                                  active={hasActiveChild(item.dropdownItems)}
                                  endIcon={<KeyboardArrowDownIcon />}
                                  onClick={(e) => {
                                    setOpenDropdownIndex(
                                      openDropdownIndex === index ? null : index
                                    );
                                  }}
                                >
                                  {item.name}
                                </MobileNavButton>
                              </MobileNavItem>

                              {openDropdownIndex === index && (
                                <Box sx={{ pl: 4, mb: 2 }}>
                                  {item.dropdownItems.map((dropdownItem) => (
                                    <Button
                                      key={dropdownItem.name}
                                      component={
                                        dropdownItem.disabled
                                          ? "button"
                                          : RouterLink
                                      }
                                      to={
                                        dropdownItem.disabled
                                          ? undefined
                                          : dropdownItem.path
                                      }
                                      onClick={
                                        dropdownItem.disabled
                                          ? undefined
                                          : () => setDrawerOpen(false)
                                      }
                                      disabled={dropdownItem.disabled}
                                      sx={{
                                        color: dropdownItem.disabled
                                          ? "rgba(255, 255, 255, 0.4)"
                                          : isActive(dropdownItem.path)
                                          ? "#FF4081"
                                          : "rgba(255, 255, 255, 0.8)",
                                        display: "block",
                                        width: "100%",
                                        textAlign: "left",
                                        justifyContent: "flex-start",
                                        py: 1,
                                        fontSize: "0.95rem",
                                        textTransform: "none",
                                        fontWeight: isActive(dropdownItem.path)
                                          ? 600
                                          : 400,
                                        "&:hover": {
                                          backgroundColor: "transparent",
                                          color: dropdownItem.disabled
                                            ? undefined
                                            : "#FF4081",
                                        },
                                      }}
                                    >
                                      {dropdownItem.name}
                                    </Button>
                                  ))}
                                </Box>
                              )}
                            </>
                          ) : (
                            <MobileNavItem>
                              <MobileNavButton
                                component={RouterLink}
                                to={item.path}
                                onClick={() => setDrawerOpen(false)}
                                active={isActive(item.path) ? 1 : 0}
                              >
                                {item.name}
                              </MobileNavButton>
                            </MobileNavItem>
                          )}
                        </React.Fragment>
                      ))}
                    </List>

                    <Divider
                      sx={{ borderColor: "rgba(255, 255, 255, 0.1)", my: 3 }}
                    />

                    <CTAButton
                      fullWidth
                      onClick={() => {
                        setDrawerOpen(false);
                        navigate("/signup");
                      }}
                      sx={{
                        my: 2,
                        py: 1.8,
                      }}
                    >
                      Get Started Free
                    </CTAButton>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setDrawerOpen(false);
                        navigate("/signin");
                      }}
                      sx={{
                        color: "white",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        py: 1.8,
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 500,
                        "&:hover": {
                          borderColor: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </Box>
                </Drawer>
              </>
            ) : (
              // Desktop Navigation
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {navigationItems.map((item, index) => (
                  <React.Fragment key={item.name}>
                    {item.hasDropdown ? (
                      <>
                        <NavButton
                          transparent={transparent ? 1 : 0}
                          forceDarkText={forceDarkText ? 1 : 0}
                          active={
                            openDropdownIndex === index ||
                            hasActiveChild(item.dropdownItems)
                              ? 1
                              : 0
                          }
                          endIcon={<KeyboardArrowDownIcon />}
                          onClick={(e) => handleDropdownOpen(e, index)}
                          aria-haspopup="true"
                          aria-expanded={
                            openDropdownIndex === index ? "true" : undefined
                          }
                        >
                          {item.name}
                        </NavButton>
                        <DropdownMenu
                          anchorEl={dropdownAnchor}
                          open={openDropdownIndex === index}
                          onClose={handleDropdownClose}
                          MenuListProps={{
                            "aria-labelledby": "dropdown-button",
                          }}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          {item.dropdownItems.map((dropdownItem) => (
                            <MenuItem
                              key={dropdownItem.name}
                              component={RouterLink}
                              to={dropdownItem.path}
                              onClick={handleDropdownClose}
                              sx={{
                                py: 1.5,
                                px: 2.5,
                                borderRadius: "8px",
                                mb: 0.5,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                bgcolor: isActive(dropdownItem.path)
                                  ? "rgba(74, 61, 106, 0.08)"
                                  : "transparent",
                                "&:hover": {
                                  bgcolor: dropdownItem.disabled
                                    ? "transparent"
                                    : "rgba(74, 61, 106, 0.08)",
                                },
                                opacity: dropdownItem.disabled ? 0.5 : 1,
                                pointerEvents: dropdownItem.disabled
                                  ? "none"
                                  : "auto",
                                cursor: dropdownItem.disabled
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: dropdownItem.disabled
                                    ? "text.disabled"
                                    : isActive(dropdownItem.path)
                                    ? "#4A3D6A"
                                    : "text.primary",
                                }}
                              >
                                {dropdownItem.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: dropdownItem.disabled
                                    ? "text.disabled"
                                    : "text.secondary",
                                }}
                              >
                                {dropdownItem.description}
                              </Typography>
                            </MenuItem>
                          ))}
                        </DropdownMenu>
                      </>
                    ) : (
                      <NavButton
                        component={RouterLink}
                        to={item.path}
                        transparent={transparent ? 1 : 0}
                        forceDarkText={forceDarkText ? 1 : 0}
                        active={isActive(item.path) ? 1 : 0}
                      >
                        {item.name}
                      </NavButton>
                    )}
                  </React.Fragment>
                ))}

                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    mx: 2,
                    borderColor: transparent
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.1)",
                  }}
                />

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <NavButton
                    onClick={() => navigate("/signin")}
                    transparent={transparent ? 1 : 0}
                    forceDarkText={forceDarkText ? 1 : 0}
                    sx={{
                      mr: 2,
                    }}
                  >
                    Sign In
                  </NavButton>
                  <CTAButton onClick={() => navigate("/signup")}>
                    Get Started Free
                  </CTAButton>
                </Box>
              </Box>
            )}
          </Toolbar>
        </Container>
      </StyledAppBar>
  );
};

export default AppBarComponent;
