import React from "react";
import { Paper, Typography, Button, Stack, Box, CircularProgress, alpha, useTheme } from "@mui/material";
import { RefreshRounded } from "@mui/icons-material";

interface Action {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
  loading?: boolean;
  disabled?: boolean; 
}

interface HeaderSectionProps {
  title: string;
  subtitle: string;
  action?: Action;
  additionalActions?: Action[];
  titleIcon?: React.ReactNode;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  subtitle,
  action,
  additionalActions = [],
  titleIcon,
}) => {
  const theme = useTheme();
  return (
<Paper
  elevation={1}
  sx={{
    p: { xs: 2, sm: 3 },
    mb: 4,
    borderRadius: "16px",
    border: `1px solid ${theme.palette.divider}`,
    background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(
      theme.palette.background.default, 
      0.7
    )} 100%)`,
    transition: "all 0.35s ease-in-out",
    "&:hover": {
      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
    },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {titleIcon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: "16px",
                bgcolor: "primary.main",
                color: "white",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              {titleIcon}
            </Box>
          )}

          <Box>
            <Typography
              variant="h4"
              sx={{ 
                fontWeight: 700, 
                color: "primary.dark",
                fontSize: { xs: "1.5rem", sm: "2rem" },
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ 
                color: "text.secondary",
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Stack>

        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={2} 
          sx={{ 
            width: { xs: "100%", sm: "auto" },
            mt: { xs: 2, sm: 0 },
          }}
        >
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "contained"}
              startIcon={!action.loading && (action.icon || <RefreshRounded />)}
              disabled={action.disabled || action.loading}
              sx={{ 
                borderRadius: "4px",
                textTransform: "none", 
                px: 3, 
                py: 1, 
                width: { xs: "100%", sm: "auto" },
                position: "relative",
              }}
            >
              {action.loading ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{
                      position: "absolute",
                      left: "50%",
                      marginLeft: "-10px",
                    }}
                  />
                  <Box sx={{ visibility: "hidden" }}>{action.label}</Box>
                </>
              ) : (
                action.label
              )}
            </Button>
          )}
          
          {additionalActions.map((act, index) => (
            <Button
              key={index}
              onClick={act.onClick}
              variant={act.variant || "outlined"}
              startIcon={!act.loading && act.icon}
              disabled={act.disabled || act.loading}
              sx={{ 
                borderRadius: "16px",
                textTransform: "none", 
                px: 3, 
                py: 1, 
                width: { xs: "100%", sm: "auto" },
                position: "relative",
              }}
            >
              {act.loading ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{
                      position: "absolute",
                      left: "50%",
                      marginLeft: "-10px",
                    }}
                  />
                  <Box sx={{ visibility: "hidden" }}>{act.label}</Box>
                </>
              ) : (
                act.label
              )}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default HeaderSection;