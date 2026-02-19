<template>
  <v-container fluid class="bg-admin-main pa-6">
    <v-row class="mb-6 align-center">
      <v-col class="d-flex align-center">
        <v-btn icon to="/admin/index_ad" class="mr-2" color="white">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="text-h4 font-weight-black white--text uppercase">
          การจัดการสินค้า
        </h1>
      </v-col>

      <v-col class="text-right">
        <v-btn color="success" large rounded depressed @click="openAddDialog">
          <v-icon left>mdi-plus-circle</v-icon> เพิ่มมังงะใหม่
        </v-btn>
      </v-col>
    </v-row>

    <v-card rounded="xl" class="card-dark" dark elevation="10">
      <v-simple-table class="card-dark">
        <thead>
          <tr>
            <th class="white--text">รูปหน้าปก</th>
            <th class="white--text">ID</th>
            <th class="white--text">ชื่อมังงะ</th>
            <th class="white--text">ราคา</th>
            <th class="text-center white--text">จัดการ</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in products" :key="item.id">
            <td>
              <v-img
                :src="getImageUrl(item.image)"
                max-width="60"
                class="rounded-lg my-2 grey darken-4"
                contain
              ></v-img>
            </td>

            <td>{{ item.id }}</td>
            <td class="font-weight-medium">{{ item.name }}</td>
            <td class="primary--text font-weight-bold">
              {{ Number(item.price || 0).toLocaleString() }} ฿
            </td>

            <td class="text-center">
              <v-btn icon color="blue lighten-2" @click="editItem(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon color="error" @click="deleteItem(item.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>

          <tr v-if="!loading && products.length === 0">
            <td colspan="5" class="text-center grey--text py-6">
              ยังไม่มีสินค้าในระบบ
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="550px" persistent>
      <v-card class="card-dark pa-4" dark rounded="xl">
        <v-card-title class="text-h5 font-weight-bold primary--text">
          {{ isEdit ? 'แก้ไขข้อมูลมังงะ' : 'เพิ่มมังงะเล่มใหม่' }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="ชื่อมังงะ"
            outlined
            rounded
            dense
            class="mt-4"
          ></v-text-field>

          <v-text-field
            v-model.number="form.price"
            label="ราคา"
            outlined
            rounded
            dense
            type="number"
          ></v-text-field>

          <v-textarea
            v-model="form.detail"
            label="รายละเอียด"
            outlined
            rounded
            dense
            rows="3"
          ></v-textarea>

          <v-file-input
            v-model="imageFile"
            label="เลือกรูปหน้าปกมังงะ"
            accept="image/*"
            prepend-icon="mdi-camera"
            outlined
            rounded
            dense
          ></v-file-input>

          <div v-if="previewUrl" class="mt-4">
            <div class="grey--text text--lighten-1 mb-2">Preview</div>
            <v-img :src="previewUrl" height="200" contain class="grey darken-4 rounded-lg" />
          </div>
        </v-card-text>

        <v-card-actions class="pb-4 px-6">
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false" rounded>ยกเลิก</v-btn>

          <v-btn
            color="primary"
            rounded
            depressed
            class="px-6"
            :loading="saving"
            @click="saveProduct"
          >
            บันทึกข้อมูล
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  middleware: 'auth-admin',

  data() {
    return {
      loading: false,
      saving: false,

      products: [],
      dialog: false,
      isEdit: false,

      imageFile: null,
      previewUrl: null,

      form: {
        id: null,
        name: '',
        price: 0,
        detail: '',
        image: null, // เก็บ path ใน storage เช่น products/xxx.png
      },
    }
  },

  watch: {
    imageFile(file) {
      if (!file) {
        this.previewUrl = null
        return
      }
      this.previewUrl = URL.createObjectURL(file)
    },
  },

  async mounted() {
    await this.loadProducts()
  },

  methods: {
    // ====== รูปภาพจาก Supabase Storage ======
    getImageUrl(path) {
      if (!path) return '/no-image.png'
      return `${this.$config.SUPABASE_URL}/storage/v1/object/public/product-images/${path}`
    },

    // ====== โหลดสินค้า ======
    async loadProducts() {
      this.loading = true
      try {
        const { data, error } = await this.$supabase
          .from('products')
          .select('id, name, price, detail, image, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error
        this.products = data || []
      } catch (e) {
        console.error('Load products failed:', e)
        alert(e.message || 'โหลดสินค้าไม่สำเร็จ')
      } finally {
        this.loading = false
      }
    },

    // ====== เปิดเพิ่มสินค้า ======
    openAddDialog() {
      this.isEdit = false
      this.imageFile = null
      this.previewUrl = null

      this.form = {
        id: null,
        name: '',
        price: 0,
        detail: '',
        image: null,
      }

      this.dialog = true
    },

    // ====== เปิดแก้ไขสินค้า ======
    editItem(item) {
      this.isEdit = true
      this.imageFile = null
      this.previewUrl = item.image ? this.getImageUrl(item.image) : null

      this.form = {
        id: item.id,
        name: item.name,
        price: item.price,
        detail: item.detail,
        image: item.image || null,
      }

      this.dialog = true
    },

    // ====== Upload รูปขึ้น Storage ======
    async uploadImageToSupabase(file) {
      // ตั้งชื่อไฟล์แบบไม่ซ้ำ
      const ext = file.name.split('.').pop()
      const fileName = `products/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`

      const { error } = await this.$supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      return fileName // path ที่เก็บลง DB
    },

    // ====== บันทึกสินค้า ======
    async saveProduct() {
      if (!this.form.name || !this.form.price) {
        alert('กรุณากรอกชื่อและราคา')
        return
      }

      this.saving = true
      try {
        // 1) upload รูป (ถ้ามี)
        if (this.imageFile) {
          const uploadedPath = await this.uploadImageToSupabase(this.imageFile)
          this.form.image = uploadedPath
        }

        // 2) insert / update
        if (this.isEdit) {
          const { error } = await this.$supabase
            .from('products')
            .update({
              name: this.form.name,
              price: Number(this.form.price),
              detail: this.form.detail,
              image: this.form.image,
            })
            .eq('id', this.form.id)

          if (error) throw error
        } else {
          const { error } = await this.$supabase.from('products').insert([
            {
              name: this.form.name,
              price: Number(this.form.price),
              detail: this.form.detail,
              image: this.form.image,
            },
          ])

          if (error) throw error
        }

        alert('บันทึกข้อมูลสำเร็จ!')
        this.dialog = false
        await this.loadProducts()

        this.imageFile = null
        this.previewUrl = null
      } catch (e) {
        console.error(e)
        alert(e.message || 'บันทึกไม่สำเร็จ')
      } finally {
        this.saving = false
      }
    },

    // ====== ลบสินค้า ======
    async deleteItem(id) {
      if (!confirm('คุณแน่ใจหรือไม่ที่จะลบมังงะเล่มนี้?')) return

      try {
        const { error } = await this.$supabase.from('products').delete().eq('id', id)
        if (error) throw error

        alert('ลบข้อมูลเรียบร้อย!')
        await this.loadProducts()
      } catch (e) {
        console.error(e)
        alert(e.message || 'ลบไม่สำเร็จ')
      }
    },
  },
}
</script>

<style scoped>
.bg-admin-main {
  background-color: #0d0d0d;
  min-height: 100vh;
}
.card-dark {
  background-color: #1a1a1a !important;
  border: 1px solid #333 !important;
}
.uppercase {
  text-transform: uppercase;
}
</style>
