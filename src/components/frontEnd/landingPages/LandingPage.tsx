import React, { useRef } from "react";
import LayoutComponent from "./LayoutComponent";
import HeroSectionComponent from "./HeroSectionComponent";
import {
  Typography,
  Button,
  Box,
  Container,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
  Chip,
} from "@mui/material";
import { alpha, styled } from "@mui/system";
import StarIcon from "@mui/icons-material/Star";
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Bolt, Business, People, SupportAgent } from "@mui/icons-material";
import PageHelmet from "../../shared/PageHelmet";

const primaryGradient = "linear-gradient(135deg, #4A3D6A 0%, #6C5A91 100%)";
const secondaryGradient = "linear-gradient(135deg, #FF4081 0%, #F50057 100%)";
const tertiaryGradient = "linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)";

// Animation variants for scroll effects
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Styled Components with enhanced visual properties
const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 0),
  position: "relative",
  overflow: "hidden",
}));

const PatternedSection = styled(Section)(({ theme, bgColor = "#f8f9fa" }) => ({
  backgroundColor: bgColor,
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      "radial-gradient(rgba(0, 0, 0, 0.03) 2px, transparent 2px)",
    backgroundSize: "30px 30px",
    pointerEvents: "none",
  },
}));

const ProductCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "disabled",
})(({ theme, gradient = primaryGradient, disabled }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  textAlign: "center",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
  transition: "transform 0.4s ease, box-shadow 0.4s ease",
  position: "relative",
  opacity: disabled ? 0.6 : 1,
  cursor: disabled ? "not-allowed" : "pointer",
  ...(disabled
    ? {}
    : {
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
        },
      }),
}));

const ProductCardHeader = styled(Box)(({ theme, gradient }) => ({
  background: gradient,
  padding: theme.spacing(4, 2),
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
    background: "inherit",
    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  borderRadius: 16,
  padding: theme.spacing(4),
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(5px)",
  boxShadow: "0 15px 35px rgba(74, 61, 106, 0.1)",
  transition: "transform 0.4s ease, box-shadow 0.4s ease",
  "&:hover": {
    transform: "translateY(-12px) scale(1.02)",
    boxShadow: "0 25px 50px rgba(74, 61, 106, 0.2)",
  },
}));

const IconWrapper = styled(Box)(({ theme, bgColor = "#4A3D6A" }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: `linear-gradient(135deg, ${bgColor} 0%, rgba(255,255,255,0.2) 100%)`,
  borderRadius: "50%",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  width: 80,
  height: 80,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
}));

const CTAButton = styled(Button)(({ theme, gradient = secondaryGradient }) => ({
  background: gradient,
  color: "white",
  padding: theme.spacing(1.5, 4),
  borderRadius: 12,
  fontWeight: 700,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    background: gradient,
    transform: "translateY(-3px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
  },
}));

