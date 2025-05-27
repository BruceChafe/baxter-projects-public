import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Button,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import UserCreationDialog from "./UserCreationDialog";
import UserDetailsDialog from "./UserDetailsDialog";
import ActionDialogs from "../shared/ActionDialogs";
import { ColumnVisibility, UserData } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import HeaderSection from "../../../common/headerSection/HeaderSection";
import Filters from "../../../common/filters/Filters";
import { useSnackbar } from "../../../context/SnackbarContext";
import StateDisplay from "../../upshift/shared/stateDisplay/StateDisplay";
import DataTableLayout from "../../../common/DataTableLayout";
import { useUsers } from "../../../hooks/useUsers";
import { supabase } from "../../../../supabase/supabaseClient";
import PageHelmet from "../../shared/PageHelmet";

const columnDefinitions = [
  { id: "first_name", label: "First Name", sortable: true },
  { id: "last_name", label: "Last Name", sortable: true },
  { id: "jobTitle", label: "Job Title", sortable: true },
  { id: "department", label: "Department", sortable: true },
  { id: "lastLogin", label: "Last Login", sortable: true },
  { id: "role", label: "Role", sortable: false },
];

const UsersDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, accessContext } = useAuth();
  const { showSnackbar } = useSnackbar();

  // 1) Single group ID from accessContext
  const dealergroup_id = accessContext?.dealergroupId ?? null;

  // 2) Load only the dealerships *this user* is assigned to
  const [userDealerships, setUserDealerships] = useState<
    { dealership_id: string; dealership_name: string }[]
  >([]);
  const [selectedDealership, setSelectedDealership] = useState<string | null>(
    null
  );
  const [loadingDealerships, setLoadingDealerships] = useState(false);

  const fetchUserDealerships = useCallback(async () => {
    if (!user) return;
    setLoadingDealerships(true);
    try {
      const { data, error } = await supabase
        .from("user_dealerships")
        .select(
          `
            dealership_id,
            is_primary,
            dealerships (dealership_name)
          `
        )
        .eq("user_id", user.id);

      if (error) throw error;

      const mapped = (data || []).map((d) => ({
        dealership_id: d.dealership_id,
        dealership_name: d.dealerships?.dealership_name ?? "—",
      }));
      setUserDealerships(mapped);

      // Pick the primary dealership or first one
      const primary = data?.find((d) => d.is_primary);
      setSelectedDealership(
        primary?.dealership_id ?? mapped[0]?.dealership_id ?? null
      );
    } catch (e) {
      console.error("Error fetching user dealerships:", e);
      showSnackbar("Could not load your dealerships", "error");
    } finally {
      setLoadingDealerships(false);
    }
  }, [user, showSnackbar]);

  useEffect(() => {
    fetchUserDealerships();
  }, [fetchUserDealerships]);

  // 3) Fetch users via your hook, only for this single dealership
  const {
    users,
    loading: usersLoading,
    error: usersError,
    refetchUsers,
    fetchUserById,
  } = useUsers(
    dealergroup_id && selectedDealership ? dealergroup_id : null,
    dealergroup_id && selectedDealership ? selectedDealership : null
  );

  // Dialog state
  const [isUserCreationDialogOpen, setIsUserCreationDialogOpen] =
    useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [confirmationText, setConfirmationText] = useState("");

  // Handlers
  const handleDealershipChange = (id: string | "") => {
    setSelectedDealership(id || null);
  };
  const handleNewUserClick = () => setIsUserCreationDialogOpen(true);
  const handleRowClick = (u: UserData) => {
    setSelectedUser(u);
    setUserDialogOpen(true);
  };
  const deleteUsers = async (ids: string[]) => {
    try {
      const { error } = await supabase.from("users").delete().in("id", ids);
      if (error) throw error;
      await refetchUsers();
      setSelectedUsers([]);
      showSnackbar("Users deleted", "success");
    } catch (e) {
      console.error("Delete users error:", e);
      showSnackbar("Failed to delete users", "error");
    }
  };

  // Loading / error states
  if (loadingDealerships || usersLoading) {
    return <Typography>Loading…</Typography>;
  }
  if (usersError) {
    return <Typography>Error: {usersError}</Typography>;
  }
  if (!dealergroup_id) {
    return <Typography>You aren’t in a dealer group</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      <PageHelmet
        title="Users | baxter-projects"
        description="Simple, transparent pricing."
      />
      <HeaderSection
        title="Users"
        subtitle="Manage team members by dealership"
        action={{
          label: "New User",
          onClick: handleNewUserClick,
          icon: <Add />,
          variant: "contained",
        }}
      />

      {/* Only 1 dealer group → skip dealer-group dropdown */}
      <Filters
        dealerGroups={[]} // no group filter
        dealerships={userDealerships} // only show assigned dealerships
        selected_dealergroup_id={dealergroup_id}
        selectedDealershipId={selectedDealership}
        loadingDealerships={loadingDealerships}
        onDealerGroupChange={() => {}}
        onDealershipChange={handleDealershipChange}
        isGlobalAdmin={false}
        showTimeRangeFilter={false}
        showSalespersonFilter={false}
        showSearchFilter={false}
        timeRangeOptions={[]}
        selectedTimeRange=""
        selectedSalesperson=""
        onTimeRangeChange={() => {}}
        salespeople={[]}
        onSalespersonChange={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
      />

      {users.length === 0 ? (
        <StateDisplay state="empty" emptyMessage="No users found." />
      ) : (
        <DataTableLayout
          columns={columnDefinitions}
          data={users}
          loading={usersLoading}
          error={usersError}
          emptyMessage="No users for this dealership."
          page={0}
          rowsPerPage={10}
          totalCount={users.length}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          sortColumn=""
          sortDirection="asc"
          onSort={() => {}}
          onRowClick={handleRowClick}
        />
      )}

      {selectedUsers.length > 0 && (
        <Button
          variant="contained"
          color="error"
          sx={{ mt: 2 }}
          onClick={() => setOpenDialog(true)}
        >
          Delete Selected Users
        </Button>
      )}

      <ActionDialogs
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        confirmationText={confirmationText}
        setConfirmationText={setConfirmationText}
        handleDeleteEntities={() => deleteUsers(selectedUsers)}
      />

      <UserDetailsDialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        user={selectedUser}
        onDeactivate={() => {}}
        refetchData={refetchUsers}
        fetchUserById={fetchUserById}
      />

      <UserCreationDialog
        open={isUserCreationDialogOpen}
        onClose={() => setIsUserCreationDialogOpen(false)}
        refetchData={refetchUsers}
      />
    </Container>
  );
};

export default UsersDashboard;
