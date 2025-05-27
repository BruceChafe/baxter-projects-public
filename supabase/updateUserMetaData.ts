import { supabase } from "./supabaseClient";

export const updateUserMetadata = async (dealergroup_id: number) => {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      dealergroup_id: dealergroup_id,
    },
  });

  if (error) {
    console.error("Error updating user metadata:", error);
    return;
  }
};
