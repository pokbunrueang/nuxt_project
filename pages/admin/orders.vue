<template>
  <v-container fluid class="bg-admin-main pa-6">
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex align-center">
        <v-btn icon to="/admin" class="mr-2" color="white">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="text-h4 font-weight-black white--text uppercase">
          จัดการออเดอร์
        </h1>
      </v-col>
    </v-row>

    <v-card rounded="xl" class="card-dark" dark>
      <v-data-table
        :headers="headers"
        :items="orders"
        :loading="loading"
        class="card-dark"
      >
        <!-- สถานะ -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="statusColor(item.status)"
            small
            dark
            class="font-weight-bold"
          >
            {{ statusLabel(item.status) }}
          </v-chip>
        </template>

        <!-- วันที่ -->
        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <!-- ลูกค้า -->
        <template v-slot:item.customer="{ item }">
          <span v-if="item.profiles">
            {{ item.profiles.full_name || item.profiles.email || '-' }}
          </span>
          <span v-else>-</span>
        </template>

        <!-- ปุ่มจัดการ -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            v-if="item.status === 'pending'"
            color="success"
            small
            rounded
            depressed
            class="mr-2"
            @click="updateStatus(item, 'shipped')"
          >
            <v-icon left size="16">mdi-truck-delivery</v-icon> ยืนยันการส่ง
          </v-btn>

          <v-btn icon color="primary" @click="viewDetail(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog ดูรายละเอียด -->
    <v-dialog v-model="detailDialog" max-width="700">
      <v-card class="card-dark" dark rounded="xl">
        <v-card-title class="font-weight-bold">
          รายละเอียดออเดอร์ #{{ selectedOrder?.id }}
          <v-spacer />
          <v-btn icon @click="detailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider class="grey darken-2" />

        <v-card-text>
          <div class="mb-4">
            <div class="grey--text text--lighten-1">ลูกค้า:</div>
            <div class="text-h6">
              {{
                selectedOrder?.profiles?.full_name ||
                selectedOrder?.profiles?.email ||
                '-'
              }}
            </div>
          </div>

          <div class="mb-4">
            <div class="grey--text text--lighten-1">ยอดรวม:</div>
            <div class="text-h6 primary--text font-weight-black">
              {{ Number(selectedOrder?.total_price || 0).toLocaleString() }} ฿
            </div>
          </div>

          <div class="mb-4">
            <div class="grey--text text--lighten-1">สถานะ:</div>
            <v-chip :color="statusColor(selectedOrder?.status)" small dark>
              {{ statusLabel(selectedOrder?.status) }}
            </v-chip>
          </div>

          <v-divider class="grey darken-2 my-4" />

          <h3 class="text-h6 font-weight-bold mb-3">รายการสินค้า</h3>

          <v-simple-table dark>
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>ราคา</th>
                <th>จำนวน</th>
                <th>รวม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, idx) in orderItems" :key="idx">
                <td>{{ it.product_name }}</td>
                <td>{{ Number(it.product_price).toLocaleString() }}</td>
                <td>{{ it.quantity }}</td>
                <td>
                  {{
                    (Number(it.product_price) * Number(it.quantity)).toLocaleString()
                  }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  middleware: 'auth-admin',

  data: () => ({
    loading: false,
    orders: [],

    detailDialog: false,
    selectedOrder: null,
    orderItems: [],

    headers: [
      { text: 'รหัสออเดอร์', value: 'id' },
      { text: 'ชื่อลูกค้า', value: 'customer' },
      { text: 'ยอดรวม (฿)', value: 'total_price' },
      { text: 'วันที่สั่งซื้อ', value: 'created_at' },
      { text: 'สถานะ', value: 'status' },
      { text: 'จัดการ', value: 'actions', sortable: false },
    ],
  }),

  async mounted() {
    await this.fetchOrders()
  },

  methods: {
    async fetchOrders() {
      this.loading = true
      try {
        // ดึง orders + profiles
        // profiles join ได้เพราะ orders.user_id -> profiles.id
        const { data, error } = await this.$supabase
          .from('orders')
          .select(
            `
            id,
            user_id,
            total_price,
            status,
            created_at,
            profiles:profiles (
              id,
              full_name,
              email
            )
          `
          )
          .order('created_at', { ascending: false })

        if (error) throw error
        this.orders = data || []
      } catch (e) {
        console.error('โหลดออเดอร์ไม่สำเร็จ:', e)
      } finally {
        this.loading = false
      }
    },

    statusLabel(status) {
      if (status === 'pending') return 'รอดำเนินการ'
      if (status === 'shipped') return 'จัดส่งแล้ว'
      if (status === 'cancelled') return 'ยกเลิก'
      return status || '-'
    },

    statusColor(status) {
      if (status === 'pending') return 'warning'
      if (status === 'shipped') return 'success'
      if (status === 'cancelled') return 'error'
      return 'grey'
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      return d.toLocaleString('th-TH')
    },

    async updateStatus(order, newStatus) {
      if (!confirm(`ยืนยันเปลี่ยนสถานะออเดอร์ #${order.id} ?`)) return

      try {
        const { error } = await this.$supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', order.id)

        if (error) throw error

        alert('อัปเดตสถานะสำเร็จ!')
        await this.fetchOrders()
      } catch (e) {
        console.error(e)
        alert(e.message || 'อัปเดตไม่สำเร็จ')
      }
    },

    async viewDetail(order) {
      this.selectedOrder = order
      this.detailDialog = true
      this.orderItems = []

      try {
        const { data, error } = await this.$supabase
          .from('order_items')
          .select('product_name, product_price, quantity')
          .eq('order_id', order.id)
          .order('id', { ascending: true })

        if (error) throw error
        this.orderItems = data || []
      } catch (e) {
        console.error(e)
        alert('โหลดรายละเอียดออเดอร์ไม่สำเร็จ')
      }
    },
  },
}
</script>

<style scoped>
.bg-admin-main {
  background-color: #0d0d0d;
  min-height: 100vh;
}
.card-dark {
  background-color: #1a1a1a !important;
  border: 1px solid #333 !important;
}
.uppercase {
  text-transform: uppercase;
}
</style>
