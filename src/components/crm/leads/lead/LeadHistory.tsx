import React from 'react';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { Note } from '@mui/icons-material';

const LeadHistory: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Lead History
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Box sx={{ 
        textAlign: "center", 
        py: 8,
        backgroundColor: 'action.hover',
        borderRadius: 2
      }}>
        <Note sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          No interaction history available yet. Start tracking this lead by adding notes or activities.
        </Typography>
      </Box>
    </Box>
  );
};

export default LeadHistory;