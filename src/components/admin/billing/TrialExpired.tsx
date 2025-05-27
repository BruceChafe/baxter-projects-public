import React from 'react';
import { 
  Container, 
  Card, 
  Typography, 
  Box, 
  Button, 
  Divider,
  Stack,
  useTheme
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface TrialExpiredProps {
  message?: string;
  onUpgrade?: () => void;
  onContactSupport?: () => void;
  companyName?: string;
}

const TrialExpired: React.FC<TrialExpiredProps> = ({ 
  message, 
  onUpgrade, 
  onContactSupport,
  companyName = 'UpShift'
}) => {
  const theme = useTheme();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card 
        elevation={3} 
        sx={{ 
          p: 0, 
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            p: 3, 
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <AccessTimeIcon fontSize="large" />
          <Typography variant="h5" fontWeight="500">
            Your trial period has ended
          </Typography>
        </Box>

        {/* Main content */}
        <Box sx={{ p: 4 }}>
          <Typography variant="body1" color="text.secondary" mb={4} sx={{ lineHeight: 1.6 }}>
            {message || `Thank you for trying ${companyName}. To continue enjoying our services and unlock all premium features, please upgrade to one of our subscription plans.`}
          </Typography>

          {/* Action buttons */}
          <Stack direction="column" spacing={2}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              fullWidth
              onClick={onUpgrade}
              endIcon={<ArrowForwardIcon />}
              sx={{ py: 1.5 }}
            >
              Upgrade now
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              fullWidth
              onClick={onContactSupport}
              startIcon={<HelpOutlineIcon />}
              sx={{ py: 1.5 }}
            >
              Contact support
            </Button>
          </Stack>
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 3, backgroundColor: theme.palette.grey[50], textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Have questions? Visit our <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 500, cursor: 'pointer' }}>Help Center</Box> or email us at <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>support@example.com</Box>
          </Typography>
        </Box>
      </Card>
    </Container>
  );
};

export default TrialExpired;