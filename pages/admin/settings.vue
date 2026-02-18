<template>
  <v-container fluid class="bg-admin-main pa-6">
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex align-center">
        <v-btn icon to="/admin" class="mr-2" color="white">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h1 class="text-h4 font-weight-black white--text uppercase">
          Shop Settings
        </h1>
      </v-col>
    </v-row>

    <v-card rounded="xl" class="card-dark pa-8 mx-auto" dark max-width="800">
      <v-form ref="form">
        <v-row>
          <v-col cols="12">
            <div class="text-h6 mb-4 primary--text font-weight-bold">
              ข้อมูลทั่วไป
            </div>

            <v-text-field
              label="ชื่อร้านค้า"
              v-model="shop.name"
              outlined
              rounded
              dense
              :disabled="loading"
            />

            <v-textarea
              label="ที่อยู่สำหรับการจัดส่ง"
              v-model="shop.address"
              outlined
              rounded
              dense
              :disabled="loading"
            />
          </v-col>

          <v-divider class="my-4 mx-3"></v-divider>

          <v-col cols="12">
            <div class="text-h6 mb-4 orange--text font-weight-bold">
              ช่องทางการติดต่อ
            </div>

            <v-text-field
              label="เบอร์โทรศัพท์"
              v-model="shop.phone"
              outlined
              rounded
              dense
              :disabled="loading"
            />

            <v-text-field
              label="Line ID / Facebook"
              v-model="shop.social"
              outlined
              rounded
              dense
              :disabled="loading"
            />
          </v-col>
        </v-row>

        <v-card-actions class="px-0 mt-4">
          <v-btn
            color="primary"
            block
            x-large
            rounded
            class="font-weight-bold"
            :loading="saving"
            :disabled="loading"
            @click="saveSettings"
          >
            <v-icon left>mdi-content-save</v-icon> บันทึกการตั้งค่า
          </v-btn>
        </v-card-actions>

        <div v-if="errorMsg" class="red--text mt-4 text-center">
          {{ errorMsg }}
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
export default {
  middleware: 'auth-admin',

  data: () => ({
    loading: true,
    saving: false,
    errorMsg: '',

    shop: {
      name: '',
      address: '',
      phone: '',
      social: '',
    },
  }),

  async mounted() {
    await this.loadSettings()
  },

  methods: {
    async loadSettings() {
      this.loading = true
      this.errorMsg = ''

      try {
        // ดึง settings แถวเดียว (id=1)
        const { data, error } = await this.$supabase
          .from('shop_settings')
          .select('*')
          .eq('id', 1)
          .single()

        // ถ้าไม่มีแถว ให้สร้างขึ้นมา
        if (error && error.code === 'PGRST116') {
          const { error: insertError } = await this.$supabase
            .from('shop_settings')
            .insert([{ id: 1, shop_name: 'MANGA SHOP' }])

          if (insertError) throw insertError

          // โหลดใหม่หลัง insert
          return await this.loadSettings()
        }

        if (error) throw error

        this.shop = {
          name: data.shop_name || 'MANGA SHOP',
          address: data.shop_address || '',
          phone: data.shop_phone || '',
          social: data.shop_social || '',
        }
      } catch (e) {
        console.error('Load settings error:', e)
        this.errorMsg = e.message || 'โหลดการตั้งค่าไม่สำเร็จ'
      } finally {
        this.loading = false
      }
    },

    async saveSettings() {
      this.saving = true
      this.errorMsg = ''

      try {
        // กันกรณีชื่อร้านว่าง
        if (!this.shop.name || !this.shop.name.trim()) {
          this.saving = false
          return alert('กรุณากรอกชื่อร้านค้า')
        }

        const payload = {
          id: 1,
          shop_name: this.shop.name.trim(),
          shop_address: this.shop.address || '',
          shop_phone: this.shop.phone || '',
          shop_social: this.shop.social || '',
          updated_at: new Date().toISOString(),
        }

        const { error } = await this.$supabase
          .from('shop_settings')
          .upsert(payload, { onConflict: 'id' })

        if (error) throw error

        alert('บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว!')
      } catch (e) {
        console.error('Save settings error:', e)
        alert(e.message || 'บันทึกไม่สำเร็จ')
      } finally {
        this.saving = false
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
