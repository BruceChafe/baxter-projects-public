import { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { User } from "@supabase/supabase-js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const useDealerGroupId = (user: User | null) => {
  const [dealergroup_id, setDealerGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealerGroupId = async () => {
      setLoading(true);
      setError(null);
      setDealerGroupId(null);

      try {
        if (!user?.id) throw new Error("User ID not available");
        if (!UUID_REGEX.test(user.id)) throw new Error(`Invalid user ID: ${user.id}`);

        // Query the new junction table
        const { data, error: queryError } = await supabase
          .from("DealerGroupMembers")
          .select("dealergroup_id")
          .eq("userId", user.id)
          .single();

        if (queryError) throw queryError;
        if (!data?.dealergroup_id) throw new Error("User not in any dealer group");
        if (!UUID_REGEX.test(data.dealergroup_id)) {
          throw new Error("Invalid dealer group ID format");
        }

        setDealerGroupId(data.dealergroup_id);

      } catch (error) {
        console.error("Fetch error:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch group");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && UUID_REGEX.test(user.id)) {
      fetchDealerGroupId();
    } else {
      setLoading(false);
      setError("Invalid authentication");
    }
  }, [user]);

  return { dealergroup_id, loading, error };
};