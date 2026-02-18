<template>
  <v-container fluid class="bg-main fill-height d-flex align-center justify-center">
    <v-card width="500" rounded="xl" class="pa-8 card-dark elevation-20" dark>
      <v-card-text class="text-center">
        <v-avatar size="100" class="mb-4">
          <v-img src="/manga.jpg" alt="logo" />
        </v-avatar>

        <h1 class="text-h4 font-weight-black white--text mb-2 uppercase">
          เข้าสู่ระบบ
        </h1>
        <p class="grey--text mb-6">
          เข้าสู่ระบบเพื่อสั่งซื้อมังงะเล่มโปรด
        </p>

        <v-form ref="form">
          <v-text-field
            v-model="email"
            label="อีเมล (Email)"
            prepend-inner-icon="mdi-email"
            outlined
            rounded
            dense
            class="mb-2"
          />

          <v-text-field
            v-model="password"
            label="รหัสผ่าน (Password)"
            prepend-inner-icon="mdi-lock"
            type="password"
            outlined
            rounded
            dense
          />
        </v-form>

        <v-btn
          :loading="loading"
          :disabled="loading"
          color="error"
          block
          x-large
          rounded
          class="font-weight-bold mt-4 py-6"
          @click="handleLogin"
        >
          <v-icon left>mdi-login</v-icon>
          เข้าสู่ระบบ
        </v-btn>

        <v-btn text block class="mt-4 grey--text" to="/register">
          ยังไม่มีบัญชี? สมัครสมาชิก
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  layout: 'blank',
  data: () => ({
    email: '',
    password: '',
    loading: false
  }),
  methods: {
    async handleLogin() {
      try {
        if (!this.email || !this.password) {
          alert('กรุณากรอก Email และ Password')
          return
        }

        this.loading = true

        // ✅ Supabase v1 login
        const { user, session, error } = await this.$supabase.auth.signIn({
          email: this.email,
          password: this.password
        })

        if (error) throw error

        // เก็บ session ไว้ก็ได้ (ไม่จำเป็นมาก)
        localStorage.setItem('user_session', JSON.stringify(session))

        alert('เข้าสู่ระบบสำเร็จ!')
        this.$router.push('/')
      } catch (e) {
        console.error('LOGIN ERROR:', e)
        alert(e.message || 'เข้าสู่ระบบไม่สำเร็จ')
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
