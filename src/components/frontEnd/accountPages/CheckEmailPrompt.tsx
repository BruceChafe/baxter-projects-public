import React, { useEffect, useState } from "react";
import { Box, Typography, Alert, Button, Stack, styled, Paper, useMediaQuery, createTheme } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import EmailIcon from "@mui/icons-material/Email";
import { Link as RouterLink } from "react-router-dom";
import { supabase } from "../../../../supabase/supabaseClient";
import { useSnackbar } from "../../../context/SnackbarContext";

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

const RESEND_COOLDOWN = 30;

interface Props {
  email: string;
}

const CheckEmailPrompt: React.FC<Props> = ({ email }) => {
  const { showSnackbar } = useSnackbar();
  const [resending, setResending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(new Date());
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        window.close();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleResend = async () => {
    setResending(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not found");

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email!,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm`,
        },
      });

      if (error) throw error;

      setLastSent(new Date());
      setCooldown(RESEND_COOLDOWN);
      showSnackbar("Confirmation email resent!", "success");
    } catch (err: any) {
      console.error("Resend error:", err);
      showSnackbar(
        err.message || "Failed to resend confirmation email",
        "error"
      );
    } finally {
      setResending(false);
    }
  };

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

  const formatLastSent = (date: Date | null) =>
    date
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "N/A";

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <LogoText
          variant="h4"
          component={RouterLink}
          to="/"
          sx={{
            mb: 2,
            fontSize: isMobile ? "2.5rem" : isTablet ? "3.5rem" : "3.5rem",
          }}
        >
          baxter<span className="logo-highlight">-projects</span>
        </LogoText>
      </Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Check your Email
      </Typography>

      <Alert icon={<EmailIcon />} severity="info" sx={{ my: 3 }}>
        We've sent a confirmation email to <strong>{email}</strong>. Please
        click the link inside to verify your account.
      </Alert>

      <Typography variant="body2" color="text.secondary" mb={2}>
        This tab will close automatically once your email is confirmed.
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Didn’t get the email? Be sure to check your spam folder.
      </Typography>

      <Stack spacing={2}>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          startIcon={<ReplayIcon />}
        >
          {resending
            ? "Resending..."
            : cooldown > 0
            ? `Resend available in ${cooldown}s`
            : "Resend Confirmation Email"}
        </Button>

        <Typography variant="caption" color="text.secondary" align="center">
          Last sent: {formatLastSent(lastSent)}
        </Typography>
      </Stack>
    </Box>
  );
};

export default CheckEmailPrompt;
