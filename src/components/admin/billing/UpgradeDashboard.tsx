import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  Paper,
  Slide,
  Badge,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  IconButton,
  Alert,
  Tooltip,
  Container,
  useTheme,
  alpha,
  StepConnector,
  styled,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import StarIcon from "@mui/icons-material/Star";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useUserDealerships } from "../../../hooks/general/useUserDealerships";

import { useAuth } from "../../../context/AuthContext";

const StyledStepConnector = styled(StepConnector)(({ theme }) => ({
  "& .MuiStepConnector-line": {
    borderColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const StyledStepLabel = styled(StepLabel)(({ theme }) => ({
  "& .MuiStepLabel-iconContainer": {
    "& .MuiStepIcon-root": {
      color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
      "&.Mui-active": {
        color: theme.palette.primary.main,
      },
      "&.Mui-completed": {
        color: theme.palette.success.main,
      },
    },
  },
  "& .MuiStepLabel-label": {
    marginTop: theme.spacing(0.5),
    "&.Mui-active": {
      fontWeight: 700,
      color: theme.palette.primary.main,
    },
    "&.Mui-completed": {
      fontWeight: 500,
      color: theme.palette.text.primary,
    },
  },
}));

const GradientCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'color',
})<{ active?: boolean; color?: string }>(({ theme, active, color }) => ({  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  transition: "all 0.3s ease",
  transform: active ? "translateY(-8px)" : "none",
  cursor: "pointer",
  borderRadius: 12,
  boxShadow: active
    ? `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.25)}`
    : theme.shadows[1],
  border: active
    ? `2px solid ${theme.palette.primary.main}`
    : "1px solid rgba(0, 0, 0, 0.12)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.25)}`,
  },
}));

const ProjectPaper = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(3),
  paddingTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: 12,
  position: "relative",
  backgroundColor: alpha(color || theme.palette.primary.main, 0.01),
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  border: `1px solid ${alpha(color || theme.palette.primary.main, 0.2)}`,
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 6,
    background: `linear-gradient(90deg, ${
      color || theme.palette.primary.main
    } 0%, ${alpha(color || theme.palette.primary.main, 0.7)} 100%)`,
  },
}));

const FloatingActionBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  position: "sticky",
  bottom: 20,
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
  zIndex: 10,
  backdropFilter: "blur(8px)",
  background: alpha(theme.palette.background.paper, 0.9),
  border: "1px solid rgba(255,255,255,0.1)",
}));

