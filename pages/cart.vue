<template>
  <v-container fluid class="bg-main min-h-screen py-10">
    <v-container>
      <h1 class="text-h4 font-weight-black mb-8 white--text d-flex align-center">
        <v-icon x-large color="primary" class="mr-3">mdi-cart-variant</v-icon>
        ตะกร้าสินค้าของคุณ
      </h1>
      
      <v-row v-if="cart.length > 0">
        <v-col cols="12" md="8">
          <v-card v-for="(item, i) in cart" :key="i" class="mb-4 pa-4 card-dark shadow-lg" dark rounded="xl">
            <v-row align="center">
              <v-col cols="12" sm="3">
                <v-img 
                  :src="`http://localhost/api/uploads/${item.products_image || 'no-image.png'}`" 
                  rounded="lg" 
                  height="120"
                  contain
                  class="grey darken-4"
                ></v-img>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-h6 font-weight-bold">{{ item.products_name }}</div>
                <div class="primary--text text-subtitle-1 font-weight-black">{{ item.products_price }} ฿</div>
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
              @click="checkout"
            >
              <v-icon left>mdi-check-circle</v-icon>
              ยืนยันการสั่งซื้อ
            </v-btn>
            
            <v-btn 
              text 
              block 
              class="mt-4 grey--text" 
              to="/"
            >
              <v-icon left size="18">mdi-arrow-left</v-icon> เลือกสินค้าต่อ
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

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
    cart: []
  }),
  computed: {
    totalPrice() {
      return this.cart.reduce((total, item) => total + (item.products_price * item.quantity), 0);
    },
    totalItems() {
      return this.cart.reduce((total, item) => total + parseInt(item.quantity || 0), 0);
    }
  },
  mounted() {
    // โหลดข้อมูลจาก LocalStorage
    this.cart = JSON.parse(localStorage.getItem('manga_cart') || '[]');
  },
  methods: {
    updateCart() {
      // ตรวจสอบไม่ให้จำนวนน้อยกว่า 1
      this.cart = this.cart.map(item => {
        if (item.quantity < 1) item.quantity = 1;
        return item;
      });
      localStorage.setItem('manga_cart', JSON.stringify(this.cart));
    },
    removeItem(index) {
      if (confirm('คุณต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่?')) {
        this.cart.splice(index, 1);
        this.updateCart();
      }
    },
    async checkout() {
      try {
        const data = {
          total_price: this.totalPrice
        };
        
        // ส่งข้อมูลไปที่ Backend PHP
        const response = await this.$axios.$post('order_save.php', data);
        
        if (response.status) {
          alert('สั่งซื้อสำเร็จ! เลขที่คำสั่งซื้อของคุณคือ: ' + response.order_id);
          localStorage.removeItem('manga_cart'); // ล้างข้อมูลในตะกร้า
          this.$router.push('/'); // กลับหน้าแรก
        } else {
          alert('ไม่สามารถบันทึกข้อมูลการสั่งซื้อได้');
        }
      } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
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