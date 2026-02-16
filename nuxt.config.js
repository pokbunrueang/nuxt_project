import colors from 'vuetify/es5/util/colors'

export default {
  // ปิด SSR เพื่อใช้โหมด Client-side
  ssr: false,

  target: 'static',

  head: {
    title: 'Manga Store',
    htmlAttrs: { lang: 'th' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  // ต้องระบุ modules ให้ครบเพื่อให้รู้จัก axios
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
  ],

  buildModules: [
    '@nuxtjs/vuetify',
  ],

  // ตั้งค่า baseURL ให้ชี้ไปที่โฟลเดอร์ api ของคุณ
  axios: {
    baseURL: 'http://localhost/api/', 
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  }
}