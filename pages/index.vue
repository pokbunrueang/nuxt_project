<template>
  <v-container fluid class="bg-main pa-0">
    <v-app-bar flat color="grey darken-4" dark height="80" sticky elevation="4">
      <v-container class="d-flex align-center pa-0">
        <div class="d-flex align-center mr-4" @click="$router.push('/')" style="cursor: pointer">
          <v-avatar size="50" class="mr-2">
            <v-img src="/manga.png" alt="Manga Shop Logo"></v-img>
          </v-avatar>
          <span class="text-h6 font-weight-black uppercase">MANGA SHOP</span>
        </div>

        <v-text-field
          v-model="search"
          flat
          solo-inverted
          hide-details
          prepend-inner-icon="mdi-magnify"
          label="ค้นหามังงะที่คุณต้องการ..."
          class="hidden-sm-and-down ml-4"
        ></v-text-field>

        <v-spacer></v-spacer>

        <v-btn icon to="/cart" class="mx-2">
          <v-badge :content="cartTotalItems" :value="cartTotalItems" color="red" overlap>
            <v-icon size="28">mdi-cart</v-icon>
          </v-badge>
        </v-btn>

        <div v-if="!user">
          <v-btn color="error" depressed rounded to="/login" class="ml-2 px-6 font-weight-bold">
            <v-icon left>mdi-login</v-icon> เข้าสู่ระบบ
          </v-btn>
        </div>

        <div v-else class="d-flex align-center">
          <v-chip color="purple darken-1" dark class="ml-2 px-4 font-weight-bold" pill>
            <v-icon left>mdi-account-circle</v-icon>
            {{ user.email }}
          </v-chip>

          <v-btn icon color="grey lighten-1" class="ml-1" @click="handleLogout" title="ออกจากระบบ">
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </div>
      </v-container>
    </v-app-bar>

    <v-container class="mt-6">
      <v-row class="py-10">
        <v-col cols="12" class="text-center">
          <h1 class="display-1 font-weight-black white--text mb-2 uppercase">MANGA STORE</h1>
          <p class="subtitle-1 grey--text text--lighten-1">
            แหล่งรวมมังงะและไลท์โนเวลสุดฮิต
          </p>
          <v-divider class="mx-auto" width="100" color="primary" style="border-width: 2px;"></v-divider>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="product in filteredProducts"
          :key="product.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-hover v-slot="{ hover }">
            <v-card
              :elevation="hover ? 12 : 2"
              :class="{ 'on-hover': hover }"
              rounded="xl"
              class="transition-swing pa-2 card-dark"
              dark
            >
<v-img
  :src="product.image_url ? product.image_url : '/no-image.png'"
  height="320"
  contain
  class="rounded-lg grey darken-4"
>
  <template v-slot:placeholder>
    <v-row class="fill-height ma-0" align="center" justify="center">
      <v-progress-circular indeterminate color="grey lighten-1"></v-progress-circular>
    </v-row>
  </template>
</v-img>

              <v-card-title class="text-subtitle-1 font-weight-bold pb-1 text-truncate d-block">
                {{ product.name }}
              </v-card-title>

              <v-card-subtitle class="primary--text text-h6 font-weight-black py-0">
                {{ product.price }} ฿
              </v-card-subtitle>

              <v-card-text
                class="text-caption grey--text text--lighten-1 pt-2"
                style="height: 60px; overflow: hidden;"
              >
                {{ product.detail }}
              </v-card-text>

              <v-card-actions class="pa-4">
                <v-btn
                  color="success"
                  block
                  rounded
                  depressed
                  class="font-weight-bold py-5"
                  @click="addToCart(product)"
                >
                  <v-icon left size="20">mdi-cart-plus</v-icon>
                  เพิ่มลงตะกร้า
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
    cart: [],
    user: null,
    search: ''
  }),

  computed: {
    cartTotalItems() {
      return this.cart.reduce((total, item) => total + item.quantity, 0)
    },

    filteredProducts() {
      if (!this.search) return this.products
      const s = this.search.toLowerCase()

      return this.products.filter(p => {
        return (
          (p.name || '').toLowerCase().includes(s) ||
          (p.detail || '').toLowerCase().includes(s)
        )
      })
    }
  },

  async mounted() {
    this.loadCart()
    await this.checkSession()
    await this.loadProducts()
  },

  methods: {
    // โหลด user จาก supabase
    async checkSession() {
      try {
        const { data, error } = await this.$supabase.auth.getUser()
        if (error) throw error
        this.user = data.user || null
      } catch (e) {
        console.error('Session Error:', e)
        this.user = null
      }
    },

    // โหลดสินค้า จาก Supabase
    async loadProducts() {
      try {
        const { data, error } = await this.$supabase
          .from('products')
          .select('*')
          .order('id', { ascending: false })

        if (error) throw error
        this.products = data || []
      } catch (e) {
        console.error('Load Products Error:', e)
        alert('โหลดสินค้าจาก Supabase ไม่สำเร็จ')
      }
    },

    // รูปจาก Supabase Storage
    getProductImage(imageUrl) {
      if (!imageUrl) return '/no-image.png'

      // ถ้าเก็บเป็น public url อยู่แล้ว ก็คืนค่าเลย
      if (imageUrl.startsWith('http')) return imageUrl

      // ถ้าเก็บเป็นชื่อไฟล์ เช่น "xxx.png"
      // สมมุติ bucket ชื่อ product-images
      return `${this.$config.SUPABASE_URL}/storage/v1/object/public/product-images/${imageUrl}`
    },

    loadCart() {
      const savedCart = localStorage.getItem('manga_cart')
      this.cart = savedCart ? JSON.parse(savedCart) : []
    },

    addToCart(product) {
      let currentCart = JSON.parse(localStorage.getItem('manga_cart') || '[]')

      // product.id จาก supabase
      const index = currentCart.findIndex(item => item.id === product.id)

      if (index !== -1) {
        currentCart[index].quantity += 1
      } else {
        currentCart.push({
          ...product,
          quantity: 1
        })
      }

      localStorage.setItem('manga_cart', JSON.stringify(currentCart))
      this.loadCart()

      alert(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว!`)
    },

    async handleLogout() {
      if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
        try {
          const { error } = await this.$supabase.auth.signOut()
          if (error) throw error

          this.user = null

          if (this.$route.path !== '/') {
            this.$router.push('/')
          } else {
            window.location.reload()
          }
        } catch (e) {
          console.error('Logout Error:', e)
          alert(e.message || 'ออกจากระบบไม่สำเร็จ')
        }
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
