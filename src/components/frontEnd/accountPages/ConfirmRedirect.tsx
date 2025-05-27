import { useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabase/supabaseClient";

const ConfirmRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const waitForAuth = async () => {
      const { data } = await supabase.auth.getSession();

      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (data.session?.user) {
        navigate("/onboarding", { replace: true });
      }
    };

    waitForAuth();
  }, [navigate]);

  return (
    <Box
      textAlign="center"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Typography variant="h5" fontWeight={600} gutterBottom>
        You’re all set!
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Redirecting you to continue setup...
      </Typography>
      <CircularProgress />
    </Box>
  );
};

export default ConfirmRedirect;
