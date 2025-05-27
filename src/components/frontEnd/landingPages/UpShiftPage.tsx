import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  Tabs,
  Tab,
  Paper,
  Button
} from "@mui/material";
import {
  VerifiedUser,
  ViewList,
  Dashboard,
  History,
  Block,
  AssignmentTurnedIn,
  PersonSearch,
  GroupAdd,
  NoteAdd,
  BarChart,
  AccessTime,
  PieChart,
  FilterList,
  TableChart,
  Info,
  Edit,
  Security,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import HeroSectionComponent from "./HeroSectionComponent";
import LayoutComponent from "./LayoutComponent";
import { motion } from "framer-motion";
import PageHelmet from "../../shared/PageHelmet";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const CTAButton = styled(Button)(({ theme, gradient = secondaryGradient }) => ({
  background: gradient,
  color: "white",
  padding: theme.spacing(1.5, 4),
  borderRadius: 12,
  fontWeight: 700,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    background: gradient,
    transform: "translateY(-3px)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
  },
}));

// Module Feature Card
const ModuleCard = ({ title, icon, description, gradient }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
        transition: "transform 0.4s ease, box-shadow 0.4s ease",
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <Box
        sx={{
          background: gradient,
          p: 4,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -20,
            left: 0,
            right: 0,
            height: 20,
            background: "inherit",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          },
        }}
      >
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          {icon}
        </Box>
        <Typography
          variant="h4"
          component="h3"
          sx={{ fontWeight: 700, color: "white", textAlign: "center" }}
        >
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Feature Detail Card
const FeatureCard = ({ icon, title, description, bgColor = "#4A3D6A" }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        borderRadius: 4,
        p: 4,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        // backdropFilter: "blur(5px)",
        boxShadow: "0 15px 35px rgba(74, 61, 106, 0.1)",
        transition: "transform 0.4s ease, box-shadow 0.4s ease",
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: "0 25px 50px rgba(74, 61, 106, 0.2)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(135deg, ${bgColor} 0%, rgba(255,255,255,0.2) 100%)`,
          borderRadius: "50%",
          p: 2,
          mb: 3,
          width: 64,
          height: 64,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h5"
        component="h3"
        sx={{ fontWeight: 700, mb: 2, color: "#4A3D6A" }}
      >
        {title}
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary" }}>
        {description}
      </Typography>
    </Card>
  );
};

// Module Features Section
const ModulesSection = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const modules = [
    {
      title: "Upsheet",
      description:
        "Streamlined visitor intake form that verifies contact info, logs visit purpose, and replaces your paper upsheet — perfect for front desk tablets.",
      gradient: "linear-gradient(135deg, #FF4081 0%, #F50057 100%)",
      icon: <AssignmentTurnedIn size={40} color="white" />,
    },
    {
      title: "Dashboard",
      description:
        "Live metrics and visual insights into foot traffic, visit outcomes, and sales consultant activity — with filters that actually make sense.",
      gradient: "linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)",
      icon: <Dashboard size={40} color="white" />,
    },
    {
      title: "Visit History",
      description:
        "Detailed log of every dealership interaction — sortable, searchable, and built for tracking long-term engagement across visitors.",
      gradient: "linear-gradient(135deg, #4A3D6A 0%, #6C5A91 100%)",
      icon: <History size={40} color="white" />,
    },
    {
      title: "Visit Details",
      description:
        "Quick-access dialog to review and edit visit info, assign consultants, and manage visitor status — all in one place.",
      gradient: "linear-gradient(135deg, #009688 0%, #4DB6AC 100%)",
      icon: <Info size={40} color="white" />,
    },
    {
      title: "Banned Contacts",
      description:
        "Centralized list of banned visitors across all rooftops in your group — add, view, or reverse bans with full audit tracking.",
      gradient: "linear-gradient(135deg, #F44336 0%, #FF8A80 100%)",
      icon: <Block size={40} color="white" />,
    },
    {
      title: "ID Scanner",
      description:
        "Built-in ID capture using AWS Textract — scan licenses, extract contact details, and verify visitors in seconds.",
      gradient: "linear-gradient(135deg, #673AB7 0%, #9575CD 100%)",
      icon: <VerifiedUser size={40} color="white" />,
    },
  ];
  

  return (
    <MotionContainer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: "#f8f9fa",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(rgba(0, 0, 0, 0.03) 2px, transparent 2px)",
            backgroundSize: "30px 30px",
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 8, maxWidth: 800, mx: "auto", textAlign: "center" }}>
            <Typography
              variant={isMobile ? "h3" : "h2"}
              component="h2"
              sx={{
                fontWeight: 800,
                color: "#4A3D6A",
                mb: 2,
                letterSpacing: "-0.5px",
              }}
            >
              Key Modules
            </Typography>
            <Divider
              sx={{
                width: "80px",
                mx: "auto",
                my: 3,
                borderColor: "#FF4081",
                borderWidth: 3,
                borderRadius: 2,
              }}
            />
            <Typography
              variant={isMobile ? "h6" : "h5"}
              color="text.secondary"
              sx={{
                fontWeight: 400,
                lineHeight: 1.6,
                mb: 5,
              }}
            >
              A complete, modular system designed specifically for automotive
              dealerships to track, manage, and analyze visitor activity.
            </Typography>
          </Box>

          <MotionContainer
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <Grid container spacing={4}>
              {modules.map((module, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ModuleCard {...module} />
                </Grid>
              ))}
            </Grid>
          </MotionContainer>
        </Container>
      </Box>
    </MotionContainer>
  );
};

