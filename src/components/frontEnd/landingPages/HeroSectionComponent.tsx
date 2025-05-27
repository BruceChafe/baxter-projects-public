import React, { useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { motion } from "framer-motion";

// Enhanced gradient with better color transitions
const heroGradient =
  "linear-gradient(135deg, #4A3D6A 0%, #6C5A91 80%, #845DA4 100%)";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

// Styled components
const HeroSection = styled(Box)({
  minHeight: "100vh",
  background: heroGradient,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#fff",
  textAlign: "left",
  position: "relative",
  overflow: "hidden",
});

const ContentContainer = styled(Container)({
  position: "relative",
  zIndex: 2,
  padding: "0 24px",
});

const HeroBackground = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  overflow: "hidden",
});

const Circle = styled(Box)(({ theme, size, top, left, opacity = 0.1 }) => ({
  position: "absolute",
  width: size,
  height: size,
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.2)",
  filter: "blur(60px)",
  top,
  left,
  opacity,
}));

const GradientButton = styled(Button)(
  ({ theme, bgColor = "#ff4081", hoverColor = "#f50057" }) => ({
    backgroundColor: bgColor,
    color: "#fff",
    padding: theme.spacing(1.5, 4),
    fontSize: "1.1rem",
    fontWeight: 600,
    textTransform: "none",
    borderRadius: 12,
    boxShadow: `0 4px 14px 0 ${bgColor}66`,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: hoverColor,
      boxShadow: `0 8px 20px 0 ${bgColor}88`,
      transform: "translateY(-3px)",
    },
  })
);

const OutlinedButton = styled(Button)(({ theme }) => ({
  color: "#fff",
  borderColor: "rgba(255, 255, 255, 0.5)",
  padding: theme.spacing(1.5, 4),
  fontSize: "1.1rem",
  fontWeight: 500,
  textTransform: "none",
  borderRadius: 12,
  borderWidth: 2,
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    transform: "translateY(-3px)",
  },
}));

// Motion components
const MotionBox = styled(motion.div)({
  width: "100%",
});

const LogoText = styled(Typography)(({ theme }) => ({
  color: "#fff",
  textDecoration: "none",
  fontWeight: 800,
  transition: "color 0.3s ease",
  alignItems: "center",
  fontSize: "1.5rem",
  letterSpacing: "-0.5px",
  lineHeight: 1.1,
  "&:hover": {
    color: "rgba(255, 255, 255, 0.85)",
  },
  "& .logo-highlight": {
    color: "#FF4081",
    marginLeft: "4px",
  },
  position: "relative",
  display: "inline-block",
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    bottom: "-10px",
    width: "80px",
    height: "6px",
    background: "#ff4081",
    borderRadius: "3px",
  },
}));
interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  ctaButton?: React.ReactNode;
  stats?: {
    value: string;
    label: string;
  }[];
}

