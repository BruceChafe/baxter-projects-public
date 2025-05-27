import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Button,
  InputAdornment,
} from "@mui/material";
import { EventNote as EventNoteIcon } from "@mui/icons-material";

const Step3 = ({
    formData,
    salespeople,
    loadingSalespeople,
    handleInputChange,
    handleBack,
    handleSubmit,
    loading,
    inputStyles,
    buttonStyles,
    sectionStyles,
    headerStyles,
    selectedDealershipName,
  }) => {
  
  return (
    <>
      <Box sx={headerStyles}>
        <EventNoteIcon className="icon" />
        <Typography variant="h4" className="title">
          Visit Details
        </Typography>
        <Typography variant="subtitle1" className="subtitle">
          Complete the visit information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ ...sectionStyles, minHeight: "400px" }}>
            <Typography variant="h5" className="section-title">
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: "First Name", value: formData.first_name },
                { label: "Last Name", value: formData.last_name },
                { label: "Email", value: formData.primary_email },
                { label: "Phone", value: formData.mobile_phone },
              ].map((field, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <TextField
                    label={field.label}
                    value={field.value}
                    disabled
                    fullWidth
                    variant="outlined"
                    sx={inputStyles}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={sectionStyles}>
            <Typography variant="h5" className="section-title">
              Visit Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Dealership"
                  value={selectedDealershipName}
                  disabled
                  fullWidth
                  variant="outlined"
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Sales Consultant"
                  value={formData.salesConsultant || ""}
                  onChange={(e) =>
                    handleInputChange("salesConsultant", e.target.value)
                  }
                  fullWidth
                  variant="outlined"
                  sx={inputStyles}
                >
                  {loadingSalespeople ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : salespeople.length === 0 ? (
                    <MenuItem disabled>No sales consultants available</MenuItem>
                  ) : (
                    salespeople.map((salesperson) => (
                      <MenuItem
                        key={salesperson.user_id}
                        value={salesperson.user_id}
                      >
                        {salesperson.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Sales Type"
                  value={formData.salesType}
                  onChange={(e) =>
                    handleInputChange("salesType", e.target.value)
                  }
                  fullWidth
                  variant="outlined"
                  sx={inputStyles}
                >
                  {["New", "Pre-Owned", "Both", "Not Sure"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Visit Reason"
                  value={formData.visitReason}
                  onChange={(e) =>
                    handleInputChange("visitReason", e.target.value)
                  }
                  fullWidth
                  variant="outlined"
                  sx={inputStyles}
                >
                  {["Walk-In", "Appointment", "Follow-Up"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vehicle of Interest"
                  value={formData.vehicleOfInterest}
                  onChange={(e) =>
                    handleInputChange("vehicleOfInterest", e.target.value)
                  }
                  fullWidth
                  variant="outlined"
                  sx={inputStyles}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mt: 3,
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleBack}
          sx={buttonStyles}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={buttonStyles}
        >
          {loading ? "Submitting..." : "Submit Visit"}
        </Button>
      </Box>
    </>
  );
};

export default Step3;
