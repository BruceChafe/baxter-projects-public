import React, { useState, useEffect, useCallback } from "react";
import { Container, CircularProgress, Box } from "@mui/material";
import HeaderSection from "../headerSection/HeaderSection";
import Filters from "../filters/Filters";
import StateDisplay from "../../components/upshift/shared/stateDisplay/StateDisplay";
import DataTableLayout from "../DataTableLayout";
import { RefreshRounded } from "@mui/icons-material";
import useSalesConsultants from "../../hooks/general/useSalesConsultants";

interface DashboardPageProps<T> {
  // Header
  title: string;
  subtitle: string;
  isRefreshing: boolean;
  onRefresh: () => void;

  // Filter props
  dealerGroups: any[];
  dealerships: any[];
  selected_dealergroup_id: string | null;
  selectedDealershipId: string | null;
  loadingDealerships: boolean;
  isGlobalAdmin: boolean;
  timeRangeOptions: { value: string; label: string }[];

  // Controlled filter states
  timeFilter: string;
  salesperson: string;
  onDealerGroupChange: (value: any) => void;
  onDealershipChange: (value: string) => void;
  onTimeRangeChange: (value: string) => void;
  onSalespersonChange: (value: string) => void;
  onApplyFilters: () => void;

  // Visibility toggles
  showTimeRangeFilter?: boolean;  // ✅ Allow parent to enable/disable
  showSalespersonFilter?: boolean;  // ✅ Allow parent to enable/disable

  // Data table
  columns: ColumnDefinition<T>[];
  data: T[];
  loadingData: boolean;
  errorData?: string | null;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  onRowClick?: (row: T) => void;
}

function DashboardPage<T>(props: DashboardPageProps<T>) {
  const {
    // Header
    title,
    subtitle,
    isRefreshing,
    onRefresh,

    // Filter props
    dealerGroups,
    dealerships,
    selected_dealergroup_id,
    selectedDealershipId,
    onSalespersonChange,
    salesperson,
    loadingDealerships,
    isGlobalAdmin,
    timeRangeOptions,
    selectedTimeFilter,
    onDealerGroupChange,
    onDealershipChange,
    onTimeRangeChange,
    onApplyFilters,

    // Visibility toggles
    showTimeRangeFilter = true,  // Default to true if not provided
    showSalespersonFilter = true,  // Default to true if not provided

    // Data table
    columns,
    data,
    loadingData,
    errorData,
    page,
    rowsPerPage,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
    onRowClick,
  } = props;

  // Fetch salespeople only if salesperson filter is enabled
  const { salespeople, loading: loadingSalespeople, error: errorSalespeople } =
    showSalespersonFilter ? useSalesConsultants(selectedDealershipId) : { salespeople: [], loading: false, error: null };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      {/* Header */}
      <HeaderSection
        title={title}
        subtitle={subtitle}
        action={{
          label: isRefreshing ? "Refreshing..." : "Refresh Data",
          onClick: onRefresh,
          icon: isRefreshing ? <CircularProgress size={20} /> : <RefreshRounded />,
          disabled: isRefreshing,
        }}
      />

      {/* Filters */}
      <Filters
        dealerGroups={dealerGroups}
        dealerships={dealerships}
        selected_dealergroup_id={selected_dealergroup_id}
        selectedDealershipId={selectedDealershipId}
        loadingDealerships={loadingDealerships}
        onDealerGroupChange={onDealerGroupChange}
        onDealershipChange={onDealershipChange}
        isGlobalAdmin={isGlobalAdmin}
        showTimeRangeFilter={showTimeRangeFilter}  // ✅ Pass toggle
        showSalespersonFilter={showSalespersonFilter}  // ✅ Pass toggle
        showSearchFilter={false}
        timeRangeOptions={timeRangeOptions}
        selectedTimeRange={selectedTimeFilter || "week"}
        selectedSalesperson={salesperson}
        onTimeRangeChange={onTimeRangeChange}
        onSalespersonChange={onSalespersonChange}
        salespeople={showSalespersonFilter ? salespeople : []}  // ✅ Only pass if enabled
      />

      {/* Data Table or State Display */}
      {loadingDealerships || dealerships.length === 0 ? (
        <StateDisplay
          state={
            loadingDealerships
              ? "loading"
              : errorData
              ? "error"
              : "empty"
          }
          errorMessage="Failed to load data."
          emptyMessage="No data available for the selected filters."
        />
      ) : (
        <DataTableLayout<T>
          columns={columns}
          data={data}
          loading={loadingData}
          error={errorData}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          onRowClick={onRowClick}
        />
      )}
    </Container>
  );
}

export default DashboardPage;

