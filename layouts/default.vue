<template>
  <v-app dark>
    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      // ลบตัวแปรที่ไม่จำเป็นออกทั้งหมดเพื่อให้โค้ดสะอาด
    }
  }
}
</script>

<style scoped>
/* คุณสามารถเพิ่มสไตล์ส่วนกลางที่ต้องการให้มีผลทุกหน้าได้ที่นี่ */
</style>