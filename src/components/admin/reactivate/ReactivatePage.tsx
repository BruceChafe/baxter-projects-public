import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import PageHelmet from "../../shared/PageHelmet";

const ReactivatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dealergroup, setDealergroup] = useState(null);
  const [error, setError] = useState("");
  const [reactivating, setReactivating] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchDealergroup = async () => {
      if (!user) return;

      try {
        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .select("dealergroup_id, primary_email, first_name, last_name")
          .eq("id", user.id)
          .single();

        if (userError || !userRecord?.dealergroup_id) throw userError;

        const { data: dg, error: dgError } = await supabase
          .from("dealergroups")
          .select("name, subscription_status, trial_end")
          .eq("id", userRecord.dealergroup_id)
          .single();

        if (dgError) throw dgError;

        setDealergroup({
          ...dg,
          user: {
            email: userRecord.email,
            name: `${userRecord.first_name || ""} ${
              userRecord.last_name || ""
            }`.trim(),
          },
        });
      } catch (err) {
        console.error("Failed to load dealer group:", err);
        setError(
          "Failed to load your account information. Please contact support."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDealergroup();
  }, [user]);

  const daysSinceExpired = () => {
    if (!dealergroup?.trial_end) return null;
    const diff =
      new Date().getTime() - new Date(dealergroup.trial_end).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const handleReactivate = () => {
    navigate("/admin/upgrade");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor={theme.palette.background.default}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={3}
      py={4}
      bgcolor={theme.palette.background.default}
    >
      <PageHelmet
        title="Reactivate | baxter-projects"
        description="Learn more about the mission, values, and team behind baxter-projects."
      />
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 550,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {error ? (
          <>
            <Stack>
              <Box display="flex" alignItems="center">
                <AlertTitle sx={{ fontWeight: 700, typography: "h5" }}>
                  Error.
                </AlertTitle>
              </Box>

              <AlertTitle sx={{ fontWeight: 700, typography: "h6", mb: 3 }}>
                Oops! Something went wrong
              </AlertTitle>

              <Alert severity="error" variant="outlined" sx={{ mb: 4 }}>
                {error}
              </Alert>
              <Divider />

              <Stack direction="row" spacing={2} alignItems="right" sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<EmailIcon />}
                  href="mailto:support@baxter-projects.com"
                >
                  Contact Support
                </Button>
              </Stack>
            </Stack>
          </>
        ) : (
          <Stack spacing={3}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <LockIcon color="error" fontSize="large" />
              <Typography variant="h5" fontWeight={700} color="error">
                Account Access Limited
              </Typography>
            </Box>

            <Alert severity="warning" variant="outlined">
              <AlertTitle>Trial Expired</AlertTitle>
              The free trial for <strong>{dealergroup?.name}</strong> ended on{" "}
              <strong>{formatDate(dealergroup?.trial_end)}</strong>
              {daysSinceExpired() !== null && (
                <> ({daysSinceExpired()} days ago)</>
              )}
              .
            </Alert>

            <Divider />

            <Card
              variant="outlined"
              sx={{ bgcolor: theme.palette.background.default }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Account Details
                  </Typography>

                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                    gap={2}
                  >
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">
                        Organization
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {dealergroup?.name}
                      </Typography>
                    </Box>

                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={
                          dealergroup?.subscription_status?.toUpperCase() ||
                          "EXPIRED"
                        }
                        color="error"
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                    gap={2}
                  >
                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">
                        Plan
                      </Typography>
                      <Typography variant="body1">
                        {dealergroup?.subscription_tier || "Free Trial"}
                      </Typography>
                    </Box>

                    <Box flex={1}>
                      <Typography variant="body2" color="text.secondary">
                        Expired On
                      </Typography>
                      <Typography
                        variant="body1"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                      >
                        <AccessTimeIcon fontSize="small" color="error" />
                        {formatDate(dealergroup?.trial_end)}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Reactivate Your Account
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Reactivate now to regain access to all features and continue
                managing your dealership operations seamlessly.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={handleReactivate}
                disabled={reactivating}
                startIcon={
                  reactivating ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PaymentIcon />
                  )
                }
              >
                {reactivating ? "Processing..." : "Reactivate Now"}
              </Button>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={2} alignItems="right">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<EmailIcon />}
                href="mailto:support@baxter-projects.com"
              >
                Contact Support
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default ReactivatePage;
