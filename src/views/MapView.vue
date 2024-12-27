<template>
  <div class="map-container">
    <el-card class="map-card glass-effect">
      <div id="map-container" class="map-content"></div>
      
      <!-- GPS 信号指示器 -->
      <div class="gps-signal-indicator glass-effect">
        <div class="signal-bars">
          <div 
            v-for="i in 4" 
            :key="i"
            :class="[
              'signal-bar',
              { active: gpsAccuracy && getSignalStrength(gpsAccuracy) >= i }
            ]"
            :style="{
              backgroundColor: gpsAccuracy && getSignalStrength(gpsAccuracy) >= i 
                ? getSignalColor(getSignalStrength(gpsAccuracy))
                : 'rgba(0, 0, 0, 0.2)'
            }"
          ></div>
        </div>
        <span class="signal-text">{{ getSignalText(getSignalStrength(gpsAccuracy)) }}</span>
      </div>
    </el-card>
    
    <div class="map-controls">
      <div class="control-buttons">
        <el-button 
          type="primary" 
          circle 
          class="control-btn glass-effect"
          @click="showUserSelector"
          v-tooltip="t('map.selectUsers')"
        >
          <el-icon><User /></el-icon>
        </el-button>
      <el-button 
        type="primary" 
        circle 
          class="control-btn glass-effect"
        :size="locationButtonSize"
          @click="handleLocateClick"
          v-tooltip="t('map.locateMe')"
      >
        <el-icon><Aim /></el-icon>
      </el-button>
      </div>
    </div>

    <!-- 添加守护者信息卡片 -->
    <div class="guardian-info glass-effect" v-if="activeGuardian">
      <div class="guardian-header">
        <div class="guardian-basic">
          <el-avatar :size="40" :src="activeGuardian.avatar" />
          <div class="guardian-details">
            <span class="guardian-name">{{ activeGuardian.name }}</span>
            <span class="guardian-status">{{ t('userStatus.offline') }}</span>
          </div>
        </div>
        <el-button 
          type="primary" 
          size="small" 
          class="navigate-btn"
          :icon="Position"
        >
          {{ t('map.navigate') }}
        </el-button>
      </div>
      <div class="guardian-location">
        <el-icon><Location /></el-icon>
        <span>{{ activeGuardian.location }}</span>
      </div>
    </div>

    <!-- 用户选择对话框 -->
    <el-dialog
      v-model="userSelectorVisible"
      :title="t('map.selectUsers')"
      class="user-selector-dialog"
      width="90%"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      align-center
    >
      <div class="selected-users">
        <div 
          v-for="user in selectedUsers" 
          :key="user.id"
          class="user-item glass-effect"
        >
          <div class="user-info">
            <el-avatar :size="40" :src="user.avatar" />
            <div class="user-details">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-status">{{ t('userStatus.offline') }}</span>
            </div>
          </div>
          <el-button
            type="danger"
            circle
            size="small"
            class="remove-btn"
            @click="removeUser(user)"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <div class="add-user-btn glass-effect" @click="showFriendsList">
          <el-icon><Plus /></el-icon>
          <span>{{ t('friends.add') }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 好友列表对话框 -->
    <el-dialog
      v-model="friendsListVisible"
      :title="t('friends.search')"
      class="friends-list-dialog"
      width="90%"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      align-center
    >
      <el-scrollbar max-height="60vh">
        <div class="user-list">
          <div 
            v-for="user in availableFriends" 
            :key="user.id"
            class="user-item glass-effect"
            @click="addUser(user)"
          >
            <div class="user-info">
              <el-avatar :size="40" :src="user.avatar" />
              <div class="user-details">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-status">{{ t('userStatus.offline') }}</span>
              </div>
            </div>
            <el-icon class="add-icon"><Plus /></el-icon>
          </div>
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Aim, Location, Position, User, Plus, Close } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { initAMapSecurityConfig, loadAMapScript } from '@/config/amap'

const { t } = useI18n()
const route = useRoute()

// 地图相关
const map = ref(null)
const mapCenter = ref([116.397428, 39.909187])
const currentUserMarker = ref(null)
const geolocation = ref(null)
const locationTimer = ref(null)

// 当前用户信息
const currentUser = {
  avatar: '/avatar-default.png',
  name: '我'
}

