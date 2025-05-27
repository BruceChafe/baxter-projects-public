import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  TextField,
  Chip,
  Pagination,
  Paper,
  InputAdornment,
  alpha,
} from "@mui/material";
import {
  CalendarMonth,
  DirectionsCar,
  Group,
  Search,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Type Definitions
interface Lead {
  id: string;
  leadName?: string;
  createdDate?: string;
  source?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  leadSource?: string;
  leadStatus?: string;
  created_at?: string;
  dealership_id?: string;
}

interface Contact {
  // Add properties for the Contact interface as needed
}

interface ContactLeadsProps {
  contact: Contact | null;
  leads?: Lead[];
  isLoading?: boolean;
  error?: string | null;
}

// Lead Card Component
const LeadCard: React.FC<{ lead: Lead; onClick: (id: string) => void }> = ({ lead, onClick }) => {
  const getStatusColor = (leadStatus?: string) => {
    switch (leadStatus?.toUpperCase()) {
      case 'NEW':
        return '#2196F3'; // Blue
      case 'IN PROGRESS':
        return '#FF9800'; // Orange
      case 'CLOSED':
        return '#4CAF50'; // Green
      default:
        return '#757575'; // Grey
    }
  };

  return (
    <Paper
    sx={{
      p: 3,
      mb: 2,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),

      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: getStatusColor(lead.leadStatus),
      }
    }}
    onClick={() => onClick(lead.id.toString())}
  >
    <Grid container spacing={1.5} alignItems="center">
      <Grid item xs={8}>
        <Typography 
          variant="subtitle1" 
          fontWeight={600}
          sx={{ 
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <DirectionsCar fontSize="small" color="action" />
          {lead.vehicleMake} {lead.vehicleModel}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CalendarMonth fontSize="small" />
          {lead.created_at && new Date(lead.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </Typography>
      </Grid>
      
      <Grid item xs={4} sx={{ textAlign: 'right' }}>
        <Chip
          label={lead.leadStatus || 'NEW'}
          size="small"
          sx={{
            backgroundColor: alpha(getStatusColor(lead.leadStatus), 0.1),
            color: getStatusColor(lead.leadStatus),
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: `1px solid ${alpha(getStatusColor(lead.leadStatus), 0.2)}`,
            '& .MuiChip-label': {
              px: 1.2,
              fontSize: '0.75rem'
            }
          }}
        />
      </Grid>
    </Grid>
  </Paper>
  // </Paper>
  );
};

const ContactLeads: React.FC<ContactLeadsProps> = ({
  contact,
  leads = [], // Default to empty array
  isLoading = false,
  error = null,
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 5;

  const handleLeadClick = useCallback((id: string) => navigate(`/crm/leads/${id}`), [navigate]);

  // Ensure leads is an array before operations
  const safeLeads = Array.isArray(leads) ? leads : [];

  // Safely calculate totalPages and paginatedLeads
  const totalPages = Math.max(1, Math.ceil(safeLeads.length / leadsPerPage));
  const paginatedLeads = safeLeads.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Group sx={{ fontSize: "1.25rem" }} />
          Leads ({leads.length})
        </Typography>
      </Box>

        {isLoading && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >            <CircularProgress size={40} />
          </Paper>
        )}

        {!isLoading && error && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Paper>
        )}

        {!isLoading && !error && leads.length > 0 && (
          <Box>
            {paginatedLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onClick={handleLeadClick} />
            ))}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  size="medium"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        )}

        {!isLoading && !error && leads.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
          }}
        >
            <Typography variant="body1" color="text.secondary">
              No leads available for this contact.
            </Typography>
          </Paper>
        )}
    </Box>
  );
};

export default ContactLeads;

