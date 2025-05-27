import React, { useState, useEffect } from "react";
import {
  Container,
  useTheme,
  Box,
  TextField,
  IconButton,
  Typography,
  Tooltip,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  alpha,
  TableBody,
  Switch,
  Button,
  Chip,
  CircularProgress,
  Skeleton,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Alert,
  Snackbar,
  Fab,
  Badge
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { useSnackbar } from "../../../context/SnackbarContext";
import { useAuth } from "../../../context/AuthContext";
import HeaderSection from "../../../common/headerSection/HeaderSection";
import StateDisplay from "../../upshift/shared/stateDisplay/StateDisplay";
import { supabase } from "../../../../supabase/supabaseClient";
import { useLeadNotifications } from "../../../hooks/leads/useLeadNotifications";

import Filters from "../../../common/filters/Filters";
import { useDealerGroups } from "../../../hooks/general/useDealerGroups";
import { useCurrentDealerGroup } from "../../../hooks/general/useCurrentDealerGroup";
import { useUserDealerships } from "../../../hooks/general/useUserDealerships";

// Loading skeleton for table rows
const TableRowSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4, 5].map((item) => (
        <TableRow key={item}>
          <TableCell><Skeleton animation="wave" height={24} /></TableCell>
          <TableCell><Skeleton animation="wave" height={24} /></TableCell>
          <TableCell><Skeleton animation="wave" height={24} /></TableCell>
          <TableCell><Skeleton animation="wave" height={24} /></TableCell>
        </TableRow>
      ))}
    </>
  );
};

// Empty state component
const EmptyState = ({ message }) => {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No Data Available
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

// Error state component
const ErrorState = ({ message, onRetry }) => {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h6" color="error" gutterBottom>
        Error Loading Data
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {message || "Something went wrong. Please try again."}
      </Typography>
      {onRetry && (
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      )}
    </Box>
  );
};

