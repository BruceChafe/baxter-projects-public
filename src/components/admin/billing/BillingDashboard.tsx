import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Stack,
  Button,
  Chip,
  Grid,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import { supabase } from "../../../../supabase/supabaseClient";

interface DealershipProject {
  id: string;
  dealership_id: string;
  project_slug: string;
  tier: string;
  is_active: boolean;
  stripe_subscription_id: string;
  created_at: string;
  dealership: {
    name: string;
  };
}

const BillingDashboard = () => {
  const [subscriptions, setSubscriptions] = useState<DealershipProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const { data, error } = await supabase
        .from("dealership_projects")
        .select("*, dealership(name)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSubscriptions(data);
      }

      setLoading(false);
    };

    fetchSubscriptions();
  }, []);

  const handleManage = (subscriptionId: string) => {
    // You might redirect to Stripe customer portal here in the future
    console.log("Manage subscription:", subscriptionId);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Billing & Subscriptions
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {subscriptions.map((sub) => (
            <Grid item xs={12} md={6} lg={4} key={sub.id}>
              <Card elevation={3}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dealership
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {sub.dealership?.name || "Unknown"}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={sub.project_slug.toUpperCase()}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={sub.tier.charAt(0).toUpperCase() + sub.tier.slice(1)}
                        color="secondary"
                        size="small"
                      />
                      {sub.is_active ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip label="Inactive" color="default" size="small" />
                      )}
                    </Stack>

                    <Button
                      variant="outlined"
                      startIcon={<PaymentIcon />}
                      onClick={() => handleManage(sub.stripe_subscription_id)}
                      sx={{ mt: 2, borderRadius: 2 }}
                    >
                      Manage Subscription
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BillingDashboard;
