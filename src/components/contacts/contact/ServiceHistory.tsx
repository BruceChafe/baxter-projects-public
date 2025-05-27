import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Search,
  Build,
  AttachMoney,
  CalendarToday,
  Notes,
  OpenInNew,
} from "@mui/icons-material";
import { ServiceHistoryEntry } from "../../../common/types/types";

interface ServiceHistoryProps {
  services?: ServiceHistoryEntry[];
}

type SortField = 'date' | 'serviceType' | 'cost';
type SortOrder = 'asc' | 'desc';

const DEFAULT_SERVICES: ServiceHistoryEntry[] = [];

const ServiceHistory: React.FC<ServiceHistoryProps> = ({ 
  services = DEFAULT_SERVICES 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortField, setSortField] = useState<SortField>('date');
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

  const formatCurrency = (cost: string) => {
    const amount = parseFloat(cost.replace(/[^0-9.-]+/g, ""));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredAndSortedServices = useMemo(() => {
    return services
      .filter(service => 
        service.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const compareValue = sortOrder === 'asc' ? 1 : -1;
        switch (sortField) {
          case 'date':
            return (new Date(a.date).getTime() - new Date(b.date).getTime()) * compareValue;
          case 'cost':
            return (parseFloat(a.cost.replace(/[^0-9.-]+/g, "")) - 
                   parseFloat(b.cost.replace(/[^0-9.-]+/g, ""))) * compareValue;
          default:
            return a[sortField].localeCompare(b[sortField]) * compareValue;
        }
      });
  }, [services, sortField, sortOrder, searchQuery]);

  const paginatedServices = filteredAndSortedServices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Service History ({services.length})
        </Typography>
        <TextField
          size="small"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />
      </Box>

      {services.length > 0 ? (
        <Paper elevation={0} variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'date'}
                      direction={sortOrder}
                      onClick={() => handleSort('date')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" />
                        Date
                      </Box>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'serviceType'}
                      direction={sortOrder}
                      onClick={() => handleSort('serviceType')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Build fontSize="small" />
                        Service Type
                      </Box>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'cost'}
                      direction={sortOrder}
                      onClick={() => handleSort('cost')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney fontSize="small" />
                        Cost
                      </Box>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Notes fontSize="small" />
                      Notes
                    </Box>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedServices.map((service) => (
                  <TableRow key={service.id} hover>
                    <TableCell>{formatDate(service.date)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {service.serviceType}
                        {service.status && (
                          <Chip
                            label={service.status}
                            size="small"
                            color={getStatusColor(service.status)}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{formatCurrency(service.cost)}</TableCell>
                    <TableCell>{service.notes || "N/A"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredAndSortedServices.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      ) : (
        <Box sx={{ 
          textAlign: "center", 
          py: 8,
          backgroundColor: 'action.hover',
          borderRadius: 2
        }}>
          <Build sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No service history available for this contact.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ServiceHistory;
