<template>
  <v-container fluid class="bg-main pa-0">
    <v-app-bar flat color="#0D0D0D" dark height="90" class="border-bottom px-md-10">
      <div class="d-flex align-center cursor-pointer" @click="$router.push('/')">
        <v-img src="/manga.png" max-width="50" contain class="mr-3 rounded-lg shadow-logo"></v-img>
        <div class="d-none d-sm-block">
          <v-toolbar-title class="text-h5 font-weight-black primary--text lh-1">
            MANGA STORE
          </v-toolbar-title>
        </div>
      </div>

      <v-spacer></v-spacer>

      <v-btn icon to="/cart" class="mr-4">
        <v-badge color="primary" :content="cartCount" :value="cartCount > 0" overlap>
          <v-icon size="28">mdi-cart-outline</v-icon>
        </v-badge>
      </v-btn>

      <div v-if="userEmail" class="d-flex align-center">
        <v-menu offset-y transition="slide-y-transition" rounded="xl">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text v-bind="attrs" v-on="on" class="text-none">
              <v-avatar size="32" color="primary" class="mr-2">
                <v-icon dark small>mdi-account</v-icon>
              </v-avatar>
              <span class="d-none d-md-inline grey--text text--lighten-2">{{ userEmail }}</span>
              <v-icon right small>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          
          <v-list dark class="card-dark pa-2">
            <v-list-item to="/orders" class="rounded-lg mb-1">
              <v-list-item-icon><v-icon color="primary">mdi-history</v-icon></v-list-item-icon>
              <v-list-item-title class="white--text font-weight-bold">ประวัติการสั่งซื้อ</v-list-item-title>
            </v-list-item>
            
            <v-list-item to="/chat" class="rounded-lg mb-1">
              <v-list-item-icon><v-icon color="success">mdi-chat-processing</v-icon></v-list-item-icon>
              <v-list-item-title class="white--text font-weight-bold">แชทกับแอดมิน</v-list-item-title>
            </v-list-item>
            
            <v-divider class="my-1 grey darken-3"></v-divider>
            
            <v-list-item @click="handleLogout" class="rounded-lg">
              <v-list-item-icon><v-icon color="error">mdi-logout</v-icon></v-list-item-icon>
              <v-list-item-title class="error--text font-weight-bold">ออกจากระบบ</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-btn v-else color="primary" rounded depressed to="/login" class="px-6 font-weight-bold">
        เข้าสู่ระบบ
      </v-btn>
    </v-app-bar>

    <v-container class="pa-6 mt-4 pb-12">
      <v-row class="mb-10 align-center">
        <v-col cols="12" md="8">
          <h1 class="display-1 font-weight-black white--text mb-2">
            สะสมมังงะ <span class="primary--text text-glow">เล่มโปรด</span>
          </h1>
          <p class="text-h6 grey--text text--lighten-1 font-weight-regular">
            รวมมังงะยอดฮิตจากญี่ปุ่น จัดส่งไว ถึงมือคุณแน่นอน
          </p>
        </v-col>
      </v-row>

      <v-row v-if="loading">
        <v-col cols="12" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col cols="12" sm="6" md="4" lg="3" v-for="product in products" :key="product.id" class="pa-4">
          <v-card rounded="xl" class="card-product mx-auto overflow-hidden" dark elevation="12">
            <v-hover v-slot="{ hover }">
              <v-img
                :src="getImageUrl(product.image)"
                height="380"
                class="rounded-t-xl align-end grey darken-4 cursor-pointer"
                contain
                @click="showDetail(product)"
              >
                <v-fade-transition>
                  <div v-if="hover" class="d-flex transition-fast-in-fast-out v-card--reveal text-h6 white--text" style="height: 100%;">
                    <v-icon color="white" class="mr-2">mdi-magnify-plus</v-icon> ดูรายละเอียด
                  </div>
                </v-fade-transition>

                <div class="price-tag px-6 py-2">
                  <span class="text-h5 font-weight-black white--text">
                    {{ Number(product.price || 0).toLocaleString() }}
                  </span>
                  <span class="text-subtitle-1 font-weight-bold ml-1 white--text">฿</span>
                </div>
              </v-img>
            </v-hover>

            <v-card-title class="font-weight-bold text-h6 text-truncate d-block pb-1">
              {{ product.name }}
            </v-card-title>
            
            <v-card-text>
              <div class="text-body-2 grey--text text--lighten-1 line-clamp-2 mb-4" style="height: 40px;">
                {{ product.detail || 'ไม่มีรายละเอียดสินค้า' }}
              </div>
              
              <v-btn block color="primary" x-large rounded depressed class="font-weight-bold elevation-4" @click="addToCart(product)">
                <v-icon left>mdi-cart-plus</v-icon> เพิ่มลงตะกร้า
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-footer color="#0D0D0D" dark class="border-top-footer py-12">
      <v-container>
        <v-row>
          <v-col cols="12" md="4" class="mb-6 mb-md-0">
            <div class="d-flex align-center mb-4">
              <v-img src="/manga.png" max-width="40" class="mr-3"></v-img>
              <span class="text-h6 font-weight-black primary--text">MANGA STORE</span>
            </div>
            <p class="grey--text text--lighten-1">
              แหล่งรวบรวมหนังสือการ์ตูนมังงะคุณภาพเยี่ยม ส่งตรงถึงหน้าบ้านคุณ เพื่อคอมังงะโดยเฉพาะ
            </p>
            <div class="d-flex mt-4">
              <v-btn icon color="primary" class="mr-2"><v-icon>mdi-facebook</v-icon></v-btn>
              <v-btn icon color="primary" class="mr-2"><v-icon>mdi-twitter</v-icon></v-btn>
              <v-btn icon color="primary"><v-icon>mdi-instagram</v-icon></v-btn>
            </div>
          </v-col>

          <v-col cols="6" md="2" class="mb-6 mb-md-0">
            <h3 class="white--text font-weight-bold mb-4">ลิงก์ด่วน</h3>
            <v-list color="transparent" class="pa-0">
              <v-list-item class="pa-0 min-h-0 mb-2 cursor-pointer" @click="$router.push('/')">
                <span class="grey--text text--lighten-1 hover-primary text-body-2">หน้าหลัก</span>
              </v-list-item>
              <v-list-item class="pa-0 min-h-0 mb-2 cursor-pointer" @click="$router.push('/cart')">
                <span class="grey--text text--lighten-1 hover-primary text-body-2">ตะกร้าสินค้า</span>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="6" md="2" class="mb-6 mb-md-0">
            <h3 class="white--text font-weight-bold mb-4">ความช่วยเหลือ</h3>
            <v-list color="transparent" class="pa-0">
              <v-list-item class="pa-0 min-h-0 mb-2 cursor-pointer" @click="$router.push('/chat')">
                <span class="grey--text text--lighten-1 hover-primary text-body-2">ติดต่อแอดมิน</span>
              </v-list-item>
              </v-list>
          </v-col>

          <v-col cols="12" md="4">
            <h3 class="white--text font-weight-bold mb-4">ติดต่อเรา</h3>
            <div class="d-flex align-start mb-2">
              <v-icon small color="primary" class="mr-2 mt-1">mdi-map-marker</v-icon>
              <span class="grey--text text--lighten-1 text-body-2">123 ถนนคนรักมังงะ แขวงสนามศุภฯ กรุงเทพฯ</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon small color="primary" class="mr-2">mdi-phone</v-icon>
              <span class="grey--text text--lighten-1 text-body-2">02-123-4567</span>
            </div>
            <div class="d-flex align-center">
              <v-icon small color="primary" class="mr-2">mdi-email</v-icon>
              <span class="grey--text text--lighten-1 text-body-2">support@mangastore.com</span>
            </div>
          </v-col>
        </v-row>
        
        <v-divider class="my-8 grey darken-4"></v-divider>
        
        <div class="text-center grey--text text--darken-2 text-caption">
          © {{ new Date().getFullYear() }} MANGA STORE. All rights reserved.
        </div>
      </v-container>
    </v-footer>

    <v-dialog v-model="detailDialog" max-width="850px" transition="dialog-bottom-transition" dark>
      <v-card v-if="selectedProduct" rounded="xl" class="card-dark overflow-hidden border-glow">
        <v-row no-gutters>
          <v-col cols="12" md="5" class="bg-black d-flex align-center">
            <v-img :src="getImageUrl(selectedProduct.image)" height="100%" contain></v-img>
          </v-col>
          
          <v-col cols="12" md="7" class="pa-8 d-flex flex-column bg-detail">
            <div class="d-flex justify-end mb-2">
              <v-btn icon small @click="detailDialog = false" class="grey darken-3">
                <v-icon small>mdi-close</v-icon>
              </v-btn>
            </div>
            <h2 class="text-h4 font-weight-black primary--text mb-2 lh-tight">{{ selectedProduct.name }}</h2>
            <div class="d-flex align-center mb-6">
              <v-chip color="primary" label class="font-weight-black mr-3">PREMIUM</v-chip>
              <span class="text-h5 font-weight-bold white--text">{{ Number(selectedProduct.price).toLocaleString() }} <small>฿</small></span>
            </div>
            <v-divider class="grey darken-3 mb-6"></v-divider>
            <div class="description-container mb-8 overflow-y-auto" style="max-height: 250px;">
              <p class="text-body-1 grey--text text--lighten-2 text-justify custom-line-height">{{ selectedProduct.detail || 'ไม่มีข้อมูลรายละเอียด' }}</p>
            </div>
            <v-spacer></v-spacer>
            <v-btn block color="primary" x-large rounded depressed class="font-weight-bold elevation-8" @click="addToCartFromDetail">
              <v-icon left>mdi-cart-plus</v-icon> เพิ่มลงตะกร้าเลย
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" timeout="2500" color="primary" rounded="xl" bottom center shadow-lg>
      <div class="d-flex align-center px-2">
        <v-icon left color="white">mdi-check-circle</v-icon>
        <span>เพิ่ม <b>{{ lastAdded }}</b> เรียบร้อย!</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false, products: [], cart: [], snackbar: false,
      lastAdded: '', userEmail: null, detailDialog: false, selectedProduct: null,
    }
  },
  computed: {
    cartCount() { return this.cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0) }
  },
  async mounted() {
    await this.loadProducts()
    this.checkUser()
    this.loadSavedCart()
  },
  methods: {
    checkUser() { const user = this.$supabase.auth.user(); if (user) this.userEmail = user.email },
    loadSavedCart() { const saved = localStorage.getItem('manga_cart'); if (saved) this.cart = JSON.parse(saved) },
    async loadProducts() {
      this.loading = true
      try {
        const { data, error } = await this.$supabase.from('products').select('*').order('created_at', { ascending: false })
        if (!error) this.products = data || []
      } finally { this.loading = false }
    },
    showDetail(product) { this.selectedProduct = product; this.detailDialog = true },
    addToCartFromDetail() { if (this.selectedProduct) { this.addToCart(this.selectedProduct); this.detailDialog = false } },
    getImageUrl(path) { return path ? `${this.$config.SUPABASE_URL}/storage/v1/object/public/product-images/${path}` : '/no-image.png' },
    addToCart(product) {
      const user = this.$supabase.auth.user()
      if (!user) { this.$router.push('/login'); return }
      const index = this.cart.findIndex(item => item.id === product.id)
      if (index !== -1) this.cart[index].quantity++
      else this.cart.push({ ...product, quantity: 1 })
      localStorage.setItem('manga_cart', JSON.stringify(this.cart))
      this.lastAdded = product.name; this.snackbar = true
    },
    async handleLogout() { if (confirm('ออกจากระบบ?')) { await this.$supabase.auth.signOut(); window.location.reload() } }
  }
}
</script>

