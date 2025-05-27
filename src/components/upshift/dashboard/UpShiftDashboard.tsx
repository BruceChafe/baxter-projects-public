import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  Container,
  Grid,
  Card,
  Typography,
  Stack,
  Box,
  alpha,
  CardContent,
  Fade,
  Skeleton,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  PieChart,
  LineChart,
  ChartsTooltip,
  ChartsLegend,
} from "@mui/x-charts";
import { useNavigate } from "react-router-dom";

// Contexts
import { useAuth } from "../../../context/AuthContext";
import { useSnackbar } from "../../../context/SnackbarContext";

// Custom Hooks
import { useDealerGroups } from "../../../hooks/general/useDealerGroups";
import { useUserDealerships } from "../../../hooks/general/useUserDealerships";
import useSalesConsultants from "../../../hooks/general/useSalesConsultants";
import useFetchVisits from "../../../hooks/visits/useFetchVisits";
import useProjectAccess from "../../../hooks/admin/checkProjectAccess";

// Utilities
import isGlobalAdmin from "../../../auth/isGlobalAdmin";

// UI Components
import HeaderSection from "../../../common/headerSection/HeaderSection";
import Filters from "../../../common/filters/Filters";
import StateDisplay from "../shared/stateDisplay/StateDisplay";

// Icons
import {
  AccessTime,
  CalendarToday,
  DateRange,
  DirectionsCar,
  DirectionsWalk,
  GraphicEq,
  Insights,
  PeopleAlt,
  RefreshRounded,
  Today,
} from "@mui/icons-material";
import { useCurrentDealerGroup } from "../../../hooks/general/useCurrentDealerGroup";
import TrialExpired from "../../admin/billing/TrialExpired";

interface Metric {
  label: string;
  value: number;
  iconColor: string;
  icon: ReactNode;
}

const FEATURE_SLUG = "upshift_dashboard";

