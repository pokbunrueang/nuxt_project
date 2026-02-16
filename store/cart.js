// store/cart.js
export const state = () => ({
  productID: '',
  confirmedOrders: []
})

export const mutations = {
  SET_NEWS_CATE(state, payload) {
    state.productID = payload
  },
  ADD_CONFIRMED_ORDER(state, order) {
    state.confirmedOrders.push(order)
  },
  REMOVE_CONFIRMED_ORDER(state, index) {
    state.confirmedOrders.splice(index, 1)
  }
}