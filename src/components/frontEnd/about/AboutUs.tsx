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
  Avatar,
  Button,
} from "@mui/material";
import {
  VerifiedUser,
  NoteAdd,
  Timeline,
  EmojiEvents,
  Architecture,
  Psychology,
  Public,
  Handshake,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import HeroSectionComponent from "../landingPages/HeroSectionComponent";
import LayoutComponent from "../landingPages/LayoutComponent";
import PageHelmet from "../../shared/PageHelmet";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
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

// Styled components
const MotionContainer = styled(motion.div)({
  width: "100%",
});

const ValueCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: 16,
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0, 0, 0, 0.1)",
  },
}));

const TimelineCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(3),
  overflow: "visible",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    width: 3,
    backgroundColor: theme.palette.primary.main,
    top: "100%",
    bottom: -24,
    left: 24,
    zIndex: 0,
  },
  "&:last-child::before": {
    display: "none",
  },
}));

const TeamMemberCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  overflow: "hidden",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-10px)",
    boxShadow: "0 12px 20px rgba(0, 0, 0, 0.15)",
  },
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  height: "100%",
  position: "relative",
  overflow: "visible",
  "&::before": {
    content: '"""',
    position: "absolute",
    fontSize: "4rem",
    color: theme.palette.primary.light,
    opacity: 0.2,
    top: -10,
    left: 20,
  },
}));

const HeroBackground = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  overflow: "hidden",
});

const Circle = styled(Box)(({ theme, size, top, left, opacity = 0.1 }) => ({
  position: "absolute",
  width: size,
  height: size,
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.2)",
  filter: "blur(60px)",
  top,
  left,
  opacity,
}));

