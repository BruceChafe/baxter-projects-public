import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Skeleton,
  Box,
  alpha,
  Grid,
  useTheme,
} from "@mui/material";
import { BarChart, ChartsTooltip } from "@mui/x-charts";
import { AssessmentRounded } from "@mui/icons-material";

const statusColors = {
  "IN PROCESS": "#5D4A89",
  UNATTENDED: "#FF7043",
  CONTACTED: "#4DB6AC",
  CONVERTED: "#4CAF50",
  REJECTED: "#F44336",
  ARCHIVED: "#9E9E9E",
  DEFAULT: "#5D4A89",
};

const LeadsByStatusChart = ({
  loading = false,
  leadsByStatus = [],
  onRefresh = () => {},
  title = "Leads by Status",
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [animatedData, setAnimatedData] = useState(leadsByStatus.map(() => 0));
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!loading && leadsByStatus.length > 0) {
      const targetData = leadsByStatus.map((d) => d.count);
      const timer = setTimeout(() => {
        setAnimatedData(targetData);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, leadsByStatus]);

  const maxValue = Math.max(...leadsByStatus.map((d) => d.count), 1);
  const gridLines = 5;

  // Generate bar colors based on leadStatus
  const barColors = leadsByStatus.map(
    (item) => statusColors[item.leadStatus] || statusColors.DEFAULT
  );

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "16px",
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          height: "100%",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: `0 12px 24px ${alpha(
              theme.palette.mode === "dark"
                ? theme.palette.common.black
                : theme.palette.primary.main,
              0.1
            )}`,
          },
          background:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(8px)",
          position: "relative",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                display: "flex",
                alignItems: "center",
              }}
            >
              <AssessmentRounded
                sx={{
                  mr: 1,
                  color: theme.palette.primary.main,
                  opacity: 0.7,
                  animation: loading
                    ? "pulse 1.5s infinite ease-in-out"
                    : "none",
                  "@keyframes pulse": {
                    "0%": { opacity: 0.7 },
                    "50%": { opacity: 0.4 },
                    "100%": { opacity: 0.7 },
                  },
                }}
              />
              {title}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ pt: 1 }}>
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
              <Skeleton
                variant="rectangular"
                height={250}
                sx={{ borderRadius: 2 }}
              />
            </Box>
          ) : (
            <Box sx={{ height: 280, position: "relative" }}>
              {leadsByStatus.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    color: theme.palette.text.secondary,
                  }}
                >
                  <AssessmentRounded
                    sx={{ fontSize: 40, opacity: 0.4, mb: 2 }}
                  />
                  <Typography variant="body2">
                    No lead data available
                  </Typography>
                </Box>
              ) : (
                <BarChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: leadsByStatus.map((d) => d.leadStatus),
                      tickLabelStyle: {
                        fontSize: 12,
                        fill: alpha(theme.palette.text.primary, 0.7),
                        textAnchor: "end",
                        transform: "rotate(-45)",
                      },
                      label: "Status",
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      max: Math.ceil((maxValue * 1.2) / gridLines) * gridLines,
                      tickNumber: gridLines,
                      tickLabelStyle: {
                        fontSize: 12,
                        fill: alpha(theme.palette.text.primary, 0.7),
                      },
                      tickSize: 0,
                      gridLineStyle: {
                        stroke: alpha(theme.palette.divider, 0.2),
                        strokeDasharray: "3 3",
                      },
                    },
                  ]}
                  series={[
                    {
                      type: "bar",
                      data: animatedData,
                      valueFormatter: (value) => `${value} leads`,
                      // Don't set any color here
                    },
                  ]}
                  colors={barColors} // Set colors at the chart level
                  margin={{ left: 40, right: 10, top: 20, bottom: 50 }}
                  height={280}
                  sx={{
                    ".MuiChartsAxis-line": {
                      stroke: alpha(theme.palette.divider, 0.3),
                    },
                    ".MuiChartsAxis-tick": {
                      stroke: alpha(theme.palette.divider, 0.3),
                    },
                    ".MuiChartsLegend-series": {
                      fontSize: "0.75rem",
                    },
                    // Apply border radius to all bars
                    ".MuiBarElement-root": {
                      borderRadius: "6px",
                    },
                  }}
                >
                  <ChartsTooltip
                    trigger="item"
                    sx={{
                      backgroundColor: alpha(
                        theme.palette.background.paper,
                        0.9
                      ),
                      boxShadow: theme.shadows[3],
                      borderRadius: 1.5,
                      p: 1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      backdropFilter: "blur(8px)",
                    }}
                  />
                </BarChart>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default LeadsByStatusChart;
