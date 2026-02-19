<template>
  <v-container fluid class="bg-admin-main pa-6">
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex align-center">
        <h1 class="text-h4 font-weight-black white--text uppercase">
          Admin Dashboard
        </h1>
        <v-spacer></v-spacer>

        <v-btn
          color="error"
          outlined
          rounded
          @click="handleLogout"
          class="font-weight-bold"
        >
          <v-icon left>mdi-logout</v-icon> ออกจากระบบ
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="3" v-for="(stat, i) in stats" :key="i">
        <v-card rounded="xl" class="pa-4 card-dark elevation-10" dark>
          <div class="d-flex align-center">
            <v-avatar :color="stat.color" size="56" class="mr-4 elevation-4">
              <v-icon dark size="30">{{ stat.icon }}</v-icon>
            </v-avatar>

            <div>
              <div class="text-caption grey--text text-uppercase font-weight-bold">
                {{ stat.title }}
              </div>

              <div class="text-h5 font-weight-black">
                <span v-if="loading" class="text-caption">กำลังโหลด...</span>
                <span v-else>{{ stat.value }}</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12">
        <v-card rounded="xl" class="card-dark pa-10" dark>
          <v-card-title class="font-weight-bold mb-6 justify-center">
            <v-icon left color="primary" size="32">
              mdi-view-dashboard-outline
            </v-icon>
            <span class="text-h5">เมนูจัดการระบบหลัก</span>
          </v-card-title>

          <v-row justify="center">
            <v-col
              cols="6"
              sm="3"
              v-for="(menu, i) in quickMenus"
              :key="i"
              class="text-center"
            >
              <v-hover v-slot="{ hover }">
                <v-btn
                  fab
                  x-large
                  :color="menu.color"
                  @click="navigateTo(menu.link)"
                  :elevation="hover ? 16 : 4"
                  size="80"
                  class="mb-4 transition-swing"
                >
                  <v-icon size="40">{{ menu.icon }}</v-icon>
                </v-btn>
              </v-hover>
              <div class="text-h6 font-weight-medium white--text">
                {{ menu.text }}
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  // 🚩 มั่นใจว่าไฟล์ middleware/auth-admin.js ถูกสร้างไว้แล้ว
  middleware: 'auth-admin',

  data: () => ({
    loading: true,
    stats: [
      { id: 'today_sales', title: 'ยอดขายวันนี้', value: '0 ฿', icon: 'mdi-cash-multiple', color: 'success' },
      { id: 'new_orders', title: 'ออเดอร์ใหม่', value: '0', icon: 'mdi-cart-arrow-down', color: 'primary' },
      { id: 'total_manga', title: 'มังงะทั้งหมด', value: '0', icon: 'mdi-book-multiple', color: 'purple' },
      { id: 'total_members', title: 'สมาชิกร้าน', value: '0', icon: 'mdi-account-group', color: 'info' },
    ],
    quickMenus: [
      { text: 'จัดการสินค้า', icon: 'mdi-package-variant-closed', color: 'teal', link: '/admin/products' },
      { text: 'จัดการออเดอร์', icon: 'mdi-clipboard-list', color: 'orange', link: '/admin/orders' },
      { text: 'รายงานสรุป', icon: 'mdi-chart-bar', color: 'blue', link: '/admin/reports' },
      { text: 'แชทลูกค้า', icon: 'mdi-chat-processing', color: 'grey darken-1', link: '/admin/chat' },
    ],
  }),

  async mounted() {
    await this.fetchDashboardStats()
  },

  methods: {
    // ฟังก์ชันช่วยนำทางเพื่อความแม่นยำ
    navigateTo(path) {
      this.$router.push(path)
    },

    async fetchDashboardStats() {
      this.loading = true
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const isoToday = today.toISOString()

        // 1) ดึง Order วันนี้
        const { data: ordersToday, error: ordersErr } = await this.$supabase
          .from('orders')
          .select('total_price, status')
          .gte('created_at', isoToday)

        // 2) จำนวนมังงะ (Products)
        const { count: mangaCount } = await this.$supabase
          .from('products')
          .select('id', { count: 'exact', head: true })

        // 3) จำนวนสมาชิก (Profiles)
        const { count: memberCount } = await this.$supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })

        // คำนวณยอดขาย
        const todaySales = (ordersToday || []).reduce((sum, o) => sum + Number(o.total_price || 0), 0)
        const newOrders = (ordersToday || []).filter((o) => o.status === 'pending').length

        // อัปเดต UI
        this.stats[0].value = `${todaySales.toLocaleString()} ฿`
        this.stats[1].value = `${newOrders}`
        this.stats[2].value = `${mangaCount || 0}`
        this.stats[3].value = `${memberCount || 0}`
      } catch (e) {
        console.warn('Stats load warning:', e.message)
      } finally {
        this.loading = false
      }
    },

    async handleLogout() {
      if (!confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) return
      try {
        await this.$supabase.auth.signOut()
        // 🚩 บังคับล้างสถานะและกลับไปหน้าล็อกอิน
        window.location.assign('/login')
      } catch (e) {
        alert('ออกจากระบบไม่สำเร็จ')
      }
    },
  },
}
</script>

<style scoped>
.bg-admin-main { background-color: #0d0d0d; min-height: 100vh; }
.card-dark { background-color: #1a1a1a !important; border: 1px solid #333 !important; }
.uppercase { text-transform: uppercase; }
.transition-swing { transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
</style>