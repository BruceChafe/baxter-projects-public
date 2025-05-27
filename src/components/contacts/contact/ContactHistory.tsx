import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search,
  CalendarToday,
  Category,
  Description,
  Phone,
  Email,
  Message,
  Store,
  OpenInNew,
  History,
} from "@mui/icons-material";

interface Contact {
  // Add properties for the Contact interface
}

interface ContactHistoryEntry {
  id: string;
  date: string;
  type: 'call' | 'email' | 'sms' | 'visit' | 'note' | 'other';
  details: string | null;
  duration?: string;
  outcome?: 'successful' | 'unsuccessful' | 'pending';
  agent?: string;
  location?: string;
}

interface ContactHistoryProps {
  contact: Contact | null;
  loading?: boolean;
  error?: string | null;
  history: ContactHistoryEntry[];
}

type SortField = 'date' | 'type' | 'details';
type SortOrder = 'asc' | 'desc';

const DEFAULT_HISTORY: ContactHistoryEntry[] = [];

const ContactHistory: React.FC<ContactHistoryProps> = ({ 
  contact,
  history = DEFAULT_HISTORY,  
  loading = false,
  error = null
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const getTypeIcon = (type: ContactHistoryEntry['type']) => {
    switch (type) {
      case 'call': return <Phone fontSize="small" />;
      case 'email': return <Email fontSize="small" />;
      case 'sms': return <Message fontSize="small" />;
      case 'visit': return <Store fontSize="small" />;
      default: return <Description fontSize="small" />;
    }
  };

  const getTypeColor = (type: ContactHistoryEntry['type']) => {
    switch (type) {
      case 'call': return 'success';
      case 'email': return 'primary';
      case 'sms': return 'info';
      case 'visit': return 'warning';
      default: return 'default';
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'successful': return 'success';
      case 'unsuccessful': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const filteredAndSortedHistory = useMemo(() => {
    if (!history) return [];  
    
    return history
      .filter(entry => 
        entry.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.agent?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const compareValue = sortOrder === 'asc' ? 1 : -1;
        switch (sortField) {
          case 'date':
            return (new Date(a.date).getTime() - new Date(b.date).getTime()) * compareValue;
          case 'details':
            // Handle null values in details
            if (a.details === null && b.details === null) return 0;
            if (a.details === null) return compareValue;
            if (b.details === null) return -compareValue;
            return a.details.localeCompare(b.details) * compareValue;
          default:
            // For other string fields, convert null to empty string
            const aValue = a[sortField] || '';
            const bValue = b[sortField] || '';
            return aValue.localeCompare(bValue) * compareValue;
        }
      });
  }, [history, sortField, sortOrder, searchQuery]);

  const paginatedHistory = filteredAndSortedHistory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ 
        textAlign: "center", 
        py: 8,
        backgroundColor: 'action.hover',
        borderRadius: 2
      }}>
        <History sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Loading contact history...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        textAlign: "center", 
        py: 8,
        backgroundColor: 'action.hover',
        borderRadius: 2
      }}>
        <History sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Error loading contact history: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography 
        variant="h6" 
        fontWeight="bold"
      >
          Contact History ({history.length})
        </Typography>
        <TextField
          size="small"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            width: 250,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }
          }}
        />
      </Box>

      {history.length > 0 ? (
        <Paper 
          elevation={2}
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'date'}
                      direction={sortOrder}
                      onClick={() => handleSort('date')}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'text.secondary',
                        fontWeight: 500
                      }}>
                        <CalendarToday fontSize="small" />
                        Date & Time
                      </Box>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'type'}
                      direction={sortOrder}
                      onClick={() => handleSort('type')}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'text.secondary',
                        fontWeight: 500
                      }}>
                        <Category fontSize="small" />
                        Type
                      </Box>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: 'text.secondary',
                      fontWeight: 500
                    }}>
                      <Description fontSize="small" />
                      Details
                    </Box>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedHistory.map((entry) => (
                  <TableRow 
                    key={entry.id} 
                    hover
                    sx={{ 
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography 
                          variant="body2"
                          sx={{ fontWeight: 500 }}
                        >
                          {formatDate(entry.date)}
                        </Typography>
                        {entry.duration && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            Duration: {entry.duration}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          icon={getTypeIcon(entry.type)}
                          label={entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                          size="small"
                          color={getTypeColor(entry.type)}
                          variant="outlined"
                          sx={{
                            borderRadius: 1,
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                        {entry.outcome && (
                          <Chip
                            label={entry.outcome}
                            size="small"
                            color={getOutcomeColor(entry.outcome)}
                            variant="outlined"
                            sx={{
                              borderRadius: 1,
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography 
                          variant="body2"
                          sx={{ fontWeight: 500 }}
                        >
                          {entry.details ?? 'No details available'}
                        </Typography>
                        {entry.agent && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            By: {entry.agent}
                            {entry.location && ` • ${entry.location}`}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
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
            count={filteredAndSortedHistory.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'rgba(0,0,0,0.02)'
            }}
          />
        </Paper>
      ) : (
        <Box sx={{ 
          textAlign: "center", 
          py: 8,
          bgcolor: 'rgba(0,0,0,0.02)',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <History sx={{ 
            fontSize: 40, 
            color: 'text.secondary', 
            mb: 2,
            opacity: 0.5
          }} />
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            No contact history available for this contact.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ContactHistory;
