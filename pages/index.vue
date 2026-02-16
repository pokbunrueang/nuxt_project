<template>
  <v-container fluid class="bg-main pa-0">
    <v-app-bar flat color="grey darken-4" dark height="80" sticky>
      <v-container class="d-flex align-center pa-0">
        <div class="d-flex align-center mr-4" @click="$router.push('/')" style="cursor: pointer">
          <v-avatar size="80" class="mr-2">
            <v-img src="/manga.png" alt="Manga Shop Logo"></v-img>
          </v-avatar>
          <span class="text-h6 font-weight-black uppercase">MANGA SHOP</span>
        </div>

        <v-text-field
          flat
          solo-inverted
          hide-details
          prepend-inner-icon="mdi-magnify"
          label="ค้นหามังงะที่คุณต้องการ..."
          class="hidden-sm-and-down ml-4"
        ></v-text-field>

        <v-spacer></v-spacer>

        <v-btn icon to="/cart" class="mx-2">
          <v-badge :content="cart.length" :value="cart.length" color="red" overlap>
            <v-icon size="28">mdi-cart</v-icon>
          </v-badge>
        </v-btn>

        <v-btn color="error" depressed rounded to="/admin" class="ml-2 px-6">
          Admin
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-container class="mt-6">
      <v-row class="py-10">
        <v-col cols="12 text-center">
          <h1 class="display-1 font-weight-black white--text mb-2 uppercase">MANGA STORE</h1>
          <p class="subtitle-1 grey--text text--lighten-1">แหล่งรวมมังงะและไลท์โนเวลสุดฮิตระดับพรีเมียม</p>
          <v-divider class="mx-auto" width="100" color="primary" thickness="4"></v-divider>
        </v-col>
      </v-row>

      <v-row>
        <v-col v-for="product in products" :key="product.products_id" cols="12" sm="6" md="4" lg="3">
          <v-hover v-slot="{ hover }">
            <v-card 
              :elevation="hover ? 12 : 2" 
              :class="{ 'on-hover': hover }" 
              rounded="xl" 
              class="transition-swing pa-2 card-dark"
              dark
            >
              <v-img
                :src="`http://localhost/api/uploads/${product.products_image || 'no-image.png'}`"
                height="320"
                contain
                class="rounded-lg grey darken-4"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-icon size="50" color="grey lighten-2">mdi-book-open-page-variant</v-icon>
                  </v-row>
                </template>
              </v-img>

              <v-card-title class="text-subtitle-1 font-weight-bold pb-1 text-truncate d-block">
                {{ product.products_name }}
              </v-card-title>
              
              <v-card-subtitle class="primary--text text-h6 font-weight-black py-0">
                {{ product.products_price }} ฿
              </v-card-subtitle>

              <v-card-text class="text-caption grey--text text--lighten-1 pt-2" style="height: 60px; overflow: hidden;">
                {{ product.products_detail }}
              </v-card-text>

              <v-card-actions class="pa-4">
                <v-btn color="success" block rounded depressed class="font-weight-bold py-5" @click="addToCart(product)">
                  <v-icon left size="20">mdi-cart-plus</v-icon> ซื้อเลย
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    products: [],
    cart: []
  }),
  async fetch() {
    // ดึงข้อมูลสินค้าจาก API
    try {
      this.products = await this.$axios.$get('products_select.php')
    } catch (e) {
      console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', e)
    }
  },
  mounted() {
    // โหลดข้อมูลตะกร้าที่ค้างอยู่ในเบราว์เซอร์
    this.loadCart()
  },
  methods: {
    loadCart() {
      const savedCart = localStorage.getItem('manga_cart')
      this.cart = savedCart ? JSON.parse(savedCart) : []
    },
    addToCart(product) {
      // ดึงตะกร้าเดิมออกมาจัดการ
      let currentCart = JSON.parse(localStorage.getItem('manga_cart') || '[]')
      const index = currentCart.findIndex(item => item.products_id === product.products_id)
      
      if (index !== -1) {
        currentCart[index].quantity += 1
      } else {
        currentCart.push({ ...product, quantity: 1 })
      }

      // บันทึกลง LocalStorage และรีโหลด Badge บนตะกร้า
      localStorage.setItem('manga_cart', JSON.stringify(currentCart))
      this.loadCart()
      alert(`เพิ่ม "${product.products_name}" ลงตะกร้าแล้ว!`)
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
.v-card.on-hover {
  transform: translateY(-8px);
}
.transition-swing {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.uppercase {
  text-transform: uppercase;
}
</style>