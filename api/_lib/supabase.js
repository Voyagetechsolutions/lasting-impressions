import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role (full admin access)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabaseAdmin;
