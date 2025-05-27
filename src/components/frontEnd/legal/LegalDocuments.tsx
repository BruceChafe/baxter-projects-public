import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Box, Typography, Tabs, Tab, Paper, Divider, useMediaQuery } from "@mui/material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import LayoutComponent from "../landingPages/LayoutComponent";
import HeroSectionComponent from "../landingPages/HeroSectionComponent";

const MotionContainer = styled(motion.div)({
    width: "100%",
});

const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            {title}
        </Typography>
        {children}
    </Box>
);

const LegalDocumentsPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const location = useLocation();
    const isMobile = useMediaQuery("(max-width:600px)");
    const [loading, setLoading] = useState(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setLoading(true);
        setActiveTab(newValue);

        if (newValue === 0) {
            window.history.replaceState(null, "", "#privacy");
            document.title = "Privacy Policy | baxter-projects";
        } else if (newValue === 1) {
            window.history.replaceState(null, "", "#terms");
            document.title = "Terms of Service | baxter-projects";
        }

        window.scrollTo({ top: 0, behavior: "smooth" });

        // Simulate a short loading period
        setTimeout(() => {
            setLoading(false);
        }, 300);
    };


    useEffect(() => {
        if (location.hash === "#privacy") {
            setActiveTab(0);
            document.title = "Privacy Policy | baxter-projects";
        } else if (location.hash === "#terms") {
            setActiveTab(1);
            document.title = "Terms of Service | baxter-projects";
        } else {
            document.title = "Legal Documents | baxter-projects";
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [location.hash]);

    return (
        <>
            <LayoutComponent forceDarkText>
                <MotionContainer
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
                >
                    <Box sx={{ py: { xs: 8, md: 12 } }}>
                        <Container maxWidth="lg">
                            <Box sx={{ textAlign: "center", mb: 8 }}>
                                <Typography variant={isMobile ? "h3" : "h2"} sx={{ fontWeight: 800, color: "#4A3D6A" }}>
                                    Legal Documents
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
                                <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary" sx={{ fontWeight: 400 }}>
                                    Our commitment to transparency and your privacy.
                                </Typography>
                            </Box>

                            <MotionContainer
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.1 }}
                            >
                                <Paper elevation={3} sx={{ mb: 6, borderRadius: 4 }}>
                                    <Tabs
                                        value={activeTab}
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
                                        <Tab label="Privacy Policy" />
                                        <Tab label="Terms of Service" />
                                    </Tabs>
                                </Paper>

                                {loading ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Typography variant="h6" color="text.secondary">
                                                Loading...
                                            </Typography>
                                        </motion.div>
                                    </Box>
                                ) : (
                                    <>
                                        {activeTab === 0 && (
                                            <Paper elevation={2} sx={{ p: 4, borderRadius: 4, mb: 6, background: "rgba(255,255,255,0.95)" }}>
                                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                                                    Privacy Policy
                                                </Typography>
                                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 4 }}>
                                                    Last Updated: April 28, 2025
                                                </Typography>
                                                <Divider sx={{ mb: 4 }} />

                                                <Section title="1. Introduction">
                                                    <Typography paragraph>
                                                        This Privacy Policy describes how we collect, use, process, and disclose your information, including personal information, in conjunction with your access to and use of our service.
                                                    </Typography>
                                                </Section>

                                                <Section title="2. Information We Collect">
                                                    <Typography paragraph>We collect several types of information from and about users of our website/app:</Typography>
                                                    <Typography component="ul" sx={{ pl: 4 }}>
                                                        <Typography component="li">Personal identifiers (name, email, phone)</Typography>
                                                        <Typography component="li">Usage data and device information</Typography>
                                                        <Typography component="li">Cookies and similar technologies</Typography>
                                                    </Typography>
                                                </Section>

                                                <Section title="3. How We Use Your Information">
                                                    <Typography component="ul" sx={{ pl: 4 }}>
                                                        <Typography component="li">Provide, maintain, and improve our services</Typography>
                                                        <Typography component="li">Communicate with you</Typography>
                                                        <Typography component="li">Comply with legal obligations</Typography>
                                                    </Typography>
                                                </Section>

                                                <Section title="4. Contact Us">
                                                    <Typography paragraph>
                                                        Questions? Contact us at <strong>privacy@baxter-projects.com</strong>
                                                    </Typography>
                                                </Section>
                                            </Paper>
                                        )}

                                        {activeTab === 1 && (
                                            <Paper elevation={2} sx={{ p: 4, borderRadius: 4, mb: 6, background: "rgba(255,255,255,0.95)" }}>
                                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                                                    Terms of Service
                                                </Typography>
                                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 4 }}>
                                                    Last Updated: April 28, 2025
                                                </Typography>
                                                <Divider sx={{ mb: 4 }} />

                                                <Section title="1. Agreement to Terms">
                                                    <Typography paragraph>By accessing our website/app, you agree to be bound by these Terms of Service.</Typography>
                                                </Section>

                                                <Section title="2. User Accounts">
                                                    <Typography paragraph>When you create an account, you must provide accurate and complete information.</Typography>
                                                </Section>

                                                <Section title="3. Intellectual Property">
                                                    <Typography paragraph>All content remains the exclusive property of baxter-projects and its licensors.</Typography>
                                                </Section>

                                                <Section title="4. Contact Us">
                                                    <Typography paragraph>
                                                        Questions? Contact us at <strong>privacy@baxter-projects.com</strong>
                                                    </Typography>
                                                </Section>
                                            </Paper>
                                        )}
                                    </>
                                )}
                            </MotionContainer>
                        </Container>
                    </Box>
                </MotionContainer>
            </LayoutComponent>
        </>
    );
};

export default LegalDocumentsPage;
