import React, { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  useMediaQuery,
  useTheme,
  DialogTitle,
  IconButton,
  DialogContent,
  CircularProgress,
  alpha,
  Stepper,
  Step,
  StepLabel,
  Paper,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  DialogActions,
  Slide,
  Stack,
  Badge,
  Fade,
  Grow,
  Card,
  CardContent,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "../../../context/SnackbarContext";
import { useAuth } from "../../../context/AuthContext";
import { onboardingStepsByRole } from "../../../constants/onboardingSteps";
import {
  ArrowBack,
  ArrowForward,
  Business,
  Check,
  Person,
  Security,
  Email,
  Lock,
  AccountCircle,
  Work,
  AdminPanelSettings,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { supabase } from "../../../../supabase/supabaseClient";
import { useDealerships } from "../../../hooks/useDealerships";
import { useDepartments } from "../../../hooks/useDepartmentsAndJobTitles";
import isGlobalAdmin from "../../../auth/isGlobalAdmin";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface JobTitle {
  id: string;
  title: string;
  department_id: string;
}

interface Department {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

interface UserCreationDialogProps {
  open: boolean;
  onClose: () => void;
  refetchData: () => void;
}

const steps = ["Basic Information", "Job Information", "Access & Security"];

const UserCreationDialog: React.FC<UserCreationDialogProps> = ({
  open,
  onClose,
  refetchData,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [first_name, setfirst_name] = useState<string>("");
  const [last_name, setlast_name] = useState<string>("");
  const [selectedDealership, setSelectedDealership] = useState<string>("");
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const { showSnackbar } = useSnackbar();
  const { user, accessContext } = useAuth();

  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [filteredJobTitles, setFilteredJobTitles] = useState<JobTitle[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const selected_dealergroup_id =
    user?.user_metadata?.dealergroup_id?.toString() || "";

  const {
    dealerships,
    loading: dealershipsLoading,
    error: dealershipsError,
  } = useDealerships(selected_dealergroup_id || "");

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
    const fetchJobTitles = async () => {
      try {
        const { data, error } = await supabase.from("job_titles").select("*");
        if (error) throw error;
        setJobTitles(data || []);
      } catch (err) {
        console.error("Error fetching job titles:", err);
      }
    };
    fetchJobTitles();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase.from("roles").select("*");
        if (error) throw error;
        setRoles(data || []);
      } catch (err) {
        console.error("Error fetching Roles:", err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
      setfirst_name("");
      setlast_name("");
      setSelectedDealership("");
      setSelectedDepartment("");
      setSelectedJobTitle("");
      setSelectedRole("");
      setActiveStep(0);
    }
  }, [open]);

  useEffect(() => {
    if (!dealershipsLoading && !departmentsLoading) {
      setLoading(false);
    }
  }, [dealershipsLoading, departmentsLoading]);

  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    const department_id = event.target.value;
    setSelectedDepartment(department_id);
    const filtered = jobTitles.filter(
      (jobTitle) => jobTitle.department_id === department_id
    );
    setFilteredJobTitles(filtered);
    setSelectedJobTitle("");
  };

  const seedOnboardingSteps = async (
    userId: string,
    roleName: string = "salesConsultant"
  ) => {
    const steps = onboardingStepsByRole[roleName] ?? [];

    const rows = steps.map((step) => ({
      user_id: userId,
      step_key: step.step_key,
      status: "pending",
    }));

    const { error } = await supabase.from("user_onboarding").insert(rows);
    if (error) {
      console.error("Error seeding onboarding steps:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !email ||
      !password ||
      !first_name ||
      !last_name ||
      !selectedDealership.length ||
      !selectedDepartment ||
      !selectedJobTitle ||
      !selectedRole
    ) {
      showSnackbar("Please fill out all required fields.", "warning");
      return;
    }

    const dealergroup_id =
      user.user_metadata?.dealergroup_id ||
      user.raw_user_meta_data?.dealergroup_id;
    if (!dealergroup_id) {
      showSnackbar("Dealer Group ID is missing", "warning");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Session not found. Please log in again.");
      }

      const { data: existingUser, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("primary_email", email)
        .maybeSingle();
      if (existingUser) {
        showSnackbar("User already exists with this email.", "error");
        setLoading(false);
        return;
      }

      const requestPayload = {
        email,
        password,
        first_name,
        last_name,
        dealergroup_id,
        department_id: selectedDepartment,
        job_title_id: selectedJobTitle,
        role_id: selectedRole,
        dealership_id: selectedDealership,
      };


      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestPayload),
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/createUser`,
        requestOptions
      );

      const result = await response.json();

      if (result?.user_id) {
        const createdRole = roles.find((r) => r.id === selectedRole);
        await seedOnboardingSteps(
          result.user_id,
          createdRole?.name?.toLowerCase() ?? "salesConsultant"
        );
      }

      if (!response.ok) {
        showSnackbar(result?.error || "User creation failed.", "error");
        throw new Error(result?.error);
      }

      showSnackbar("User created successfully", "success");
      handleClose();
      refetchData();
    } catch (err) {
      console.error("Error creating user:", err);
      showSnackbar("Error creating user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setfirst_name("");
    setlast_name("");
    setSelectedDealership("");
    setSelectedDepartment("");
    setSelectedJobTitle("");
    setSelectedRole("");
    setActiveStep(0);
    onClose();
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return email && password && first_name && last_name;
      case 1:
        return (
          selectedDealership.length > 0 &&
          selectedDepartment &&
          selectedJobTitle
        );
      case 2:
        return !!selectedRole;
      default:
        return false;
    }
  };

  const StepIcons = [Person, Business, Security];

  const CustomStepIcon = ({ icon: Icon, active, completed, index }: any) => (
    <Avatar
      sx={{
        width: 48,
        height: 48,
        bgcolor: completed
          ? theme.palette.success.main
          : active
          ? theme.palette.primary.main
          : alpha(theme.palette.grey[400], 0.5),
        color: completed || active ? "white" : theme.palette.text.secondary,
        fontSize: 20,
        fontWeight: 700,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: active ? "scale(1.1)" : "scale(1)",
        boxShadow: active
          ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`
          : completed
          ? `0 4px 20px ${alpha(theme.palette.success.main, 0.3)}`
          : "none",
      }}
    >
      {completed ? <Check /> : <Icon />}
    </Avatar>
  );

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in timeout={600}>
            <Box>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AccountCircle /> Personal Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter the user's basic information and login credentials
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    value={first_name}
                    onChange={(e) => setfirst_name(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <Person
                          sx={{
                            color: theme.palette.text.secondary,
                            mr: 1,
                            fontSize: 20,
                          }}
                        />
                      ),
                      sx: {
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                        },
                        "&.Mui-focused": {
                          bgcolor: alpha(theme.palette.background.default, 1),
                          transform: "translateY(-1px)",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    value={last_name}
                    onChange={(e) => setlast_name(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <Person
                          sx={{
                            color: theme.palette.text.secondary,
                            mr: 1,
                            fontSize: 20,
                          }}
                        />
                      ),
                      sx: {
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                        },
                        "&.Mui-focused": {
                          bgcolor: alpha(theme.palette.background.default, 1),
                          transform: "translateY(-1px)",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <Email
                          sx={{
                            color: theme.palette.text.secondary,
                            mr: 1,
                            fontSize: 20,
                          }}
                        />
                      ),
                      sx: {
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                        },
                        "&.Mui-focused": {
                          bgcolor: alpha(theme.palette.background.default, 1),
                          transform: "translateY(-1px)",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                    helperText="Password must be at least 8 characters"
                    InputProps={{
                      startAdornment: (
                        <Lock
                          sx={{
                            color: theme.palette.text.secondary,
                            mr: 1,
                            fontSize: 20,
                          }}
                        />
                      ),
                      endAdornment: (
                        <IconButton
                          edge="end"
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ mr: 1 }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                      sx: {
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                        },
                        "&.Mui-focused": {
                          bgcolor: alpha(theme.palette.background.default, 1),
                          transform: "translateY(-1px)",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={600}>
            <Box>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Work /> Work Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select the user's workplace and job details
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="dealership-label">Dealership</InputLabel>
                    <Select
                      labelId="dealership-label"
                      label="Dealership"
                      value={selectedDealership}
                      onChange={(e) => setSelectedDealership(e.target.value)}
                      required
                      startAdornment={
                        <Business
                          sx={{
                            color: theme.palette.text.secondary,
                            mr: 1,
                            fontSize: 20,
                          }}
                        />
                      }
                      sx={{
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                        },
                        "&.Mui-focused": {
                          bgcolor: alpha(theme.palette.background.default, 1),
                          transform: "translateY(-1px)",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      }}
                    >
                      {dealerships.length > 0 ? (
                        dealerships.map((dealership) => (
                          <MenuItem key={dealership.id} value={dealership.id}>
                            <Stack direction="row" alignItems="center" gap={1}>
                              {dealership.dealership_name}
                            </Stack>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No dealerships available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                      labelId="department-label"
                      label="Department"
                      value={selectedDepartment}
                      onChange={handleDepartmentChange}
                      required
                      sx={{
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                        },
                        "&.Mui-focused": {
                          bgcolor: alpha(theme.palette.background.default, 1),
                          transform: "translateY(-1px)",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      }}
                    >
                      {departments.length > 0 ? (
                        departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No departments available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="job-title-label">Job Title</InputLabel>
                    <Select
                      labelId="job-title-label"
                      label="Job Title"
                      value={selectedJobTitle}
                      onChange={(e) => setSelectedJobTitle(e.target.value)}
                      required
                      disabled={!selectedDepartment}
                      sx={{
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                        },
                        "&.Mui-focused": {
                          bgcolor: alpha(theme.palette.background.default, 1),
                          transform: "translateY(-1px)",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      }}
                    >
                      {filteredJobTitles.map((jobTitle) => (
                        <MenuItem key={jobTitle.id} value={jobTitle.id}>
                            {jobTitle.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={600}>
            <Box>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AdminPanelSettings /> Access Control
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Define the user's permissions and system access level
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="role-label">User Role</InputLabel>
                    <Select
                      labelId="role-label"
                      label="User Role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      required
                      sx={{
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.background.default, 0.8),
                        },
                        "&.Mui-focused": {
                          bgcolor: alpha(theme.palette.background.default, 1),
                          transform: "translateY(-1px)",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.15
                          )}`,
                        },
                      }}
                    >
                      {roles
                        .filter(
                          (role) =>
                            role.name !== "Global Admin" || isGlobalAdmin
                        )
                        .map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            <Stack direction="row" alignItems="center" gap={2}>
                              <Security color="primary" />
                              <Box>
                                <Typography variant="body1" fontWeight={600}>
                                  {role.name}
                                </Typography>
                              </Box>
                            </Stack>
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      borderRadius: 3,
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Security
                          sx={{
                            color: theme.palette.info.main,
                            mt: 0.25,
                            fontSize: 20,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight={600} gutterBottom>
                            Role Permissions
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            The selected role determines what actions and areas of
                            the system this user will have access to. Choose
                            carefully based on their responsibilities.
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
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
      {/* Enhanced Header */}
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
              <Person sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            Create New User
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

      {/* Enhanced Stepper */}
      <Box sx={{ px: 4, pt: 4, pb: 2 }}>
        <Stepper
          activeStep={activeStep}
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
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={(props) => (
                  <CustomStepIcon
                    icon={StepIcons[index]}
                    active={props.active}
                    completed={props.completed}
                    index={index}
                  />
                )}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Enhanced Content */}
      <DialogContent sx={{ px: 4, pb: 2 }}>
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
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
                <Box>{getStepContent()}</Box>
            </CardContent>
          </Card>
        </form>
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
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {activeStep > 0 ? (
          <Button
            onClick={handleBack}
            startIcon={<ArrowBack />}
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

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleClose}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderColor: alpha(theme.palette.divider, 0.3),
              "&:hover": {
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.04),
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Cancel
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              variant="contained"
              disabled={loading || !isStepComplete(activeStep)}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
              endIcon={!loading ? <Check /> : null}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 5,
                py: 1.5,
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: `0 4px 16px ${alpha(
                  theme.palette.success.main,
                  0.3
                )}`,
                "&:hover": {
                  boxShadow: `0 6px 20px ${alpha(
                    theme.palette.success.main,
                    0.4
                  )}`,
                  transform: "translateY(-2px)",
                },
                "&:disabled": {
                  color: theme.palette.action.disabled,
                  boxShadow: "none",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={!isStepComplete(activeStep)}
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
              Next Step
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default UserCreationDialog;