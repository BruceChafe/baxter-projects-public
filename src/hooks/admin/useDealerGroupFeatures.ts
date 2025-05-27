import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabaseClient";

export default function useDealergroupFeatures(dealergroup_id: string | undefined) {
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);


  supabase.auth.getSession().then((session) => {
    const token = session.data.session?.access_token;
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
    }
  });
  

  useEffect(() => {
    const fetchFeatures = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        console.warn("❌ No session found. Aborting fetch.");
        setLoading(false);
        return;
      }

      if (!dealergroup_id) {
        console.warn("❌ No dealergroup_id provided.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("dealergroup_features")
        .select("feature_key")
        .eq("dealergroup_id", dealergroup_id)
        .eq("is_enabled", true);

      if (error) {
        console.error("🚨 Supabase error:", error);
      } else {
        setFeatures(data.map((f) => f.feature_key));
      }

      setLoading(false);
    };

    fetchFeatures();
  }, [dealergroup_id]);

  return { features, loading };
}