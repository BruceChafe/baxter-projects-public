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
import { useAuth } from "../../../context/AuthContext";
import { useSnackbar } from "../../../context/SnackbarContext";
import isGlobalAdmin from "../../../auth/isGlobalAdmin";
import DashboardPage from "../../../common/Dashboard/DashboardPage";
import useFetchBannedCustomers from "../../../hooks/visits/useFetchBannedCustomers";
import { useUserDealerships } from "../../../hooks/general/useUserDealerships";
import { useCurrentDealerGroup } from "../../../hooks/general/useCurrentDealerGroup";
import { useDealerGroups } from "../../../hooks/general/useDealerGroups";
import TrialExpired from "../../admin/billing/TrialExpired";
import HeaderSection from "../../../common/headerSection/HeaderSection";
import { RefreshRounded } from "@mui/icons-material";
import Filters from "../../../common/filters/Filters";
import DataTableLayout from "../../../common/DataTableLayout";
import useProjectAccess from "../../../hooks/admin/checkProjectAccess";

interface BannedContactData {
  id: number;
  first_name: string;
  last_name: string;
  dateBanned: string;
}

const FEATURE_SLUG = "banned_contacts";

const BannedContactsDashboard: React.FC = () => {
  const theme = useTheme();
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

  const {
    projectAccess,
    loading: loadingAccess,
    error: accessError,
  } = useProjectAccess(selectedDealership, dealergroup_id || "");

  const canAccessFeature = (projectSlug: string) => {
    // if the group is still on trial, give them full basic access
    if (accessContext?.trialing) return true;

    // otherwise only allow if tier === "basic"
    return projectAccess[projectSlug] === "basic";
  };

  // useEffects
  useEffect(() => {
    if (primaryDealership) {
      setSelectedDealership(primaryDealership);
    }
  }, [primaryDealership]);

  const {
    bannedVisitors,
    loading: loadingBannedVisitors,
    error: errorBannedVisitors,
    fetchBannedVisitors,
  } = useFetchBannedCustomers(
    selectedDealership ? dealergroup_id : null,
    selectedDealership
  );

  const mappedBannedContacts = useMemo<BannedContactData[]>(() => {
    return bannedVisitors.map((item) => ({
      id: item.id,
      first_name: item.contact?.first_name ?? "N/A",
      last_name: item.contact?.last_name ?? "N/A",
      dateBanned: item.banned_at,
    }));
  }, [bannedVisitors]);

  const onApplyFilters = useCallback(() => {
    setPage(0);
    setDataRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleRefresh = useCallback(() => {
    onApplyFilters();
    showSnackbar("Data refreshed!", "success");
  }, [onApplyFilters, showSnackbar]);

  const columns = React.useMemo(() => {
    return [
      { id: "first_name", label: "First Name" },
      { id: "last_name", label: "Last Name" },
      {
        id: "dateBanned",
        label: "Date Banned",
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
    ];
  }, []);

  // Grant access if trialing, active, or tier === "basic"
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
        title="Banned Contacts"
        subtitle="Review banned contact details"
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
        showTimeRangeFilter={false}
        showSalespersonFilter={false}
        timeRangeOptions={[
          { value: "day", label: "Today" },
          { value: "week", label: "This Week" },
          { value: "month", label: "This Month" },
        ]}
      />
      <DataTableLayout
        columns={columns}
        data={mappedBannedContacts}
        loading={loadingBannedVisitors}
        error={errorBannedVisitors}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={mappedBannedContacts.length}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) =>
          setRowsPerPage(parseInt(event.target.value, 10))
        }
      />
    </Container>
  );
};

export default BannedContactsDashboard;
