// middleware/auth-admin.js
export default async function ({ $supabase, redirect }) {
  // กัน SSR / server
  if (process.server) return

  try {
    // 1) เช็ค user login
    const { data: userData, error: userErr } = await $supabase.auth.getUser()
    if (userErr) throw userErr

    const user = userData?.user
    if (!user) {
      return redirect('/login')
    }

    // 2) ดึง role จาก profiles
    // (เลือกทั้ง role และ user_role กันพัง)
    const { data: profile, error: profileErr } = await $supabase
      .from('profiles')
      .select('role, user_role')
      .eq('id', user.id)
      .single()

    if (profileErr) throw profileErr

    // 3) อ่าน role
    const role = profile?.role || profile?.user_role || null

    // 4) ไม่ใช่ admin = ดีดกลับหน้าแรก
    if (role !== 'admin') {
      return redirect('/')
    }
  } catch (e) {
    console.error('auth-admin middleware error:', e)
    return redirect('/login')
  }
}