const HeroSectionComponent: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  ctaButton,
  stats,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Ref for the animated shapes
  const animationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple animation for the background elements
    const interval = setInterval(() => {
      if (animationRef.current) {
        const circles =
          animationRef.current.querySelectorAll(".animated-circle");
        circles.forEach((circle) => {
          const htmlCircle = circle as HTMLElement;
          htmlCircle.style.transform = `translate(${
            Math.random() * 10 - 5
          }px, ${Math.random() * 10 - 5}px)`;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <HeroSection>
      {/* Animated background elements */}
      <HeroBackground ref={animationRef}>
        <Circle
          className="animated-circle"
          size="500px"
          top="-100px"
          left="60%"
          opacity={0.15}
          sx={{ transition: "transform 10s ease-in-out" }}
        />
        <Circle
          className="animated-circle"
          size="400px"
          top="60%"
          left="-100px"
          opacity={0.1}
          sx={{ transition: "transform 8s ease-in-out" }}
        />
        <Circle
          className="animated-circle"
          size="300px"
          top="70%"
          left="70%"
          opacity={0.08}
          sx={{ transition: "transform 12s ease-in-out" }}
        />

        {/* Background pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3,
          }}
        />
      </HeroBackground>

      <ContentContainer maxWidth="lg">
        <MotionBox
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  maxWidth: isTablet ? "100%" : "800px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <MotionBox variants={fadeIn}>
                  <LogoText
                    component="h1"
                    sx={{
                      mb: 2,
                      fontSize: isMobile
                        ? "2.5rem"
                        : isTablet
                        ? "3.5rem"
                        : "4.5rem",
                    }}
                  >
                    baxter<span className="logo-highlight">-{title}</span>
                  </LogoText>
                </MotionBox>

                <MotionBox variants={fadeIn}>
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    component="p"
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      mt: 4,
                      mb: 3,
                      fontWeight: 500,
                      lineHeight: 1.4,
                      fontSize: isMobile ? "1.25rem" : "1.75rem",
                      textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    {subtitle}
                  </Typography>
                </MotionBox>

                <MotionBox variants={fadeIn}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: isMobile ? "1rem" : "1.25rem",
                      lineHeight: 1.8,
                      color: "rgba(255, 255, 255, 0.8)",
                      mb: 5,
                      maxWidth: "600px",
                    }}
                  >
                    {description}
                  </Typography>
                </MotionBox>

                <MotionBox variants={fadeIn}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "stretch" : "center",
                    }}
                  >
                    {ctaButton ? (
                      ctaButton
                    ) : (
                      <>
                        <GradientButton
                          variant="contained"
                          size="large"
                          onClick={() => navigate("/signup")}
                          endIcon={<ArrowForwardIcon />}
                          fullWidth={isMobile}
                        >
                          Get Started
                        </GradientButton>
                      </>
                    )}
                  </Box>

                  {/* Stats counter section (optional) */}
                  {stats && (
                    <Box
                      sx={{
                        display: "flex",
                        mt: 6,
                        pt: 4,
                        gap: { xs: 3, md: 6 },
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                        flexWrap: "wrap",
                      }}
                    >
                      {stats.map((stat, index) => (
                        <Box key={index} sx={{ textAlign: "left" }}>
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 700,
                              color: "#fff",
                              lineHeight: 1,
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                              mt: 0.5,
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </MotionBox>
              </Box>
            </Grid>

            {/* Right side illustration or floating UI mockup (optional) */}
            {!isMobile && (
              <Grid item xs={12} md={5}>
                <MotionBox
                  variants={fadeIn}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 500,
                    }}
                  >
                    {/* Main UI mockup */}
                    <Box
                      sx={{
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 4,
                        p: 2,
                        boxShadow: "0 20px 80px rgba(0, 0, 0, 0.3)",
                        transform:
                          "perspective(1000px) rotateY(-10deg) rotateX(5deg)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        height: 400,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                    >
                      {/* Header bar */}
                      <Box
                        sx={{
                          p: 1.5,
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            mr: 2,
                          }}
                        >
                          {[1, 2, 3].map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                bgcolor:
                                  i === 0
                                    ? "#ff5f57"
                                    : i === 1
                                    ? "#febc2e"
                                    : "#28c840",
                              }}
                            />
                          ))}
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "rgba(255, 255, 255, 0.1)",
                          }}
                        />
                      </Box>

                      {/* Content area */}
                      <Box
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          p: 2,
                        }}
                      >
                        <Box
                          sx={{
                            height: 40,
                            width: "70%",
                            borderRadius: 1,
                            bgcolor: "rgba(255, 255, 255, 0.15)",
                            mb: 2,
                          }}
                        />

                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          {[1, 2, 3].map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                height: 24,
                                flex: 1,
                                borderRadius: 1,
                                bgcolor: "rgba(255, 255, 255, 0.1)",
                              }}
                            />
                          ))}
                        </Box>

                        <Box
                          sx={{
                            flex: 1,
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 2,
                          }}
                        >
                          {[1, 2, 3, 4].map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                borderRadius: 2,
                                bgcolor: "rgba(255, 255, 255, 0.08)",
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Box
                                sx={{
                                  height: 60,
                                  borderRadius: 1,
                                  bgcolor: "rgba(255, 255, 255, 0.1)",
                                  mb: 1.5,
                                }}
                              />
                              <Box
                                sx={{
                                  height: 10,
                                  width: "80%",
                                  borderRadius: 0.5,
                                  bgcolor: "rgba(255, 255, 255, 0.15)",
                                  mb: 1,
                                }}
                              />
                              <Box
                                sx={{
                                  height: 6,
                                  width: "60%",
                                  borderRadius: 0.5,
                                  bgcolor: "rgba(255, 255, 255, 0.1)",
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    {/* Floating accent elements */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -30,
                        right: -30,
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: "#ff4081",
                        filter: "blur(40px)",
                        opacity: 0.6,
                        animation: "pulse 6s infinite ease-in-out",
                        "@keyframes pulse": {
                          "0%": { opacity: 0.6, transform: "scale(1)" },
                          "50%": { opacity: 0.8, transform: "scale(1.2)" },
                          "100%": { opacity: 0.6, transform: "scale(1)" },
                        },
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -20,
                        left: -20,
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "#3F51B5",
                        filter: "blur(30px)",
                        opacity: 0.5,
                        animation: "float 8s infinite ease-in-out",
                        "@keyframes float": {
                          "0%": { transform: "translateY(0)" },
                          "50%": { transform: "translateY(-20px)" },
                          "100%": { transform: "translateY(0)" },
                        },
                      }}
                    />
                  </Box>
                </MotionBox>
              </Grid>
            )}
          </Grid>
        </MotionBox>
      </ContentContainer>

      {/* Scroll indicator */}
      <Box
        sx={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: 0.7,
          transition: "opacity 0.3s ease",
          "&:hover": {
            opacity: 1,
          },
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        <Typography variant="body2" sx={{ color: "white", mb: 1 }}>
          Scroll to explore
        </Typography>
        <Box
          sx={{
            width: 30,
            height: 50,
            border: "2px solid rgba(255, 255, 255, 0.5)",
            borderRadius: 30,
            display: "flex",
            justifyContent: "center",
            padding: "8px 0",
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 10,
              bgcolor: "white",
              borderRadius: 3,
              animation: "scrollIndicate 2s infinite",
              "@keyframes scrollIndicate": {
                "0%": { transform: "translateY(0)" },
                "50%": { transform: "translateY(15px)" },
                "100%": { transform: "translateY(0)" },
              },
            }}
          />
        </Box>
      </Box>
    </HeroSection>
  );
};

export default HeroSectionComponent;
