import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
  alpha,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useSnackbar } from "../../../context/SnackbarContext";
import dayjs from "dayjs";
import StepOneCapture from "./StepOneCapture";
import StepTwoLicenseDetails from "./StepTwoLicenseDetails";
import useLicenseScanner from "../../../hooks/licenseScanner/useLicenseScanner";
import { useAuth } from "../../../context/AuthContext";
import { ExtractedData } from "../../../types";

interface LicenseScannerDialogProps {
  open: boolean;
  handleClose: () => void;
  contact_id: string;
  dealership_id: string;
  dealergroup_id: string;
}

const LicenseScannerDialog: React.FC<LicenseScannerDialogProps> = ({
  open,
  handleClose,
  contact_id,
  dealership_id,
  dealergroup_id,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user, accessContext } = useAuth();
  const userId = user?.id || 0;

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [rearImage, setRearImage] = useState<File | null>(null);
  const [rotation, setRotation] = useState<{ front: number; rear: number }>({
    front: 0,
    rear: 0,
  });
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    FIRST_NAME: "",
    LAST_NAME: "",
    MIDDLE_NAME: "",
    SUFFIX: "",
    DATE_OF_BIRTH: "",
    EXPIRATION_DATE: "",
    DOCUMENT_NUMBER: "",
    CLASS: "",
    RESTRICTIONS: "",
    ENDORSEMENTS: "",
    ADDRESS_LINE1: "",
    ADDRESS_LINE2: "",
    CITY: "",
    STATE: "",
    POSTAL_CODE: "",
    COUNTRY: "CAN",
    GENDER: "",
    EYE_COLOR: "",
    HEIGHT: "",
    WEIGHT: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [dobMessage, setDobMessage] = useState<string | null>(null);
  const [expMessage, setExpMessage] = useState<string | null>(null);
  const [bannedMessage, setBannedMessage] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  const checkdate_of_birth = useCallback(() => {
    const now = dayjs();
    const dob = dayjs(extractedData.DATE_OF_BIRTH);

    if (!dob.isValid()) {
      setDobMessage("Valid Date of Birth");
      return;
    }

    const age = now.diff(dob, "year");

    if (age < 16) {
      setDobMessage("Error: Person is under 16 years old.");
    } else if (age >= 16 && age < 18) {
      setDobMessage("Notice: Person is between 16 and 18 years old.");
    } else {
      setDobMessage("Pass: Person is over 18 years old.");
    }
  }, [extractedData.DATE_OF_BIRTH]);

  const checkExpirationDate = useCallback(() => {
    const now = dayjs();
    const expDate = dayjs(extractedData.EXPIRATION_DATE);

    if (!expDate.isValid()) {
      setExpMessage("Valid Expiration Date");
      return;
    }

    if (expDate.isBefore(now)) {
      setExpMessage("Error: License has expired.");
    } else {
      setExpMessage("Pass: License is valid.");
    }
  }, [extractedData.EXPIRATION_DATE]);

  const { handleAnalyzeLicense, handleSubmitLicense } = useLicenseScanner({
    frontImage,
    rearImage,
    extractedData,
    dealership_id,
    dealergroup_id,
    contact_id,
    selected_dealergroup_id: dealergroup_id,
    setExtractedData,
    checkdate_of_birth,
    checkExpirationDate,
    setBannedMessage,
    setStep,
    setIsLoading,
    showSnackbar,
    userId,
  });

  const handleBack = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const handleDialogClose = () => {
    setStep(1);
    setExtractedData({
      FIRST_NAME: "",
      LAST_NAME: "",
      MIDDLE_NAME: "",
      SUFFIX: "",
      DATE_OF_BIRTH: "",
      EXPIRATION_DATE: "",
      DOCUMENT_NUMBER: "",
      CLASS: "",
      RESTRICTIONS: "",
      ENDORSEMENTS: "",
      ADDRESS_LINE1: "",
      ADDRESS_LINE2: "",
      CITY: "",
      STATE: "",
      POSTAL_CODE: "",
      COUNTRY: "CAN",
      GENDER: "",
      EYE_COLOR: "",
      HEIGHT: "",
      WEIGHT: "",
    });
    handleClose();
  };

  // Status badge renderer
  const renderStatusBadge = (message) => {
    if (!message) return null;

    let color = "primary.main";
    let bgColor = alpha(theme.palette.primary.main, 0.1);

    if (message.includes("Error")) {
      color = "error.main";
      bgColor = alpha(theme.palette.error.main, 0.1);
    } else if (message.includes("Notice")) {
      color = "warning.main";
      bgColor = alpha(theme.palette.warning.main, 0.1);
    } else if (message.includes("Pass")) {
      color = "success.main";
      bgColor = alpha(theme.palette.success.main, 0.1);
    }

    return (
      <Typography
        variant="body2"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          fontSize: "0.75rem",
          fontWeight: 600,
          color: color,
          bgcolor: bgColor,
        }}
      >
        {message}
      </Typography>
    );
  };

  const steps = ["Capture License", "Verify Details"];

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.1),
          bgcolor: "background.paper",
          boxShadow: "0 10px 40px rgba(0,0,0,0.09)",
          overflow: "hidden",
        },
      }}
    >
      {/* Enhanced Header with gradient background */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.08
          )} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
          borderBottom: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.1),
          position: "relative",
        }}
      >
        {isLoading && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            }}
          />
        )}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={4}
          py={2.5}
        >
          <Box display="flex" alignItems="center">
            {step > 1 && (
              <IconButton
                onClick={handleBack}
                sx={{
                  mr: 1.5,
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.16),
                  },
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <DialogTitle
              sx={{
                p: 0,
                fontWeight: 700,
                fontSize: "1.5rem",
                color: "text.primary",
                letterSpacing: "-0.01em",
              }}
            >
              License Scanner
            </DialogTitle>
          </Box>
          <IconButton
            onClick={handleDialogClose}
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
      </Box>

      <DialogContent
        sx={{
          p: 0,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          backgroundImage: `radial-gradient(${alpha(
            theme.palette.primary.main,
            0.05
          )} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      >
        <Box p={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: `0 4px 20px ${alpha(
                theme.palette.common.black,
                0.05
              )}`,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Stack spacing={3}>
              {/* Conditional messages for important information */}
              {bannedMessage && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="error.main"
                    sx={{ fontWeight: 600 }}
                  >
                    {bannedMessage}
                  </Typography>
                </Box>
              )}

              {step === 1 && (
                <StepOneCapture
                  frontImage={frontImage}
                  rearImage={rearImage}
                  setFrontImage={setFrontImage}
                  setRearImage={setRearImage}
                  rotation={rotation}
                  setRotation={setRotation}
                  handleAnalyzeLicense={handleAnalyzeLicense}
                  isLoading={isLoading}
                />
              )}

              {step === 2 && (
                <>
                  {/* Status indicators */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                      mb: 2,
                    }}
                  >
                    {dobMessage && renderStatusBadge(dobMessage)}
                    {expMessage && renderStatusBadge(expMessage)}
                  </Box>

                  <StepTwoLicenseDetails
                    extractedData={extractedData}
                    setExtractedData={setExtractedData}
                    dobMessage={dobMessage}
                    expMessage={expMessage}
                    bannedMessage={bannedMessage}
                    frontRotation={rotation.front}
                    rearRotation={rotation.rear}
                    setFrontRotation={(value) =>
                      setRotation((prev) => ({ ...prev, front: value }))
                    }
                    setRearRotation={(value) =>
                      setRotation((prev) => ({ ...prev, rear: value }))
                    }
                    handleBack={handleBack}
                    handleSubmitLicense={
                      (licenseDetails: ExtractedData) =>
                        handleSubmitLicense(licenseDetails)
                    }
                    isLoading={isLoading}
                  />
                </>
              )}
            </Stack>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LicenseScannerDialog;
