import React, { useState } from "react";
import {
  Dialog,
  Box,
  TextField,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  CircularProgress,
  Slide,
  alpha,
  Stack,
  Divider,
  Stepper,
  Step,
  StepLabel,
  styled,
  Avatar,
  DialogContent,
  Card,
  CardContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import { TransitionProps } from "@mui/material/transitions";
import { useSnackbar } from "../../../context/SnackbarContext";
import { useAuth } from "../../../context/AuthContext";
import { Dealership } from "../../../types";
import { supabase } from "../../../../supabase/supabaseClient";
import { ArrowForward, Storefront } from "@mui/icons-material";

// Custom transition for dialog
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Custom styled components
const ContentContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: theme.spacing(1.5),
    fontSize: "1rem",
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow",
    ]),
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.9rem",
    fontWeight: 500,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: `${theme.spacing(1.25)} ${theme.spacing(3)}`,
  textTransform: "none",
  fontWeight: 600,
  letterSpacing: "0.01em",
  transition: theme.transitions.create(
    ["background-color", "box-shadow", "transform"],
    {
      duration: 200,
    }
  ),
}));

interface DealershipCreationDialogProps {
  open: boolean;
  onClose: () => void;
  setDealerships: React.Dispatch<React.SetStateAction<Dealership[]>>;
}

