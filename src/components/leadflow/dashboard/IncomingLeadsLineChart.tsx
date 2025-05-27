// IncomingLeadsLineChart.jsx
import React from "react";
import { Card, CardContent, Typography, Skeleton, Box, alpha, Grid } from "@mui/material";
import { useTheme } from "@mui/material";
import { LineChart, ChartsTooltip } from "@mui/x-charts";
import { TrendingUpRounded } from "@mui/icons-material";
import dayjs from "dayjs";

const IncomingLeadsLineChart = ({ loading = false, visits = [] }) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "16px",
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          height: "100%",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
          },
          background:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(8px)",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              mb: 3,
              display: "flex",
              alignItems: "center",
            }}
          >
            <TrendingUpRounded
              sx={{ mr: 1, color: theme.palette.primary.main, opacity: 0.7 }}
            />
            Incoming Leads
          </Typography>

          {loading ? (
            <Skeleton variant="rectangular" height={250} />
          ) : (
            <Box sx={{ height: 280 }}>
              <LineChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: visits.map((v) => dayjs(v.created_at).format("MMM D")),
                    tickLabelStyle: {
                      fontSize: 12,
                      fill: alpha(theme.palette.text.primary, 0.7),
                    },
                  },
                ]}
                series={[
                  {
                    data: visits.map((v) => v.count || 0),
                    label: "Leads",
                    color: "#28a745",
                    area: true,
                    showMark: ({ index }) => index % 2 === 0,
                    curve: "natural",
                  },
                ]}
                sx={{
                  ".MuiLineElement-root": {
                    strokeWidth: 3,
                  },
                  ".MuiAreaElement-root": {
                    fill: `url(#lineGradient-${theme.palette.mode})`,
                  },
                  ".MuiChartsAxis-line": {
                    stroke: alpha(theme.palette.divider, 0.3),
                  },
                  ".MuiChartsAxis-tick": {
                    stroke: alpha(theme.palette.divider, 0.3),
                  },
                }}
                margin={{ left: 40, right: 10, top: 20, bottom: 30 }}
                width={300}
                height={280}
              >
                <defs>
                  <linearGradient
                    id={`lineGradient-${theme.palette.mode}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#28a745" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#28a745" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <ChartsTooltip />
              </LineChart>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default IncomingLeadsLineChart;
