import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../supabase/supabaseClient";
import { useSnackbar } from "../../../context/SnackbarContext";
import { Box, Button, CircularProgress, Container, Paper, TextField, Typography } from "@mui/material";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // grab the hash fragment, strip the leading “#”
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    if (type === "recovery" && access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            showSnackbar("Invalid or expired reset link.", "error");
            navigate("/signin", { replace: true });
          } else {
            setLoading(false);
          }
        });
    } else {
      showSnackbar("Missing or invalid password-reset token.", "error");
      navigate("/signin", { replace: true });
    }
  }, []);

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      showSnackbar("Password needs at least 6 characters.", "warning");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSubmitting(false);

    if (error) {
      showSnackbar("Could not update password. Try again.", "error");
    } else {
      showSnackbar("✔️ Password reset!", "success");
      navigate("/signin", { replace: true });
    }
  };

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          Reset Your Password
        </Typography>
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Updating…" : "Update Password"}
        </Button>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
