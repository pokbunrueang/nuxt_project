<template>
  <v-container fluid class="bg-main min-h-screen py-10">
    <v-container>
      <h1 class="text-h4 font-weight-black mb-8 white--text d-flex align-center">
        <v-icon x-large color="primary" class="mr-3">mdi-account-circle</v-icon>
        บัญชีของฉัน
      </h1>

      <!-- Loading -->
      <v-row v-if="loading" justify="center" class="py-16">
        <v-progress-circular indeterminate size="50"></v-progress-circular>
      </v-row>

      <template v-else>
        <!-- User Card -->
        <v-card class="pa-6 card-dark mb-6" dark rounded="xl">
          <div class="d-flex align-center justify-space-between flex-wrap">
            <div>
              <div class="text-h6 font-weight-bold">ข้อมูลผู้ใช้</div>
              <div class="grey--text text--lighten-1 mt-2">
                Email: <span class="white--text">{{ user.email }}</span>
              </div>
            </div>

            <v-btn color="red lighten-1" rounded depressed class="mt-4 mt-md-0" @click="logout">
              <v-icon left>mdi-logout</v-icon>
              ออกจากระบบ
            </v-btn>
          </div>
        </v-card>

        <!-- Orders -->
        <h2 class="text-h5 font-weight-bold mb-4 white--text d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-receipt-text</v-icon>
          ประวัติคำสั่งซื้อ
        </h2>

        <v-row v-if="orders.length === 0" class="py-10">
          <v-col cols="12" class="text-center">
            <v-icon size="70" color="grey darken-2">mdi-cart-off</v-icon>
            <div class="text-h6 white--text mt-3">คุณยังไม่มีคำสั่งซื้อ</div>
            <div class="grey--text mt-1">ไปเลือกมังงะก่อนเลย!</div>
            <v-btn color="primary" class="mt-6" rounded depressed to="/">
              ไปหน้าหลัก
            </v-btn>
          </v-col>
        </v-row>

        <v-card
          v-for="order in orders"
          :key="order.id"
          class="mb-6 pa-5 card-dark"
          dark
          rounded="xl"
        >
          <div class="d-flex justify-space-between flex-wrap">
            <div>
              <div class="text-h6 font-weight-bold">
                ออเดอร์ #{{ order.id }}
              </div>
              <div class="grey--text text--lighten-1">
                สถานะ: <span class="primary--text">{{ order.status }}</span>
              </div>
              <div class="grey--text text--lighten-1">
                วันที่: {{ formatDate(order.created_at) }}
              </div>
            </div>

            <div class="text-right mt-4 mt-md-0">
              <div class="grey--text text--lighten-1">ราคารวม</div>
              <div class="text-h5 primary--text font-weight-black">
                {{ order.total_price }} ฿
              </div>
            </div>
          </div>

          <v-divider class="my-4 grey darken-2"></v-divider>

          <!-- Items -->
          <div v-if="order.items && order.items.length > 0">
            <div class="text-subtitle-1 font-weight-bold mb-3">
              รายการสินค้า
            </div>

            <v-row>
              <v-col
                v-for="(it, idx) in order.items"
                :key="idx"
                cols="12"
                md="6"
              >
                <v-card class="pa-4 card-dark" dark rounded="xl">
                  <div class="d-flex">
                    <v-img
                      :src="getImage(it.product_image)"
                      width="80"
                      height="110"
                      class="mr-4 grey darken-4"
                      contain
                      rounded="lg"
                    />

                    <div class="flex-grow-1">
                      <div class="font-weight-bold">
                        {{ it.product_name }}
                      </div>
                      <div class="grey--text text--lighten-1">
                        ราคา: {{ it.product_price }} ฿
                      </div>
                      <div class="grey--text text--lighten-1">
                        จำนวน: {{ it.quantity }} เล่ม
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <div v-else class="grey--text text--lighten-1">
            ไม่มีรายการสินค้าในออเดอร์นี้
          </div>
        </v-card>
      </template>
    </v-container>
  </v-container>
</template>

<script>
export default {
  name: 'InspirePage',
  data() {
    return {
      loading: true,
      user: null,
      orders: []
    }
  },

  async mounted() {
    await this.loadUserAndOrders()
  },

  methods: {
    async loadUserAndOrders() {
      try {
        this.loading = true

        // 1) เช็ค user login
        const { data: userData, error: userErr } = await this.$supabase.auth.getUser()
        if (userErr) throw userErr

        const user = userData.user
        if (!user) {
          this.$router.push('/login')
          return
        }

        this.user = user

        // 2) โหลด orders ของ user
        const { data: orders, error: orderErr } = await this.$supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('id', { ascending: false })

        if (orderErr) throw orderErr

        // 3) โหลด order_items ของแต่ละ order
        const orderIds = orders.map(o => o.id)

        let itemsMap = {}

        if (orderIds.length > 0) {
          const { data: items, error: itemsErr } = await this.$supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds)
            .order('id', { ascending: true })

          if (itemsErr) throw itemsErr

          itemsMap = items.reduce((acc, it) => {
            if (!acc[it.order_id]) acc[it.order_id] = []
            acc[it.order_id].push(it)
            return acc
          }, {})
        }

        // 4) รวม items เข้าไปใน orders
        this.orders = orders.map(o => ({
          ...o,
          items: itemsMap[o.id] || []
        }))
      } catch (e) {
        console.error(e)
        alert(e.message || 'โหลดข้อมูลไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    getImage(fileName) {
      if (!fileName) return '/no-image.png'
      return `${this.$config.SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      return d.toLocaleString('th-TH')
    },

    async logout() {
      if (!confirm('คุณต้องการออกจากระบบใช่ไหม?')) return

      const { error } = await this.$supabase.auth.signOut()
      if (error) {
        alert(error.message)
        return
      }

      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.bg-main {
  background-color: #121212;
  min-height: 100vh;
}
.card-dark {
  background-color: #1E1E1E !important;
  border: 1px solid #333 !important;
}
.min-h-screen {
  min-height: 100vh;
}
</style>
