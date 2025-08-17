import { createClient } from '@supabase/supabase-js'
console.log('SB URL', import.meta.env.VITE_SUPABASE_URL)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
)