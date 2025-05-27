import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
  IconButton,
  alpha,
  Paper,
  DialogActions,
  CircularProgress,
  Typography,
  Stack,
  Avatar,
  Card,
  CardContent,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "../../../context/SnackbarContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../../supabase/supabaseClient";
import { BusinessCenter } from "@mui/icons-material";

interface DepartmentCreationDialogProps {
  open: boolean;
  onClose: () => void;
  refreshData: () => void;
  dealergroup_id: string;
}

const DepartmentCreationDialog: React.FC<DepartmentCreationDialogProps> = ({
  open,
  onClose,
  refreshData,
  dealergroup_id,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [departmentName, setDepartmentName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { user, accessContext } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!departmentName) {
      showSnackbar("Please provide a department name.", "warning");
      return;
    }

    setLoading(true);

    try {
      const isUniversal = user?.role === 1;

      const { error } = await supabase.from("departments").insert({
        name: departmentName,
        is_universal: !!isUniversal,
        dealergroup_id: !isUniversal ? dealergroup_id : null,
      });

      if (error) {
        throw error;
      }

      showSnackbar("Department created successfully", "success");
      handleClose();
      refreshData();
    } catch (err) {
      console.error("Error creating department:", err);
      showSnackbar("Error creating department", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetFields = () => {
    setDepartmentName("");
  };

  const handleClose = () => {
    resetFields();
    onClose();
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
      {/* Dialog Header */}
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
              <BusinessCenter sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                Create New Department
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

      <form onSubmit={handleSubmit} noValidate autoComplete="off">
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
            <CardContent sx={{ p: 4, pt: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Department Name"
                    variant="outlined"
                    margin="normal"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>

        {/* Enhanced Footer */}
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
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size="1rem" /> : null}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 5,
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
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
                  sx={{
                    color: "white",
                    position: "absolute",
                    left: "50%",
                    marginLeft: "-12px",
                  }}
                />
                <Typography sx={{ opacity: 0 }}>Creating...</Typography>
              </>
            ) : (
              "Create Department"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DepartmentCreationDialog;
