import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Snackbar,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  alpha,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Stack,
  styled,
  CardContent,
} from "@mui/material";
import {
  Person as PersonIcon,
  Event as EventIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  ContactPage as ContactPageIcon,
  DocumentScanner as DocumentScannerIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
  Storefront,
  HomeOutlined,
  BadgeOutlined,
  CakeOutlined,
  EmailOutlined,
  PersonOutline,
} from "@mui/icons-material";
import { ReportProblem as ReportProblemIcon } from "@mui/icons-material";
import { VisitData } from "./VisitHistoryDashboard";
import { useAuth } from "../../../context/AuthContext";
import axiosInstance from "../../../axios";
import { useSnackbar } from "../../../context/SnackbarContext";
import { useNavigate } from "react-router-dom";
import useFetchSalesConsultants from "../../../hooks/useFetchSalesConsultants";
import LicenseScannerDialog from "../licenseScanner/LicenseScannerDialog";
import DriverLicenseImage from "./DriversLicenseImage";
import { supabase } from "../../../../supabase/supabaseClient";
import useDealergroupFeatures from "../../../hooks/admin/useDealerGroupFeatures";
import useProjectAccess from "../../../hooks/admin/checkProjectAccess";

interface VisitDetailsDialogProps {
  open: boolean;
  handleClose: () => void;
  visit: VisitData | null;
}

interface EditableVisitInfo {
  created_at: string;
  deaalership_id: string;
  visit_reason: string;
  sales_consultant: string;
  vehicle_id: string;
  sales_type: string;
  notes: string;
}

