import React, { useEffect, useState } from "react";
import { Container, Grid, alpha } from "@mui/material";
import { useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Contexts
import { useAuth } from "../../../context/AuthContext";
import { useSnackbar } from "../../../context/SnackbarContext";

// Supabase
import { supabase } from "../../../../supabase/supabaseClient";

// Custom Hooks
import { useDealerGroups } from "../../../hooks/general/useDealerGroups";
import { useUserDealerships } from "../../../hooks/general/useUserDealerships";
import useSalesConsultants from "../../../hooks/general/useSalesConsultants";

// Leads Logic
import { fetchLeadsByStatus } from "../../../hooks/leads/useLeadsByStatus";
import { fetchLeadsBySource } from "../../../hooks/leads/useLeadsBySource";

// Utilities
import { formatResponseTime } from "../../../utils/formatters";
import { getTimeRange } from "../../../utils/time";
import isGlobalAdmin from "../../../auth/isGlobalAdmin";

// UI Components
import HeaderSection from "../../../common/headerSection/HeaderSection";
import Filters from "../../../common/filters/Filters";
import UnattendedLeadsAlert from "../../crm/leads/UnattendedLeadsAlert";
import MetricsGrid from "./MetricsGrid";
import LeadsByStatusChart from "./LeadsByStatusChart";
import LeadsBySourcePie from "./LeadsBySourcePie";
import IncomingLeadsLineChart from "./IncomingLeadsLineChart";
import LeadBreakdownTable from "./LeadBreakdownTable";

// Icons
import { Add, Email, Phone, RefreshRounded } from "@mui/icons-material";
import { useCurrentDealerGroup } from "../../../hooks/general/useCurrentDealerGroup";

const THEME_COLORS = {
  warning: ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa"],
};

const fetchAvgResponseTime = async (dealership_id) => {
  try {
    let query = supabase
      .from("lead_response_times")
      .select("response_time_minutes");
    if (dealership_id) query = query.eq("dealership_id", dealership_id);
    const { data, error } = await query;
    if (error) throw error;
    const valid = data.filter(
      (row) =>
        row.response_time_minutes !== null &&
        !isNaN(parseFloat(row.response_time_minutes))
    );
    if (!valid.length) return 0;
    const total = valid.reduce(
      (acc, cur) => acc + parseFloat(cur.response_time_minutes),
      0
    );
    return (total / valid.length).toFixed(2);
  } catch (err) {
    console.error("Error fetching response times:", err);
    return 0;
  }
};

const fetchRespondedLeadsBySource = async (
  dealershipId,
  startDate,
  endDate
) => {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("lead_source")
      .neq("lead_status", "UNATTENDED")
      .eq("dealership_id", dealershipId)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) throw error;

    const counts = data.reduce((acc, row) => {
      const source = row.lead_source || "Unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([lead_source, count]) => ({
      lead_source,
      count,
    }));
  } catch (err) {
    console.error("Error in fetchRespondedLeadsBySource:", err);
    return [];
  }
};

const LeadsDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, accessContext } = useAuth();
  const { showSnackbar } = useSnackbar();

  // State
  const [selectedDealership, setSelectedDealership] = useState(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("week");
  const [selectedSalesperson, setSelectedSalesperson] = useState("");
  const [leadsByStatus, setLeadsByStatus] = useState([]);
  const [leadsBySource, setLeadsBySource] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hooks
  const { data: dealerGroups, loading: loadingDealerGroups } =
    useDealerGroups();

  const dealergroup_id = useCurrentDealerGroup();
  
  const {
    data: { dealerships: userDealerships = [], primaryDealership } = {},
    loading: loadingDealerships,
  } = useUserDealerships(user?.id);

  const { salespeople, loading: loadingSalespeople } =
    useSalesConsultants(selectedDealership);

  // useEffects
  useEffect(() => {
    if (primaryDealership) {
      setSelectedDealership(primaryDealership);
    }
  }, [primaryDealership]);

  useEffect(() => {
    fetchData();
  }, [selectedDealership, selectedTimeFilter, selectedSalesperson]);

  // Handlers
  const handleAdmin = () => {
    navigate("/leadflow/admin");
  };

  // const handleRefresh = () => {
  //   if (selectedDealership) {
  //     fetchVisits();
  //     showSnackbar("Data refreshed!", "success");
  //   }
  // };

  const fetchData = async () => {
    if (!selectedDealership) return;
    setLoading(true);

    try {
      const { start, end } = getTimeRange(selectedTimeFilter);

      const [
        leadsStatusData,
        salesSourceData,
        avgResponseTime,
        respondedLeadsData,
      ] = await Promise.all([
        fetchLeadsByStatus(
          selectedDealership,
          start.toISOString(),
          end.toISOString(),
          selectedSalesperson || undefined
        ),
        fetchLeadsBySource(
          selectedDealership,
          start.toISOString(),
          end.toISOString(),
          selectedSalesperson || undefined
        ),
        fetchAvgResponseTime(selectedDealership),
        fetchRespondedLeadsBySource(
          selectedDealership,
          start.toISOString(),
          end.toISOString()
        ),
      ]);

      const respondedMap = new Map();
      respondedLeadsData.forEach((item) =>
        respondedMap.set(item.lead_source, item.count)
      );

      const grandTotalLeads = salesSourceData.reduce(
        (sum, s) => sum + s.count,
        0
      );

      const enrichedSources = (salesSourceData || []).map((item, idx) => {
        const total = item.count;
        const responded = respondedMap.get(item.leadSource) || 0;
        const allocation =
          grandTotalLeads > 0
            ? `${Math.round((total / grandTotalLeads) * 100)}%`
            : "0%";

        return {
          ...item,
          color: THEME_COLORS.warning[idx % THEME_COLORS.warning.length],
          responded,
          allocation,
          avgResponseTime: item.avgResponseTime || "—",
        };
      });

      setLeadsBySource(enrichedSources);
      setLeadsByStatus(leadsStatusData);

      const totalLeads = leadsStatusData.reduce((sum, s) => sum + s.count, 0);
      const unattendedLeads =
        leadsStatusData.find((s) => s.leadStatus === "UNATTENDED")?.count || 0;
      const responseRate =
        totalLeads > 0
          ? `${((1 - unattendedLeads / totalLeads) * 100).toFixed(0)}%`
          : "0%";

      const newMetrics = [
        {
          key: "totalLeads",
          label: "Total Leads",
          value: totalLeads,
          icon: <Add fontSize="inherit" />,
          iconColor: "#2563eb",
        },
        {
          key: "unattended",
          label: "Unattended Leads",
          value: unattendedLeads,
          icon: <Email fontSize="inherit" />,
          iconColor: "#dc2626",
        },
        {
          key: "responseRate",
          label: "Response Rate",
          value: responseRate,
          icon: <Phone fontSize="inherit" />,
          iconColor: "#16a34a",
        },
        {
          key: "avgResponse",
          label: "Avg. Response Time",
          value: avgResponseTime ? formatResponseTime(avgResponseTime) : "N/A",
          icon: <RefreshRounded fontSize="inherit" />,
          iconColor: "#f59e0b",
        },
      ];

      setMetrics(newMetrics);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ width: "95%", mt: { xs: 3, sm: 4 } }}>
      <HeaderSection
        title="LeadFlow Dashboard"
        subtitle="Monitor visitor traffic and engagement"
        sx={{
          background: "linear-gradient(to right, #4A90E2, #007BFF)",
          color: "white",
          padding: "20px",
          borderRadius: "10px",
        }}
        action={{
          label: "Admin",
          onClick: handleAdmin,
          icon: "Add",
        }}
        // additionalActions={[
        //   {
        //     label: "Refresh Data",
        //     onClick: handleRefresh,
        //     icon: "RefreshRounded",
        //   },
        // ]}
      />

      <UnattendedLeadsAlert
        onViewUnattended={() => navigate("/crm/unattended-leads")}
      />

      <Filters
        dealerGroups={dealerGroups}
        dealerships={userDealerships}
        selected_dealergroup_id={dealergroup_id}
        selectedDealershipId={selectedDealership}
        loadingDealerships={loadingDealerships}
        // onDealerGroupChange={setDealerGroupId}
        onDealershipChange={setSelectedDealership}
        isGlobalAdmin={isGlobalAdmin}
        showTimeRangeFilter
        showSalespersonFilter
        timeRangeOptions={[
          { value: "day", label: "Today" },
          { value: "week", label: "This Week" },
          { value: "month", label: "This Month" },
        ]}
        selectedTimeRange={selectedTimeFilter}
        onTimeRangeChange={setSelectedTimeFilter}
        onSalespersonChange={setSelectedSalesperson}
        selectedSalesperson={selectedSalesperson}
        salespeople={salespeople}
      />

      <Grid container spacing={4}>
        <MetricsGrid loading={loading} metrics={metrics} />
        <Grid container item spacing={4}>
          <LeadsByStatusChart loading={loading} leadsByStatus={leadsByStatus} />
          <LeadsBySourcePie loading={loading} leadsBySource={leadsBySource} />
          {/* <IncomingLeadsLineChart loading={loading} visits={visits} /> */}
        </Grid>
        <Grid item xs={12}>
          <LeadBreakdownTable loading={loading} leadsBySource={leadsBySource} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default LeadsDashboard;
