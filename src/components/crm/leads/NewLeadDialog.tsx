import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Typography,
  TextField,
  Divider,
  Button,
  useTheme,
  IconButton,
  useMediaQuery,
  Card,
  FormGroup,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormHelperText,
  alpha
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSnackbar } from "../../../context/SnackbarContext";
import { useAuth } from "../../../context/AuthContext";
import { Dealership } from "../../../types";
import axiosInstance from "../../../axios";
import { LEAD_SOURCES, LEAD_TYPES, LEAD_STATUSES, LEAD_MEDIA } from "../../../common/lists/leadLists";
import { supabase } from "../../../../supabase/supabaseClient";

const vehicleMakesList = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet",
  "Chrysler", "Dodge", "Fiat", "Ford", "Genesis", "GMC",
  "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia",
  "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz",
  "Mini", "Mitsubishi", "Nissan", "Ram", "Subaru", "Tesla",
  "Toyota", "Volkswagen", "Volvo"
];

const currentYear = new Date().getFullYear();
const startYear = 2010;
const vehicleYearList = Array.from({ length: currentYear - startYear + 1 }, (_, i) => (startYear + i).toString()).reverse();

const contactValidationSchema = Yup.object({
  first_name: Yup.string()
    .required('First Name is required')
    .min(2, 'First Name must be at least 2 characters'),
  last_name: Yup.string()
    .required('Last Name is required')
    .min(2, 'Last Name must be at least 2 characters'),
  primary_email: Yup.string()
    .email('Invalid email format')
    .optional(),
  mobile_phone: Yup.string()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number')
    .optional(),
});

const addContactValidationSchema = Yup.object({
  first_name: Yup.string()
    .required('First Name is required')
    .min(2, 'First Name must be at least 2 characters'),
  last_name: Yup.string()
    .required('Last Name is required')
    .min(2, 'Last Name must be at least 2 characters'),
  primary_email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  mobile_phone: Yup.string()
    .required('Mobile Phone is required')
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number'),
  preferred_contact: Yup.array()
    .of(Yup.string().oneOf(['Phone', 'SMS', 'Email']))
    .min(1, 'Select at least one preferred contact method')
});

const leadValidationSchema = Yup.object({
  dealership_id: Yup.number()
    .positive('Please select a dealership')
    .required('Dealership is required'),
  leadSource: Yup.string()
    .required('Lead Source is required'),
  leadStatus: Yup.string()
    .required('Lead Status is required'),
});

interface LeadData {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  budget: string;
  leadSource: string;
  leadStatus: string;
  comments: string;
  dealership_id: number;
}

interface DuplicateContact {
  id: string;
  first_name: string;
  last_name: string;
  primary_email: string;
  mobile_phone: string;
}

interface NewLeadDialogProps {
  open: boolean;
  onClose: () => void;
  dealerships: Dealership[];
}

const NHTSA_API_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/GetCanadianVehicleSpecifications/";

