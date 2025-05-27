import React from "react";
import { Paper, Typography, Button, Stack, Box, CircularProgress, Divider } from "@mui/material";
import { RefreshRounded } from "@mui/icons-material";

interface Action {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
  loading?: boolean;
}

interface ContactHeaderSectionProps {
  title: string;
  subtitle: string;
  action?: Action;
  additionalActions?: Action[];
  titleIcon?: React.ReactNode;
}

const ContactHeaderSection: React.FC<ContactHeaderSectionProps> = ({
  title,
  subtitle,
  action,
  additionalActions = [],
  titleIcon,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 4,
        borderRadius: 3,
        background: "linear-gradient(to right, #f8f9fa, #ffffff)",
        border: "1px solid #e0e0e0",
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Add shadow on hover
        },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }} // Align left on mobile
        spacing={2}
      >
        <Box>
          {titleIcon && <Box sx={{ color: "#1a237e" }}>{titleIcon}</Box>}

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
          <Typography
            variant="subtitle1"
            sx={{ color: "text.secondary", fontSize: { xs: "0.875rem", sm: "1rem" } }} // Adjust font size for mobile
          >
            {subtitle}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", sm: "auto" } }}>
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "contained"}
              startIcon={action.icon || <RefreshRounded />}
              sx={{ borderRadius: 2, textTransform: "none", px: 3, py: 1.5, width: { xs: "100%", sm: "auto" } }} // Full width on mobile
            >
              {action.label}
            </Button>
          )}
          {additionalActions.map((act, index) => (
            <Button
              key={index}
              onClick={act.onClick}
              variant={act.variant || "outlined"}
              startIcon={act.icon}
              sx={{ borderRadius: 2, textTransform: "none", px: 3, py: 1.5, width: { xs: "100%", sm: "auto" } }} // Full width on mobile
            >
              {act.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ContactHeaderSection;
