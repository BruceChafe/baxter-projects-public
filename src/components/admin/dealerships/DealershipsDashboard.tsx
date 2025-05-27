import React, { useState, useEffect, useCallback } from "react";
import { Container, useMediaQuery, useTheme } from "@mui/material";
import { Add } from "@mui/icons-material";
import DealershipCreationDialog from "./DealershipCreationDialog";
import DealershipDetailsDialog from "./DealershipDetailsDialog";
import HeaderSection from "../../../common/headerSection/HeaderSection";
import StateDisplay from "../../upshift/shared/stateDisplay/StateDisplay";
import DataTableLayout from "../../../common/DataTableLayout";
import { Dealership } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { useSnackbar } from "../../../context/SnackbarContext";
import { supabase } from "../../../../supabase/supabaseClient";
import PageHelmet from "../../shared/PageHelmet";

const columnDefinitions = [
  { id: "dealership_name", label: "Name", sortable: true },
  {
    id: "address_line_1",
    label: "Location",
    sortable: true,
    render: (_: any, row: Dealership) =>
      `${row.address_line_1}, ${row.city}, ${row.province}`,
  },
  {
    id: "date_created",
    label: "Date Created",
    sortable: true,
    render: (value: string) => new Date(value).toLocaleDateString(),
  },
];

const DealershipsDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { accessContext } = useAuth();
  const { showSnackbar } = useSnackbar();

  // 1️⃣ Pull the dealergroupId directly from accessContext
  const dealerGroupId = accessContext?.dealergroupId ?? null;

  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Dealership | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // 2️⃣ Fetch function wrapped in useCallback
  const fetchDealerships = useCallback(async () => {
    if (!dealerGroupId) return;

    setLoading(true);
    setError(null);

    try {
      // 🔎 DEBUG: fetch everything first
      const { data: allRows, error: allErr } = await supabase
        .from<Dealership>("dealerships")
        .select("*");

      // 🔎 DEBUG: now fetch with the filter
      const { data, error: sbError } = await supabase
        .from<Dealership>("dealerships")
        .select("*")
        .eq("dealergroup_id", dealerGroupId)
        .order("date_created", { ascending: false });

      if (sbError) throw sbError;
      setDealerships(data ?? []);
    } catch (err: any) {
      console.error("❌ Error loading dealerships:", err);
      setError(err.message || "Failed to load dealerships");
      showSnackbar(err.message || "Failed to load dealerships", "error");
    } finally {
      setLoading(false);
    }
  }, [dealerGroupId, showSnackbar]);

  // 3️⃣ Only fire once the dealerGroupId is available
  useEffect(() => {
    fetchDealerships();
  }, [fetchDealerships]);

  // Row click / new click handlers
  const onRowClick = (row: Dealership) => {
    setSelected(row);
    setDetailsOpen(true);
  };
  const onNewClick = () => setCreateOpen(true);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      <PageHelmet
        title="Dealerships | baxter-projects"
        description="Simple, transparent pricing."
      />
      <HeaderSection
        title="Dealerships"
        subtitle="Review dealership details"
        action={{
          label: "New Dealership",
          onClick: onNewClick,
          icon: <Add />,
          variant: "contained",
        }}
      />

      {loading || error || dealerships.length === 0 ? (
        <StateDisplay
          state={loading ? "loading" : error ? "error" : "empty"}
          errorMessage={error || undefined}
          emptyMessage="No dealerships found."
        />
      ) : (
        <DataTableLayout
          columns={columnDefinitions}
          data={dealerships}
          loading={loading}
          error={error}
          emptyMessage="No dealerships found."
          onRowClick={onRowClick}
        />
      )}

      <DealershipCreationDialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          fetchDealerships();
        }}
        setDealerships={setDealerships}
      />

      <DealershipDetailsDialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelected(null);
          fetchDealerships();
        }}
        dealership={selected}
        setDealerships={setDealerships}
      />
    </Container>
  );
};

export default DealershipsDashboard;
