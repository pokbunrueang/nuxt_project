<template>
  <v-container fluid class="bg-main pa-0 chat-container shadow-24">
    <v-row no-gutters height="100vh">
      
      <v-col cols="12" md="4" lg="3" class="border-right border-light d-flex flex-column h-screen">
        <v-toolbar flat color="transparent" class="px-4 pt-4">
          <v-btn icon to="/admin/index_ad" color="white" class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title class="white--text font-weight-black">Messages</v-toolbar-title>
        </v-toolbar>

        <v-list class="bg-transparent mt-4 flex-grow-1 overflow-y-auto">
          <v-subheader class="grey--text text--lighten-1">LATEST CHATS</v-subheader>
          
          <v-list-item-group v-model="selectedUserIndex" color="primary">
            <v-list-item 
              v-for="userEmail in chatList" 
              :key="userEmail" 
              @click="selectUser(userEmail)"
              class="px-4 py-3 border-bottom-dark"
            >
              <v-list-item-avatar color="grey darken-3">
                <v-icon color="white">mdi-account</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="white--text font-weight-bold">
                  {{ userEmail }}
                </v-list-item-title>
                <v-list-item-subtitle class="grey--text caption text-truncate">
                  {{ getLastMessage(userEmail) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>

      <v-col cols="12" md="8" lg="9" class="d-flex flex-column h-screen">
        <template v-if="activeUser">
          <v-toolbar flat color="transparent" class="border-bottom border-light px-6">
            <v-list-item class="pa-0">
              <v-list-item-avatar color="primary">
                <v-icon dark>mdi-account</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="white--text font-weight-bold">{{ activeUser }}</v-list-item-title>
                <v-list-item-subtitle class="success--text caption">Online</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-toolbar>

          <div class="chat-window pa-6 flex-grow-1 overflow-y-auto" ref="chatBox">
            <div v-for="(msg, index) in currentChatMessages" :key="msg.id">
              
              <div v-if="isNewDay(index)" class="text-center my-6">
                <v-chip small color="grey darken-4" class="grey--text text--lighten-1 px-4">
                  {{ formatDateHeader(msg.created_at) }}
                </v-chip>
              </div>

              <div :class="['d-flex mb-4', msg.is_admin ? 'justify-end' : 'justify-start']">
                <div :class="['message-bubble pa-3 rounded-xl', msg.is_admin ? 'bg-primary' : 'grey darken-3']">
                  <div class="white--text text-body-1">{{ msg.message }}</div>
                  
                  <div class="text-right grey--text text--lighten-2 mt-1" style="font-size: 0.65rem">
                    {{ formatTime(msg.created_at) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pa-4 bg-dark-soft border-top border-light">
            <v-form @submit.prevent="sendMessage" class="d-flex align-center gap-4">
              <v-text-field
                v-model="newMessage"
                placeholder="ตอบกลับลูกค้า..."
                solo flat rounded hide-details
                background-color="grey darken-4"
                dark class="flex-grow-1"
              ></v-text-field>
              <v-btn fab color="primary" small type="submit" :loading="sending" :disabled="!newMessage.trim()">
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </v-form>
          </div>
        </template>

        <v-layout v-else fill-height align-center justify-center column class="grey--text">
          <v-icon size="100" color="grey darken-3">mdi-chat-question</v-icon>
          <div class="mt-4 text-h6 font-weight-light">เลือกบัญชีลูกค้าเพื่อเริ่มการสนทนา</div>
        </v-layout>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      allMessages: [],
      newMessage: '',
      sending: false,
      activeUser: null,
      selectedUserIndex: null,
      refreshTimer: null
    }
  },
  computed: {
    chatList() {
      const users = this.allMessages
        .filter(m => m.user_email !== 'Admin')
        .map(m => m.user_email)
      return [...new Set(users)]
    },
    currentChatMessages() {
      if (!this.activeUser) return []
      return this.allMessages.filter(m => 
        m.user_email === this.activeUser || (m.is_admin && m.target_email === this.activeUser)
      )
    }
  },
  async mounted() {
    await this.loadMessages()
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
      if (data) this.allMessages = data
      this.scrollToBottom()
    },
    selectUser(email) {
      this.activeUser = email
      this.scrollToBottom()
    },
    getLastMessage(email) {
      const userMsgs = this.allMessages.filter(m => m.user_email === email)
      return userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].message : ''
    },
    async sendMessage() {
      if (!this.newMessage.trim() || !this.activeUser) return
      this.sending = true
      try {
        // บันทึก Admin Message โดยอาจต้องระบุ target_email เพื่อให้แยกแชทได้แม่นยำขึ้นค่ะ
        const { error } = await this.$supabase.from('messages').insert([
          { 
            message: this.newMessage, 
            user_email: 'Admin', 
            target_email: this.activeUser, // 🚩 สำคัญสำหรับการแยกแชทฝั่งแอดมิน
            is_admin: true 
          }
        ])
        if (error) throw error
        this.newMessage = ''
        await this.loadMessages()
      } catch (e) {
        alert('ส่งไม่สำเร็จ: ' + e.message)
      } finally { this.sending = false }
    },
    // 🚩 ฟังก์ชันจัดการเรื่องวันและเวลา (ใส่รายละเอียดตามที่เธอขอ)
    isNewDay(index) {
      if (index === 0) return true
      const prevDate = new Date(this.currentChatMessages[index - 1].created_at).toDateString()
      const currDate = new Date(this.currentChatMessages[index].created_at).toDateString()
      return prevDate !== currDate
    },
    formatDateHeader(dateStr) {
      return new Date(dateStr).toLocaleDateString('th-TH', { 
        day: 'numeric', month: 'long', year: 'numeric' 
      })
    },
    formatTime(dateStr) {
      return new Date(dateStr).toLocaleTimeString('th-TH', { 
        hour: '2-digit', minute: '2-digit' 
      }) + ' น.'
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
/* สไตล์คงเดิมจากที่คุณชอบเลยค่ะ */
.bg-main { background-color: #0d0d0d; height: 100vh; overflow: hidden; }
.h-screen { height: 100vh; }
.border-right { border-right: 1px solid #222 !important; }
.border-bottom-dark { border-bottom: 1px solid #1a1a1a !important; }
.message-bubble { max-width: 75%; line-height: 1.5; }
.chat-window { background-color: #080808; scroll-behavior: smooth; }
.bg-dark-soft { background-color: #121212; }
.gap-4 { gap: 16px; }
</style>