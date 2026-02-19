<template>
  <v-container fluid class="bg-main fill-height d-flex align-center justify-center">
    <v-card width="450" rounded="xl" class="pa-8 card-dark elevation-24 position-relative">
      
      <v-btn
        icon
        to="/"
        class="position-absolute mt-n4 ml-n4 grey--text text--lighten-1"
        title="กลับหน้าหลัก"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-card-text class="text-center">
        <v-avatar size="100" class="mb-4 elevation-10 border-gold">
          <v-img src="/manga.png" alt="logo" />
        </v-avatar>

        <h1 class="text-h4 font-weight-black white--text mb-2 uppercase tracking-widest">
          เข้าสู่ระบบ
        </h1>
        <p class="grey--text text--lighten-1 mb-6">
          ยินดีต้อนรับกลับ! เข้าสู่ระบบเพื่อช้อปมังงะต่อ
        </p>

        <v-form ref="form" v-model="isFormValid" @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            label="อีเมล (Email)"
            prepend-inner-icon="mdi-email-outline"
            outlined rounded dark
            :rules="[v => !!v || 'กรุณากรอกอีเมล', v => /.+@.+\..+/.test(v) || 'รูปแบบอีเมลไม่ถูกต้อง']"
            class="mb-2 custom-field"
          />

          <v-text-field
            v-model="password"
            label="รหัสผ่าน (Password)"
            prepend-inner-icon="mdi-lock-outline"
            :type="showPassword ? 'text' : 'password'"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            outlined rounded dark
            :rules="[v => !!v || 'กรุณากรอกรหัสผ่าน']"
            class="custom-field"
            @click:append="showPassword = !showPassword"
          />

          <v-btn
            v-if="!isLoggedIn"
            :loading="loading"
            :disabled="!isFormValid || loading"
            color="error"
            block x-large rounded
            elevation="8"
            class="font-weight-bold mt-6 py-7"
            type="submit"
          >
            <v-icon left>mdi-login-variant</v-icon>
            เข้าสู่ระบบ
          </v-btn>

          <v-btn
            v-else
            color="success"
            block x-large rounded
            class="font-weight-bold mt-6 py-7"
            disabled
          >
            <v-icon left>mdi-check-circle</v-icon>
            กำลังเข้าสู่ระบบ...
          </v-btn>
        </v-form>

        <v-divider class="my-6 grey darken-3"></v-divider>

        <div class="d-flex flex-column align-center">
          <v-btn text color="primary" class="text-capitalize font-weight-bold" to="/register">
            ยังไม่มีบัญชี? สมัครสมาชิกที่นี่
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" top rounded="pill">
      <v-icon left color="white">mdi-information</v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  layout: 'blank',
  data: () => ({
    email: '',
    password: '',
    loading: false,
    isLoggedIn: false,
    isFormValid: false,
    showPassword: false,
    snackbar: {
      show: false,
      message: '',
      color: 'success'
    }
  }),
  methods: {
    async handleLogin() {
      if (!this.$refs.form.validate()) return
      
      try {
        this.loading = true
        
        const { data, error: authError } = await this.$supabase.auth.signIn({
          email: this.email,
          password: this.password
        })

        if (authError) throw authError

        const user = data?.user || this.$supabase.auth.user()
        if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้งานในระบบ")

        const { data: profile, error: profileErr } = await this.$supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileErr) {
          console.warn("Profile Error:", profileErr.message)
        }

        this.isLoggedIn = true
        this.snackbar.message = 'ตรวจสอบสิทธิ์สำเร็จ กำลังนำทาง...'
        this.snackbar.color = 'success'
        this.snackbar.show = true

        setTimeout(() => {
          if (profile && profile.role === 'admin') {
            window.location.assign('/admin/index_ad')
          } else {
            window.location.assign('/')
          }
        }, 800)

      } catch (e) {
        this.isLoggedIn = false
        this.snackbar.message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        this.snackbar.color = 'error'
        this.snackbar.show = true
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.bg-main {
  background-color: #0f0f0f;
  background-image: radial-gradient(circle at 20% 30%, #1e1e1e 0%, #0f0f0f 100%);
}
.card-dark {
  background-color: #1a1a1a !important;
  border: 1px solid #333 !important;
  backdrop-filter: blur(10px);
}
.border-gold {
  border: 2px solid #ff5252;
}
.position-relative {
  position: relative;
}
.position-absolute {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
}
.custom-field :deep(.v-input__slot) {
  background: rgba(255, 255, 255, 0.05) !important;
}
.tracking-widest {
  letter-spacing: 2px;
}
.uppercase {
  text-transform: uppercase;
}
</style>