// 初始化地图
const initMap = () => {
  map.value = new AMap.Map('map-container', {
    zoom: 16,
    center: mapCenter.value,
    resizeEnable: true,
    showIndoorMap: false,
    viewMode: '2D',
    showBuildingBlock: true,
    pitch: 0,
    mapStyle: 'amap://styles/whitesmoke'
  })

  // 只添加比例尺控件
  map.value.addControl(new AMap.Scale())
}

// 定位状态管理
const isLocating = ref(false)
const lastPosition = ref(null)
const locationError = ref(null)

// 根据精度计算信号强度（1-4格）- 提高精度要求
const getSignalStrength = (accuracy) => {
  if (!accuracy) return 0
  if (accuracy <= 10) return 4  // 非常精确 (≤10m)
  if (accuracy <= 25) return 3  // 较精确 (≤25m)
  if (accuracy <= 50) return 2  // 一般精确 (≤50m)
  if (accuracy <= 75) return 1  // 不太精确 (≤75m)
  return 0 // 信号很差或无信号
}

// 获取用户位置
const getCurrentPosition = (shouldMove = false) => {
  return new Promise((resolve, reject) => {
    if (!map.value) {
      reject(new Error(t('map.mapNotReady')))
      return
    }

    // 如果还没有创建定位插件创建
    if (!geolocation.value) {
      geolocation.value = new AMap.Geolocation({
        enableHighAccuracy: true,    // 启用高精度定位
        timeout: 5000,               // 缩短超时时间到5秒
        GeoLocationFirst: true,      // 优先使用浏览器定位
        zoomToAccuracy: false,       // 禁用自动缩放
        panToLocation: false,        // 禁止自动移动地图到定位点
        showButton: false,           // 禁用内置定位按钮
        showMarker: false,           // 禁用定位点
        showCircle: true,            // 始终显示精度圈
        convert: true,               // 自动偏移坐标
        circleOptions: {             // 自定义精度圈样式
          strokeColor: '#409EFF',
          strokeOpacity: 0.2,
          strokeWeight: 1,
          fillColor: '#409EFF',
          fillOpacity: 0.1
        }
      })
      map.value.addControl(geolocation.value)
    }

    geolocation.value.getCurrentPosition((status, result) => {
      if (status === 'complete') {
        const position = [result.position.lng, result.position.lat]
        lastPosition.value = position
        gpsAccuracy.value = result.accuracy
        locationError.value = null
        resolve({ position, accuracy: result.accuracy })
      } else {
        console.error('定位失败:', result)
        locationError.value = result
        reject(new Error(result.message))
      }
    })
  })
}

// 平滑移动到目标位置
const smoothMoveToPosition = (targetPosition, targetZoom = 16) => {
  if (!map.value || !targetPosition) return

  // 计算当前位置和目标位置之间的距离
  const currentCenter = map.value.getCenter()
  const distance = AMap.GeometryUtil.distance(
    [currentCenter.lng, currentCenter.lat],
    targetPosition
  )

  // 根据距离调整动画时间
  const duration = Math.min(Math.max(distance / 1000 * 800, 300), 1000) // 300ms到1000ms

  // 使用高德地图的平滑移动方法
  map.value.setZoomAndCenter(targetZoom, targetPosition, {
    duration: duration,
    delay: 0
  })
}

