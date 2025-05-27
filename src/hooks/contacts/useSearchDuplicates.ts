import { useState } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import { useSnackbar } from "../../context/SnackbarContext";

const useSearchDuplicates = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchDuplicates = async ({
    first_name,
    last_name,
    primary_email,
    mobile_phone,
    dealership_id,
    dealergroup_id,
    salesConsultant, // New filter parameter
  }: {
    first_name?: string;
    last_name?: string;
    primary_email?: string;
    mobile_phone?: string;
    dealership_id?: string | null;
    dealergroup_id?: string | null;
    salesConsultant?: string;
  }) => {
    setLoading(true);
    setError(null);
    setDuplicates([]);

    // Require at least one search field (salesConsultant is optional)
    if (!first_name && !last_name && !primary_email && !mobile_phone) {
      showSnackbar("At least one search field is required.", "warning");
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from("contacts").select("*");

      if (first_name)
        query = query.ilike("first_name", `%${first_name}%`);
      if (last_name)
        query = query.ilike("last_name", `%${last_name}%`);
      if (primary_email)
        query = query.ilike("primary_email", `%${primary_email}%`);
      if (mobile_phone)
        query = query.ilike("mobile_phone", `%${mobile_phone}%`);
      if (dealership_id)
        query = query.eq("dealership_id", dealership_id);
      if (dealergroup_id)
        query = query.eq("dealergroup_id", dealergroup_id);
      // Apply the sales consultant filter only if a value is provided
      if (salesConsultant)
        query = query.eq("sales_consultant", salesConsultant);

      // Exclude archived contacts
      query = query.neq("status", "ARCHIVED");

      const { data, error } = await query.order("updated_at", { ascending: false });

      if (error) throw error;

      setDuplicates(data || []);
    } catch (error: any) {
      console.error("Error searching for duplicates:", error);
      setError("Failed to search for duplicates.");
      showSnackbar("Error searching for duplicates.", "error");
    } finally {
      setLoading(false);
    }
  };

  return { searchDuplicates, duplicates, loading, error };
};

export default useSearchDuplicates;
