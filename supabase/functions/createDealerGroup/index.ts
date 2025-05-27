import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authToken = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!authToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: No token provided" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: user, error: userError } = await supabaseAdmin.auth.getUser(
      authToken
    );
    if (userError || !user) {
      console.error("❌ User authentication failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid user token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { name, country } = await req.json();
    if (!name || !country) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-08-16",
    });

    const stripeCustomer = await stripe.customers.create({
      email: user.user.email,
      name,
      metadata: { user_id: user.user.id, country },
    });

    const trial_start = new Date();
    const trial_end = new Date(trial_start);
    trial_end.setDate(trial_end.getDate() + 7);

    const { data: dealerGroup, error: dealerGroupError } = await supabaseAdmin
      .from("dealergroups")
      .insert([
        {
          name,
          country,
          stripe_customer_id: stripeCustomer.id,
          subscription_status: "trialing",
          trial_start: trial_start.toISOString(),
          trial_end: trial_end.toISOString(),
          date_created: trial_start.toISOString(),
        },
      ])
      .select()
      .single();

    if (dealerGroupError) throw dealerGroupError;

    return new Response(JSON.stringify({ dealerGroup }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Edge Function Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
