import React from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  PersonSearch as PersonSearchIcon,
} from "@mui/icons-material";

const Step2 = ({
  formData,
  touchedFields,
  duplicates,
  handleInputChange,
  handleSelectContact,
  handleCreateContact,
  handleBack,
  loading,
  isValidEmail,
  inputStyles,
  buttonStyles,
  sectionStyles,
  headerStyles,
}: any) => {
  return (
    <>
      <Box sx={headerStyles}>
        <PersonSearchIcon className="icon" />
        <Typography variant="h4" className="title">
          Confirm or Create a Contact
        </Typography>
        <Typography variant="subtitle1" className="subtitle">
          Choose an existing contact from the list or add a new one
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Search Results */}
        <Grid item xs={12} md={6}>
          <Box sx={{ ...sectionStyles, minHeight: "400px" }}>
            <Typography variant="h5" className="section-title">
              Search Results
            </Typography>
            <Box sx={{ flex: 1, overflowY: "auto", pr: 1, mt: 2 }}>
              {duplicates.length > 0 ? (
                duplicates.map((contact: any, index: number) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "action.hover",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {contact.first_name} {contact.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contact.primary_email}
                      </Typography>
                      {contact.mobile_phone && (
                        <Typography variant="body2" color="text.secondary">
                          {contact.mobile_phone}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      sx={buttonStyles}
                      onClick={() => handleSelectContact(contact)}
                    >
                      Select
                    </Button>
                  </Card>
                ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "320px",
                    opacity: 0.8,
                  }}
                >
                  <PersonSearchIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography color="text.secondary" variant="h6">
                    No matching contacts found
                  </Typography>
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mt: 1, maxWidth: 300 }}
                  >
                    You can create a new contact using the form
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Create New Contact */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              ...sectionStyles,
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h5" className="section-title">
              Create New Contact
            </Typography>
            <Grid container spacing={2}>
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
                    touchedFields.first_name &&
                    formData.first_name.trim() === ""
                  }
                  helperText={
                    touchedFields.first_name &&
                    formData.first_name.trim() === ""
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
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) =>
                    handleInputChange("last_name", e.target.value)
                  }
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
                    !!formData.primary_email &&
                    !isValidEmail(formData.primary_email)
                  }
                  helperText={
                    touchedFields.primary_email &&
                    formData.primary_email &&
                    !isValidEmail(formData.primary_email)
                      ? "Invalid email"
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
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  value={formData.mobile_phone}
                  onChange={(e) =>
                    handleInputChange("mobile_phone", e.target.value)
                  }
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="(555) 555-5555"
                  error={
                    touchedFields.mobile_phone &&
                    (!formData.mobile_phone.trim() ||
                      formData.mobile_phone.replace(/\D/g, "").length !== 10)
                  }
                  helperText={
                    touchedFields.mobile_phone &&
                    (!formData.mobile_phone.trim()
                      ? "Phone number is required"
                      : formData.mobile_phone.replace(/\D/g, "").length !== 10
                      ? "Enter a valid 10-digit phone number"
                      : "")
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

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateContact}
                disabled={loading}
                sx={buttonStyles}
                startIcon={<AddIcon />}
              >
                {loading ? "Creating..." : "Create Contact"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleBack}
          sx={{
            ...buttonStyles,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Back to Search
        </Button>
      </Box>
    </>
  );
};

export default Step2;
