import { createClient } from '@supabase/supabase-js'

export default (context, inject) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  inject('supabase', supabase)
}
