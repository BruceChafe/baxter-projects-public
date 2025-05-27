import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  styled,
  Paper,
  IconButton,
  Fade,
} from "@mui/material";
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import SignUpWithEmailPage from "./SignUpWithEmail";
import CheckEmailPrompt from "./CheckEmailPrompt";
import { Link as RouterLink } from "react-router-dom";
import { supabase } from "../../../../supabase/supabaseClient";
import PageHelmet from "../../shared/PageHelmet";

const theme = createTheme({
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.3px",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: "#FF4D8D",
      dark: "#E43A7A",
      light: "#FFa0c4",
      contrastText: "#fff",
    },
    secondary: {
      main: "#6A5B8C",
      dark: "#524266",
      light: "#8471AB",
    },
    background: {
      default: "#524266",
      paper: "#fff",
    },
    text: {
      primary: "#3D3151",
      secondary: "#6E6A7C",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 2px 8px rgba(0, 0, 0, 0.05)",
    "0px 4px 16px rgba(0, 0, 0, 0.08)",
  ],
});

const StyledBackground = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 35%, ${theme.palette.primary.main} 100%)`,
  backgroundSize: "300% 300%",
  animation: `gradientBG 15s ease infinite`,
  "@keyframes gradientBG": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage:
      "radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 25%)",
    pointerEvents: "none",
  },
}));

const BackgroundDecoration = styled(Box)(({ theme }) => ({
  position: "absolute",
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.05)",
  filter: "blur(20px)",
  "@keyframes floatAnimation": {
    "0%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-20px)" },
    "100%": { transform: "translateY(0px)" },
  },
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  width: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  boxShadow:
    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -5px rgba(0, 0, 0, 0.04)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    boxShadow:
      "0 20px 35px -10px rgba(0, 0, 0, 0.12), 0 15px 20px -10px rgba(0, 0, 0, 0.06)",
  },
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "6px",
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover::after": {
    opacity: 1,
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  textDecoration: "none",
  fontWeight: 800,
  transition: "color 0.3s ease",
  display: "flex",
  alignItems: "center",
  fontSize: "1.5rem",
  letterSpacing: "-0.5px",
  lineHeight: 1.1,
  "& .logo-highlight": {
    color: "#FF4081",
    marginLeft: "4px",
  },
  position: "relative",
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

type Step = "start" | "email" | "confirm" | "dealerGroup" | "dealership";

const SignUpPage = () => {
  const [step, setStep] = useState<Step>("start");
  const [userData, setUserData] = useState<any>(null);
  const [dealerGroupData, setDealerGroupData] = useState<any>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setFadeIn(true);

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user && step === "confirm") {
          setUserData((prev: any) => ({
            ...prev,
            id: session.user.id,
          }));
          setStep("dealerGroup");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [step]);

  const handleStepChange = (nextStep: Step) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(nextStep);
      setFadeIn(true);
    }, 200);
  };

  return (
    <ThemeProvider theme={theme}>
      <PageHelmet
        title="Sign Up | baxter-projects"
        description="Learn more about the mission, values, and team behind baxter-projects."
      />
      <StyledBackground>
        <BackgroundDecoration
          sx={{
            width: 300,
            height: 300,
            top: "10%",
            left: "5%",
            animation: "floatAnimation 8s infinite ease-in-out",
          }}
        />
        <BackgroundDecoration
          sx={{
            width: 200,
            height: 200,
            bottom: "15%",
            right: "10%",
            animation: "floatAnimation 12s infinite ease-in-out 1s",
          }}
        />

        <Container
          maxWidth="sm"
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Fade in={fadeIn} timeout={500}>
            <StyledCard elevation={3}>
              {step === "email" && (
                <Box>
                  <SignUpWithEmailPage
                    goBack={() => handleStepChange("start")}
                    onEmailSubmitted={(data: any) => {
                      setUserData(data);
                      handleStepChange("confirm");
                    }}
                  />
                </Box>
              )}

              {step === "confirm" && userData?.email && userData?.password && (
                <CheckEmailPrompt
                  email={userData.email}
                  password={userData.password}
                  onContinue={(user: any) => {
                    const enrichedUser = { ...userData, id: user.id };
                    setUserData(enrichedUser);
                    handleStepChange("dealerGroup");
                  }}
                />
              )}

              {step === "start" && (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <LogoText
                      variant="h4"
                      component={RouterLink}
                      to="/"
                      sx={{
                        mb: 2,
                        fontSize: isMobile
                          ? "2.5rem"
                          : isTablet
                          ? "3.5rem"
                          : "3.5rem",
                      }}
                    >
                      baxter<span className="logo-highlight">-projects</span>
                    </LogoText>
                  </Box>

                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ color: "text.primary" }}
                  >
                    Sign up for free
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: theme.palette.primary.main,
                      mb: 4,
                      fontWeight: 500,
                    }}
                  >
                    Start your trial today. No credit card required.
                  </Typography>

                  <Stack spacing={2.5}>
                    <AnimatedButton
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<EmailIcon />}
                      onClick={() => handleStepChange("email")}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: "0 4px 8px rgba(255, 77, 141, 0.2)",
                      }}
                    >
                      Sign up with Email
                    </AnimatedButton>

                    <Box sx={{ position: "relative", my: 1 }}>
                      <Divider sx={{ my: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", px: 1 }}
                        >
                          or continue with
                        </Typography>
                      </Divider>
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<GoogleIcon />}
                      sx={{
                        py: 1.5,
                        opacity: 0.7,
                        borderRadius: 2,
                        borderColor: "#ddd",
                        "&.Mui-disabled": {
                          borderColor: "#ddd",
                          color: "text.secondary",
                        },
                      }}
                      disabled
                    >
                      Google
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<GitHubIcon />}
                      sx={{
                        py: 1.5,
                        opacity: 0.7,
                        borderRadius: 2,
                        borderColor: "#ddd",
                        "&.Mui-disabled": {
                          borderColor: "#ddd",
                          color: "text.secondary",
                        },
                      }}
                      disabled
                    >
                      GitHub
                    </Button>
                  </Stack>

                  <Box
                    sx={{
                      mt: 4,
                      pt: 3,
                      textAlign: "center",
                      borderTop: "1px solid",
                      borderColor: "rgba(0,0,0,0.06)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Already have an account?{" "}
                      <Link
                        component={RouterLink}
                        to="/signin"
                        underline="none"
                        sx={{
                          color: "primary.main",
                          fontWeight: 600,
                          "&:hover": {
                            color: "primary.dark",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        Sign in
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              )}
            </StyledCard>
          </Fade>
        </Container>
      </StyledBackground>
    </ThemeProvider>
  );
};

export default SignUpPage;
