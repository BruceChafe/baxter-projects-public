import React, { useState, useEffect, useMemo } from "react";
import {
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  Merge,
  Launch,
  OpenInNew,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import isGlobalAdmin from "../../auth/isGlobalAdmin";
import DashboardPage from "../../common/Dashboard/DashboardPage";
import NewContactDialog from "./NewContactDialog";
import UploadContactsDialog from "../../utils/Upload";
import MergeContactsDialog from "./contact/MergeContactsDialog";

// Hooks
import { useContacts, Contact } from "../../hooks/contacts/useContacts";
import { useSnackbar } from "../../context/SnackbarContext";

const ContactsDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user, accessContext } = useAuth();
  const { showSnackbar } = useSnackbar();

  // Filter states
  const [dealergroup_id, setDealerGroupId] = useState<string | null>(null);
  const [selectedDealerGroupId, setSelectedDealerGroupId] = useState<
    string | null
  >(null);
  const [selectedDealershipId, setSelectedDealershipId] = useState<
    string | null
  >(null);

  // For building filter dropdowns
  const [dealerGroups, setDealerGroups] = useState<any[]>([]);
  const [userDealerships, setUserDealerships] = useState<any[]>([]);
  const [loadingDealerGroups, setLoadingDealerGroups] = useState(false);
  const [loadingDealerships, setLoadingDealerships] = useState(false);
  const [errorDealerGroups, setErrorDealerGroups] = useState<string | null>(
    null
  );
  const [errorDealerships, setErrorDealerships] = useState<string | null>(null);

  const navigate = useNavigate();

  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Merge / multi-select logic
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  // Dialogs
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);
  const [isUploadContactsDialogOpen, setIsUploadContactsDialogOpen] =
    useState(false);
  const [isMergeContactsDialogOpen, setIsMergeContactsDialogOpen] =
    useState(false);

  // Fetch contacts
  const {
    contacts,
    loading: contactsLoading,
    error: contactsError,
    fetchContacts,
  } = useContacts(selectedDealerGroupId, selectedDealershipId);

  // 1) Fetch DealerGroups
  useEffect(() => {
    const fetchDealerGroups = async () => {
      setLoadingDealerGroups(true);
      setErrorDealerGroups(null);
      try {
        const { data, error } = await supabase.from("dealergroups").select("*");
        if (error) throw error;
        setDealerGroups(data || []);
      } catch (err) {
        console.error("Error fetching dealer groups:", err);
        setErrorDealerGroups("Failed to load dealer groups.");
      } finally {
        setLoadingDealerGroups(false);
      }
    };
    fetchDealerGroups();
  }, []);

  // 2) Extract DealerGroupID from user
  useEffect(() => {
    if (user) {
      const dgId =
        user.user_metadata?.dealergroup_id ||
        user.raw_user_meta_data?.dealergroup_id ||
        null;
      setDealerGroupId(dgId);
      if (dgId) setSelectedDealerGroupId(String(dgId));
    }
  }, [user]);

  // 3) Fetch Dealerships for This DealerGroup
  useEffect(() => {
    if (dealergroup_id) {
      const fetchDealershipsForDG = async () => {
        setLoadingDealerships(true);
        setErrorDealerGroups(null);
        try {
          const { data, error } = await supabase
            .from("dealerships")
            .select("*")
            .eq("dealergroup_id", dealergroup_id);
          if (error) throw error;
          // Store all dealerships for the group
          setUserDealerships(data || []);
        } catch (err) {
          console.error("Error fetching dealerships:", err);
          setErrorDealerGroups("Failed to load dealerships.");
        } finally {
          setLoadingDealerships(false);
        }
      };
      fetchDealershipsForDG();
    }
  }, [dealergroup_id]);

  // 4) Determine the user's default dealership
  useEffect(() => {
    const fetchUserDealerships = async () => {
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
        if (data && data.length > 0) {
          const userDs = data.map((d) => ({
            dealership_id: d.dealership_id,
            dealership_name:
              d.dealerships?.dealership_name || "Unknown Dealership",
          }));
          setUserDealerships(userDs);
          const primary = data.find((d) => d.is_primary);
          const defaultDealership = primary
            ? primary.dealership_id
            : data[0].dealership_id;
          setSelectedDealershipId(defaultDealership);
        } else {
          setSelectedDealershipId("");
        }
      } catch (err) {
        console.error("Error fetching user dealerships:", err);
      } finally {
        setLoadingDealerships(false);
      }
    };
    fetchUserDealerships();
  }, [user]);

  // 5) Auto-refetch visits when filters change
  useEffect(() => {
    if (selectedDealershipId || selectedDealerGroupId) {
      fetchContacts();
    }
  }, [selectedDealershipId, selectedDealerGroupId, fetchContacts]);

  useEffect(() => {
    if (selectedContacts.length === 2) {
      setIsMergeContactsDialogOpen(true);
    }
  }, [selectedContacts]);

  // Dialog handlers
  const handleNewContactDialogOpen = () => setIsNewContactDialogOpen(true);
  const handleNewContactDialogClose = () => setIsNewContactDialogOpen(false);

  const handleUploadContactsDialogOpen = () =>
    setIsUploadContactsDialogOpen(true);
  const handleUploadContactsDialogClose = () =>
    setIsUploadContactsDialogOpen(false);

  const handleMergeContactsDialogOpen = () => {

    if (selectedContacts.length < 2) {
      showSnackbar("Select 2 contacts to merge.", "warning");
      return;
    }
    setIsMergeContactsDialogOpen(true);
  };

  const handleMergeContactsDialogClose = () => {
    setIsMergeContactsDialogOpen(false);
    setSelectedContacts([]);
    setIsSelectMode(false);
  };

  // Pagination handlers
  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => setPage(newPage);

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Refresh callback for DashboardPage
  const handleRefresh = () => {
    fetchContacts();
    // optionally show a snackbar or set state
  };

  // Data for the table
  const paginatedContacts = useMemo(() => {
    const start = page * rowsPerPage;
    return contacts.slice(start, start + rowsPerPage);
  }, [contacts, page, rowsPerPage]);

  // Our columns for DataTableLayout (moved from above)
  const columns = useMemo<ColumnDefinition<Contact>[]>(
    () => [
      {
        id: "customerName",
        label: "Customer",
        render: (_, row) => (
          <Typography color="text.primary">
            {row.first_name} {row.last_name}
          </Typography>
        ),
      },
      {
        id: "vehicle",
        label: "Vehicle",
        render: (value) => value || "N/A",
      },
      {
        id: "agent",
        label: "Agent",
        render: (value) => value || "N/A",
      },
      {
        id: "lastUpdated",
        label: "Last Updated",
        render: (value) => value || "N/A",
      },
      {
        id: "actions",
        label: "Actions",
        render: (_, row) => (
          <>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                sx={{
                  opacity: 0.7,
                  transition: "all 0.2s",
                  "&:hover": {
                    color: "primary.main",
                    transform: "scale(1.1)",
                    opacity: 1,
                  },
                }}
                onClick={() => navigate(`/contacts/${row.id}`)}
              >
                <Launch fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in New Tab">
              <IconButton
                size="small"
                sx={{
                  opacity: 0.7,
                  transition: "all 0.2s",
                  "&:hover": {
                    color: "primary.main",
                    transform: "scale(1.1)",
                    opacity: 1,
                  },
                }}
                onClick={() => window.open(`/contacts/${row.id}`, "_blank")}
              >
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Merge Contact">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedContacts((prev) => {
                    if (prev.length === 2) return prev; // Prevent selecting more than 2 contacts
                    const newContacts = [...prev, row];

                    // ✅ Trigger the merge dialog when exactly 2 contacts are selected
                    if (newContacts.length === 2) {
                      handleMergeContactsDialogOpen();
                    }

                    return newContacts;
                  });
                  setIsSelectMode(true);
                }}
                disabled={isSelectMode && selectedContacts.length >= 2}
              >
                <Merge fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton disabled>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    [navigate, isSelectMode]
  );

  return (
    <>
      <DashboardPage
        title="Contacts Dashboard"
        subtitle="View and manage your customer database"
        isRefreshing={
          contactsLoading || loadingDealerGroups || loadingDealerships
        }
        onRefresh={handleRefresh}
        // Filter props
        dealerGroups={dealerGroups}
        dealerships={userDealerships}
        selectedDealerGroupId={selectedDealerGroupId}
        selectedDealershipId={selectedDealershipId}
        loadingDealerships={loadingDealerships}
        isGlobalAdmin={isGlobalAdmin}
        showSalespersonFilter={false}
        showTimeRangeFilter={false}
        timeRangeOptions={[]}
        selectedTimeRange={""}
        onTimeRangeChange={() => {}}
        onSalespersonChange={() => {}}
        salespeople={[]}
        onDealerGroupChange={setSelectedDealerGroupId}
        onDealershipChange={setSelectedDealershipId}
        // DataTableLayout props
        columns={columns}
        data={paginatedContacts}
        loadingData={contactsLoading}
        errorData={contactsError}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={contacts.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* Keep your dialogs outside the DashboardPage */}
      <NewContactDialog
        open={isNewContactDialogOpen}
        onClose={handleNewContactDialogClose}
      />

      <UploadContactsDialog
        open={isUploadContactsDialogOpen}
        onClose={handleUploadContactsDialogClose}
      />
 
      <MergeContactsDialog
        open={isMergeContactsDialogOpen}
        onClose={handleMergeContactsDialogClose}
        contacts={selectedContacts}
      />
    </>
  );
};

export default ContactsDashboard;
