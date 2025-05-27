import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link,
  Tooltip,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Link as RouterLink } from "react-router-dom";

// Background patterns and effects
const footerGradient =
  "linear-gradient(135deg, #362D4F 0%, #594B7B 80%, #7A5395 100%)";

const Footer = styled(Box)(({ theme }) => ({
  background: footerGradient,
  color: "#fff",
  padding: theme.spacing(8, 0, 6),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "6px",
    background: "linear-gradient(90deg, #FF4081, #F50057)",
    boxShadow: "0px 2px 15px rgba(255, 64, 129, 0.5)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      "radial-gradient(rgba(255, 255, 255, 0.03) 2px, transparent 2px)",
    backgroundSize: "30px 30px",
    pointerEvents: "none",
    zIndex: 0,
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  ...theme.typography.body2,
  color: "rgba(255, 255, 255, 0.85)",
  textDecoration: "none",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  position: "relative",
  paddingLeft: theme.spacing(0.5),
  fontWeight: 500,

  "&:hover": {
    color: "#FF4081",
    transform: "translateX(5px)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    left: -5,
    width: 0,
    height: 0,
    borderTop: "4px solid transparent",
    borderBottom: "4px solid transparent",
    borderLeft: "4px solid transparent",
    transition: "all 0.3s ease",
  },
  "&:hover::before": {
    borderLeft: "4px solid #FF4081",
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: "white",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  margin: theme.spacing(0.5),
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 0,
    height: 0,
    backgroundColor: "rgba(255, 64, 129, 0.3)",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    transition: "width 0.6s ease, height 0.6s ease",
  },
  "&:hover": {
    backgroundColor: "rgba(255, 64, 129, 0.8)",
    transform: "translateY(-5px)",
    boxShadow: "0 10px 20px rgba(255, 64, 129, 0.4)",
    "& .MuiSvgIcon-root": {
      transform: "scale(1.2)",
    },
  },
  "&:hover::before": {
    width: 120,
    height: 120,
  },
  "& .MuiSvgIcon-root": {
    position: "relative",
    zIndex: 2,
    transition: "transform 0.3s ease",
  },
}));

const ContactItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateX(5px)",
  },
  "& .MuiSvgIcon-root": {
    marginRight: theme.spacing(1.5),
    color: "#FF4081",
    transition: "transform 0.3s ease",
  },
  "&:hover .MuiSvgIcon-root": {
    transform: "scale(1.2)",
  },
}));

const ScrollTopButton = styled(Button)(({ theme, visible }) => ({
  position: "fixed",
  right: theme.spacing(4),
  bottom: theme.spacing(4),
  minWidth: "auto",
  width: 48,
  height: 48,
  borderRadius: "50%",
  padding: 0,
  backgroundColor: "#FF4081",
  color: "white",
  boxShadow: "0 6px 20px rgba(255, 64, 129, 0.4)",
  zIndex: 10,
  transition: "all 0.3s ease",
  opacity: visible ? 1 : 0,
  visibility: visible ? "visible" : "hidden",
  transform: visible ? "translateY(0)" : "translateY(20px)",
  "&:hover": {
    backgroundColor: "#F50057",
    transform: visible ? "translateY(-5px)" : "translateY(20px)",
    boxShadow: "0 10px 25px rgba(255, 64, 129, 0.5)",
  },
}));

const FooterHeading = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 600,
  position: "relative",
  display: "inline-block",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -8,
    left: 0,
    width: 30,
    height: 3,
    backgroundColor: "#FF4081",
    borderRadius: 1,
    transition: "width 0.3s ease",
  },
  "&:hover::after": {
    width: "100%",
  },
}));

const FooterComponent: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const footerLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "UpShift", path: "/solutions/UpShift" },
    { name: "CRM", path: "/solutions/crm", disabled: true },
    { name: "LeadFlow", path: "/solutions/leadflow", disabled: true },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <Footer>
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  letterSpacing: 0.5,
                  background: "linear-gradient(90deg, #fff, #f0f0f0)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                baxter-projects
              </Typography>
              <Divider
                sx={{
                  width: "60px",
                  borderColor: "#FF4081",
                  borderWidth: 2,
                  my: 2,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.85)",
                  mb: 3,
                  lineHeight: 1.8,
                }}
              >
                Smart tools for modern dealerships — built from the inside out.
              </Typography>
              <Box sx={{ display: "flex" }}>
                <Tooltip title="GitHub">
                  <SocialButton aria-label="GitHub">
                    <GitHubIcon />
                  </SocialButton>
                </Tooltip>
                <Tooltip title="LinkedIn">
                  <SocialButton aria-label="LinkedIn">
                    <LinkedInIcon />
                  </SocialButton>
                </Tooltip>
                <Tooltip title="Email Us">
                  <SocialButton aria-label="Email">
                    <EmailIcon />
                  </SocialButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading variant="h6">Quick Links</FooterHeading>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
              {footerLinks.map((link, index) => (
                <FooterLink
                  key={index}
                  component={link.disabled ? "span" : RouterLink}
                  to={link.disabled ? undefined : link.path}
                  sx={{
                    color: link.disabled
                      ? "rgba(255, 255, 255, 0.4)"
                      : undefined,
                    pointerEvents: link.disabled ? "none" : "auto",
                    opacity: link.disabled ? 0.6 : 1,
                  }}
                >
                  {link.name}
                </FooterLink>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={5}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FooterHeading variant="h6">Contact Us</FooterHeading>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <ContactItem>
                    <PhoneIcon />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.85)" }}
                    >
                      +1 (888) 123-4567
                    </Typography>
                  </ContactItem>
                  <ContactItem>
                    <EmailIcon />
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.85)" }}
                    >
                      info@baxter-projects.com
                    </Typography>
                  </ContactItem>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 8,
            pt: 3,
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            color="rgba(255, 255, 255, 0.85)"
            textAlign={isMobile ? "center" : "left"}
          >
            © {new Date().getFullYear()} baxter-projects. All rights reserved.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              justifyContent: isMobile ? "center" : "flex-end",
              flexWrap: "wrap",
            }}
          >
            <FooterLink
              component={RouterLink}
              to="/legal#privacy"
              variant="body2"
            >
              Privacy Policy
            </FooterLink>
            <FooterLink
              component={RouterLink}
              to="/legal#terms"
              variant="body2"
            >
              Terms of Service
            </FooterLink>
          </Box>
        </Box>
      </Container>

      <ScrollTopButton
        visible={visible}
        onClick={scrollToTop}
        aria-label="scroll to top"
      >
        <KeyboardArrowUpIcon />
      </ScrollTopButton>
    </Footer>
  );
};

export default FooterComponent;
