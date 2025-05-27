// supabase/functions/analyze-license/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";
import { TextractClient, AnalyzeIDCommand } from "npm:@aws-sdk/client-textract";
import { v4 as uuidv4 } from "npm:uuid";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

// Environment variable validation
function validateEnvVars() {
  const requiredVars = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "S3_BUCKET_NAME"
  ];
  
  const missing = requiredVars.filter(varName => !Deno.env.get(varName));
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

// Helper to safely get environment variables
function getEnvVar(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

// AWS clients factory
function createAwsClients() {
  const credentials = {
    accessKeyId: getEnvVar("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getEnvVar("AWS_SECRET_ACCESS_KEY"),
  };
  
  const region = getEnvVar("AWS_REGION");
  
  return {
    s3: new S3Client({ region, credentials }),
    textract: new TextractClient({ region, credentials })
  };
}

async function uploadImageToS3(imageBlob: Uint8Array, imageKey: string): Promise<void> {
  const { s3 } = createAwsClients();
  
  await s3.send(
    new PutObjectCommand({
      Bucket: getEnvVar("S3_BUCKET_NAME"),
      Key: imageKey,
      Body: imageBlob,
      ContentType: "image/png",
    })
  );
}

async function analyzeIdWithTextract(imageKey: string) {
  const { textract } = createAwsClients();
  
  return await textract.send(
    new AnalyzeIDCommand({
      DocumentPages: [
        {
          S3Object: {
            Bucket: getEnvVar("S3_BUCKET_NAME"),
            Name: imageKey,
          },
        },
      ],
    })
  );
}

function extractLicenseData(analyzeResult: any, barcodeData?: string) {
  const fields = analyzeResult.IdentityDocuments?.[0]?.IdentityDocumentFields || [];

  const getValue = (key: string) =>
    fields.find((f: any) => f.Type?.Text === key)?.ValueDetection?.Text ?? "";

  const extractedData = {
    FIRST_NAME: getValue("FIRST_NAME"),
    LAST_NAME: getValue("LAST_NAME"),
    MIDDLE_NAME: getValue("MIDDLE_NAME"),
    DATE_OF_BIRTH: getValue("DATE_OF_BIRTH"),
    EXPIRATION_DATE: getValue("EXPIRATION_DATE"),
    DOCUMENT_NUMBER: barcodeData || getValue("DOCUMENT_NUMBER"),
    ADDRESS: getValue("ADDRESS"),
    CITY_IN_ADDRESS: getValue("CITY_IN_ADDRESS"),
    STATE_IN_ADDRESS: getValue("STATE_IN_ADDRESS"),
    ZIP_CODE_IN_ADDRESS: getValue("ZIP_CODE_IN_ADDRESS"),
    DATE_OF_ISSUE: getValue("ISSUE_DATE"),
    ENDORSEMENTS: getValue("ENDORSEMENTS"),
    RESTRICTIONS: getValue("RESTRICTIONS"),
    COUNTRY: "CAN",
  };

  return extractedData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  try {
    // Validate environment variables early
    validateEnvVars();
    
    // Parse request
    const { frontImageUrl, barcodeData } = await req.json();

    if (!frontImageUrl) {
      return new Response(
        JSON.stringify({ error: "Missing front image URL" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download image from Supabase
    const imageRes = await fetch(frontImageUrl);
    
    if (!imageRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to download image: ${imageRes.statusText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const imageBlob = new Uint8Array(await imageRes.arrayBuffer());
    const imageKey = `license-scans/${uuidv4()}.png`;

    // Upload to S3
    await uploadImageToS3(imageBlob, imageKey);

    // Analyze with Textract
    const analyzeResult = await analyzeIdWithTextract(imageKey);

    // Extract and process data
    const extractedData = extractLicenseData(analyzeResult, barcodeData);

    return new Response(
      JSON.stringify({ extractedData }), 
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("🔥 analyze-license error:", err);
    
    // Return more specific error information when possible
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze license", 
        details: errorMessage 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});