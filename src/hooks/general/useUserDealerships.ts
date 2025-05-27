import { supabase } from '../../../supabase/supabaseClient';
import { useSupabaseFetch } from './useSupabaseFetch';

export function useUserDealerships(userId) {
  const transform = (data) => {
    const mapped = data.map((d) => ({
      dealership_id: d.dealership_id,
      dealership_name: d.dealerships?.dealership_name || "Unknown Dealership",
    }));

    return {
      dealerships: mapped,
      primaryDealership: (() => {
        const primary = data.find((d) => d.is_primary);
        return primary ? primary.dealership_id : data[0]?.dealership_id || null;
      })(),
    };
  };

  return useSupabaseFetch({
    tableName: "user_dealerships",
    query: () =>
      supabase
        .from("user_dealerships")
        .select("dealership_id, is_primary, dealerships (dealership_name)")
        .eq("user_id", userId),
    dependencies: [userId],
    transform,
    enabled: !!userId,
  });
}
