import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("❌ Missing VITE_SUPABASE_URL environment variable");
  throw new Error("Missing Supabase URL configuration");
}

if (!supabaseAnonKey) {
  console.error("❌ Missing VITE_SUPABASE_ANON_KEY environment variable");
  throw new Error("Missing Supabase anonymous key configuration");
}

const oldKey = "supabase.auth.token";
const newKey = "supabase.baxter.v1";

if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
  localStorage.setItem(newKey, localStorage.getItem(oldKey)!);
  localStorage.removeItem(oldKey);
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: newKey,
    debug:   false,
  },
  global: {
    headers: { 'x-client-info': 'dealership-app-web' },
  },
});

if (typeof window !== "undefined") {
  window.supabase = supabase;
}