// 添加用户标记
const addUserMarker = (position) => {
  if (!position) return

  // 如果已存在标记，只更新位置
  if (currentUserMarker.value) {
    currentUserMarker.value.setPosition(position)
    return
  }

  // 计算标记尺寸（与CSS中的clamp值保持一致）
  const markerSize = Math.min(Math.max(window.innerWidth * 0.1, 40), 50)
  const halfSize = markerSize / 2

  // 创建自定义标记内容
  const markerContent = document.createElement('div')
  markerContent.className = 'custom-marker'
  markerContent.innerHTML = `
    <div class="avatar-marker" style="
      width: clamp(40px, 10vw, 50px);
      height: clamp(40px, 10vw, 50px);
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 
        0 2px 12px rgba(0, 0, 0, 0.15),
        0 0 6px rgba(0, 0, 0, 0.1),
        inset 0 0 10px rgba(255, 255, 255, 0.6);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: center bottom;
      background: #fff;
      cursor: pointer;
      position: relative;
    ">
      <div style="
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
        z-index: 2;
      "></div>
      <img src="${currentUser.avatar}" 
           style="
             width: 100%;
             height: 100%;
             object-fit: cover;
             transition: transform 0.3s ease;
           "
           onerror="this.src='/avatar-default.png'"
      >
      <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 15% 0 4px;
        background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
        color: #fff;
        font-size: clamp(10px, 2.5vw, 12px);
        text-align: center;
        transform: translateY(100%);
        transition: transform 0.3s ease;
      ">${currentUser.name}</div>
    </div>
  `

  // 添加悬停效果
  const avatarMarker = markerContent.querySelector('.avatar-marker')
  if (avatarMarker) {
    avatarMarker.addEventListener('mouseenter', () => {
      avatarMarker.style.transform = 'scale(1.1)'
      const nameTag = avatarMarker.querySelector('div:last-child')
      if (nameTag) {
        nameTag.style.transform = 'translateY(0)'
      }
    })
    avatarMarker.addEventListener('mouseleave', () => {
      avatarMarker.style.transform = 'scale(1)'
      const nameTag = avatarMarker.querySelector('div:last-child')
      if (nameTag) {
        nameTag.style.transform = 'translateY(100%)'
      }
    })
  }

  // 创建新标记
  currentUserMarker.value = new AMap.Marker({
    position,
    content: markerContent,
    offset: new AMap.Pixel(-halfSize, -halfSize),  // 动态计算偏移量
    zIndex: 100,
    animation: 'AMAP_ANIMATION_DROP'
  })

  // 将标记添加到地图
  map.value.add(currentUserMarker.value)
}

// 定位到用户位置
const handleLocateClick = async () => {
  if (isLocating.value) return
  
  try {
    isLocating.value = true
    const { position, accuracy } = await getCurrentPosition()
    
    // 根据精度自动调整缩放级别
    let zoom = 16
    if (accuracy > 1000) {
      zoom = 12
    } else if (accuracy > 500) {
      zoom = 13
    } else if (accuracy > 200) {
      zoom = 14
    } else if (accuracy > 100) {
      zoom = 15
    }
    
    // 手动点击时，平滑移动到用户位置
    smoothMoveToPosition(position, zoom)
    addUserMarker(position)
    ElMessage.success(t('map.locationSuccess'))
  } catch (error) {
    console.error('定位失败:', error)
    ElMessage.error(error.message || t('map.locationFailed'))
  } finally {
    isLocating.value = false
  }
}

// 开始定时更新位置
const startLocationUpdate = () => {
  // 先清除可能存在的定时器
  if (locationTimer.value) {
    clearInterval(locationTimer.value)
  }
  
  // 创建新的定时器，每5秒更新一次位置
  locationTimer.value = setInterval(async () => {
    try {
      const { position } = await getCurrentPosition()
      // 只更新标记位置，不移动地��
      if (currentUserMarker.value) {
        currentUserMarker.value.setPosition(position)
      } else {
        addUserMarker(position)
      }
    } catch (error) {
      console.error('自动更新位置失败:', error)
    }
  }, 5000)
}

// 监听定位状态
watch(isLocating, (newValue) => {
  // 更新定位按钮状态
  const locateButton = document.querySelector('.control-btn')
  if (locateButton) {
    if (newValue) {
      locateButton.classList.add('is-loading')
    } else {
      locateButton.classList.remove('is-loading')
    }
  }
})

// 组件挂载时初始化
onMounted(async () => {
  try {
    initAMapSecurityConfig()
    await loadAMapScript()
    initMap()
    
    // 等待地图加载完成后再进行定位
    map.value.on('complete', async () => {
      const { position, accuracy } = await getCurrentPosition()
      // 首次加载时，移动到用户位置
      let zoom = 16
      if (accuracy > 1000) {
        zoom = 12
      } else if (accuracy > 500) {
        zoom = 13
      } else if (accuracy > 200) {
        zoom = 14
      } else if (accuracy > 100) {
        zoom = 15
      }
      map.value.setZoomAndCenter(zoom, position)
      addUserMarker(position)
      startLocationUpdate()  // 开始定时更新
    })
  } catch (error) {
    console.error('Failed to initialize map:', error)
    ElMessage.error(t('map.loadFailed'))
  }
})

// 组件卸载时清理
onUnmounted(() => {
  // 清除定时器
  if (locationTimer.value) {
    clearInterval(locationTimer.value)
    locationTimer.value = null
  }
  
  if (map.value) {
    if (geolocation.value) {
      map.value.removeControl(geolocation.value)
    }
    map.value.destroy()
  }
})

