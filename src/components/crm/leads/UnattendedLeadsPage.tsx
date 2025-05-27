import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Grid,
  Chip,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeaderSection from "../../../common/headerSection/HeaderSection";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "../../../../supabase/supabaseClient";
import { TimeIcon } from "@mui/x-date-pickers";
import { Person } from "@mui/icons-material";
import Filters from "../../../common/filters/Filters";
import isGlobalAdmin from "../../../auth/isGlobalAdmin";
import { useAuth } from "../../../context/AuthContext";
import { fetchUnattendedLeadsByDealership } from "../../../hooks/leads/useUnattendedLeadsByDealership";

interface Contact {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

interface Lead {
  id: string;
  lead_id: string;
  contact: Contact;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  created_at: string;
  dealership?: string;
  priority?: "high" | "medium" | "low";
}

const fetchDealershipNames = async (dealershipIds: string[]) => {
  if (dealershipIds.length === 0) return {};

  const { data, error } = await supabase
    .from("dealerships")
    .select("id, dealership_name")
    .in("id", dealershipIds);

  if (error) {
    return {};
  }

  return data.reduce((acc, dealership) => {
    // Ensure the key is a string
    acc[String(dealership.id)] = dealership.dealership_name;
    return acc;
  }, {} as Record<string, string>);
};

const UnattendedLeadsPage: React.FC = () => {
  const { user, accessContext } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //Filter Logic
  const [dealerGroups, setDealerGroups] = useState<any[]>([]);
  const [userDealerships, setUserDealerships] = useState<any[]>([]);
  const [dealergroup_id, setDealerGroupId] = useState<number | null>(null);
  const [selected_dealership, setSelectedDealership] = useState<string | null>(
    null
  );
  const [selected_dealergroup_id, setSelectedDealerGroupId] = useState<any[]>(
    []
  );
  const [loadingDealerships, setLoadingDealerships] = useState(false);
  const [errorDealerships, setErrorDealerships] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDealerships = async () => {
      setLoadingDealerships(true);
  
      try {
        // Fetch only the dealerships the user is assigned to and join dealership name
        const { data, error } = await supabase
          .from("user_dealerships")
          .select(`
            dealership_id,
            is_primary,
            dealerships (dealership_name)
          `)
          .eq("user_id", user.id); // Filter for the logged-in user
  
        if (error) throw error;
  
        if (data.length > 0) {
          // Map the data correctly with dealership name
          setUserDealerships(data.map(d => ({
            dealership_id: d.dealership_id,
            dealership_name: d.dealerships?.dealership_name || "Unknown Dealership",
          })));
  
          // Set the default dealership to the primary one, or the first available one
          const primary = data.find(d => d.is_primary);
          setSelectedDealership(primary ? primary.dealership_id : data[0]?.dealership_id || "");
        } else {
          setSelectedDealership(""); // No dealerships found
        }
      } catch (error) {
      } finally {
        setLoadingDealerships(false);
      }
    };
  
    if (user) fetchUserDealerships();
  }, [user]);  

  const [loadingDealerGroups, setLoadingDealerGroups] = useState(false);
  const [errorDealerGroups, setErrorDealerGroups] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchDealerGroups = async () => {
      setLoadingDealerGroups(true);
      setErrorDealerGroups(null);
      try {
        const { data, error } = await supabase.from("dealergroups").select("*");

        if (error) throw error;

        setDealerGroups(data || []);
      } catch (error) {
        setErrorDealerGroups("Failed to load dealer groups.");
      } finally {
        setLoadingDealerGroups(false);
      }
    };

    fetchDealerGroups();
  }, []);

  useEffect(() => {
    if (user) {
      const dgId =
        user.user_metadata?.dealergroup_id ||
        user.raw_user_meta_data?.dealergroup_id ||
        null;
      setDealerGroupId(dgId);
    }
  }, [user]);
  
  // Modified to ensure leads are properly refreshed when switching dealerships
  useEffect(() => {
    const fetchData = async () => {
      if (!selected_dealership) return;
      
      setLoading(true);
      setLeads([]); // Clear leads when changing dealerships
      
      try {
        const unattendedData = await fetchUnattendedLeadsByDealership(selected_dealership);
  
        if (unattendedData && Array.isArray(unattendedData) && unattendedData.length > 0) {
          const processedLeads = unattendedData.map((item: any) => ({
            id: item.id,
            lead_id: item.lead_id,
            vehicleMake: item.lead?.vehicle_make || "Unknown",
            vehicleModel: item.lead?.vehicle_model || "Unknown",
            vehicleYear: item.lead?.vehicle_year || "Unknown",
            created_at: item.lead?.created_at,
            priority: item.lead?.lead_priority,
            contact: {
              first_name: item.lead?.contact?.first_name || "Unknown",
              last_name: item.lead?.contact?.last_name || "Unknown",
              email: item.lead?.contact?.email || "No Email",
              phone: item.lead?.contact?.phone || "No Phone",
            },
          }));
          setLeads(processedLeads);
        } else {
          setLeads([]);
        }
      } catch (error) {
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
  
    if (selected_dealership) {
      fetchData();
    }
  }, [selected_dealership]);

  const handleDealershipChange = (newDealershipId: string) => {
    setSelectedDealership(newDealershipId);
  };

  return loading ? (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <CircularProgress />
    </Box>
  ) : (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      <HeaderSection title="Unclaimed Leads" subtitle=" " />

      <Filters
        dealerGroups={dealerGroups}
        dealerships={userDealerships}
        selected_dealergroup_id={dealergroup_id}
        selectedDealershipId={selected_dealership}
        loadingDealerships={loadingDealerships}
        onDealerGroupChange={setSelectedDealerGroupId}
        onDealershipChange={handleDealershipChange}
        isGlobalAdmin={false}
        showTimeRangeFilter={false}
        showSalespersonFilter={false}
        showSearchFilter={false}
        timeRangeOptions={[]}
        selectedTimeRange={""}
        selectedSalesperson={""}
        onTimeRangeChange={() => {}}
        salespeople={[]}
        onSalespersonChange={() => {}}
        searchQuery={""}
        onSearchChange={() => {}}

      //   dealerGroups={dealerGroups}
      //   dealerships={userDealerships}
      // selectedDealerGroupId={dealergroup_id}

      //   // selected_dealergroup_id={dealergroup_id}
      //   selectedDealershipId={selected_dealership}
      //   onDealerGroupChange={selected_dealergroup_id}
      //   onDealershipChange={handleDealershipChange}
      //   showSalespersonFilter={false}
      //   showTimeRangeFilter={false}
      //   selectedTimeRange={""}
      //   showSearchFilter={true}
      //   isGlobalAdmin={isGlobalAdmin}
      />

      {leads.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No new leads at the moment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Check back later for new leads
          </Typography>
        </Paper>
      ) : (
        leads.map((lead) => (
          <Paper key={lead.id} elevation={0} onClick={() => navigate(`/crm/respond-lead/${lead.lead_id}`)} sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
            bgcolor: "background.paper",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            "&:hover": {
              transform: "translateY(-2px)",
              borderColor: "primary.main",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            },
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person color="action" />
                    <Typography variant="h6">
                      {lead.contact.first_name} {lead.contact.last_name}
                    </Typography>
                    {lead.priority && (
                      <Chip size="small" label={lead.priority.toUpperCase()} sx={{
                        bgcolor: getPriorityColor(lead.priority),
                        color: "white",
                      }} />
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>
                      {lead.vehicleMake} {lead.vehicleModel} ({lead.vehicleYear})
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={3}
                    divider={<Divider orientation="vertical" flexItem />}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {lead.created_at
                          ? `Created ${formatDistanceToNow(new Date(lead.created_at))} ago`
                          : "Date Unknown"}
                      </Typography>
                    </Box>
                    {lead.dealership && (
                      <Typography variant="body2" color="text.secondary">
                        {lead.dealership}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/crm/respond-lead/${lead.lead_id}`);
                  }}
                  sx={{
                    minWidth: 200,
                    "&:hover": { transform: "translateY(-1px)", boxShadow: 2 },
                  }}
                >
                  Claim & Respond
                </Button>
              </Grid>
            </Grid>
          </Paper>
        ))
      )}
    </Container>
  );
};

const getPriorityColor = (priority?: Lead["priority"]) => {
  if (!priority) return undefined;
  const colors = {
    high: "#ef5350",
    medium: "#ff9800",
    low: "#4caf50",
  };
  return colors[priority];
};

export default UnattendedLeadsPage;