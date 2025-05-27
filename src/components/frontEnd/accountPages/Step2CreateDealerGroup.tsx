import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  MenuItem,
  InputAdornment,
  Alert,
  Divider,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Flag as FlagIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useSnackbar } from "../../../context/SnackbarContext";
import { supabase } from "../../../../supabase/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { onboardingStepsByRole } from "../../../constants/onboardingSteps";

const countries = [
  { value: "USA", label: "United States" },
  { value: "CAN", label: "Canada" },
  { value: "MEX", label: "Mexico" },
  { value: "GBR", label: "United Kingdom" },
  { value: "AUS", label: "Australia" },
];

interface Props {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  onDealerGroupCreated: (dg: { id: string }) => void;
}

const Step2CreateDealerGroup: React.FC<Props> = ({
  user,
  onDealerGroupCreated,
}) => {
  const { showSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    dealerGroupName: "",
    country: "CAN",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { refreshUser } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.dealerGroupName.trim()) {
      newErrors.dealerGroupName = "Dealer Group Name is required";
    }
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
    try {
      // STEP 1: Get session and token
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        throw new Error("You must be signed in to create a Dealer Group.");
      }
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("No active session found. Please sign in again.");
      }

      // STEP 2: Call Edge Function to create dealer group
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/createDealerGroup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.dealerGroupName,
            country: formData.country,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create Dealer Group");
      }
      const dealerGroupId = result.dealerGroup?.id;
      if (!dealerGroupId) {
        throw new Error("Dealer Group ID was not returned.");
      }

      // STEP 3: Insert user into users table
      const { error: userError } = await supabase.from("users").insert([
        {
          id: user.id,
          primary_email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          dealergroup_id: dealerGroupId,
          role_id: "721721b4-3bc1-48a0-8c14-0432fa94ad8c",
        },
      ]);
      if (userError && userError.code !== "23505") {
        throw userError;
      }

      // STEP 4: Insert platform-level user role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role_id: "721721b4-3bc1-48a0-8c14-0432fa94ad8c",
      });
      if (roleError && roleError.code !== "23505") {
        throw roleError;
      }

      // STEP 5: Seed onboarding steps
      const roleSteps = onboardingStepsByRole["groupAdmin"];
      if (roleSteps && roleSteps.length) {
        const steps = roleSteps.map((step) => ({
          user_id: user.id,
          step_key: step.step_key,
          status: "pending",
        }));
        
        const { error: onboardingError } = await supabase
          .from("user_onboarding")
          .insert(steps);
        if (onboardingError && onboardingError.code !== "23505") {
          throw onboardingError;
        }
      }

      // STEP 6: Update auth user metadata and refresh context
      try {
        const { data: sessionData2, error: sessionError2 } =
          await supabase.auth.getSession();
        if (sessionError2 || !sessionData2.session) {
          throw new Error("No active session found before metadata update.");
        }
        await supabase.auth.updateUser({
          data: { dealergroup_id: dealerGroupId },
        });
        await refreshUser();
      } catch {
        // Non-blocking: ignore metadata update errors
      }

      // Final: success feedback and navigation
      showSnackbar(
        "Dealer Group created! You're almost ready to go.",
        "success"
      );
      onDealerGroupCreated({ id: dealerGroupId });
    } catch (err: any) {
      showSnackbar(err.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#4A3D6A", fontWeight: 500 }}
      >
        Set up your Dealer Group
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This will help organize your teams and locations.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dealer Group Name"
            name="dealerGroupName"
            value={formData.dealerGroupName}
            onChange={handleChange}
            error={!!errors.dealerGroupName}
            helperText={errors.dealerGroupName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon sx={{ color: "#4A3D6A" }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FlagIcon sx={{ color: "#4A3D6A" }} />
                </InputAdornment>
              ),
            }}
          >
            {countries.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{
            bgcolor: "#FF4081",
            color: "white",
            "&:hover": {
              bgcolor: "#d81b60",
            },
            px: 3,
            py: 1.2,
          }}
        >
          {isLoading ? "Creating..." : "Complete Setup & Continue"}
        </Button>
      </Box>
    </Box>
  );
};

export default Step2CreateDealerGroup;
