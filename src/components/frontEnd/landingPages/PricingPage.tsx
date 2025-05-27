import { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  Button,
  FormControlLabel,
  Switch,
  CardActions,
  useTheme
} from "@mui/material";
import {
  Speed,
  Security,
  Analytics,
  CheckCircle,
  Timeline,
  NoteAdd,
  Handshake,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import LayoutComponent from "../landingPages/LayoutComponent";
import PageHelmet from "../../shared/PageHelmet";

// Animation variants
const animations = {
  fadeInUp: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }
};

// Theme gradients
const gradients = {
  primary: "linear-gradient(135deg, #4A3D6A 0%, #6C5A91 100%)",
  secondary: "linear-gradient(135deg, #FF4081 0%, #F50057 100%)",
  tertiary: "linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)",
  quaternary: "linear-gradient(135deg, #009688 0%, #4CAF50 100%)",
  hero: "linear-gradient(135deg, #4A3D6A 0%, #6C5A91 80%, #845DA4 100%)",
  leadFlow: "linear-gradient(135deg, #283593 0%, #5C6BC0 100%)"
};

// Pricing data
const pricingPlans = [
  {
    name: "UpShift Starter",
    description:
      "Ideal for single rooftops needing basic ID capture and visit logs.",
    gradient: gradients.tertiary,
    monthlyPrice: 49,
    annualPrice: 39,
    icon: <NoteAdd sx={{ fontSize: 40, color: "white" }} />,
    isPopular: false,
    features: [
      "ID Scan & OCR",
      "Visit History Dashboard",
      "Basic Reports",
      "1 Reception User",
      "Email Support",
    ],
  },
  {
    name: "UpShift Professional",
    description:
      "Powerful features for growing teams who need insight and control.",
    gradient: gradients.secondary,
    monthlyPrice: 79,
    annualPrice: 65,
    icon: <Security sx={{ fontSize: 40, color: "white" }} />,
    isPopular: true,
    features: [
      "Everything in Starter",
      "Multi-User Dashboard Access",
      "Ban/Alert Contact Flags",
      "PDF417 Barcode Decoding",
      "Daily Email Reports",
    ],
  },
  {
    name: "UpShift Enterprise",
    description:
      "Custom fit for large dealer groups who need full-scale tracking.",
    gradient: gradients.quaternary,
    monthlyPrice: 99,
    annualPrice: 79,
    icon: <Analytics sx={{ fontSize: 40, color: "white" }} />,
    isPopular: false,
    features: [
      "Everything in Professional",
      "Unlimited Locations",
      "Unified Group Dashboard",
      "Role-Based Permissions",
      "Priority Support",
    ],
  },
  {
    name: "CRM",
    description: "Our modern CRM built for dealership workflows.",
    gradient: gradients.primary,
    comingSoon: true,
    icon: <Handshake sx={{ fontSize: 40, color: "white" }} />,
    features: [
      "Lead Management",
      "Sales Workflow Automation",
      "Customer Profile Hub",
      "Task & Reminder System",
    ],
  },
  {
    name: "LeadFlow",
    description: "Advanced lead routing and SLA tracking engine.",
    gradient: gradients.leadFlow,
    comingSoon: true,
    icon: <Timeline sx={{ fontSize: 40, color: "white" }} />,
    features: [
      "Lead Source Monitoring",
      "SLA Notifications",
      "Sales Consultant Availability",
      "Response Tracking",
    ],
  },
];

// FAQ data
const faqs = [
  {
    question: "How long does implementation take?",
    answer:
      "Our typical implementation time is 2-4 weeks, depending on your dealership size and the solutions you choose. Our Professional and Enterprise plans include dedicated onboarding specialists to ensure a smooth transition.",
  },
  {
    question: "Can I upgrade my plan later?",
    answer:
      "Absolutely! You can upgrade your plan at any time. When you upgrade, we'll prorate your existing subscription and apply any remaining credit to your new plan.",
  },
  {
    question: "Is there a contract or commitment?",
    answer:
      "Monthly plans can be canceled anytime. Annual plans offer significant savings but require a 12-month commitment. We offer a 30-day money-back guarantee for new customers.",
  },
  {
    question: "Do you offer custom solutions?",
    answer:
      "Yes, our Enterprise plan includes custom integrations. For larger dealership groups or unique requirements, we can create tailored solutions. Contact our sales team to discuss your specific needs.",
  },
];

