import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { User } from "../types";

const useFetchSalesConsultants = (dealership_id: string, role_id: string = "136893f9-89b8-4219-bfc4-df289e61a9a9") => {
  const [consultants, setConsultants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noConsultants, setNoConsultants] = useState<boolean>(false);

  const isValidUUID = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

  useEffect(() => {
    const fetchConsultants = async () => {
      if (!isValidUUID(dealership_id)) {
        console.error("Invalid dealership ID:", dealership_id);
        setError("Invalid dealership ID format.");
        setLoading(false);
        return;
      }

      // Check if role_id is a valid UUID before querying
      const jobTitleFilter = isValidUUID(role_id) ? role_id : String(role_id);
      
      try {
        setLoading(true);

        const { data, error: supabaseError } = await supabase
          .from("user_dealerships")
          .select("*")
          .eq("dealership_id", dealership_id)
          .eq("role_id", jobTitleFilter); // Apply correct data type

        if (supabaseError) throw supabaseError;

        if (data.length === 0) {
          setNoConsultants(true);
          setConsultants([]);
        } else {
          setConsultants(data);
          setNoConsultants(false);
        }
      } catch (err) {
        console.error("Error fetching sales consultants:", err);
        setError("Failed to load consultants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, [dealership_id, role_id]);

  return [consultants, loading, error, noConsultants] as const;
};

export default useFetchSalesConsultants;
