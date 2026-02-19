<template>
  <v-container fluid class="bg-main pa-0 chat-page">
    <v-app-bar flat color="#0D0D0D" dark height="70" class="border-bottom px-4">
      <v-btn icon @click="$router.push('/')" color="white">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="font-weight-black primary--text">
        <v-icon color="primary" class="mr-2">mdi-chat-processing</v-icon>
        คุยกับแอดมิน
      </v-toolbar-title>
    </v-app-bar>

    <v-container class="pa-4 pt-6">
      <v-card dark class="card-dark border-light d-flex flex-column shadow-24" rounded="xl" height="82vh">
        
        <div class="chat-window pa-6 flex-grow-1 overflow-y-auto" ref="chatBox">
          
          <div v-for="(msg, index) in messages" :key="msg.id">
            <div v-if="isNewDay(index)" class="text-center my-6">
              <v-chip small color="grey darken-4" class="grey--text text--lighten-1 px-4 font-weight-medium">
                {{ formatDateHeader(msg.created_at) }}
              </v-chip>
            </div>

            <div :class="['d-flex mb-4', !msg.is_admin ? 'justify-end' : 'justify-start']">
              <div :class="['message-bubble pa-3 rounded-xl shadow-lg', !msg.is_admin ? 'bg-primary' : 'grey darken-3']">
                <div class="caption font-weight-bold primary--text text--lighten-4 mb-1" v-if="msg.is_admin">
                   แอดมิน MANGA STORE
                </div>
                
                <div class="white--text text-body-1">{{ msg.message }}</div>
                
                <div class="text-right grey--text text--lighten-2 mt-1" style="font-size: 0.65rem !important;">
                  {{ formatTime(msg.created_at) }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="messages.length === 0" class="text-center py-12 grey--text">
            <v-icon size="80" color="grey darken-3">mdi-chat-outline</v-icon>
            <div class="mt-4 text-h6 font-weight-light">ยังไม่มีประวัติการพูดคุย</div>
            <div class="caption">พิมพ์ข้อความเพื่อสอบถามแอดมินได้เลยค่ะ</div>
          </div>
        </div>

        <v-divider class="grey darken-3"></v-divider>

        <div class="pa-4 bg-dark-soft rounded-b-xl">
          <v-form @submit.prevent="sendMessage" class="d-flex align-center gap-2">
            <v-text-field
              v-model="newMessage"
              placeholder="สอบถามข้อมูล หรือแจ้งปัญหา..."
              outlined
              rounded
              dense
              hide-details
              class="flex-grow-1 custom-input"
              color="primary"
              background-color="black"
            ></v-text-field>
            <v-btn fab color="primary" small type="submit" :loading="sending" :disabled="!newMessage.trim()">
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </v-form>
        </div>
      </v-card>
    </v-container>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      newMessage: '',
      sending: false,
      userEmail: null,
      refreshTimer: null
    }
  },
  async mounted() {
    const user = this.$supabase.auth.user()
    if (!user) {
      this.$router.push('/login')
      return
    }
    this.userEmail = user.email
    await this.loadMessages()
    
    // ตั้งเวลาดึงข้อมูลใหม่อัตโนมัติ
    this.refreshTimer = setInterval(this.loadMessages, 3000)
  },
  beforeDestroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer)
  },
  methods: {
    async loadMessages() {
      const { data } = await this.$supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (data) this.messages = data
      this.scrollToBottom()
    },
    async sendMessage() {
      if (!this.newMessage.trim()) return
      this.sending = true
      try {
        const { error } = await this.$supabase.from('messages').insert([
          { 
            message: this.newMessage, 
            user_email: this.userEmail, 
            is_admin: false 
          }
        ])
        if (error) throw error
        this.newMessage = ''
        await this.loadMessages()
      } catch (e) {
        alert('เกิดข้อผิดพลาดในการส่งข้อความค่ะ')
      } finally { this.sending = false }
    },
    // ฟังก์ชันเช็คว่าต้องแสดงวันที่ใหม่ไหม
    isNewDay(index) {
      if (index === 0) return true
      const prevDate = new Date(this.messages[index - 1].created_at).toDateString()
      const currDate = new Date(this.messages[index].created_at).toDateString()
      return prevDate !== currDate
    },
    // ฟอร์แมตหัววันที่ (วัน เดือน ปี)
    formatDateHeader(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('th-TH', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    },
    // ฟอร์แมตเวลา
    formatTime(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chat = this.$refs.chatBox
        if (chat) chat.scrollTop = chat.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
.bg-main { background-color: #0d0d0d; min-height: 100vh; }
.card-dark { background-color: #161616 !important; border: 1px solid #282828 !important; }
.bg-dark-soft { background-color: #0a0a0a !important; }
.border-light { border: 1px solid #333 !important; }
.message-bubble { 
  max-width: 85%; 
  word-wrap: break-word;
  line-height: 1.4;
}
.chat-window { 
  scroll-behavior: smooth;
  background: radial-gradient(circle at center, #1a1a1a 0%, #0d0d0d 100%);
}
.chat-page { position: fixed; width: 100%; height: 100%; top: 0; left: 0; z-index: 100; overflow: hidden; }
.custom-input fieldset { border-radius: 24px !important; }
</style>