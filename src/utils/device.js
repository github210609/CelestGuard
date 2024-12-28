// 设备检测工具函数

/**
 * 检测设备类型和功能
 * @returns {Object} 设备信息对象
 */
export function detectDevice() {
  const userAgent = navigator.userAgent.toLowerCase()
  
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)
  const isIOS = /iphone|ipad|ipod/i.test(userAgent)
  const isAndroid = /android/i.test(userAgent)
  const isWechat = /micromessenger/i.test(userAgent)
  const isTablet = /ipad|tablet/i.test(userAgent)
  
  return {
    isMobile,
    isIOS,
    isAndroid,
    isWechat,
    isTablet,
    isDesktop: !isMobile && !isTablet
  }
}

/**
 * 获取设备性能等级
 * @returns {'high'|'medium'|'low'} 性能等级
 */
export const getDevicePerformance = () => {
  const { isMobile, isIOS, isAndroid } = detectDevice()
  
  // 检测设备内存
  const memory = navigator.deviceMemory || 4
  
  // 检测CPU核心数
  const cores = navigator.hardwareConcurrency || 4
  
  // 移动设备性能判断
  if (isMobile) {
    if (isIOS) {
      // iOS设备通常性能较好
      return 'high'
    }
    if (isAndroid) {
      // Android设备根据配置判断
      if (memory >= 4 && cores >= 8) return 'high'
      if (memory >= 2 && cores >= 4) return 'medium'
      return 'low'
    }
  }
  
  // 桌面设备性能判断
  if (memory >= 8 && cores >= 8) return 'high'
  if (memory >= 4 && cores >= 4) return 'medium'
  return 'low'
} 