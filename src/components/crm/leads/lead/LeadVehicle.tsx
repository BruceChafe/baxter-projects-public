import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Divider,
  Button,
  Stack,
  CircularProgress,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Edit, Save, Close, Add } from '@mui/icons-material';
import { VehicleData, ValidationErrors } from './types';
import axiosInstance from '../../../../axios';
import { useSnackbar } from '../../../../context/SnackbarContext';

interface LeadVehicleProps {
  vehicleData: VehicleData | null;
  validationErrors: ValidationErrors;
  onUpdate?: (updatedData: VehicleData) => void;
}

const NHTSA_API_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/GetCanadianVehicleSpecifications/";

const LeadVehicle: React.FC<LeadVehicleProps> = ({
  vehicleData,
  validationErrors,
  onUpdate,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleData | null>(vehicleData);
  const [showAddVehicle, setShowAddVehicle] = useState(!vehicleData);
  const [year, setYear] = useState<string>("");
  const [make, setMake] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (vehicleData) {
      setFormData(vehicleData);
      setShowAddVehicle(false);
    }
  }, [vehicleData]);

  const handleInputChange = (field: keyof VehicleData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    if (!formData) return;
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/vehicles/${formData.id}`, formData);
      setEditMode(false);
      if (onUpdate) {
        onUpdate(response.data);
      }
      showSnackbar("Vehicle details updated successfully", "success");
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || "Failed to update vehicle details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (vehicleData) {
      setFormData(vehicleData);
    }
    setEditMode(false);
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
    if (year && make) {
      fetchModels(year, make);
    }
  }, [year, make, fetchModels]);

  const handleAddVehicle = () => {
    setShowAddVehicle(true);
  };

  const handleAddFromCatalog = () => {
    // Logic to add vehicle from catalog
    if (year && make && selectedModel) {
      const newVehicle: VehicleData = {
        id: "", // Generate or fetch ID
        make,
        model: selectedModel,
        year: parseInt(year, 10),
        vin: "",
        price: 0,
        color: "",
        mileage: 0,
        condition: "",
      };
      setFormData(newVehicle);
      setShowAddVehicle(false);
      setEditMode(true);
    }
  };

  return (
    <Box>
      {!vehicleData && !showAddVehicle ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            No vehicle attached to this lead.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddVehicle}
          >
            Add Vehicle
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Vehicle Details
            </Typography>
            <Stack direction="row" spacing={1}>
              {editMode ? (
                <>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<Close />}
                    onClick={handleCancel}
                    disabled={loading}
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleSave}
                    disabled={loading}
                    size="small"
                  >
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  size="small"
                >
                  Edit
                </Button>
              )}
            </Stack>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {showAddVehicle ? (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Add Vehicle
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Make"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Model</InputLabel>
                    <Select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value as string)}
                      label="Model"
                      disabled={!year || !make || models.length === 0}
                    >
                      {models.map((model) => (
                        <MenuItem key={model} value={model}>
                          {model}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddFromCatalog}
                  disabled={!year || !make || !selectedModel}
                >
                  Add Vehicle
                </Button>
              </Box>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {/* Existing vehicle fields */}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default LeadVehicle;