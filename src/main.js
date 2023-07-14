import Vue from 'vue'
import App from './App.vue'
import store from "./store";
import VueRouter from "vue-router";
import vuetify from './plugins/vuetify';
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import routes from "./routes/routes";
import VueApexCharts from 'vue-apexcharts';
import { locale } from "./storage"
import { i18n, setLang } from "./locales/i18n"


const lang = locale.get() || 'zh-cn'
setLang(lang)

// configure router
const router = new VueRouter({
  mode: 'history',
  routes, // short for routes: routes
  linkExactActiveClass: "nav-item active"
});
Vue.use(VueRouter);
Vue.component('apex-chart', VueApexCharts)

Vue.config.productionTip = false

new Vue({
  vuetify,
  store,
  i18n,
  render: h => h(App),
  router
}).$mount('#app')
