import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

export function useMarkers(map) {
  const { t } = useI18n()
  
  const currentUserMarker = ref(null)
  const accuracyCircle = ref(null)
  const positionHistory = ref([])
  const MAX_HISTORY_LENGTH = 3

  // 添加用户标记
  const addUserMarker = (position, user) => {
    if (!position || !Array.isArray(position) || position.length !== 2) {
      console.warn('添加标记失败: 无效的位置', position)
      return
    }

    try {
      // 计算标记尺寸
      const markerSize = Math.min(Math.max(window.innerWidth * 0.1, 40), 50)
      const halfSize = markerSize / 2

      // 创建自定义标记内容
      const markerContent = document.createElement('div')
      markerContent.className = 'custom-marker'
      markerContent.innerHTML = `
        <div class="avatar-marker" style="
          width: ${markerSize}px;
          height: ${markerSize}px;
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          background: #fff;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        ">
          <img src="${user.avatar}" 
               style="width: 100%; height: 100%; object-fit: cover;"
               onerror="this.src='/avatar-default.svg'"
          >
        </div>
      `

      // 创建标记
      const lngLat = new AMap.LngLat(position[0], position[1])
      currentUserMarker.value = new AMap.Marker({
        map: map.value,
        position: lngLat,
        content: markerContent,
        offset: new AMap.Pixel(0, 0),
        zIndex: 100,
        anchor: 'center'
      })

      return currentUserMarker.value
    } catch (error) {
      // 记录所有错误到控制台
      console.warn('创建标记失败:', error)
      return null
    }
  }

  // 获取平滑后的位置
  const getSmoothPosition = (newPosition) => {
    // 添加新位置到历史记录
    positionHistory.value.push(newPosition)
    
    // 保存历史记录在指定长度内
    if (positionHistory.value.length > MAX_HISTORY_LENGTH) {
      positionHistory.value.shift()
    }
    
    // 如果历史记录不足，直接返回新位置
    if (positionHistory.value.length < 2) {
      return newPosition
    }
    
    // 计算加权平均位置
    const weights = positionHistory.value.map((_, index) => index + 1)
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    
    const smoothedPosition = [0, 0]
    positionHistory.value.forEach((pos, index) => {
      const weight = weights[index] / totalWeight
      smoothedPosition[0] += pos[0] * weight
      smoothedPosition[1] += pos[1] * weight
    })
    
    return smoothedPosition
  }

  // 更新用户标记和精度圈
  const updateUserMarker = async (position, accuracy, user) => {
    if (!position || !Array.isArray(position) || position.length !== 2) {
      console.warn('无效的位置:', position)
      return
    }

    try {
      // 检查地图实例是否存在
      if (!map.value) {
        throw new Error('Map not initialized')
      }

      const lngLat = new AMap.LngLat(position[0], position[1])

      // 更新或创建标记
      if (!currentUserMarker.value) {
        addUserMarker(position, user)
      } else {
        currentUserMarker.value.setPosition(lngLat)
      }

      // 移除旧的精度圈和相关效果
      const clearOldEffects = () => {
        // 清理精度圈
        if (accuracyCircle.value) {
          accuracyCircle.value.setMap(null)
          accuracyCircle.value = null
        }
        
        // 清理所有已存在的雷达效果
        const oldRadars = document.querySelectorAll('.radar-container')
        oldRadars.forEach(radar => {
          // 移除事件监听器
          if (radar.moveHandler) {
            map.value.off('mapmove', radar.moveHandler)
          }
          if (radar.zoomHandler) {
            map.value.off('zoomchange', radar.zoomHandler)
          }
          radar.remove()
        })
      }

      // 清理旧效果
      clearOldEffects()

      // 创建新的精度圈（为雷达底圈）
      accuracyCircle.value = new AMap.Circle({
        center: lngLat,
        radius: accuracy,
        strokeColor: "rgba(24, 144, 255, 0.3)",
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: "rgba(24, 144, 255, 0.05)",
        fillOpacity: 0.3,
        zIndex: 50,
        bubble: true
      })
      accuracyCircle.value.setMap(map.value)

      // 创建雷达扫描效果
      const radarHTML = `
        <div class="radar-container">
          <div class="radar-sweep"></div>
          <div class="radar-circle"></div>
        </div>
      `
      const container = map.value.getContainer()
      container.insertAdjacentHTML('beforeend', radarHTML)
      
      const radarDiv = container.querySelector('.radar-container')
      
      // 更新雷达位置的函数
      const updateRadarPosition = () => {
        if (!map.value || !lngLat) return
        
        const pixel = map.value.lngLatToContainer(lngLat)
        const zoom = map.value.getZoom()
        const scale = Math.pow(2, zoom - 12)
        const size = accuracy * scale
        
        if (radarDiv) {
          radarDiv.style.left = `${pixel.x}px`
          radarDiv.style.top = `${pixel.y}px`
          radarDiv.style.width = `${size}px`
          radarDiv.style.height = `${size}px`
        }
      }

      // 初始更新位置
      updateRadarPosition()

      // 监听地图事件并移除旧的监听器
      const moveHandler = () => updateRadarPosition()
      const zoomHandler = () => updateRadarPosition()
      
      map.value.on('mapmove', moveHandler)
      map.value.on('zoomchange', zoomHandler)
      
      // 保存事件处理器引用以便后续清理
      radarDiv.moveHandler = moveHandler
      radarDiv.zoomHandler = zoomHandler

    } catch (error) {
      // 记录所有错误到控制台
      console.warn('更新位置失败:', error)

      // 清理资源
      if (accuracyCircle.value) {
        accuracyCircle.value.setMap(null)
        accuracyCircle.value = null
      }
      currentUserMarker.value = null

      // 如果不是地图未初始化的错误，尝试重新添加标记
      if (error.message !== 'Map not initialized' && 
          !error.message?.includes('mapNotRead')) {
        addUserMarker(position, user)
      }
    }
  }

  return {
    currentUserMarker,
    accuracyCircle,
    addUserMarker,
    updateUserMarker,
    getSmoothPosition
  }
} 