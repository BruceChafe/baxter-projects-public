import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  DirectionsCar,
  CalendarToday,
  Search,
  OpenInNew,
  Numbers,
  DriveEta,
} from "@mui/icons-material";
import { VehicleHistoryEntry } from "../../../common/types/types";

interface VehicleHistoryProps {
  vehicles?: VehicleHistoryEntry[];
}

type SortField = 'make' | 'model' | 'year' | 'purchaseDate';
type SortOrder = 'asc' | 'desc';

const DEFAULT_VEHICLES: VehicleHistoryEntry[] = [];

const VehicleHistory: React.FC<VehicleHistoryProps> = ({ 
  vehicles = DEFAULT_VEHICLES 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortField, setSortField] = useState<SortField>('purchaseDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'current': return 'success';
      case 'sold': return 'error';
      case 'traded': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (vehicle: VehicleHistoryEntry) => {
    if (!vehicle.saleDate) return 'Current';
    return vehicle.status?.charAt(0).toUpperCase() + vehicle.status?.slice(1) || 'Sold';
  };

  const filteredAndSortedVehicles = useMemo(() => {
    if (!vehicles) return DEFAULT_VEHICLES;
    return vehicles
      .filter(vehicle => 
        `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.vin}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const compareValue = sortOrder === 'asc' ? 1 : -1;
        
        // Handle sorting for each field with type safety
        switch (sortField) {
          case 'year':
            return (parseInt(a.year) - parseInt(b.year)) * compareValue;
          case 'purchaseDate':
            return (new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()) * compareValue;
          case 'make':
            return (a.make || '').localeCompare(b.make || '') * compareValue;
          case 'model':
            return (a.model || '').localeCompare(b.model || '') * compareValue;
          default:
            return 0;
        }
      });
  }, [vehicles, sortField, sortOrder, searchQuery]);

  const paginatedVehicles = filteredAndSortedVehicles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );


};

export default VehicleHistory;
