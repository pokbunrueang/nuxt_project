<template>
  <v-container fluid class="bg-main pa-6">
    <v-row class="mb-6 align-center">
      <v-col cols="12" md="6" class="d-flex align-center">
        <v-btn icon to="/admin/index_ad" class="mr-4 bg-dark-soft" color="primary" elevation="2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1 class="text-h4 font-weight-black white--text d-flex align-center">
            <v-icon color="primary" size="40" class="mr-3">mdi-clipboard-list</v-icon>
            Order <span class="primary--text ml-2">Management</span>
          </h1>
          <p class="grey--text mb-0">ติดตามและจัดการรายการสั่งซื้อทั้งหมด</p>
        </div>
      </v-col>
      <v-col cols="12" md="6" class="text-md-right">
        <v-btn color="primary" outlined rounded @click="fetchOrders" :loading="loading" class="px-6">
          <v-icon left>mdi-refresh</v-icon> รีเฟรชข้อมูล
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12" sm="4">
        <v-card dark class="card-gradient-blue pa-5" rounded="xl" elevation="10">
          <div class="d-flex justify-space-between align-start">
            <div>
              <div class="text-subtitle-1 grey--text text--lighten-1">ออเดอร์ทั้งหมด</div>
              <div class="text-h3 font-weight-black mt-1">{{ orders.length }}</div>
            </div>
            <v-icon size="48" color="rgba(255,255,255,0.2)">mdi-cart-check</v-icon>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card dark class="card-gradient-orange pa-5" rounded="xl" elevation="10">
          <div class="d-flex justify-space-between align-start">
            <div>
              <div class="text-subtitle-1 grey--text text--lighten-1">รายได้รวมทั้งหมด</div>
              <div class="text-h3 font-weight-black mt-1">
                {{ totalRevenue.toLocaleString() }} <small>฿</small>
              </div>
            </div>
            <v-icon size="48" color="rgba(255,255,255,0.2)">mdi-cash-multiple</v-icon>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card dark class="card-gradient-green pa-5" rounded="xl" elevation="10">
          <div class="d-flex justify-space-between align-start">
            <div>
              <div class="text-subtitle-1 grey--text text--lighten-1">ออเดอร์ใหม่วันนี้</div>
              <div class="text-h3 font-weight-black mt-1">{{ todayOrders }}</div>
            </div>
            <v-icon size="48" color="rgba(255,255,255,0.2)">mdi-star-face</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card dark class="card-dark border-light shadow-lg" rounded="xl">
      <v-data-table
        :headers="headers"
        :items="orders"
        :loading="loading"
        class="elevation-0 bg-transparent custom-table"
      >
        <template v-slot:item.created_at="{ item }">
          <div class="d-flex flex-column">
            <span class="white--text font-weight-medium">{{ new Date(item.created_at).toLocaleDateString('th-TH') }}</span>
            <span class="text-caption grey--text">{{ new Date(item.created_at).toLocaleTimeString('th-TH') }}</span>
          </div>
        </template>

        <template v-slot:item.total_price="{ item }">
          <span class="text-h6 primary--text font-weight-black">
            {{ Number(item.total_price).toLocaleString() }} <small>฿</small>
          </span>
        </template>

        <template v-slot:item.tracking_number="{ item }">
          <v-chip v-if="item.tracking_number" small color="primary" outlined class="font-weight-bold">
            {{ item.tracking_number }}
          </v-chip>
          <span v-else class="grey--text text-caption italic">ยังไม่ได้จัดส่ง</span>
        </template>

        <template v-slot:item.status="{ item }">
          <v-select
            :items="statusOptions"
            v-model="item.status"
            dense
            outlined
            hide-details
            rounded
            class="status-select mt-1"
            style="max-width: 180px;"
            @change="updateOrderStatus(item)"
          >
            <template v-slot:selection="{ item: status }">
              <v-chip :color="getStatusColor(status)" small label class="font-weight-bold">
                {{ getStatusText(status) }}
              </v-chip>
            </template>
            <template v-slot:item="{ item: status }">
              <v-chip :color="getStatusColor(status)" x-small label class="font-weight-bold">
                {{ getStatusText(status) }}
              </v-chip>
            </template>
          </v-select>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn color="primary" rounded depressed class="text-none font-weight-bold px-4" @click="viewDetail(item)">
            <v-icon left size="18">mdi-magnify</v-icon> รายละเอียด
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="trackingDialog" max-width="450" rounded="xl" persistent>
      <v-card dark class="card-dark pa-6 border-light">
        <v-card-title class="text-h5 font-weight-black mb-4">
          <v-icon color="primary" class="mr-2">mdi-truck-delivery</v-icon>
          ข้อมูลการจัดส่ง
        </v-card-title>
        <v-card-text>
          <p class="grey--text">ระบุหมายเลขพัสดุสำหรับออเดอร์ของ <b>{{ selectedOrderForTracking?.user_email }}</b></p>
          <v-text-field
            v-model="tempTracking"
            label="Tracking Number"
            outlined
            rounded
            placeholder="เช่น TH123456789"
            hide-details
            color="primary"
            class="mt-4"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="pb-2">
          <v-spacer></v-spacer>
          <v-btn text rounded @click="cancelTracking">ยกเลิก</v-btn>
          <v-btn color="primary" rounded depressed class="px-8 font-weight-bold" @click="confirmShipping">
            ยืนยันและเริ่มส่ง
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="detailDialog" max-width="600" rounded="xl">
      <v-card dark class="card-dark pa-6 border-light">
        <v-card-title class="text-h5 font-weight-black mb-4 d-flex justify-space-between">
          <span>ออเดอร์ #{{ selectedOrder?.id.substring(0,8) }}</span>
          <v-chip :color="getStatusColor(selectedOrder?.status)" small>{{ getStatusText(selectedOrder?.status) }}</v-chip>
        </v-card-title>
        
        <v-card-text>
          <div class="mb-6">
            <div class="grey--text text-subtitle-2 mb-1">ข้อมูลลูกค้า</div>
            <div class="white--text font-weight-bold text-h6">{{ selectedOrder?.user_email }}</div>
            <div v-if="selectedOrder?.tracking_number" class="primary--text mt-1 d-flex align-center">
              <v-icon small color="primary" class="mr-1">mdi-truck-fast</v-icon> 
              <b>เลขพัสดุ: {{ selectedOrder.tracking_number }}</b>
            </div>
          </div>

          <v-divider class="mb-4"></v-divider>
          <div class="grey--text text-subtitle-2 mb-4">รายการสินค้า</div>
          <div v-for="item in orderItems" :key="item.id" class="d-flex justify-space-between align-center mb-4 pa-3 rounded-lg grey darken-4">
            <div>
              <div class="white--text font-weight-bold">{{ item.product_name }}</div>
              <div class="grey--text text-caption">ราคา: {{ Number(item.product_price).toLocaleString() }} ฿</div>
            </div>
            <div class="text-right">
              <div class="primary--text font-weight-black text-h6">{{ (item.product_price * item.quantity).toLocaleString() }} ฿</div>
              <div class="grey--text text-caption">จำนวน: {{ item.quantity }} เล่ม</div>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>
          
          <div class="mb-6">
            <div class="grey--text text-subtitle-2 mb-2">หลักฐานการโอนเงิน</div>
            <v-img
              v-if="selectedOrder?.slip_image"
              :src="getSlipUrl(selectedOrder.slip_image)"
              max-height="400"
              contain
              class="rounded-lg grey darken-4 cursor-pointer border-light"
              @click="openImage(selectedOrder.slip_image)"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            <v-card v-else outlined class="pa-4 text-center grey darken-4 border-light rounded-lg">
              <v-icon color="grey darken-2" size="40">mdi-image-off</v-icon>
              <div class="grey--text mt-2 text-caption">ยังไม่มีการอัปโหลดหลักฐาน</div>
            </v-card>
          </div>

          <div class="d-flex justify-space-between text-h5 font-weight-black pa-2">
            <span>ยอดรวมสุทธิ</span>
            <span class="primary--text">{{ Number(selectedOrder?.total_price).toLocaleString() }} ฿</span>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text rounded @click="detailDialog = false">ปิดหน้าต่าง</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" timeout="2500" color="success" rounded="xl" bottom center shadow-lg>
      <v-icon left>mdi-check-circle</v-icon> {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      detailDialog: false,
      trackingDialog: false,
      snackbar: false,
      snackbarText: '',
      tempTracking: '',
      orders: [],
      selectedOrder: null,
      selectedOrderForTracking: null,
      orderItems: [],
      // 🚩 เพิ่ม 'shipped' (จัดส่งสำเร็จ) เข้าไปในตัวเลือก
      statusOptions: ['pending', 'shipping', 'shipped', 'cancelled'],
      headers: [
        { text: 'วันที่สั่งซื้อ', value: 'created_at', align: 'start' },
        { text: 'ลูกค้า', value: 'user_email' },
        { text: 'ยอดรวม', value: 'total_price' },
        { text: 'เลขพัสดุ', value: 'tracking_number' },
        { text: 'สถานะออเดอร์', value: 'status', width: '200px' },
        { text: 'การจัดการ', value: 'actions', sortable: false, align: 'end' },
      ],
    }
  },
  computed: {
    totalRevenue() {
      return this.orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0)
    },
    todayOrders() {
      const today = new Date().toDateString()
      return this.orders.filter(order => new Date(order.created_at).toDateString() === today).length
    }
  },
  async mounted() {
    await this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      this.loading = true
      try {
        const { data, error } = await this.$supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        this.orders = data || []
      } catch (e) {
        alert('โหลดข้อมูลออเดอร์ไม่สำเร็จ: ' + e.message)
      } finally {
        this.loading = false
      }
    },

    async updateOrderStatus(order) {
      if (order.status === 'shipping') {
        this.selectedOrderForTracking = order
        this.tempTracking = order.tracking_number || ''
        this.trackingDialog = true
        return
      }
      await this.saveStatusToDB(order, order.tracking_number)
    },

    async confirmShipping() {
      if (!this.tempTracking) {
        alert('กรุณากรอกเลขพัสดุก่อนครับ')
        return
      }
      await this.saveStatusToDB(this.selectedOrderForTracking, this.tempTracking)
      this.trackingDialog = false
      this.tempTracking = ''
    },

    async saveStatusToDB(order, tracking) {
      try {
        const updateData = { status: order.status }
        if (tracking) updateData.tracking_number = tracking

        const { error } = await this.$supabase
          .from('orders')
          .update(updateData)
          .eq('id', order.id)

        if (error) throw error
        
        this.snackbarText = `อัปเดตออเดอร์เรียบร้อยแล้ว`
        this.snackbar = true
        await this.fetchOrders()
      } catch (e) {
        alert('อัปเดตไม่สำเร็จ: ' + e.message)
        await this.fetchOrders()
      }
    },

    cancelTracking() {
      this.trackingDialog = false
      this.fetchOrders()
    },

    async viewDetail(order) {
      this.selectedOrder = order
      this.detailDialog = true
      this.orderItems = []
      try {
        const { data, error } = await this.$supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)
        if (error) throw error
        this.orderItems = data || []
      } catch (e) {
        alert('โหลดรายละเอียดสินค้าไม่สำเร็จ')
      }
    },

    getSlipUrl(path) {
      return `${this.$config.SUPABASE_URL}/storage/v1/object/public/payment-slips/${path}`
    },
    openImage(path) {
      window.open(this.getSlipUrl(path), '_blank');
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
.card-gradient-blue { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%) !important; }
.card-gradient-orange { background: linear-gradient(135deg, #7c2d12 0%, #f97316 100%) !important; }
.card-gradient-green { background: linear-gradient(135deg, #064e3b 0%, #10b981 100%) !important; }
.custom-table >>> th { background-color: #1a1a1a !important; color: #9e9e9e !important; font-weight: bold !important; text-transform: uppercase; letter-spacing: 1px; }
.custom-table >>> tr:hover { background-color: #1e1e1e !important; }
.status-select >>> .v-input__control { min-height: 32px !important; }
.status-select >>> .v-input__slot { background: rgba(255,255,255,0.05) !important; }
.cursor-pointer { cursor: pointer; }
.shadow-lg { box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; }
</style>