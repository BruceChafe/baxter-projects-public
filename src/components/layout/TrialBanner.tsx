import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  Slide,
  Chip,
  alpha,
  Tooltip,
  IconButton,
  LinearProgress,
  Card,
  Divider,
  Paper
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloseIcon from "@mui/icons-material/Close";
import DiamondIcon from "@mui/icons-material/Diamond";
import PaymentIcon from "@mui/icons-material/Payment";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../../supabase/supabaseClient";

interface TrialBannerProps {
  sidebarOpen: boolean;
  onClose?: () => void;
  variant?: "compact" | "expanded";
}

const TrialBanner: React.FC<TrialBannerProps> = ({ 
  sidebarOpen, 
  onClose,
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [trialEnd, setTrialEnd] = useState<string | null>(null);
  const [trialStart, setTrialStart] = useState<string | null>(null);
  const [dealergroup, setDealergroup] = useState<any>(null);
  const [temporarilyHidden, setTemporarilyHidden] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const dealergroupId = user?.user_metadata?.dealergroup_id?.trim();
        if (!dealergroupId) return;

        const { data, error } = await supabase
          .from("dealergroups")
          .select("id, name, trial_end, trial_start, subscription_status")
          .eq("id", dealergroupId)
          .single();

        if (error) throw error;

        if (data) {
          setDealergroup(data);
          if (data.subscription_status === "trialing") {
            setShowBanner(true);
            setTrialEnd(data.trial_end);
            setTrialStart(data.trial_start || null);
          }
        }
      } catch (err) {
        console.error("Error fetching trial status:", err);
      }
    };

    const lastDismissed = localStorage.getItem("trialBannerDismissed");
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed);
      const now = Date.now();
      if (now - dismissedTime < 24 * 60 * 60 * 1000) {
        setTemporarilyHidden(true);
      } else {
        localStorage.removeItem("trialBannerDismissed");
      }
    }

    if (user) {
      fetchTrialStatus();
    }
  }, [user]);

  const handleUpgrade = () => {
    navigate("/admin/upgrade");
  };

  const handleDismiss = () => {
    setTemporarilyHidden(true);
    localStorage.setItem("trialBannerDismissed", Date.now().toString());
    if (onClose) onClose();
  };

  const calculateRemainingDays = () => {
    if (!trialEnd) return 0;
    const today = new Date();
    const endDate = new Date(trialEnd);
    const timeDiff = endDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const calculateTrialProgress = () => {
    if (!trialStart || !trialEnd) return 0;
    const startDate = new Date(trialStart);
    const endDate = new Date(trialEnd);
    const today = new Date();

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!showBanner || temporarilyHidden) return null;

  const remainingDays = calculateRemainingDays();
  const trialProgress = calculateTrialProgress();
  const drawerWidth = 260;
  const collapsedWidth = theme.spacing(9);

  const getUrgencyColor = () => {
    if (remainingDays <= 3) return theme.palette.error.main;
    if (remainingDays <= 7) return theme.palette.warning.main;
    return theme.palette.info.main;
  };

  const getUrgencyText = () => {
    if (remainingDays <= 3) return "Critical";
    if (remainingDays <= 7) return "Attention needed";
    return "Trial active";
  };

    const getBannerBackground = () => {
      if (theme.palette.mode === "dark") {
        return `linear-gradient(90deg, ${alpha(theme.palette.primary.dark, 0.97)} 0%, ${alpha(theme.palette.primary.main, 0.96)} 100%)`;
      }
      return `linear-gradient(90deg, ${alpha(theme.palette.primary.dark, 0.96)} 0%, ${alpha(theme.palette.primary.main, 0.94)} 100%)`;
    };

  return (
    <Slide direction="up" in={showBanner} mountOnEnter unmountOnExit>
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: isMobile
          ? 0
          : sidebarOpen
          ? `${drawerWidth}px`
          : collapsedWidth,
        width: isMobile
          ? "100%"
          : `calc(100% - ${
              sidebarOpen ? drawerWidth : parseInt(collapsedWidth.toString())
            }px)`,
        background: getBannerBackground(),
        backdropFilter: "blur(12px)",
        color: "white",
        py: { xs: 2, md: 2.5 },
        px: { xs: 2, sm: 3, md: 4 },
        zIndex: 1299,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
        borderTop: "1px solid rgba(255,255,255,0.15)",
        borderTopLeftRadius: { xs: 0, sm: 16 },
        borderTopRightRadius: { xs: 0, sm: 16 },
        transition: theme.transitions.create(["left", "width"], {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2, sm: 3 }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2.5 }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <Box
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.12),
                borderRadius: "50%",
                p: 1.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  opacity: 0.95,
                  mb: 0.5,
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                }}
              >
                Your Free Trial Ends Soon
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip
                  label={`${remainingDays} days remaining`}
                  size="small"
                  icon={<DiamondIcon sx={{ fontSize: "16px !important" }} />}
                  sx={{
                    bgcolor: alpha(getUrgencyColor(), 0.25),
                    color: "white",
                    fontWeight: 700,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    border: `1px solid ${alpha(getUrgencyColor(), 0.4)}`,
                    "& .MuiChip-label": { px: 1, py: 0.5 },
                    "& .MuiChip-icon": { color: getUrgencyColor() },
                  }}
                />
                {!isMobile && (
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Ends: {new Date(trialEnd!).toLocaleDateString()} (
                    {getUrgencyText()})
                  </Typography>
                )}
              </Stack>
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "row" }}
              spacing={2}
              alignItems="center"
              justifyContent={{ xs: "space-between", md: "flex-end" }}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              {!isMedium && (
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: "italic",
                    opacity: 0.8,
                    maxWidth: 200,
                    display: { xs: "none", lg: "block" },
                  }}
                >
                  Upgrade now to keep using all premium features
                </Typography>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={handleUpgrade}
                startIcon={<PaymentIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  px: { xs: 2, sm: 3 },
                  py: 1.2,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  background: theme.palette.secondary.main,
                  border: "1px solid rgba(255,255,255,0.15)",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                    transform: "translateY(-2px)",
                    background: theme.palette.secondary.dark,
                  },
                  transition: "all 0.25s ease-in-out",
                }}
              >
                Upgrade Now
              </Button>

              <Tooltip title="Hide for 24 hours">
                <IconButton
                  size="small"
                  onClick={handleDismiss}
                  sx={{
                    color: "white",
                    opacity: 0.6,
                    "&:hover": { opacity: 1, bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                  aria-label="Dismiss notification"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Slide>
    );
  }

export default TrialBanner;
