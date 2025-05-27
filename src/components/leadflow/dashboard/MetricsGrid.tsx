// MetricsGrid.jsx
import React from "react";
import { Grid, Card, CardContent, Box, Typography, Skeleton, alpha } from "@mui/material";
import { useTheme } from "@mui/material";

const MetricsGrid = ({ metrics = [], loading = false }) => {
  const theme = useTheme();

  return (
    <>
      {metrics.map((metric) => (
        <Grid item xs={12} sm={6} md={3} key={metric.key}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: "16px",
              background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.07)} 100%)`,
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 16px 30px rgba(0,0,0,0.1)",
              },
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              backdropFilter: "blur(8px)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                right: "-30px",
                top: "-30px",
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
                zIndex: 0,
              }}
            />
            <CardContent sx={{ position: "relative", zIndex: 1, p: 3 }}>
              {loading ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Skeleton variant="text" width="70%" height={24} />
                  <Skeleton variant="text" width="50%" height={40} />
                  <Skeleton variant="text" width="30%" height={20} />
                </Box>
              ) : (
                <>
                  <Box
                    sx={{
                      position: "absolute",
                      right: 16,
                      bottom: 8,
                      fontSize: 60,
                      color: metric.iconColor ? alpha(metric.iconColor, 0.25) : alpha(theme.palette.text.primary, 0.04),
                      transform: "rotate(-5deg)",
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 1, fontWeight: 500 }}
                  >
                    {metric.label}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, letterSpacing: "-0.5px", mb: 1.5 }}
                  >
                    {metric.value}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );
};

export default MetricsGrid;
