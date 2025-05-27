import { supabase } from "../../../supabase/supabaseClient";

export const fetchLeadsByResponseChannel = async (dealership_id?: string) => {
  if (!dealership_id) {
    const { data, error } = await supabase
      .from("leads")
      .select("lead_source");
      // .eq("isDeleted", false);
    
    if (error) throw error;
    return data || [];
  }

  const { data, error } = await supabase
    .from("leads")
    .select("lead_source")
    .eq("dealership_id", dealership_id);
    // .eq("isDeleted", false);

  if (error) throw error;
  return data || [];
};