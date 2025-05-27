import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Skeleton,
  Box,
  alpha,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { PieChart, ChartsTooltip } from "@mui/x-charts";
import { DonutLargeRounded } from "@mui/icons-material";

const LeadsBySourcePie = ({
  loading = false,
  leadsBySource = [],
  title = "Leads by Source",
}) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "16px",
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          height: "100%",
          transition: "all 0.3s ease",
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
              <DonutLargeRounded
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
          ) : leadsBySource.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                height: 250,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                color: theme.palette.text.secondary,
              }}
            >
              <DonutLargeRounded sx={{ fontSize: 40, opacity: 0.4, mb: 2 }} />
              <Typography variant="body2">No lead data available</Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 250,
                }}
              >
                <PieChart
                  series={[
                    {
                      data: leadsBySource.map((source, idx) => ({
                        id: idx,
                        value: source.count,
                        color: source.color,
                        label: source.leadSource,
                      })),
                      innerRadius: 50,
                      outerRadius: 90,
                      paddingAngle: 1,
                      cornerRadius: 4,
                      highlightScope: {
                        faded: "global",
                        highlighted: "item",
                      },
                      faded: {
                        innerRadius: 48,
                        outerRadius: 88,
                        color: "gray",
                      },
                    },
                  ]}
                  width={300}
                  height={200}
                  margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                  slotProps={{ legend: { hidden: true } }}
                >
                  <ChartsTooltip />
                </PieChart>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  mt: 3,
                }}
              >
                {leadsBySource.map((source, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 1.5,
                      py: 0.75,
                      m: 0.5,
                      borderRadius: "20px",
                      backgroundColor: alpha(source.color, 0.1),
                      border: `1px solid ${alpha(source.color, 0.2)}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        backgroundColor: source.color,
                        borderRadius: "50%",
                        mr: 1,
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      {source.leadSource}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default LeadsBySourcePie;
