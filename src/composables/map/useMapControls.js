import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

export function useMapControls(map, { getCurrentPosition, isValidPosition, updateUserMarker }) {
  const { t } = useI18n()

  // 平滑移动到目标位置
  const smoothMoveToPosition = (targetPosition) => {
    if (!map.value || !targetPosition) return
    
    // 验证目标位置是否有效
    if (!isValidPosition(targetPosition)) {
      console.error('无效的目标位置:', targetPosition)
      return
    }

    // 获取当前地图中心点
    const currentCenter = map.value.getCenter()
    const currentPosition = [currentCenter.lng, currentCenter.lat]

    // 计算当前位置到目标位置之间的距离（米）
    const distance = AMap.GeometryUtil.distance(
      currentPosition,
      targetPosition
    )

    // 根据距离动态调整动画时间
    const duration = Math.min(Math.max(distance / 500 * 1000, 800), 2000)

    // 使用 panTo 方法平滑移动到目标位置
    map.value.panTo(targetPosition, {
      duration: duration,
      noAnimation: distance < 100  // 距离很近时不使用动画
    })
  }

  // 定位到用户位置
  const handleLocateClick = async (showUI = false) => {
    try {
      // 进行一次高精度定位
      const { position, accuracy } = await getCurrentPosition(showUI)
      
      // 验证位置是否有效
      if (!isValidPosition(position)) {
        throw new Error('Invalid position')
      }

      // 确保地图实例存在
      if (!map.value) {
        throw new Error('Map not initialized')
      }

      // 移动到目标位置并设置缩放级别
      const targetLngLat = new AMap.LngLat(position[0], position[1])
      
      // 只在显示UI时执行动画
      if (showUI) {
        try {
          // 先将地图缩放到更高的层级（云层视角）
          map.value.setZoom(4)
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // 设置中心点
          map.value.setCenter(targetLngLat)
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // 平滑缩放到目标级别
          const targetZoom = 16
          const duration = 2500
          const steps = 60
          const interval = duration / steps
          
          await new Promise((resolve, reject) => {
            let step = 0
            const currentZoom = map.value.getZoom()
            const zoomDiff = targetZoom - currentZoom
            
            const zoomIn = setInterval(() => {
              if (!map.value) {
                clearInterval(zoomIn)
                reject(new Error('Map not initialized'))
                return
              }

              step++
              const progress = step / steps
              const easeProgress = 1 - Math.pow(1 - progress, 4)
              const newZoom = currentZoom + (zoomDiff * easeProgress)
              
              map.value.setZoom(newZoom)
              
              if (step >= steps) {
                clearInterval(zoomIn)
                resolve()
              }
            }, interval)
          })
        } catch (error) {
          console.warn('地图动画失败:', error)
          // 如果动画失败，直接设置最终状态
          if (map.value) {
            map.value.setZoomAndCenter(16, targetLngLat)
          }
        }
      } else {
        // 静默模式下直接更新位置
        if (map.value) {
          map.value.setCenter(targetLngLat)
        }
      }

      // 更新用户标记和精度圈
      await updateUserMarker(position, accuracy)

      // 只在成功且显示UI时显示成功消息
      if (showUI) {
        ElMessage.success(t('map.locationSuccess'))
      }
      return { position, accuracy }
    } catch (error) {
      // 记录所有错误到控制台
      console.warn('定位失败:', error)

      // 定义不需要显示给用户的错误
      const silentErrors = [
        'Map not initialized',
        'Location request cancelled',
        'mapNotRead',
        'Location timeout',
        'Invalid position',
        'Position unavailable',
        'Permission denied',
        'Timeout expired'
      ]

      // 只在特定情况下显示错误消息
      if (showUI && !silentErrors.some(msg => error.message?.includes(msg))) {
        ElMessage.error(t('map.locationFailed'))
      }
      throw error
    }
  }

  return {
    smoothMoveToPosition,
    handleLocateClick
  }
} 