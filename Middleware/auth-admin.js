export default async function ({ $supabase, redirect }) {
  if (process.server) return

  // 1. เช็คว่ามี User ใน Session ไหม
  const user = $supabase.auth.user()

  // ถ้าไม่มี User (ยังไม่ Login) ให้ไปหน้า Login
  if (!user) {
    return redirect('/login')
  }

  // 2. ลองดึงข้อมูลดูว่าติด RLS ไหม
  const { data: profile, error } = await $supabase
    .from('profiles')
    .select('username') // ใช้ username ที่มีอยู่ในตารางคุณแน่ๆ
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('ติดปัญหา RLS หรือดึงข้อมูลไม่ได้:', error.message)
    // ถ้าดึงไม่ได้ แต่อยากให้เข้าหน้า Admin ได้ไปก่อนเพื่อทดสอบ ให้เอา return redirect ออก
  }

  console.log('เข้าสู่ระบบสำเร็จในชื่อ:', profile?.username)
}