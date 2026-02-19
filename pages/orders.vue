<template>
  <v-container fluid class="bg-main pa-6">
    <div class="d-flex align-center mb-8">
      <v-btn icon to="/" class="mr-2" color="primary">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h1 class="text-h4 font-weight-black white--text">
        ประวัติ <span class="primary--text">การสั่งซื้อ</span>
      </h1>
    </div>

    <v-card v-if="!loading && orders.length === 0" dark class="card-dark pa-12 text-center" rounded="xl">
      <v-icon size="80" color="grey darken-3">mdi-clipboard-text-off</v-icon>
      <div class="text-h5 grey--text mt-4">คุณยังไม่มีรายการสั่งซื้อใดๆ</div>
      <v-btn color="primary" rounded large class="mt-6 font-weight-bold" to="/">
        ไปเลือกมังงะเล่มแรกกัน!
      </v-btn>
    </v-card>

    <v-row v-else>
      <v-col cols="12" md="8" class="mx-auto">
        <v-card 
          v-for="order in orders" 
          :key="order.id" 
          dark 
          class="card-dark mb-6 border-light shadow-lg" 
          rounded="xl"
        >
          <v-card-title class="d-flex justify-space-between align-center px-6 pt-6">
            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-black primary--text">
                ออเดอร์ #{{ order.id.substring(0,8).toUpperCase() }}
              </span>
              <span class="text-caption grey--text">
                สั่งซื้อเมื่อ: {{ new Date(order.created_at).toLocaleString('th-TH') }}
              </span>
            </div>
            <v-chip :color="getStatusColor(order.status)" class="font-weight-bold" label>
              {{ getStatusText(order.status) }}
            </v-chip>
          </v-card-title>

          <v-card-text class="px-6 pb-6 mt-4">
            <v-alert
              v-if="order.tracking_number"
              outlined
              color="cyan"
              icon="mdi-truck-delivery"
              class="rounded-xl mb-6"
            >
              <div class="white--text font-weight-bold">หมายเลขพัสดุ: {{ order.tracking_number }}</div>
              <div class="text-caption cyan--text text--lighten-2">คุณสามารถใช้เลขนี้เพื่อติดตามสินค้าผ่านขนส่งได้ทันที</div>
            </v-alert>

            <v-divider class="mb-4"></v-divider>
            
            <div class="d-flex justify-space-between align-end">
              <div>
                <div class="grey--text text-subtitle-2 mb-1">ยอดชำระสุทธิ</div>
                <div class="text-h4 font-weight-black white--text">
                  {{ Number(order.total_price).toLocaleString() }} <small>฿</small>
                </div>
              </div>
              <v-btn color="primary" text rounded @click="viewItems(order)">
                <v-icon left size="18">mdi-format-list-bulleted</v-icon> ดูรายการสินค้า
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-overlay :value="loading" color="rgba(0,0,0,0.8)">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-overlay>

    <v-dialog v-model="itemDialog" max-width="500" rounded="xl">
      <v-card dark class="card-dark pa-6 border-light">
        <v-card-title class="text-h5 font-weight-black mb-4">รายการสินค้าในออเดอร์</v-card-title>
        <v-card-text>
          <div v-for="item in currentItems" :key="item.id" class="d-flex justify-space-between align-center mb-4 pa-3 rounded-lg grey darken-4">
            <div>
              <div class="white--text font-weight-bold">{{ item.product_name }}</div>
              <div class="grey--text text-caption">จำนวน: {{ item.quantity }} เล่ม</div>
            </div>
            <div class="primary--text font-weight-black">
              {{ (item.product_price * item.quantity).toLocaleString() }} ฿
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text rounded @click="itemDialog = false">ปิดหน้าต่าง</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      orders: [],
      itemDialog: false,
      currentItems: []
    }
  },
  async mounted() {
    await this.fetchUserOrders()
  },
  methods: {
    async fetchUserOrders() {
      const user = this.$supabase.auth.user()
      if (!user) {
        this.$router.push('/login')
        return
      }

      this.loading = true
      try {
        const { data, error } = await this.$supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id) // 🚩 ดึงเฉพาะของคนที่มี login อยู่เท่านั้น
          .order('created_at', { ascending: false })
        
        if (error) throw error
        this.orders = data || []
      } catch (e) {
        alert('ไม่สามารถดึงข้อมูลได้: ' + e.message)
      } finally {
        this.loading = false
      }
    },

    async viewItems(order) {
      this.itemDialog = true
      try {
        const { data, error } = await this.$supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)
        if (error) throw error
        this.currentItems = data || []
      } catch (e) {
        alert('โหลดรายการสินค้าไม่สำเร็จ')
      }
    },

    getStatusText(status) {
      const texts = { pending: 'รอตรวจสอบ', shipping: 'กำลังจัดส่ง', cancelled: 'ยกเลิก' }
      return texts[status] || 'จัดส่งแล้ว'
    },

    getStatusColor(status) {
      const colors = { pending: 'warning', shipping: 'cyan', cancelled: 'error' }
      return colors[status] || 'success'
    }
  }
}
</script>

<style scoped>
.bg-main { background-color: #080808; min-height: 100vh; }
.card-dark { background-color: #121212 !important; border: 1px solid #222 !important; }
.border-light { border: 1px solid #333 !important; }
</style>