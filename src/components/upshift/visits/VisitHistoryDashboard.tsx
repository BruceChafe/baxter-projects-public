import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CircularProgress,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Contexts
import { useAuth } from "../../../context/AuthContext";
import { useSnackbar } from "../../../context/SnackbarContext";

// Custom Hooks
import { useDealerGroups } from "../../../hooks/general/useDealerGroups";
import { useUserDealerships } from "../../../hooks/general/useUserDealerships";
import useSalesConsultants from "../../../hooks/general/useSalesConsultants";
import useFetchVisits from "../../../hooks/visits/useFetchVisits";

// Utilities
import isGlobalAdmin from "../../../auth/isGlobalAdmin";

import { useCurrentDealerGroup } from "../../../hooks/general/useCurrentDealerGroup";
import VisitDetailsDialog from "./VisitDetailsDialog";
import TrialExpired from "../../admin/billing/TrialExpired";
import HeaderSection from "../../../common/headerSection/HeaderSection";
import { RefreshRounded } from "@mui/icons-material";
import Filters from "../../../common/filters/Filters";
import DataTableLayout from "../../../common/DataTableLayout";
import useProjectAccess from "../../../hooks/admin/checkProjectAccess";

const VisitHistoryDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, accessContext } = useAuth();
  const { showSnackbar } = useSnackbar();

  // 🔒 GATE: Block access if trial has expired
  if (accessContext && !accessContext.trialing && !accessContext.active) {
    return <TrialExpired />;
  }

  // State
  const [selectedDealership, setSelectedDealership] = useState(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("week");
  const [selectedSalesperson, setSelectedSalesperson] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);

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

  const {
    visits,
    loading: visitsLoading,
    error: visitsError,
    fetchVisits,
  } = useFetchVisits(
    selectedDealership,
    selectedTimeFilter,
    selectedSalesperson
  );

  const {
    projectAccess,
    loading: loadingAccess,
    error: accessError,
  } = useProjectAccess(selectedDealership, dealergroup_id || "");

  // useEffects
  useEffect(() => {
    if (primaryDealership) {
      setSelectedDealership(primaryDealership);
    }
  }, [primaryDealership]);

  // Handlers
  const handleRefresh = useCallback(() => {
    if (selectedDealership) {
      fetchVisits();
      setHasFetched(true); // optionally reset to true
      showSnackbar("Data refreshed!", "success");
    }
  }, [selectedDealership, fetchVisits, showSnackbar]);

  const handleApplyFilters = useCallback(() => {
    setPage(0);
    fetchVisits();
  }, [fetchVisits]);

  const columns = useMemo(
    () => [
      {
        id: "created_at",
        label: "Visit Date",
        render: (value: string) => new Date(value).toLocaleString(),
      },
      {
        id: "contact",
        label: "Visitor",
        render: (contact: any, row: any) => {
          const banned = row?.banned_status?.is_banned;
          if (!contact || !contact.first_name || !contact.last_name) {
            return "Unknown Visitor";
          }
          return `${contact.first_name} ${contact.last_name}${
            banned ? " (Banned)" : ""
          }`;
        },
      },
      {
        id: "sales_consultant",
        label: "Sales Consultant",
        render: (_: any, row: any) => {
          const userId = row?.sales_consultant_id;
          const consultant = salespeople.find((s) => s.user_id === userId);
          return consultant ? consultant.name : "N/A";
        },
      },
    ],
    []
  );

  const totalCount = visits.length;
  const paginatedVisits = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return visits.slice(startIndex, startIndex + rowsPerPage);
  }, [visits, page, rowsPerPage]);

  const handleRowClick = (visit: any) => {
    setSelectedVisit(visit);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedVisit(null);
  };

  const FEATURE_SLUG = "upshift";

  const canAccess =
    accessContext?.trialing ||
    accessContext?.active ||
    projectAccess[FEATURE_SLUG] === "basic";

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

  return (
    <Container maxWidth={false} sx={{ width: "95%", mt: { xs: 3, sm: 4 } }}>
      <HeaderSection
        title="Visit History"
        subtitle="Review visitor details and dealership activity"
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
        onApplyFilters={handleApplyFilters}
      />

      <DataTableLayout
        columns={columns}
        data={paginatedVisits}
        loading={visitsLoading}
        error={visitsError}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) =>
          setRowsPerPage(parseInt(event.target.value, 10))
        }
        onRowClick={handleRowClick}
      />

      {dialogOpen && selectedVisit && (
        <VisitDetailsDialog
          open={dialogOpen}
          handleClose={handleCloseDialog}
          visit={selectedVisit}
        />
      )}
    </Container>
  );
};

export default VisitHistoryDashboard;
