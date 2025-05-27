import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabaseClient";

interface Project {
  project_slug: string;
  tier: string;
}

const useProjectAccess = (
  dealershipId: string | null,
  dealergroupId: string
) => {
  const [projectAccess, setProjectAccess] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // if we don’t yet have a dealership or group, bail out
    if (!dealershipId || !dealergroupId) {
      setProjectAccess({});
      setError(null);
      setLoading(false);
      return;
    }

    // otherwise fetch your granular project tiers
    const fetchProjectAccess = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from<Project>("dealership_projects")
          .select("project_slug, tier")
          .eq("dealership_id", dealershipId);

        if (error) throw error;

        const access: Record<string, string> = {};
        data?.forEach((p) => {
          access[p.project_slug] = p.tier;
        });
        setProjectAccess(access);
      } catch (err: any) {
        console.error("❌ Error fetching project access:", err.message);
        setError(err.message);
        setProjectAccess({});
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAccess();
  }, [dealershipId, dealergroupId]);

  return { projectAccess, loading, error };
};

export default useProjectAccess;
