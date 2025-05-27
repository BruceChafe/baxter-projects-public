import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
  Container,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  AccessTime as TimeIcon,
  Email as EmailIcon,
  CarCrash as CarIcon,
  CalendarMonth as CalendarIcon,
  Source as SourceIcon,
} from "@mui/icons-material";
import { supabase } from "../../../../supabase/supabaseClient";
import dayjs from "dayjs";
import { useAuth } from "../../../context/AuthContext";
import { emailTemplates } from "../email-response/templates";
import { useNavigate, useParams } from "react-router-dom";

interface Contact {
  first_name: string;
  last_name: string;
  primary_email?: string;
  mobile_phone?: string;
}

interface Lead {
  id: string;
  lead_id: string; // reference to the lead id passed in the URL
  contact: Contact;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  created_at: string;
  lead_type: string;
  lead_source: string;
  notes?: string;
  dealership?: string;
  priority?: "high" | "medium" | "low";
  claimed_by?: string;
  claimed_at?: string;
  // unattendedleads-specific fields
  notified_at?: string;
  is_escalated?: boolean;
  response_deadline?: string;
}

const LEAD_LOCK_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

// Styled components with enhanced visuals
const InfoRow = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "220px 1fr",
  gap: theme.spacing(2),
  padding: theme.spacing(1.5),
  alignItems: "center",
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  "& .MuiSvgIcon-root": {
    fontSize: 18,
    color: theme.palette.primary.main,
  },
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  marginBottom: theme.spacing(3),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  "&::after": {
    content: '""',
    flex: 1,
    height: "2px",
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    marginLeft: theme.spacing(2),
  },
}));

