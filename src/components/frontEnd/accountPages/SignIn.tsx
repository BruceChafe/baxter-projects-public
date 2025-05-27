import React, { useState, useEffect, FormEvent } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Close as CloseIcon,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { supabase } from "../../../../supabase/supabaseClient";
import { useSnackbar } from "../../../context/SnackbarContext";
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
    // ... rest of shadows
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

const mapSupabaseError = (error: any): string => {
  switch (error.message) {
    case "Invalid login credentials":
      return "Incorrect email or password. Please try again.";
    case "Email not confirmed":
      return "Please confirm your email before signing in.";
    case "Too many requests":
      return "Too many login attempts. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

type Step = "start" | "email" | "confirm" | "dealerGroup" | "dealership";

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      showSnackbar("Email and password are required.", "warning");
      return;
    }

    setIsSigningIn(true);
    try {
      const { data: signInData, error } =
        await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const userId = signInData.user?.id;
      if (userId) {
        await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", userId);
      }

      showSnackbar("Signed in successfully.", "success");
      navigate("/project-hub");
    } catch (error: any) {
      console.error("Sign-in error:", error);
      showSnackbar(mapSupabaseError(error), "error");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showSnackbar("Please enter your email to reset the password.", "warning");
      return;
    }

    setIsResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
      });
      if (error) throw error;

      showSnackbar(
        "Password reset email sent. Please check your inbox.",
        "success"
      );
      setIsPasswordResetOpen(false);
    } catch (error: any) {
      showSnackbar(mapSupabaseError(error), "error");
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <PageHelmet
        title="Sign In | baxter-projects"
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
            zIndex: 2,
          }}
        >
          <Fade in={fadeIn} timeout={500}>
            <StyledCard elevation={3}>
              <Box sx={{ position: "relative" }}>
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
                  Welcome back
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{
                    color: theme.palette.primary.main,
                    mb: 2,
                    fontWeight: 500,
                  }}
                >
                  Sign into your account.
                </Typography>

                <form onSubmit={handleSignIn}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSigningIn}
                    sx={{ borderRadius: 2, py: 1.5, mb: 2 }}
                  >
                    {isSigningIn ? "Signing in..." : "Sign in"}
                  </Button>

                  <Box sx={{ textAlign: "center" }}>
                    <Button
                      variant="text"
                      onClick={() => setIsPasswordResetOpen(true)}
                      sx={{ color: "primary.main" }}
                    >
                      Forgot password?
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      pt: 3,
                      textAlign: "center",
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Don't have an account?{" "}
                      <Link
                        component={RouterLink}
                        to="/signup"
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
                        Sign up
                      </Link>
                    </Typography>
                  </Box>
                </form>
              </Box>
            </StyledCard>
          </Fade>
        </Container>

        <Dialog
          open={isPasswordResetOpen}
          onClose={() => setIsPasswordResetOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxWidth: "sm",
              width: "100%",
              p: { xs: 2, sm: 3 },
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              fontSize: "1.5rem",
              pb: 1,
              pr: 6,
              position: "relative",
            }}
          >
            Reset your password
            <IconButton
              onClick={() => setIsPasswordResetOpen(false)}
              sx={{
                position: "absolute",
                right: 12,
                top: 12,
                color: "text.secondary",
                "&:hover": { color: theme.palette.primary.main },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 1 }}>
            <Typography
              variant="body1"
              sx={{ mb: 3, color: "text.secondary", lineHeight: 1.6 }}
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </Typography>

            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setIsPasswordResetOpen(false)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 500 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleForgotPassword}
              disabled={isResetLoading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                minWidth: 160,
              }}
            >
              {isResetLoading ? "Sending..." : "Send reset link"}
            </Button>
          </DialogActions>
        </Dialog>
      </StyledBackground>
    </ThemeProvider>
  );
};

export default SignInPage;