// Component for Hero Section
const HeroSection = ({ isMobile }) => {
  return (
    <Box
      sx={{
        background: gradients.hero,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(rgba(74, 61, 106, 0.1) 2px, transparent 2px)",
          backgroundSize: "30px 30px",
          pointerEvents: "none",
        },
        py: { xs: 10, md: 15 },
      }}
    >
      <BackgroundCircles />
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={animations.fadeInUp}
        >
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant={isMobile ? "h3" : "h1"}
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: "#fff",
                  mb: 2,
                  letterSpacing: "-0.5px",
                }}
              >
                Pricing{" "}
              </Typography>
              <Divider
                sx={{
                  width: "80px",
                  my: 3,
                  borderColor: "#FF4081",
                  borderWidth: 3,
                  borderRadius: 2,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontSize: isMobile ? "1rem" : "1.25rem",
                  lineHeight: 1.8,
                  color: "rgba(255, 255, 255, 0.8)",
                  mb: 5,
                  maxWidth: "600px",
                }}
              >
                Choose the plan that's right for your dealership. All plans
                include our core technology platform with regular updates and
                no hidden fees.
              </Typography>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

// Component for background circles animation
const BackgroundCircles = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {/* Animated background circles */}
      {[
        { size: "500px", top: "-100px", left: "60%", opacity: 0.15 },
        { size: "400px", top: "60%", left: "-100px", opacity: 0.1 },
        { size: "300px", top: "70%", left: "70%", opacity: 0.08 },
      ].map((circle, index) => (
        <Box
          key={index}
          className="animated-circle"
          sx={{
            position: "absolute",
            width: circle.size,
            height: circle.size,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.2)",
            filter: "blur(60px)",
            top: circle.top,
            left: circle.left,
            opacity: circle.opacity,
            transition: `transform ${8 + index * 2}s ease-in-out`,
          }}
        />
      ))}
      
      {/* Background pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3,
        }}
      />
    </Box>
  );
};

// Component for Pricing Plans Section
const PricingPlansSection = ({ annually, setAnnually, isMobile }) => {
  const theme = useTheme();
  
  return (
    <Box
      id="pricing-plans"
      sx={{
        padding: theme.spacing(12, 0),
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
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
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.fadeInUp}
        >
          <Box sx={{ mb: 6, maxWidth: 800, mx: "auto", textAlign: "center" }}>
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
              Choose Your Plan
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
              variant={isMobile ? "body1" : "h6"}
              color="text.secondary"
              sx={{
                fontWeight: 400,
                lineHeight: 1.6,
                mb: 4,
              }}
            >
              Select the perfect plan to elevate your dealership's operations
              and customer experience.
            </Typography>

            <BillingToggle annually={annually} setAnnually={setAnnually} />
          </Box>
        </motion.div>

        <motion.div
          variants={animations.staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <Grid container spacing={4} alignItems="stretch">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <PricingCard plan={plan} annually={annually} />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

// Component for Billing Toggle
const BillingToggle = ({ annually, setAnnually }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 6,
        "& .MuiFormControlLabel-root": {
          marginRight: 0,
        },
        "& .MuiSwitch-root": {
          margin: 2,
        },
        "& .MuiTypography-root": {
          fontWeight: 600,
        },
      }}
    >
      <Typography
        variant="subtitle1"
        color={annually ? "text.secondary" : "#4A3D6A"}
      >
        Monthly
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={annually}
            onChange={() => setAnnually(!annually)}
            color="secondary"
          />
        }
        label=""
      />
      <Typography
        variant="subtitle1"
        color={annually ? "#4A3D6A" : "text.secondary"}
      >
        Annual{" "}
        <span style={{ color: "#FF4081", fontWeight: "bold" }}>
          Save 20%
        </span>
      </Typography>
    </Box>
  );
};

// Component for Pricing Card
const PricingCard = ({ plan, annually }) => {
  const theme = useTheme();
  
  // Style for pricing card
  const cardStyle = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: plan.isPopular
      ? "0 15px 50px rgba(0, 0, 0, 0.15)"
      : "0 10px 40px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.4s ease, box-shadow 0.4s ease",
    transform: plan.isPopular ? "scale(1.05)" : "scale(1)",
    opacity: plan.comingSoon ? 0.6 : 1,
    pointerEvents: plan.comingSoon ? "none" : "auto",
    "&:hover": {
      transform: plan.isPopular
        ? "scale(1.08) translateY(-12px)"
        : "scale(1.03) translateY(-12px)",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
    },
  };

  return (
    <motion.div variants={animations.fadeInUp}>
      <Card sx={cardStyle}>
        {plan.isPopular && (
          <Box
            sx={{
              position: "absolute",
              top: 20,
              right: -30,
              background: "#FF4081",
              color: "white",
              padding: theme.spacing(0.5, 3),
              transform: "rotate(45deg)",
              width: 140,
              textAlign: "center",
              fontWeight: "bold",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              zIndex: 1,
            }}
          >
            MOST POPULAR
          </Box>
        )}
        
        <Box
          sx={{
            background: plan.gradient,
            padding: theme.spacing(4, 2),
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -10,
              left: 0,
              right: 0,
              height: 10,
              background: "inherit",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            },
          }}
        >
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {plan.icon}
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "white", textAlign: "center" }}
          >
            {plan.name}
          </Typography>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 4 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 4, textAlign: "center", height: 48 }}
          >
            {plan.description}
          </Typography>

          {!plan.comingSoon && (
            <>
              <Box sx={{ 
                display: "flex", 
                alignItems: "baseline", 
                justifyContent: "center",
                marginBottom: theme.spacing(3) 
              }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#4A3D6A" }}
                >
                  ${annually ? plan.annualPrice : plan.monthlyPrice}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "text.secondary", ml: 1 }}
                >
                  /month
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mb: 4,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                {annually ? "Billed annually" : "Billed monthly"}
              </Typography>
            </>
          )}

          <Divider sx={{ mb: 3 }} />

          {plan.features.map((feature, idx) => (
            <Box 
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: theme.spacing(2),
                color: "#555",
              }}
            >
              <CheckCircle
                sx={{
                  color: plan.isPopular ? "#FF4081" : "#4A3D6A",
                  mr: 1,
                  fontSize: "1.2rem",
                }}
              />
              <Typography variant="body2">{feature}</Typography>
            </Box>
          ))}
        </CardContent>

        {!plan.comingSoon && (
          <CardActions sx={{ p: 4, pt: 0 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                bgcolor: plan.isPopular ? "#FF4081" : "#4A3D6A",
                py: 1.5,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: plan.isPopular ? "#F50057" : "#6C5A91",
                },
              }}
            >
              {plan.isPopular ? "Get Started Now" : "Choose Plan"}
            </Button>
          </CardActions>
        )}

        {plan.comingSoon && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: 700,
              fontSize: "1.25rem",
              zIndex: 2,
              backdropFilter: "blur(2px)",
              textTransform: "uppercase",
            }}
          >
            Coming Soon
          </Box>
        )}
      </Card>
    </motion.div>
  );
};

// Component for FAQ Section
const FAQSection = ({ isMobile }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ background: "#fff", padding: theme.spacing(12, 0) }}>
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.fadeInUp}
        >
          <Box sx={{ mb: 8, textAlign: "center" }}>
            <Typography
              variant={isMobile ? "h3" : "h2"}
              component="h2"
              sx={{
                fontWeight: 800,
                color: "#4A3D6A",
                mb: 2,
              }}
            >
              Frequently Asked Questions
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
          </Box>
        </motion.div>

        <motion.div
          variants={animations.staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <Grid container spacing={4}>
            {faqs.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div variants={animations.fadeInUp}>
                  <Box
                    sx={{
                      marginBottom: theme.spacing(3),
                      padding: theme.spacing(3),
                      borderRadius: 8,
                      backgroundColor: "white",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{ fontWeight: 700, color: "#4A3D6A", mb: 2 }}
                    >
                      {faq.question}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

// Component for CTA Section
const CTASection = ({ isMobile }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ background: "#4A3D6A", padding: theme.spacing(12, 0) }}>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.fadeInUp}
        >
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h2"
            sx={{ fontWeight: "bold", color: "white", mb: 3 }}
          >
            Ready to Transform Your Dealership?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: isMobile ? "1rem" : "1.2rem",
              lineHeight: "1.8",
              color: "rgba(255, 255, 255, 0.8)",
              mb: 5,
              maxWidth: "700px",
              mx: "auto",
            }}
          >
            Join the dealerships nationwide who are already experiencing the
            benefits of our innovative solutions.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: gradients.secondary,
              color: "white",
              padding: theme.spacing(1.5, 4),
              borderRadius: 12,
              fontWeight: 700,
              px: 6, 
              py: 2,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                background: gradients.secondary,
                transform: "translateY(-3px)",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            Get Started Today
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

// Main PricingPage Component
const PricingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [animateStats, setAnimateStats] = useState(false);
  const [annually, setAnnually] = useState(true);
  const animationRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const statsSection = document.getElementById("stats-section");
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setAnimateStats(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <LayoutComponent>
      <PageHelmet
        title="Pricing | baxter-projects"
        description="Simple, transparent pricing."
      />
      
      <HeroSection isMobile={isMobile} />
      
      <PricingPlansSection 
        annually={annually} 
        setAnnually={setAnnually} 
        isMobile={isMobile} 
      />
      
      <FAQSection isMobile={isMobile} />
      
      <CTASection isMobile={isMobile} />
    </LayoutComponent>
  );
};

export default PricingPage;