const LeadResponsePage: React.FC = () => {
  const theme = useTheme();
  const { user, accessContext } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lockExpiration, setLockExpiration] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { lead_id } = useParams<{ lead_id: string }>();
  const navigate = useNavigate();

  // Controlled form fields for response
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleTemplateChange = (templateId: string) => {
    const selectedTemplate = emailTemplates.find((t) => t.id === templateId);
    if (selectedTemplate) {
      // Replace placeholders with actual data
      const populatedSubject = replaceTemplateVariables(selectedTemplate.subject, lead, userData);
      const populatedMessage = replaceTemplateVariables(selectedTemplate.body, lead, userData);

      setSubject(populatedSubject);
      setMessage(populatedMessage);
    }
  };

  // Function to replace template variables with actual data
  const replaceTemplateVariables = (template: string, lead: Lead | null, userData: any) => {
    if (!lead || !lead.contact) return template;
    
    const variables = {
      dealership_name: lead.dealership || "Capital Subaru",
      vehicle_year: lead.vehicle_year || "",
      vehicle_make: lead.vehicle_make || "",
      vehicle_model: lead.vehicle_model || "",
      first_name: lead.contact.first_name || "Customer",
      agentName: userData?.first_name ? `${userData.first_name} ${userData.last_name}` : "Agent",
      dayAfterTomorrow: dayjs().add(2, "days").format("MMMM D"),
      agentPhone: userData?.phone || "555-123-4567",
      lead_type: lead.lead_type || "General Inquiry",
      lead_source: lead.lead_source || "Website",
      notes: lead.notes || "No notes available",
    };
  
    return template.replace(/{{(.*?)}}/g, (_, key) => variables[key.trim()] || "");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) {
        setError("No user found");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setUserData(data);
      }
      setLoading(false);
      console.log("User data:", userData);
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchLead = async () => {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !authUser) {
        setError("User authentication error. Please log in again.");
        setTimeout(() => navigate("/crm/unattended-leads"), 3000);
        return;
      }
  
      if (!lead_id) {
        console.log("lead ID:", lead_id);
        setTimeout(() => navigate("/crm/unattended-leads"), 3000);
        return;
      }
      console.log("Attempting to fetch lead with ID:", lead_id);
      setLoading(true);
  
      try {
        // First get the lead data from unattendedleads
        const { data: basicLeadData, error: basicLeadError } = await supabase
          .from("unattendedleads")
          .select("*")
          .eq("lead_id", lead_id)
          .maybeSingle();
  
        console.log("Basic lead data fetch result:", { data: basicLeadData, error: basicLeadError });
  
        if (basicLeadError) {
          throw new Error(`Error fetching basic lead data: ${basicLeadError.message}`);
        }
  
        if (!basicLeadData) {
          throw new Error("Lead not found in unattendedleads table");
        }
  
        // Fetch corresponding data from the leads table
        const { data: leadData, error: leadError } = await supabase
          .from("leads")
          .select("*")
          .eq("id", lead_id)
          .single();
  
        console.log("Lead data fetch result:", { data: leadData, error: leadError });
  
        if (leadError) {
          throw new Error(`Error fetching lead data: ${leadError.message}`);
        }
  
        // Fetch dealership data using dealership_id
        const { data: dealershipData, error: dealershipError } = await supabase
          .from("dealerships")
          .select("dealership_name")
          .eq("id", leadData.dealership_id)
          .single();
  
        console.log("Dealership data fetch result:", { data: dealershipData, error: dealershipError });
  
        if (dealershipError) {
          console.warn("Error fetching dealership:", dealershipError);
          // Continue execution but with default dealership name
        }
  
        // Fetch contact data using a separate query
        const { data: contactData, error: contactError } = await supabase
          .from("contacts")
          .select(`
            id,
            first_name,
            last_name,
            primary_email,
            mobile_phone
          `)
          .eq("id", basicLeadData.contact_id)
          .single();
  
        console.log("Contact data fetch result:", { data: contactData, error: contactError });
  
        if (contactError) {
          console.warn("Error fetching contact:", contactError);
          // Continue execution but with default contact data
        }
  
        // Combine the data
        const combinedLeadData = {
          ...basicLeadData,
          ...leadData, // Include data from the leads table
          dealership: dealershipData?.dealership_name || "Unknown Dealership", // Add dealership name
          contact: contactData || {
            first_name: "Unknown",
            last_name: "Unknown",
            primary_email: null,
            mobile_phone: null,
          },
        };
  
        // Process lock status
        if (basicLeadData.claimed_by && basicLeadData.claimed_at) {
          const lockExpirationTime = dayjs(basicLeadData.claimed_at)
            .add(20, "minutes")
            .valueOf();
  
          if (lockExpirationTime < Date.now()) {
            // Lock has expired, update the lock
            const { data: lockData, error: lockError } = await supabase
              .from("unattendedleads")
              .update({
                claimed_by: authUser.id,
                claimed_at: new Date().toISOString(),
              })
              .eq("lead_id", lead_id)
              .single();
  
            if (lockError) throw lockError;
  
            setLead({
              ...combinedLeadData,
              ...lockData,
            });
            setLockExpiration(dayjs().add(20, "minutes").valueOf());
          } else if (basicLeadData.claimed_by !== authUser.id) {
            setError("This lead is already claimed by another user.");
            setTimeout(() => navigate("/crm/unattended-leads"), 3000);
            return;
          } else {
            setLead(combinedLeadData);
            setLockExpiration(lockExpirationTime);
          }
        } else {
          // Lead is not locked, create a new lock
          const { data: lockData, error: lockError } = await supabase
            .from("unattendedleads")
            .update({
              claimed_by: authUser.id,
              claimed_at: new Date().toISOString(),
            })
            .eq("lead_id", lead_id)
            .single();
  
          if (lockError) throw lockError;
  
          setLead({
            ...combinedLeadData,
            ...lockData,
          });
          setLockExpiration(dayjs().add(20, "minutes").valueOf());
        }
  
        setError(null);
      } catch (error: any) {
        console.error("Error in fetchLead:", error);
        setError(error.message || "Unable to lock lead.");
        setTimeout(() => navigate("/crm/unattended-leads"), 3000);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLead();
  }, [lead_id, navigate]);
  
  // Timer for lead lock expiration
  useEffect(() => {
    if (!lockExpiration) return;
    const interval = setInterval(() => {
      const remaining = lockExpiration - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setError("Time's up! Redirecting to available leads...");
        setTimeout(() => navigate("/crm/unattended-leads"), 2000);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockExpiration, navigate]);

  useEffect(() => {
    if (lead && lead.contact) {
      handleTemplateChange("general-inquiry");
    }
  }, [lead]);

  const handleSendResponse = async () => {
    if (!lead?.contact?.primary_email) {
      alert("⚠️ Lead does not have a valid email.");
      return;
    }
  
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("User not authenticated.");
  
      const authToken = sessionData.session.access_token;
  
      console.log("User authenticated, calling Edge Function...");
  
      const requestBody = JSON.stringify({
        to: lead.contact.primary_email,
        subject,
        message,
      });
      console.log("Request Body:", requestBody);
  
      const response = await fetch(
        "https://vzsepgjmtooqdwilpscr.supabase.co/functions/v1/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            to: lead.contact.primary_email,
            subject,
            message,
          }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to send email: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Email sent successfully:", result);
  
      // Log lead activity
      const { error: activityError } = await supabase
        .from("leadactivity")
        .insert([
          {
            lead_id: lead.lead_id,
            action: "lead_responded",
            user_id: user?.id, // Make sure `user?.id` is available
            timestamp: new Date().toISOString(),
            description: `Lead responded to by ${user?.first_name} ${user?.last_name || ""}`,
          },
        ]);
  
      if (activityError) {
        console.error("Error logging lead activity:", activityError);
      }
  
      // Delete the entry from the `unattendedleads` table
      const { error: deleteError } = await supabase
        .from("unattendedleads")
        .delete()
        .eq("lead_id", lead.lead_id);
  
      if (deleteError) {
        throw new Error(`Failed to delete lead from unattendedleads: ${deleteError.message}`);
      }
  
      // Update the `lead_status` and `assigned_to` fields
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          lead_status: "IN PROCESS",
          assigned_to: user?.id,
        })
        .eq("id", lead.lead_id);
  
      if (updateError) {
        throw new Error(`Failed to update lead status: ${updateError.message}`);
      }
  
      alert("✅ Response sent successfully! Lead status updated.");
      navigate("/crm/unattended-leads"); // Redirect to the unattended leads page
    } catch (err) {
      console.error("❌ Error sending email or updating lead:", err);
      alert(`⚠️ Failed to send response or update lead: ${err.message}`);
    }
  };
  
  
  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Securing lead access...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
        <Alert
          severity="error"
          variant="filled"
          action={
            <Button
              color="inherit"
              onClick={() => navigate("/crm/unattended-leads")}
              sx={{ fontWeight: 600 }}
            >
              Back to Leads
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!lead || !timeRemaining) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading lead data...</Typography>
      </Box>
    );
  }
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.success.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const getTimerColor = () => {
    const percentage = (timeRemaining / LEAD_LOCK_DURATION) * 100;
    if (percentage > 50) return theme.palette.success.main;
    if (percentage > 25) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const lockEndTime = lockExpiration ? dayjs(lockExpiration).format("h:mm A") : "N/A";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "80vh", py: 4 }}>
      <Container maxWidth="lg" sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
        <Stack spacing={1}>
          <Box
            sx={{
              width: "100%",
              borderRadius: 2,
              p: { xs: 3, sm: 4 },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left Side: Title and ID */}
            <Stack spacing={0.5}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                Lead Response
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {lead_id}
              </Typography>
            </Stack>

            {/* Right Side: Timer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                padding: "4px 12px",
                borderRadius: "20px",
              }}
            >
              <TimeIcon sx={{ color: getTimerColor() }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: getTimerColor(),
                  minWidth: 75,
                  textAlign: "center",
                }}
              >
                {formatTime(timeRemaining)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: "100%",
              borderRadius: 2,
              pl: { xs: 3, sm: 4 },
              pr: { xs: 3, sm: 4 },
            }}
          >
            <Alert
              severity="info"
              icon={<TimeIcon />}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                "& .MuiAlert-icon": { color: "white" },
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                mb: 4,
              }}
            >
              You have acquired a lock on this lead and have until {lockEndTime}.
            </Alert>
          </Box>

          <Box
            sx={{
              width: "100%",
              borderRadius: 2,
              pl: { xs: 3, sm: 4 },
              pr: { xs: 3, sm: 4 },
            }}
          >
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Basic Information
                  </Typography>
                  <Stack spacing={1}>
                    <InfoRow>
                      <InfoLabel>Lead Name:</InfoLabel>
                      <InfoValue>
                      {lead?.contact ? `${lead.contact.first_name} ${lead.contact.last_name}` : "Unknown Contact"}
                      </InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Source:</InfoLabel>
                      <InfoValue>{lead.lead_source}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Request Type:</InfoLabel>
                      <InfoValue>{lead.lead_type}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Date Created:</InfoLabel>
                      <InfoValue>Feb 17, 2025 7:25 PM</InfoValue>
                    </InfoRow>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        Contact Information
                      </Typography>
                      <Stack spacing={1}>
                        <InfoRow>
                          <InfoLabel>Preferred Contact:</InfoLabel>
                          <InfoValue>Email</InfoValue>
                        </InfoRow>
                      </Stack>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        Vehicle Details
                      </Typography>
                      <Stack spacing={1}>
                        <InfoRow>
                          <InfoLabel>Vehicle:</InfoLabel>
                          <InfoValue>
                            {lead.vehicle_year ? `${lead.vehicle_year}` : "(No Year)"}{" "}
                            {lead.vehicle_make ? `${lead.vehicle_make}` : "(No Make)"}{" "}
                            {lead.vehicle_model ? `${lead.vehicle_model}` : "(No Model)"}
                          </InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Stock Type:</InfoLabel>
                          <InfoValue>New</InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Stock Number:</InfoLabel>
                          <InfoValue>Limited</InfoValue>
                        </InfoRow>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              width: "100%",
              borderRadius: 2,
              pl: { xs: 3, sm: 4 },
              pr: { xs: 3, sm: 4 },
            }}
          >
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
              <SectionTitle variant="h6">RESPONSE</SectionTitle>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Respond as</InputLabel>
                  <Select
                    defaultValue="bruce-chafe"
                    label="Respond as"
                    sx={{ bgcolor: "background.paper" }}
                  >
                    <MenuItem value="bruce-chafe">
                      {userData?.first_name ? `${userData.first_name}` : "N/A"}{" "}
                      {userData?.last_name ? `${userData.last_name}` : "N/A"}{" "}
                      {userData?.email ? `(${userData.email})` : "No Email"}
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
  <InputLabel>Response template</InputLabel>
  <Select
    label="Response template"
    sx={{ bgcolor: "background.paper" }}
    defaultValue="general-inquiry"
    onChange={(e) => handleTemplateChange(e.target.value as string)}
  >
    {emailTemplates.map((template) => (
      <MenuItem key={template.id} value={template.id}>
        {template.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

                <FormControl fullWidth>
                  <InputLabel>Stock type</InputLabel>
                  <Select
                    defaultValue="new"
                    label="Stock type"
                    sx={{ bgcolor: "background.paper" }}
                    disabled
                  >
                    <MenuItem value="new">New</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  sx={{ bgcolor: "background.paper" }}
                />

                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-root": {
                      fontFamily: "inherit",
                    },
                  }}
                />

                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button variant="outlined" color="primary" sx={{ px: 4 }}>
                    Preview
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ px: 4 }}
                    onClick={handleSendResponse}
                  >
                    Send Response
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default LeadResponsePage;
