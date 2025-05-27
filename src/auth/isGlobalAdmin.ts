import { supabase } from "../../supabase/supabaseClient"; // Import the Supabase client

const isGlobalAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Query the UserRoles table to check if the user has the Global Admin role (role_id = 1)
    const { data, error } = await supabase
      .from("userroles")
      .select("role_id")
      .eq("userId", userId)
      .eq("role_id", 1);

    if (error) {
      console.error("Error checking user role:", error);
      return false;
    }

    // If data is returned and contains at least one record, the user is a Global Admin
    return data.length > 0;
  } catch (error) {
    console.error("Error in isGlobalAdmin:", error);
    return false;
  }
};

export default isGlobalAdmin;