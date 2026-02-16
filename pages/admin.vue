<template>
  <v-container>
    <v-row class="mb-5 align-center">
      <v-col>
        <h1 class="text-h4 font-weight-black primary--text">ระบบจัดการหลังบ้าน</h1>
      </v-col>
      <v-col class="text-right">
        <v-btn color="success" large rounded @click="openAddDialog">
          <v-icon left>mdi-plus-circle</v-icon> เพิ่มมังงะใหม่
        </v-btn>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="3">
      <v-simple-table>
        <thead>
          <tr>
            <th>รูปหน้าปก</th>
            <th>ID</th>
            <th>ชื่อมังงะ</th>
            <th>ราคา</th>
            <th class="text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in products" :key="item.products_id">
            <td>
              <v-img 
                :src="`http://localhost/api/uploads/${item.products_image || 'no-image.png'}`" 
                max-width="60" 
                class="rounded-lg my-2"
                contain
              ></v-img>
            </td>
            <td>{{ item.products_id }}</td>
            <td>{{ item.products_name }}</td>
            <td>{{ item.products_price }} ฿</td>
            <td class="text-center">
              <v-btn icon color="blue" @click="editItem(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon color="red" @click="deleteItem(item.products_id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h5 font-weight-bold">
          {{ isEdit ? 'แก้ไขข้อมูลมังงะ' : 'เพิ่มมังงะเล่มใหม่' }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="ชื่อมังงะ" outlined dense class="mt-4"></v-text-field>
          <v-text-field v-model="form.price" label="ราคา" outlined dense type="number"></v-text-field>
          <v-textarea v-model="form.detail" label="รายละเอียด" outlined dense></v-textarea>
          
          <v-file-input
            v-model="imageFile"
            label="เลือกรูปหน้าปกมังงะ"
            accept="image/*"
            prepend-icon="mdi-camera"
            outlined
            dense
          ></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" rounded @click="saveProduct">บันทึกข้อมูล</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      products: [],
      dialog: false,
      isEdit: false,
      imageFile: null,
      form: { id: null, name: '', price: '', detail: '', image: '' }
    }
  },
  async fetch() {
    await this.loadProducts()
  },
  methods: {
    async loadProducts() {
      const res = await this.$axios.$get('products_select.php')
      this.products = res
    },
    openAddDialog() {
      this.isEdit = false
      this.imageFile = null
      this.form = { id: null, name: '', price: '', detail: '', image: '' }
      this.dialog = true
    },
    editItem(item) {
      this.isEdit = true
      this.imageFile = null
      this.form = { 
        id: item.products_id, 
        name: item.products_name, 
        price: item.products_price, 
        detail: item.products_detail,
        image: item.products_image 
      }
      this.dialog = true
    },
    async saveProduct() {
      try {
        // 1. อัปโหลดรูปภาพถ้ามีการเลือกไฟล์ใหม่
        if (this.imageFile) {
          const formData = new FormData()
          formData.append('file', this.imageFile)
          
          const uploadRes = await this.$axios.$post('upload.php', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })

          if (uploadRes.status) {
            this.form.image = uploadRes.file_name 
          }
        }

        // 2. บันทึกข้อมูลมังงะ
        if (this.isEdit) {
          await this.$axios.$post('products_update.php', this.form)
        } else {
          await this.$axios.$post('products_insert.php', this.form)
        }

        this.dialog = false
        await this.loadProducts()
        alert('บันทึกข้อมูลสำเร็จ!')
        this.imageFile = null 

      } catch (e) {
        alert('เกิดข้อผิดพลาด!')
      }
    },
    async deleteItem(id) {
      if (confirm('คุณแน่ใจหรือไม่ที่จะลบมังงะเล่มนี้?')) {
        try {
          await this.$axios.$post('products_delete.php', { id: id })
          await this.loadProducts()
          alert('ลบข้อมูลเรียบร้อย!')
        } catch (e) {
          alert('ลบไม่สำเร็จ!')
        }
      }
    }
  }
}
</script>