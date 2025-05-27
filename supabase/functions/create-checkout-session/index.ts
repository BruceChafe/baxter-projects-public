import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// ✅ Load and validate env vars
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);


if (!supabaseUrl || !supabaseServiceRoleKey || !stripeSecretKey) {
  console.error("❌ Missing one or more required environment variables.");
  throw new Error("Environment configuration error.");
}

// ✅ Initialize Stripe
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2022-11-15",
});

// ✅ Tier-to-price mapping
const tierToPriceId: Record<string, string> = {
  basic: "price_1RJhrzGAalDfFMMcps4og0jW",
  standard: "price_1RJhtmGAalDfFMMcpHIRPCts",
  pro: "price_1RJhudGAalDfFMMcWjeIcyig",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
      },
    });
  }

  try {
    const raw = await req.text();
    console.log("📦 Raw request body:", raw);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (jsonErr) {
      console.error("❌ Failed to parse JSON:", jsonErr);
      return new Response("Invalid JSON", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const { selections, success_url, cancel_url } = parsed;
    console.log("✅ Parsed input:", { selections, success_url, cancel_url });

    if (!Array.isArray(selections) || selections.length === 0) {
      console.error("❌ Invalid selections:", selections);
      return new Response("Invalid selections", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const meta = selections[0];
    const { dealergroup_id } = meta;

    if (!dealergroup_id) {
      console.error("❌ Missing dealergroup_id:", meta);
      return new Response("Missing dealergroup_id", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Fetch the stripe_customer_id from the dealergroup
    const { data: dealergroup, error: dgError } = await supabaseAdmin
      .from("dealergroups")
      .select("stripe_customer_id")
      .eq("id", dealergroup_id)
      .single();

    if (dgError || !dealergroup?.stripe_customer_id) {
      console.error("❌ Failed to fetch stripe_customer_id:", dgError);
      return new Response("Missing stripe_customer_id", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const stripeCustomerId = dealergroup.stripe_customer_id;
    console.log("✅ Retrieved Stripe customer ID:", stripeCustomerId);

    // Insert checkout session record
    const insertPayload = {
      dealergroup_id,
      selections,
      status: "pending",
    };

    console.log("📝 Inserting checkout session:", insertPayload);

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/checkout_sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        apikey: supabaseServiceRoleKey, // Required for REST API auth
        Prefer: "return=representation",
      },
      body: JSON.stringify([insertPayload]),
    });

    const insertData = await insertResponse.json();

    if (!insertResponse.ok || !Array.isArray(insertData) || !insertData[0]?.id) {
      console.error("❌ Admin API insert failed:", insertData);
      return new Response("Failed to store checkout session", {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const checkoutSession = insertData[0];
    console.log("✅ Inserted checkout session:", checkoutSession.id);

    // Prepare line items for Stripe
    const priceQuantities: Record<string, number> = {};
    for (const sel of selections) {
      const price = tierToPriceId[sel.tier];
      if (!price) {
        console.error("❌ Unknown tier in selection:", sel.tier);
        return new Response(`Unknown tier: ${sel.tier}`, {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
      priceQuantities[price] = (priceQuantities[price] || 0) + 1;
    }

    const line_items = Object.entries(priceQuantities).map(([price, quantity]) => ({
      price,
      quantity,
    }));

    console.log("🧾 Creating Stripe session:", line_items);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items,
      success_url,
      cancel_url,
      customer: stripeCustomerId,  // Use the stripe_customer_id for checkout
      metadata: {
        checkout_session_id: checkoutSession.id,
      },
    });

    console.log("✅ Stripe session created:", session.id);

    // Update the checkout session with the Stripe session ID
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/checkout_sessions?id=eq.${checkoutSession.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        apikey: supabaseServiceRoleKey, // Also required here
      },
      body: JSON.stringify({ stripe_session_id: session.id }),
    });

    if (!updateResponse.ok) {
      const updateErr = await updateResponse.text();
      console.error("⚠️ Failed to update checkout session:", updateErr);
    } else {
      console.log("✅ Stripe session ID saved to DB");
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("❌ Unhandled error:", err instanceof Error ? err.message : String(err));
    return new Response(`Internal Server Error: ${err instanceof Error ? err.message : "Unknown error"}`, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});
