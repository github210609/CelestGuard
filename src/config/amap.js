// 高德地图配置
export const amapConfig = {
  key: import.meta.env.VITE_AMAP_KEY,
  securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
  version: '2.0',
  plugins: [
    'AMap.Scale',
    'AMap.Geolocation',
    'AMap.Icon'
  ]
}

// 初始化高德地图安全配置
export const initAMapSecurityConfig = () => {
  window._AMapSecurityConfig = {
    securityJsCode: amapConfig.securityJsCode
  }
}

// 动态加载高德地图脚本
export const loadAMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap)
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=${amapConfig.version}&key=${amapConfig.key}&plugin=${amapConfig.plugins.join(',')}`
    
    script.onerror = reject
    script.onload = () => {
      resolve(window.AMap)
    }

    document.head.appendChild(script)
  })
} 