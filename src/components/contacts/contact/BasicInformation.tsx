import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Stack,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Save, Close, Phone, Email, Person, Work, MobileFriendly, Home, LocationOn, Notes } from "@mui/icons-material";
import { supabase } from "../../../../supabase/supabaseClient";
import { useSnackbar } from "../../../context/SnackbarContext";

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  primary_email: string;
  secondary_email?: string;
  mobile_phone: string;
  home_phone?: string;
  work_phone?: string;
  street_address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  title?: string;
  company?: string;
  department?: string;
  preferred_contactMethod?: string;
  notes?: string;
}

interface BasicInformationProps {
  contact: Contact | null;
  onSave: (updatedContact: Contact) => void;
}

const BasicInformation: React.FC<BasicInformationProps> = ({ contact, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Contact | null>(contact);
  const [originalData, setOriginalData] = useState<Contact | null>(contact);
  const [hasChanges, setHasChanges] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>({});
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (contact) {
      setFormData(contact);
      setOriginalData(contact);
    }
  }, [contact]);

  const checkForChanges = (newData: Contact) => {
    if (!originalData) return;

    const changedFields = Object.keys(newData).filter((key) => {
      const k = key as keyof Contact;
      return newData[k] !== originalData[k];
    });

    setHasChanges(changedFields.length > 0);
  };

  const getChangedFields = () => {
    if (!originalData || !formData) return [];

    return Object.keys(formData)
      .filter((key) => {
        const k = key as keyof Contact;
        return formData[k] !== originalData[k];
      })
      .map((key) => {
        const k = key as keyof Contact;
        return {
          field: k,
          oldValue: originalData[k],
          newValue: formData[k],
        };
      });
  };

  const formatValue = (field: string, value: any) => {
    if (value === null || value === "") return "None";

    switch (field) {
      case "primary_email":
      case "secondary_email":
        return value;
      case "mobile_phone":
      case "home_phone":
      case "work_phone":
        return value; // You can format phone numbers here if needed
      case "date_of_birth":
        return new Date(value).toLocaleDateString();
      default:
        return value;
    }
  };

  const handleInputChange = (field: keyof Contact, value: string) => {
    if (!formData) return;

    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    checkForChanges(newFormData);
  };

  const handleSave = async () => {
    setDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    setLoading(true);
    try {
      if (!formData) return;

      const { data, error } = await supabase
        .from("contacts")
        .update(formData)
        .eq("id", formData.id)
        .select()
        .single();

      if (error) throw error;

      setOriginalData(data);
      setHasChanges(false);
      setDialogOpen(false);

      onSave(data);
      showSnackbar("Contact information updated successfully", "success");
    } catch (error: any) {
      console.error("Error updating contact:", error);
      showSnackbar(error.message || "Failed to update contact", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelChanges = () => {
    if (originalData) {
      setFormData(originalData);
    }
  };

  if (!formData) {
    return (
      <Box sx={{ mt: 1, textAlign: "center" }}>
        <Typography variant="h6" color="textSecondary">
          No contact information available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            variant="h6"
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
            <Person sx={{ fontSize: "1.25rem" }} />
            Personal Information
          </Typography>
          {hasChanges && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Close />}
                onClick={handleCancelChanges}
                disabled={loading}
                size="small"
                sx={{ textTransform: "none", borderRadius: 1, px: 1.5, py: 0.5, minWidth: 0 }}
              >
                Undo Changes
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                onClick={handleSave}
                disabled={loading}
                size="small"
                sx={{ textTransform: "none", borderRadius: 1, px: 1.5, py: 0.5, minWidth: 0 }}
              >
                Save Changes
              </Button>
            </Stack>
          )}
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Grid container spacing={3}>
            {[
              { label: "First Name", value: formData.first_name, key: "first_name" },
              { label: "Last Name", value: formData.last_name, key: "last_name" },
              { label: "Date of Birth", value: formData.date_of_birth, key: "date_of_birth" },
              { label: "Company", value: formData.company || "N/A", key: "company" },
            ].map((field, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TextField
                  label={field.label}
                  value={field.value}
                  onChange={(e) => handleInputChange(field.key as keyof Contact, e.target.value)}
                  fullWidth
                  disabled={loading}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      {/* Contact Information */}
      <Box mt={4}>
        <Typography
          variant="h6"
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
          <Work sx={{ fontSize: "1.25rem" }} />
          Contact Information
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Grid container spacing={3}>
            {[
              {
                label: "Primary Email",
                value: formData.primary_email,
                key: "primary_email",
                icon: <Email fontSize="small" />,
              },
              {
                label: "Mobile Phone",
                value: formData.mobile_phone,
                key: "mobile_phone",
                icon: <MobileFriendly fontSize="small" />,
              },
              {
                label: "Home Phone",
                value: formData.home_phone || "",
                key: "home_phone",
                icon: <Home fontSize="small" />,
              },
              {
                label: "Work Phone",
                value: formData.work_phone || "",
                key: "work_phone",
                icon: <Work fontSize="small" />,
              },
            ].map((field, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TextField
                  label={field.label}
                  value={field.value}
                  onChange={(e) => handleInputChange(field.key as keyof Contact, e.target.value)}
                  fullWidth
                  size="small"
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small">{field.icon}</IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      {/* Address Section */}
      <Box mt={4}>
        <Typography
          variant="h6"
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
          <LocationOn sx={{ fontSize: "1.25rem" }} />
          Address Information
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Grid container spacing={3}>
            {[
              { label: "Street Address", value: formData.street_address, key: "street_address" },
              { label: "City", value: formData.city || "N/A", key: "city" },
              { label: "State/Province", value: formData.state || "N/A", key: "state" },
              { label: "Zip/Postal Code", value: formData.postal_code || "N/A", key: "postal_code" },
              { label: "Country", value: formData.country || "N/A", key: "country" },
            ].map((field, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TextField
                  label={field.label}
                  value={field.value}
                  onChange={(e) => handleInputChange(field.key as keyof Contact, e.target.value)}
                  fullWidth
                  size="small"
                  disabled={loading}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      {/* Notes Section */}
      <Box mt={4}>
        <Typography
          variant="h6"
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
          <Notes sx={{ fontSize: "1.25rem" }} />
          Notes
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <TextField
            label="Notes"
            value={formData.notes || "N/A"}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={4}
            disabled={loading}
          />
        </Paper>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          {getChangedFields().map(({ field, oldValue, newValue }) => (
            <Box key={field} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="primary">
                {field}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    From: {formatValue(field, oldValue)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    To: {formatValue(field, newValue)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmSave} color="primary" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BasicInformation;