import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email as EmailIcon,
  Lock,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useSnackbar } from "../../../context/SnackbarContext";
import { Link as RouterLink } from "react-router-dom";
import { supabase } from "../../../../supabase/supabaseClient";
import { styled } from "@mui/system";

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

interface SignUpWithEmailPageProps {
  goBack: () => void;
  onEmailSubmitted: (user: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    id?: string;
  }) => void;
}

const SignUpWithEmailPage: React.FC<SignUpWithEmailPageProps> = ({
  goBack,
  onEmailSubmitted,
}) => {
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
  
    const roleName = "groupAdmin"; // Role name for groupAdmin
    const roleId = "721721b4-3bc1-48a0-8c14-0432fa94ad8c"; // UUID of Group Admin from roles table
  
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `https://baxter-projects.com/onboarding`,
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: roleName, // 💡 Add role in metadata
          },
        },
      });
  
      if (error) throw error;
  
      showSnackbar("Account created! Please check your email to confirm your account.", "success");
  
onEmailSubmitted({ ...formData });
    } catch (err: any) {
      console.error("Signup error:", err);
      showSnackbar(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ mb: 3 }}>
        <LogoText
          variant="h4"
          sx={{
            mb: 3,
            fontSize: isMobile ? "2.5rem" : isTablet ? "3.5rem" : "3.5rem",
          }}
        >
          baxter<span className="logo-highlight">-projects</span>
        </LogoText>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Create your account
        </Typography>

        <Alert
          severity="info"
          sx={{ mt: 2, mb: 4 }}
          iconMapping={{ info: <InfoIcon /> }}
        >
          After creating your account, you'll set up your dealer group and start your 7-day free trial.
        </Alert>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={!!errors.first_name}
              helperText={errors.first_name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={!!errors.last_name}
              helperText={errors.last_name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password || "Must be at least 8 characters"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              By signing up, you agree to our{" "}
              <Link component={RouterLink} to="/legal#terms">Terms of Service</Link> and{" "}
              <Link component={RouterLink} to="/legal#privacy">Privacy Policy</Link>.
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Button
              onClick={goBack}
              variant="outlined"
              disabled={isLoading}
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                transition: "all 0.3s ease",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: "0 4px 8px rgba(255, 77, 141, 0.2)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 18px 0 rgba(255, 77, 141, 0.39)",
                },
              }}
            >
              Back
            </Button>
          </Grid>

          <Grid item xs={6}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                transition: "all 0.3s ease",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: "0 4px 8px rgba(255, 77, 141, 0.2)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 18px 0 rgba(255, 77, 141, 0.39)",
                },
              }}
            >
              {isLoading ? "Creating account..." : "Continue"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default SignUpWithEmailPage;
