import { createClient } from '@supabase/supabase-js'

export default ({ $config }, inject) => {
  const supabase = createClient(
    $config.SUPABASE_URL,
    $config.SUPABASE_ANON_KEY
  )

  inject('supabase', supabase)
}
