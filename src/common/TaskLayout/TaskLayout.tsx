import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography, CircularProgress, Alert } from '@mui/material';
import { DetailLayoutProps } from '../types/types';
import ProfileHeader from '../ProfileHeader';

export const TaskLayout: React.FC<DetailLayoutProps> = ({
  header,
  tabs,
  loading,
  error
}) => {
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>     
      <Paper 
        elevation={2} 
        sx={{ 
          bgcolor: 'background.paper', 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
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
            borderColor: 'divider',
            bgcolor: 'rgba(0,0,0,0.02)',
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 56,
              color: 'text.secondary',
              fontSize: '0.95rem',
              fontWeight: 500,
              '&.Mui-selected': {
                color: 'primary.main',
                bgcolor: 'background.paper',
              },
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
              },
            },
            '& .MuiTabs-indicator': {
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
        <Box sx={{ p: 3 }}>
          {tabs[activeTab].content}
        </Box>
      </Paper>
    </Box>
  );
};

export default TaskLayout;