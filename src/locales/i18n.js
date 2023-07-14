import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { locale } from "../storage"
import store from "../store"
import zh_cn from "./zh-cn.json"
import en from "./en.json"


Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: 'en',
  messages: {
    'zh-cn': {
      ...zh_cn
    },
    'en': {
      ...en
    }
  }
})

export const setLang = (lang) => {
  console.log(i18n, 'i18n')
  i18n.locale = lang
  store.commit('updateLocale', lang)
  locale.set(lang)
}

export const getLang = () => {
  return i18n && i18n.locale
}
