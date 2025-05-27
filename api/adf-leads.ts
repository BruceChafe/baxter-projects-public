import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { parseStringPromise } from 'xml2js';

// Initialize the Supabase client using environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Add environment variable logging
console.log('Environment Check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceRoleKey,
  supabaseUrlStart: supabaseUrl?.substring(0, 10) + '...',
  serviceKeyStart: supabaseServiceRoleKey?.substring(0, 10) + '...'
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Log environment variables (safely)
    console.log('Environment Check:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlLength: process.env.SUPABASE_URL?.length,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
    });

    // Initialize Supabase with explicit error handling
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return res.status(500).json({ 
        error: "Database configuration error",
        details: "Missing required environment variables"
      });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Test database connection with more detailed error handling
    const { data: connectionTest, error: connectionError } = await supabase
      .from('dealerships')
      .select('count')
      .single();

    if (connectionError) {
      console.error('Database connection details:', {
        error: connectionError.message,
        code: connectionError.code,
        details: connectionError.details,
        hint: connectionError.hint
      });
      return res.status(500).json({ 
        error: "Database connection failed",
        details: connectionError.message,
        code: connectionError.code
      });
    }


    // Fetch all dealerships for debugging
    const { data: allDealerships, error: dealershipsError } = await supabase
      .from('dealerships')
      .select('id, name');
    
    console.log('Available dealerships:', {
      count: allDealerships?.length,
      names: allDealerships?.map(d => d.name),
      error: dealershipsError
    });

    // Read raw XML body with logging
    let rawBody = await new Promise<string>((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
        console.log('Received chunk size:', chunk.length);
      });
      req.on("end", () => resolve(data));
      req.on("error", (err) => reject(err));
    });

    console.log('Raw body length:', rawBody.length);
    console.log('Raw body preview:', rawBody.substring(0, 200));

    if (!rawBody || !rawBody.includes("<adf>")) {
      console.error("Invalid ADF request body:", rawBody);
      return res.status(400).json({ error: "Invalid ADF request body" });
    }

    // Parse XML with detailed logging
    console.log('Attempting to parse XML...');
    const result = await parseStringPromise(rawBody, { explicitArray: false });
    console.log('XML parsed successfully:', {
      hasAdf: !!result.adf,
      hasProspect: !!result.adf?.prospect,
      structure: JSON.stringify(result, null, 2)
    });

    const adf = result.adf;
    if (!adf) {
      return res.status(400).json({ error: "Missing <adf> element" });
    }

    const prospect = adf.prospect;
    if (!prospect) {
      return res.status(400).json({ error: "Missing prospect element" });
    }

    // Log extracted data
    const customer = prospect.customer?.contact;
    const vehicle = prospect.vehicle;
    const vendor = prospect.vendor;
    
    console.log('Extracted data:', {
      hasCustomer: !!customer,
      hasVehicle: !!vehicle,
      hasVendor: !!vendor,
      customerDetails: customer,
      vehicleDetails: vehicle,
      vendorDetails: vendor
    });

    if (!customer || !vehicle || !vendor) {
      console.error("Invalid ADF XML format:", result);
      return res.status(400).json({ error: "Invalid ADF XML format." });
    }

    // Dealership search with detailed logging
    const dealership_name = vendor.name.trim();
    console.log(`Searching for dealership: "${dealership_name}"`);
    
    const { data: dealershipData, error: dealershipError } = await supabase
      .from("dealerships")
      .select("*")
      .ilike("name", dealership_name)
      .limit(1)
      .single();

    console.log('Dealership search result:', {
      found: !!dealershipData,
      error: dealershipError,
      searchedName: dealership_name,
      result: dealershipData
    });

    if (dealershipError || !dealershipData) {
      console.error(`Dealership not found for name: "${dealership_name}"`, dealershipError);
      return res.status(400).json({ 
        error: `Dealership "${dealership_name}" not found.`,
        availableDealerships: allDealerships?.map(d => d.name)
      });
    }

    // Rest of your existing code with added logging...
    // [Previous contact and lead creation code remains the same]

    return res.status(201).json({ message: "ADF lead processed successfully", lead: newLead });
  } catch (error: any) {
    console.error("Error processing ADF lead:", error);
    return res.status(500).json({ 
      error: "Failed to process ADF lead.",
      details: error.message,
      stack: error.stack
    });
  }
}