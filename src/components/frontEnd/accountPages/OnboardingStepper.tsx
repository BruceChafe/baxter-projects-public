import React, { useEffect, useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  Container,
  CircularProgress,
  createTheme,
  ThemeProvider,
  Avatar,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { supabase } from "../../../../supabase/supabaseClient";
import { useSnackbar } from "../../../context/SnackbarContext";
import { useNavigate } from "react-router-dom";
import Step2CreateDealerGroup from "./Step2CreateDealerGroup";
import Step3CreateDealership from "./Step3CreateDealership";
import { Business } from "@mui/icons-material";

// // Custom theme with the new color palette
// const theme = createTheme({
//   palette: {
//     mode: "light",
//     primary: {
//       main: "#4A3D6A",
//       light: "#6B5C8F", // Lighter variant of primary
//       dark: "#362D4F", // Darker variant of primary
//     },
//     secondary: {
//       main: "#00BFA5", // Teal
//     },
//     error: {
//       main: "#FF4081", // Vivid pink for errors/alerts
//     },
//     background: {
//       default: "#f7f5fc",
//       paper: "#ffffff",
//     },
//   },
//   typography: {
//     fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
//     h5: {
//       fontWeight: 600,
//       color: "#4A3D6A",
//     },
//   },
//   components: {
//     MuiPaper: {
//       styleOverrides: {
//         root: {
//           boxShadow: "0 8px 24px rgba(74, 61, 106, 0.1)",
//         },
//       },
//     },
//     MuiStepIcon: {
//       styleOverrides: {
//         root: {
//           "&.Mui-active": {
//             color: "#00BFA5",
//           },
//           "&.Mui-completed": {
//             color: "#00BFA5",
//           },
//         },
//       },
//     },
//   },
// });

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  border: "1px solid rgba(74, 61, 106, 0.1)",
}));

type OnboardingStep = "dealerGroup" | "dealership";

const OnboardingStepper: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<OnboardingStep>("dealerGroup");
  const [dealerGroup, setDealerGroup] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const theme = useTheme();
  
  useEffect(() => {
    const fetchAndDelay = async () => {
      const delay = new Promise((resolve) => {
        const timer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(timer);
              resolve(true);
              return 100;
            }
            return prev + 5;
          });
        }, 200);
      });

      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          showSnackbar(
            "You must be signed in to complete onboarding.",
            "error"
          );
          navigate("/signin");
          return;
        }

        const u = data.user;
        await delay; // ← Wait for progress to finish
        setUser({
          id: u.id,
          email: u.email,
          first_name: u.user_metadata?.first_name ?? "",
          last_name: u.user_metadata?.last_name ?? "",
        });
      } catch (err) {
        console.error("Onboarding fetchUser error:", err);
        showSnackbar("Error loading onboarding. Try again.", "error");
      } finally {
        setLoading(false); // ← Ends loading after both fetch and progress
      }
    };

    fetchAndDelay();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Container
          maxWidth="sm"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              minWidth: 300,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                margin: "0 auto 24px",
                background: "linear-gradient(135deg, #4A3D6A, #6B5C8F)",
              }}
            >
              <Business sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Preparing your onboarding
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Setting up your account experience...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                borderRadius: 2,
                height: 8,
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #4A3D6A, #00BFA5)",
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              mt={1}
              display="block"
            >
              {progress}%
            </Typography>
          </Paper>
        </Container>
      </ThemeProvider>
    );
  }

  if (!user) return null;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          maxWidth: 700,
          mx: "auto",
          py: 6,
          px: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Finish Setting Up Your Account
          </Typography>
          <Stepper
            activeStep={step === "dealerGroup" ? 0 : 1}
            alternativeLabel
            sx={{
              mb: 4,
              mt: 3,
              "& .MuiStepConnector-line": {
                borderColor: "rgba(74, 61, 106, 0.2)",
              },
            }}
          >
            <Step completed={step === "dealership"}>
              <StepLabel>Dealer Group</StepLabel>
            </Step>
            <Step>
              <StepLabel>First Dealership</StepLabel>
            </Step>
          </Stepper>
          <Box sx={{ mt: 4 }}>
            {step === "dealerGroup" && (
              <Step2CreateDealerGroup
                user={user}
                onDealerGroupCreated={(dg) => {
                  setDealerGroup(dg);
                  setStep("dealership");
                }}
              />
            )}

            {step === "dealership" && dealerGroup && (
              <Step3CreateDealership
                user={user}
                dealerGroup={dealerGroup}
                onDealershipsCreated={() => navigate("/home")}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default OnboardingStepper;
