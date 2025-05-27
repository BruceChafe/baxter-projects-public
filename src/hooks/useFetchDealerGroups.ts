import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";

interface DealerGroup {
  id: number;
  name: string;
}

const useFetchDealerGroups = () => {
  const [dealerGroups, setDealerGroups] = useState<DealerGroup[]>([]);
  const [dealerGroupsLoading, setDealerGroupsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealerGroups = async () => {
      try {
        setDealerGroupsLoading(true);

        // Fetch dealer groups from Supabase
        const { data, error: supabaseError } = await supabase
          .from("DealerGroups")
          .select("id, name")
          .eq("isDeleted", false); // Filter out deleted dealer groups

        if (supabaseError) throw supabaseError;

        setDealerGroups(data || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching dealer groups:", err);
        setError("Failed to load dealer groups. Please try again later.");
      } finally {
        setDealerGroupsLoading(false);
      }
    };

    fetchDealerGroups();
  }, []); // No dependencies needed since we're fetching all dealer groups

  return { dealerGroups, dealerGroupsLoading, error, setDealerGroups, setError };
};

export default useFetchDealerGroups;