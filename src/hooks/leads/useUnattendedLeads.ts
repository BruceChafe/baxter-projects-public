import { supabase } from "../../../supabase/supabaseClient";
import dayjs from "dayjs";

const LEAD_LOCK_DURATION = 20 * 60 * 1000; // 20 minutes

export const fetchUnattendedLeads = async () => {
  try {
    const { data: unattendedLeads, error: unattendedError } = await supabase
      .from("unattendedleads")
      .select("id, lead_id, claimed_by, claimed_at");

    if (unattendedError) throw unattendedError;

    const lead_ids = unattendedLeads.map((lead) => lead.lead_id);

    // Step 3: Fetch Leads Where lead_id Matches leads.id
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*") // Temporarily select all fields to debug
      .in("id", lead_ids);

    if (leadsError) throw leadsError;

    // Step 4: Extract Unique contact_ids from Leads
    const contact_ids = [
      ...new Set(leads.map((lead) => lead.contact_id).filter(Boolean)),
    ];
    if (contact_ids.length === 0) {
      console.warn("No valid contact_ids found.");
    }

    // Step 5: Fetch Contacts Where contact_id Matches contacts.id
    let contacts: { id: number; first_name: string; last_name: string; primary_email: string; mobile_phone: string }[] = [];
    if (contact_ids.length > 0) {
      const { data: contactData, error: contactsError } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, primary_email, mobile_phone")
        .in("id", contact_ids);
      if (contactsError) throw contactsError;
      contacts = contactData || [];
    }

    // Step 6: Merge Leads with Contacts and check if claimed
    const mergedLeads = unattendedLeads.map((unattendedLead) => {
      const lead = leads.find((l) => l.id === unattendedLead.lead_id) || {};

      const contact = contacts.find((c) => c.id === lead.contact_id);
      if (!contact) {
        console.warn(
          `No contact found for lead with contact_id: ${lead.contact_id}`
        );
      }

      // Compute if the lead is currently claimed:
      const isClaimed =
        unattendedLead.claimed_by &&
        unattendedLead.claimed_at &&
        dayjs(unattendedLead.claimed_at)
          .add(20, "minutes")
          .isAfter(dayjs());

      return {
        ...unattendedLead,
        isClaimed,
        lead: {
          ...lead,
          contact: contact
            ? {
                first_name: contact.first_name || "No First Name",
                last_name: contact.last_name || "No Last Name",
                email: contact.primary_email || "No Email",
                phone: contact.mobile_phone || "No Phone",
              }
            : {
                first_name: "No First Name",
                last_name: "No Last Name",
                email: "No Email",
                phone: "No Phone",
              },
        },
      };
    });

    return mergedLeads;
  } catch (error) {
    console.error("Failed to fetch unattended leads:", error);
    return [];
  }
};