const MotionContainer = styled(motion.div)({
  width: "100%",
});

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const solutionsRef = useRef(null);

  // Product data
  const products = [
    {
      name: "baxter UpShift",
      description:
        "A smarter sales visitor tracker. Ditch the paper upsheet and check in guests at reception with ease — complete with dashboards, banning, notifications, and optional license scanning.",
      gradient: secondaryGradient,
      icon: <People sx={{ fontSize: 40, color: "white" }} />,
      route: "/solutions/UpShift",
    },
    {
      name: "baxter CRM",
      description:
        "Connect the dots between your contacts, leads, and follow-ups. CRM ties everything together so nothing slips through the cracks.",
      gradient: tertiaryGradient,
      icon: <Business sx={{ fontSize: 40, color: "white" }} />,
      route: "/solutions/crm",
      label: "Coming soon",
      disabled: true,
    },
    {
      name: "baxter leadFlow",
      description:
        "A lightweight ADF lead processor that makes sure your hottest leads get attention first. Built to modernize the broken first-contact process.",
      gradient: primaryGradient,
      icon: <Bolt sx={{ fontSize: 40, color: "white" }} />,
      route: "/solutions/leadflow",
      label: "Coming soon",
      disabled: true,
    },
  ];

  // Features data
  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: "white" }} />,
      title: "All-in-One, Built by One of Us",
      description:
        "Say goodbye to disconnected systems and manual workarounds. baxter-projects unifies your dealerships tools into a single,easy-to-use platform.",
      bgColor: "#FF4081",
    },
    {
      icon: <StarIcon sx={{ fontSize: 40, color: "white" }} />,
      title: "Designed Around the Way You Actually Work",
      description:
        "Built from real dealership experience — not a product manager’s guess. Automation and tools tailored to real workflows.",
      bgColor: "#3F51B5",
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: "white" }} />,
      title: "Dashboards That Actually Matter",
      description:
        "No more endless reports. Get the key insights your GM, managers, and execs care about — all in one spot.",
      bgColor: "#4A3D6A",
    },
  ];

  return (
    <LayoutComponent>
      <PageHelmet
        title="baxter-projects"
        description="Learn more about the mission, values, and team behind baxter-projects."
      />
      <HeroSectionComponent
        title="projects"
        subtitle="Built from scratch. Fueled by frustration. Designed for dealers."
        description="baxter-projects is a growing toolbox for dealership IT — created to fix what legacy systems won’t. Start with what works, grow into what’s next."
        ctaButton={
          <CTAButton
            size="large"
            variant="contained"
            onClick={() => {
              solutionsRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Solutions
          </CTAButton>
        }
        stats={
          [
            // { value: "30+", label: "Dealerships" },
            // { value: "99.9%", label: "Uptime" },
            // { value: "24/7", label: "Support" },
          ]
        }
      />

      <PatternedSection ref={solutionsRef}>
        <Container maxWidth="lg">
          <MotionContainer
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <Box sx={{ mb: 8, maxWidth: 800, mx: "auto", textAlign: "center" }}>
              <Typography
                variant={isMobile ? "h3" : "h2"}
                component="h2"
                sx={{
                  fontWeight: 800,
                  color: "#4A3D6A",
                  mb: 2,
                  letterSpacing: "-0.5px",
                }}
              >
                One Builder. Real Solutions.
              </Typography>
              <Divider
                sx={{
                  width: "80px",
                  mx: "auto",
                  my: 3,
                  borderColor: "#FF4081",
                  borderWidth: 3,
                  borderRadius: 2,
                }}
              />
              <Typography
                variant={isMobile ? "h6" : "h5"}
                color="text.secondary"
                sx={{
                  fontWeight: 400,
                  lineHeight: 1.6,
                  mb: 5,
                }}
              >
                An evolving platform created to simplify the chaos — with tools
                built for the real-world challenges of dealership IT.
              </Typography>
            </Box>
          </MotionContainer>

          <MotionContainer
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <Grid container spacing={4}>
              {products.map((product, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div variants={fadeInUp}>
                    <ProductCard
                      gradient={product.gradient}
                      disabled={product.disabled}
                    >
                      {product.label && (
                        <Chip
                          label={product.label}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            bgcolor: "#fff",
                            color: "#4A3D6A",
                            border: `1px solid #4A3D6A`,
                          }}
                        />
                      )}

                      <ProductCardHeader gradient={product.gradient}>
                        <Box
                          sx={{
                            mb: 2,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {product.icon}
                        </Box>
                        <Typography
                          variant="h4"
                          component="h3"
                          sx={{ fontWeight: 700, color: "white" }}
                        >
                          {product.name}
                        </Typography>
                      </ProductCardHeader>

                      <CardContent sx={{ flexGrow: 1, p: 4 }}>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          {product.description}
                        </Typography>
                      </CardContent>

                      <CardActions sx={{ p: 4, pt: 0 }}>
                        <Button
                          component={product.disabled ? "button" : RouterLink}
                          to={product.disabled ? undefined : product.route}
                          variant="contained"
                          size="large"
                          fullWidth
                          disabled={product.disabled}
                          sx={{
                            bgcolor: "#4A3D6A",
                            py: 1.5,
                            borderRadius: 2,
                            color: "white",
                            "&:hover": {
                              bgcolor: product.disabled ? "#4A3D6A" : "#6C5A91",
                            },
                          }}
                        >
                          {product.disabled ? "Coming Soon" : "Learn More"}
                        </Button>
                      </CardActions>
                    </ProductCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </MotionContainer>
        </Container>
      </PatternedSection>

      <Section
        sx={{
          background: primaryGradient,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.05)' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: "80px",
          },
        }}
      >
        <Container maxWidth="lg">
          <MotionContainer
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <Box sx={{ mb: 8, maxWidth: 800, mx: "auto", textAlign: "center" }}>
              <Typography
                variant={isMobile ? "h3" : "h2"}
                component="h2"
                sx={{
                  fontWeight: 800,
                  color: "white",
                  mb: 2,
                  letterSpacing: "-0.5px",
                }}
              >
                Why Choose Us?
              </Typography>
              <Divider
                sx={{
                  width: "80px",
                  mx: "auto",
                  my: 3,
                  borderColor: "white",
                  borderWidth: 3,
                  borderRadius: 2,
                }}
              />
              <Typography
                variant={isMobile ? "body1" : "h6"}
                sx={{
                  fontWeight: 400,
                  color: "rgba(255, 255, 255, 0.8)",
                  mb: 6,
                }}
              >
                We're not a faceless software vendor — we're dealership people
                who got tired of broken systems. baxter-projects is built from
                the ground up to fix real problems with simple, modern tools
                that just work.
              </Typography>
            </Box>
          </MotionContainer>

          <MotionContainer
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div variants={fadeInUp}>
                    <FeatureCard>
                      <IconWrapper bgColor={feature.bgColor}>
                        {feature.icon}
                      </IconWrapper>
                      <Typography
                        variant="h5"
                        component="h3"
                        sx={{ fontWeight: 700, mb: 2, color: "#4A3D6A" }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "text.secondary" }}
                      >
                        {feature.description}
                      </Typography>
                    </FeatureCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </MotionContainer>
        </Container>
      </Section>

      <PatternedSection bgColor="#f8f9fa">
        <Container>
          <MotionContainer
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <Grid container spacing={8} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: "white",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
                    position: "relative",
                    overflow: "hidden",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "5px",
                      background: secondaryGradient,
                    },
                  }}
                >
                  <Typography
                    variant={isMobile ? "h4" : "h3"}
                    component="h2"
                    sx={{ fontWeight: "bold", color: "#4A3D6A", mb: 3 }}
                  >
                    Built for the Way Dealerships Actually Work
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: isMobile ? "1rem" : "1.1rem",
                      lineHeight: "1.8",
                      color: "#555",
                      mb: 3,
                    }}
                  >
                    Whether you're tracking showroom traffic, managing leads, or
                    trying to get your exec team real insights — baxter-projects
                    is designed to work the way your dealership does.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: isMobile ? "1rem" : "1.1rem",
                      lineHeight: "1.8",
                      color: "#555",
                    }}
                  >
                    Each module works great on its own — but together, they
                    create a powerful, modern platform that simplifies your ops,
                    sharpens your data, and gives your team what they actually
                    need to do their jobs better.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    height: "100%",
                    background: "white",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      background: "#f1f3f5",
                      height: "300px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "#888", fontStyle: "italic" }}
                    >
                      Screenshot of the UpShift dashboard coming soon.
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      mt: 3,
                      textAlign: "center",
                      color: "#666",
                      fontStyle: "italic",
                    }}
                  >
                    Our intuitive dashboard puts all your dealership data at
                    your fingertips
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </MotionContainer>
        </Container>
      </PatternedSection>

      <Section sx={{ background: "#4A3D6A" }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <MotionContainer
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <Typography
              variant={isMobile ? "h4" : "h3"}
              component="h2"
              sx={{ fontWeight: "bold", color: "white", mb: 3 }}
            >
              Smarter Tools. Real Results. Better Decisions.
            </Typography>

            <CTAButton
              variant="contained"
              size="large"
              gradient="linear-gradient(135deg, #FF4081 0%, #F50057 100%)"
              sx={{ px: 6, py: 2 }}
              onClick={() => navigate("/signup")}
            >
              Get Started Today
            </CTAButton>
          </MotionContainer>
        </Container>
      </Section>
    </LayoutComponent>
  );
};

export default LandingPage;
