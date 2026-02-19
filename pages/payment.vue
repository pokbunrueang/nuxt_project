<template>
  <v-container fluid class="bg-main pa-6">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card dark class="card-dark pa-8" rounded="xl" elevation="12">
          <h1 class="text-h4 font-weight-black primary--text mb-2 text-center">
            <v-icon color="primary" size="40" class="mr-2">mdi-cash-check</v-icon>
            แจ้งชำระเงิน
          </h1>
          <p class="grey--text text-center mb-8">กรุณากรอกข้อมูลตามหลักฐานการโอนเงินจริง</p>

          <v-form ref="paymentForm" @submit.prevent="submitPayment">
            <v-select
              v-model="form.order_id"
              :items="pendingOrders"
              item-text="display_label"
              item-value="id"
              label="เลือกหมายเลขคำสั่งซื้อ"
              outlined
              rounded
              required
              prepend-inner-icon="mdi-file-document-outline"
            ></v-select>

            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.pay_date"
                  label="วันที่โอน"
                  type="date"
                  outlined
                  rounded
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.pay_time"
                  label="เวลาที่โอน"
                  type="time"
                  outlined
                  rounded
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-file-input
              v-model="form.slip_file"
              label="แนบไฟล์สลิปการโอนเงิน"
              outlined
              rounded
              accept="image/*"
              required
              prepend-inner-icon="mdi-camera"
              @change="previewImage"
            ></v-file-input>

            <v-img
              v-if="imagePreview"
              :src="imagePreview"
              max-height="300"
              contain
              class="rounded-lg mb-6 grey darken-4"
            ></v-img>

            <v-btn
              block
              x-large
              color="primary"
              rounded
              class="font-weight-black mt-4"
              :loading="loading"
              type="submit"
            >
              ส่งหลักฐานการโอนเงิน
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="success" color="success" rounded="xl" bottom center>
      <v-icon left>mdi-check-circle</v-icon> แจ้งชำระเงินเรียบร้อยแล้ว แอดมินจะรีบตรวจสอบครับ
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      success: false,
      imagePreview: null,
      pendingOrders: [],
      form: {
        order_id: null,
        pay_date: new Date().toISOString().substr(0, 10),
        pay_time: '',
        slip_file: null
      }
    }
  },
  async mounted() {
    this.fetchPendingOrders()
  },
  methods: {
    async fetchPendingOrders() {
      const user = this.$supabase.auth.user()
      if (!user) return this.$router.push('/login')

      // ดึงออเดอร์เฉพาะที่สถานะเป็น 'pending'
      const { data } = await this.$supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
      
      this.pendingOrders = (data || []).map(o => ({
        id: o.id,
        display_label: `ออเดอร์ #${o.id.substring(0,8).toUpperCase()} - ยอด ${o.total_price} ฿`
      }))
    },

    previewImage() {
      if (this.form.slip_file) {
        this.imagePreview = URL.createObjectURL(this.form.slip_file)
      } else {
        this.imagePreview = null
      }
    },

    async submitPayment() {
      if (!this.$refs.paymentForm.validate() || !this.form.slip_file) return

      this.loading = true
      try {
        // 1. อัปโหลดรูปไปที่ storage
        const file = this.form.slip_file
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await this.$supabase.storage
          .from('payment-slips')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // 2. อัปเดตชื่อรูปสลิปลงในตาราง orders
        const { error: updateError } = await this.$supabase
          .from('orders')
          .update({ 
            slip_image: filePath,
            // นายสามารถเพิ่มคอลัมน์ pay_date_time ใน DB เพิ่มเติมได้ถ้าต้องการความละเอียด
          })
          .eq('id', this.form.order_id)

        if (updateError) throw updateError

        this.success = true
        setTimeout(() => this.$router.push('/orders'), 2000)
      } catch (e) {
        alert('เกิดข้อผิดพลาด: ' + e.message)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>