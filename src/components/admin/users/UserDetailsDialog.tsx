import React, { useState, useEffect, useCallback } from "react";
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
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  alpha,
  Alert,
  Paper,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
} from "@mui/material";
import PhoneNumberMask from "../dealerships/PhoneNumberMask";
import { supabase } from "../../../../supabase/supabaseClient";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "../../../context/SnackbarContext";
import { useAuth } from "../../../context/AuthContext";
import { UserData } from "../../../types";
import { useUsers } from "../../../hooks/useUsers";
import {
  Business,
  Email,
  Info,
  Person,
  Shield,
} from "@mui/icons-material";
import { useDepartments } from "../../../hooks/useDepartmentsAndJobTitles";
import { useDealerships } from "../../../hooks/useDealerships";

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserData | null;
  onDeactivate: () => void;
  refetchData: () => void;
  fetchUserById: (userId: string) => Promise<any>;
}

interface JobTitle {
  id: string;
  title: string;
}

interface Dealership {
  id: string;
  dealership_name: string;
}

interface Role {
  id: string;
  name: string;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = React.memo(
  ({ open, onClose, user, onDeactivate, refetchData, fetchUserById }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { showSnackbar } = useSnackbar();
    const { fetchUserById: refetchUserById } = useUsers(null, null);
    const [activeTab, setActiveTab] = useState(0);
    const [updatedUser, setUpdatedUser] = useState<UserData | null>(null);
    const [job_titles, setJobTitles] = useState<JobTitle[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [isFetching, setIsFetching] = useState(false);

    const selected_dealergroup_id = user?.dealergroup_id?.toString() || "";
    const {
      dealerships,
      loading: dealershipsLoading,
      error: dealershipsError,
    } = useDealerships(selected_dealergroup_id);

    const {
      departments,
      loading: departmentsLoading,
      error: departmentsError,
      refetchDepartments,
    } = useDepartments();

    useEffect(() => {
      if (open) {
        refetchDepartments();
      }
    }, [open]);

    useEffect(() => {
      if (open) {
        setLoading(true);
      }
    }, [open]);

    useEffect(() => {
      if (user) {
        const departmentObj = departments.find(
          (dept) => dept.name === user.department
        );
        
        const jobTitleList = departmentObj?.job_titles || [];
        
        const jobTitleObj = jobTitleList.find(
          (title) => title.title === user.jobTitle
        );
        

        setUpdatedUser({
          ...user,
          role_id: user.role_id ? String(user.role_id) : "",
          department_id: departmentObj?.id,
          job_title_id: jobTitleObj?.id,
          dealerships: user.dealerships?.map((d) => String(d.id)) || [],
          primary_dealership_id:
          user.dealerships?.find((d) => d.is_primary)?.id || "",
        });

        setJobTitles(jobTitleList);
      }
    }, [user, departments]);

    useEffect(() => {
      if (!dealershipsLoading && !departmentsLoading) {
        setLoading(false);
      }
    }, [dealershipsLoading, departmentsLoading]);

    // Fetch roles from Supabase
    useEffect(() => {
      const fetchRoles = async () => {
        try {
          const { data, error } = await supabase.from("roles").select("*");

          if (error) throw error;

          setRoles(data || []);
        } catch (error) {
          showSnackbar("Failed to fetch roles.", "error");
        }
      };

      fetchRoles();
    }, [showSnackbar]);

    const handleDepartmentChange = useCallback(
      (event: SelectChangeEvent<string>) => {
        const newDepartmentId = event.target.value; // Don't parse as int, keep as string

        setUpdatedUser(
          (prev) => prev && { ...prev, department_id: newDepartmentId }
        );

        // Find the selected department
        const selectedDepartment = departments.find(
          (dept) => dept.id === newDepartmentId
        );

        setJobTitles(selectedDepartment?.job_titles || []);
      },
      [departments]
    );

    const handleJobTitleChange = useCallback(
      (event: SelectChangeEvent<string>) => {
        const newJobTitleId = event.target.value; // Keep as string
        setUpdatedUser(
          (prev) => prev && { ...prev, job_title_id: newJobTitleId }
        );
      },
      []
    );

    const updateUser = async (
      userId: number,
      updatedData: Partial<UserData>
    ) => {
      try {
        const { primary_dealership_id, dealerships, ...dataToUpdate } =
          updatedData;

        const { data, error } = await supabase
          .from("users")
          .update(dataToUpdate)
          .eq("id", userId)
          .select();

        if (error) throw error;

        return data;
      } catch (error) {
        console.error("Failed to update user:", error);
        throw new Error(
          "Failed to update user. Please check the provided data."
        );
      }
    };

    const checkUserPermissions = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error("Not authenticated");
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(
          `
          id,
          role_id,
          roles (
            name
          )
        `
        )
        .eq("id", authUser.id)
        .single();

      if (userError) {
        console.error("Error fetching user role:", userError);
        throw new Error("Failed to verify permissions");
      }

      const isAdmin =
        userData?.roles?.name === "Group Admin" ||
        userData?.roles?.name === "superadmin";

      return isAdmin;
    };

    

    const handleSave = async () => {
      if (updatedUser) {
        try {
          setIsFetching(true);

          const hasPermission = await checkUserPermissions();
          if (!hasPermission) {
            throw new Error(
              "You don't have permission to modify user dealerships"
            );
          }

          const userDataToUpdate = {
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            primary_email: updatedUser.primary_email,
            primary_phone: updatedUser.primary_phone,
            job_title_id: updatedUser.job_title_id,
            department_id: updatedUser.department_id,
          };

          await updateUser(updatedUser.id, userDataToUpdate);

          if (updatedUser.dealerships) {
            const { error: deleteError } = await supabase
              .from("user_dealerships")
              .delete()
              .eq("user_id", updatedUser.id);

            if (deleteError) {
              console.error("Delete error:", deleteError);
              throw new Error("Failed to update dealership associations");
            }

            const dealershipRecords = updatedUser.dealerships.map(
              (dealershipId) => ({
                user_id: updatedUser.id,
                dealership_id: String(dealershipId),
                role_id: updatedUser.role_id,
                is_primary:
                  String(dealershipId) ===
                  String(updatedUser.primary_dealership_id),
              })
            );

            const { error: insertError } = await supabase
              .from("user_dealerships")
              .insert(dealershipRecords);

            if (insertError) {
              console.error("Insert error:", insertError);
              throw new Error("Failed to create dealership associations");
            }
          }

          showSnackbar("User updated successfully!", "success");

          // Re-fetch and update UI
          const updatedUserData = await fetchUserById(updatedUser.id);
          setUpdatedUser(updatedUserData);

          if (typeof refetchData === "function") {
            refetchData();
          }
        } catch (error) {
          console.error("Error in handleSave:", error);
          showSnackbar(
            error instanceof Error ? error.message : "Failed to update user.",
            "error"
          );
        } finally {
          setIsFetching(false);
        }
      }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;

      setUpdatedUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          [name]: value,
        };
      });
    };

    if (loading) return <CircularProgress />;

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
            height: "90vh",
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
            {user ? `${user.first_name} ${user.last_name}` : "User Details"}
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
          onChange={(event, newValue) => setActiveTab(newValue)}
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
          <Tab icon={<Person />} label="User" iconPosition="start" />
          <Tab icon={<Email />} label="Contact" iconPosition="start" />
          <Tab icon={<Info />} label="Metadata" iconPosition="start" />
          <Tab icon={<Info />} label="Access Control" iconPosition="start" />
        </Tabs>
        <DialogContent
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
            bgcolor: "grey.50",
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {activeTab === 0 && (
            <Box>
              {/* Basic Information */}
              <Box>
                <Box>
                  <Typography
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: "1.25rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Person />
                    </Box>
                    Basic Information
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={
                          updatedUser?.first_name || user?.first_name || ""
                        } // Fallback to user
                        onChange={(e) =>
                          setUpdatedUser(
                            (prev) =>
                              prev && { ...prev, first_name: e.target.value }
                          )
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="last_name"
                        value={updatedUser?.last_name || user?.last_name || ""} // Fallback to user
                        onChange={(e) =>
                          setUpdatedUser(
                            (prev) =>
                              prev && { ...prev, last_name: e.target.value }
                          )
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* Organization Details */}
              <Box mt={4}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={3}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Business sx={{ fontSize: "1.25rem" }} />
                    Organization Details
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="department-label">
                          Department
                        </InputLabel>
                        <Select
                          labelId="department-label"
                          label="Department"
                          value={updatedUser?.department_id || ""}
                          onChange={handleDepartmentChange}
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="job-title-label">Job Title</InputLabel>
                        <Select
                          labelId="job-title-label"
                          label="Job Title"
                          value={updatedUser?.job_title_id || ""}
                          onChange={handleJobTitleChange}
                          disabled={!updatedUser?.department_id}
                        >
                          {job_titles.map((title) => (
                            <MenuItem key={title.id} value={title.id}>
                              {title.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box mt={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="primary_email"
                      value={updatedUser?.primary_email || ""}
                      onChange={(e) =>
                        setUpdatedUser(
                          (prev) =>
                            prev && { ...prev, primary_email: e.target.value }
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={updatedUser?.primary_phone || ""}
                      onChange={(e) =>
                        setUpdatedUser(
                          (prev) =>
                            prev && { ...prev, primary_phone: e.target.value }
                        )
                      }
                      InputProps={{
                        inputComponent: PhoneNumberMask as any,
                      }}
                      placeholder="(XXX) XXX-XXXX"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}

          {activeTab === 2 && (
            <Box mt={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date Created"
                      value={
                        updatedUser?.created_at
                          ? new Date(updatedUser.created_at).toLocaleString()
                          : "Unknown"
                      }
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Login"
                      value={
                        updatedUser?.last_login
                          ? new Date(updatedUser.last_login).toLocaleString()
                          : "Never logged in"
                      }
                      disabled
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}

          {activeTab === 3 && (
            <Box mt={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Box mt={1}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.125rem",
                        color: "text.primary",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Shield sx={{ fontSize: "1.25rem" }} />
                      Access Control
                    </Typography>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    }}
                  >
                    <Grid container spacing={3}>
                      {/* Select Multiple Dealerships */}
                      <Grid item xs={12} sm={6}>
                        <FormControl component="fieldset" fullWidth>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Dealerships
                          </Typography>
                          <Box>
                            {dealerships.map((d: Dealership) => {
                              // Ensure updatedUser.dealerships is an array of strings
                              const dealershipIds = (
                                updatedUser?.dealerships || []
                              ).map((id) =>
                                typeof id === "object"
                                  ? String(id.id)
                                  : String(id)
                              );
                              const isSelected = dealershipIds.includes(
                                String(d.id)
                              );
                              return (
                                <FormControlLabel
                                  key={d.id}
                                  control={
                                    <Checkbox
                                      checked={isSelected || false}
                                      onChange={(e) => {
                                        setUpdatedUser((prev) => {
                                          if (!prev) return prev;
                                          // Convert all IDs to strings for consistent handling
                                          let updatedDealerships = [
                                            ...(prev.dealerships || []),
                                          ].map((id) =>
                                            typeof id === "object"
                                              ? String(id.id)
                                              : String(id)
                                          );

                                          if (e.target.checked) {
                                            if (
                                              !updatedDealerships.includes(
                                                String(d.id)
                                              )
                                            ) {
                                              updatedDealerships.push(
                                                String(d.id)
                                              );
                                            }
                                          } else {
                                            updatedDealerships =
                                              updatedDealerships.filter(
                                                (id) => id !== String(d.id)
                                              );
                                          }

                                          // Update primary if necessary
                                          let primary = String(
                                            prev.primary_dealership_id
                                          );
                                          if (
                                            !updatedDealerships.includes(
                                              primary
                                            )
                                          ) {
                                            primary =
                                              updatedDealerships[0] || "";
                                          }

                                          return {
                                            ...prev,
                                            dealerships: updatedDealerships,
                                            primary_dealership_id: primary,
                                          };
                                        });
                                      }}
                                    />
                                  }
                                  label={d.dealership_name}
                                />
                              );
                            })}
                          </Box>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl component="fieldset" fullWidth>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Primary Dealership
                          </Typography>
                          <RadioGroup
                            value={
                              String(updatedUser?.primary_dealership_id) || ""
                            }
                            onChange={(e) =>
                              setUpdatedUser((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      primary_dealership_id: e.target.value,
                                    }
                                  : null
                              )
                            }
                          >
                            {(updatedUser?.dealerships || []).map(
                              (dealership_id) => {
                                // Convert to string for comparison
                                const dealershipIdStr = String(dealership_id);
                                const dealership = dealerships.find(
                                  (d) => String(d.id) === dealershipIdStr
                                );
                                return (
                                  <FormControlLabel
                                    key={dealershipIdStr}
                                    value={dealershipIdStr}
                                    control={<Radio />}
                                    label={
                                      dealership?.dealership_name || "Unknown"
                                    }
                                  />
                                );
                              }
                            )}
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      {/* User Role Selection */}
                      <Grid item xs={12} sm={6}>
                        <FormControl component="fieldset" fullWidth>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Role
                          </Typography>

                          <RadioGroup
                            value={String(updatedUser?.role_id) || ""}
                            onChange={(e) => {
                              const newRoleId = e.target.value; // Keep it as a string
                              setUpdatedUser((prev) =>
                                prev ? { ...prev, role_id: newRoleId } : null
                              );
                            }}
                          >
                            {roles.map((role) => (
                              <FormControlLabel
                                key={role.id}
                                value={String(role.id)}
                                control={<Radio />}
                                label={role.name}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </Paper>
            </Box>
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
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={isFetching}
            startIcon={isFetching ? <CircularProgress size={20} /> : null}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 4,
              py: 1,
              fontWeight: 600,
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export default UserDetailsDialog;
