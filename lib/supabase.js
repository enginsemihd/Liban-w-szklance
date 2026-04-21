import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Next.js sürekli yenilendiğinde Supabase'in çoklamasını engelliyoruz
const supabase = globalThis.supabase || createClient(supabaseUrl, supabaseAnonKey)

if (process.env.NODE_ENV !== 'production') {
  globalThis.supabase = supabase
}

export { supabase }