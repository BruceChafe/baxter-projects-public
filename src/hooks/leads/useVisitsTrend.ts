import { supabase } from "../../../supabase/supabaseClient";

export const fetchVisitsTrend = async (dealership_id?: string, timeFilter?: string) => {
  // Create a query builder
  let query = supabase
    .from("visits")
    .select("dateOfVisit")
    .order("dateOfVisit", { ascending: true });
  
  // Apply dealership filter if provided
  if (dealership_id) {
    query = query.eq("dealership_id", dealership_id);
  }
  
  // Apply time filter if provided
  if (timeFilter) {
    const now = new Date();
    let startDate;
    
    switch (timeFilter) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        const day = now.getDay();
        startDate = new Date(now.setDate(now.getDate() - day));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        // Default to last 30 days if timeFilter is not recognized
        startDate = new Date(now.setDate(now.getDate() - 30));
    }
    
    query = query.gte("dateOfVisit", startDate.toISOString());
  }
  
  // Execute the query
  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};