import { useState } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import { useSnackbar } from "../../context/SnackbarContext";

const useCreateContact = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showSnackbar } = useSnackbar();
  
    const createContact = async (formData: any, dealergroup_id: string | null) => {
      setLoading(true);
      setError(null);
  
      try {
        // Insert new contact into Supabase
        const { data, error } = await supabase
          .from("contacts")
          .insert([
            {
              first_name: formData.first_name,
              last_name: formData.last_name,
              primary_email: formData.primary_email,
              mobile_phone: formData.mobile_phone,
              preferred_contact: ["SMS"],
              dealership_id: formData.dealership_id || null,
              dealergroup_id: formData.dealergroup_id || dealergroup_id || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select();
  
        if (error) throw error;
  
        const newContact = data?.[0] || null;
  
        showSnackbar("New contact created successfully!", "success");
  
        return newContact;
      } catch (error: any) {
        console.error("Error creating contact:", error);
        showSnackbar("Failed to create contact. Please try again.", "error");
        setError(error.message || "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    };
  
    return { createContact, loading, error };
  };
  
  export default useCreateContact;
  