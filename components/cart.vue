<template>
  <v-container fluid class="bg-main min-h-screen py-10">
    <v-container>
      <h1 class="text-h4 font-weight-black mb-8 white--text d-flex align-center">
        <v-icon x-large color="primary" class="mr-3">mdi-cart-variant</v-icon>
        ตะกร้าสินค้าของคุณ
      </h1>

      <v-row v-if="cart.length > 0">
        <!-- LEFT: LIST -->
        <v-col cols="12" md="8">
          <v-card
            v-for="(item, i) in cart"
            :key="i"
            class="mb-4 pa-4 card-dark shadow-lg"
            dark
            rounded="xl"
          >
            <v-row align="center">
              <v-col cols="12" sm="3">
                <v-img
                  :src="getProductImage(item.image_url)"
                  rounded="lg"
                  height="120"
                  contain
                  class="grey darken-4"
                ></v-img>
              </v-col>

              <v-col cols="12" sm="4">
                <div class="text-h6 font-weight-bold">{{ item.name }}</div>
                <div class="primary--text text-subtitle-1 font-weight-black">
                  {{ item.price }} ฿
                </div>
              </v-col>

              <v-col cols="8" sm="3">
                <v-text-field
                  v-model.number="item.quantity"
                  type="number"
                  label="จำนวน"
                  outlined
                  dense
                  hide-details
                  min="1"
                  @input="updateCart"
                  class="rounded-lg"
                ></v-text-field>
              </v-col>

              <v-col cols="4" sm="2" class="text-right">
                <v-btn icon color="red lighten-1" @click="removeItem(i)">
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- RIGHT: SUMMARY -->
        <v-col cols="12" md="4">
          <v-card class="pa-6 card-dark border-primary" dark rounded="xl">
            <h2 class="text-h5 font-weight-bold mb-4">สรุปยอดคำสั่งซื้อ</h2>
            <v-divider class="mb-6 grey darken-2"></v-divider>

            <div class="d-flex justify-space-between mb-4">
              <span class="grey--text text--lighten-1">จำนวนสินค้าทั้งหมด:</span>
              <span class="font-weight-bold">{{ totalItems }} เล่ม</span>
            </div>

            <div class="d-flex justify-space-between mb-6">
              <span class="text-h6">ราคารวมทั้งสิ้น:</span>
              <span class="text-h5 primary--text font-weight-black">{{ totalPrice }} ฿</span>
            </div>

            <v-btn
              color="success"
              block
              x-large
              rounded
              depressed
              class="font-weight-bold py-6 text-h6 shadow-green"
              :loading="loading"
              :disabled="loading"
              @click="checkout"
            >
              <v-icon left>mdi-check-circle</v-icon>
              ยืนยันการสั่งซื้อ
            </v-btn>

            <v-btn text block class="mt-4 grey--text" to="/">
              <v-icon left size="18">mdi-arrow-left</v-icon>
              เลือกสินค้าต่อ
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- EMPTY CART -->
      <v-row v-else class="text-center py-16">
        <v-col>
          <v-avatar size="150" color="grey darken-4" class="mb-6">
            <v-icon size="80" color="grey darken-2">mdi-cart-off</v-icon>
          </v-avatar>

          <h2 class="text-h5 white--text mb-2">ยังไม่มีสินค้าในตะกร้า</h2>
          <p class="grey--text mb-8">ไปเลือกมังงะที่คุณถูกใจ แล้วกลับมาสั่งซื้อนะครับ!</p>

          <v-btn color="primary" x-large rounded depressed to="/" class="px-10 font-weight-bold">
            ไปที่หน้าหลัก
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    cart: [],
    loading: false
  }),

  computed: {
    totalPrice() {
      return this.cart.reduce((total, item) => {
        return total + Number(item.price) * Number(item.quantity)
      }, 0)
    },

    totalItems() {
      return this.cart.reduce((total, item) => {
        return total + Number(item.quantity || 0)
      }, 0)
    }
  },

  mounted() {
    this.loadCart()
  },

  methods: {
    loadCart() {
      this.cart = JSON.parse(localStorage.getItem('manga_cart') || '[]')
    },

    updateCart() {
      // กัน quantity ต่ำกว่า 1
      this.cart = this.cart.map(item => {
        if (!item.quantity || item.quantity < 1) item.quantity = 1
        return item
      })

      localStorage.setItem('manga_cart', JSON.stringify(this.cart))
    },

    removeItem(index) {
      if (confirm('คุณต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่?')) {
        this.cart.splice(index, 1)
        this.updateCart()
      }
    },

    getProductImage(imageUrl) {
      if (!imageUrl) return '/no-image.png'
      if (imageUrl.startsWith('http')) return imageUrl

      // bucket: product-images
      return `${this.$config.SUPABASE_URL}/storage/v1/object/public/product-images/${imageUrl}`
    },

    async checkout() {
      if (this.cart.length === 0) return

      this.loading = true

      try {
        // 1) เช็ค user login
        const { data: userData, error: userErr } = await this.$supabase.auth.getUser()
        if (userErr) throw userErr

        const user = userData.user
        if (!user) {
          alert('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ')
          this.$router.push('/login')
          return
        }

        // 2) สร้าง order
        const { data: order, error: orderErr } = await this.$supabase
          .from('orders')
          .insert([
            {
              user_id: user.id,
              total_price: this.totalPrice,
              status: 'pending'
            }
          ])
          .select()
          .single()

        if (orderErr) throw orderErr

        // 3) สร้าง order_items
        const items = this.cart.map(item => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          product_price: Number(item.price),
          quantity: Number(item.quantity),
          product_image: item.image_url || null
        }))

        const { error: itemsErr } = await this.$supabase
          .from('order_items')
          .insert(items)

        if (itemsErr) throw itemsErr

        // 4) success
        alert('สั่งซื้อสำเร็จ! เลขที่คำสั่งซื้อ: ' + order.id)

        localStorage.removeItem('manga_cart')
        this.cart = []

        this.$router.push('/')
      } catch (e) {
        console.error(e)
        alert(e.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ')
      } finally {
        this.loading = false
      }
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
.border-primary {
  border: 2px solid #311B92 !important;
}
.shadow-lg {
  box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
}
.shadow-green {
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3) !important;
}
.min-h-screen {
  min-height: 100vh;
}
</style>
