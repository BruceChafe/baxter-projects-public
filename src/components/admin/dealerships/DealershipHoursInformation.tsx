import React, { useState } from "react";
import {
  Grid,
  Typography,
  Divider,
  Box,
  Button,
  TextField,
  Alert,
  useMediaQuery,
  useTheme,
  alpha,
  Paper,
} from "@mui/material";
import { Dealership, DealershipHours } from "../../../types";
import useDealershipUpdate from "../../../hooks/useDealershipUpdate";
import { useSnackbar } from "../../../context/SnackbarContext";

interface DealershipHoursInformationProps {
  dealership: Dealership;
  onSave: (updatedDealership: Partial<Dealership>) => void;
}

const DealershipHoursInformation: React.FC<DealershipHoursInformationProps> = ({
  dealership,
  onSave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showSnackbar } = useSnackbar();

  const { updateDealership, loading, error } = useDealershipUpdate();
  const [isEditing, setIsEditing] = useState(false);

  const defaultHours: DealershipHours[] = [
    { day: "Monday", open: "", close: "" },
    { day: "Tuesday", open: "", close: "" },
    { day: "Wednesday", open: "", close: "" },
    { day: "Thursday", open: "", close: "" },
    { day: "Friday", open: "", close: "" },
    { day: "Saturday", open: "", close: "" },
    { day: "Sunday", open: "", close: "" },
  ];

  const [editedDealershipHours, setEditedDealershipHours] = useState<DealershipHours[]>(
    dealership.dealershipHours && dealership.dealershipHours.length > 0
      ? dealership.dealershipHours
      : defaultHours
  );

  const handleDealershipHoursChange = (index: number, field: "open" | "close", value: string) => {
    const updatedHours = [...editedDealershipHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setEditedDealershipHours(updatedHours);
  };

  const handleSave = async () => {
    try {
      onSave({
        dealershipHours: editedDealershipHours,
      });
      setIsEditing(false);
      showSnackbar("Hours updated successfully", "success"); // Using SnackbarContext for success message
    } catch (error) {
      showSnackbar("Failed to update hours", "error"); // Error message if saving fails
    }
  };

  return (
    <>
      <Alert severity="info" sx={{
        mb: 2, borderRadius: 2, border: '1px solid',
        borderColor: 'divider',
      }}>
        <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
          <li>Use <strong>closed</strong> for a day with no hours of operation.</li>
          <li>Ensure all fields for each day are filled out or leave them blank.</li>
          <li>Use <strong>6:30 AM</strong> or <strong>9:00 PM</strong> for the time format.</li>
        </ul>
      </Alert>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >

        <Grid container spacing={2}>
          {editedDealershipHours.map((hours, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} sm={3}>
                <Typography>{hours.day}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Open"
                  value={hours.open}
                  onChange={(e) => handleDealershipHoursChange(index, "open", e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Close"
                  value={hours.close}
                  onChange={(e) => handleDealershipHoursChange(index, "close", e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={!isEditing}
                />
              </Grid>
            </React.Fragment>
          ))}
        </Grid>

      </Paper>
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
              sx={{ mr: 2, width: isMobile ? "100%" : "auto" }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsEditing(false)}
              sx={{ width: isMobile ? "100%" : "auto" }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setIsEditing(true)}
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            Edit
          </Button>
        )}
      </Box>
    </>
  );
};

export default DealershipHoursInformation;
