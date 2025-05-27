import { supabase } from "../../../supabase/supabaseClient";

export const fetchLeadById = async (lead_id: string) => {
    if (!lead_id) {
      console.error("Invalid lead_id provided:", lead_id);
      return null;
    }
  
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .maybeSingle(); // Ensures only one row is returned
  
    if (error) {
      console.error("Error fetching lead:", error);
      return null;
    }
  
    return data;
  };
  
