import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  useMediaQuery,
  useTheme,
  Paper,
  alpha,
} from "@mui/material";
import { Dealership } from "../../../types";
import useDealershipUpdate from "../../../hooks/useDealershipUpdate";
import { Info, Place } from "@mui/icons-material";
import { supabase } from "../../../../supabase/supabaseClient";

interface DealershipInformationProps {
  dealership: Dealership;
  onSave: (updatedDealership: Partial<Dealership>) => void;
}

const DealershipInformation: React.FC<DealershipInformationProps> = ({
  dealership,
  onSave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { updateDealership, loading, error } = useDealershipUpdate();
  const [isEditing, setIsEditing] = useState(false);

  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("");

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (dealership?.dealergroup_id) {
        const { data, error } = await supabase
          .from("dealergroups")
          .select("subscription_status")
          .eq("id", dealership.dealergroup_id)
          .maybeSingle();
        if (error) {
          console.error("Error fetching subscription status:", error);
        } else if (data) {
          setSubscriptionStatus(data.subscription_status);
        }
      }
    }
    fetchSubscriptionStatus();
  }, [dealership]);

  const [editedDealership, setEditedDealership] = useState({
    dealership_name: dealership.dealership_name,
    address_line_1: dealership.address_line_1 || "",
    address_line_2: dealership.address_line_2 || "",
    city: dealership.city || "",
    province: dealership.province || "",
    postal_code: dealership.postal_code || "",
    country: dealership.country || "CAN",
    dateCreated: new Date(dealership.date_created).toLocaleString(),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDealership({ ...editedDealership, [name]: value });
  };

  const handleSave = () => {
    onSave({
      dealership_name: editedDealership.dealership_name,
      address_line_1: editedDealership.address_line_1,
      address_line_2: editedDealership.address_line_2,
      city: editedDealership.city,
      province: editedDealership.province,
      postal_code: editedDealership.postal_code,
      country: editedDealership.country,
    });
    setIsEditing(false);
  };

  return (
    <Box>
      <Box>
        <Typography
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Info sx={{ fontSize: "1.25rem" }} />
          General Information
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dealership Name"
                name="dealership_name"
                value={editedDealership.dealership_name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Subscription Status"
                name="subscriptionStatus"
                value={subscriptionStatus}
                fullWidth
                variant="outlined"
                size="small"
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date Created"
                name="dateCreated"
                value={editedDealership.dateCreated}
                fullWidth
                variant="outlined"
                size="small"
                disabled
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Box mt={4}>
        <Typography
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Place sx={{ fontSize: "1.25rem" }} />
          Location Information
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address Line 1"
                name="address_line_1"
                value={editedDealership.address_line_1}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address Line 2"
                name="address_line_2"
                value={editedDealership.address_line_2}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                name="city"
                value={editedDealership.city}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Province"
                name="province"
                value={editedDealership.province}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postal Code"
                name="postal_code"
                value={editedDealership.postal_code}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: isMobile ? "center" : "flex-end",
        }}
      >
        {isEditing ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outlined" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setIsEditing(true)}
            sx={{ mr: 2, width: isMobile ? "100%" : "auto" }}
          >
            Edit
          </Button>
        )}
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DealershipInformation;
