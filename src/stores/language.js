import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/i18n'

export const useLanguageStore = defineStore('language', () => {
  const locale = ref(getInitialLocale())

  // 获取初始语言设置
  function getInitialLocale() {
    // 先尝试从 localStorage 获取
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale) {
      return savedLocale
    }

    // 获取浏览器语言设置
    const browserLang = navigator.language.toLowerCase()
    const supportedLocales = ['zh', 'en', 'ko', 'ja']
    
    // 检查是否完全匹配
    if (supportedLocales.includes(browserLang)) {
      return browserLang
    }

    // 检查语言代码前缀是否匹配（例如 zh-CN -> zh）
    const langPrefix = browserLang.split('-')[0]
    if (supportedLocales.includes(langPrefix)) {
      return langPrefix
    }

    // 默认使用英语
    return 'en'
  }

  // 设置语言
  async function setLocale(newLocale) {
    locale.value = newLocale
    i18n.global.locale.value = newLocale
    document.querySelector('html').setAttribute('lang', newLocale)
    localStorage.setItem('locale', newLocale)
  }

  return {
    locale,
    setLocale
  }
}) 