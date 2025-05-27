import { useState } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import { supabase } from "../../../supabase/supabaseClient";

const useSubmitVisit = () => {
  const [visitLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  const submitVisit = async (formData: any, userId: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!userId || !formData.dealership_id || !formData.contact_id) {
        throw new Error("Missing required fields.");
      }

      // Insert visit data into Supabase
      const { data, error } = await supabase
        .from("visits")
        .insert([
          {
            user_id: userId,
            dealership_id: formData.dealership_id,
            contact_id: formData.contact_id,
            sales_consultant_id: formData.salesConsultant || null,
            vehicle_id: formData.vehicleOfInterest || null,
            sales_type: formData.salesType || null,
            notes: formData.notes || null,
            dealergroup_id: formData.dealergroup_id || null,
            visit_reason: formData.visitReason || null,
            drivers_license_id: formData.driversLicenseId || null,
            created_at: new Date().toISOString(), // Ensure timestamp
          },
        ])
        .select();

      if (error) throw error;

      showSnackbar("Visit processed successfully.", "success");
      return data?.[0] || null;
    } catch (error: any) {
      console.error("Error submitting visit:", error);
      showSnackbar("Failed to submit visit. Please try again.", "error");
      setError(error.message || "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submitVisit, visitLoading, error };
};

export default useSubmitVisit;
