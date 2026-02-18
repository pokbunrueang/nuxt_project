<template>
  <v-container fluid class="bg-main fill-height d-flex align-center justify-center">
    <v-card width="500" rounded="xl" class="pa-8 card-dark elevation-20" dark>
      <v-card-text class="text-center">
        <v-avatar size="100" class="mb-4">
          <v-img src="/manga.jpg" />
        </v-avatar>

        <h1 class="text-h4 font-weight-black white--text mb-2 uppercase">
          สมัครบัญชี
        </h1>
        <p class="grey--text mb-6">
          สมัครสมาชิกเพื่อเริ่มสะสมมังงะเล่มโปรด
        </p>

        <v-form ref="form">
          <v-text-field
            v-model="user.user_name"
            label="ชื่อ-นามสกุล"
            prepend-inner-icon="mdi-account-details"
            outlined
            rounded
            dense
            class="mb-2"
          />

          <v-text-field
            v-model="user.username"
            label="ชื่อผู้ใช้งาน (Username)"
            prepend-inner-icon="mdi-account"
            outlined
            rounded
            dense
            class="mb-2"
          />

          <v-text-field
            v-model="user.email"
            label="อีเมล (Email)"
            prepend-inner-icon="mdi-email"
            outlined
            rounded
            dense
            class="mb-2"
          />

          <v-text-field
            v-model="user.password"
            label="รหัสผ่าน (Password)"
            prepend-inner-icon="mdi-lock"
            type="password"
            outlined
            rounded
            dense
            class="mb-2"
          />

          <v-text-field
            v-model="confirm_password"
            label="ยืนยันรหัสผ่านอีกครั้ง"
            prepend-inner-icon="mdi-lock-check"
            type="password"
            outlined
            rounded
            dense
          />
        </v-form>

        <v-btn
          :loading="loading"
          :disabled="loading"
          color="primary"
          block
          x-large
          rounded
          class="font-weight-bold mt-4 py-6"
          @click="handleRegister"
        >
          <v-icon left>mdi-account-plus</v-icon>
          ยืนยันสมัครสมาชิก
        </v-btn>

        <v-btn text block class="mt-4 grey--text" to="/login">
          มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  layout: 'blank',
  data: () => ({
    loading: false,
    user: {
      user_name: '',
      username: '',
      email: '',
      password: ''
    },
    confirm_password: ''
  }),

  methods: {
    async handleRegister() {
      try {
        // ===== validate =====
        if (!this.user.user_name || !this.user.username || !this.user.email || !this.user.password) {
          alert('กรุณากรอกข้อมูลให้ครบทุกช่อง')
          return
        }

        if (this.user.password.length < 6) {
          alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
          return
        }

        if (this.user.password !== this.confirm_password) {
          alert('รหัสผ่านยืนยันไม่ตรงกัน')
          return
        }

        this.loading = true

        // ===== 1) สมัครสมาชิก (Supabase v1) =====
        const { user, session, error } = await this.$supabase.auth.signUp(
          {
            email: this.user.email,
            password: this.user.password
          },
          {
            data: {
              user_name: this.user.user_name,
              username: this.user.username,
              role: 'customer'
            }
          }
        )

        if (error) throw error

        // ถ้าเปิด confirm email -> session จะเป็น null (ปกติ)
        // แต่ user จะมี id ให้ใช้ได้
        const userId = user?.id

        // ===== 2) insert profiles =====
        // (ทำเฉพาะตอนมี userId)
        if (userId) {
          const { error: profileErr } = await this.$supabase.from('profiles').insert([
            {
              id: userId,
              user_name: this.user.user_name,
              username: this.user.username,
              role: 'customer'
            }
          ])

          // ถ้า insert ไม่ได้ ส่วนใหญ่เป็น RLS
          if (profileErr) throw profileErr
        }

        // ===== success =====
        if (!session) {
          alert('สมัครสมาชิกสำเร็จ! กรุณาไปยืนยันอีเมลก่อนเข้าสู่ระบบ')
        } else {
          alert('สมัครสมาชิกสำเร็จ!')
        }

        this.$router.push('/login')
      } catch (e) {
        console.error('REGISTER ERROR:', e)
        alert(e.message || 'สมัครสมาชิกไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.bg-main {
  background-color: #121212;
  background-image: radial-gradient(circle at center, #1e1e1e 0%, #121212 100%);
}
.card-dark {
  background-color: #1e1e1e !important;
  border: 1px solid #333 !important;
}
.uppercase {
  text-transform: uppercase;
}
</style>