const windowHeight = ref(window.innerHeight)
const activeGuardian = ref(null)
const userSelectorVisible = ref(false)
const friendsListVisible = ref(false)

const locationButtonSize = computed(() => {
  if (windowHeight.value <= 480) return 'default'
  return 'large'
})

// 用户选择相关
const showUserSelector = () => {
  userSelectorVisible.value = true
}

const showFriendsList = () => {
  friendsListVisible.value = true
}

// 已选择的用户表
const selectedUsers = ref([])

// 好友数据
const friendsData = ref({
  '1': {
    id: '1',
    name: '张三',
    status: 'offline',
    avatar: '/avatar-default.png',
    location: '湖北省武汉市洪山区珞瑜路',
    color: '#5B6BF9'
  },
  '2': {
    id: '2',
    name: '李四',
    status: 'offline',
    avatar: '/avatar-default.png',
    location: '上海市浦东新区陆家嘴',
    color: '#FF7D6B'
  }
})

// 可用好友列表（排除已选择的）
const availableFriends = computed(() => {
  return Object.values(friendsData.value).filter(
    friend => !selectedUsers.value.some(selected => selected.id === friend.id)
  )
})

// 添加用户
const addUser = (user) => {
  selectedUsers.value.push(user)
  friendsListVisible.value = false
}

// 移除用户
const removeUser = (user) => {
  const index = selectedUsers.value.findIndex(selected => selected.id === user.id)
  if (index !== -1) {
    selectedUsers.value.splice(index, 1)
  }
}

// 监听路由参数变化
watch(
  () => route.query,
  (query) => {
    if (query.friendId) {
      activeGuardian.value = friendsData.value[query.friendId] || null
    } else {
      activeGuardian.value = null
    }
  },
  { immediate: true }
)

// GPS 相关状态
const gpsAccuracy = ref(null)

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
</script>

<style scoped>
.map-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  padding: clamp(16px, 4vw, 32px);
  overflow: hidden;
  background: linear-gradient(135deg, #f0f5ff 0%, #f7ffef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-card {
  width: 100%;
  height: 100%;
  max-width: 1440px;
  margin: 0 auto;
  border-radius: var(--theme-radius);
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 24px rgba(91, 107, 249, 0.1),
    0 1px 2px rgba(91, 107, 249, 0.08);
  transition: all 0.3s ease;
}

.map-card:hover {
  border-color: rgba(91, 107, 249, 0.3);
  box-shadow: 
    0 8px 32px rgba(91, 107, 249, 0.15),
    0 2px 4px rgba(91, 107, 249, 0.1);
  transform: translateY(-2px);
}

.map-card :deep(.el-card__body) {
  height: 100%;
  padding: clamp(16px, 3vw, 24px);
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(16px, 4vw, 24px);
  color: var(--el-text-color-secondary);
  background: linear-gradient(135deg, rgba(240, 245, 255, 0.5) 0%, rgba(247, 255, 239, 0.5) 100%);
  border-radius: calc(var(--theme-radius) - 8px);
  border: 2px dashed rgba(91, 107, 249, 0.2);
}

@media (max-width: 768px) {
  .map-container {
    padding: 12px;
  }
  
  .map-card {
    border-radius: calc(var(--theme-radius) - 4px);
  }
}

.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: var(--theme-shadow);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.map-controls {
  position: fixed;
  right: clamp(12px, 3vw, 20px);
  bottom: calc(var(--footer-height) + clamp(12px, 3vw, 20px));
  z-index: 100;
}

.location-btn {
  width: clamp(44px, 11vw, 52px) !important;
  height: clamp(44px, 11vw, 52px) !important;
  background: var(--theme-gradient) !important;
  border: none !important;
  transition: all 0.3s ease;
}

.location-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.location-btn:active {
  transform: scale(0.95);
}

.location-btn .el-icon {
  font-size: clamp(20px, 5vw, 24px);
}

/* 守护者信息片 */
.guardian-info {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(var(--footer-height) + 20px);
  width: clamp(280px, 90%, 400px);
  padding: 16px;
  border-radius: var(--theme-radius);
  z-index: 100;
}

.guardian-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.guardian-basic {
  display: flex;
  align-items: center;
  gap: 12px;
}

.guardian-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.guardian-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.guardian-status {
  font-size: 12px;
  color: var(--theme-secondary);
}

.navigate-btn {
  background: var(--theme-gradient) !important;
  border: none !important;
}

.guardian-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

