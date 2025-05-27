import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { UserData } from "../types";

export const useUsers = (
  selected_dealergroup_id: string | null,
  selected_dealership: string | null
) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch all users for a dealership
  const fetchUsers = useCallback(async () => {
    if (!selected_dealership) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: sbError } = await supabase
        .from("user_dealerships")
        .select(`
          is_primary,
          user:user_id (
            id,
            primary_email,
            primary_phone,
            first_name,
            last_name,
            dealergroup_id,
            role_id,
            job_title_id,
            department_id,
            created_at,
            last_login,
            jobTitle:job_title_id(title),
            department:department_id(name),
            role:role_id(name)
          ),
          dealership:dealership_id (
            dealership_name
          )
        `)
        .eq("dealership_id", selected_dealership);

      if (sbError) throw sbError;

      const valid = (data || []).filter((ud) => ud.user !== null);

      const mapped: UserData[] = valid.map((ud) => {
        const u = ud.user!;
        return {
          id: String(u.id),
          primary_email: u.primary_email,
          primary_phone: u.primary_phone,
          first_name: u.first_name || "N/A",
          last_name: u.last_name || "N/A",
jobTitle: u.jobTitle?.title || "N/A",
department: u.department?.name || "N/A",
role: u.role?.name || "N/A",
          role_id: u.role_id,
          dealergroup_id: String(u.dealergroup_id),
          created_at: u.created_at,
          lastLogin: u.last_login || null,
          dealerships: [
            {
              id: selected_dealership,
              name: ud.dealership?.dealership_name || "N/A",
              is_primary: ud.is_primary,
            },
          ],
          primary_dealership_id: ud.is_primary ? selected_dealership : null,
        };
      });

      setUsers(mapped);
    } catch (err: any) {
      console.error("❌ Error fetching users:", err);
      setError(err.message || "Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [selected_dealership]);

  // Fetch a single user by ID (for the details dialog)
  const fetchUserById = useCallback(
    async (userId: string): Promise<UserData> => {
      setLoading(true);
      setError("");
      try {
        const { data: u, error: userErr } = await supabase
          .from("users")
          .select(`
            id,
            primary_email,
            primary_phone,
            first_name,
            last_name,
            dealergroup_id,
            role_id,
            job_title_id,
            department_id,
            created_at,
            last_login,
            jobTitle:job_title_id(title),
            department:department_id(name),
            role:role_id(name),
            user_dealerships (
              dealership_id,
              is_primary,
              dealerships:dealership_id (dealership_name)
            )
          `)
          .eq("id", userId)
          .single();

        if (userErr || !u) throw userErr || new Error("User not found");

        const dealerships = (u.user_dealerships || []).map((ud: any) => ({
          id: String(ud.dealership_id),
          name: ud.dealerships?.dealership_name ?? "N/A",
          is_primary: ud.is_primary,
        }));
        const primary = dealerships.find((d) => d.is_primary)?.id ?? null;

        return {
          id: String(u.id),
          primary_email: u.primary_email,
          primary_phone: u.primary_phone,
          first_name: u.first_name || "N/A",
          last_name: u.last_name || "N/A",
          jobTitle: u.jobTitle || "N/A",
          department: u.department || "N/A",
          role: u.role || "N/A",
          role_id: u.role_id,
          dealergroup_id: String(u.dealergroup_id),
          created_at: u.created_at,
          lastLogin: u.last_login || null,
          dealerships,
          primary_dealership_id: primary,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Trigger initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetchUsers: fetchUsers,
    fetchUserById, // <-- now exposed
  };
};
