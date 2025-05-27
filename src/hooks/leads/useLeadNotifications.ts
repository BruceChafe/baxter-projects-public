import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabaseClient";

export const useLeadNotifications = (selected_dealership: string | null) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          primary_email,
          first_name,
          last_name, 
          user_dealerships(
            dealership_id,
            dealerships(dealership_name)
          ),
          lead_notifications(dealership_id, receive_leads)
        `);
  
      if (error) throw error;
  
      const formattedUsers = data.map(user => {
        // Find the notification for the selected dealership
        const notification = user.lead_notifications && user.lead_notifications.find(n => n.dealership_id === selected_dealership);
        return {
          ...user,
          dealership_name: user.user_dealerships?.[0]?.dealerships?.dealership_name || "Unknown",
          receive_leads: notification ? notification.receive_leads : false
        };
      });
  
      setUsers(formattedUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [selected_dealership]); // refetch if selected_dealership changes
  
  const updateNotification = async (user_id: string, receive_leads: boolean, dealership_id: string) => {
    try {
      if (!receive_leads) {
        // If toggled off, delete the record
        const { error } = await supabase
          .from("lead_notifications")
          .delete()
          .match({ user_id, dealership_id });
        if (error) throw error;
      } else {
        // If toggled on, insert or update the record
        const { error } = await supabase
          .from("lead_notifications")
          .upsert(
            { user_id, receive_leads, dealership_id },
            { onConflict: ["user_id", "dealership_id"] }
          );
        if (error) throw error;
      }
  
      // Optionally, re-fetch the users to update the local state.
      fetchUsers(); // Ensure fetchUsers is in scope in your hook.
    } catch (err) {
      console.error("Error updating notification:", err);
      setError(err.message);
    }
  };
  
  
  return { users, loading, error, fetchUsers, updateNotification };
};
