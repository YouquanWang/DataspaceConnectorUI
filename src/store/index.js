import { createStore } from "vuex";
import { locale } from "@/storage"

export default createStore({
  state: {
    locale: locale.get(),
  },
  mutations: {
    updateLocale(state, value) {
      state.locale = value;
    }
  },
  actions: {},
  modules: {}
});
