// Supabase Edge Function - `send-adf-email`
// Save in: `supabase/functions/send-adf-email/index.ts`

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

serve(async (req) => {
  console.log("[🟢] Incoming request to /send-adf-email")

  if (req.method === "OPTIONS") {
    console.log("[🟡] OPTIONS request received (CORS preflight)")
    return new Response("OK", { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )

  try {
    const headers = Object.fromEntries(req.headers.entries())
    console.log("[📦] Headers:", headers)

    const authHeader = headers["authorization"]
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: corsHeaders,
      })
    }

    const jwt = authHeader.replace("Bearer ", "")
    const { data: user, error } = await supabase.auth.getUser(jwt)
    if (error || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: corsHeaders,
      })
    }

    const body = await req.json()
    console.log("[📥] Body:", body)

    const { source = 'Kijiji', dealership = 'Baxter Motors', city = "St. John's" } = body

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    const ADF_SEND_TO = Deno.env.get('ADF_SEND_TO')
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL')

    if (!SENDGRID_API_KEY || !ADF_SEND_TO || !SENDER_EMAIL) {
      console.error("[❌] Missing config values")
      return new Response(JSON.stringify({ error: 'Missing config' }), { status: 500, headers: corsHeaders })
    }

    const timestamp = new Date().toISOString()
    const adfXml = `<?xml version="1.0" encoding="UTF-8"?>
<?adf version="1.0"?>
<adf>
  <prospect>
    <requestdate>${timestamp}</requestdate>
    <vehicle>
      <year>2023</year>
      <make>Hyundai</make>
      <model>Elantra</model>
      <trim>Preferred</trim>
      <vin>KMH1234567890</vin>
      <stock>H1234</stock>
      <transmission>Automatic</transmission>
      <comments>Is this vehicle still available?</comments>
    </vehicle>
    <customer>
      <contact>
        <name>
          <first>Test</first>
          <last>User</last>
        </name>
        <email>test.user@example.com</email>
        <phone type="voice">709-555-1234</phone>
        <address>
          <city>${city}</city>
          <regioncode>NL</regioncode>
          <country>CA</country>
        </address>
      </contact>
      <timeframe>within 1 week</timeframe>
      <language>en-CA</language>
    </customer>
    <vendor>
      <name>${dealership}</name>
    </vendor>
    <provider>
      <name>${source}</name>
      <service>Vehicle Listing</service>
      <url>https://www.${source.toLowerCase()}.ca/sample-listing</url>
    </provider>
  </prospect>
</adf>`

    console.log("[📧] Sending email via SendGrid (manual fetch)...")
    const sendgridRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: ADF_SEND_TO }] }],
        from: { email: SENDER_EMAIL },
        subject: `Test ADF Lead from ${source}`,
        content: [
          {
            type: 'text/plain',
            value: 'Attached is a test ADF XML lead generated from your admin panel.',
          },
        ],
        attachments: [
          {
            content: btoa(adfXml),
            filename: 'adf-test-lead.xml',
            type: 'application/xml',
            disposition: 'attachment',
          },
        ],
      }),
    })

    if (!sendgridRes.ok) {
      const errorText = await sendgridRes.text()
      console.error("[❌] SendGrid API error:", sendgridRes.status, errorText)
      return new Response(JSON.stringify({ error: 'SendGrid API failed' }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    console.log("[✅] Email sent successfully!")

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (err) {
    console.error("[🔥] Error in function:", err)
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