const DealershipCreationDialog: React.FC<DealershipCreationDialogProps> = ({
  open,
  onClose,
  setDealerships,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [dealership_name, setDealershipName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const { showSnackbar } = useSnackbar();
  const { user, accessContext } = useAuth();

  const handleSubmit = async () => {
    if (!dealership_name.trim()) {
      showSnackbar("Please provide a dealership name", "warning");
      return;
    }

    // Extract and validate dealer group id from user metadata
    const dealergroup_id =
      user.user_metadata?.dealergroup_id ||
      user.raw_user_meta_data?.dealergroup_id;
    if (!dealergroup_id) {
      showSnackbar("Dealer Group ID is missing", "warning");
      return;
    }

    setLoading(true);

    try {
      // Get current session info
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Session not found. Please log in again.");
      }

      // Prepare the payload with the required fields
      const requestPayload = {
        name: dealership_name,
        dealergroup_id,
      };


      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestPayload),
      };

      // Call the Supabase Edge Function to create the dealership
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/createDealership`,
        requestOptions
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create dealership");
      }

      // Update state with the newly created dealership
      setDealerships((prev) => [...prev, result.dealership]);
      showSnackbar("Dealership created successfully!", "success");

      // Show confirmation step instead of closing immediately
      setStep(1);
    } catch (error: any) {
      console.error("Error:", error);
      showSnackbar(error.message, "error");
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state for next time
    setDealershipName("");
    setStep(0);
    setLoading(false);
    onClose();
  };

  const handleEdit = () => {
    setStep(0);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullScreen={isMobile}
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 4,
          boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
          overflow: "hidden",
          maxWidth: "900px",
          margin: "auto",
          background: `linear-gradient(145deg, ${alpha(
            theme.palette.background.paper,
            0.98
          )} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
          backdropFilter: "blur(20px)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.95),
          color: theme.palette.primary.contrastText,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 80%, ${alpha(
              theme.palette.common.white,
              0.1
            )} 0%, transparent 50%)`,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 3, py: 2.5, position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.15),
                width: 48,
                height: 48,
              }}
            >
              <Storefront sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                Create New Dealership
              </Typography>
            </Box>
          </Stack>
          <IconButton
            edge="end"
            onClick={handleClose}
            aria-label="close"
            sx={{
              borderRadius: 2,
              color: "inherit",
              "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.15) },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Stepper */}
      <Box sx={{ px: 4, pt: 4, pb: 2 }}>
        <Stepper
          activeStep={step}
          alternativeLabel
          sx={{
            "& .MuiStepConnector-line": {
              borderTopWidth: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${alpha(
                theme.palette.primary.main,
                0.2
              )} 0%, ${alpha(theme.palette.primary.main, 0.6)} 100%)`,
            },
            "& .MuiStepLabel-label": {
              mt: 2,
              fontWeight: 600,
              fontSize: "0.875rem",
            },
          }}
        >
          <Step>
            <StepLabel>Enter Details</StepLabel>
          </Step>
          <Step>
            <StepLabel>Confirmation</StepLabel>
          </Step>
        </Stepper>
      </Box>

      {/* Content Area - Step 0: Input Form */}
      {step === 0 && (
        <DialogContent sx={{ px: 4, pb: 2 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              background: `linear-gradient(145deg, ${alpha(
                theme.palette.background.paper,
                0.8
              )} 0%, ${alpha(theme.palette.background.default, 0.4)} 100%)`,
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <CardContent sx={{ p: 4, pt: 5 }}>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, mt: 1 }}
              >
                Enter a unique name for your new dealership. This will be used
                to identify the dealership within your dealer group.
              </Typography>

              <TextField
                label="Dealership Name"
                value={dealership_name}
                onChange={(e) => setDealershipName(e.target.value)}
                required
                fullWidth
                autoFocus
                placeholder="e.g., Baxter Motors"
                variant="outlined"
                disabled={loading}
                helperText={
                  dealership_name.trim() === "" ? "Name is required" : " "
                }
                error={dealership_name.trim() === ""}
                sx={{ mb: 2 }}
              />

              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1 }}
                >
                  The dealership will be created in your current dealer group.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </DialogContent>
      )}

      {/* Content Area - Step 1: Confirmation */}
      {step === 1 && (
        <ContentContainer sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 3,
            }}
          >
            <Box
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                borderRadius: "50%",
                p: 2,
                mb: 3,
              }}
            >
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
            </Box>

            <Typography variant="h5" gutterBottom fontWeight={600}>
              Dealership Created Successfully
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              "{dealership_name}" has been added to your dealer group
            </Typography>

            <Box
              sx={{
                my: 2,
                p: 3,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                width: "100%",
                maxWidth: 400,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" fontWeight={500}>
                  Dealership Name:
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {dealership_name}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </ContentContainer>
      )}

      {/* Footer with Actions */}
      <Divider sx={{ opacity: 0.1 }} />
      <DialogActions
        sx={{
          px: 4,
          py: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.8
          )} 0%, ${alpha(theme.palette.background.default, 0.6)} 100%)`,
          backdropFilter: "blur(10px)",
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {step > 0 ? (
          <Button
            // onClick={handleBack}
            // startIcon={<ArrowBack />}
            variant="outlined"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderColor: alpha(theme.palette.divider, 0.3),
              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                transform: "translateX(-2px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Back
          </Button>
        ) : (
          <Box />
        )}

        {step === 0 ? (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleClose}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 5,
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: `0 4px 16px ${alpha(
                  theme.palette.primary.main,
                  0.3
                )}`,
                "&:hover": {
                  boxShadow: `0 6px 20px ${alpha(
                    theme.palette.primary.main,
                    0.4
                  )}`,
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  background: alpha(theme.palette.action.disabled, 0.12),
                  color: theme.palette.action.disabled,
                  boxShadow: "none",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || dealership_name.trim() === ""}
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 5,
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: `0 4px 16px ${alpha(
                  theme.palette.primary.main,
                  0.3
                )}`,
                "&:hover": {
                  boxShadow: `0 6px 20px ${alpha(
                    theme.palette.primary.main,
                    0.4
                  )}`,
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  background: alpha(theme.palette.action.disabled, 0.12),
                  color: theme.palette.action.disabled,
                  boxShadow: "none",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={24}
                    thickness={4}
                    sx={{
                      color: "white",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                  <Typography sx={{ opacity: 0 }}>Creating...</Typography>
                </>
              ) : (
                "Create Dealership"
              )}
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2}>
            <ActionButton
              variant="contained"
              onClick={handleClose}
              color="primary"
              disableElevation
            >
              Done
            </ActionButton>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DealershipCreationDialog;
