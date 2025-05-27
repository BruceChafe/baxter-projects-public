import React from "react";
import { Box, Typography, CircularProgress, Paper, useTheme } from "@mui/material";
import { 
  ErrorOutlineRounded, 
  FolderOffRounded, 
  HourglassEmptyRounded,
  SentimentDissatisfiedRounded
} from "@mui/icons-material";

interface StateDisplayProps {
  state: "loading" | "error" | "empty";
  errorMessage?: string;
  emptyMessage?: string;
  height?: string | number;
  animate?: boolean;
  variant?: "default" | "compact" | "card";
}

const StateDisplay: React.FC<StateDisplayProps> = ({
  state,
  errorMessage = "Something went wrong.",
  emptyMessage = "No data available.",
  height = "300px",
  animate = true,
  variant = "default"
}) => {
  const theme = useTheme();
  
  const isCompact = variant === "compact";
  const isCard = variant === "card";
  
  const ContainerComponent = isCard ? Paper : Box;
  const containerProps = isCard ? { elevation: 1 } : {};
  
  const getDisplay = () => {
    switch (state) {
      case "loading":
        return {
          icon: animate ? (
            <CircularProgress 
              size={isCompact ? 32 : 48} 
              thickness={4}
              sx={{ color: theme.palette.primary.main }}
            />
          ) : (
            <HourglassEmptyRounded 
              sx={{ 
                fontSize: isCompact ? 40 : 56, 
                color: theme.palette.primary.light
              }} 
            />
          ),
          message: "Loading...",
          color: "primary"
        };
        
      case "error":
        return {
          icon: (
            <ErrorOutlineRounded 
              sx={{ 
                fontSize: isCompact ? 40 : 56, 
                color: theme.palette.error.main
              }} 
            />
          ),
          message: errorMessage,
          color: "error",
          secondaryIcon: <SentimentDissatisfiedRounded sx={{ fontSize: 20, ml: 1 }} />
        };
        
      case "empty":
        return {
          icon: (
            <FolderOffRounded 
              sx={{ 
                fontSize: isCompact ? 40 : 56, 
                color: theme.palette.text.disabled
              }} 
            />
          ),
          message: emptyMessage,
          color: "text.secondary"
        };
        
      default:
        return null;
    }
  };
  
  const display = getDisplay();
  
  if (!display) return null;
  
  return (
    <ContainerComponent
      {...containerProps}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: height,
        gap: isCompact ? 1 : 3,
        padding: isCompact ? 2 : 4,
        borderRadius: isCard ? 2 : 0,
        transition: "all 0.3s ease",
        backgroundColor: isCard ? 
          (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)') : 
          'transparent'
      }}
    >
      {display.icon}
      
      <Box sx={{ textAlign: "center" }}>
        <Typography 
          variant={isCompact ? "body1" : "h6"} 
          color={display.color}
          sx={{ 
            display: "flex", 
            alignItems: "center",
            justifyContent: "center",
            fontWeight: state === "error" ? 500 : 400
          }}
        >
          {display.message}
          {display.secondaryIcon}
        </Typography>
        
        {state === "error" && !isCompact && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 1, maxWidth: "80%", mx: "auto" }}
          >
            Please try again or contact support if the problem persists.
          </Typography>
        )}
      </Box>
    </ContainerComponent>
  );
};

export default StateDisplay;