// Feature Detail Tab Section
const FeaturesTabSection = () => {
  const [tabValue, setTabValue] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const features = {
    upsheet: [
      {
        icon: <PersonSearch size={32} color="white" />,
        title: "Contact Search",
        description:
          "Quickly find existing contacts across locations with email and phone matching.",
        bgColor: "#FF4081",
      },
      {
        icon: <GroupAdd size={32} color="white" />,
        title: "Smart Contact Creation",
        description:
          "Create new contacts or confirm duplicates with full detail preview before saving.",
        bgColor: "#F50057",
      },
      {
        icon: <NoteAdd size={32} color="white" />,
        title: "Structured Visit Intake",
        description:
          "Capture consultant, visit reason, sales type, and vehicle interest — all in one step.",
        bgColor: "#FF4081",
      },
    ],
    
    dashboard: [
      {
        icon: <BarChart size={32} color="white" />,
        title: "Key Performance Metrics",
        description:
          "Track visits, appointments, walk-ins, and hot leads with real-time data.",
        bgColor: "#3F51B5",
      },
      {
        icon: <AccessTime size={32} color="white" />,
        title: "Time-Based Trends",
        description:
          "Visualize patterns by hour, day, or week to spot peak showroom activity.",
        bgColor: "#2196F3",
      },
      {
        icon: <PieChart size={32} color="white" />,
        title: "Category Breakdown",
        description:
          "See top-level summaries of visit reasons and sales types at a glance.",
        bgColor: "#3F51B5",
      },
      {
        icon: <FilterList size={32} color="white" />,
        title: "Granular Filtering",
        description:
          "Slice your data by dealership, consultant, and custom timeframes.",
        bgColor: "#2196F3",
      },
    ],
    
    history: [
      {
        icon: <TableChart size={32} color="white" />,
        title: "Full Visit Log",
        description:
          "Browse every visitor interaction with sorting, searching, and pagination.",
        bgColor: "#4A3D6A",
      },
      {
        icon: <FilterList size={32} color="white" />,
        title: "Targeted Filtering",
        description:
          "Narrow results by consultant, date range, or dealership location.",
        bgColor: "#6C5A91",
      },
      {
        icon: <Info size={32} color="white" />,
        title: "One-Click Details",
        description:
          "Expand any visit row to view full contact and interaction history.",
        bgColor: "#4A3D6A",
      },
    ],
    
    details: [
      {
        icon: <Edit size={32} color="white" />,
        title: "Editable Visit Info",
        description:
          "Update reason, sales type, date, consultant, and other visit fields instantly.",
        bgColor: "#009688",
      },
      {
        icon: <VerifiedUser size={32} color="white" />,
        title: "License Data Viewer",
        description:
          "View scanned ID data and verify key fields like DOB and license number.",
        bgColor: "#4DB6AC",
      },
      {
        icon: <Security size={32} color="white" />,
        title: "Banning Controls",
        description:
          "Add problematic visitors to the banned list with full notes and audit tracking.",
        bgColor: "#009688",
      },
    ],    
  };

  return (
    <Box
    sx={{
      py: { xs: 8, md: 12 },
      backgroundColor: "#f8f9fa",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage:
          "radial-gradient(rgba(0, 0, 0, 0.03) 2px, transparent 2px)",
        backgroundSize: "30px 30px",
        pointerEvents: "none",
      },
    }}
  >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ mb: 8, maxWidth: 800, mx: "auto", textAlign: "center" }}>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h2"
            sx={{
              fontWeight: 800,
              color: "#4A3D6A",
              mb: 2,
              letterSpacing: "-0.5px",
            }}
          >
            Explore Module Features
          </Typography>
          <Divider
            sx={{
              width: "80px",
              mx: "auto",
              my: 3,
              borderColor: "#FF4081",
              borderWidth: 3,
              borderRadius: 2,
            }}
          />
            <Typography
              variant={isMobile ? "h6" : "h5"}
              color="text.secondary"
              sx={{
                fontWeight: 400,
                lineHeight: 1.6,
                mb: 5,
              }}
            >
            Get to know what each module can do — from contact intake to executive dashboards and everything in between.
          </Typography>
        </Box>
  
        <Paper
          sx={{
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(6px)",
            mb: 6,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "1rem",
                py: 2,
                gap: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              },
              "& .Mui-selected": {
                color: "#4A3D6A",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#FF4081",
                height: 3,
                borderRadius: 2,
              },
            }}
          >
            <Tab icon={<AssignmentTurnedIn fontSize="small" />} label="Upsheet" />
            <Tab icon={<Dashboard fontSize="small" />} label="Dashboard" />
            <Tab icon={<History fontSize="small" />} label="Visit History" />
            <Tab icon={<Info fontSize="small" />} label="Visit Details" />
          </Tabs>
        </Paper>
  
        <Box sx={{ mt: 4 }}>
          {tabValue === 0 && (
            <Grid container spacing={4}>
              {features.upsheet.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <FeatureCard {...feature} />
                </Grid>
              ))}
            </Grid>
          )}
          {tabValue === 1 && (
            <Grid container spacing={4}>
              {features.dashboard.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <FeatureCard {...feature} />
                </Grid>
              ))}
            </Grid>
          )}
          {tabValue === 2 && (
            <Grid container spacing={4}>
              {features.history.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <FeatureCard {...feature} />
                </Grid>
              ))}
            </Grid>
          )}
          {tabValue === 3 && (
            <Grid container spacing={4}>
              {features.details.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <FeatureCard {...feature} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
  
};

// Role Access Section
const RoleAccessSection = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const roles = [
    {
      title: "Sales Consultants",
      access: [
        "Log visits for assigned dealership",
        "View visit history for their customers",
        "Access upsheet form for visitor intake",
        "View dashboard for their performance metrics",
      ],
      icon: "👨‍💼",
    },
    {
      title: "Dealer Group Admins",
      access: [
        "View all visits across multiple stores",
        "Ban/unban visitors across dealer group",
        "Access complete dashboard analytics",
        "Manage sales consultant assignments",
      ],
      icon: "👩‍💼",
    },
    {
      title: "Global Admins",
      access: [
        "Full system access across all dealerships",
        "Configure group/dealer filters",
        "Manage user permissions",
        "Access advanced reporting features",
      ],
      icon: "👑",
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: "#f8f9fa" }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 8, maxWidth: 800, mx: "auto", textAlign: "center" }}>
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h2"
            sx={{
              fontWeight: 800,
              color: "#4A3D6A",
              mb: 2,
              letterSpacing: "-0.5px",
            }}
          >
            Role-Based Access
          </Typography>
          <Divider
            sx={{
              width: "80px",
              mx: "auto",
              my: 3,
              borderColor: "#FF4081",
              borderWidth: 3,
              borderRadius: 2,
            }}
          />
          <Typography
            variant={isMobile ? "h6" : "h5"}
            color="text.secondary"
            sx={{
              fontWeight: 400,
              lineHeight: 1.6,
              mb: 5,
            }}
          >
            UpShift provides customized access and features based on user roles
            within your dealership organization.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {roles.map((role, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  p: 4,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: "3rem",
                    textAlign: "center",
                    mb: 3,
                  }}
                >
                  {role.icon}
                </Typography>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    textAlign: "center",
                    color: "#4A3D6A",
                  }}
                >
                  {role.title}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box>
                  {role.access.map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: "#4A3D6A",
                          color: "white",
                          mr: 2,
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        ✓
                      </Box>
                      <Typography variant="body1" color="text.secondary">
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Call To Action Section
const CallToActionSection = () => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(135deg, #4A3D6A 0%, #6C5A91 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <MotionContainer
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <Typography
              variant={isMobile ? "h4" : "h3"}
              component="h2"
              sx={{ fontWeight: "bold", color: "white", mb: 3 }}
            >
              Smarter Tools. Real Results. Better Decisions.
            </Typography>

            <CTAButton
              variant="contained"
              size="large"
              gradient="linear-gradient(135deg, #FF4081 0%, #F50057 100%)"
              sx={{ px: 6, py: 2 }}
              onClick={() => navigate("/signup")}
            >
              Get Started Today
            </CTAButton>
          </MotionContainer>
        </Container>
    </Box>
  );
};

const MotionContainer = styled(motion.div)({
  width: "100%",
});

// Main App Component
const UpShiftPage = () => {
  return (
    <LayoutComponent>
      <PageHelmet
        title="UpShift | baxter-projects"
        description="Learn more about the mission, values, and team behind baxter-projects."
      />
      <HeroSectionComponent
        title="UpShift"
        subtitle="Smarter Visitor Management for Automotive Dealerships"
        description="Ditch the paper upsheet. UpShift makes it easy to track showroom traffic, log appointments, and give your team the insights they actually need — all in real time."
        stats={[
          { value: "3x", label: "Faster Check-Ins" },
          { value: "98%", label: "Data Accuracy" },
          { value: "5+", label: "Actionable Dashboards" },
          { value: "100%", label: "Visibility Into Every Visit" },
        ]}
      />
      <ModulesSection />
      <FeaturesTabSection />
      <CallToActionSection />
    </LayoutComponent>
  );
};

export default UpShiftPage;
