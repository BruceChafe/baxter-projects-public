import { supabase } from "../../../supabase/supabaseClient";

export const fetchLeadsBySource = async (
  dealership_id?: string,
  startDate?: string,
  endDate?: string,
  salesConsultantId?: string
) => {
  let query = supabase
    .from("leads")
    .select("lead_source, created_at");

  if (dealership_id) {
    query = query.eq("dealership_id", dealership_id);
  }

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  if (salesConsultantId) {
    query = query.eq("assigned_to", salesConsultantId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const leadSources = data || [];

  const aggregated = leadSources.reduce((acc, { lead_source }) => {
    const key = lead_source || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.keys(aggregated).map((source) => ({
    leadSource: source,
    count: aggregated[source],
  }));
};