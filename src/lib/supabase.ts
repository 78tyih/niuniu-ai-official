import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient = supabaseConfigured
  ? createClient(url!, anonKey!)
  : (null as unknown as SupabaseClient)

/** 当前会话的访问令牌（无则 null） */
export async function getAccessToken(): Promise<string | null> {
  if (!supabaseConfigured) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
