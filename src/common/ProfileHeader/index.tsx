import React from 'react';
import { Box, Paper, Avatar, Typography, Stack, Button } from '@mui/material';
import { DetailHeaderProps } from '../types/types';

export const ProfileHeader: React.FC<DetailHeaderProps> = ({
  title,
  subtitle,
  avatar,
  actions
}) => {
  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        mb: 3,
        bgcolor: 'background.paper',
        backgroundImage: `linear-gradient(to right bottom, #ffffff, #fafafa)`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}
    >
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 2, sm: 3 },
      }}>
        <Avatar
          src={avatar?.image}
          sx={{
            width: { xs: 64, sm: 80 },
            height: { xs: 64, sm: 80 },
            bgcolor: 'primary.main',
            fontSize: { xs: 24, sm: 32 },
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '4px solid #fff'
          }}
        >
          {avatar?.text}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h4" 
            fontWeight="500"
            sx={{ 
              mb: 1,
              color: 'text.primary',
              letterSpacing: '-0.5px'
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && actions.length > 0 && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "contained"}
                startIcon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                sx={{
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 1.5,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: action.variant === 'contained' ? 3 : 1,
                  },
                  transition: 'all 0.2s'
                }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default ProfileHeader;