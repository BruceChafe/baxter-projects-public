import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase URL or Service Role Key");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const LEAD_LOCK_DURATION_MINUTES = 20;

export default async function handler(req: Request, res: any) {
  try {
    console.log("Starting unattended leads processing...");

    // 1. Insert new unattended leads.
    let { data: newLeads, error: newLeadsError } = await supabase
      .from("leads")
      .select("id, lead_status, assigned_to")
      .eq("lead_status", "New")
      .is("assigned_to", null);
    console.log("New leads fetched:", newLeads, newLeadsError);
    if (newLeadsError) throw new Error(`New leads error: ${newLeadsError.message}`);

    if (newLeads && newLeads.length > 0) {
      for (const lead of newLeads) {
        console.log(`Processing lead id ${lead.id}`);
        const { data: existing, error: existingError } = await supabase
          .from("unattendedleads")
          .select("id")
          .eq("lead_id", lead.id)
          .maybeSingle();
        console.log(`Existing unattended record for lead ${lead.id}:`, existing, existingError);
        if (existingError) throw new Error(`Existing check error for lead ${lead.id}: ${existingError.message}`);

        if (!existing) {
          const { error: insertError } = await supabase
            .from("unattendedleads")
            .insert([{ lead_id: lead.id }]);
          if (insertError) throw new Error(`Insert error for lead ${lead.id}: ${insertError.message}`);
          console.log(`Inserted lead ${lead.id} into UnattendedLeads`);
        }
      }
    }

    // 2. Clear expired claims.
    const twentyMinutesAgo = new Date(Date.now() - LEAD_LOCK_DURATION_MINUTES * 60 * 1000).toISOString();
    let { data: expiredClaims, error: expiredError } = await supabase
      .from("leads")
      .select("id, claimed_by, claimed_at, lead_status, assigned_to")
      .neq("claimed_by", null)
      .eq("lead_status", "New")
      .is("assigned_to", null)
      .lt("claimed_at", twentyMinutesAgo);
    console.log("Expired claims fetched:", expiredClaims, expiredError);
    if (expiredError) throw new Error(`Expired claims error: ${expiredError.message}`);

    if (expiredClaims && expiredClaims.length > 0) {
      for (const lead of expiredClaims) {
        console.log(`Clearing expired claim for lead ${lead.id}`);
        const { error: updateError } = await supabase
          .from("leads")
          .update({ claimed_by: null, claimed_at: null })
          .eq("id", lead.id);
        if (updateError) throw new Error(`Update error for lead ${lead.id}: ${updateError.message}`);

        const { data: existing, error: checkError } = await supabase
          .from("unattendedleads")
          .select("id")
          .eq("lead_id", lead.id)
          .maybeSingle();
        if (checkError) throw new Error(`Existing check error (expired claims) for lead ${lead.id}: ${checkError.message}`);

        if (!existing) {
          const { error: insertError } = await supabase
            .from("unattendedleads")
            .insert([{ lead_id: lead.id }]);
          if (insertError) throw new Error(`Insert error (expired claims) for lead ${lead.id}: ${insertError.message}`);
          console.log(`Reinserted expired lead ${lead.id} into UnattendedLeads`);
        }
      }
    }

    // 3. Remove leads from UnattendedLeads that are no longer unattended.
    let { data: unattendedRecords, error: unattendedError } = await supabase
      .from("unattendedleads")
      .select("id, lead_id");
    console.log("Unattended records fetched:", unattendedRecords, unattendedError);
    if (unattendedError) throw new Error(`Unattended records error: ${unattendedError.message}`);

    if (unattendedRecords && unattendedRecords.length > 0) {
      for (const record of unattendedRecords) {
        const { data: leadData, error: leadDataError } = await supabase
          .from("leads")
          .select("lead_status, assigned_to, claimed_by")
          .eq("id", record.lead_id)
          .maybeSingle();
        if (leadDataError) throw new Error(`Lead data error for record ${record.lead_id}: ${leadDataError.message}`);

        if (leadData) {
          if (leadData.lead_status !== "New" || leadData.assigned_to !== null || leadData.claimed_by !== null) {
            const { error: deleteError } = await supabase
              .from("unattendedleads")
              .delete()
              .eq("lead_id", record.lead_id);
            if (deleteError) throw new Error(`Delete error for record ${record.lead_id}: ${deleteError.message}`);
            console.log(`Removed lead ${record.lead_id} from UnattendedLeads`);
          }
        }
      }
    }

    console.log("Edge function executed successfully");
    return new Response(JSON.stringify({ message: "Edge function executed successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in unattended leads edge function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
