import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import dayjs from "dayjs";

const useFetchVisits = (
  dealershipId: string | null,
  timeFilter: string,
  salesConsultant: string
) => {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to compute the date range based on the selected time filter
  const getTimeRange = (filter: string) => {
    let startDate;
    switch (filter) {
      case "day":
        startDate = dayjs().startOf("day"); // Today
        break;
      case "week":
        startDate = dayjs().startOf("week"); // Start of the week
        break;
      case "month":
        startDate = dayjs().startOf("month"); // Start of the month
        break;
      default:
        startDate = dayjs().startOf("week"); // Default to week
    }
    return { start: startDate.toISOString(), end: dayjs().endOf("day").toISOString() };
  };

  const fetchVisits = useCallback(async () => {
    if (!dealershipId) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("visits")
        .select(`
          id, 
          created_at, 
          visit_reason, 
          sales_type, 
          vehicle_id, 
          sales_consultant_id, 
          drivers_license_id, 
          dealership_id,
          contact:contacts (id, first_name, last_name, primary_email, mobile_phone)
        `)
        .eq("dealership_id", dealershipId);

      // Apply time filter
      const { start, end } = getTimeRange(timeFilter);
      query = query.gte("created_at", start).lte("created_at", end);

      // Apply sales consultant filter if selected
      if (salesConsultant) {
        query = query.eq("sales_consultant_id", salesConsultant);
      }

      // Fetch sorted visits (latest first)
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      setVisits(data || []);
    } catch (error: any) {
      console.error("Error fetching visits:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [dealershipId, timeFilter, salesConsultant]);

  useEffect(() => {
    fetchVisits();
  }, [dealershipId, timeFilter, salesConsultant, fetchVisits]);

  return { visits, loading, error, fetchVisits };
};

export default useFetchVisits;
