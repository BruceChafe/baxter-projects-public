import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { Business as BusinessIcon, RemoveCircle as RemoveCircleIcon } from "@mui/icons-material";
import { useSnackbar } from "../../../context/SnackbarContext";
import { supabase } from "../../../../supabase/supabaseClient";

interface Props {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  dealerGroup: { id: string };
  onDealershipsCreated: () => void;
}

const Step3CreateDealerships: React.FC<Props> = ({
  user,
  dealerGroup,
  onDealershipsCreated,
}) => {
  const { showSnackbar } = useSnackbar();
  const [names, setNames] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (index: number, value: string) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const addRow = () => {
    setNames((prev) => [...prev, ""]);
  };

  const removeRow = (index: number) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (names.some((n) => !n.trim())) {
      showSnackbar("All dealership names are required", "warning");
      return;
    }

    setIsLoading(true);
    try {
      // Get current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      // Create each dealership in order
      for (let i = 0; i < names.length; i++) {
        const name = names[i].trim();
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/createDealership`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name,
              dealergroup_id: dealerGroup.id,
              user_id: user.id,
            }),
          }
        );
        const result = await resp.json();
        if (!resp.ok) throw new Error(result.error || "CreateDealership failed");

        const dealershipId = result.dealership?.id;
        if (!dealershipId) throw new Error("No dealership ID returned");

        // Assign user to dealership, primary only for the first
        const { error: udError } = await supabase
          .from("user_dealerships")
          .insert([
            {
              user_id: user.id,
              dealership_id: dealershipId,
              is_primary: i === 0,
              role_id: "721721b4-3bc1-48a0-8c14-0432fa94ad8c", // Group Admin
            },
          ]);
        if (udError) console.warn("Assignment error:", udError);
      }

      showSnackbar("Dealerships created! Redirecting...", "success");
      onDealershipsCreated();
    } catch (err: any) {
      console.error("Step3 error:", err);
      showSnackbar(err.message || "Setup failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Create Your Dealerships
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        The first one will be marked as your default location.
      </Alert>

      <Grid container spacing={2}>
        {names.map((value, idx) => (
          <Grid item xs={12} key={idx} container alignItems="center" spacing={1}>
            <Grid item xs>
              <TextField
                fullWidth
                required
                label={`Dealership ${idx + 1}`}
                value={value}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {names.length > 1 && (
              <Grid item>
                <IconButton onClick={() => removeRow(idx)}>
                  <RemoveCircleIcon />
                </IconButton>
              </Grid>
            )}
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button onClick={addRow} disabled={isLoading}>
            + Add Another Dealership
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? "Creating..." : "Complete Setup & Continue"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Step3CreateDealerships;
