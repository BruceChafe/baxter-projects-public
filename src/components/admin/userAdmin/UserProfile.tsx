import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Container,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
  Avatar,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  Chip,
  Skeleton,
  Fade,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext";
import { useSnackbar } from "../../../context/SnackbarContext";
import { supabase } from "../../../../supabase/supabaseClient";

const UserProfile: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, accessContext } = useAuth(); // Supabase auth user
  const { showSnackbar } = useSnackbar();

  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalData, setOriginalData] = useState<any>(null);
  const [userData, setUserData] = useState<any>({
    first_name: "",
    last_name: "",
    primary_email: "",
    primary_phone: "",
    job_title: "",
    dealergroup_id: "",
    dealergroup_name: "",
    created_at: "",
    last_login: ""
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    }
  }, [user]);

  const fetchUserProfile = async (userId: string) => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        first_name,
        last_name,
        primary_email,
        primary_phone,
        job_title_id,
        job_titles ( title ),
        dealergroup_id,
        created_at,
        last_login
      `
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      showSnackbar("Failed to load user profile", "error");
    } else {
      const processedData = {
        ...data,
        job_title: data.job_titles?.title || "",
      };
      
      setUserData(processedData);
      setOriginalData(processedData);
    }
    
    setIsLoading(false);
  };

  const handleToggleEdit = () => {
    if (isEditable) {
      saveUserData();
    }
    setIsEditable((prev) => !prev);
  };

  const handleCancel = () => {
    setUserData(originalData);
    setIsEditable(false);
  };

  const handleChange = (field: string, value: string) => {
    setUserData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveUserData = async () => {
    const { error } = await supabase
      .from("users")
      .update({
        first_name: userData.first_name,
        last_name: userData.last_name,
        primary_email: userData.primary_email,
        primary_phone: userData.primary_phone,
        job_title_id: userData.job_title_id, // ✅ use the actual ID
      })
      .eq("id", user?.id);

    if (error) {
      console.error("Failed to update user:", error);
      showSnackbar("Failed to update user data", "error");
    } else {
      showSnackbar("Profile updated successfully", "success");
      setOriginalData(userData);
    }
  };

  const getInitials = () => {
    if (!userData.first_name && !userData.last_name) return '?';
    return `${userData.first_name?.charAt(0) || ''}${userData.last_name?.charAt(0) || ''}`;
  };

  const renderSkeleton = () => (
    <Box>
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    </Box>
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {isLoading ? (
        renderSkeleton()
      ) : (
        <Fade in={!isLoading}>
          <Box>
            {/* Header Card */}
            <Card 
              elevation={0}
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                overflow: 'visible'
              }}
            >
              <CardContent sx={{ position: 'relative', p: 0 }}>
                <Box 
                  sx={{ 
                    height: 80, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }} 
                />
                
                <Box sx={{ px: 3, pb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-end' }}>
                    <Avatar 
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        bgcolor: theme.palette.primary.main,
                        fontSize: '2rem',
                        fontWeight: 700,
                        mt: -6,
                        border: `4px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 4px 10px ${alpha(theme.palette.common.black, 0.1)}`
                      }}
                    >
                      {getInitials()}
                    </Avatar>
                    
                    <Box sx={{ 
                      ml: isMobile ? 0 : 2, 
                      mt: isMobile ? 2 : 0,
                      flex: 1,
                      textAlign: isMobile ? 'center' : 'left'
                    }}>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                        {userData.first_name} {userData.last_name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {userData.job_title || 'No title specified'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1,
                      mt: isMobile ? 2 : 0
                    }}>
                      {isEditable ? (
                        <>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleToggleEdit}
                            sx={{
                              bgcolor: theme.palette.success.main,
                              '&:hover': {
                                bgcolor: theme.palette.success.dark,
                              }
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                            color="error"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={handleToggleEdit}
                          sx={{
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          }}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Profile Content */}
            <Grid container spacing={3}>
              {/* Left Column - Personal Info */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 3, 
                    height: '100%',
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Personal Information
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="First Name"
                          value={userData.first_name}
                          onChange={(e) => handleChange("first_name", e.target.value)}
                          fullWidth
                          disabled={!isEditable}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Name"
                          value={userData.last_name}
                          onChange={(e) => handleChange("last_name", e.target.value)}
                          fullWidth
                          disabled={!isEditable}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Email"
                          value={userData.primary_email}
                          onChange={(e) => handleChange("primary_email", e.target.value)}
                          fullWidth
                          disabled={!isEditable}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Phone Number"
                          value={userData.primary_phone}
                          onChange={(e) => handleChange("primary_phone", e.target.value)}
                          fullWidth
                          disabled={!isEditable}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Right Column - Company & Account Info */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={3} direction="column">
                  <Grid item>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <BusinessIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6" fontWeight={600}>
                            Company Information
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <TextField
                              label="Dealer Group ID"
                              value={userData.dealergroup_id || "N/A"}
                              fullWidth
                              disabled
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <BusinessIcon fontSize="small" color="action" />
                                  </InputAdornment>
                                ),
                                endAdornment: userData.dealergroup_id && (
                                  <InputAdornment position="end">
                                    <Chip 
                                      size="small" 
                                      label="Active" 
                                      color="success" 
                                      variant="outlined" 
                                    />
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Job Title"
                              value={userData.job_title}
                              onChange={(e) => handleChange("job_title", e.target.value)}
                              fullWidth
                              disabled={!isEditable}
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <WorkIcon fontSize="small" color="action" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CalendarIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6" fontWeight={600}>
                            Account Details
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <TextField
                              label="Date Created"
                              value={formatDate(userData.created_at)}
                              fullWidth
                              disabled
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarIcon fontSize="small" color="action" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Last Login"
                              value={formatDate(userData.last_login)}
                              fullWidth
                              disabled
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <TimeIcon fontSize="small" color="action" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default UserProfile;