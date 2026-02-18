<template>
  <v-container fluid class="pa-6 bg-main">
    <div class="text-center mb-10">
      <h1 class="text-h3 font-weight-black white--text">MANGA STORE</h1>
      <p class="grey--text">แหล่งรวมมังงะและไลท์โนเวลสุดฮิตระดับพรีเมียม</p>
      <v-divider class="mx-auto mt-4" style="max-width: 120px;"></v-divider>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate size="50"></v-progress-circular>
      <div class="grey--text mt-3">กำลังโหลดสินค้า...</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-10">
      <v-alert type="error" border="left" colored-border>
        โหลดสินค้าไม่สำเร็จ: {{ error }}
      </v-alert>
    </div>

    <!-- Products -->
    <v-row v-else>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="p in products" :key="p.id">
        <v-card class="card-dark" dark rounded="xl" elevation="10">
          <v-img
            :src="p.image_url || '/no-image.png'"
            height="220"
            class="rounded-t-xl"
            contain
          ></v-img>

          <v-card-text>
            <div class="text-h6 font-weight-bold white--text">
              {{ p.name }}
            </div>
            <div class="grey--text text-caption mt-1" style="min-height: 40px;">
              {{ p.detail || 'ไม่มีรายละเอียด' }}
            </div>

            <div class="text-h6 font-weight-black primary--text mt-3">
              {{ p.price }} ฿
            </div>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn color="primary" block rounded>
              เพิ่มลงตะกร้า
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" v-if="products.length === 0">
        <v-alert type="info">
          ยังไม่มีสินค้าในฐานข้อมูล Supabase
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      error: null,
      products: []
    }
  },

  async mounted() {
    await this.loadProducts()
  },

  methods: {
    async loadProducts() {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await this.$supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        this.products = data || []
        console.log('PRODUCTS FROM SUPABASE:', this.products)
      } catch (e) {
        console.error(e)
        this.error = e.message || 'Unknown error'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.bg-main {
  min-height: 100vh;
  background-color: #0d0d0d;
}

.card-dark {
  background-color: #1a1a1a !important;
  border: 1px solid #333 !important;
}
</style>
