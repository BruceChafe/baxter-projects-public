import { supabase } from '../../../supabase/supabaseClient';
import { useSupabaseFetch } from './useSupabaseFetch';

export function useDealerGroups() {
  return useSupabaseFetch({
    tableName: "dealergroups",
    query: () => new Promise((resolve) => {
      supabase.from("dealergroups").select("*").then(response => resolve(response));
    }),
    dependencies: []
  });
}
