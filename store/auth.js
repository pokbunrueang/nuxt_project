export const state = () => ({
  user: null,
  profile: null
})

export const mutations = {
  SET_USER(state, user) {
    state.user = user
  },
  SET_PROFILE(state, profile) {
    state.profile = profile
  }
}

export const actions = {
  async fetchUser({ commit }) {
    const user = this.$supabase.auth.user()
    commit('SET_USER', user)

    if (!user) {
      commit('SET_PROFILE', null)
      return
    }

    // ดึง role จาก profiles
    const { data, error } = await this.$supabase
      .from('profiles')
      .select('id, user_name, username, role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('fetchUser profile error:', error)
      commit('SET_PROFILE', null)
      return
    }

    commit('SET_PROFILE', data)
  },

  async logout({ commit }) {
    await this.$supabase.auth.signOut()
    commit('SET_USER', null)
    commit('SET_PROFILE', null)
  }
}

export const getters = {
  isLoggedIn: (state) => !!state.user,
  isAdmin: (state) => state.profile?.role === 'admin'
}
