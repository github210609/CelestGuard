import { createI18n } from 'vue-i18n'
import zh from './locales/zh.js'
import en from './locales/en.js'
import ko from './locales/ko.js'
import ja from './locales/ja.js'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'zh',
  fallbackLocale: 'zh',
  messages: {
    zh,
    en,
    ko,
    ja
  }
})

export default i18n 