const NewLeadDialog: React.FC<NewLeadDialogProps> = ({
  open,
  onClose,
}) => {
  const { user, accessContext } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showSnackbar } = useSnackbar();

  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [selected_dealergroup_id, setSelectedDealerGroupId] = useState<number | null>(null);
  const [selected_dealership, setSelectedDealership] = useState<Dealership | null>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [models, setModels] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<DuplicateContact | null>(null);
  const [isCreatingNewContact, setIsCreatingNewContact] = useState(false);

  const handleLeadSubmit = async (values: LeadData) => {
    try {
      setLoading(true);
  
      const leadPayload = {
        ...values,
        contact_id: selectedContact?.id,
        dealergroup_id: user?.dealergroup_id,
      };
  
      const { data, error } = await supabase
        .from("leads")
        .insert([leadPayload])
        .select();
  
      if (error) throw error;
  
      showSnackbar("Lead created successfully!", "success");
      onClose();
    } catch (error) {
      console.error("Error creating lead:", error);
      showSnackbar("Error creating lead. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const contactFormik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      primary_email: '',
      mobile_phone: '',
    },
    validationSchema: contactValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await searchDuplicates(values);
      } catch (error) {
        console.error("Error searching for duplicates:", error);
        showSnackbar("Error searching for contacts. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    },
  });

  const leadFormik = useFormik({
    initialValues: {
      dealership_id: 0,
      leadSource: '',
      leadStatus: 'New',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      tradeIn: false,
      tradeInDetails: '',
      budget: '',
      comments: '',
    },
    validationSchema: leadValidationSchema,
    onSubmit: handleLeadSubmit,
  });

  // Fetch the dealergroup_id for the authenticated user
  useEffect(() => {
    const fetchDealerGroupId = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("users")
            .select("dealergroup_id")
            .eq("id", user.id)
            .single();

          if (error) {
            throw error;
          }

          console.log("Dealer Group ID:", data.dealergroup_id); // Log the dealergroup_id
          setSelectedDealerGroupId(data.dealergroup_id);
        } catch (error) {
          console.error("Error fetching dealergroup_id:", error);
          setError("Failed to fetch dealer group information.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDealerGroupId();
  }, [user]);

  // Fetch dealerships for the selected dealer group
  useEffect(() => {
    if (selected_dealergroup_id) {
      fetchDealerships();
    }
  }, [selected_dealergroup_id]);

  const fetchDealerships = async () => {
    if (!selected_dealergroup_id) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dealerships")
        .select("*")
        .eq("dealergroup_id", selected_dealergroup_id);

      if (error) {
        throw error;
      }

      console.log("Dealerships:", data); // Log the dealerships
      setDealerships(data || []);
    } catch (error) {
      console.error("Error fetching dealerships:", error);
      setError("Failed to load dealerships.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeadInputChange = (field: keyof LeadData, value: string | number) => {

    if (field === 'vehicleMake' || field === 'vehicleYear') {
      setModels([]);
      leadFormik.setFieldValue('vehicleModel', '');
    }

    leadFormik.setFieldValue(field, value);
  };

  const searchDuplicates = async (values: any) => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .or(`first_name.eq.${values.first_name},last_name.eq.${values.last_name},primary_email.eq.${values.primary_email},mobile_phone.eq.${values.mobile_phone}`);
  
      if (error) throw error;
  
      setDuplicates(data || []);
      setStep(2);
    } catch (error) {
      console.error("Error searching for duplicates:", error);
      showSnackbar("Error searching for contacts. Please try again.", "error");
    }
  };


  const handlepreferred_contactChange = (method: string) => {
    const currentPreferred = newContactFormik.values.preferred_contact;
    const newPreferred = currentPreferred.includes(method)
      ? currentPreferred.filter(m => m !== method)
      : [...currentPreferred, method];

    newContactFormik.setFieldValue('preferred_contact', newPreferred);
  };

  const handleCreateNewContact = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("contacts")
        .insert([newContactFormik.values])
        .select();
  
      if (error) throw error;
  
      if (data && data[0]) {
        setSelectedContact(data[0]);
        setStep(3);
      } else {
        showSnackbar("Failed to create contact. Invalid response.", "error");
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      showSnackbar("Error creating contact. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = useMemo(() => async (year: string, make: string) => {
    if (!year || !make) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${NHTSA_API_URL}?Year=${year}&Make=${make}&format=json`);

      const modelData: string[] = response.data.Results
        ? response.data.Results.reduce((acc: string[], result: any) => {
          try {
            const extractedModels = [
              result.Specs?.find((spec: any) => spec.Name === "Model")?.Value,
              result.Model,
              result.model,
              result.name,
              result.Model_Name,
              result.ModelName
            ].filter(Boolean);

            if (extractedModels.length > 0) {
              acc.push(...extractedModels);
            } else {
              console.warn('No model found in result:', result);
            }
          } catch (extractionError) {
            console.error('Model extraction error:', extractionError);
          }
          return acc;
        }, [])
        : [];

      const uniqueModels = [...new Set(modelData)]
        .filter(model =>
          model !== null &&
          model !== undefined &&
          typeof model === 'string' &&
          model.trim() !== ''
        );

      console.error('Extracted Unique Models:', uniqueModels);

      if (uniqueModels.length === 0) {
        showSnackbar(`No vehicle models found for ${make} in ${year}. Check API or network.`, "warning");
      }

      setModels(uniqueModels);
    } catch (error) {
      console.error("Detailed Model Fetch Error:", error);
      showSnackbar(`Failed to fetch vehicle models: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    if (leadFormik.values.vehicleYear && leadFormik.values.vehicleMake) {
      fetchModels(leadFormik.values.vehicleYear, leadFormik.values.vehicleMake);
    }
  }, [leadFormik.values.vehicleYear, leadFormik.values.vehicleMake, fetchModels]);

  const renderContactStep = useCallback(() => (
    <DialogContent sx={{
      px: { xs: 2, sm: 3 },
      bgcolor: '#F2F4FC',
    }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="First Name"
            name="first_name"
            value={contactFormik.values.first_name}
            onChange={contactFormik.handleChange}
            error={contactFormik.touched.first_name && Boolean(contactFormik.errors.first_name)}
            helperText={contactFormik.touched.first_name && contactFormik.errors.first_name}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&.Mui-disabled': {
                  bgcolor: 'action.hover',
                  '& fieldset': {
                    borderColor: 'divider'
                  }
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Last Name"
            name="last_name"
            value={contactFormik.values.last_name}
            onChange={contactFormik.handleChange}
            error={contactFormik.touched.last_name && Boolean(contactFormik.errors.last_name)}
            helperText={contactFormik.touched.last_name && contactFormik.errors.last_name}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&.Mui-disabled': {
                  bgcolor: 'action.hover',
                  '& fieldset': {
                    borderColor: 'divider'
                  }
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Primary Email"
            name="primary_email"
            value={contactFormik.values.primary_email}
            onChange={contactFormik.handleChange}
            error={contactFormik.touched.primary_email && Boolean(contactFormik.errors.primary_email)}
            helperText={contactFormik.touched.primary_email && contactFormik.errors.primary_email}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&.Mui-disabled': {
                  bgcolor: 'action.hover',
                  '& fieldset': {
                    borderColor: 'divider'
                  }
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Mobile Phone"
            name="mobile_phone"
            value={contactFormik.values.mobile_phone}
            onChange={contactFormik.handleChange}
            error={contactFormik.touched.mobile_phone && Boolean(contactFormik.errors.mobile_phone)}
            helperText={contactFormik.touched.mobile_phone && contactFormik.errors.mobile_phone}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&.Mui-disabled': {
                  bgcolor: 'action.hover',
                  '& fieldset': {
                    borderColor: 'divider'
                  }
                }
              }
            }}
          />
        </Grid>
      </Grid>
    </DialogContent>
  ), [contactFormik]);

  const renderDuplicatesStep = useCallback(() => {
    return (
      <Box sx={{ p: 3 }}>
        {duplicates.length > 0 ? (
          <>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
              Potential Duplicate Contacts Found
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {duplicates.map((contact) => (
                <Card
                  key={contact.id}
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      // borderColor: 'primary.main',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                  onClick={() => {
                    setSelectedContact(contact);
                    setStep(3);
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {contact.first_name} {contact.last_name}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 1,
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      Select
                    </Button>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {contact.primary_email || 'No email'}
                    {contact.mobile_phone && ` | ${contact.mobile_phone}`}
                  </Typography>
                </Card>
              ))}
            </Box>
          </>
        ) : (
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', py: 4 }}
          >
            No duplicates found.
          </Typography>
        )}
      </Box>
    );
  }, [duplicates, isCreatingNewContact, contactFormik]);

  const renderCreateNewContactStep = () => (
    <DialogContent sx={{
      px: { xs: 2, sm: 3 },
      bgcolor: '#F2F4FC',
    }}>
      <Box sx={{ pt: 1 }}>
        <Typography variant="h6" gutterBottom>
          Create New Contact
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="First Name"
              name="first_name"
              value={newContactFormik.values.first_name}
              onChange={newContactFormik.handleChange}
              error={newContactFormik.touched.first_name && Boolean(newContactFormik.errors.first_name)}
              helperText={newContactFormik.touched.first_name && newContactFormik.errors.first_name}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  '&.Mui-disabled': {
                    bgcolor: 'action.hover',
                    '& fieldset': {
                      borderColor: 'divider'
                    }
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Last Name"
              name="last_name"
              value={newContactFormik.values.last_name}
              onChange={newContactFormik.handleChange}
              error={newContactFormik.touched.last_name && Boolean(newContactFormik.errors.last_name)}
              helperText={newContactFormik.touched.last_name && newContactFormik.errors.last_name}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  '&.Mui-disabled': {
                    bgcolor: 'action.hover',
                    '& fieldset': {
                      borderColor: 'divider'
                    }
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography>Preferred Contact:</Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newContactFormik.values.preferred_contact.includes("Phone")}
                    onChange={() => handlepreferred_contactChange("Phone")}
                  />
                }
                label="Phone"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newContactFormik.values.preferred_contact.includes("SMS")}
                    onChange={() => handlepreferred_contactChange("SMS")}
                  />
                }
                label="SMS"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newContactFormik.values.preferred_contact.includes("Email")}
                    onChange={() => handlepreferred_contactChange("Email")}
                  />
                }
                label="Email"
              />
            </FormGroup>
            {newContactFormik.touched.preferred_contact && newContactFormik.errors.preferred_contact && (
              <Typography color="error" variant="body2">
                {newContactFormik.errors.preferred_contact}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Email"
              name="primary_email"
              type="email"
              value={newContactFormik.values.primary_email}
              onChange={newContactFormik.handleChange}
              error={newContactFormik.touched.primary_email && Boolean(newContactFormik.errors.primary_email)}
              helperText={newContactFormik.touched.primary_email && newContactFormik.errors.primary_email}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  '&.Mui-disabled': {
                    bgcolor: 'action.hover',
                    '& fieldset': {
                      borderColor: 'divider'
                    }
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Mobile Phone"
              name="mobile_phone"
              type="tel"
              value={newContactFormik.values.mobile_phone}
              onChange={newContactFormik.handleChange}
              error={newContactFormik.touched.mobile_phone && Boolean(newContactFormik.errors.mobile_phone)}
              helperText={newContactFormik.touched.mobile_phone && newContactFormik.errors.mobile_phone}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  '&.Mui-disabled': {
                    bgcolor: 'action.hover',
                    '& fieldset': {
                      borderColor: 'divider'
                    }
                  }
                }
              }}
            />
          </Grid>

        </Grid>
      </Box>
    </DialogContent>
  );

  const renderLeadStep = () => (
    <DialogContent sx={{
      px: { xs: 2, sm: 3 },
      bgcolor: '#F2F4FC',
    }}>
      <Box sx={{ pt: 1 }}>
        <Typography variant="h6" gutterBottom>
          Dealership
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&.Mui-disabled': {
                  bgcolor: 'action.hover',
                  '& fieldset': {
                    borderColor: 'divider'
                  }
                }
              }
            }}>
              <InputLabel>Dealership</InputLabel>
              <Select
                value={leadFormik.values.dealership_id || 0}
                onChange={(e) => handleLeadInputChange("dealership_id", Number(e.target.value))}
                label="Dealership"
              >
                {dealerships.length > 0 ? (
                  dealerships.map((dealership) => (
                    <MenuItem key={dealership.id} value={dealership.id}>
                      {dealership.dealership_name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value={0} disabled>
                    No dealerships available
                  </MenuItem>
                )}
              </Select>
            </FormControl>

          </Grid>

        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Lead Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&.Mui-disabled': {
                  bgcolor: 'action.hover',
                  '& fieldset': {
                    borderColor: 'divider'
                  }
                }
              }
            }}>
              <InputLabel>Lead Source</InputLabel>
              <Select
                name="leadSource"
                value={leadFormik.values.leadSource}
                onChange={(e) => handleLeadInputChange("leadSource", e.target.value)}
                label="Lead Source"
              >
                {LEAD_SOURCES.map((leadSource) => (
                  <MenuItem key={leadSource.value} value={leadSource.value}>
                    {leadSource.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&.Mui-disabled': {
                  bgcolor: 'action.hover',
                  '& fieldset': {
                    borderColor: 'divider'
                  }
                }
              }
            }}>
              <InputLabel>Lead Status</InputLabel>
              <Select
                name="leadStatus"
                value={leadFormik.values.leadStatus || ""}
                onChange={(e) => handleLeadInputChange("leadStatus", e.target.value)}
                label="Lead Status"
                disabled
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Contacted">Contacted</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Desired Vehicle Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&.Mui-disabled': {
                  bgcolor: 'action.hover',
                  '& fieldset': {
                    borderColor: 'divider'
                  }
                }
              }
            }}>
              <InputLabel>Vehicle Year</InputLabel>
              <Select
                value={leadFormik.values.vehicleYear}
                onChange={(e) => handleLeadInputChange("vehicleYear", e.target.value)}
                label="Vehicle Year"
              >
                {vehicleYearList.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&.Mui-disabled': {
                  bgcolor: 'action.hover',
                  '& fieldset': {
                    borderColor: 'divider'
                  }
                }
              }
            }}>
              <InputLabel>Vehicle Make</InputLabel>
              <Select
                value={leadFormik.values.vehicleMake}
                onChange={(e) => handleLeadInputChange("vehicleMake", e.target.value)}
                label="Vehicle Make"
              >
                {vehicleMakesList.map((make) => (
                  <MenuItem key={make} value={make}>
                    {make}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              size="small"
              disabled={!models.length}
              error={!models.length && !!leadFormik.values.vehicleYear && !!leadFormik.values.vehicleMake}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  '&.Mui-disabled': {
                    bgcolor: 'action.hover',
                    '& fieldset': {
                      borderColor: 'divider'
                    }
                  }
                }
              }}
            >
              <InputLabel>Vehicle Model</InputLabel>
              <Select
                value={leadFormik.values.vehicleModel}
                onChange={(e) => handleLeadInputChange("vehicleModel", e.target.value)}
                label="Vehicle Model"
                renderValue={(selected) => {
                  if (!selected) {
                    return <em>Select a model</em>;
                  }
                  return selected;
                }}
              >
                {models.length === 0 && leadFormik.values.vehicleYear && leadFormik.values.vehicleMake ? (
                  <MenuItem disabled>
                    No models found. Try a different year or make.
                  </MenuItem>
                ) : (
                  models.map((model, index) => (
                    <MenuItem key={`${model}-${index}`} value={model}>
                      {model}
                    </MenuItem>
                  ))
                )}
              </Select>
              {!models.length && leadFormik.values.vehicleYear && leadFormik.values.vehicleMake && (
                <FormHelperText>
                  No models found. Please check the year and make selection.
                </FormHelperText>
              )}
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Trade Vehicle Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="tradeIn"
                  checked={leadFormik.values.tradeIn || false}
                // onChange={(e) => handleLeadInputChange("tradeIn", e.target.checked)}
                />
              }
              label="Has Trade-In?"
            />
          </Grid>
          {leadFormik.values.tradeIn && (
            <Grid item xs={12}>
              <TextField
                label="Trade-In Details"
                name="tradeInDetails"
                value={leadFormik.values.tradeInDetails || ""}
                // onChange={(e) => handleLeadInputChange("tradeInDetails", e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    '&.Mui-disabled': {
                      bgcolor: 'action.hover',
                      '& fieldset': {
                        borderColor: 'divider'
                      }
                    }
                  }
                }}
              />
            </Grid>
          )}
        </Grid>

      </Box>
    </DialogContent>
  );

  const handleClear = () => {
    contactFormik.resetForm({
      values: {
        first_name: '',
        last_name: '',
        primary_email: '',
        mobile_phone: '',
      }
    });

    leadFormik.resetForm({
      values: {
        dealership_id: 0,
        leadSource: '',
        leadStatus: 'New',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        tradeIn: false,
        tradeInDetails: '',
      }
    });

    setStep(1);
    setLoading(false);
    setModels([]);
    setDuplicates([]);
    setSelectedContact(null);
    setIsCreatingNewContact(false);
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullScreen={isMobile}
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          maxWidth: '800px',
          margin: 'auto'
        }
      }}
    >

      {/* Enhanced Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={4}
        py={2.5}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <Box display="flex" alignItems="center">
          <DialogTitle sx={{
            p: 0,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'text.primary',
            letterSpacing: '-0.01em'
          }}>
            Search Existing Contacts
          </DialogTitle>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: alpha(theme.palette.text.primary, 0.04)
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Stepper activeStep={step - 1} alternativeLabel sx={{ py: 3 }}>
        <Step>
          <StepLabel>Search Contact</StepLabel>
        </Step>
        <Step>
          <StepLabel>Select Contact</StepLabel>
        </Step>
        <Step>
          <StepLabel>Create Lead</StepLabel>
        </Step>
      </Stepper>

      {step === 1 && renderContactStep()}
      {step === 2 && renderDuplicatesStep()}
      {step === 3 && renderLeadStep()}
      {step === 4 && renderCreateNewContactStep()}

      {/* Enhanced Footer */}
      <DialogActions
        sx={{
          px: 4,
          py: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>

          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          {step === 1 && (
            <Button
              onClick={contactFormik.submitForm}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Searching..." : "Next"}
            </Button>
          )}
          {step === 2 && (
            <>
              <Button
                onClick={() => setStep(1)}
                variant="outlined"
                color="secondary"
              >
                Back
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setStep(4)}
              >
                Create New Contact
              </Button>
            </>
          )}
          {step === 3 && (
            <Button
              onClick={leadFormik.submitForm}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Lead"}
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={() => handleCreateNewContact()}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Next"}
            </Button>
          )}
        </Box>

      </DialogActions>
    </Dialog>
  );
};

export default NewLeadDialog;
