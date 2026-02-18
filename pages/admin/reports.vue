<template>
  <v-container fluid class="bg-admin-main pa-6">
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex align-center">
        <v-btn icon to="/admin" class="mr-2" color="white"><v-icon>mdi-arrow-left</v-icon></v-btn>
        <h1 class="text-h4 font-weight-black white--text uppercase">Sales Reports</h1>
      </v-col>
    </v-row>

    <v-row v-if="!loading">
      <v-col cols="12" md="6">
        <v-card rounded="xl" class="card-dark pa-6" dark>
          <v-card-title class="font-weight-bold text-h5 mb-4">สรุปสถานะออเดอร์</v-card-title>
          <v-list bg-color="transparent">
            <v-list-item v-for="(val, status) in reportStatus" :key="status">
              <v-list-item-content>
                <v-list-item-title class="text-subtitle-1">{{ status }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <span class="font-weight-bold primary--text text-h6">{{ val }} รายการ</span>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" class="card-dark pa-6 text-center fill-height d-flex flex-column justify-center" dark>
          <div class="text-h6 grey--text mb-2 uppercase">Total Revenue</div>
          <div class="display-2 font-weight-black success--text">{{ totalRevenue.toLocaleString() }} ฿</div>
          <v-icon size="100" color="grey darken-3" class="mt-4">mdi-finance</v-icon>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else justify="center" class="mt-10">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: 'auth-admin', // ตรวจสอบสิทธิ์แอดมิน
  data: () => ({
    loading: true,
    orders: [],
    reportStatus: {},
    totalRevenue: 0
  }),
  async mounted() {
    await this.fetchReportData();
  },
  methods: {
    async fetchReportData() {
      try {
        // ดึงข้อมูลจาก API ตัวเดียวกับหน้าจัดการออเดอร์
        const data = await this.$axios.$get('orders_select.php');
        this.orders = data;
        
        // คำนวณสรุปสถานะ
        const summary = {};
        let revenue = 0;
        data.forEach(order => {
          summary[order.order_status] = (summary[order.order_status] || 0) + 1;
          if(order.order_status === 'จัดส่งแล้ว') {
            revenue += parseFloat(order.total_price);
          }
        });
        this.reportStatus = summary;
        this.totalRevenue = revenue;
      } catch (e) {
        console.error('Error loading report:', e);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>