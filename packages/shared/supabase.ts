// @ts-check
import { createClient } from '@supabase/supabase-js';

/**
 * @type {string}
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
/**
 * @type {string}
 */
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(url, key);
