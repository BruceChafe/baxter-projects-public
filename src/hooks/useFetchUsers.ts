import { useState, useEffect } from "react";
import { User } from "../types";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../supabase/supabaseClient";

export const useFetchUsers = (dealergroup_id?: number, dealership_id?: number) => {
  const { user, accessContext } = useAuth(); // Updated to use public.users instead of sqlUser
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("users") // Fetch from public.users
        .select("*");

      if (dealergroup_id) {
        query = query.eq("dealergroup_id", dealergroup_id);
      }
      if (dealership_id) {
        query = query.eq("dealership_id", dealership_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user, dealergroup_id, dealership_id]);

  return [users, loading, error, fetchUsers] as const;
};
