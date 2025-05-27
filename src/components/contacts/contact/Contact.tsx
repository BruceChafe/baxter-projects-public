import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  MailOutline,
  Phone,
  DirectionsCar,
  History,
  Assignment,
  Build,
  Description,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Skeleton,
  Container,
  Paper,
  LinearProgress,
  Button,
} from "@mui/material";
import { supabase } from "../../../../supabase/supabaseClient";
import BasicInformation from "./BasicInformation";
import ContactLeads from "./ContactLeads";
import ContactHistory from "./ContactHistory";
import ServiceHistory from "./ServiceHistory";
import VehicleHistory from "./VehicleHistory";
import EmailDialog from "../EmailContact";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../../context/SnackbarContext";
import DetailLayout from "../../../common/DetailLayout";
import {
  DetailHeaderProps,
  ContactHistoryEntry,
  VehicleHistoryEntry,
  ServiceHistoryEntry,
} from "../../../common/types/types";
import DocumentManagement from "./DocumentManagement";
import ContactHeaderSection from "../../../common/headerSection/ContactHeaderSection";
import PhoneCallDialog from "./PhoneContact";

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  primary_email: string;
  secondary_email?: string;
  mobile_phone: string;
  home_phone?: string;
  work_phone?: string;
  street_address: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  title?: string;
  company?: string;
  department?: string;
  preferred_contactMethod?: string;
  notes?: string;
  contactHistory?: ContactHistoryEntry[];
  vehicleHistory?: VehicleHistoryEntry[];
  serviceHistory?: ServiceHistoryEntry[];
}

const TabSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}>
    <Skeleton variant="rectangular" width="100%" height={50} />
    <Skeleton variant="rectangular" width="100%" height={50} />
    <Skeleton variant="rectangular" width="100%" height={50} />
  </Box>
);

const Contact: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [contactData, setContactData] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [leads, setLeads] = useState<any[]>([]);

  const handleEmailClick = () => setEmailDialogOpen(true);
  const handlePhoneClick = () => setPhoneDialogOpen(true);
  const handleCloseEmail = () => setEmailDialogOpen(false);
  const handleClosePhone = () => setPhoneDialogOpen(false);

  // Fetch contact data from Supabase
  useEffect(() => {
    const fetchContactData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch contact details
        const { data: contactData, error: contactError } = await supabase
          .from("contacts")
          .select("*")
          .eq("id", id)
          .single();

        if (contactError) throw contactError;

        // Fetch leads associated with the contact
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("*")
          .eq("contact_id", id);

        if (leadsError) throw leadsError;

        // Combine contact data and leads
        setContactData({
          ...contactData,
          leads: leadsData || [],
        });

        console.log("Fetched Contact Data:", {
          ...contactData,
          leads: leadsData || [],
        });
      } catch (err: any) {
        console.error("Error fetching contact data:", err);
        setError(err.message || "Failed to load contact details.");
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, [id]);

  // Save updated contact data to Supabase
  const handleSave = async (updatedContact: Contact) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("contacts")
        .update(updatedContact)
        .eq("id", id);

      if (error) throw error;

      setContactData(data);
      setError(null);
      showSnackbar("Contact updated successfully!", "success");
    } catch (err: any) {
      console.error("Error saving contact:", err);
      setError(err.message || "Failed to save contact changes.");
      showSnackbar("Failed to save contact changes.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLeads = async () => {
      if (!id) return;
  
      try {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("contact_id", id);
  
        if (error) throw error;
  
        setLeads(data || []);
      } catch (err: any) {
        console.error("Error fetching leads:", err);
        setError("Failed to fetch leads.");
      }
    };
  
    fetchLeads();
  }, [id]);
  

  const headerActions = [
    {
      label: "Email",
      icon: <MailOutline />,
      onClick: handleEmailClick,
      disabled: !contactData?.primary_email,
      variant: "outlined" as "outlined",
    },
    {
      label: "Call",
      icon: <Phone />,
      onClick: handlePhoneClick,
      disabled: !contactData?.mobile_phone,
      variant: "contained" as "contained",
    },
  ];

  const tabs = [
    {
      label: "Basic Information",
      icon: <Assignment />,
      content: <BasicInformation contact={contactData} onSave={handleSave} />,
    },
    {
      label: "Leads",
      icon: <DirectionsCar />,
      content: (
        <ContactLeads
          contact={contactData}
          leads={leads || []}
          isLoading={loading}
          error={error}
        />
      ),
    },
    {
      label: "Contact History",
      icon: <History />,
      content: (
        <ContactHistory
          contact={contactData}
          history={contactData?.contactHistory || []}
          loading={loading}
          error={error}
        />
      ),
    },
    {
      label: "Vehicle History",
      icon: <DirectionsCar />,
      content: <VehicleHistory vehicles={contactData?.vehicleHistory || []} />,
    },
    {
      label: "Service History",
      icon: <Build />,
      content: <ServiceHistory services={contactData?.serviceHistory || []} />,
    },
    {
      label: "Documents",
      icon: <Description />,
      content: <DocumentManagement />,
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
          <Skeleton variant="rectangular" width="100%" height={60} />
          <TabSkeleton />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography color="error" variant="h6" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      <ContactHeaderSection
        title={`${contactData?.first_name || ""} ${contactData?.last_name || ""}`}
        subtitle={contactData?.primary_email || ""}
        additionalActions={headerActions}
      />

      <Paper
        elevation={2}
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 56,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "rgba(0,0,0,0.02)",
            "& .MuiTab-root": {
              textTransform: "none",
              minHeight: 56,
              color: "text.secondary",
              fontSize: "0.95rem",
              fontWeight: 500,
              "&.Mui-selected": {
                color: "primary.main",
                bgcolor: "background.paper",
              },
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.04)",
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                </Box>
              }
            />
          ))}
        </Tabs>
        <Box sx={{ p: 3 }}>{tabs[activeTab].content}</Box>
      </Paper>

      {contactData?.primary_email && (
        <EmailDialog
          open={emailDialogOpen}
          onClose={handleCloseEmail}
          recipientEmail={contactData.primary_email}
          contacts={[{ email: contactData.primary_email }]}
        />
      )}

      {contactData?.mobile_phone && (
        <PhoneCallDialog
          open={phoneDialogOpen}
          onClose={handleClosePhone}
          recipientPhone={contactData.mobile_phone}
          contact={contactData}
        />
      )}
    </Container>
  );
};

export default Contact;