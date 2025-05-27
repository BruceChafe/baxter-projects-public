import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Card,
  Container,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Search as SearchIcon,
  Store as StoreIcon,
} from "@mui/icons-material";
import useProjectAccess from "../../../hooks/admin/checkProjectAccess";
import { useAuth } from "../../../context/AuthContext";

interface Step1Props {
  formData: any;
  touchedFields: any;
  dealerGroups: { id: number; name: string }[];
  selectedDealership: string | null;
  selected_dealergroup_id: number | null;
  userDealerships: { dealership_id: string; dealership_name: string }[];
  handleInputChange: (field: string, value: any) => void;
  handleSearchDuplicates: () => void;
  handleDealershipChange: (id: string) => void;
  setSelectedDealerGroupId: (id: number) => void;
  loading: boolean;
  inputStyles: object;
  buttonStyles: object;
  sectionStyles: object;
  headerStyles: object;
  isValidEmail: (email: string) => boolean;
}

const Step1: React.FC<Step1Props> = ({
  formData,
  touchedFields,
  dealerGroups,
  selectedDealership,
  selected_dealergroup_id,
  userDealerships,
  handleInputChange,
  handleSearchDuplicates,
  handleDealershipChange,
  setSelectedDealerGroupId,
  loading,
  inputStyles,
  buttonStyles,
  sectionStyles,
  headerStyles,
  isValidEmail,
}) => {
  const { accessContext } = useAuth();

  const FEATURE_SLUG = "contact_search";

  const {
    projectAccess,
    loading: loadingAccess,
    error: accessError,
  } = useProjectAccess(selectedDealership, selected_dealergroup_id || "");

  // Grant access if trialing, active, or tier === "basic"
  const canAccess =
    accessContext?.trialing ||
    accessContext?.active ||
    projectAccess[FEATURE_SLUG] === "basic";

  // Block UI if no access
  if (!canAccess) {
    if (loadingAccess) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <CircularProgress />
        </Box>
      );
    }
    if (accessError) {
      return (
        <Typography color="error" align="center" mt={4}>
          Error loading access rights.
        </Typography>
      );
    }

    return (
      <Container sx={{ mt: 4 }}>
        <Card elevation={0} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Feature Unavailable
          </Typography>
          <Typography color="text.secondary">
            You don’t have access to the UpShift dashboard.
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <Box sx={headerStyles}>
        <SearchIcon className="icon" />
        <Typography variant="h4" className="title">
          Begin with a search
        </Typography>
        <Typography variant="subtitle1" className="subtitle">
          Enter contact details to streamline their dealership visit
        </Typography>
      </Box>

      <Box component="form">
        {/* Dealership */}
        {userDealerships.length > 0 && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Dealership</InputLabel>
            <Select
              label="Dealership"
              value={
                userDealerships.find(
                  (d) => d.dealership_id === selectedDealership
                )
                  ? selectedDealership
                  : ""
              }
              onChange={(e) => handleDealershipChange(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <StoreIcon sx={{ color: "action.active", ml: 1 }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: "12px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: selected_dealergroup_id
                    ? "primary.light"
                    : "divider",
                  borderWidth: selected_dealergroup_id ? 2 : 1,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              }}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select a dealership</em>
              </MenuItem>
              {userDealerships.map((d) => (
                <MenuItem key={d.dealership_id} value={d.dealership_id}>
                  {d.dealership_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {userDealerships.length === 0 && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Dealership</InputLabel>
            <Select
              value=""
              displayEmpty
              disabled
              startAdornment={
                <InputAdornment position="start">
                  <StoreIcon sx={{ color: "action.active", ml: 1 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                <em>No dealerships available</em>
              </MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Contact Info */}
        <Box sx={sectionStyles}>
          <Typography variant="subtitle2" className="section-title">
            Contact Information
          </Typography>
          <Grid container spacing={2}>
            {/* First Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                value={formData.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                required
                fullWidth
                variant="outlined"
                error={
                  touchedFields.first_name && formData.first_name.trim() === ""
                }
                helperText={
                  touchedFields.first_name && formData.first_name.trim() === ""
                    ? "First name is required"
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                required
                fullWidth
                variant="outlined"
                error={
                  touchedFields.last_name && formData.last_name.trim() === ""
                }
                helperText={
                  touchedFields.last_name && formData.last_name.trim() === ""
                    ? "Last name is required"
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                value={formData.primary_email}
                onChange={(e) =>
                  handleInputChange("primary_email", e.target.value)
                }
                fullWidth
                variant="outlined"
                error={
                  touchedFields.primary_email &&
                  formData.primary_email !== "" &&
                  !isValidEmail(formData.primary_email)
                }
                helperText={
                  touchedFields.primary_email &&
                  formData.primary_email !== "" &&
                  !isValidEmail(formData.primary_email)
                    ? "Please enter a valid email address"
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                value={formData.mobile_phone}
                onChange={(e) =>
                  handleInputChange("mobile_phone", e.target.value)
                }
                fullWidth
                variant="outlined"
                placeholder="(555) 555-5555"
                error={
                  touchedFields.mobile_phone &&
                  formData.mobile_phone.replace(/\D/g, "").length !== 10
                }
                helperText={
                  touchedFields.mobile_phone &&
                  formData.mobile_phone.replace(/\D/g, "").length !== 10
                    ? "Please enter a valid 10-digit phone number"
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Search Button */}
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchDuplicates}
            disabled={loading}
            fullWidth
            sx={buttonStyles}
            startIcon={<SearchIcon />}
          >
            {loading ? "Searching..." : "Search Contacts"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Step1;
