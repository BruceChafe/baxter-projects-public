// useFetchBannedCustomers.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabase/supabaseClient";

// Add dealershipId as an optional filter, plus timeFilter. 
// If you truly need salesperson, you'd add that as well.
const useFetchBannedCustomers = (
  dealergroupId: string | null,
  dealershipId: string | null,
  timeFilter: string
) => {
  const [bannedVisitors, setBannedVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBannedVisitors = useCallback(async () => {
    // If there's no dealergroupId, decide if you want to skip or fetch all
    if (!dealergroupId) return;

    setLoading(true);
    setError(null);

    try {
      // SELECT with the correct relationship for the contact
      let query = supabase
        .from("banned_visitors")
        .select(`
          id,
          dealergroup_id,
          dealership_id,
          ban_reason,
          ban_notes,
          banned_at,
          contact: contacts!banned_visitors_contact_id_fkey (
            id,
            first_name,
            last_name,
            primary_email,
            mobile_phone
          )
        `)
        .eq("dealergroup_id", dealergroupId);

      // If you also want to filter by a specific dealership:
      if (dealershipId) {
        query = query.eq("dealership_id", dealershipId);
      }

      // Apply time filter
      if (timeFilter === "week") {
        query = query.gte(
          "banned_at",
          new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()
        );
      } else if (timeFilter === "month") {
        query = query.gte(
          "banned_at",
          new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()
        );
      } else if (timeFilter === "day") {
        query = query.gte(
          "banned_at",
          new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      setBannedVisitors(data || []);
    } catch (error: any) {
      console.error("Error fetching banned visitors:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [dealergroupId, dealershipId, timeFilter]);

  useEffect(() => {
    fetchBannedVisitors();
  }, [dealergroupId, dealershipId, timeFilter, fetchBannedVisitors]);

  return { bannedVisitors, loading, error, fetchBannedVisitors };
};

export default useFetchBannedCustomers;
