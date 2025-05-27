import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import DashboardPage from "../../../common/Dashboard/DashboardPage";
import DataTableLayout from "../../../common/DataTableLayout";

import UnattendedLeadsAlert from "./UnattendedLeadsAlert";
import NewLeadDialog from "./NewLeadDialog";
import { useLeads } from "../../../hooks/useLeads";
import { supabase } from "../../../../supabase/supabaseClient";
import isGlobalAdmin from "../../../auth/isGlobalAdmin";
import { useAuth } from "../../../context/AuthContext";

import { LeadData } from "../types/types";

const STATUS_CONFIG = {
  new: { color: "info" as const, label: "New" },
  active: { color: "success" as const, label: "Active" },
  pending: { color: "warning" as const, label: "Pending" },
  closed: { color: "error" as const, label: "Closed" },
  followup: { color: "warning" as const, label: "Follow Up" },
  contacted: { color: "info" as const, label: "Contacted" },
  qualified: { color: "success" as const, label: "Qualified" },
  lost: { color: "error" as const, label: "Lost" },
};

const getStatusConfig = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  return (
    STATUS_CONFIG[normalizedStatus as keyof typeof STATUS_CONFIG] || {
      color: "default" as const,
      label: status,
    }
  );
};

const LeadsDashboard: React.FC = () => {
  const { user, accessContext } = useAuth();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Dealer Group & Dealership
  const [dealerGroups, setDealerGroups] = useState<any[]>([]);
  const [loadingDealerGroups, setLoadingDealerGroups] = useState(false);
  const [errorDealerGroups, setErrorDealerGroups] = useState<string | null>(
    null
  );

  const [dealergroup_id, setDealerGroupId] = useState<number | null>(null);
  const [dealerships, setDealerships] = useState<any[]>([]);
  const [selectedDealershipId, setSelectedDealershipId] = useState<string>("");
  const [loadingDealerships, setLoadingDealerships] = useState(false);
  const [errorDealerships, setErrorDealerships] = useState<string | null>(null);

  // Leads
  const {
    leads,
    loading: leadsLoading,
    error: leadsError,
    refetchLeads,
  } = useLeads(dealergroup_id, selectedDealershipId);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog (new lead)
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1) Fetch dealer groups
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
    }
  }, [user]);

  // 3) Fetch dealerships when we have a dealerGroupId
  useEffect(() => {
    if (dealergroup_id) {
      const fetchDealerships = async () => {
        setLoadingDealerships(true);
        setErrorDealerships(null);
        try {
          const { data, error } = await supabase
            .from("dealerships")
            .select("*")
            .eq("dealergroup_id", dealergroup_id);
          if (error) throw error;
          setDealerships(data || []);
        } catch (err) {
          console.error("Error fetching dealerships:", err);
          setErrorDealerships("Failed to load dealerships.");
        } finally {
          setLoadingDealerships(false);
        }
      };
      fetchDealerships();
    }
  }, [dealergroup_id]);

  // Handler to open/close new-lead dialog
  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => setIsDialogOpen(false);

  // Refresh callback for the top-level "Refresh Data" button
  const handleRefresh = useCallback(() => {
    refetchLeads();
    // e.g., show a snackbar if you like
  }, [refetchLeads]);

  // Pagination
  const handlePageChange = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => setPage(newPage);

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated data
  const paginatedLeads = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return leads.slice(startIndex, startIndex + rowsPerPage);
  }, [leads, page, rowsPerPage]);

  // We'll pass a small helper to our columns so we can find the dealership name by ID
  const getDealershipName = (id: number | string) => {
    const ds = dealerships.find((d) => d.id === id);
    return ds ? ds.dealership_name : "Unknown";
  };

  // Build your columns with useMemo to avoid re-creating on every render
  const columns = useMemo<ColumnDefinition<LeadData>[]>(
    () => [
      {
        id: "contactName",
        label: "Lead",
        render: (_, row) => (
          <>
            <Typography variant="subtitle2">
              {row.contact?.first_name} {row.contact?.last_name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {row.vehicleMake} {row.vehicleModel} ({row.vehicleYear})
            </Typography>
          </>
        ),
      },
      {
        id: "leadStatus",
        label: "Status",
        render: (status) => {
          const { label, color } = getStatusConfig(status || "");
          return <Chip label={label} color={color} size="small" />;
        },
      },
      {
        id: "leadSource",
        label: "Source",
        render: (value) => value || "N/A",
      },
      {
        id: "created_at",
        label: "Created",
        render: (value) => new Date(value).toLocaleDateString(),
      },
      {
        id: "dealership_id",
        label: "Dealership",
        // We'll pass our function as part of `extra`
        render: (value, row, allData, extra) =>
          extra?.getDealershipName(value) || "Unknown",
      },
      {
        id: "actions",
        label: "Actions",
        render: (_, row) => (
          <>
            <Tooltip title="Call">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!row.contact?.mobile_phone) return;
                  window.location.href = `tel:${row.contact.mobile_phone}`;
                }}
              >
                <PhoneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Email">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!row.contact?.primary_email) return;
                  window.location.href = `mailto:${row.contact.primary_email}`;
                }}
              >
                <EmailIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    [dealerships]
  );

  // onRowClick: navigate to lead details
  const handleRowClick = (lead: LeadData) => {
    navigate(`/crm/leads/${lead.id}`);
  };

  return (
    <>
      <UnattendedLeadsAlert
        onViewUnattended={() => navigate("/crm/unattended-leads")}
      />

      <DashboardPage
        title="Leads Dashboard"
        subtitle="View and manage your leads"
        isRefreshing={leadsLoading || loadingDealerships || loadingDealerGroups}
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
        
        // Filter props for DashboardPage’s <Filters />
        dealerGroups={dealerGroups}
        dealerships={dealerships}
        selectedDealerGroupId={dealergroup_id ? String(dealergroup_id) : null}
        selectedDealershipId={selectedDealershipId}
        loadingDealerships={loadingDealerships}
        isGlobalAdmin={isGlobalAdmin}
        timeRangeOptions={[]} // not using time filters
        timeFilter=""
        salesperson=""
        // The user can pick a new dealership from the filter:
        onDealerGroupChange={(val) => {
          // Convert the string from <Filters> to a number if needed
          setDealerGroupId(Number(val));
        }}
        onDealershipChange={setSelectedDealershipId}
        onTimeRangeChange={() => {}}
        onSalespersonChange={() => {}}
        onApplyFilters={() => {
          // e.g. reset pagination & refetch
          setPage(0);
          refetchLeads();
        }}
        // DataTableLayout props
        columns={columns}
        data={paginatedLeads}
        loadingData={leadsLoading}
        errorData={leadsError}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={leads.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        // Provide an `extra` object if you want columns to access e.g. dealership name
        // NOTE: DataTableLayout's type must allow an optional `extra` param in `render`.
        // If your DataTableLayout doesn’t support that, you can do it differently.
        // Some devs pass a closure capturing `dealerships`, or store it in context.
        // We'll assume your version can pass something like below:
        //   <DataTableLayout columns={...} data={...} extra={{ getDealershipName }} />
        // So let’s do:
        // children={<UnattendedLeadsAlert ... />} if you want to place the alert above the table
      />

      <NewLeadDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        dealerships={dealerships}
      />
    </>
  );
};

export default LeadsDashboard;
