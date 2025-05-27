import React, { useEffect, useState } from "react";
import { Badge, Box, Button, Fade, Paper, Stack, Typography } from "@mui/material";
import { NotificationsActive as AlertIcon } from "@mui/icons-material";
import { supabase } from "../../../../supabase/supabaseClient";
import { fetchUnattendedLeads } from "../../../hooks/leads/useUnattendedLeads";

const UnattendedLeadsAlert = ({ onViewUnattended }) => {
  const [unattendedLeads, setUnattendedLeads] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const fetchNewLeads = async () => {
      try {
        const leads = await fetchUnattendedLeads();
        if (leads) {
          const unclaimed = leads.filter((lead) => !lead.isClaimed);
          setUnattendedLeads(unclaimed.length);
          setIsVisible(unclaimed.length > 0);
        }
      } catch (error) {
        console.error("Failed to fetch unattended leads", error);
      }
    };

    fetchNewLeads();
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel("custom-all-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "Leads" }, () => {
        setUnattendedLeads((prev) => prev + 1);
        setIsVisible(true);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <Fade in={isVisible} timeout={800}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          background: (theme) => theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.dark} 70%, ${theme.palette.error.main} 100%)`
            : `linear-gradient(135deg, #fff8f8 0%, #fff0f0 70%, #ffe8e8 100%)`,
          borderRadius: "16px",
          position: "relative",
          overflow: "hidden",
          borderLeft: (theme) => `6px solid ${theme.palette.error.main}`,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? "0 8px 20px rgba(0,0,0,0.25)" 
            : "0 8px 20px rgba(244,67,54,0.15)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: (theme) => theme.palette.mode === 'dark' 
              ? "0 10px 25px rgba(0,0,0,0.3)" 
              : "0 10px 25px rgba(244,67,54,0.2)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: (theme) => `radial-gradient(circle at top right, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,82,82,0.08)'}, transparent 70%)`,
            pointerEvents: "none"
          }
        }}
      >
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          justifyContent="space-between" 
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={{ xs: 2.5, sm: 2 }}
        >
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2.5, 
            color: (theme) => theme.palette.mode === 'dark' ? "white" : "error.dark"
          }}>
            <Badge
              badgeContent={unattendedLeads}
              color="error"
              sx={{ 
                "& .MuiBadge-badge": { 
                  fontSize: "0.85rem", 
                  fontWeight: "bold",
                  padding: "0 8px",
                  minWidth: "26px",
                  height: "26px",
                  borderRadius: "13px",
                  boxShadow: "0 2px 6px rgba(244,67,54,0.4)",
                } 
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 0, 0, 0.08)',
                  boxShadow: "inset 0 0 0 2px rgba(255,82,82,0.2)",
                }}
              >
                <AlertIcon 
                  fontSize="medium"
                  sx={{ 
                    color: (theme) => theme.palette.mode === 'dark' ? "white" : "error.main",
                    animation: "pulse 1.5s infinite ease-in-out",
                    "@keyframes pulse": {
                      "0%": { transform: "scale(1)", opacity: 1 },
                      "50%": { transform: "scale(1.1)", opacity: 0.85 },
                      "100%": { transform: "scale(1)", opacity: 1 }
                    }
                  }} 
                />
              </Box>
            </Badge>
            <Box>
              <Typography 
                variant="h6" 
                component="div" 
                fontWeight="700" 
                sx={{ 
                  mb: 0.5,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" }
                }}
              >
                Unclaimed Lead{unattendedLeads > 1 ? "s" : ""} Available
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.85,
                  fontSize: { xs: "0.875rem", sm: "0.95rem" }  
                }}
              >
                {unattendedLeads} new lead{unattendedLeads > 1 ? "s" : ""} waiting to be claimed
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={onViewUnattended}
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'dark' ? "white" : "error.main",
              color: (theme) => theme.palette.mode === 'dark' ? "error.main" : "white",
              "&:hover": {
                bgcolor: (theme) => theme.palette.mode === 'dark' ? "rgba(255, 255, 255, 0.9)" : "error.dark",
              },
              textTransform: "none",
              borderRadius: "12px",
              fontWeight: "600",
              px: { xs: 4, sm: 3.5 },
              py: 1.5,
              minWidth: { xs: "100%", sm: "auto" },
              boxShadow: (theme) => theme.palette.mode === 'dark' 
                ? "0 4px 10px rgba(0,0,0,0.2)" 
                : "0 6px 12px rgba(211,47,47,0.2)",
              transition: "all 0.25s",
              "&:active": {
                transform: "translateY(2px)",
                boxShadow: "none"
              }
            }}
          >
            View & Claim
          </Button>
        </Stack>
      </Paper>
    </Fade>
  );
};

export default UnattendedLeadsAlert;