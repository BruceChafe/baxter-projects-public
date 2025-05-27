import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Skeleton,
  Chip,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Badge,
  Button,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

// Contexts
import { useAuth } from "../../../context/AuthContext";
import { useSnackbar } from "../../../context/SnackbarContext";

// Supabase
import { supabase } from "../../../../supabase/supabaseClient";

// Custom Hooks
import { useDealerGroups } from "../../../hooks/general/useDealerGroups";
import { useUserDealerships } from "../../../hooks/general/useUserDealerships";
import useSalesConsultants from "../../../hooks/general/useSalesConsultants";

// Utilities
import { formatResponseTime } from "../../../utils/formatters";
import { getTimeRange } from "../../../utils/time";
import isGlobalAdmin from "../../../auth/isGlobalAdmin";

// UI Components
import HeaderSection from "../../../common/headerSection/HeaderSection";
import Filters from "../../../common/filters/Filters";
import UnattendedLeadsAlert from "../../crm/leads/UnattendedLeadsAlert";
import MetricsGrid from "../dashboard/MetricsGrid";

// Icons
import {
  Search,
  ChevronRightRounded,
  MoreVertRounded,
  PersonOutlined,
  SortRounded,
  RefreshRounded,
} from "@mui/icons-material";

// Local helpers
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "new":
      return { bg: "#e3f2fd", color: "#1565c0" };
    case "contacted":
      return { bg: "#fff8e1", color: "#f57f17" };
    case "qualified":
      return { bg: "#e8f5e9", color: "#2e7d32" };
    case "lost":
      return { bg: "#ffebee", color: "#c62828" };
    default:
      return { bg: "#f5f5f5", color: "#757575" };
  }
};

// Main Component
const LeadsDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const query = useQuery();
  const source = query.get("source") || "";

  const { user, accessContext } = useAuth();
  const { showSnackbar } = useSnackbar();

  // State
  const [dealergroup_id, setDealerGroupId] = useState(null);
  const [selectedDealership, setSelectedDealership] = useState(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("week");
  const [selectedSalesperson, setSelectedSalesperson] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);

  // Hooks
  const { data: dealerGroups, loading: loadingDealerGroups } =
    useDealerGroups();
  const {
    data: { dealerships: userDealerships = [], primaryDealership } = {},
    loading: loadingDealerships,
  } = useUserDealerships(user?.id);
  const { salespeople, loading: loadingSalespeople } =
    useSalesConsultants(selectedDealership);

  // Effects
  useEffect(() => {
    if (user) {
      const dgId =
        user.user_metadata?.dealergroup_id ||
        user.raw_user_meta_data?.dealergroup_id ||
        null;
      setDealerGroupId(dgId);
    }
  }, [user]);

  useEffect(() => {
    if (primaryDealership) {
      setSelectedDealership(primaryDealership);
    }
  }, [primaryDealership]);

  useEffect(() => {
    fetchLeads();
  }, [selectedDealership, selectedTimeFilter, selectedSalesperson]);

  // Handlers
  const fetchLeads = async () => {
    if (!selectedDealership) return;

    setLoading(true);

    const { start, end } = getTimeRange(selectedTimeFilter);

    try {
      let query = supabase
        .from("leads")
        .select(
          `
          *,
          contacts (
            first_name,
            last_name
          )
        `
        )
        .eq("dealership_id", selectedDealership)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .ilike("lead_source", source);

      if (selectedSalesperson) {
        query = query.eq("assigned_to", selectedSalesperson);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLeads(data || []);
      setFilteredLeads(data || []);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ width: "95%", mt: { xs: 3, sm: 4 } }}>
      <HeaderSection
        title={`Leads by Source: ${source}`}
        subtitle="Filter and explore leads by source, dealership, date range, and assigned consultant."
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
        onDealerGroupChange={setDealerGroupId}
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

      <Card elevation={1} sx={{ mb: 4, borderRadius: 2, overflow: "visible" }}>
        <CardContent sx={{ pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Leads from <span style={{ color: "#1976d2" }}>{source}</span>
            </Typography>

            {/* <Box>
              <Tooltip title="More options">
                <IconButton onClick={handleMenuOpen} size="small">
                  <MoreVertRounded />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleSort}>
                  <SortRounded fontSize="small" sx={{ mr: 1 }} />
                  Sort by {sortDirection === "desc" ? "Oldest" : "Newest"}
                </MenuItem>
                <MenuItem onClick={handleRefresh}>
                  <RefreshRounded fontSize="small" sx={{ mr: 1 }} />
                  Refresh data
                </MenuItem>
              </Menu>
            </Box> */}
          </Box>

          {/* Search bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm("")}
                      edge="end"
                    >
                      <Typography variant="caption" color="primary">
                        Clear
                      </Typography>
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ backgroundColor: "transparent" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Lead Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date Created</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton height={30} width="80%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton height={30} width="60%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton height={30} width="40%" />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton
                          height={30}
                          width={30}
                          sx={{ margin: "0 auto" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                      <PersonOutlined
                        sx={{ fontSize: 48, color: "#bdbdbd", mb: 1 }}
                      />
                      <Typography variant="body1" color="textSecondary">
                        No leads found for this source.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => {
                    const statusStyle = getStatusColor(lead.lead_status);
                    const fullName = lead.contacts
                      ? `${lead.contacts.first_name ?? ""} ${
                          lead.contacts.last_name ?? ""
                        }`.trim()
                      : "—";
                    return (
                      <TableRow
                        key={lead.id}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(25, 118, 210, 0.04)",
                            cursor: "pointer",
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                backgroundColor: "#e3f2fd",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#1976d2",
                                fontWeight: "bold",
                                mr: 1.5,
                              }}
                            >
                              {(fullName || "?").charAt(0).toUpperCase()}
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {fullName}
                              </Typography>
                              {lead.email && (
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {lead.email}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {lead.created_at
                              ? dayjs(lead.created_at).format("MMM D, YYYY")
                              : "—"}
                          </Typography>
                          {lead.created_at && (
                            <Typography variant="caption" color="textSecondary">
                              {dayjs(lead.created_at).format("h:mm A")}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={lead.lead_status || "Unknown"}
                            size="small"
                            sx={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              fontWeight: 500,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View lead details">
                            <IconButton
                              size="small"
                              sx={{
                                color: "#1976d2",
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                                },
                              }}
                              onClick={() =>
                                console.log("View lead detail:", lead.id)
                              }
                            >
                              <ChevronRightRounded />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LeadsDashboard;
