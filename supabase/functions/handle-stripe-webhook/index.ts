import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 🔐 Environment validation
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_UPSHIFT");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("❌ Missing required environment variables.");
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2022-11-15" });
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
      },
    });
  }

  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, stripeWebhookSecret);
  } catch (err) {
    console.error("❌ Stripe webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId = session.subscription as string;
    const checkoutSessionId = session.metadata?.checkout_session_id;

    if (!checkoutSessionId) {
      console.error("❌ Missing checkout_session_id in metadata");
      return new Response("Missing checkout_session_id", { status: 400 });
    }

    // ✅ Get the session and selections
    const { data: checkoutSession, error: fetchError } = await supabase
      .from("checkout_sessions")
      .select("selections, dealergroup_id")
      .eq("id", checkoutSessionId)
      .single();

    if (fetchError || !checkoutSession) {
      console.error("❌ Failed to fetch checkout_session:", fetchError?.message);
      return new Response("Could not find session data", { status: 400 });
    }

    const selections = checkoutSession.selections;
    const dealergroup_id = checkoutSession.dealergroup_id; // Fetch dealergroup_id

    if (!Array.isArray(selections) || selections.length === 0) {
      console.warn("⚠️ No selections found in session");
      return new Response("No selections to process", { status: 400 });
    }

    // ✅ Update dealergroup subscription status from 'trialing' to 'active'
    const { error: updateDealergroupError } = await supabase
      .from("dealergroups")
      .update({ subscription_status: "active" })
      .eq("id", dealergroup_id);

    if (updateDealergroupError) {
      console.error("❌ Failed to update dealergroup status:", updateDealergroupError.message);
      return new Response("Failed to update dealergroup status", { status: 500 });
    }

    console.log(`✅ Updated dealergroup ${dealergroup_id} status to 'active'`);

    // Process selections and upsert dealership projects
    for (const selection of selections) {
      const { dealership_id, project_slug, tier } = selection;

      if (!dealership_id || !project_slug || !tier) {
        console.warn("⚠️ Incomplete selection, skipping:", selection);
        continue;
      }

      const { error } = await supabase
        .from("dealership_projects")
        .upsert(
          {
            dealership_id,
            project_slug,
            tier,
            stripe_subscription_id: subscriptionId,
            is_active: true,
          },
          {
            onConflict: "dealership_id,project_slug",
          }
        );

      if (error) {
        console.error(`❌ Failed to upsert ${dealership_id}/${project_slug}:`, error.message);
      } else {
        console.log(`✅ Upserted ${dealership_id} → ${project_slug} (${tier})`);
      }
    }

    // Update checkout session to 'completed'
    const { error: updateError } = await supabase
      .from("checkout_sessions")
      .update({ status: "completed" })
      .eq("id", checkoutSessionId);

    if (updateError) {
      console.warn("⚠️ Could not update checkout session status:", updateError.message);
    }

    return new Response("✅ Webhook handled", { status: 200 });
  }

  console.log(`ℹ️ Ignoring non-checkout event: ${event.type}`);
  return new Response("Event not handled", { status: 200 });
});
