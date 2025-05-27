import { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";

export const useDealerships = (dealergroup_id: string) => {
  const [dealerships, setDealerships] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealerships = async () => {
      if (dealergroup_id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("dealerships")
            .select("*")
            .eq("dealergroup_id", dealergroup_id);

          if (error) throw error;

          setDealerships(data || []);
        } catch (error) {
          console.error("Error fetching dealerships:", error);
          setError("Failed to fetch dealerships.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDealerships();
  }, [dealergroup_id]);

  return { dealerships, loading, error };
};