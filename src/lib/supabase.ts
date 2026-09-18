import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;

/**
 * env var না বসানো থাকলে (লোকাল dev বা মিসকনফিগার build) `null` — sync
 * silently বন্ধ থাকে, বাকি অ্যাপ আগের মতোই IndexedDB দিয়ে চলে।
 */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && anonKey ? createClient(url, anonKey) : null;
  return client;
}
