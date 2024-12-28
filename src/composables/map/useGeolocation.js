import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { detectDevice } from '@/utils/device'

export function useGeolocation(map) {
  const { t } = useI18n()
  const deviceInfo = detectDevice()
  
  const geolocation = ref(null)
  const lastPosition = ref(null)
  const gpsAccuracy = ref(null)
  const locationError = ref(null)
  const isLocating = ref(false)
  const positioningPromise = ref(null)

  // 清理定位资源
  const cleanupGeolocation = () => {
    // 取消正在进行的定位请求
    if (positioningPromise.value && typeof positioningPromise.value.cancel === 'function') {
      positioningPromise.value.cancel()
    }
    positioningPromise.value = null

    if (geolocation.value && map.value) {
      try {
        // 先停止定位
        if (typeof geolocation.value.stopWatch === 'function') {
          geolocation.value.stopWatch()
        }
        // 移除控件
        map.value.removeControl(geolocation.value)
      } catch (error) {
        console.error('清理定位控件失败:', error)
      }
      geolocation.value = null
    }
    lastPosition.value = null
    gpsAccuracy.value = null
    locationError.value = null
    isLocating.value = false
  }

  // 获取用户位置
  const getCurrentPosition = (showUI = false) => {
    // 如果已经在定位中，返回现有的 Promise
    if (positioningPromise.value) {
      return positioningPromise.value
    }

    // 创建一个可以被取消的 Promise
    let timeoutId
    let isCancelled = false
    let positionTimeoutId

    positioningPromise.value = new Promise((resolve, reject) => {
      if (!map.value) {
        positioningPromise.value = null
        reject(new Error('Map not initialized'))
        return
      }

      // 只在显示UI时设置定位状态
      if (showUI) {
        isLocating.value = true
        locationError.value = null
      }

      // 如果还没有创建定位插件，先创建
      if (!geolocation.value) {
        const geoOptions = {
          enableHighAccuracy: true,
          timeout: deviceInfo.isMobile ? 5000 : 3000,
          maximumAge: 0,
          convert: true,
          showButton: false,
          showMarker: false,
          showCircle: false,
          panToLocation: false,
          zoomToAccuracy: false,
          useNative: true,
          GeoLocationFirst: true,
          needTransform: true,
          extensions: 'all'
        }

        try {
          geolocation.value = new AMap.Geolocation(geoOptions)
          map.value.addControl(geolocation.value)
        } catch (error) {
          console.warn('创建定位插件失败:', error)
          positioningPromise.value = null
          reject(new Error('Map not initialized'))
          return
        }
      }

      // 设置定位超时
      timeoutId = setTimeout(() => {
        if (!isCancelled && positioningPromise.value) {
          clearTimeout(positionTimeoutId)
          positioningPromise.value = null
          if (showUI) {
            isLocating.value = false
          }
          console.warn('Location timeout')
          reject(new Error('Location timeout'))
        }
      }, deviceInfo.isMobile ? 10000 : 5000)

      // 高精度定位时尝试多次获取更准确的位置
      let attempts = 0
      const maxAttempts = showUI ? 2 : 1
      const tryGetPosition = () => {
        if (isCancelled) {
          clearTimeout(timeoutId)
          clearTimeout(positionTimeoutId)
          positioningPromise.value = null
          reject(new Error('Location request cancelled'))
          return
        }

        if (!geolocation.value || !map.value) {
          clearTimeout(timeoutId)
          clearTimeout(positionTimeoutId)
          positioningPromise.value = null
          reject(new Error('Map not initialized'))
          return
        }

        // 设置单次定位超时
        positionTimeoutId = setTimeout(() => {
          if (!isCancelled && attempts < maxAttempts - 1) {
            attempts++
            tryGetPosition()
          } else {
            clearTimeout(timeoutId)
            if (showUI) {
              isLocating.value = false
            }
            console.warn('Location timeout')
            positioningPromise.value = null
            reject(new Error('Location timeout'))
          }
        }, 5000)

        geolocation.value.getCurrentPosition((status, result) => {
          clearTimeout(positionTimeoutId)
          if (isCancelled) return

          if (status === 'complete') {
            const position = [result.position.lng, result.position.lat]
            const accuracy = result.accuracy

            // 高精度定位时，检查精度是否满足要求
            const accuracyThreshold = deviceInfo.isMobile ? 50 : 3000
            if (showUI && accuracy > accuracyThreshold && attempts < maxAttempts - 1) {
              attempts++
              setTimeout(tryGetPosition, 500)
              return
            }

            clearTimeout(timeoutId)
            if (showUI) {
              isLocating.value = false
            }
            positioningPromise.value = null
            resolve({ position, accuracy })
          } else {
            console.warn('定位失败:', result)
            if (attempts < maxAttempts - 1) {
              attempts++
              setTimeout(tryGetPosition, 500)
            } else {
              clearTimeout(timeoutId)
              if (showUI) {
                isLocating.value = false
              }
              positioningPromise.value = null
              reject(new Error(result.message))
            }
          }
        })
      }

      tryGetPosition()
    }).finally(() => {
      clearTimeout(timeoutId)
      clearTimeout(positionTimeoutId)
      if (isCancelled) {
        positioningPromise.value = null
      }
    })

    // 添加取消方法
    positioningPromise.value.cancel = () => {
      isCancelled = true
      clearTimeout(timeoutId)
      clearTimeout(positionTimeoutId)
      if (geolocation.value && typeof geolocation.value.stopWatch === 'function') {
        geolocation.value.stopWatch()
      }
      positioningPromise.value = null
    }

    return positioningPromise.value
  }

  // 验证坐标是否有效
  const isValidPosition = (position) => {
    if (!position || !Array.isArray(position) || position.length !== 2) return false
    const [lng, lat] = position
    return !isNaN(lng) && !isNaN(lat) && 
           lng >= -180 && lng <= 180 && 
           lat >= -90 && lat <= 90
  }

  // 计算位置是否可能是漂移
  const isPositionDrift = (newPosition, lastPosition, accuracy) => {
    if (!lastPosition) return false
    
    // 计算与上一��位置的距离（米）
    const distance = AMap.GeometryUtil.distance(newPosition, lastPosition)
    
    // 根据精度和时间间隔动态调整漂移判断
    const timeInterval = 5  // 5秒更新间隔
    const maxSpeed = 2      // 假设最大步行速度2米/秒
    const maxDistance = maxSpeed * timeInterval  // 最大合理移动距离
    
    // 当精度较高时，使用更严格的漂移判断
    if (accuracy <= 20) {
      return distance > Math.min(accuracy * 1.2, maxDistance)
    } else if (accuracy <= 50) {
      return distance > Math.min(accuracy * 0.8, maxDistance)
    } else {
      return distance > Math.min(accuracy * 0.5, maxDistance)
    }
  }

  // 根据精度计算信号强度（1-4格）- 基本精度圈大小判断，区分移动设备和电脑
  const getSignalStrength = (accuracy) => {
    if (!accuracy) return 0
    
    if (deviceInfo.isMobile) {
      // 移动设备使用更严格的精度要求
      if (accuracy <= 15) return 4  // 精度圈半径 ≤ 15米，信号极好
      if (accuracy <= 30) return 3  // 精度圈半径 ≤ 30米，信号良好
      if (accuracy <= 50) return 2  // 精度圈半径 ≤ 50米，信号一般
      if (accuracy <= 100) return 1 // 精度圈半径 ≤ 100米，信号较差
      return 0                      // 精度半径 > 100米信号很差
    } else {
      // 电脑用更宽松的精度要求
      if (accuracy <= 500) return 4   // 精度圈半径 ≤ 500米，信号极好
      if (accuracy <= 1000) return 3  // 精度圈半径 ≤ 1000米信号良好
      if (accuracy <= 2000) return 2  // 精度圈半径 ≤ 2000米信号一般
      if (accuracy <= 3000) return 1  // 精度圈半径 ≤ 3000米，信号较差
      return 0                        // 精度圈半径 > 3000米，信号很差
    }
  }

  // 根据信号强度获取颜色
  const getSignalColor = (strength) => {
    switch (strength) {
      case 4:
      case 3:
        return '#67C23A' // 绿色 - 信号好
      case 2:
        return '#E6A23C' // 橙色 - 信号一般
      case 1:
        return '#F56C6C' // 红色 - 信号差
      default:
        return '#909399' // 灰色 - 无信号
    }
  }

  // 获取信号状态文本
  const getSignalText = (strength) => {
    switch (strength) {
      case 4:
        return t('map.signalExcellent')
      case 3:
        return t('map.signalGood')
      case 2:
        return t('map.signalFair')
      case 1:
        return t('map.signalPoor')
      default:
        return t('map.signalNone')
    }
  }

  return {
    geolocation,
    lastPosition,
    gpsAccuracy,
    locationError,
    isLocating,
    getCurrentPosition,
    isValidPosition,
    isPositionDrift,
    getSignalStrength,
    getSignalColor,
    getSignalText,
    cleanupGeolocation
  }
} 