// Mock data (this would come from your actual data)
const UpgradeDashboard = () => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
  const [currentDealershipIndex, setCurrentDealershipIndex] = useState(0);
  const [currentProject, setCurrentProject] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [tierSelections, setTierSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  // const dealerships = [
  //   { dealership_id: "1", dealership_name: "Baxter Pre-Owned" },
  //   { dealership_id: "2", dealership_name: "Baxter Motors" },
  // ];

  const { data, error } = useUserDealerships(user?.id);

  const dealerships = React.useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray((data as any).dealerships)) return (data as any).dealerships;
    console.error('Unexpected shape for user dealerships:', data);
    return [];
  }, [data]);
  
  const projects = [
    {
      slug: "upshift",
      name: "UpShift",
      description: "Inventory management and vehicle logistics",
      color: theme.palette.error.main,
    },
    // {
    //   slug: "crm",
    //   name: "CRM",
    //   description: "Customer relationship management system",
    //   color: theme.palette.secondary.main,
    // },
    // {
    //   slug: "leadflow",
    //   name: "LeadFlow",
    //   description: "Lead tracking and conversion tools",
    //   color: theme.palette.info.main || "#3D7DE9",
    // },
  ];

  const tiers = [
    {
      id: "basic",
      name: "Basic",
      price: "$49",
      features: ["Core features", "Single location", "Basic support"],
    },
    {
      id: "standard",
      name: "Standard",
      price: "$79",
      features: ["Everything in Basic", "Multi-location", "Priority support"],
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$99",
      features: [
        "Everything in Standard",
        "Advanced analytics",
        "Dedicated manager",
      ],
    },
    {
      id: "none",
      name: "Don't Activate",
      price: "$0",
      features: ["No access to this project"],
    },
  ];

  // Initialize selections for all dealerships and projects
  useEffect(() => {
    if (dealerships.length > 0 && Object.keys(tierSelections).length === 0) {
      const initialSelections: Record<string, Record<string, string>> = {};
      dealerships.forEach((d) => {
        initialSelections[d.dealership_id] = {};
        projects.forEach((p) => {
          initialSelections[d.dealership_id][p.slug] = "none";
        });
      });
      setTierSelections(initialSelections);
    }
  }, [dealerships, projects, tierSelections]);  

  const handleSelectTier = (tierId) => {
    const currentDealership = dealerships[currentDealershipIndex];
    const currentProjectSlug = projects[currentProject].slug;

    setTierSelections((prev) => ({
      ...prev,
      [currentDealership.dealership_id]: {
        ...prev[currentDealership.dealership_id],
        [currentProjectSlug]: tierId,
      },
    }));
  };

  const handleNextProject = () => {
    if (currentProject < projects.length - 1) {
      setCurrentProject(currentProject + 1);
    } else {
      if (currentDealershipIndex < dealerships.length - 1) {
        setCurrentDealershipIndex(currentDealershipIndex + 1);
        setCurrentProject(0);
      } else {
        setReviewMode(true);
      }
    }
  };

  const handlePreviousProject = () => {
    if (currentProject > 0) {
      setCurrentProject(currentProject - 1);
    } else {
      if (currentDealershipIndex > 0) {
        setCurrentDealershipIndex(currentDealershipIndex - 1);
        setCurrentProject(projects.length - 1);
      }
    }
  };

  const handleGoToReview = () => {
    setReviewMode(true);
  };

  const handleBackToSelection = () => {
    setReviewMode(false);
  };

  const handleRemoveSelection = (dealershipId, projectSlug) => {
    setTierSelections((prev) => ({
      ...prev,
      [dealershipId]: {
        ...prev[dealershipId],
        [projectSlug]: "none",
      },
    }));
  };

  const handleStartCheckout = async () => {
    setSubmitting(true);
  
    const { data: user } = await supabase.auth.getUser();
    const dealergroup_id = user?.user?.user_metadata?.dealergroup_id;
  
    // Format selections for checkout with user_id
    const selections = [];
    dealerships.forEach((dealership) => {
      projects.forEach((project) => {
        const tier = tierSelections[dealership.dealership_id][project.slug];
        if (tier !== "none") {
          selections.push({
            user_id: user?.id,
            dealership_id: dealership.dealership_id,
            dealergroup_id,
            project_slug: project.slug,
            tier,
          });
        }
      });
    });
  
    if (selections.length === 0) {
      alert("Please select at least one project to activate");
      setSubmitting(false);
      return;
    }
  
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          selections,
          success_url: `${window.location.origin}/home`,
          cancel_url: `${window.location.origin}/upgrade`,
        },
      });
  
      if (error) {
        console.error("❌ Checkout session failed:", error);
        alert("Checkout failed: " + error.message);
        setSubmitting(false);
        return;
      }
  
      const { url } = data;
      if (url) {
        window.location.href = url;
      }
  
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  
    setSubmitting(false);
  };

  const getTotalSelectedProjects = () => {
    let count = 0;
    Object.keys(tierSelections).forEach((dealershipId) => {
      Object.keys(tierSelections[dealershipId]).forEach((projectSlug) => {
        if (tierSelections[dealershipId][projectSlug] !== "none") {
          count++;
        }
      });
    });
    return count;
  };

  const calculateTotalMonthlyCost = () => {
    let total = 0;
    Object.keys(tierSelections).forEach((dealershipId) => {
      Object.keys(tierSelections[dealershipId]).forEach((projectSlug) => {
        const selectedTier = tierSelections[dealershipId][projectSlug];
        if (selectedTier !== "none") {
          const tierInfo = tiers.find((t) => t.id === selectedTier);
          if (tierInfo) {
            // Extract number from price string (e.g. "$199" -> 199)
            const price = parseInt(tierInfo.price.replace(/\D/g, ""));
            total += price;
          }
        }
      });
    });
    return total;
  };

  const selectedProjectsCount = getTotalSelectedProjects();
  const currentDealership = dealerships[currentDealershipIndex];
  const currentProjectObj = projects[currentProject];
  const currentTier =
    currentDealership && currentProjectObj
      ? tierSelections[currentDealership.dealership_id]?.[
          currentProjectObj.slug
        ] || "none"
      : "none";

  if (reviewMode) {
    return (
      <Container maxWidth="lg">
        <Box px={{ xs: 2, md: 4 }} py={5}>
        <Typography variant="h4" fontWeight={700}>

            Review Your Selections
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={4}>
            Review and confirm your selections before checkout.
          </Typography>

          {selectedProjectsCount === 0 ? (
            <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
              You haven't selected any projects to activate. Go back to make
              selections or proceed with no activations.
            </Alert>
          ) : (
            <Box>
              {dealerships.map((dealership) => {
                const hasSelections = projects.some(
                  (project) =>
                    tierSelections[dealership.dealership_id]?.[project.slug] !==
                    "none"
                );

                if (!hasSelections) return null;

                return (
                  <Card
                    key={dealership.dealership_id}
                    sx={{
                      mb: 3,
                      borderRadius: 3,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {dealership.dealership_name}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        {projects.map((project) => {
                          const selectedTierId =
                            tierSelections[dealership.dealership_id]?.[
                              project.slug
                            ];
                          if (selectedTierId === "none") return null;

                          const selectedTier = tiers.find(
                            (t) => t.id === selectedTierId
                          );

                          return (
                            <Grid item xs={12} sm={6} md={4} key={project.slug}>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  borderRadius: 3,
                                  position: "relative",
                                  borderColor: alpha(project.color, 0.3),
                                  backgroundColor: alpha(project.color, 0.03),
                                  height: "100%",
                                }}
                              >
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: 8,
                                    color: theme.palette.error.main,
                                    bgcolor: alpha(
                                      theme.palette.error.main,
                                      0.1
                                    ),
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.error.main,
                                        0.2
                                      ),
                                    },
                                  }}
                                  onClick={() =>
                                    handleRemoveSelection(
                                      dealership.dealership_id,
                                      project.slug
                                    )
                                  }
                                >
                                  <RemoveCircleIcon fontSize="small" />
                                </IconButton>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    height: 6,
                                    width: "100%",
                                    background: `linear-gradient(90deg, ${
                                      project.color
                                    } 0%, ${alpha(project.color, 0.7)} 100%)`,
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
                                  }}
                                />

                                <Typography
                                  variant="subtitle1"
                                  fontWeight={600}
                                  mt={1.5}
                                >
                                  {project.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  mt={0.5}
                                  mb={1.5}
                                >
                                  {project.description}
                                </Typography>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                  mt={2}
                                >
                                  <Chip
                                    size="small"
                                    label={selectedTier.name}
                                    color="primary"
                                    sx={{
                                      fontWeight: 600,
                                      backgroundColor: alpha(
                                        project.color,
                                        0.1
                                      ),
                                      color: project.color,
                                      borderColor: alpha(project.color, 0.3),
                                    }}
                                  />
                                  <Typography variant="body2" fontWeight={500}>
                                    {selectedTier.price}/mo
                                  </Typography>
                                </Stack>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          <Paper
            elevation={3}
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: theme.palette.primary.main }}
                >
                  ${calculateTotalMonthlyCost()}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.secondary"
                  >
                    /month
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedProjectsCount} project
                  {selectedProjectsCount !== 1 ? "s" : ""} selected
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handleBackToSelection}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  Back to Selection
                </Button>
                <Button
                  variant="contained"
                  onClick={handleStartCheckout}
                  disabled={submitting}
                  endIcon={
                    submitting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <ShoppingCartIcon />
                    )
                  }
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    boxShadow: `0 4px 10px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                  }}
                >
                  {submitting ? "Processing..." : "Complete Checkout"}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box px={{ xs: 2, md: 4 }} py={5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            Choose Your Plan
          </Typography>
          <Tooltip title="View selected items">
            <Badge
              badgeContent={selectedProjectsCount}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  fontWeight: "bold",
                  minWidth: 20,
                  height: 20,
                },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ShoppingCartIcon />}
                onClick={handleGoToReview}
                disabled={selectedProjectsCount === 0}
                sx={{
                  borderRadius: 8,
                  px: 2,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                Review Selections
              </Button>
            </Badge>
          </Tooltip>
        </Stack>

        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Select subscription tiers for each project across your dealerships.
        </Typography>

        <Stepper
          activeStep={currentDealershipIndex}
          alternativeLabel
          sx={{ mb: 4 }}
          connector={<StyledStepConnector />}
        >
          {dealerships.map((dealership, index) => (
            <Step
              key={dealership.dealership_id}
              completed={index < currentDealershipIndex}
            >
              <StyledStepLabel>{dealership.dealership_name}</StyledStepLabel>
            </Step>
          ))}
        </Stepper>

        <Box mb={4}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5" fontWeight={700}>
                {currentDealership?.dealership_name}
              </Typography>
              <Chip
                size="small"
                label={`${currentProject + 1} of ${projects.length}`}
                color="primary"
                sx={{
                  fontWeight: 600,
                  height: 24,
                }}
              />
            </Stack>
          </Stack>

          <ProjectPaper color={currentProjectObj.color}>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Typography
                variant="h5"
                fontWeight={700}
                color={alpha(currentProjectObj.color, 0.9)}
              >
                {currentProjectObj.name}
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" mb={1}>
              {currentProjectObj.description}
            </Typography>
          </ProjectPaper>
        </Box>

        <Grid container spacing={3} mb={4}>
          {tiers.map((tier) => (
            <Grid item xs={12} sm={6} md={3} key={tier.id}>
              <GradientCard
                active={currentTier === tier.id}
                onClick={() => handleSelectTier(tier.id)}
                color={
                  tier.id === "pro" ? theme.palette.primary.main : undefined
                }
              >
                {tier.popular && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 1,
                    }}
                  >
                    <Chip
                      size="small"
                      icon={<StarIcon fontSize="small" />}
                      label="Most Popular"
                      color="primary"
                      sx={{
                        boxShadow: `0 2px 8px ${alpha(
                          theme.palette.primary.main,
                          0.3
                        )}`,
                      }}
                    />
                  </Box>
                )}

                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color={
                        tier.id === "none" ? "text.secondary" : "text.primary"
                      }
                    >
                      {tier.name}
                    </Typography>
                    <Stack direction="row" alignItems="flex-end" spacing={0.5}>
                      <Typography
                        variant="h4"
                        fontWeight={800}
                        color={
                          tier.id === "none" ? "text.secondary" : "text.primary"
                        }
                      >
                        {tier.price}
                      </Typography>
                      {tier.id !== "none" && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          pb={0.5}
                        >
                          /mo
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List disablePadding dense sx={{ flexGrow: 1, mb: 2 }}>
                    {tier.features.map((feature, idx) => (
                      <ListItem key={idx} disableGutters sx={{ py: 0.8 }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          {tier.id !== "none" ? (
                            <CheckIcon
                              fontSize="small"
                              sx={{ color: theme.palette.success.main }}
                            />
                          ) : (
                            <CloseIcon fontSize="small" color="action" />
                          )}
                          <Typography variant="body2">{feature}</Typography>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>

                  {currentTier === tier.id ? (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      disableElevation
                      startIcon={<CheckIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1,
                      }}
                    >
                      Selected
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={() => handleSelectTier(tier.id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        py: 1,
                        borderColor:
                          tier.id === "none"
                            ? theme.palette.grey[300]
                            : undefined,
                        color:
                          tier.id === "none"
                            ? theme.palette.text.secondary
                            : undefined,
                      }}
                    >
                      Select
                    </Button>
                  )}
                </CardContent>
              </GradientCard>
            </Grid>
          ))}
        </Grid>

        <Slide in direction="up">
          <FloatingActionBar>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight={500}>
                  {currentDealership?.dealership_name} •{" "}
                  {currentProjectObj?.name}
                </Typography>
                <Chip
                  size="small"
                  label={tiers.find((t) => t.id === currentTier)?.name}
                  color={currentTier === "none" ? "default" : "primary"}
                  sx={{
                    height: 24,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  size="small"
                  icon={<LocalOfferIcon fontSize="small" />}
                  label={tiers.find((t) => t.id === currentTier)?.price + "/mo"}
                  variant="outlined"
                  color="primary"
                  sx={{
                    height: 24,
                    fontWeight: 600,
                    display: { xs: "none", md: "flex" },
                    visibility: currentTier === "none" ? "hidden" : "visible",
                  }}
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  disabled={
                    currentDealershipIndex === 0 && currentProject === 0
                  }
                  onClick={handlePreviousProject}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  Previous
                </Button>

                <Button
                  variant="contained"
                  onClick={handleNextProject}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    boxShadow: `0 4px 10px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                  }}
                >
                  {currentDealershipIndex === dealerships.length - 1 &&
                  currentProject === projects.length - 1
                    ? "Review Selections"
                    : "Next"}
                </Button>
              </Stack>
            </Stack>
          </FloatingActionBar>
        </Slide>
      </Box>
    </Container>
  );
};

export default UpgradeDashboard;