<style scoped>
/* ส่วน Layout และสีพื้นฐาน */
.bg-main { background-color: #0d0d0d; min-height: 100vh; }
.card-dark { background-color: #1a1a1a !important; border: 1px solid #333 !important; }
.border-bottom { border-bottom: 1px solid #282828 !important; }
.text-glow { text-shadow: 0 0 15px rgba(33, 150, 243, 0.4); }

/* สไตล์การ์ดสินค้าและการ Hover */
.card-product { background-color: #161616 !important; border: 1px solid #282828 !important; transition: 0.4s; }
.card-product:hover { transform: translateY(-12px); border-color: #2196F3 !important; }
.price-tag { background: linear-gradient(135deg, #2196F3 0%, #1565C0 100%); border-top-right-radius: 24px; position: absolute; bottom: 20px; left: 0; z-index: 2; }
.v-card--reveal { align-items: center; bottom: 0; justify-content: center; opacity: .8; position: absolute; width: 100%; background-color: rgba(0, 0, 0, 0.7); z-index: 1; }

/* การจัดการข้อความ */
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.custom-line-height { line-height: 1.8 !important; }
.border-glow { border: 1px solid rgba(33, 150, 243, 0.3) !important; }

/* สไตล์ Footer */
.border-top-footer { border-top: 2px solid #1a1a1a !important; }
.min-h-0 { min-height: 0 !important; }
.hover-primary:hover { color: #2196F3 !important; transition: 0.3s; }
.cursor-pointer { cursor: pointer; }
</style>