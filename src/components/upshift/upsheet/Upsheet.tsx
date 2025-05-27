import React, { useEffect, useState } from "react";
import { Container, Box, Paper, alpha } from "@mui/material";
import { useTheme } from "@mui/material";

import { useAuth } from "../../../context/AuthContext";
import { useSnackbar } from "../../../context/SnackbarContext";

// Hooks
import { useDealerGroups } from "../../../hooks/general/useDealerGroups";
import { useUserDealerships } from "../../../hooks/general/useUserDealerships";
import { useCurrentDealerGroup } from "../../../hooks/general/useCurrentDealerGroup";
import useSearchDuplicates from "../../../hooks/contacts/useSearchDuplicates";
import useCreateContact from "../../../hooks/contacts/useCreateContact";
import useSubmitVisit from "../../../hooks/visits/useSubmitVisits";
import useSalesConsultants from "../../../hooks/general/useSalesConsultants";

// Components
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

// Styles
import {
  containerStyles,
  headerStyles,
  inputStyles,
  buttonStyles,
  sectionStyles,
} from "./UpsheetStyles";
import TrialExpired from "../../admin/billing/TrialExpired";

const Upsheet = () => {
  const theme = useTheme();
  const { user, accessContext } = useAuth();
  const { showSnackbar } = useSnackbar();

  // 🔒 GATE: Block access if trial has expired
  if (accessContext && !accessContext.trialing && !accessContext.active) {
    return <TrialExpired />;
  }

  // State
  const [selectedDealership, setSelectedDealership] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeStep, setActiveStep] = useState(0);

  // Hooks
  const { data: dealerGroups, loading: loadingDealerGroups } =
    useDealerGroups();

  const dealergroup_id = useCurrentDealerGroup();

  const {
    data: { dealerships: userDealerships = [], primaryDealership } = {},
    loading: loadingDealerships,
  } = useUserDealerships(user?.id);

  const { salespeople, loading: loadingSalespeople } =
    useSalesConsultants(selectedDealership);

  const [formData, setFormData] = useState<any>({
    contact_id: "",
    first_name: "",
    last_name: "",
    primary_email: "",
    mobile_phone: "",
    department: "",
    leadSource: "",
    dealership_id: "",
    salesConsultant: "",
    driversLicenseId: "",
    vehicleOfInterest: "",
    salesType: "",
    notes: "",
    visitReason: "",
    dealergroup_id: null,
  });

  const [touchedFields, setTouchedFields] = useState<any>({
    first_name: false,
    last_name: false,
    primary_email: false,
    mobile_phone: false,
  });

  const { searchDuplicates, duplicates, loadingDuplicates } =
    useSearchDuplicates();
  const { createContact } = useCreateContact();
  const { submitVisit } = useSubmitVisit();

  // useEffects
  useEffect(() => {
    if (dealergroup_id) {
      setFormData((prev) => ({
        ...prev,
        dealergroup_id,
      }));
    }
  }, [dealergroup_id]);

  useEffect(() => {
    if (primaryDealership) {
      setSelectedDealership(primaryDealership);
    }
  }, [primaryDealership]);

  useEffect(() => {
  if (selectedDealership && !formData.dealership_id) {
    setFormData((prev) => ({
      ...prev,
      dealership_id: selectedDealership,
    }));
  }
}, [selectedDealership]);

  // Handlers
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{0,4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ""}`;
    }
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "mobile_phone") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, mobile_phone: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleDealershipChange = (e: any) => {
    const id: string =
      typeof e === "string"
        ? e
        : e?.target?.value !== undefined
        ? e.target.value
        : "";
  
    setSelectedDealership(id);
    setFormData(prev => ({ ...prev, dealership_id: id }));
  };
  

  const handleSearchDuplicates = async () => {
    const required = ["first_name", "last_name"];
    setTouchedFields(prev => ({
      ...prev,
      ...Object.fromEntries(required.map(f => [f, true])),
    }));
  
    const phoneDigits = formData.mobile_phone.replace(/\D/g, "");
    const isValid =
      formData.first_name.trim() !== "" &&
      formData.last_name.trim() !== "";
  
    if (!isValid) {
      showSnackbar("Please complete all required fields before continuing.", "error");
      return;
    }
  
    await searchDuplicates({
      first_name: formData.first_name,
      last_name: formData.last_name,
      primary_email: formData.primary_email,
      mobile_phone: formData.mobile_phone,
      dealership_id: formData.dealership_id || null,
      dealergroup_id: dealergroup_id || null,
    });
    handleNext();
  };
  

  const handleSelectContact = (contact: any) => {
    setFormData((prev) => ({
      ...prev,
      contact_id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      primary_email: contact.primary_email,
      mobile_phone: contact.mobile_phone,
      dealership_id: contact.dealership_id || selectedDealership,
    }));
    handleNext();
  };

  const handleCreateContact = async () => {
    const requiredFields = ["first_name", "last_name", "mobile_phone"];

    // Mark all required fields as touched
    setTouchedFields((prev: any) => ({
      ...prev,
      ...Object.fromEntries(requiredFields.map((field) => [field, true])),
    }));

    const phoneDigits = formData.mobile_phone.replace(/\D/g, "");

    const isValid =
      formData.first_name.trim() !== "" &&
      formData.last_name.trim() !== "" &&
      phoneDigits.length === 10;

    if (!isValid) {
      showSnackbar(
        "Please complete all required fields before continuing.",
        "error"
      );
      return;
    }

    const newContact = await createContact(formData, dealergroup_id);
    if (newContact) {
      setFormData((prev) => ({
        ...prev,
        contact_id: newContact.id,
        ...newContact,
      }));
      handleNext();
    }
  };

const handleSubmit = async () => {
  const required = ["dealership_id"];

  // Mark required fields as touched
  setTouchedFields(prev => ({
    ...prev,
    ...Object.fromEntries(required.map(f => [f, true])),
  }));

  // Check for missing/invalid values
  const missingFields = required.filter(field => {
    const value = formData[field];
    return typeof value === "string" ? value.trim() === "" : value == null;
  });

  if (missingFields.length > 0) {
    console.warn("Form submission blocked. Missing or invalid fields:", {
      missingFields,
      formDataSnapshot: { ...formData },
    });

    showSnackbar("Please fill out all required fields before submitting.", "error");
    return;
  }

  setLoading(true);
  try {
    await submitVisit(formData, user.id);
    setActiveStep(0);
  } catch (err) {
    console.error("Submit error:", err);
  } finally {
    setLoading(false);
  }
};

  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Shared Props
  const sharedProps = {
    formData,
    setFormData,
    user,
    dealerGroups,
    userDealerships,
    // dealerships,
    selectedDealership,
    handleInputChange,
    handleDealershipChange,
    handleBack,
    handleNext,
    buttonStyles,
    inputStyles,
    sectionStyles,
    headerStyles,
    loading,
  };

  return (
<Box
  sx={{
    minHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  }}
>
       <Container maxWidth="lg">
        <Paper sx={containerStyles} elevation={0}>
          {activeStep === 0 && (
            <Step1
              {...sharedProps}
              touchedFields={touchedFields}
              setTouchedFields={setTouchedFields}
              handleSearchDuplicates={handleSearchDuplicates}
              selected_dealergroup_id={dealergroup_id}
              setSelectedDealerGroupId={() => {}}
              isValidEmail={isValidEmail}
            />
          )}

          {activeStep === 1 && (
            <Step2
              {...sharedProps}
              duplicates={duplicates}
              loadingDuplicates={loadingDuplicates}
              handleSelectContact={handleSelectContact}
              handleCreateContact={handleCreateContact}
              touchedFields={touchedFields}
              setTouchedFields={setTouchedFields}
              isValidEmail={isValidEmail}
            />
          )}

          {activeStep === 2 && (
            <Step3
              {...sharedProps}
              salespeople={salespeople}
              loadingSalespeople={loadingSalespeople}
              handleSubmit={handleSubmit}
              selectedDealershipName={
                userDealerships.find(
                  (d) => d.dealership_id === selectedDealership
                )?.dealership_name || "Selected Dealership"
              }
            />
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Upsheet;
