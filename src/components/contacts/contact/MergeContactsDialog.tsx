import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
  Alert,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { Contact } from "../../../types";
import CloseIcon from "@mui/icons-material/Close";
import { Info, CheckCircle } from "@mui/icons-material";
import { useSnackbar } from "../../../context/SnackbarContext";
import { supabase } from "../../../../supabase/supabaseClient";
import { motion } from "framer-motion";

interface MergeContactsDialogProps {
  open: boolean;
  onClose: () => void;
  contacts: Contact[];
}

interface MergeSelections {
  [key: string]: number;
}

const MERGE_FIELDS: { key: keyof Contact; label: string; info?: string }[] = [
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "title", label: "Title" },
  {
    key: "primary_email",
    label: "Email",
    info: "Primary email address for communications",
  },
  {
    key: "mobile_phone",
    label: "Mobile Phone",
    info: "Primary contact number",
  },
];

const MergeContactsDialog: React.FC<MergeContactsDialogProps> = ({
  open,
  onClose,
  contacts,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [selections, setSelections] = useState<MergeSelections>(() => {
    return MERGE_FIELDS.reduce(
      (acc, field) => ({
        ...acc,
        [field.key]: 0,
      }),
      {}
    );
  });

  if (contacts.length !== 2) {
    return null;
  }

  const handleSelectionChange =
    (field: keyof Contact) => (contactIndex: number) => {
      setSelections((prev) => ({
        ...prev,
        [field]: contactIndex,
      }));
    };

  const handleSwapAll = () => {
    setSelections((prev) => {
      const newSelections: MergeSelections = {};
      Object.keys(prev).forEach((key) => {
        newSelections[key] = prev[key] === 0 ? 1 : 0;
      });
      return newSelections;
    });
  };

  const handleSelectAll = (contactIndex: number) => {
    setSelections((prev) => {
      const newSelections = { ...prev };
      MERGE_FIELDS.forEach((field) => {
        newSelections[field.key] = contactIndex;
      });
      return newSelections;
    });
  };

  const getMergedContact = (): Contact => {
    return MERGE_FIELDS.reduce(
      (merged, field) => ({
        ...merged,
        [field.key]: contacts[selections[field.key]][field.key],
      }),
      {} as Contact
    );
  };

  const handleMergeConfirm = async () => {
    setConfirmOpen(false);
    try {
      setLoading(true);
      const [primaryContact, secondaryContact] = contacts;
  
      // ✅ Get the current user session to include JWT token
      const { data: { session } } = await supabase.auth.getSession();
  
      if (!session) {
        throw new Error("User is not authenticated");
      }
  
      const response = await fetch(
        "https://vzsepgjmtooqdwilpscr.supabase.co/functions/v1/merge-contacts",
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            primaryContact,
            duplicateContact: secondaryContact,
          }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to merge contacts");
      }
  
      showSnackbar("Contacts successfully merged!", "success", 6000, {
        vertical: "bottom",
        horizontal: "center",
      });
  
      onClose();
    } catch (error) {
      console.error("Error merging contacts:", error);
      showSnackbar(
        error instanceof Error ? error.message : "Failed to merge contacts",
        "error",
        6000,
        { vertical: "bottom", horizontal: "center" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = () => {
    setConfirmOpen(true);
  };

  // Consistent elevation levels
  const baseElevation = 1;
  const selectedElevation = 3;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Typography variant="h5" fontWeight="600">
            Merge Contacts
          </Typography>
          <IconButton
            onClick={onClose}
            disabled={loading}
            aria-label="close dialog"
            sx={{
              color: "text.secondary",
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                color: theme.palette.error.main,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 3, pb: 4 }}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              "& .MuiAlert-icon": {
                alignItems: "center",
              } 
            }}
          >
            Select which information to keep from each contact. The merged contact
            will replace both original contacts.
          </Alert>

          {/* Contact Headers */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Paper
                  elevation={baseElevation}
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.dark",
                    borderRadius: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "primary.light",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                    },
                  }}
                  onClick={() => handleSelectAll(0)}
                >
                  <Typography variant="h6" fontWeight={500}>
                    {contacts[0].first_name} {contacts[0].last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click to select all
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
            <Grid item xs={4}>
              <Paper
                elevation={selectedElevation}
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  color: "success.dark",
                  borderRadius: 2,
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: "success.light",
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Merged Contact
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Final result
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Paper
                  elevation={baseElevation}
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                    color: "secondary.dark",
                    borderRadius: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "secondary.light",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.secondary.main, 0.12),
                    },
                  }}
                  onClick={() => handleSelectAll(1)}
                >
                  <Typography variant="h6" fontWeight={500}>
                    {contacts[1].first_name} {contacts[1].last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click to select all
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>

          {/* Merge Fields */}
          <Stack spacing={2.5}>
            {MERGE_FIELDS.map((field) => (
              <Paper
                key={field.key}
                elevation={baseElevation}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Grid container spacing={3} alignItems="center">
                  {/* First Contact */}
                  <Grid item xs={4}>
                    <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Paper
                        elevation={selections[field.key] === 0 ? selectedElevation : baseElevation}
                        sx={{
                          p: 2,
                          bgcolor: selections[field.key] === 0
                            ? alpha(theme.palette.primary.main, 0.08)
                            : alpha(theme.palette.grey[100], 0.5),
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          border: "1px solid",
                          borderColor: selections[field.key] === 0
                            ? "primary.light"
                            : "divider",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onClick={() => handleSelectionChange(field.key)(0)}
                      >
                        {selections[field.key] === 0 && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              color: "primary.main",
                            }}
                          >
                            <CheckCircle fontSize="small" />
                          </Box>
                        )}
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: selections[field.key] === 0 ? 600 : 400,
                            color: selections[field.key] === 0 ? "primary.dark" : "text.primary",
                          }}
                        >
                          {contacts[0][field.key]?.toString() || "-"}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>

                  {/* Selected Value (Middle) */}
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="subtitle1"
                          color="text.primary"
                          fontWeight={600}
                          gutterBottom
                        >
                          {field.label}
                        </Typography>
                        {field.info && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mx: "auto", maxWidth: "90%" }}
                          >
                            {field.info}
                          </Typography>
                        )}
                      </Box>
                      <Paper
                        elevation={selectedElevation}
                        sx={{
                          p: 2,
                          width: "100%",
                          textAlign: "center",
                          bgcolor: alpha(theme.palette.success.main, 0.08),
                          border: "1px solid",
                          borderColor: "success.light",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color="success.dark"
                        >
                          {contacts[selections[field.key]][field.key]?.toString() || "-"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  {/* Second Contact */}
                  <Grid item xs={4}>
                    <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Paper
                        elevation={selections[field.key] === 1 ? selectedElevation : baseElevation}
                        sx={{
                          p: 2,
                          bgcolor: selections[field.key] === 1
                            ? alpha(theme.palette.secondary.main, 0.08)
                            : alpha(theme.palette.grey[100], 0.5),
                          borderRadius: 2,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          border: "1px solid",
                          borderColor: selections[field.key] === 1
                            ? "secondary.light"
                            : "divider",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onClick={() => handleSelectionChange(field.key)(1)}
                      >
                        {selections[field.key] === 1 && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              color: "secondary.main",
                            }}
                          >
                            <CheckCircle fontSize="small" />
                          </Box>
                        )}
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: selections[field.key] === 1 ? 600 : 400,
                            color: selections[field.key] === 1 ? "secondary.dark" : "text.primary",
                          }}
                        >
                          {contacts[1][field.key]?.toString() || "-"}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ padding: "16px 24px", gap: 2 }}>
          <Button 
            onClick={onClose} 
            variant="outlined" 
            color="inherit"
            sx={{
              borderRadius: 2,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleMerge} 
            variant="contained" 
            color="primary"
            sx={{
              borderRadius: 2,
              px: 3,
              boxShadow: theme.shadows[2],
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            Merge Contacts
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, py: 2 }}>
          Confirm Contact Merge
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Are you sure you want to merge these contacts? This action cannot be
            undone.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The secondary contact will be archived and all its leads will
            be reassigned to the primary contact.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="inherit"
            variant="outlined"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleMergeConfirm}
              color="primary"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 3,
                boxShadow: theme.shadows[2],
                "&:hover": {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              {loading ? "Merging..." : "Confirm Merge"}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MergeContactsDialog;