const LeadFlowDashboard: React.FC = () => {
  const { user, accessContext } = useAuth();
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [updatedUsers, setUpdatedUsers] = useState({});
  const [selectedDealership, setSelectedDealership] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sortField, setSortField] = useState("primary_email");
  const [sortDirection, setSortDirection] = useState("asc");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: dealerGroups, loading: loadingDealerGroups } = useDealerGroups();
  const dealergroup_id = useCurrentDealerGroup();
  const {
    data: { dealerships: userDealerships = [], primaryDealership } = {},
    loading: loadingDealerships,
  } = useUserDealerships(user?.id);

  // Get lead notification data
  const { 
    users, 
    loading, 
    error, 
    updateNotification, 
    refetch 
  } = useLeadNotifications(selectedDealership);

  useEffect(() => {
    if (primaryDealership) {
      setSelectedDealership(primaryDealership);
    }
  }, [primaryDealership]);

  // Filter and sort users
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    
    return users
      .filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.primary_email?.toLowerCase().includes(searchLower) ||
          `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchLower) ||
          user.dealerships?.dealership_name?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        let fieldA, fieldB;
        
        if (sortField === 'name') {
          fieldA = `${a.first_name} ${a.last_name}`.toLowerCase();
          fieldB = `${b.first_name} ${b.last_name}`.toLowerCase();
        } else if (sortField === 'dealership') {
          fieldA = a.dealerships?.dealership_name?.toLowerCase() || '';
          fieldB = b.dealerships?.dealership_name?.toLowerCase() || '';
        } else {
          fieldA = a[sortField]?.toLowerCase() || '';
          fieldB = b[sortField]?.toLowerCase() || '';
        }
        
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      });
  }, [users, searchTerm, sortField, sortDirection]);

  const handleDealershipChange = (dealership_id) => {
    // Clear pending changes when switching dealerships
    if (Object.keys(updatedUsers).length > 0) {
      if (window.confirm("You have unsaved changes. Are you sure you want to switch dealerships?")) {
        setSelectedDealership(dealership_id);
        setUpdatedUsers({});
      }
    } else {
      setSelectedDealership(dealership_id);
    }
  };

  const handleToggle = (user_id, currentValue) => {
    setUpdatedUsers((prev) => {
      // If this user is already in the updates and we're toggling back to original state, remove them
      if (prev[user_id] && prev[user_id].receive_leads === currentValue) {
        const newUpdates = { ...prev };
        delete newUpdates[user_id];
        return newUpdates;
      }
      
      // Otherwise add/update them in the changes
      return {
        ...prev,
        [user_id]: {
          receive_leads: !currentValue,
          dealership_id: selectedDealership,
        },
      };
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSave = async () => {
    setConfirmDialogOpen(false);
    
    try {
      // Show loading in save button
      const savePromises = Object.entries(updatedUsers).map(([user_id, data]) => {
        const { receive_leads, dealership_id } = data;
        return updateNotification(user_id, receive_leads, dealership_id);
      });
      
      await Promise.all(savePromises);
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Clear changes
      setUpdatedUsers({});
      setLastUpdated(new Date());
      
      // Show snackbar
      showSnackbar(`Successfully updated ${Object.keys(updatedUsers).length} user${Object.keys(updatedUsers).length !== 1 ? 's' : ''}`, "success");
    } catch (error) {
      showSnackbar("Failed to save changes. Please try again.", "error");
    }
  };

  const handleSelectAll = (value) => {
    if (!filteredUsers.length) return;
    
    const updates = {};
    filteredUsers.forEach(user => {
      if (user.receive_leads !== value) {
        updates[user.id] = {
          receive_leads: value,
          dealership_id: selectedDealership,
        };
      }
    });
    
    setUpdatedUsers(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };

  const renderContent = () => {
    if (loading) {
      return (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellStyle}>Email</TableCell>
                <TableCell sx={headerCellStyle}>Name</TableCell>
                <TableCell sx={headerCellStyle}>Dealership</TableCell>
                <TableCell sx={headerCellStyle}>Receive Leads</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRowSkeleton />
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    if (error) {
      return <ErrorState message={error} onRetry={handleRefresh} />;
    }

    if (!users || users.length === 0) {
      return <EmptyState message="No users found for this dealership." />;
    }

    if (filteredUsers.length === 0) {
      return <EmptyState message={`No users match '${searchTerm}'`} />;
    }

    return (
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredUsers.length} of {users.length} users
            {searchTerm && ` matching '${searchTerm}'`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleSelectAll(true)}
            >
              Enable All
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleSelectAll(false)}
            >
              Disable All
            </Button>
          </Box>
        </Box>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={headerCellStyle}
                onClick={() => handleSort('primary_email')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Email
                  {sortField === 'primary_email' && (
                    <SortIcon sx={{ 
                      ml: 1, 
                      fontSize: 16,
                      transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none' 
                    }} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={headerCellStyle}
                onClick={() => handleSort('name')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Name
                  {sortField === 'name' && (
                    <SortIcon sx={{ 
                      ml: 1, 
                      fontSize: 16,
                      transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none' 
                    }} />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={headerCellStyle}
                onClick={() => handleSort('dealership')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  Dealership
                  {sortField === 'dealership' && (
                    <SortIcon sx={{ 
                      ml: 1, 
                      fontSize: 16,
                      transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none' 
                    }} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={headerCellStyle}>
                Receive Leads
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user, index) => {
              const isModified = updatedUsers[user.id] !== undefined;
              const receiveLeads = isModified 
                ? updatedUsers[user.id].receive_leads 
                : user.receive_leads;
                
              return (
                <TableRow 
                  key={user.id}
                  sx={{
                    backgroundColor: index % 2 === 0 
                      ? 'background.paper' 
                      : alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)
                    },
                    ...(isModified && {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12)
                      }
                    })
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {user.primary_email}
                      {isModified && (
                        <Chip 
                          size="small" 
                          label="Modified" 
                          color="primary" 
                          variant="outlined" 
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>
                    {user.dealerships?.dealership_name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={receiveLeads}
                      onChange={() => handleToggle(user.id, user.receive_leads)}
                      color={receiveLeads ? "success" : "default"}
                    />
                    <Typography 
                      variant="caption" 
                      color={receiveLeads ? "success.main" : "text.secondary"}
                      sx={{ ml: 1, display: 'inline-block', width: 50 }}
                    >
                      {receiveLeads ? "Enabled" : "Disabled"}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </TableContainer>
    );
  };

  // Style for header cells
  const headerCellStyle = {
    py: 2,
    px: 3,
    fontWeight: 600,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderBottom: "2px solid",
    borderBottomColor: "primary.main",
  };

  const changeCount = Object.keys(updatedUsers).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4, position: 'relative' }}>
      <HeaderSection
        title="Lead Notification Settings"
        subtitle="Manage which users receive lead notifications at your dealership"
      />

      <Filters
        dealerGroups={dealerGroups}
        dealerships={userDealerships}
        selected_dealergroup_id={dealergroup_id}
        selectedDealershipId={selectedDealership}
        selectedSalesperson={""}
        loadingDealerships={loadingDealerships}
        onDealerGroupChange={() => {}}
        onDealershipChange={handleDealershipChange}
        showSalespersonFilter={false}
        showTimeRangeFilter={false}
        isGlobalAdmin={false}
        timeRangeOptions={[]}
        selectedTimeRange={""}
        onTimeRangeChange={() => {}}
        onSalespersonChange={() => {}}
        salespeople={[]}
      />

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ width: { xs: '100%', sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {renderContent()}

      {/* Floating Save Button for mobile */}
      {isMobile && changeCount > 0 && (
        <Fab
          color="primary"
          aria-label="save"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={() => setConfirmDialogOpen(true)}
        >
          <Badge badgeContent={changeCount} color="error">
            <SaveIcon />
          </Badge>
        </Fab>
      )}

      {/* Desktop Save Button */}
      {!isMobile && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={changeCount > 0 ? <SaveIcon /> : <CheckCircleIcon />}
            onClick={() => setConfirmDialogOpen(true)}
            disabled={changeCount === 0}
            sx={{ minWidth: 150 }}
          >
            {changeCount > 0 
              ? `Save ${changeCount} Change${changeCount !== 1 ? 's' : ''}`
              : 'No Changes'}
          </Button>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to save {changeCount} change{changeCount !== 1 ? 's' : ''} to lead notification settings?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary" autoFocus>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Changes saved successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LeadFlowDashboard;