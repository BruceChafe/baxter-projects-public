import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import { ContactData } from "../../types";

export const useContacts = (
  selected_dealergroup_id: string | null,
  selected_dealership_id: string | null
) => {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!selected_dealergroup_id) {
      setContacts([]);
      setError("No dealer group selected.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("contacts")
        .select(`
          id,
          dealership_id,
          dealergroup_id,
          first_name,
          last_name,
          primary_email,
          mobile_phone,
          status,
          last_visit,
          total_visits,
          created_at,
          updated_at,
          merged_into
        `)
        .filter("merged_into", "is", null);

      if (selected_dealership_id) {
        query = query.eq("dealership_id", selected_dealership_id);
      } else {
        query = query.eq("dealergroup_id", selected_dealergroup_id);
      }

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;

      setContacts(data || []);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  }, [selected_dealergroup_id, selected_dealership_id]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, loading, error, fetchContacts };
};
