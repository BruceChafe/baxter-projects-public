import { supabase } from "../../../supabase/supabaseClient";


export const logLeadActivity = async (
  lead_id: string,
  action: string,
  description: string,
  userId?: string
) => {
  const { error } = await supabase.from("leadactivity").insert([
    {
      lead_id,
      user_id: userId || null,
      action,
      description,
    },
  ]);

  if (error) {
    console.error("Error logging lead activity:", error);
  }
};