// Main App Component
const AboutUsPage = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:960px)");
  const [activeTab, setActiveTab] = useState(0);
  const [animateStats, setAnimateStats] = useState(false);
  const animationRef = useRef<HTMLDivElement>(null);

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

  const heroGradient =
    "linear-gradient(135deg, #4A3D6A 0%, #6C5A91 80%, #845DA4 100%)";

  // Team members data
  const teamMembers = [
    {
      name: "Bruce Chafe",
      role: "CEO & Founder",
    //   bio: "Strategic visionary with 15+ years in tech innovation.",
    },
  ];

  // History milestone data
  const milestones = [
    {
      year: "2018",
      title: "The Beginning",
      description:
        "Founded with a vision to simplify business processes through elegant technology solutions.",
      icon: <NoteAdd color="primary" />,
    },
    {
      year: "2019",
      title: "First Major Client",
      description:
        "Partnered with a Fortune 500 company, validating our approach and solution.",
      icon: <Handshake color="primary" />,
    },
    {
      year: "2020",
      title: "Product Expansion",
      description:
        "Launched our flagship product suite, addressing key industry pain points.",
      icon: <Timeline color="primary" />,
    },
    {
      year: "2022",
      title: "Global Reach",
      description:
        "Expanded operations to serve clients across three continents.",
      icon: <Public color="primary" />,
    },
    {
      year: "2024",
      title: "Innovation Award",
      description:
        "Recognized as industry leaders for our innovative approach to business solutions.",
      icon: <EmojiEvents color="primary" />,
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      quote:
        "baxter-projects transformed our operations with their intuitive solutions. The impact on our efficiency was immediate and substantial.",
      author: "Sarah Johnson",
      position: "COO, TechForward Inc.",
    },
    {
      quote:
        "Their team's dedication to excellence and customer support sets them apart. We consider them true partners in our business growth.",
      author: "David Martinez",
      position: "Director of Operations, GlobalReach Ltd.",
    },
    {
      quote:
        "The attention to detail and thoughtful design of their products demonstrates a deep understanding of the challenges businesses face today.",
      author: "Lisa Chen",
      position: "VP of Technology, Innovate Corp.",
    },
  ];

  return (
    <LayoutComponent>
      <PageHelmet
        title="About Us | baxter-projects"
        description="Learn more about the mission, values, and team behind baxter-projects."
      />
      {/* Hero Section */}
      <Box
        sx={{
          background: heroGradient,
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
        <HeroBackground ref={animationRef}>
          <Circle
            className="animated-circle"
            size="500px"
            top="-100px"
            left="60%"
            opacity={0.15}
            sx={{ transition: "transform 10s ease-in-out" }}
          />
          <Circle
            className="animated-circle"
            size="400px"
            top="60%"
            left="-100px"
            opacity={0.1}
            sx={{ transition: "transform 8s ease-in-out" }}
          />
          <Circle
            className="animated-circle"
            size="300px"
            top="70%"
            left="70%"
            opacity={0.08}
            sx={{ transition: "transform 12s ease-in-out" }}
          />

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
        </HeroBackground>
        <Container maxWidth="lg">
          <MotionContainer
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
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
                  About Us
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
  Built to fix what others overlook — simple, connected tools that make dealership systems actually work.
</Typography>

              </Grid>
            </Grid>
          </MotionContainer>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ backgroundColor: "#ffffff", py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
{/* Our Story */}
<MotionContainer
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
  variants={staggerContainer}
>
  <Grid container spacing={6} alignItems="center" sx={{ mb: 10 }}>
    <Grid item xs={12} md={5}>
      <motion.div variants={fadeInLeft}>
        <Typography
          variant="overline"
          sx={{
            color: "primary.main",
            fontWeight: 600,
            letterSpacing: 1.5,
          }}
        >
          BUILT FROM FRUSTRATION
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
          Our Story
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, fontSize: "1.1rem", lineHeight: 1.7 }}
        >
          The automotive industry is packed with outdated systems that barely
          talk to each other. Managing them feels like duct taping
          a dozen legacy programs just to keep the lights on.
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, fontSize: "1.1rem", lineHeight: 1.7 }}
        >
          This platform started as a final project for GetCoding, but it’s become
          much more. It's a frustration-fueled toolkit designed to bring modern,
          connected solutions to dealerships — starting with user management,
          Stripe-integrated subscriptions, and visitor tracking.
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, fontSize: "1.1rem", lineHeight: 1.7 }}
        >
          It’s built to evolve. CRM and lead management features are already in
          the works — all fully integrated. This isn’t just another software
          stack. It’s the system I wish we had.
        </Typography>
      </motion.div>
    </Grid>
    <Grid item xs={12} md={7}>
      <motion.div variants={fadeInRight}>
        <Box sx={{ position: "relative" }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=1600&q=80"
            alt="Built with purpose"
            sx={{
              width: "100%",
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
            }}
          />

          <Card
            sx={{
              position: { xs: "relative", md: "absolute" },
              bottom: { md: -40 },
              left: { md: -40 },
              width: { xs: "100%", md: "40%" },
              borderRadius: 3,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              mt: { xs: -5, md: 0 },
              zIndex: 2,
              backgroundColor: "primary.main",
              color: "white",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                A Better Way Forward
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Purpose-built by someone who lives the pain points — and decided
                to do something about it.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </motion.div>
    </Grid>
  </Grid>
</MotionContainer>



          {/* Our Values */}
          <MotionContainer
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
  variants={staggerContainer}
  sx={{ mb: 10 }}
>
  <Box sx={{ textAlign: "center", mb: 6 }}>
    <motion.div variants={fadeInUp}>
      <Typography
        variant="overline"
        sx={{
          color: "primary.main",
          fontWeight: 600,
          letterSpacing: 1.5,
        }}
      >
        WHAT DRIVES US
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        Core Values
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          mb: 4,
          fontSize: "1.1rem",
          maxWidth: 800,
          mx: "auto",
        }}
      >
        This project wasn’t built in a boardroom — it was built out of necessity.
        These values guide how we build, how we iterate, and how we serve real
        people solving real problems in dealerships every day.
      </Typography>
    </motion.div>
  </Box>

  <Grid container spacing={4}>
    <Grid item xs={12} md={4}>
      <motion.div variants={fadeInUp}>
        <ValueCard elevation={2}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Avatar
              sx={{
                bgcolor: "primary.light",
                width: 70,
                height: 70,
                mb: 2,
                mx: "auto",
              }}
            >
              <Architecture fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Builder Mentality
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We don’t wait for perfect tools — we build what’s missing. Every
              feature starts with a real pain point and ends with a real result.
              Iteration and utility come first.
            </Typography>
          </CardContent>
        </ValueCard>
      </motion.div>
    </Grid>

    <Grid item xs={12} md={4}>
      <motion.div variants={fadeInUp}>
        <ValueCard elevation={2}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Avatar
              sx={{
                bgcolor: "secondary.light",
                width: 70,
                height: 70,
                mb: 2,
                mx: "auto",
              }}
            >
              <VerifiedUser fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Straightforward
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Dealership systems are complicated enough. We believe in honest
              workflows, transparent pricing, and zero fluff. If it doesn’t
              solve a problem, it doesn’t ship.
            </Typography>
          </CardContent>
        </ValueCard>
      </motion.div>
    </Grid>

    <Grid item xs={12} md={4}>
      <motion.div variants={fadeInUp}>
        <ValueCard elevation={2}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Avatar
              sx={{
                bgcolor: "error.light",
                width: 70,
                height: 70,
                mb: 2,
                mx: "auto",
              }}
            >
              <Psychology fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Relentless Improvement
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This platform will never be “done.” We believe the best tools are
              the ones that grow with you — constantly tested, refined, and
              rebuilt to meet the moment.
            </Typography>
          </CardContent>
        </ValueCard>
      </motion.div>
    </Grid>
  </Grid>
</MotionContainer>


          {/* Stats Section */}
          <MotionContainer
  id="stats-section"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  variants={staggerContainer}
  sx={{ mb: 10 }}
>
  <Box
    sx={{
      backgroundColor: "primary.dark",
      borderRadius: 4,
      py: 8,
      px: { xs: 3, md: 8 },
      color: "white",
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
          "radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 2px)",
        backgroundSize: "30px 30px",
        pointerEvents: "none",
      },
    }}
  >
    <motion.div variants={fadeInUp}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: 6,
          textAlign: "center",
          color: "white",
        }}
      >
        Our Impact (Sort Of)
      </Typography>
    </motion.div>

    <Grid container spacing={4}>
      <Grid item xs={12} sm={6} md={3}>
        <motion.div
          variants={fadeInUp}
          animate={animateStats ? { scale: [0.8, 1], opacity: [0, 1] } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
              ∞
            </Typography>
            <Typography variant="body1" color="white">
              Tabs Open During Debugging
            </Typography>
          </Box>
        </motion.div>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <motion.div
          variants={fadeInUp}
          animate={
            animateStats ? { scale: [0.8, 1], opacity: [0, 1] } : {}
          }
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
              99%
            </Typography>
            <Typography variant="body1" color="white">
              Less Clunky Than Legacy Systems
            </Typography>
          </Box>
        </motion.div>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <motion.div
          variants={fadeInUp}
          animate={
            animateStats ? { scale: [0.8, 1], opacity: [0, 1] } : {}
          }
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
              3
            </Typography>
            <Typography variant="body1" color="white">
              Modules That Actually Talk to Each Other
            </Typography>
          </Box>
        </motion.div>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <motion.div
          variants={fadeInUp}
          animate={animateStats ? { scale: [0.8, 1], opacity: [0, 1] } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
              100%
            </Typography>
            <Typography variant="body1" color="white">
              Built with Frustration & Love
            </Typography>
          </Box>
        </motion.div>
      </Grid>
    </Grid>
  </Box>
</MotionContainer>

          {/* Testimonials */}
          {/* <MotionContainer
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            sx={{ mb: 10 }}
          >
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <motion.div variants={fadeInUp}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    letterSpacing: 1.5,
                  }}
                >
                  CLIENT FEEDBACK
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                  What Our Clients Say
                </Typography>
              </motion.div>
            </Box>

            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div variants={fadeInUp}>
                    <TestimonialCard elevation={2}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontStyle: "italic",
                            mb: 3,
                            fontSize: "1.05rem",
                            lineHeight: 1.7,
                          }}
                        >
                          "{testimonial.quote}"
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              bgcolor: "primary.light",
                              mr: 2,
                            }}
                          >
                            {testimonial.author.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600 }}
                            >
                              {testimonial.author}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {testimonial.position}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </TestimonialCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </MotionContainer> */}
        </Container>
      </Box>
    </LayoutComponent>
  );
};

export default AboutUsPage;
