<template>
  <div>
    <v-btn color="info" class="mr-2" @click="productQuery">
      Load Product Data
    </v-btn>

    <v-btn color="success" @click="openInsertDialog">
      Insert Data
    </v-btn>

    <v-data-table :items="products" :headers="headers" class="mt-4">
      <template v-slot:item.actions="{ item }">
        <v-btn small @click="openEditDialog(item)" color="warning" class="mr-1">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <v-btn small @click="deleteProduct(item)" color="error" class="mr-1">
          <v-icon>mdi-delete</v-icon>
        </v-btn>

        <v-btn small color="primary" @click="addToCart(item)">
          Add to Cart
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialog -->
    <v-dialog v-model="productDialog" width="500">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ isEdit ? "Edit Product" : "Insert Product" }}
        </v-card-title>

        <v-card-text>
          <v-form ref="form">
            <v-text-field
              v-model="productForm.name"
              label="Name"
              required
            ></v-text-field>

            <v-text-field
              v-model.number="productForm.price"
              label="Price"
              required
              type="number"
            ></v-text-field>

            <v-textarea
              v-model="productForm.detail"
              label="Detail"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="productDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" :loading="loading" @click="saveProduct">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex"

export default {
  data() {
    return {
      headers: [
        { text: "ID", value: "id" },
        { text: "Name", value: "name" },
        { text: "Price", value: "price" },
        { text: "Detail", value: "detail" },
        { text: "Actions", value: "actions", sortable: false }
      ],

      products: [],

      productDialog: false,
      isEdit: false,
      loading: false,

      productForm: {
        id: null,
        name: "",
        price: 0,
        detail: ""
      }
    }
  },

  mounted() {
    this.productQuery()
  },

  methods: {
    ...mapActions({
      addCart: "cart/addCart"
    }),

    // -------------------------
    // LOAD PRODUCTS
    // -------------------------
    async productQuery() {
      try {
        const { data, error } = await this.$supabase
          .from("products")
          .select("*")
          .order("id", { ascending: true })

        if (error) throw error
        this.products = data || []
      } catch (e) {
        console.error(e)
        alert(e.message || "โหลดสินค้าไม่สำเร็จ")
      }
    },

    // -------------------------
    // DIALOG
    // -------------------------
    openInsertDialog() {
      this.isEdit = false
      this.productForm = { id: null, name: "", price: 0, detail: "" }
      this.productDialog = true
    },

    openEditDialog(item) {
      this.isEdit = true
      this.productForm = { ...item }
      this.productDialog = true
    },

    // -------------------------
    // SAVE PRODUCT (INSERT / UPDATE)
    // -------------------------
    async saveProduct() {
      if (!this.productForm.name || !this.productForm.price) {
        return alert("กรุณากรอกชื่อสินค้าและราคา")
      }

      this.loading = true

      try {
        if (this.isEdit) {
          const { error } = await this.$supabase
            .from("products")
            .update({
              name: this.productForm.name,
              price: Number(this.productForm.price),
              detail: this.productForm.detail
            })
            .eq("id", this.productForm.id)

          if (error) throw error
        } else {
          const { error } = await this.$supabase.from("products").insert([
            {
              name: this.productForm.name,
              price: Number(this.productForm.price),
              detail: this.productForm.detail
            }
          ])

          if (error) throw error
        }

        this.productDialog = false
        await this.productQuery()
      } catch (e) {
        console.error(e)
        alert(e.message || "บันทึกสินค้าไม่สำเร็จ")
      } finally {
        this.loading = false
      }
    },

    // -------------------------
    // DELETE
    // -------------------------
    async deleteProduct(item) {
      if (!confirm("Delete this product?")) return

      try {
        const { error } = await this.$supabase
          .from("products")
          .delete()
          .eq("id", item.id)

        if (error) throw error
        await this.productQuery()
      } catch (e) {
        console.error(e)
        alert(e.message || "ลบสินค้าไม่สำเร็จ")
      }
    },

    // -------------------------
    // ADD TO CART
    // -------------------------
    addToCart(item) {
      // เก็บลง Vuex หรือ localStorage ก็ได้
      // ตัวนี้ผมทำเป็น Vuex action ชื่อ cart/addCart

      this.addCart({
        id: item.id,
        name: item.name,
        price: item.price,
        detail: item.detail,
        image_url: item.image_url || null,
        quantity: 1
      })

      alert(`เพิ่ม "${item.name}" ลงตะกร้าแล้ว!`)
    }
  }
}
</script>