@media (max-width: 768px) {
  .guardian-info {
    padding: 12px;
  }
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-btn {
  width: clamp(44px, 11vw, 52px) !important;
  height: clamp(44px, 11vw, 52px) !important;
  background: var(--theme-gradient) !important;
  border: none !important;
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.control-btn:active {
  transform: scale(0.95);
}

.control-btn .el-icon {
  font-size: clamp(20px, 5vw, 24px);
}

/* 用户选择对话框样式 */
:deep(.user-selector-dialog) {
  border-radius: var(--theme-radius);
  max-width: 480px;
}

:deep(.user-selector-dialog .el-dialog__header) {
  padding: 20px 20px 10px;
  margin: 0;
  text-align: center;
}

:deep(.user-selector-dialog .el-dialog__body) {
  padding: 20px;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: var(--theme-radius);
  transition: all 0.3s ease;
}

.user-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 107, 249, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--theme-text-primary);
}

.user-status {
  font-size: 12px;
  color: var(--theme-text-secondary);
}

@media (max-width: 480px) {
  :deep(.user-selector-dialog) {
    width: 90%;
  }

  .user-item {
    padding: 10px;
  }

  .user-name {
    font-size: 14px;
  }
}

.selected-users {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-user-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: var(--theme-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--theme-primary);
}

.add-user-btn:hover {
  transform: translateY(-2px);
  background: rgba(91, 107, 249, 0.1);
}

.add-user-btn .el-icon {
  font-size: 20px;
}

.remove-btn {
  background: transparent !important;
  border: none !important;
  padding: 8px !important;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  color: var(--el-color-danger) !important;
  transform: scale(1.1);
}

.add-icon {
  font-size: 20px;
  color: var(--theme-primary);
  transition: all 0.3s ease;
}

.user-item:hover .add-icon {
  transform: scale(1.2);
}

:deep(.friends-list-dialog) {
  border-radius: var(--theme-radius);
  max-width: 480px;
}

:deep(.friends-list-dialog .el-dialog__header) {
  padding: 20px 20px 10px;
  margin: 0;
  text-align: center;
}

:deep(.friends-list-dialog .el-dialog__body) {
  padding: 20px;
}

.user-item {
  cursor: pointer;
}

/* 修改地图容器样式 */
.map-content {
  width: 100%;
  height: 100%;
  border-radius: calc(var(--theme-radius) - 8px);
  overflow: hidden;
}

/* 标记式 */
:deep(.marker-label) {
  padding: 4px 8px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  border: 1px solid var(--theme-primary);
  color: var(--theme-primary);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

:deep(.amap-marker img) {
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.amap-marker:hover img) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* GPS 信号指示器样式 */
.gps-signal-indicator {
  position: absolute;
  top: clamp(24px, 5vw, 32px);
  left: clamp(24px, 5vw, 32px);
  padding: 8px 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
  opacity: 0.9;
}

.gps-signal-indicator:hover {
  background: rgba(255, 255, 255, 0.95);
  opacity: 1;
  transform: translateY(1px) translateZ(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.signal-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  padding: 2px;
}

.signal-bar {
  width: 3px;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 1.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.signal-bar:nth-child(1) {
  height: 25%;
}

.signal-bar:nth-child(2) {
  height: 50%;
}

.signal-bar:nth-child(3) {
  height: 75%;
}

.signal-bar:nth-child(4) {
  height: 100%;
}

.signal-text {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.75);
  white-space: nowrap;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: -0.2px;
}

@media (max-width: 480px) {
  .gps-signal-indicator {
    padding: 6px 12px;
    border-radius: 14px;
  }
  
  .signal-bars {
    height: 14px;
    gap: 1.5px;
  }
  
  .signal-bar {
    width: 2.5px;
  }
  
  .signal-text {
    font-size: 12px;
  }
}

/* 自定义标记样式 */
.custom-marker {
  position: relative;
}

.avatar-marker {
  transition: transform 0.3s ease;
}

.avatar-marker:hover {
  transform: scale(1.1);
}

.avatar-marker img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 定位按钮加载状态 */
.control-btn.is-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.8;
}

.control-btn.is-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: button-loading 0.8s infinite linear;
}

@keyframes button-loading {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 优化标记动画 */
.avatar-marker {
  transform-origin: center bottom;
  animation: marker-bounce 0.3s ease-out;
}

@keyframes marker-bounce {
  0% {
    transform: translateY(-20px) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translateY(5px) scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style> 