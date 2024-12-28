// 高德地图 Web API 密钥
const API_KEY = import.meta.env.VITE_AMAP_KEY

// 安全密钥
const SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE

// 初始化安全配置
export function initAMapSecurityConfig() {
  window._AMapSecurityConfig = {
    securityJsCode: SECURITY_CODE,
    serviceHost: import.meta.env.VITE_AMAP_SERVICE_HOST || 
      `https://restapi.amap.com`
  }
}

// 加载高德地图脚本
export function loadAMapScript() {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap)
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${API_KEY}&plugin=AMap.Scale,AMap.Geolocation,AMap.GeometryUtil`
    
    script.onerror = reject
    script.onload = () => {
      resolve(window.AMap)
    }

    document.head.appendChild(script)
  })
} 