<template>
  <v-container fluid class="bg-main pa-6">
    <h1 class="text-h4 font-weight-black white--text mb-6">
      <v-icon color="primary" size="40" class="mr-2">mdi-cart-outline</v-icon>
      ตะกร้าสินค้าของคุณ
    </h1>

    <v-row>
      <v-col cols="12" md="8">
        <v-card v-for="(item, index) in cart" :key="index" rounded="xl" class="card-dark pa-4 mb-4" dark>
          <v-row align="center">
            <v-col cols="3" sm="2">
              <v-img :src="getImageUrl(item.image)" rounded="lg" height="100" contain class="grey darken-4"></v-img>
            </v-col>
            <v-col cols="5" sm="6">
              <div class="text-h6 font-weight-bold">{{ item.name }}</div>
              <div class="primary--text font-weight-black">{{ Number(item.price || 0).toLocaleString() }} ฿</div>
            </v-col>
            <v-col cols="4" sm="4" class="text-right d-flex align-center justify-end">
              <v-text-field
                v-model.number="item.quantity"
                type="number"
                label="จำนวน"
                outlined
                dense
                hide-details
                style="max-width: 80px"
                class="mr-4"
                min="1"
                @input="saveCart"
              ></v-text-field>
              <v-btn icon color="error" @click="removeFromCart(index)">
                <v-icon>mdi-delete-outline</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <v-card v-if="cart.length > 0" dark class="card-dark pa-6 mt-4" rounded="xl" outlined>
          <div class="text-h6 font-weight-bold primary--text mb-4">
            <v-icon color="primary" class="mr-2">mdi-credit-card-outline</v-icon>
            ช่องทางการชำระเงิน
          </div>

          <v-radio-group v-model="paymentMethod" column>
            <v-radio color="primary" value="bank_transfer">
              <template v-slot:label>
                <div class="white--text font-weight-bold">โอนเงินผ่านบัญชีธนาคาร</div>
              </template>
            </v-radio>
            
            <v-expand-transition>
              <v-card v-if="paymentMethod === 'bank_transfer'" flat color="grey darken-4" class="pa-4 mb-4 rounded-lg border-light">
                <div class="text-body-1 white--text">
                  <v-icon small color="primary" class="mr-2">mdi-bank</v-icon>
                  ธนาคารกรุงไทย: <b>660-9-01599-6</b>
                </div>
                <div class="text-body-2 grey--text mt-1">ชื่อบัญชี: <b>บริษัท มังงะ สโตร์ จำกัด</b></div>
              </v-card>
            </v-expand-transition>

            <v-radio color="primary" value="promptpay">
              <template v-slot:label>
                <div class="white--text font-weight-bold">ชำระผ่าน PromptPay (QR Code)</div>
              </template>
            </v-radio>

            <v-expand-transition>
              <v-card v-if="paymentMethod === 'promptpay'" flat color="white" class="pa-6 mb-4 rounded-xl text-center mx-auto" max-width="350">
                <div class="black--text font-weight-black text-h5 mb-2">สแกนเพื่อชำระเงิน</div>
                
                <v-img 
                  :src="`https://promptpay.io/0812345678/${totalPrice}.png`" 
                  contain 
                  max-height="250" 
                  class="mx-auto mb-4 border-qr"
                ></v-img>
                
                <div class="d-flex justify-center align-center">
                  <v-img src="/promptpay-logo.png" max-width="120" contain class="mr-2"></v-img>
                </div>
                <div class="black--text font-weight-bold text-h6 mt-2">ยอดชำระ: {{ totalPrice.toLocaleString() }} ฿</div>
                <div class="grey--text text-caption italic">*กรุณาตรวจสอบยอดเงินก่อนยืนยัน</div>
              </v-card>
            </v-expand-transition>
          </v-radio-group>
        </v-card>

        <v-card v-if="cart.length > 0" dark class="card-dark pa-6 mt-4" rounded="xl" outlined>
          <div class="text-h6 font-weight-bold primary--text mb-4">
            <v-icon color="primary" class="mr-2">mdi-file-image-outline</v-icon>
            แนบหลักฐานการโอนเงิน
          </div>
          
          <v-file-input
            v-model="slipFile"
            label="คลิกเพื่อเลือกไฟล์รูปภาพสลิป"
            outlined
            rounded
            prepend-inner-icon="mdi-camera"
            accept="image/*"
            class="mt-2 custom-file-input"
            hide-details
            background-color="grey darken-4"
            @change="previewSlip"
          ></v-file-input>
          
          <v-expand-transition>
            <div v-if="slipPreview" class="mt-6 text-center">
              <v-divider class="mb-4 grey darken-2"></v-divider>
              <div class="text-subtitle-1 grey--text mb-3">ตรวจสอบสลิปของคุณอีกครั้ง:</div>
              <v-img :src="slipPreview" max-height="500" contain class="rounded-xl grey darken-4 border-light mx-auto shadow-inner"></v-img>
              <v-btn text color="error" class="mt-2" @click="slipFile = null; slipPreview = null">
                <v-icon left small>mdi-close</v-icon> ยกเลิกรูปนี้
              </v-btn>
            </div>
          </v-expand-transition>
        </v-card>

        <v-card v-if="cart.length === 0" rounded="xl" class="card-dark pa-12 text-center" dark>
          <v-icon size="100" color="grey darken-2">mdi-cart-off</v-icon>
          <div class="text-h5 grey--text mt-4">ตะกร้าของคุณยังว่างเปล่า</div>
          <v-btn color="primary" rounded large class="mt-6 font-weight-bold px-8" to="/">ไปเลือกมังงะกันเลย</v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" class="card-summary pa-6" dark elevation="12">
          <div class="text-h5 font-weight-black mb-6">สรุปยอดคำสั่งซื้อ</div>
          <v-divider class="mb-6"></v-divider>
          
          <div class="d-flex justify-space-between mb-2">
            <span class="grey--text">จำนวนสินค้าทั้งหมด:</span>
            <span class="font-weight-bold">{{ totalItems }} เล่ม</span>
          </div>
          
          <div class="d-flex justify-space-between text-h5 font-weight-black mb-8">
            <span>ราคารวมทั้งสิ้น:</span>
            <span class="primary--text">{{ Number(totalPrice).toLocaleString() }} ฿</span>
          </div>

          <v-btn 
            block 
            color="#00E676" 
            x-large 
            rounded 
            class="font-weight-bold black--text mb-4 elevation-6"
            :disabled="cart.length === 0 || processing"
            :loading="processing"
            @click="checkout"
          >
            <v-icon left>mdi-check-circle</v-icon>
            ยืนยันการสั่งซื้อ
          </v-btn>
          
          <v-btn block text to="/" class="grey--text text-none">
            <v-icon left small>mdi-arrow-left</v-icon> เลือกสินค้าต่อ
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      cart: [],
      processing: false,
      paymentMethod: 'bank_transfer',
      slipFile: null,
      slipPreview: null
    }
  },
  computed: {
    totalItems() {
      return this.cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)
    },
    totalPrice() {
      return this.cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0
        const qty = parseInt(item.quantity) || 0
        return sum + (price * qty)
      }, 0)
    }
  },
  mounted() {
    this.loadCart()
  },
  methods: {
    loadCart() {
      const savedCart = localStorage.getItem('manga_cart')
      if (savedCart) {
        try { this.cart = JSON.parse(savedCart) } catch (e) { this.cart = [] }
      }
    },
    saveCart() {
      localStorage.setItem('manga_cart', JSON.stringify(this.cart))
    },
    removeFromCart(index) {
      if(confirm('ลบสินค้านี้ออกจากตะกร้าใช่หรือไม่?')) {
        this.cart.splice(index, 1)
        this.saveCart()
      }
    },
    getImageUrl(path) {
      if (!path) return '/no-image.png'
      return `${this.$config.SUPABASE_URL}/storage/v1/object/public/product-images/${path}`
    },
    previewSlip() {
      if (this.slipFile) {
        this.slipPreview = URL.createObjectURL(this.slipFile)
      } else {
        this.slipPreview = null
      }
    },
    async checkout() {
      const user = this.$supabase.auth.user()
      if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ')
        this.$router.push('/login')
        return
      }

      if (!this.slipFile) {
        alert('กรุณาแนบไฟล์สลิปหลักฐานการโอนเงินเพื่อแจ้งชำระเงินครับ')
        return
      }

      this.processing = true
      try {
        let slipPath = null

        // 1. อัปโหลดรูปสลิปไปที่ Storage
        if (this.slipFile) {
          const file = this.slipFile
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`
          
          const { error: uploadError } = await this.$supabase.storage
            .from('payment-slips')
            .upload(fileName, file)

          if (uploadError) throw uploadError
          slipPath = fileName
        }

        // 2. บันทึกออเดอร์ลงตาราง orders
        const { data: order, error: orderErr } = await this.$supabase
          .from('orders')
          .insert([{ 
            user_id: user.id, 
            user_email: user.email, 
            total_price: this.totalPrice,
            slip_image: slipPath,
            status: 'pending' // สถานะรอตรวจสอบ
          }])
          .select()
          .single()

        if (orderErr) throw orderErr

        // 3. บันทึกรายการสินค้า
        const itemsToInsert = this.cart.map(item => ({
          order_id: order.id,
          product_name: item.name,
          product_price: parseFloat(item.price), 
          quantity: parseInt(item.quantity)
        }))

        const { error: itemsErr } = await this.$supabase
          .from('order_items')
          .insert(itemsToInsert)

        if (itemsErr) throw itemsErr

        alert('สั่งซื้อและแจ้งชำระเงินเรียบร้อยแล้ว!')
        this.cart = []
        localStorage.removeItem('manga_cart')
        this.$router.push('/orders') 

      } catch (e) {
        console.error('Checkout Error:', e)
        alert('เกิดข้อผิดพลาด: ' + e.message)
      } finally {
        this.processing = false
      }
    }
  }
}
</script>

<style scoped>
.bg-main { background-color: #0d0d0d; min-height: 100vh; }
.card-dark { background-color: #1a1a1a !important; border: 1px solid #333 !important; }
.border-light { border: 1px solid #333 !important; }
.card-summary { 
  background: linear-gradient(145deg, #1a1a1a, #121212) !important; 
  border: 2px solid #333 !important;
  position: sticky;
  top: 100px;
}
.border-qr {
  border: 1px solid #eee;
  padding: 5px;
  border-radius: 10px;
}
.shadow-inner {
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}
</style>