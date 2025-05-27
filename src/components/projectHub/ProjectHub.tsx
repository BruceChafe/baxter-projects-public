import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Paper,
  Avatar,
  alpha,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Collapse,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOnboardingSteps } from "../../hooks/admin/useOnboardingSteps";
import {
  Bolt,
  Business,
  People,
  ArrowForward,
  CheckCircleOutline,
  PlayCircleOutline,
  ArticleOutlined,
  NotificationsOutlined,
  TrendingUp,
  ExpandMore,
  ExpandLess,
  HelpOutline,
  Settings,
  Update,
} from "@mui/icons-material";
import PageHelmet from "../shared/PageHelmet";

const BaxterWorkspace = () => {
  const navigate = useNavigate();
  const { user, accessContext } = useAuth();
  if (!user?.id || !user.user_metadata?.role || !accessContext) return null;

  const firstName =
    (user?.user_metadata as { first_name?: string })?.first_name ?? "there";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expandedSection, setExpandedSection] = useState("nextSteps");

  const handleExpandSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const projects = [
    {
      name: "baxter UpShift",
      path: "/upshift",
      description:
        "Seamless ID verification and visitor management for modern dealerships.",
      icon: <People sx={{ fontSize: 28 }} />,
      color: theme.palette.error.main,
      progress: 20,
      setupSteps: [
        "Connect your facility scanner",
        "Import visitor list",
        "Set access permissions",
      ],
    },
    {
      name: "baxter CRM",
      path: "/crm/calendar",
      description:
        "Manage contacts, track deals, and build stronger customer relationships.",
      icon: <Business sx={{ fontSize: 28 }} />,
      color: theme.palette.secondary.main,
      label: "Coming soon",
      disabled: true,
      progress: 0,
      setupSteps: ["Available soon", "Join the waitlist"],
    },
    {
      name: "baxter LeadFlow",
      path: "/leads/dashboard",
      description:
        "Intelligent lead management system that prioritizes your hottest prospects.",
      icon: <Bolt sx={{ fontSize: 28 }} />,
      color: theme.palette.info?.main || "#3D7DE9",
      label: "New",
      disabled: true,
      progress: 5,
      setupSteps: [
        "Import your leads",
        "Configure scoring rules",
        "Set up notifications",
      ],
    },
  ];

  if (!user?.id || !user.user_metadata?.role) return null;
  const role = user.user_metadata.role;
  const userId = user.id;

  const {
    steps: nextSteps,
    loading: loadingSteps,
    markStepComplete,
  } = useOnboardingSteps(role, userId);

  const recentUpdates = [
    {
      title: "LeadFlow enhancement",
      description: "New lead scoring algorithm released",
      date: "Apr 10, 2025",
      type: "feature",
    },
    {
      title: "System maintenance",
      description: "Scheduled downtime on April 15, 2025 (2-4 AM EST)",
      date: "Apr 12, 2025",
      type: "maintenance",
    },
    {
      title: "UpShift update available",
      description: "Version 2.1 with improved scanning speed",
      date: "Apr 8, 2025",
      type: "update",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ width: "100%", py: 4 }}>
      <PageHelmet
        title="Project Hub | baxter-projects"
        description="Learn more about the mission, values, and team behind baxter-projects."
      />
      <Box sx={{ mb: 4, px: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Hello{firstName ? `, ${firstName}` : ""} 👋
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: alpha(theme.palette.text.primary, 0.7),
            fontSize: { xs: "0.875rem", sm: "1rem" },
            lineHeight: 1.6,
          }}
        >
          Welcome to your workspace! Here you can manage your projects, track
          progress, and access resources.
        </Typography>
      </Box>

      {/* Main Solutions Cards */}
      <Grid
        container
        spacing={3}
        justifyContent="flex-start"
        alignItems="stretch"
      >
        {projects.map((project) => (
          <Grid item key={project.name} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                p: 0,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: alpha(
                  project.color || theme.palette.primary.main,
                  0.02
                ),
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: project.disabled ? "not-allowed" : "pointer",
                opacity: project.disabled ? 0.6 : 1,
                position: "relative",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.07)",
                  "& .projectCard-arrow": {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                },
              }}
              onClick={() => {
                if (!project.disabled) {
                  navigate(project.path);
                }
              }}
            >
              <Box
                sx={{
                  height: 8,
                  width: "100%",
                  background: `linear-gradient(90deg, ${
                    project.color
                  } 0%, ${alpha(project.color, 0.7)} 100%)`,
                  transition: "height 0.2s ease",
                  ".MuiCard-root:hover &": {
                    height: 12,
                  },
                }}
              />
              <CardContent sx={{ p: 3, flex: 1, position: "relative" }}>
                {project.label && (
                  <Chip
                    label={project.label}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      fontWeight: 500,
                      fontSize: "0.7rem",
                      bgcolor: alpha(project.color, 0.1),
                      color: project.color,
                      border: `1px solid ${alpha(project.color, 0.3)}`,
                      ".MuiChip-label": {
                        px: 1,
                      },
                    }}
                  />
                )}

                <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: alpha(project.color, 0.12),
                      color: project.color,
                      mr: 2,
                      boxShadow: `0 4px 12px ${alpha(project.color, 0.2)}`,
                      transition: "all 0.2s ease",
                      ".MuiCard-root:hover &": {
                        transform: "scale(1.05)",
                        boxShadow: `0 6px 14px ${alpha(project.color, 0.25)}`,
                      },
                    }}
                  >
                    {project.icon}
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      fontSize: { xs: "1.15rem", sm: "1.25rem" },
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {project.name}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(theme.palette.text.primary, 0.7),
                    fontSize: { xs: "0.875rem", sm: "0.95rem" },
                    lineHeight: 1.6,
                    pr: 3,
                    mb: 2.5,
                  }}
                >
                  {project.description}
                </Typography>

                <Box
                  className="projectCard-arrow"
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    opacity: 0,
                    transform: "translateX(10px)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: alpha(project.color, 0.1),
                    color: project.color,
                  }}
                >
                  <ArrowForward fontSize="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Next Steps Section */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            bgcolor: alpha(theme.palette.primary.main, 0.03),
          }}
          onClick={() => handleExpandSection("nextSteps")}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CheckCircleOutline
              sx={{
                color: theme.palette.primary.main,
                mr: 1.5,
              }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontSize: "1.1rem" }}
            >
              Next Steps
            </Typography>
          </Box>
          {expandedSection === "nextSteps" ? <ExpandLess /> : <ExpandMore />}
        </Box>

        <Collapse in={expandedSection === "nextSteps"}>
          <Box sx={{ p: 2 }}>
            <List sx={{ py: 0 }}>
              {loadingSteps ? (
                <Typography sx={{ px: 2, py: 1 }}>useOnboardingSteps</Typography>
              ) : nextSteps.length === 0 ? (
                <Typography sx={{ px: 2, py: 1 }} color="text.secondary">
                  No steps for this role.
                </Typography>
              ) : (
                nextSteps
                  .filter((step) => !step.completed)

                  .map((step) => (
                    <ListItem
                      key={step.step_key}
                      disablePadding
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        mb: 1,
                        "&:hover": {
                          bgcolor: theme.palette.grey[50],
                        },
                        bgcolor: step.completed
                          ? alpha(theme.palette.success.main, 0.05)
                          : "transparent",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: step.completed
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.primary.main, 0.1),
                            color: step.completed
                              ? theme.palette.success.main
                              : theme.palette.primary.main,
                          }}
                        >
                          <CheckCircleOutline fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {step.title}
                            </Typography>
                            {step.completed && (
                              <Chip
                                label="Completed"
                                size="small"
                                sx={{
                                  ml: 1,
                                  height: 20,
                                  fontSize: "0.65rem",
                                  bgcolor: alpha(
                                    theme.palette.success.main,
                                    0.1
                                  ),
                                  color: theme.palette.success.main,
                                  fontWeight: 500,
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {step.description}
                          </Typography>
                        }
                      />
                      <Button
                        size="small"
                        variant={step.completed ? "text" : "outlined"}
                        color={step.completed ? "success" : "primary"}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          minWidth: 90,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(step.path);
                          if (!step.completed) {
                            markStepComplete(step.step_key);
                          }
                        }}
                      >
                        {step.completed ? "Review" : step.action}
                      </Button>
                    </ListItem>
                  ))
              )}
            </List>
          </Box>
        </Collapse>
      </Paper>

      {/* Recent Updates Section */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            bgcolor: alpha(theme.palette.info.main, 0.03),
          }}
          onClick={() => handleExpandSection("updates")}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <NotificationsOutlined
              sx={{
                color: theme.palette.info.main,
                mr: 1.5,
              }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontSize: "1.1rem" }}
            >
              Recent Updates
            </Typography>
          </Box>
          {expandedSection === "updates" ? <ExpandLess /> : <ExpandMore />}
        </Box>

        <Collapse in={expandedSection === "updates"}>
          <List sx={{ py: 0 }}>
            {recentUpdates.map((update, index) => (
              <ListItem
                key={index}
                sx={{
                  py: 1.5,
                  borderBottom:
                    index < recentUpdates.length - 1
                      ? `1px solid ${theme.palette.grey[100]}`
                      : "none",
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {update.title}
                      </Typography>
                      <Chip
                        label={update.type}
                        size="small"
                        sx={{
                          ml: 1,
                          height: 20,
                          fontSize: "0.65rem",
                          bgcolor:
                            update.type === "feature"
                              ? alpha(theme.palette.success.main, 0.1)
                              : update.type === "maintenance"
                              ? alpha(theme.palette.warning.main, 0.1)
                              : alpha(theme.palette.info.main, 0.1),
                          color:
                            update.type === "feature"
                              ? theme.palette.success.main
                              : update.type === "maintenance"
                              ? theme.palette.warning.main
                              : theme.palette.info.main,
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  }
                  secondary={update.description}
                />
                <Typography variant="caption" color="text.secondary">
                  {update.date}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Paper>

      {/* Quick Resources Section */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            bgcolor: alpha(theme.palette.secondary.main, 0.03),
          }}
          onClick={() => handleExpandSection("resources")}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <HelpOutline
              sx={{
                color: theme.palette.secondary.main,
                mr: 1.5,
              }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontSize: "1.1rem" }}
            >
              Quick Resources
            </Typography>
          </Box>
          {expandedSection === "resources" ? <ExpandLess /> : <ExpandMore />}
        </Box>

        <Collapse in={expandedSection === "resources"}>
          <Grid container spacing={2} sx={{ p: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.grey[100]}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: theme.palette.grey[50],
                  },
                }}
                onClick={() => navigate("/help/documentation")}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ArticleOutlined
                    sx={{ color: theme.palette.text.secondary, mr: 1 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Documentation
                  </Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.grey[100]}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: theme.palette.grey[50],
                  },
                }}
                onClick={() => navigate("/help/tutorials")}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PlayCircleOutline
                    sx={{ color: theme.palette.text.secondary, mr: 1 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Video Tutorials
                  </Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.grey[100]}`,
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: theme.palette.grey[50],
                  },
                }}
                onClick={() => navigate("/support")}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <HelpOutline
                    sx={{ color: theme.palette.text.secondary, mr: 1 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Support Center
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>
    </Container>
  );
};

export default BaxterWorkspace;
