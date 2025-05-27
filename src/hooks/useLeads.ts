import { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { LeadData } from "../types";

export const useLeads = (
  selected_dealergroup_id: number | null,
  selected_dealership: number | null
) => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [allLeads, setAllLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchLeads = async () => {
    if (!selected_dealergroup_id) {
      setLeads([]);
      setError("No dealer group selected - useLeads.");
      return;
    }
    
    setLoading(true);
    setError("");
  
    try {
      let query = supabase
        .from("leads")
        .select(`
          id,
          lead_source,
          lead_status,
          lead_type,
          lead_media,
          lead_priority,
          vehicle_make,
          vehicle_model,
          vehicle_year,
          budget,
          comments,
          created_at,
          dealergroup_id,
          dealership_id,
          contact_id,
          contact:contacts ( id, first_name, last_name, mobile_phone, primary_email )
        `);
  
      if (selected_dealership) {
        query = query.eq("dealership_id", selected_dealership);
      } else {
        query = query.eq("dealergroup_id", selected_dealergroup_id);
      }
  
      const { data, error: queryError } = await query;
  
      if (queryError) throw queryError;
  
      const leadsWithDetails = (data || []).map((lead: any) => ({
        id: lead.id,
        leadSource: lead.lead_source,
        leadStatus: lead.lead_status,
        leadType: lead.lead_type || "N/A",
        leadMedia: lead.lead_media || "N/A",
        leadPriority: lead.lead_priority || "medium",
        vehicleMake: lead.vehicle_make || "N/A",
        vehicleModel: lead.vehicle_model || "N/A",
        vehicleYear: lead.vehicle_year || "N/A",
        budget: lead.budget || "N/A",
        comments: lead.comments || "",
        created_at: lead.created_at,
        dealergroup_id: lead.dealergroup_id || null,
        dealership_id: lead.dealership_id || null,
        contact_id: lead.contact_id,
        contact: lead.contact
          ? {
              id: lead.contact.id,
              first_name: lead.contact.first_name || "Unknown",
              last_name: lead.contact.last_name || "Unknown",
              mobile_phone: lead.contact.mobile_phone || "",
              primary_email: lead.contact.primary_email || "",
            }
          : null, // Handle missing contacts
      }));
    
      setLeads(leadsWithDetails);
      setAllLeads(leadsWithDetails);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadById = async (lead_id: string) => {
    try {
      const { data, error: queryError } = await supabase
        .from("leads")
        .select(`
          id,
          lead_source,
          lead_status,
          lead_type,
          lead_media,
          lead_priority,
          vehicle_make,
          vehicle_model,
          vehicle_year,
          budget,
          comments,
          created_at,
          dealergroup_id,
          dealership_id,
          contact_id,
          contact:contacts ( id, first_name, last_name, mobile_phone, primary_email )
        `)
        .eq("id", lead_id)
        .single();
  
      if (queryError) throw queryError;
  
      return {
        id: data.id,
        leadSource: data.lead_source,
        leadStatus: data.lead_status,
        leadType: data.lead_type || "N/A",
        leadMedia: data.lead_media || "N/A",
        leadPriority: data.lead_priority || "medium",
        vehicleMake: data.vehicle_make || "N/A",
        vehicleModel: data.vehicle_model || "N/A",
        vehicleYear: data.vehicle_year || "N/A",
        budget: data.budget || "N/A",
        comments: data.comments || "",
        created_at: data.created_at,
        dealergroup_id: data.dealergroup_id || null,
        dealership_id: data.dealership_id || null,
        contact_id: data.contact_id,
        contact: data.contact
          ? {
              id: data.contact.id,
              first_name: data.contact.first_name || "Unknown",
              last_name: data.contact.last_name || "Unknown",
              mobile_phone: data.contact.mobile_phone || "",
              primary_email: data.contact.primary_email || "",
            }
          : null,
      };
    } catch (err) {
      console.error("Error fetching lead by ID:", err);
      throw new Error("Failed to fetch lead details.");
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      await fetchLeads();
    };

    fetchData();
  }, [selected_dealergroup_id, selected_dealership]);

  return { leads, allLeads, loading, error, refetchLeads: fetchLeads, fetchLeadById };
};
