import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client. Null when env vars are missing so the app can keep
 * running on the local (mock) store until the backend migration lands.
 */
export const supabase = url && key ? createClient(url, key) : null;
export const isSupabaseEnabled = Boolean(supabase);
