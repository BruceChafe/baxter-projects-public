import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabaseClient";

interface SalesConsultant {
  user_id: string;
  name: string;
}

const useSalesConsultants = (dealershipId: string | null) => {
  const [salespeople, setSalespeople] = useState<SalesConsultant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesConsultants = async () => {
      if (!dealershipId) {
        setSalespeople([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First, let's check the structure directly
        const { data: structureData, error: structureError } = await supabase
          .from("user_dealerships")
          .select("*")
          .limit(1);
                
        if (structureError) {
          console.error("Structure check error:", structureError);
        }
        
        // Now let's try a different approach - joining manually
        const { data, error } = await supabase
        .from("user_dealerships")
        .select(`
          user_id,
          users!user_dealerships_user_id_fkey (
            first_name, 
            last_name, 
            role_id
          )
        `)
        .eq("dealership_id", dealershipId)
        .eq("users.role_id", "136893f9-89b8-4219-bfc4-df289e61a9a9");

        if (error) throw error;
        
        if (!data || data.length === 0) {
          setSalespeople([]);
          setLoading(false);
          return;
        }
                
        // Extract user IDs
        const userIds = data.map(record => record.user_id);
        
        // Fetch users in a separate query
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, first_name, last_name, role_id")
          .in("id", userIds)
          .eq("role_id", "136893f9-89b8-4219-bfc4-df289e61a9a9");
          
        if (userError) {
          console.error("User fetch error:", userError);
          throw userError;
        }
                
        if (userData && userData.length > 0) {
          const consultants = userData.map(user => ({
            user_id: user.id,
            name: `${user.first_name} ${user.last_name}`
          }));
          
          setSalespeople(consultants);
        } else {
          setSalespeople([]);
        }
      } catch (err) {
        console.error("Error fetching sales consultants:", err);
        setError("Failed to load sales consultants.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesConsultants();
  }, [dealershipId]);

  return { salespeople, loading, error };
};

export default useSalesConsultants;