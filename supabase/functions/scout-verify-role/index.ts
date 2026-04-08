/**
 * Phase 3 (server boundary): Optional Edge Function to verify the caller's JWT is a talent_scout
 * without embedding Supabase logic in every external integration. Deploy with:
 *   supabase functions deploy scout-verify-role
 *
 * Call with: Authorization: Bearer <user_access_token>
 * Response: 200 { "talent_scout": true } or 403 { "talent_scout": false }
 *
 * The browser can call `supabase.rpc("is_talent_scout")` directly; this function is for
 * backends, webhooks, or tools that already hold the user's access token.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "missing_bearer_token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: "server_misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await supabase.rpc("is_talent_scout");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ok = data === true;
  return new Response(JSON.stringify({ talent_scout: ok }), {
    status: ok ? 200 : 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
