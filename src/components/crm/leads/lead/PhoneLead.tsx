import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Chip,
  Divider,
  alpha,
  Paper,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  Close,
  ErrorOutline,
  CallMade,
  CallReceived,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Call outcome options
const CALL_OUTCOMES = [
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'no_answer', label: 'No Answer', color: 'error' },
  { value: 'voicemail', label: 'Left Voicemail', color: 'warning' },
  { value: 'wrong_number', label: 'Wrong Number', color: 'error' },
  { value: 'busy', label: 'Busy', color: 'warning' },
  { value: 'callback', label: 'Callback Requested', color: 'info' },
];

// Follow-up types
const FOLLOW_UP_TYPES = [
  { value: 'none', label: 'No Follow-up Needed' },
  { value: 'call', label: 'Schedule Call' },
  { value: 'email', label: 'Send Email' },
  { value: 'meeting', label: 'Schedule Meeting' },
  { value: 'quote', label: 'Send Quote' },
];

interface EmailDialogProps {
  open: boolean;
  onClose: () => void;
  recipientPhone: string;
  contacts: { email: string }[];
  contact: {
    name: string;
    phone: string;
    company: string;
    lastContact: string;
    notes: string;
  };
}

const PhoneCallDialog: React.FC<EmailDialogProps> = ({
  open,
  onClose,
  recipientPhone,
}) => {
  const [callData, setCallData] = useState({
    direction: 'outbound', // default call direction
    outcome: '',
    duration: '',
    notes: '',
    reason: '',
    followUpType: 'none',
    followUpDate: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Generic handler for fields that come from event.target.value
  const handleChange = (field) => (event) => {
    setCallData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Dedicated handler for toggling call direction
  const handleDirectionChange = (newDirection) => {
    setCallData((prev) => ({
      ...prev,
      direction: newDirection,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Implement your call logging logic here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onClose();
      // Reset form, including setting direction back to outbound
      setCallData({
        direction: 'outbound',
        outcome: '',
        duration: '',
        notes: '',
        reason: '',
        followUpType: 'none',
        followUpDate: '',
      });
    } catch (err) {
      setError('Failed to save call log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          maxWidth: '800px',
          margin: 'auto',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={4}
          py={2.5}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <Box display="flex" alignItems="center">
            <DialogTitle
              sx={{
                p: 0,
                fontWeight: 700,
                fontSize: '1.5rem',
                color: 'text.primary',
                letterSpacing: '-0.01em',
              }}
            >
              Phone Call
            </DialogTitle>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                bgcolor: alpha(theme.palette.text.primary, 0.04),
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${recipientPhone}`;
                }}
                variant="contained"
                size="large"
                startIcon={<PhoneIcon />}
                sx={{
                  borderRadius: 28,
                  px: 4,
                  py: 1.5,
                }}
              >
                Call {recipientPhone}
              </Button>
            </Box>

            {/* Call Details Section */}
            <Box>
            <Grid container spacing={3}>
              {/* Call Direction Toggle */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Button
                    variant={
                      callData.direction === 'outbound' ? 'contained' : 'outlined'
                    }
                    onClick={() => handleDirectionChange('outbound')}
                    startIcon={<CallMade />}
                    sx={{ flex: 1 }}
                  >
                    Outbound Call
                  </Button>
                  <Button
                    variant={
                      callData.direction === 'inbound' ? 'contained' : 'outlined'
                    }
                    onClick={() => handleDirectionChange('inbound')}
                    startIcon={<CallReceived />}
                    sx={{ flex: 1 }}
                  >
                    Inbound Call
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
              <TextField
                  fullWidth
                  label="Call Reason"
                  value={callData.reason}
                  onChange={handleChange('reason')}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                    },
                  }}
                />
              </Grid>

              

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Call Duration (minutes)"
                  type="number"
                  value={callData.duration}
                  onChange={handleChange('duration')}
                  InputProps={{
                    inputProps: { min: 0 },
                    startAdornment: (
                      <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Call Outcome</InputLabel>
                  <Select
                    value={callData.outcome}
                    onChange={handleChange('outcome')}
                    label="Call Outcome"
                  >
                    {CALL_OUTCOMES.map((outcome) => (
                      <MenuItem key={outcome.value} value={outcome.value}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                          }}
                        >
                          <Chip
                            label={outcome.label}
                            size="small"
                            color={outcome.color}
                            sx={{ mr: 1, minWidth: 100 }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Call Notes"
                  multiline
                  rows={4}
                  value={callData.notes}
                  onChange={handleChange('notes')}
                  required
                  placeholder="Describe the conversation, key points discussed, and any important details..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                    },
                  }}
                />

            
              </Grid>
              </Grid>
              
            </Box>

            {error && (
              <Typography
                color="error"
                variant="body2"
                sx={{
                  bgcolor: 'error.lighter',
                  p: 2,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <ErrorOutline fontSize="small" />
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 4,
            py: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={onClose} variant="outlined" color="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || !callData.outcome || !callData.notes}
            >
              {saving ? 'Saving...' : 'Save Call Log'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PhoneCallDialog;