const VisitDetailsDialog: React.FC<VisitDetailsDialogProps> = ({
  open,
  handleClose,
  visit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedVisitInfo, setEditedVisitInfo] = useState<EditableVisitInfo>({
    created_at: "",
    visit_reason: "",
    sales_consultant: "",
    vehicle_id: "",
    sales_type: "",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [consultants, loadingConsultants, consultantsError, noConsultants] =
    useFetchSalesConsultants(visit?.dealership_id ?? 0);

  const [bannedStatus, setBannedStatus] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const { user, accessContext } = useAuth();
  const [isLicenseScannerOpen, setIsLicenseScannerOpen] = useState(false);

  const [latestLicenseScan, setLatestLicenseScan] = useState<any>(null);

  const dealergroup_id =
    visit?.dealergroup_id ?? user?.user_metadata?.dealergroup_id;
  const { features, loading: featuresLoading } =
    useDealergroupFeatures(dealergroup_id);

  const { projectAccess, loading: loadingAccess } = useProjectAccess(
    visit?.dealership_id,
    dealergroup_id
  );

  const FEATURE_SLUG = "upshift";

  const hasLicenseScanner =
    accessContext?.trialing ||
    accessContext?.active ||
    projectAccess[FEATURE_SLUG] === "basic";

  const handleContactClick = () => {
    if (visit?.contact.contact_id) {
      navigate(`/contacts/${visit.contact.contact_id}`);
      handleClose();
    } else {
      showSnackbar("Contact ID not available", "error");
    }
  };

  const checkBannedStatus = useCallback(async () => {
    if (
      !visit ||
      !visit.contact?.id ||
      (!visit.dealergroup_id && !user?.user_metadata?.dealergroup_id)
    ) {
      setBannedStatus(false);
      return;
    }

    const dealergroup_id =
      visit.dealergroup_id ?? user?.user_metadata?.dealergroup_id;

    try {
      const { data, error } = await supabase
        .from("banned_visitors")
        .select("is_active")
        .eq("contact_id", visit.contact.id)
        .eq("dealergroup_id", dealergroup_id)
        .single();

      if (error && error.code !== "PGRST116") {
        // Ignore "no rows found" error
        throw error;
      }

      setBannedStatus(data?.is_active ?? false);
    } catch (error) {
      console.error("Error checking banned status:", error);
      setBannedStatus(false);
    }
  }, [visit, user]);

  useEffect(() => {
    checkBannedStatus();
  }, [visit, refresh, checkBannedStatus]);

  const handleBanContact = useCallback(async () => {
    if (!visit || !user) {
      setSnackbarMessage("Missing required data.");
      return;
    }

    const dealership_id = visit.dealership_id;

    if (!dealership_id) {
      setSnackbarMessage("Error: Dealership ID is missing.");
      return;
    }

    const payload = {
      contact_id: visit.contact.id,
      banned_by: user.id,
      dealergroup_id: user.user_metadata?.dealergroup_id,
      dealership_id: dealership_id,
      ban_reason: "Reason for banning",
      ban_notes: "Optional notes about the ban",
      banned_at: new Date().toISOString(),
    };

    setLoadingAction(true);

    try {
      const { error } = await supabase.from("banned_visitors").insert(payload);

      if (error) {
        throw error;
      }

      setBannedStatus(true);
      setSnackbarMessage("Contact banned successfully.");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error banning contact:", error);
      setSnackbarMessage("Failed to ban contact.");
    } finally {
      setLoadingAction(false);
    }
  }, [visit, user]);

  const handleUnbanContact = useCallback(async () => {
    if (!visit || !user) {
      setSnackbarMessage("Missing required data.");
      return;
    }

    const dealergroup_id =
      visit.dealergroup_id ?? user.user_metadata?.dealergroup_id;

    if (!dealergroup_id) {
      setSnackbarMessage("Error: Missing dealer group ID.");
      return;
    }

    setLoadingAction(true);

    try {
      const { data: bannedRecords, error: fetchError } = await supabase
        .from("banned_visitors")
        .select("id")
        .eq("contact_id", visit.contact.id)
        .eq("dealergroup_id", dealergroup_id);

      if (fetchError) {
        throw fetchError;
      }

      if (bannedRecords && bannedRecords.length > 0) {
        // Use the ID to delete the specific record
        const recordToDelete = bannedRecords[0];

        const { error: deleteError } = await supabase
          .from("banned_visitors")
          .delete()
          .eq("id", recordToDelete.id); // Delete by primary key

        if (deleteError) {
          throw deleteError;
        }
      } else {
        setSnackbarMessage(
          "Contact is not banned or does not exist in records."
        );
        setLoadingAction(false);
        return;
      }

      // 🚀 NEW FIX: Ensures we delete exactly as in SQL
      const { error: deleteError } = await supabase
        .from("banned_visitors")
        .delete()
        .match({
          contact_id: visit.contact.id,
          dealergroup_id: dealergroup_id, // Ensure this is correctly matched
        });

      if (deleteError) {
        throw deleteError;
      }

      // 🚀 Delay the banned status check slightly to allow Supabase to sync
      setTimeout(() => {
        checkBannedStatus();
      }, 500);

      setBannedStatus(false);
      setSnackbarMessage("Contact unbanned successfully.");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("❌ Error unbanning contact:", error);
      setSnackbarMessage("Failed to unban contact.");
    } finally {
      setLoadingAction(false);
    }
  }, [visit, user, checkBannedStatus]);

  const formatToLocalDateTime = (date: string): string => {
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (visit) {
      // Find the consultant ID based on the name in visit.sales_consultant
      const consultantId = consultants.find(
        (consultant) =>
          `${consultant.first_name} ${consultant.last_name}` ===
          visit.sales_consultant
      )?.id;

      setEditedVisitInfo({
        created_at: formatToLocalDateTime(visit.created_at),
        visit_reason: visit.visit_reason,
        sales_consultant: consultantId ? String(consultantId) : "", // Convert ID to string
        vehicle_id: visit.vehicle_id,
        sales_type: visit.sales_type,
        notes: visit.notes,
      });
    }
  }, [visit, consultants]);

  useEffect(() => {
    const fetchLatestScan = async () => {
      if (!visit?.contact?.id) return;

      const contactId = String(visit.contact.id).trim(); // ensure no whitespace

      // DEBUG: See what contact_ids exist in the table
      const { data: allRows, error: allError } = await supabase
        .from("scanned_licenses")
        .select("contact_id");

      if (allError) {
        console.error("🚨 Error fetching all contact_ids:", allError);
      }

      // Now query with trimmed ID
      const { data, error } = await supabase
        .from("scanned_licenses")
        .select("*")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching scanned license:", error);
      } else {
        setLatestLicenseScan(data?.[0] || null);
      }
    };

    fetchLatestScan();
  }, [visit?.contact?.id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (visit) {
      setEditedVisitInfo({
        created_at: formatToLocalDateTime(visit.created_at),
        visit_reason: visit.visit_reason,
        sales_consultant: visit.sales_consultant,
        vehicle_id: visit.vehicle_id,
        sales_type: visit.sales_type,
        notes: visit.notes,
      });
    }
  };

  const handleSave = async () => {
    if (!visit) return;

    setIsSaving(true);
    try {
      const response = await axiosInstance.put(
        `/visits/${visit.id}`,
        editedVisitInfo
      );

      if (response.status === 200) {
        showSnackbar("Visit information updated successfully", "success");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating visit information:", error);
      showSnackbar("Failed to update visit information", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange =
    (field: keyof EditableVisitInfo) =>
    (
      event:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | { value: unknown }
          >
        | SelectChangeEvent<string>
    ) => {
      setEditedVisitInfo((prev) => ({
        ...prev,
        [field]: event.target.value as string,
      }));
    };

  if (!visit) return null;

  const renderSalesConsultantField = () => {
    return (
      <Box sx={{ display: "flex", gap: 2, alignItems: "baseline" }}>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.875rem",
            fontWeight: 600,
            minWidth: "120px",
          }}
        >
          Sales Consultant:
        </Typography>
        {isEditing ? (
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth size="small">
              <Select
                value={editedVisitInfo.sales_consultant}
                onChange={handleInputChange("sales_consultant")}
                disabled={loadingConsultants || noConsultants}
              >
                {loadingConsultants ? (
                  <MenuItem value="" disabled>
                    Loading consultants...
                  </MenuItem>
                ) : (
                  consultants.map((consultant) => (
                    <MenuItem key={consultant.id} value={String(consultant.id)}>
                      {`${consultant.first_name} ${consultant.last_name}`}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "text.primary",
              fontWeight: 500,
              flex: 1,
            }}
          >
            {(() => {
              const selectedConsultant = consultants.find(
                (c) => String(c.id) === editedVisitInfo.sales_consultant
              );
              return selectedConsultant
                ? `${selectedConsultant.first_name} ${selectedConsultant.last_name}`
                : visit.sales_consultant || "N/A";
            })()}
          </Typography>
        )}
      </Box>
    );
  };

  const renderVisitInformation = () => {
    return (
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: 1,
            borderColor: alpha(theme.palette.primary.main, 0.3),
          },
        }}
      >
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "baseline" }}>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  minWidth: "120px",
                }}
              >
                Date of Visit:
              </Typography>
              {isEditing ? (
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    value={editedVisitInfo.created_at}
                    onChange={handleInputChange("created_at")}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "text.primary",
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {new Date(editedVisitInfo.created_at).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "baseline" }}>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  minWidth: "120px",
                }}
              >
                Visit Reason:
              </Typography>
              {isEditing ? (
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    value={editedVisitInfo.visit_reason}
                    onChange={handleInputChange("visit_reason")}
                    size="small"
                  />
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "text.primary",
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {editedVisitInfo.visit_reason || "N/A"}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "baseline" }}>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  minWidth: "120px",
                }}
              >
                Sales Type:
              </Typography>
              {isEditing ? (
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={editedVisitInfo.sales_type}
                      onChange={handleInputChange("sales_type")}
                    >
                      <MenuItem value="New">New</MenuItem>
                      <MenuItem value="Used">Used</MenuItem>
                      <MenuItem value="Service">Service</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "text.primary",
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {editedVisitInfo.sales_type || "N/A"}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            {renderSalesConsultantField()}
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "baseline" }}>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  minWidth: "120px",
                }}
              >
                Vehicle of Interest:
              </Typography>
              {isEditing ? (
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    value={editedVisitInfo.vehicle_id}
                    onChange={handleInputChange("vehicle_id")}
                    size="small"
                  />
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "text.primary",
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {editedVisitInfo.vehicle_id || "N/A"}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "baseline" }}>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  minWidth: "120px",
                }}
              >
                Notes:
              </Typography>
              {isEditing ? (
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editedVisitInfo.notes}
                    onChange={handleInputChange("notes")}
                    size="small"
                  />
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "text.primary",
                    fontWeight: 500,
                    flex: 1,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {editedVisitInfo.notes || "N/A"}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      handleClose={handleClose}
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
          margin: "auto",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          pl: 3,
          bgcolor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.dark, 0.2)
              : alpha(theme.palette.primary.light, 0.1),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Storefront color="primary" sx={{ fontSize: 24 }} />
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            Visit Details
          </Typography>
        </Stack>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
          sx={{
            borderRadius: 1.5,
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          maxHeight: "calc(100vh - 200px)", // or tweak based on your dialog size
          overflowY: "auto",
        }}
      >
        <CardContent>
          {/* Contact Information Section */}
          <Box sx={{ p: 1, mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:before": {
                  content: '""',
                  width: 4,
                  height: 24,
                  bgcolor: "primary.main",
                  borderRadius: 1,
                  display: "block",
                },
              }}
            >
              <PersonIcon sx={{ fontSize: "1.25rem" }} />
              Contact Information
            </Typography>

            <Grid container spacing={3}>
              {hasLicenseScanner && (
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: "100%",
                      minHeight: "240px",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 2,
                      border: "2px dashed",
                      borderColor: "secondary.main",
                      bgcolor: alpha(theme.palette.secondary.main, 0.02),
                      textAlign: "center",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.secondary.main, 0.05),
                        cursor: "pointer",
                        boxShadow: 1,
                      },
                    }}
                    onClick={() => setIsLicenseScannerOpen(true)}
                  >
                    <Box>
                      <DocumentScannerIcon
                        sx={{ fontSize: 48, color: "secondary.main", mb: 1 }}
                      />
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="secondary.main"
                      >
                        Scan License
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {latestLicenseScan
                          ? "You can rescan this visitor's ID"
                          : "No license record found"}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}
              <Grid item xs={12} md={hasLicenseScanner ? 8 : 12}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: 1,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                  }}
                >
                  <Grid container spacing={2.5}>
                    {[
                      {
                        label: "Name",
                        value: `${visit?.contact?.first_name || ""} ${
                          visit?.contact?.last_name || ""
                        }`,
                        icon: (
                          <PersonOutline
                            fontSize="small"
                            sx={{ color: "primary.main", opacity: 0.7 }}
                          />
                        ),
                      },
                      {
                        label: "Email",
                        value: visit?.contact?.primary_email || "N/A",
                        icon: (
                          <EmailOutlined
                            fontSize="small"
                            sx={{ color: "primary.main", opacity: 0.7 }}
                          />
                        ),
                      },
                      {
                        label: "Date of Birth",
                        value: latestLicenseScan?.date_of_birth
                          ? new Date(
                              latestLicenseScan.date_of_birth
                            ).toLocaleDateString()
                          : visit.contact.date_of_birth
                          ? new Date(
                              visit.contact.date_of_birth
                            ).toLocaleDateString()
                          : "N/A",
                        icon: (
                          <CakeOutlined
                            fontSize="small"
                            sx={{ color: "primary.main", opacity: 0.7 }}
                          />
                        ),
                      },
                      {
                        label: "License Number",
                        value:
                          latestLicenseScan?.license_number ||
                          visit.contact.licenseNumber ||
                          "N/A",
                        icon: (
                          <BadgeOutlined
                            fontSize="small"
                            sx={{ color: "primary.main", opacity: 0.7 }}
                          />
                        ),
                      },
                      {
                        label: "Address",
                        value: latestLicenseScan
                          ? [
                              latestLicenseScan.address,
                              latestLicenseScan.city,
                              latestLicenseScan.province,
                              latestLicenseScan.postal_code,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : [
                              visit.contact.address,
                              visit.contact.city,
                              visit.contact.province,
                              visit.contact.postal_code,
                            ]
                              .filter(Boolean)
                              .join(", ") || "N/A",
                        icon: (
                          <HomeOutlined
                            fontSize="small"
                            sx={{ color: "primary.main", opacity: 0.7 }}
                          />
                        ),
                      },
                    ].map((item, index) => (
                      <Grid item xs={12} key={index}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor:
                              index % 2 === 0
                                ? "transparent"
                                : alpha(theme.palette.background.default, 0.5),
                          }}
                        >
                          {item.icon}
                          <Typography
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              minWidth: "120px",
                              ml: 1.5,
                            }}
                          >
                            {item.label}:
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              color:
                                item.value && item.value !== "N/A"
                                  ? "text.primary"
                                  : "text.disabled",
                              fontWeight:
                                item.value && item.value !== "N/A" ? 500 : 400,
                            }}
                          >
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Visit Information Section */}
          <Box mt={4}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 4,
                    height: 24,
                    bgcolor: "primary.main",
                    borderRadius: 1,
                  }}
                />
                <EventIcon
                  sx={{ fontSize: "1.25rem", color: "primary.main" }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.125rem",
                    color: "text.primary",
                  }}
                >
                  Visit Information
                </Typography>
              </Box>

              {!isEditing ? (
                <IconButton
                  onClick={handleEdit}
                  size="small"
                  sx={{
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    onClick={handleCancelEdit}
                    size="small"
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.error.main, 0.04),
                        color: "error.main",
                      },
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={handleSave}
                    size="small"
                    disabled={isSaving}
                    sx={{
                      color: "success.main",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.success.main, 0.04),
                      },
                    }}
                  >
                    {isSaving ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              )}
            </Box>

            {renderVisitInformation()}
          </Box>
        </CardContent>
      </Box>

      {/* Enhanced Footer */}
      <DialogActions
        sx={{
          px: 4,
          py: 3,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 2,
          bgcolor: "background.default",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={handleContactClick}
            variant="outlined"
            startIcon={<ContactPageIcon />}
            size="large"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              color: "primary.main",
              borderColor: "primary.main",
              px: 3,
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
            disabled
          >
            View Contact
          </Button>
          {hasLicenseScanner && (
            <Button
              onClick={() => setIsLicenseScannerOpen(true)}
              variant="outlined"
              startIcon={<DocumentScannerIcon />}
              size="large"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                color: "secondary.main",
                borderColor: "secondary.main",
                px: 3,
                "&:hover": {
                  borderColor: "secondary.dark",
                  bgcolor: alpha(theme.palette.secondary.main, 0.04),
                },
              }}
            >
              Scan License
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={bannedStatus ? <LockOpenIcon /> : <BlockIcon />}
            size="large"
            disabled={loadingAction}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              color: bannedStatus ? "warning.main" : "error.main",
              borderColor: bannedStatus ? "warning.main" : "error.main",
              "&:hover": {
                borderColor: bannedStatus ? "warning.dark" : "error.dark",
                bgcolor: bannedStatus
                  ? alpha(theme.palette.warning.main, 0.04)
                  : alpha(theme.palette.error.main, 0.04),
              },
            }}
            onClick={bannedStatus ? handleUnbanContact : handleBanContact}
          >
            {loadingAction ? (
              <CircularProgress size={24} color="inherit" />
            ) : bannedStatus ? (
              "Unban Contact"
            ) : (
              "Ban Contact"
            )}
          </Button>
        </Box>
      </DialogActions>

      <LicenseScannerDialog
        open={isLicenseScannerOpen}
        handleClose={() => setIsLicenseScannerOpen(false)}
        contact_id={visit.contact.id}
        dealership_id={visit.dealership_id}
        dealergroup_id={
          visit.dealergroup_id ?? user.user_metadata?.dealergroup_id
        }
      />

      <Snackbar
        open={Boolean(snackbarMessage)}
        message={snackbarMessage}
        autoHideDuration={4000}
        handleClose={() => setSnackbarMessage(null)}
        sx={{
          "& .MuiSnackbarContent-root": {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          },
        }}
      />
    </Dialog>
  );
};

export default VisitDetailsDialog;
