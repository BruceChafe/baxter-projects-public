import React from 'react';
import { Box, Paper, Typography, Stack, Button } from '@mui/material';
import { TableHeaderProps } from '../types/types';

export const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  subtitle,
  actions
}) => {
  return (
    <Box 
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        flexDirection: { xs: "column", sm: "row" },
        gap: 2
      }}
    >
      <Box>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 500,
            color: 'text.primary',
            letterSpacing: '-0.5px'
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {actions && actions.length > 0 && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
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
                borderRadius: 1,
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
  );
};

export default TableHeader;