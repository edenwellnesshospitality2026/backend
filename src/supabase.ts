import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const leadsTable = process.env.SUPABASE_LEADS_TABLE || "Leads";

export const supabaseEnabled = !!supabaseUrl && !!supabaseKey;

export const supabase = supabaseEnabled
  ? createClient(supabaseUrl as string, supabaseKey as string)
  : null;

export const insertLead = async (payload: Record<string, unknown>) => {
  if (!supabase) return;
  const { error } = await supabase.from(leadsTable).insert([payload]);
  if (error) throw error;
};
