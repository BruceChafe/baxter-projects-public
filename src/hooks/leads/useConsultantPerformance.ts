import { supabase } from "../../../supabase/supabaseClient";

export const fetchConsultantPerformance = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("claimed_by, lead_status, created_at, converted_at")
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error fetching consultant performance:", error);
      return;
    }
  
    return data;
  };