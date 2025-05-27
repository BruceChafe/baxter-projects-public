import React, { useState, useEffect } from "react";
import { Box, Button, Alert, Paper, Tabs, Tab, Container } from "@mui/material";
import {
  Assignment,
  Phone,
  Email,
  CarCrash,
  History,
  AddTask,
  MailOutline,
  ContactMail,
  Contacts,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "../../../../context/SnackbarContext";
import { LeadData, ContactData, VehicleData, ValidationErrors } from "./types";
import LeadInformation from "./LeadInformation";
import VehicleDetails from "./LeadVehicle";
import TaskDialog from "./TaskDialog";
import EmailDialog from "../EmailLead";
import PhoneCallDialog from "./PhoneLead";
import LeadActivityHistory from "./LeadActivityHistory";
import ContactHeaderSection from "../../../../common/headerSection/ContactHeaderSection";
import BasicInformation from "../../../contacts/contact/BasicInformation";
import { supabase } from "../../../../../supabase/supabaseClient";

const LeadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (id) fetchLeadDetails();
  }, [id]);

  const fetchLeadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();
      
      if (leadError) throw leadError;

      const { data: contact, error: contactError } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", lead.contact_id)
        .single();
      
      if (contactError) throw contactError;

      setLeadData({
        id: lead.id,
        lead_source: lead.lead_source || "N/A",
        lead_status: lead.lead_status || "New",
        lead_type: lead.lead_type || "N/A",
        dealergroup_id: lead.dealergroup_id,
        dealership_id: lead.dealership_id,
        assigned_to: lead.assigned_to || "Unassigned",
        comments: lead.comments || "",
        lead_media: lead.lead_media || "N/A",
        lead_priority: lead.lead_priority || "medium",
        created_at: lead.created_at,
        updated_at: lead.updated_at,
      });

      setContactData({
        id: contact.id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        name: `${contact.first_name} ${contact.last_name}`,
        primary_email: contact.primary_email || "N/A",
        mobile_phone: contact.mobile_phone || "N/A",
        title: contact.title,
      });

      setVehicleData({
        make: lead.vehicle_make || "N/A",
        model: lead.vehicle_model || "N/A",
        year: lead.vehicle_year || "N/A",
        vin: lead.vin || "N/A",
        price: lead.price || "N/A",
        color: lead.color,
        mileage: lead.mileage,
        condition: lead.condition,
      });
    } catch (err: any) {
      setError("Failed to fetch lead details.");
      showSnackbar("Error loading lead details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (task: any) => {
    if (!id) {
      showSnackbar("Lead ID is missing", "error");
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .insert([{ ...task, lead_id: id }]);

      if (error) throw error;

      showSnackbar("Task created successfully", "success");
      setIsTaskDialogOpen(false);
      fetchLeadDetails();
    } catch (error) {
      console.error("Error saving task:", error);
      showSnackbar("Failed to create task", "error");
    }
  };

  const getStatusColor = (lead_status: string) => {
    switch (lead_status.toLowerCase()) {
      case "new":
        return "info";
      case "active":
        return "success";
      case "closed":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const headerActions = {
    status: leadData
      ? { label: leadData.lead_status, color: getStatusColor(leadData.lead_status) }
      : undefined,
    metadata: [
      { label: "Source", value: leadData?.lead_source || "N/A" },
      { label: "Assigned", value: leadData?.assigned_to || "Unassigned" },
    ],
    actions: [
      {
        label: "Email",
        icon: <MailOutline />,
        onClick: () => setEmailDialogOpen(true),
        disabled: !contactData?.primary_email,
        variant: "outlined" as "outlined",
      },
      {
        label: "Call",
        icon: <Phone />,
        onClick: () => setPhoneDialogOpen(true),
        disabled: !contactData?.mobile_phone || contactData?.mobile_phone === "N/A",
        variant: "contained",
      },
      {
        label: "New Task",
        icon: <AddTask />,
        onClick: () => setIsTaskDialogOpen(true),
        variant: "contained",
      },
    ],
  };

  const tabs = [
    {
      label: "Lead Information",
      icon: <Assignment />,
      content: <LeadInformation leadData={leadData} contactData={contactData} />,
    },
    {
      label: "Contact Information",
      icon: <Contacts />,
      content: (
        <BasicInformation
          contact={contactData}
          onSave={(updatedContact) => {
            setContactData(updatedContact);
            showSnackbar("Contact information updated successfully", "success");
          }}
        />
      ),
    },
    {
      label: "Vehicle Details",
      icon: <CarCrash />,
      content: <VehicleDetails vehicleData={vehicleData} />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      <ContactHeaderSection
        title={contactData?.name}
        subtitle={contactData?.primary_email || ""}
        additionalActions={headerActions.actions}
      />

      <Paper elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable">
          {tabs.map((tab, index) => (
            <Tab key={index} label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{tab.icon}{tab.label}</Box>} />
          ))}
        </Tabs>
        <Box sx={{ p: 3 }}>{tabs[activeTab].content}</Box>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <LeadActivityHistory />
        </Box>
      </Paper>

      <TaskDialog open={isTaskDialogOpen} onClose={() => setIsTaskDialogOpen(false)} onSave={handleSaveTask} />

      {contactData?.primary_email && <EmailDialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} recipientEmail={contactData.primary_email} />}
      {contactData?.mobile_phone && <PhoneCallDialog open={phoneDialogOpen} onClose={() => setPhoneDialogOpen(false)} recipientPhone={contactData.mobile_phone} />}
    </Container>
  );
};

export default LeadPage;