const UpShiftDashboard: React.FC = () => {
  const theme = useTheme();
  const { user, accessContext } = useAuth();
  const { showSnackbar } = useSnackbar();

  // 🔒 If the trial has expired and they're not active, block entirely
  if (accessContext && !accessContext.trialing && !accessContext.active) {
    return <TrialExpired />;
  }

  // State & filters
  const [selectedDealership, setSelectedDealership] = useState<string | null>(
    null
  );
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<
    "day" | "week" | "month"
  >("week");
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>("");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);

  // Hooks
  const { data: dealerGroups } = useDealerGroups();
  const dealergroup_id = useCurrentDealerGroup();

  const {
    data: { dealerships: userDealerships = [], primaryDealership } = {},
    loading: loadingDealerships,
  } = useUserDealerships(user?.id);

  const { salespeople } = useSalesConsultants(selectedDealership);
  const { visits } = useFetchVisits(
    selectedDealership,
    selectedTimeFilter,
    selectedSalesperson
  );

  const {
    projectAccess,
    loading: loadingAccess,
    error: accessError,
  } = useProjectAccess(selectedDealership, dealergroup_id || "");

  // Grant access if trialing, active, or tier === "basic"
  const canAccess =
    accessContext?.trialing ||
    accessContext?.active ||
    projectAccess[FEATURE_SLUG] === "basic";

  // Default selection to primary
  useEffect(() => {
    if (primaryDealership) {
      setSelectedDealership(primaryDealership);
    }
  }, [primaryDealership]);

  // Compute metrics when visits change
  useEffect(() => {
    if (!visits) return;

    const total = visits.length;
    const walkIns = visits.filter((v) => v.visit_reason === "Walk-In").length;
    const appts = visits.filter((v) => v.visit_reason === "Appointment").length;
    const newCount = visits.filter((v) => v.sales_type === "New").length;
    const usedCount = visits.filter((v) => v.sales_type === "Pre-Owned").length;

    setMetrics([
      {
        label: "Total Visits",
        value: total,
        iconColor: theme.palette.primary.main,
        icon: <DirectionsCar fontSize="inherit" />,
      },
      {
        label: "Walk-Ins",
        value: walkIns,
        iconColor: theme.palette.info.main,
        icon: <DirectionsWalk fontSize="inherit" />,
      },
      {
        label: "Appointments",
        value: appts,
        iconColor: theme.palette.success.main,
        icon: <CalendarToday fontSize="inherit" />,
      },
      {
        label: "New Interest",
        value: newCount,
        iconColor: theme.palette.warning.main,
        icon: <DirectionsCar fontSize="inherit" />,
      },
      {
        label: "Pre-Owned Interest",
        value: usedCount,
        iconColor: theme.palette.error.main,
        icon: <PeopleAlt fontSize="inherit" />,
      },
    ]);
  }, [visits, theme]);

  const handleRefresh = useCallback(() => {
    showSnackbar("Data refreshed!", "success");
  }, [showSnackbar]);

  const ChartCard = ({
    title,
    subtitle,
    icon,
    children,
  }: {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const theme = useTheme();

    return (
      <Card
        elevation={0}
        sx={{
          mb: 1,
          borderRadius: "16px",
          border: `1px solid ${theme.palette.divider}`,
          transition: "all 0.35s ease-in-out",
          p: 3,
          height: "100%",
          background:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(8px)",
          overflow: "hidden",
          position: "relative",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            background: `radial-gradient(circle, ${alpha(
              theme.palette.primary.main,
              0.08
            )} 0%, rgba(0,0,0,0) 70%)`,
            borderRadius: "50%",
          }}
        />

        <Stack
          spacing={1}
          direction="row"
          alignItems="center"
          position="relative"
        >
          {icon && (
            <Box
              sx={{
                fontSize: 32,
                mr: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.palette.primary.main,
                opacity: 0.7,
                animation: loading ? "pulse 1.5s infinite ease-in-out" : "none",
                "@keyframes pulse": {
                  "0%": { opacity: 0.7 },
                  "50%": { opacity: 0.4 },
                  "100%": { opacity: 0.7 },
                },
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        <Box sx={{ position: "relative" }}>{children}</Box>
      </Card>
    );
  };

  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      return true;
    });
  }, [visits]);

  const formatHourRange = (startHour: number, endHour: number) => {
    const to12h = (hour: number) =>
      `${((hour + 11) % 12) + 1}${hour >= 12 ? "PM" : "AM"}`;
    return `${to12h(startHour)} - ${to12h(endHour)}`;
  };

  const visitsByTime = useMemo(() => {
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const start = 8 + i * 2; // 8, 10, 12...
      return {
        range: formatHourRange(start, start + 2),
        count: 0,
      };
    });

    filteredVisits.forEach((visit) => {
      const hour = new Date(visit.created_at).getHours();
      const index = Math.floor((hour - 8) / 2);
      if (index >= 0 && index < buckets.length) {
        buckets[index].count += 1;
      }
    });

    return buckets;
  }, [filteredVisits]);

  const visitsBySalesType = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredVisits.forEach((visit) => {
      const type = visit.sales_type || "Unknown";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .filter((entry) => entry.count > 0);
  }, [filteredVisits]);

  const visitsByReason = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredVisits.forEach((visit) => {
      const reason = visit.visit_reason || "None";
      counts[reason] = (counts[reason] || 0) + 1;
    });
    return Object.entries(counts).map(([reason, count]) => ({ reason, count }));
  }, [filteredVisits]);

  const visitsByDay = useMemo(() => {
    const dayLabels = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const dayData = dayLabels.map((day) => ({ day, count: 0 }));

    filteredVisits.forEach((visit) => {
      const dayIndex = new Date(visit.created_at).getDay();
      const adjustedIndex = (dayIndex + 6) % 7;
      dayData[adjustedIndex].count += 1;
    });

    return dayData;
  }, [filteredVisits]);

  const getChartColor = (index: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ];
    return colors[index % colors.length];
  };

  // Block UI if no access
  if (!canAccess) {
    if (loadingAccess) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
          <CircularProgress />
        </Box>
      );
    }
    if (accessError) {
      return (
        <Typography color="error" align="center" mt={4}>
          Error loading access rights.
        </Typography>
      );
    }
    return (
      <Container sx={{ mt: 4 }}>
        <Card elevation={0} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Feature Unavailable
          </Typography>
          <Typography color="text.secondary">
            You don’t have access to the UpShift dashboard.
          </Typography>
        </Card>
      </Container>
    );
  }

  const visitsByType = useMemo(() => {
    const m: Record<string, number> = {};
    (visits || []).forEach((v) => {
      const t = v.sales_type || "Unknown";
      m[t] = (m[t] || 0) + 1;
    });
    return Object.entries(m).map(([type, count]) => ({ type, count }));
  }, [visits]);

  const getColor = (i: number) =>
    [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ][i % 5];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <HeaderSection
        title="UpShift Dashboard"
        subtitle="Monitor visitor traffic and engagement metrics"
        action={{
          label: "Refresh Data",
          onClick: handleRefresh,
          icon: <RefreshRounded />,
        }}
      />

      <Filters
        dealerGroups={dealerGroups}
        dealerships={userDealerships}
        selected_dealergroup_id={dealergroup_id}
        selectedDealershipId={selectedDealership}
        loadingDealerships={loadingDealerships}
        onDealershipChange={setSelectedDealership}
        isGlobalAdmin={false}
        showTimeRangeFilter
        timeRangeOptions={[
          { value: "day", label: "Today" },
          { value: "week", label: "This Week" },
          { value: "month", label: "This Month" },
        ]}
        selectedTimeRange={selectedTimeFilter}
        onTimeRangeChange={setSelectedTimeFilter}
        showSalespersonFilter
        salespeople={salespeople}
        selectedSalesperson={selectedSalesperson}
        onSalespersonChange={setSelectedSalesperson}
      />

      <Grid container spacing={4} sx={{ mt: 1 }}>
        {metrics.map((metric, idx) => (
          <Grid item xs={12} sm={6} md={2} key={idx}>
            <Card
              elevation={0}
              sx={{
                borderRadius: "16px",
                border: `1px solid ${theme.palette.divider}`,
                background: `linear-gradient(145deg, ${
                  theme.palette.background.paper
                } 0%, ${alpha(theme.palette.background.default, 0.7)} 100%)`,
                transition: "all 0.35s ease-in-out",
                "&:hover": {
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                },

                height: "100%",
                position: "relative",
                overflow: "hidden",
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
                  background: `radial-gradient(circle, ${alpha(
                    theme.palette.primary.main,
                    0.08
                  )} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
                  zIndex: 0,
                }}
              />
              <CardContent
                sx={{
                  position: "relative",
                  zIndex: 1,
                  p: 2.5,
                  pt: 3,
                }}
              >
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Skeleton variant="text" width="70%" height={24} />
                    <Skeleton variant="text" width="50%" height={40} />
                    <Skeleton variant="text" width="30%" height={20} />
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{
                        position: "absolute",
                        right: 12,
                        top: 12, // Move to top right instead of bottom
                        fontSize: 50, // Slightly smaller
                        opacity: 0.2, // Use opacity instead of alpha for more consistency
                        color: metric.iconColor || theme.palette.text.primary,
                      }}
                    >
                      {metric.icon}
                    </Box>

                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: "-0.5px",
                        mb: 0.5, // Less margin
                        position: "relative",
                      }}
                    >
                      {metric.value}
                    </Typography>

                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      {metric.label}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <ChartCard
            title="Visits by Time of Day"
            subtitle="Distribution of visits across business hours"
            icon={<AccessTime />}
          >
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: visitsByTime.map((b) => b.range),
                },
              ]}
              yAxis={[
                {
                  min: 0,
                  max: Math.max(10, ...visitsByTime.map((b) => b.count)),
                },
              ]}
              series={[
                {
                  data: visitsByTime.map((b) => b.count),
                  color: theme.palette.primary.main,
                },
              ]}
              height={300}
            >
              <ChartsTooltip />
            </BarChart>
          </ChartCard>
        </Grid>

        {/* Bar Chart: Visits by Day of Week */}
        <Grid item xs={12} md={6}>
          <ChartCard
            title="Visits by Day of Week"
            subtitle="Weekly patterns"
            icon={<DateRange />}
          >
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: visitsByDay.map((d) => d.day),
                },
              ]}
              yAxis={[
                {
                  min: 0,
                  max: Math.max(10, ...visitsByDay.map((d) => d.count)),
                },
              ]}
              series={[
                {
                  data: visitsByDay.map((d) => d.count),
                },
              ]}
              height={300}
            >
              <ChartsTooltip />
            </BarChart>
          </ChartCard>
        </Grid>

        {/* Pie Chart: Visits by Sales Type */}
        <Grid item xs={12} md={6}>
          <ChartCard
            title="Sales Type Distribution"
            subtitle="Breakdown of visitor interests by category"
            icon={<DirectionsCar />}
          >
            <PieChart
              series={[
                {
                  data: visitsBySalesType.map((item, index) => ({
                    value: item.count,
                    label: item.type,
                    color: getChartColor(index),
                  })),
                  innerRadius: 50,
                  outerRadius: 100,
                  arcLabel: (item) => `${item.value}`,
                },
              ]}
              height={300}
            >
              <ChartsTooltip />
            </PieChart>
          </ChartCard>
        </Grid>

        {/* Pie Chart: Visits by Reason */}
        <Grid item xs={12} md={6}>
          <ChartCard
            title="Visit Reasons Distribution"
            subtitle="Types of visitor engagement"
            icon={<GraphicEq />}
          >
            <PieChart
              series={[
                {
                  data: visitsByReason.map((item, index) => ({
                    id: index,
                    value: item.count,
                    label: item.reason,
                    color: getChartColor(index),
                  })),
                  innerRadius: 50,
                  outerRadius: 100,
                  arcLabel: (item) => `${item.value}`,
                },
              ]}
              height={300}
            >
              <ChartsTooltip />
            </PieChart>
          </ChartCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UpShiftDashboard;
