import React, { useState } from "react";
import {
  Paper,
  Grid,
  TextField,
  Alert,
  Typography,
  Button,
  Box,
  IconButton,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Chip,
  Fade,
  Divider,
} from "@mui/material";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import dayjs from "dayjs";
import { ExtractedData } from "../../../types";
import { ArrowBack } from "@mui/icons-material";

interface StepTwoLicenseDetailsProps {
  capturedImage: string | null;
  extractedData: ExtractedData;
  setExtractedData: React.Dispatch<React.SetStateAction<ExtractedData>>;
  dobMessage: string | null;
  expMessage: string | null;
  bannedMessage: string | null;
  frontRotation: number;
  rearRotation: number;
  setFrontRotation: (val: number) => void;
  setRearRotation: (val: number) => void;
  handleBack: () => void;
  handleSubmitLicense: (licenseDetails: {
    extractedData: ExtractedData;
  }) => Promise<void>;
  isLoading: boolean;
}

const formatDate = (date: string) => {
  return dayjs(date).isValid() ? dayjs(date).format("MM/DD/YYYY") : date;
};

const StepTwoLicenseDetails: React.FC<StepTwoLicenseDetailsProps> = ({
  capturedImage,
  extractedData,
  setExtractedData,
  dobMessage,
  expMessage,
  bannedMessage,
  frontRotation,
  rearRotation,
  setFrontRotation,
  setRearRotation,
  handleBack,
  handleSubmitLicense,
  isLoading,
}) => {
  const theme = useTheme();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeImageTab, setActiveImageTab] = useState<number>(0);

  const handleRotateFront = () => {
    const newAngle = (frontRotation + 90) % 360;
    setFrontRotation(newAngle);
  };

  const handleRotateRear = () => {
    const newAngle = (rearRotation + 90) % 360;
    setRearRotation(newAngle);
  };

  const handleFieldChange =
    (field: keyof ExtractedData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setExtractedData((prevData) => ({
        ...prevData,
        [field]: event.target.value,
      }));
    };

  const validateFields = () => {
    const fieldErrors: { [key: string]: string } = {};
    
    // Required fields validation
    if (!extractedData.FIRST_NAME) fieldErrors.FIRST_NAME = "First name is required";
    if (!extractedData.LAST_NAME) fieldErrors.LAST_NAME = "Last name is required";
    if (!extractedData.DATE_OF_BIRTH) fieldErrors.DATE_OF_BIRTH = "Date of birth is required";
    if (!extractedData.DOCUMENT_NUMBER) fieldErrors.DOCUMENT_NUMBER = "Document number is required";
    
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const onSubmit = () => {
    if (!validateFields()) return;
    handleSubmitLicense(extractedData);
    };

  const getStatusIcon = (message: string | null) => {
    if (!message) return null;
    
    if (message.includes("Error")) {
      return <ErrorOutlineIcon fontSize="small" sx={{ color: "error.main" }} />;
    } else if (message.includes("Notice") || message.includes("Warning")) {
      return <WarningAmberIcon fontSize="small" sx={{ color: "warning.main" }} />;
    } else if (message.includes("Pass")) {
      return <CheckCircleIcon fontSize="small" sx={{ color: "success.main" }} />;
    }
    
    return <InfoIcon fontSize="small" sx={{ color: "info.main" }} />;
  };

  const getStatusColor = (message: string | null) => {
    if (!message) return "default";
    
    if (message.includes("Error")) {
      return "error";
    } else if (message.includes("Notice") || message.includes("Warning")) {
      return "warning";
    } else if (message.includes("Pass")) {
      return "success";
    }
    
    return "info";
  };

  const SectionTitle = ({
    icon,
    title,
  }: {
    icon: React.ReactNode;
    title: string;
  }) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 3, mt: 4 }}>
      <Box 
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1.5,
          position: "relative",
          "&:after": {
            content: '""',
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -8,
            height: 2,
            width: 40,
            bgcolor: "primary.main",
            borderRadius: 1,
          }
        }}
      >
        {icon &&
          React.cloneElement(icon as React.ReactElement, {
            sx: { color: "primary.main", fontSize: "1.25rem" },
          })}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Status Summary */}
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          gap: 2, 
          flexWrap: "wrap",
          mb: 4 
        }}
      >
        {dobMessage && (
          <Chip
            icon={getStatusIcon(dobMessage)}
            label={dobMessage}
            color={getStatusColor(dobMessage) as any}
            variant="outlined"
            sx={{ 
              borderWidth: 1,
              px: 1,
              "& .MuiChip-label": { fontWeight: 500 }
            }}
          />
        )}
        {expMessage && (
          <Chip
            icon={getStatusIcon(expMessage)}
            label={expMessage}
            color={getStatusColor(expMessage) as any}
            variant="outlined"
            sx={{ 
              borderWidth: 1,
              px: 1,
              "& .MuiChip-label": { fontWeight: 500 }
            }}
          />
        )}
        {bannedMessage && (
          <Chip
            icon={getStatusIcon(bannedMessage)}
            label={bannedMessage}
            color={getStatusColor(bannedMessage) as any}
            variant="outlined"
            sx={{ 
              borderWidth: 1,
              px: 1,
              "& .MuiChip-label": { fontWeight: 500 }
            }}
          />
        )}
      </Box>

      {/* License Images */}
      {capturedImage && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            mb: 4,
          }}
        >
          <Tabs
            value={activeImageTab}
            onChange={(_, newValue) => setActiveImageTab(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                minHeight: 48,
              },
            }}
          >
            <Tab 
              icon={<BadgeIcon sx={{ fontSize: "1rem", mr: 1 }} />} 
              iconPosition="start"
              label="Front License" 
            />
            <Tab 
              icon={<BadgeIcon sx={{ fontSize: "1rem", mr: 1 }} />} 
              iconPosition="start"
              label="Rear License" 
            />
          </Tabs>
          
          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Fade in={activeImageTab === 0} unmountOnExit>
              <Box sx={{ display: activeImageTab === 0 ? "block" : "none" }}>
                <Box sx={{ position: "relative", maxWidth: "100%", margin: "0 auto" }}>
                  <img
                    src={capturedImage}
                    alt="Front License"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      transform: `rotate(${frontRotation}deg)`,
                      transition: "transform 0.3s ease",
                      boxShadow: theme.shadows[4],
                    }}
                  />
                  <Tooltip title="Rotate image">
                    <IconButton
                      onClick={handleRotateFront}
                      size="small"
                      sx={{ 
                        position: "absolute", 
                        top: 8, 
                        right: 8,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        boxShadow: theme.shadows[2],
                        "&:hover": { bgcolor: theme.palette.background.paper },
                      }}
                    >
                      <RotateRightIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Fade>
            
            <Fade in={activeImageTab === 1} unmountOnExit>
              <Box sx={{ display: activeImageTab === 1 ? "block" : "none" }}>
                <Box sx={{ position: "relative", maxWidth: "100%", margin: "0 auto" }}>
                  <img
                    src={extractedData.imageUrl?.rear || ""}
                    alt="Rear License"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      transform: `rotate(${rearRotation}deg)`,
                      transition: "transform 0.3s ease",
                      boxShadow: theme.shadows[4],
                    }}
                  />
                  <Tooltip title="Rotate image">
                    <IconButton
                      onClick={handleRotateRear}
                      size="small"
                      sx={{ 
                        position: "absolute", 
                        top: 8, 
                        right: 8,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        boxShadow: theme.shadows[2],
                        "&:hover": { bgcolor: theme.palette.background.paper },
                      }}
                    >
                      <RotateRightIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Fade>
          </Box>
        </Paper>
      )}

      {/* Personal Information */}
      <SectionTitle icon={<PersonIcon />} title="Personal Information" />
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            height: "100%",
            bgcolor: "primary.main",
            opacity: 0.6,
          }
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              value={extractedData.FIRST_NAME || ""}
              onChange={handleFieldChange("FIRST_NAME")}
              error={!!errors.FIRST_NAME}
              helperText={errors.FIRST_NAME}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  }
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Middle Name"
              variant="outlined"
              fullWidth
              value={extractedData.MIDDLE_NAME || ""}
              onChange={handleFieldChange("MIDDLE_NAME")}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  }
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              value={extractedData.LAST_NAME || ""}
              onChange={handleFieldChange("LAST_NAME")}
              error={!!errors.LAST_NAME}
              helperText={errors.LAST_NAME}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  }
                },
              }}
            />
          </Grid>

          {/* Document Information with Alerts */}
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <TextField
                label="Date of Birth"
                variant="outlined"
                fullWidth
                value={formatDate(extractedData.DATE_OF_BIRTH || "")}
                onChange={handleFieldChange("DATE_OF_BIRTH")}
                error={!!errors.DATE_OF_BIRTH}
                helperText={errors.DATE_OF_BIRTH || (dobMessage ? " " : "")}
                required
                InputProps={{
                  startAdornment: (
                    <CalendarTodayIcon 
                      sx={{ 
                        color: "text.secondary", 
                        mr: 1, 
                        fontSize: "1.2rem" 
                      }} 
                    />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.background.paper, 1),
                    },
                    "&.Mui-focused": {
                      backgroundColor: alpha(theme.palette.background.paper, 1),
                    }
                  },
                  mb: dobMessage ? 0 : 1,
                }}
              />
              {dobMessage && (
                <Alert
                  severity={
                    dobMessage.includes("Error") 
                      ? "error" 
                      : dobMessage.includes("Notice") 
                        ? "warning" 
                        : "success"
                  }
                  variant="outlined"
                  icon={getStatusIcon(dobMessage)}
                  sx={{ 
                    mt: 1, 
                    borderRadius: 1,
                    fontSize: "0.8rem",
                    py: 0.5
                  }}
                >
                  {dobMessage}
                </Alert>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <TextField
                label="Expiration Date"
                variant="outlined"
                fullWidth
                value={formatDate(extractedData.EXPIRATION_DATE || "")}
                onChange={handleFieldChange("EXPIRATION_DATE")}
                InputProps={{
                  startAdornment: (
                    <CalendarTodayIcon 
                      sx={{ 
                        color: "text.secondary", 
                        mr: 1, 
                        fontSize: "1.2rem" 
                      }} 
                    />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.background.paper, 1),
                    },
                    "&.Mui-focused": {
                      backgroundColor: alpha(theme.palette.background.paper, 1),
                    }
                  },
                  mb: expMessage ? 0 : 1,
                }}
              />
              {expMessage && (
                <Alert
                  severity={expMessage.includes("Error") ? "error" : "success"}
                  variant="outlined"
                  icon={getStatusIcon(expMessage)}
                  sx={{ 
                    mt: 1, 
                    borderRadius: 1,
                    fontSize: "0.8rem",
                    py: 0.5
                  }}
                >
                  {expMessage}
                </Alert>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <TextField
                label="Document Number"
                variant="outlined"
                fullWidth
                value={extractedData.DOCUMENT_NUMBER || ""}
                onChange={handleFieldChange("DOCUMENT_NUMBER")}
                error={!!errors.DOCUMENT_NUMBER}
                helperText={errors.DOCUMENT_NUMBER}
                required
                InputProps={{
                  startAdornment: (
                    <BadgeIcon 
                      sx={{ 
                        color: "text.secondary", 
                        mr: 1, 
                        fontSize: "1.2rem" 
                      }} 
                    />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.background.paper, 1),
                    },
                    "&.Mui-focused": {
                      backgroundColor: alpha(theme.palette.background.paper, 1),
                    }
                  },
                  mb: bannedMessage ? 0 : 1,
                }}
              />
              {bannedMessage && (
                <Alert
                  severity={bannedMessage.includes("Warning") ? "error" : "success"}
                  variant="outlined"
                  icon={getStatusIcon(bannedMessage)}
                  sx={{ 
                    mt: 1, 
                    borderRadius: 1,
                    fontSize: "0.8rem",
                    py: 0.5
                  }}
                >
                  {bannedMessage}
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Address Information */}
      <SectionTitle icon={<HomeIcon />} title="Address Information" />
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          position: "relative",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            height: "100%",
            bgcolor: "primary.main",
            opacity: 0.6,
          }
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              value={extractedData.ADDRESS || ""}
              onChange={handleFieldChange("ADDRESS")}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  }
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="City"
              variant="outlined"
              fullWidth
              value={extractedData.CITY_IN_ADDRESS || ""}
              onChange={handleFieldChange("CITY_IN_ADDRESS")}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  }
                },
              }}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <TextField
              label="Province"
              variant="outlined"
              fullWidth
              value={extractedData.STATE_IN_ADDRESS || ""}
              onChange={handleFieldChange("STATE_IN_ADDRESS")}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  }
                },
              }}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <TextField
              label="Postal Code"
              variant="outlined"
              fullWidth
              value={extractedData.ZIP_CODE_IN_ADDRESS || ""}
              onChange={handleFieldChange("ZIP_CODE_IN_ADDRESS")}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  }
                },
              }}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <TextField
              label="Country"
              variant="outlined"
              fullWidth
              value={extractedData.COUNTRY || "CAN"}
              onChange={handleFieldChange("COUNTRY")}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  },
                  "&.Mui-focused": {
                    backgroundColor: alpha(theme.palette.background.paper, 1),
                  }
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<ArrowBack />}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            borderWidth: 1.5,
            "&:hover": {
              borderWidth: 1.5,
            },
            fontSize: "0.95rem",
            fontWeight: 600,
            order: { xs: 2, sm: 1 },
          }}
        >
          Back to Capture
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isLoading}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 600,
            boxShadow: !isLoading ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` : "none",
            background: !isLoading 
              ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
              : undefined,
            "&:hover": {
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
            order: { xs: 1, sm: 2 },
          }}
        >
          {isLoading ? "Submitting..." : "Submit License"}
        </Button>
      </Box>
    </>
  );
};

export default StepTwoLicenseDetails;