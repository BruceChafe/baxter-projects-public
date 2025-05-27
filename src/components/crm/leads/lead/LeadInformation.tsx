import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Button, Stack, CircularProgress, Paper, alpha,
  FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Typography
} from '@mui/material';
import { Assignment, Save } from '@mui/icons-material';
import { LeadData, ContactData, ValidationErrors } from '../../types/types';
import { LEAD_SOURCES, LEAD_TYPES, LEAD_STATUSES, LEAD_MEDIA } from "../../../../common/lists/leadLists";
import { useSnackbar } from '../../../../context/SnackbarContext';
import { useFetchUsers } from '../../../../hooks/useFetchUsers';
import { supabase } from '../../../../../supabase/supabaseClient';

interface LeadInformationProps {
  leadData: LeadData | null;
  contactData: ContactData | null;
  validationErrors: ValidationErrors;
  onUpdate?: (updatedData: LeadData) => void;
}

const LeadInformation: React.FC<LeadInformationProps> = ({ leadData, validationErrors, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LeadData | null>(null);
  const [originalData, setOriginalData] = useState<LeadData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dealerGroupName, setDealerGroupName] = useState("");
  const [dealership_name, setDealershipName] = useState("");

  const { showSnackbar } = useSnackbar();
  const [users, usersLoading] = useFetchUsers(
    leadData?.dealergroup_id,
    leadData?.dealerships
  );

  useEffect(() => {
    if (leadData) {
      setFormData(leadData);
      setOriginalData(leadData);
      if (leadData.dealergroup_id) fetchDealerGroupName(leadData.dealergroup_id);
      if (leadData.dealership_id) fetchDealershipName(leadData.dealership_id);
    }
  }, [leadData]);

  const fetchDealerGroupName = async (dealergroup_id: number) => {
    const { data, error } = await supabase.from("dealergroups").select("name").eq("id", dealergroup_id).single();
    setDealerGroupName(error ? "N/A" : data?.name);
  };

  const fetchDealershipName = async (dealership_id: number) => {
    const { data, error } = await supabase.from("dealerships").select("name").eq("id", dealership_id).single();
    setDealershipName(error ? "N/A" : data?.name);
  };

  const handleInputChange = (field: keyof LeadData) => (event: any) => {
    const value = event.target.value;
    const updatedData = { ...formData, [field]: value } as LeadData;
    setFormData(updatedData);
    checkForChanges(updatedData);
  };

  const checkForChanges = (newData: LeadData) => {
    if (!originalData) return;
    const isChanged = Object.keys(newData).some(key => newData[key as keyof LeadData] !== originalData[key as keyof LeadData]);
    setHasChanges(isChanged);
  };

  const handleSave = () => setDialogOpen(true);

  const handleConfirmSave = async () => {
    if (!formData) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("leads").update(formData).eq("id", formData.id);
      if (error) throw error;

      setOriginalData(formData);
      setHasChanges(false);
      setDialogOpen(false);
      showSnackbar("Lead information updated successfully", "success");

      if (onUpdate) onUpdate(formData);
    } catch (error) {
      console.error("Error updating lead:", error);
      showSnackbar("Failed to update lead", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!leadData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, fontSize: "1.125rem", color: "text.primary", display: "flex", alignItems: "center", gap: 1 }}>
        <Assignment sx={{ fontSize: "1.25rem" }} /> Lead Information
      </Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02) }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select label="Source" value={formData?.leadSource || ""} onChange={handleInputChange("leadSource")}>
                  {LEAD_SOURCES.map(source => <MenuItem key={source.value} value={source.value}>{source.label}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={formData?.leadType || ""} onChange={handleInputChange("leadType")}>
                  {LEAD_TYPES.map(type => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={formData?.leadStatus || ""} onChange={handleInputChange("leadStatus")}>
                  {LEAD_STATUSES.map(status => <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={2}>
              <TextField label="Dealer Group" value={dealerGroupName} fullWidth disabled />
              <TextField label="Dealership" value={dealership_name} fullWidth disabled />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <TextField label="Comments" value={formData?.comments || ""} onChange={handleInputChange("comments")} fullWidth multiline rows={4} />
          </Grid>
        </Grid>
      </Paper>

      {hasChanges && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" color="primary" startIcon={loading ? <CircularProgress size={20} /> : <Save />} onClick={handleSave} disabled={loading}>Save Changes</Button>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to save these changes?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmSave} color="primary" variant="contained" disabled={loading}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadInformation;
