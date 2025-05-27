import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Work, Phone, LockClock } from "@mui/icons-material";
import DealershipInformation from "./DealershipInformation";
import DealershipContactInformation from "./DealershipContactInformation";
import DealershipHoursInformation from "./DealershipHoursInformation";
import { Dealership } from "../../../types";
import { supabase } from "../../../../supabase/supabaseClient";
import { useSnackbar } from "../../../context/SnackbarContext";

interface DealershipDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  dealership: Dealership | null;
  onDeactivate: () => void;
  setDealerships: React.Dispatch<React.SetStateAction<Dealership[]>>;
}

const DealershipDetailsDialog: React.FC<DealershipDetailsDialogProps> = ({
  open,
  onClose,
  dealership,
  onDeactivate,
  setDealerships,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState(0);
  const [updatedDealership, setUpdatedDealership] =
    useState<Dealership | null>(dealership);

  // Reset updatedDealership when dealership prop changes
  useEffect(() => {
    if (dealership) {
      setUpdatedDealership(dealership);
    }
  }, [dealership]);

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setUpdatedDealership(null);
      setActiveTab(0);
    }
  }, [open]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Replace the old update hook with direct Supabase call
  const handleSave = async (updatedData: Partial<Dealership>) => {
    if (updatedDealership && updatedDealership.id) {
      try {
        // Clean the update payload: remove undefined, empty strings, and id
        const cleanedData = Object.fromEntries(
          Object.entries(updatedData).filter(
            ([key, value]) =>
              value !== undefined &&
              value !== "" &&
              key !== "id"
          )
        );
  
        if (!updatedDealership.dealergroup_id) {
          showSnackbar("Dealer Group ID is required.", "error");
          return;
        }

        const user = supabase.auth.getUser();

user.then(({ data }) => console.log("Authenticated user:", data.user));

  
        const { data, error } = await supabase
          .from("dealerships")
          .update(cleanedData)
          .eq("id", updatedDealership.id)
          .select("*")
          .maybeSingle();
  
        if (error) {
          console.error("Supabase update error:", error);
          showSnackbar("Failed to update dealership!", "error");
          return;
        }
  
        if (data) {
          setUpdatedDealership(data);
          setDealerships((prev) =>
            prev.map((d) => (d.id === data.id ? data : d))
          );
          showSnackbar("Dealership updated successfully!", "success");
        } else {
          showSnackbar("No data returned from update.", "warning");
        }
      } catch (error: any) {
        console.error("Update error:", error);
        showSnackbar("Unexpected error updating dealership.", "error");
      }
    } else {
      showSnackbar("Invalid dealership selected.", "error");
      console.error("No dealership or dealership ID available for update.");
    }
  }; 

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullScreen={isMobile}
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          overflow: "hidden",
          maxWidth: "800px",
          height: "90vh", // Fixed height
          margin: "auto",
          display: "flex",
          flexDirection: "column",
        },
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
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <DialogTitle
          sx={{
            p: 0,
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "text.primary",
            letterSpacing: "-0.01em",
          }}
        >
          Dealership Details
        </DialogTitle>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "text.primary",
              bgcolor: alpha(theme.palette.text.primary, 0.04),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered={!isMobile}
        variant={isMobile ? "scrollable" : "fullWidth"}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: theme.palette.background.paper,
          "& .MuiTab-root": {
            minHeight: 48,
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 600,
          },
        }}
      >
        <Tab icon={<Work />} label="Dealership Information" iconPosition="start" />
        <Tab icon={<Phone />} label="Contact Information" iconPosition="start" />
        <Tab icon={<LockClock />} label="Business Hours" iconPosition="start" />
      </Tabs>

      <DialogContent
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          bgcolor: "grey.50",
        }}
      >
        {activeTab === 0 && updatedDealership && (
          <DealershipInformation
            dealership={updatedDealership}
            onSave={handleSave}
          />
        )}
        {activeTab === 1 && updatedDealership && (
          <DealershipContactInformation
            dealership={updatedDealership}
            onSave={handleSave}
          />
        )}
        {activeTab === 2 && updatedDealership && (
          <DealershipHoursInformation
            dealership={updatedDealership}
            onSave={handleSave}
          />
        )}
      </DialogContent>

      {/* Enhanced Footer */}
      <DialogActions
        sx={{
          px: 4,
          py: 3,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 2,
          bgcolor: "background.default",
        }}
      >
        <Button
          variant="outlined"
          color="error"
          onClick={onDeactivate}
          startIcon={<CloseIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          Deactivate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DealershipDetailsDialog;
