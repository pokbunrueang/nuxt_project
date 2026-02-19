<template>
  <v-container fluid class="bg-main pa-6">
    <div class="d-flex align-center mb-8">
      <v-btn icon to="/admin/index_ad" class="mr-4 bg-dark-soft" color="white">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h1 class="text-h4 font-weight-black white--text">Sales <span class="primary--text">Reports</span></h1>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-card dark class="card-dark pa-10 border-light h-100 d-flex flex-column align-center justify-center text-center" rounded="xl">
          <div class="grey--text text-h6 mb-2">Total Revenue</div>
          <div class="text-h2 font-weight-black success--text mb-6">
            {{ totalRevenue.toLocaleString() }} <span class="text-h3">฿</span>
          </div>
          <v-icon size="100" color="grey darken-3">mdi-chart-line-variant</v-icon>
          <v-btn color="primary" outlined rounded @click="fetchData" class="mt-8">
            <v-icon left>mdi-refresh</v-icon> อัปเดตข้อมูล
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card dark class="card-dark pa-6 border-light h-100" rounded="xl">
          <div class="text-h6 font-weight-bold mb-6 d-flex align-center">
             <v-icon color="primary" class="mr-2">mdi-calendar-analytics</v-icon>
             วิเคราะห์รายได้ (เริ่มนับใหม่ทุกวันที่ 1)
          </div>
          
          <v-row>
            <v-col cols="12">
              <div class="report-item pa-4 rounded-lg grey darken-4 mb-4 border-left-success">
                <div class="grey--text subtitle-2">รายได้วันนี้</div>
                <div class="text-h4 font-weight-black white--text">{{ dailyRevenue.toLocaleString() }} ฿</div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="report-item pa-4 rounded-lg grey darken-4 mb-4 border-left-info">
                <div class="grey--text subtitle-2">รายได้สัปดาห์นี้</div>
                <div class="text-h4 font-weight-black white--text">{{ weeklyRevenue.toLocaleString() }} ฿</div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="report-item pa-4 rounded-lg grey darken-4 border-left-primary">
                <div class="grey--text subtitle-2">รายได้เดือนนี้ (ตั้งแต่ต้นเดือน)</div>
                <div class="text-h4 font-weight-black white--text">{{ monthlyRevenue.toLocaleString() }} ฿</div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card dark class="card-dark pa-6 border-light" rounded="xl">
          <div class="text-h6 font-weight-bold mb-6 d-flex align-center">
             <v-icon color="primary" class="mr-2">mdi-chart-pie</v-icon>
             สถานะออเดอร์ทั้งหมด
          </div>
          <v-row>
            <v-col v-for="(count, status) in statusSummary" :key="status" cols="6" sm="3">
              <div class="text-center pa-4 rounded-lg bg-dark-soft">
                <v-chip :color="getStatusColor(status)" small label class="mb-2 font-weight-bold">
                  {{ getStatusText(status) }}
                </v-chip>
                <div class="text-h4 font-weight-black white--text">{{ count }}</div>
                <div class="caption grey--text">รายการ</div>
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
  data() {
    return {
      loading: false,
      orders: [],
      statusSummary: { pending: 0, shipping: 0, shipped: 0, cancelled: 0 }
    }
  },
  computed: {
    // 🚩 กรองเฉพาะออเดอร์ที่ไม่ยกเลิกมาคำนวณเงิน
    validOrders() {
      return this.orders.filter(o => o.status !== 'cancelled')
    },
    totalRevenue() {
      return this.validOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
    },
    // 🚩 รายได้รายวัน
    dailyRevenue() {
      const today = new Date().toDateString()
      return this.validOrders
        .filter(o => new Date(o.created_at).toDateString() === today)
        .reduce((sum, o) => sum + Number(o.total_price || 0), 0)
    },
    // 🚩 รายได้รายสัปดาห์ (เริ่มนับใหม่ถ้าข้ามเดือน)
    weeklyRevenue() {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const diffToMonday = now.getDay() === 0 ? 6 : now.getDay() - 1
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - diffToMonday)
      startOfWeek.setHours(0, 0, 0, 0)
      
      // ถ้าต้นสัปดาห์อยู่อีกเดือน ให้ใช้แค่วันที่ 1 ของเดือนนี้แทน
      const finalStart = startOfWeek < startOfMonth ? startOfMonth : startOfWeek
      
      return this.validOrders
        .filter(o => new Date(o.created_at) >= finalStart)
        .reduce((sum, o) => sum + Number(o.total_price || 0), 0)
    },
    // 🚩 รายได้รายเดือน (นับตั้งแต่วันที่ 1)
    monthlyRevenue() {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return this.validOrders
        .filter(o => new Date(o.created_at) >= startOfMonth)
        .reduce((sum, o) => sum + Number(o.total_price || 0), 0)
    }
  },
  async mounted() {
    await this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const { data, error } = await this.$supabase.from('orders').select('*')
        if (error) throw error
        this.orders = data || []
        
        const summary = { pending: 0, shipping: 0, shipped: 0, cancelled: 0 }
        this.orders.forEach(o => { if (summary[o.status] !== undefined) summary[o.status]++ })
        this.statusSummary = summary
      } catch (e) {
        alert('โหลดข้อมูลล้มเหลว: ' + e.message)
      } finally {
        this.loading = false
      }
    },
    getStatusText(status) {
      const texts = { pending: 'รอตรวจสอบ', shipping: 'กำลังจัดส่ง', shipped: 'จัดส่งสำเร็จ', cancelled: 'ยกเลิก' }
      return texts[status] || status
    },
    getStatusColor(status) {
      const colors = { pending: 'warning', shipping: 'cyan', shipped: 'success', cancelled: 'error' }
      return colors[status] || 'grey'
    }
  }
}
</script>

<style scoped>
.bg-main { background-color: #080808; min-height: 100vh; }
.card-dark { background-color: #121212 !important; }
.bg-dark-soft { background-color: #1e1e1e !important; }
.border-light { border: 1px solid #222 !important; }
.border-left-success { border-left: 4px solid #4caf50; }
.border-left-info { border-left: 4px solid #00bcd4; }
.border-left-primary { border-left: 4px solid #f15a24; }
.h-100 { height: 100%; }
.report-item { transition: 0.3s; }
.report-item:hover { transform: translateX(10px); background-color: #1a1a1a !important; }
</style>