import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Typography,
  TextField,
  Divider,
  Button,
  useTheme,
  IconButton,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormGroup,
  Checkbox,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import { useSnackbar } from "../../context/SnackbarContext";
import axiosInstance from "../../axios";

interface FormData {
  first_name: string;
  last_name: string;
  primary_email: string;
  mobile_phone: string;
  [key: string]: any;
}

interface DuplicateContact {
  id: string;
  first_name: string;
  last_name: string;
  primary_email: string;
  mobile_phone: string;
}

interface NewContactDialogProps {
  open: boolean;
  onClose: () => void;
}

const NewContactDialog: React.FC<NewContactDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    preferred_language: "",
    preferred_contact: [],
    primary_email: "",
    secondary_email: "",
    mobile_phone: "",
    home_phone: "",
    work_phone: "",
    street_address: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Canada",
  });
  const [duplicates, setDuplicates] = useState<DuplicateContact[]>([]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => {
      const preferred_contact = prev.preferred_contact.includes(value)
        ? prev.preferred_contact.filter((item: string) => item !== value)
        : [...prev.preferred_contact, value];
      return { ...prev, preferred_contact };
    });
  };

  const handleClear = () => {
    setFormData({
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      preferred_language: "",
      preferred_contact: [],
      primary_email: "",
      secondary_email: "",
      mobile_phone: "",
      home_phone: "",
      work_phone: "",
      street_address: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
    });
    setDuplicates([]);
    setStep(1);
  };

  const validateMandatoryFields = () => {
    return formData.first_name.trim() && formData.last_name.trim();
  };

  const handleSearchDuplicates = async () => {
    if (!validateMandatoryFields()) {
      showSnackbar("Please fill out all mandatory fields.", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/searchDuplicates", formData);
      setDuplicates(response.data.duplicates || []);
      setStep(2);
    } catch (error) {
      showSnackbar("Error searching for duplicates.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    setLoading(true);
    try {
      await axiosInstance.post("/addContact", formData);
      showSnackbar("Contact created successfully", "success");
      handleClear();
      onClose();
    } catch (error) {
      showSnackbar("Error creating contact.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      handleClear();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullScreen={isMobile}
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          maxWidth: '800px',
          margin: 'auto'
        }
      }}
    >
      {/* Enhanced Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={4}
        py={2.5}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <Box display="flex" alignItems="center">
          <DialogTitle sx={{
            p: 0,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'text.primary',
            letterSpacing: '-0.01em'
          }}>
            {step === 1
              ? "Enter Details"
              : step === 2
                ? "Duplicates Found"
                : "Create Contact"}
          </DialogTitle>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: alpha(theme.palette.text.primary, 0.04)
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Stepper activeStep={step - 1} alternativeLabel sx={{ py: 3 }}>
        <Step>
          <StepLabel>Mandatory Fields</StepLabel>
        </Step>
        <Step>
          <StepLabel>Duplicate Check</StepLabel>
        </Step>
        <Step>
          <StepLabel>Create Contact</StepLabel>
        </Step>
      </Stepper>
      <Divider />

      {step === 1 && (
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                fullWidth
                size="small"
                placeholder="Enter first name"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                fullWidth
                size="small"
                placeholder="Enter last name"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Primary Email"
                value={formData.primary_email}
                onChange={(e) =>
                  handleInputChange("primary_email", e.target.value)
                }
                fullWidth
                size="small"
                placeholder="Enter email (optional)"
                helperText="Optional"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile Phone"
                value={formData.mobile_phone}
                onChange={(e) =>
                  handleInputChange("mobile_phone", e.target.value)
                }
                fullWidth
                size="small"
                placeholder="Enter phone number (optional)"
                helperText="Optional"
              />
            </Grid>
          </Grid>
        </DialogContent>
      )}

      {step === 2 && (
        <DialogContent>
          {duplicates.length > 0 ? (
            <Box>
              {duplicates.map((contact) => (
                <Card
                  key={contact.id}
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    backgroundColor: "rgba(0, 0, 0, 0.03)", // Light gray background
                    borderRadius: 2, // Rounded corners
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
                  }}
                >
                  <Avatar
                    sx={{
                      mr: 2,
                      bgcolor: "primary.main", // Highlighted avatar color
                      color: "white",
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {contact.first_name} {contact.last_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Email: {contact.primary_email}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Phone: {contact.mobile_phone}
                    </Typography>
                  </CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => {
                        showSnackbar(`Selected: ${contact.first_name}`, "info");
                        handleClear();
                        onClose();
                      }}
                    >
                      Select
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>
          ) : (
            <Box>
              <Typography>
                No duplicates found. Proceed to create a new contact.
              </Typography>
            </Box>
          )}
        </DialogContent>
      )}

      {step === 3 && (
        <DialogContent sx={{ px: { xs: 2, sm: 4 }, bgcolor: '#F2F4FC', }}>
          <Box sx={{ pt: 1 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) =>
                    handleInputChange("first_name", e.target.value)
                  }
                  fullWidth
                  size="small"
                  placeholder="Enter first name"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) =>
                    handleInputChange("last_name", e.target.value)
                  }
                  fullWidth
                  size="small"
                  placeholder="Enter last name"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Birth"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleInputChange("date_of_birth", e.target.value)
                  }
                  fullWidth
                  size="small"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  select
                  fullWidth
                  size="small"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>Preferred Language:</Typography>
                <RadioGroup
                  row
                  value={formData.preferred_language}
                  onChange={(e) =>
                    handleInputChange("preferred_language", e.target.value)
                  }
                >
                  <FormControlLabel
                    value="English"
                    control={<Radio />}
                    label="English"
                  />
                  <FormControlLabel
                    value="French"
                    control={<Radio />}
                    label="French"
                  />
                </RadioGroup>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>Preferred Contact:</Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.preferred_contact.includes("Phone")}
                        onChange={() => handleCheckboxChange("Phone")}
                      />
                    }
                    label="Phone"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.preferred_contact.includes("SMS")}
                        onChange={() => handleCheckboxChange("SMS")}
                      />
                    }
                    label="SMS"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.preferred_contact.includes("Email")}
                        onChange={() => handleCheckboxChange("Email")}
                      />
                    }
                    label="Email"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Primary Email"
                  value={formData.primary_email}
                  onChange={(e) =>
                    handleInputChange("primary_email", e.target.value)
                  }
                  fullWidth
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Secondary Email"
                  value={formData.secondary_email}
                  onChange={(e) =>
                    handleInputChange("secondary_email", e.target.value)
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Phone"
                  value={formData.mobile_phone}
                  onChange={(e) =>
                    handleInputChange("mobile_phone", e.target.value)
                  }
                  fullWidth
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Home Phone"
                  value={formData.home_phone}
                  onChange={(e) =>
                    handleInputChange("home_phone", e.target.value)
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Work Phone"
                  value={formData.work_phone}
                  onChange={(e) =>
                    handleInputChange("work_phone", e.target.value)
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Address Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Street Address"
                  value={formData.street_address}
                  onChange={(e) =>
                    handleInputChange("street_address", e.target.value)
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Province"
                  value={formData.province}
                  onChange={(e) =>
                    handleInputChange("province", e.target.value)
                  }
                  select
                  fullWidth
                  size="small"
                >
                  <MenuItem value="AB">Alberta</MenuItem>
                  <MenuItem value="BC">British Columbia</MenuItem>
                  <MenuItem value="MB">Manitoba</MenuItem>
                  <MenuItem value="NB">New Brunswick</MenuItem>
                  <MenuItem value="NL">Newfoundland and Labrador</MenuItem>
                  <MenuItem value="NS">Nova Scotia</MenuItem>
                  <MenuItem value="ON">Ontario</MenuItem>
                  <MenuItem value="PE">Prince Edward Island</MenuItem>
                  <MenuItem value="QC">Quebec</MenuItem>
                  <MenuItem value="SK">Saskatchewan</MenuItem>
                  <MenuItem value="NT">Northwest Territories</MenuItem>
                  <MenuItem value="NU">Nunavut</MenuItem>
                  <MenuItem value="YT">Yukon</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    handleInputChange("postal_code", e.target.value)
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      )}

      <DialogActions
        sx={{
          px: 4,
          py: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          onClick={handleClear}
          variant="outlined"
          color="secondary"
          disabled={loading}
        >
          Clear
        </Button>
        {step === 1 && (
          <Button
            onClick={handleSearchDuplicates}
            variant="contained"
            disabled={loading || !validateMandatoryFields()}
          >
            {loading ? "Searching..." : "Next"}
          </Button>
        )}
        {step === 2 && (
          <Button
            onClick={() => setStep(3)}
            variant="contained"
            disabled={loading}
          >
            Create Contact
          </Button>
        )}
        {step === 3 && (
          <Button
            onClick={handleCreateContact}
            variant="contained"
            disabled={loading || !validateMandatoryFields()}
            startIcon={loading ? undefined : <PersonIcon />}
          >
            {loading ? "Submitting..." : "Create Contact"}
          </Button>
        )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default NewContactDialog;
