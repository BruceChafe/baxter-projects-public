import React, { useState } from "react";
import {
  Grid,
  Typography,
  Divider,
  Box,
  Button,
  TextField,
  useMediaQuery,
  useTheme,
  Paper,
  alpha,
} from "@mui/material";
import PhoneNumberMask from "./PhoneNumberMask";
import { Dealership } from "../../../types";
import useDealershipUpdate from "../../../hooks/useDealershipUpdate";

interface DealershipContactInformationProps {
  dealership: Dealership;
  onSave: (updatedDealership: Partial<Dealership>) => void;
}

const DealershipContactInformation: React.FC<DealershipContactInformationProps> = ({
  dealership,
  onSave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); 
  const { updateDealership, loading, error } = useDealershipUpdate();
  const [isEditing, setIsEditing] = useState(false);

  const [editedContact, setEditedContact] = useState({
    primaryPhoneNumber: dealership.phone_number || "",
    fax_number: dealership.fax_number || "",
    primary_email: dealership.contact_email || "",
    website: dealership.website || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedContact({ ...editedContact, [name]: value });
  };

  const handleSave = async () => {
    onSave({
      phone_number: editedContact.primaryPhoneNumber,
      fax_number: editedContact.fax_number,
      contact_email: editedContact.primary_email,
      website: editedContact.website,
    })
    setIsEditing(false);
  };

  return (
              <Box mt={3}>
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
        <Grid item xs={12} sm={6}>
          <TextField
            label="Primary Phone Number"
            value={editedContact.primaryPhoneNumber}
            onChange={handleInputChange}
            name="primaryPhoneNumber"
            disabled={!isEditing}
            InputProps={{
              inputComponent: PhoneNumberMask as any,
            }}
            fullWidth
            size="small"
            variant="outlined"
            placeholder="(XXX) XXX-XXXX"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Fax Number"
            value={editedContact.fax_number}
            onChange={handleInputChange}
            name="fax_number"
            disabled={!isEditing}
            InputProps={{
              inputComponent: PhoneNumberMask as any,
            }}
            fullWidth
            size="small"
            variant="outlined"
            placeholder="(XXX) XXX-XXXX"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Primary Email"
            type="email"
            name="primary_email"
            value={editedContact.primary_email}
            onChange={handleInputChange}
            disabled={!isEditing}
            fullWidth
            size="small"
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Website"
            type="text"
            name="website"
            value={editedContact.website}
            onChange={handleInputChange}
            disabled={!isEditing}
            fullWidth
            size="small"
            variant="outlined"
          />
        </Grid>
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

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DealershipContactInformation;
