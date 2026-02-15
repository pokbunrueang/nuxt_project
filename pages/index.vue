<template>
  <v-container>
    <v-row justify="end" class="mb-5 mt-2">
      <v-btn color="primary" @click="cartDialog = true" large elevation="4" rounded>
        <v-badge :content="cart.length" :value="cart.length" color="red" overlap>
          <v-icon left>mdi-cart</v-icon> ตะกร้าของฉัน
        </v-badge>
      </v-btn>
    </v-row>

    <v-row>
      <v-col v-for="(item, index) in product" :key="index" cols="12" sm="6" md="4" lg="3">
        <v-card class="mx-auto d-flex flex-column h-100 shadow-soft" hover rounded="xl">
          <v-img :src="item.image" height="250" contain class="grey lighten-4"></v-img>

          <v-card-title class="text-subtitle-1 font-weight-bold pb-0 text-truncate">
            {{ item.name }}
          </v-card-title>

          <v-card-text class="flex-grow-1 pt-2">
            <div class="text-h6 primary--text mb-2">{{ item.price }} ฿</div>
            <p class="text-caption text-secondary custom-line-clamp">{{ item.detail }}</p>
          </v-card-text>

          <v-divider class="mx-4"></v-divider>

          <v-card-actions class="pa-4">
            <v-btn text color="primary" small>รายละเอียด</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="success" elevation="0" rounded small @click="addToCart(item)">
              <v-icon left small>mdi-cart-plus</v-icon> ซื้อเลย
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="cartDialog" max-width="550px" scrollable>
      <v-card class="rounded-xl pa-2">
        <v-card-title class="d-flex justify-space-between align-center px-4 pt-4">
          <div class="text-h5 font-weight-black">
            <v-icon color="primary" large class="mr-2">mdi-basket-outline</v-icon>
            ตะกร้าของคุณ
          </div>
          <v-btn icon @click="cartDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider class="mx-4 mt-2"></v-divider>

        <v-card-text class="pa-4" style="max-height: 450px;">
          <div v-if="cart.length === 0" class="text-center py-12">
            <v-icon size="80" color="grey lighten-3">mdi-cart-off</v-icon>
            <div class="text-h6 grey--text text--lighten-1 mt-4">ตะกร้ายังว่างอยู่นะ</div>
          </div>

          <v-list v-else flat>
            <v-list-item 
              v-for="(cartItem, i) in cart" 
              :key="i" 
              class="mb-4 grey lighten-5 rounded-lg"
              style="border: 1px solid #eee;"
            >
              <v-list-item-avatar tile size="70" class="rounded-lg">
                <v-img :src="cartItem.image" contain></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="font-weight-bold text-body-1">{{ cartItem.name }}</v-list-item-title>
                <v-list-item-subtitle class="primary--text font-weight-bold text-h6 mt-1">
                  {{ cartItem.price }} ฿
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn icon color="red lighten-2" @click="removeFromCart(i)">
                  <v-icon>mdi-delete-sweep-outline</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-divider class="mx-4"></v-divider>

        <v-card-actions class="pa-6 flex-column">
          <div class="d-flex justify-space-between width-100 mb-6" style="width: 100%;">
            <span class="text-h6 grey--text text--darken-1">ยอดชำระสุทธิ</span>
            <span class="text-h4 primary--text font-weight-black">{{ totalPrice }} ฿</span>
          </div>
          
          <v-btn 
            color="success" 
            x-large 
            block 
            rounded 
            elevation="8" 
            class="text-h6 font-weight-bold"
            :disabled="cart.length === 0" 
            @click="checkout"
          >
            <v-icon left>mdi-check-circle</v-icon>
            ยืนยันการสั่งซื้อ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      cartDialog: false,
      cart: [], // เก็บรายการที่เลือก
      product: [
        { name: 'ผ่าพิภพไททัน', price: 90, image: '/aot.jpg', detail: 'การต่อสู้ของมนุษยชาติเพื่อหนีการถูกกินโดยยักษ์ไททัน แต่ความจริงกลับกลายเป็นสงครามการเมืองและการแก้แค้นระดับโลกที่มีพล็อตหักมุมจนหยดสุดท้าย' },
        { name: 'ฟรีเรน คำอธิษฐานในวันที่จากลา', price: 95, image: '/fr.jfif', detail: 'การเดินทางของเอลฟ์สาวหลังจบศึกปราบจอมมาร เธอออกเดินทางใหม่เพื่อเรียนรู้คุณค่าของ "เวลา" และ "ความรู้สึกมนุษย์" ผ่านความทรงจำของเพื่อนร่วมทางที่จากไป' },
        { name: 'ขอต้อนรับสู่ห้องเรียนนิยมเฉพาะยอดคน', price: 155, image: '/classroom.jpg', detail: 'สงครามจิตวิทยาในโรงเรียนที่คัดคนจากความสามารถ พระเอกต้องใช้แผนการแยบยลบงการเหตุการณ์จากเบื้องหลัง เพื่อพาห้องบ๊วยไต่เต้าขึ้นสู่ระดับท็อป' },
        { name: 'เชนซอแมน', price: 86, image: '/csm.jfif', detail: 'เด็กหนุ่มดวงกุดรวมร่างกับปีศาจเลื่อยยนต์ กลายเป็นนักล่าปีศาจสุดระห่ำ เนื้อเรื่องดิบ เถื่อน คาดเดาไม่ได้ และเต็มไปด้วยฉากแอ็กชันสุดบ้าคลั่ง' },
      ],
    }
  },
  computed: {
    totalPrice() {
      return this.cart.reduce((sum, item) => sum + item.price, 0)
    }
  },
  methods: {
    addToCart(item) {
      this.cart.push(item)
      // แจ้งเตือนเล็กๆ เมื่อเพิ่มสินค้า
      console.log(`Added ${item.name} to cart`)
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
    },
    checkout() {
      alert(`สั่งซื้อสำเร็จ! ยอดรวมทั้งหมด ${this.totalPrice} บาท\nขอบคุณที่ใช้บริการครับ`)
      this.cart = []
      this.cartDialog = false
    }
  }
}
</script>

<style scoped>
/* จัดระเบียบข้อความให้แสดงแค่ 3 บรรทัด */
.custom-line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* เพิ่มเงาให้นุ่มนวล */
.shadow-soft {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
}

/* ตั้งค่าปุ่มในตะกร้าให้กว้างเต็มพื้นที่ */
.width-100 {
  width: 100%;
}
</style>