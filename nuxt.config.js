import colors from 'vuetify/es5/util/colors'

export default {
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

  // ใช้ dotenv โหลด .env
  modules: [
    '@nuxtjs/dotenv',
    '@nuxtjs/pwa'
  ],

  // แนะนำ: runtime config แทน env
  publicRuntimeConfig: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  },

  plugins: [
    '~/plugins/supabase.js'
  ],

  buildModules: [
    '@nuxtjs/vuetify'
  ],

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
  },

  build: {
    // Nuxt2 + supabase-js v1 ไม่ต้อง transpile
    transpile: []
  }
}
