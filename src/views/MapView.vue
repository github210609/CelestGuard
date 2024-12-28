<template>
  <div class="map-container">
    <el-card class="map-card glass-effect">
      <div 
        id="map-container" 
        class="map-content"
        :class="{ visible: mapVisible }"
      ></div>
      
      <!-- 定位遮罩层 -->
      <LocationMask 
        v-if="showLocationMask"
        :fade-out="locationMaskFadeOut"
        class="location-mask"
      />

      <!-- GPS 信号指示器 -->
      <GPSSignalIndicator
        :accuracy="gpsAccuracy"
        :get-signal-strength="getSignalStrength"
        :get-signal-color="getSignalColor"
        :get-signal-text="getSignalText"
        class="gps-indicator"
      />
    </el-card>
    
    <!-- 地图控制按钮 -->
    <MapControls
      :is-locating="isLocating"
      @locate="handleLocateButtonClick"
      @show-users="showUserSelector"
      class="map-controls"
    />

    <!-- 守护者信息卡片 -->
    <GuardianInfo
      v-if="activeGuardian"
      :guardian="activeGuardian"
      class="guardian-info"
    />

    <!-- 用户选择对话框 -->
    <UserSelector
      v-model:visible="userSelectorVisible"
      :selected-users="selectedUsers"
      @add="showFriendsList"
      @remove="removeUser"
    />

    <!-- 好友列表对话框 -->
    <FriendsList
      v-model:visible="friendsListVisible"
      :available-friends="availableFriends"
      @select="addUser"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ElMessage } from 'element-plus'
import { initAMapSecurityConfig, loadAMapScript } from '@/config/amap'
import { useI18n } from 'vue-i18n'

// 导入组件
import LocationMask from '@/components/map/LocationMask.vue'
import GPSSignalIndicator from '@/components/map/GPSSignalIndicator.vue'
import MapControls from '@/components/map/MapControls.vue'
import GuardianInfo from '@/components/map/GuardianInfo.vue'
import UserSelector from '@/components/map/UserSelector.vue'
import FriendsList from '@/components/map/FriendsList.vue'

// 导入组合式函数
import { useGeolocation } from '@/composables/map/useGeolocation'
import { useMapControls } from '@/composables/map/useMapControls'
import { useMarkers } from '@/composables/map/useMarkers'

const route = useRoute()
const { t } = useI18n()
const userMarkers = new Map()

// 地图相关
const map = ref(null)
const mapCenter = ref([116.397428, 39.909187])
const mapVisible = ref(false)

// 当前用户信息
const currentUser = {
  avatar: '/avatar-default.svg',
  name: '我'
}

// 使用组合式函数
const {
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
  getSignalText
} = useGeolocation(map)

const {
  currentUserMarker,
  accuracyCircle,
  addUserMarker,
  updateUserMarker,
  getSmoothPosition
} = useMarkers(map)

const {
  smoothMoveToPosition,
  handleLocateClick
} = useMapControls(map, {
  getCurrentPosition,
  isValidPosition,
  updateUserMarker: (position, accuracy) => updateUserMarker(position, accuracy, currentUser)
})

// 用户选择相关
const userSelectorVisible = ref(false)
const friendsListVisible = ref(false)
const selectedUsers = ref([])
const activeGuardian = ref(null)

// 好友数据
const friendsData = ref({
  '1': {
    id: '1',
    name: '张三',
    status: 'offline',
    avatar: '/avatar-default.svg',
    location: '湖北省武汉市洪山区珞瑜路',
    color: '#5B6BF9'
  },
  '2': {
    id: '2',
    name: '李四',
    status: 'offline',
    avatar: '/avatar-default.svg',
    location: '上海市浦东新区陆��嘴',
    color: '#FF7D6B'
  }
})

// 可�������好友列表（排除选择的）
const availableFriends = computed(() => {
  return Object.values(friendsData.value).filter(
    friend => !selectedUsers.value.some(selected => selected.id === friend.id)
  )
})

// 用户选择相关方法
const showUserSelector = () => {
  userSelectorVisible.value = true
}

const showFriendsList = () => {
  friendsListVisible.value = true
}

const addUser = (user) => {
  selectedUsers.value.push(user)
  friendsListVisible.value = false
}

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

// 定位更新定时器
let locationUpdateTimer = null
let cleanupFunction = null

// 修改定位更新函数
const startLocationUpdate = () => {
  // 先清理之前的更新
  if (cleanupFunction) {
    cleanupFunction()
    cleanupFunction = null
  }
  if (locationUpdateTimer) {
    clearInterval(locationUpdateTimer)
    locationUpdateTimer = null
  }

  let consecutiveErrors = 0
  const maxConsecutiveErrors = 3
  let isDestroyed = false

  const updatePosition = async () => {
    // 检查地图是否存在且可见，以及是否在路由切换中
    if (isDestroyed || !map.value || !mapVisible.value || mapState.value.isRouteChanging || mapState.value.isDestroying) {
      return
    }

    try {
      const { position, accuracy } = await getCurrentPosition(false)
      // 再次检查状态
      if (isDestroyed || !map.value || !mapVisible.value || mapState.value.isRouteChanging || mapState.value.isDestroying) {
        return
      }

      if (isValidPosition(position)) {
        consecutiveErrors = 0
        gpsAccuracy.value = accuracy
        if (!isPositionDrift(position, lastPosition.value, accuracy)) {
          lastPosition.value = position
          // 再次检查地图状态
          if (!map.value || mapState.value.isRouteChanging || mapState.value.isDestroying) {
            return
          }
          await updateUserMarker(position, accuracy, currentUser)
        }
      }
    } catch (error) {
      // 忽略 mapNotRead 错误和路由切换时的错误
      if (!error.message?.includes('mapNotRead') && 
          !mapState.value.isRouteChanging && 
          !mapState.value.isDestroying) {
        console.warn('Position update failed:', error)
        consecutiveErrors++
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          if (locationUpdateTimer) {
            clearInterval(locationUpdateTimer)
            locationUpdateTimer = null
          }
        }
      }
    }
  }

  // 立即执行一次更新
  updatePosition()

  // 设置定时更新
  locationUpdateTimer = setInterval(updatePosition, 5000)

  // 返回清理函数
  cleanupFunction = () => {
    isDestroyed = true
    if (locationUpdateTimer) {
      clearInterval(locationUpdateTimer)
      locationUpdateTimer = null
    }
  }

  return cleanupFunction
}

// 修改地图状态管理
const mapState = ref({
  isInitialized: false,
  isDestroying: false,
  initPromise: null,
  isRouteChanging: false // 添加路由切换状态标记
})

// 修改初始化地图函数
const initMap = async () => {
  // 如果正在销毁或路由切换中，不允许初始化
  if (mapState.value.isDestroying || mapState.value.isRouteChanging) {
    return Promise.reject(new Error('Map initialization cancelled'))
  }

  // 如果已经在初始化中，返回现有的 Promise
  if (mapState.value.initPromise) {
    return mapState.value.initPromise
  }

  mapState.value.initPromise = new Promise(async (resolve, reject) => {
    try {
      // 确保地图容器存在
      await nextTick()  // 等待 DOM 更新
      const container = document.getElementById('map-container')
      if (!container) {
        throw new Error('Map container not found')
      }

      // 检查是否已被取消
      if (mapState.value.isDestroying || mapState.value.isRouteChanging) {
        throw new Error('Map initialization cancelled')
      }

      // 创建地图实例
      map.value = new AMap.Map('map-container', {
        zoom: 4,
        center: mapCenter.value,
        resizeEnable: true,
        showIndoorMap: false,
        viewMode: '2D',
        showBuildingBlock: true,
        pitch: 0,
        mapStyle: 'amap://styles/whitesmoke'
      })

      // 等待地图加载完成
      await new Promise((resolveMap, rejectMap) => {
        let timeout = setTimeout(() => {
          rejectMap(new Error('Map initialization timeout'))
        }, 10000)  // 10秒超时

        const completeHandler = () => {
          clearTimeout(timeout)
          map.value?.off('complete', completeHandler)
          map.value?.off('error', errorHandler)
          resolveMap()
        }
        
        const errorHandler = (error) => {
          clearTimeout(timeout)
          map.value?.off('complete', completeHandler)
          map.value?.off('error', errorHandler)
          rejectMap(error)
        }

        map.value.on('complete', completeHandler)
        map.value.on('error', errorHandler)
      })

      // 如果在等待过程中发生了路由切换，直接取消初始化
      if (mapState.value.isRouteChanging || mapState.value.isDestroying) {
        throw new Error('Map initialization cancelled')
      }

      // 标记初始化完成
      mapState.value.isInitialized = true
      mapVisible.value = true

      resolve()
    } catch (error) {
      mapState.value.isInitialized = false
      mapVisible.value = false
      if (map.value) {
        try {
          map.value.destroy()
        } catch (e) {
          console.warn('Failed to destroy map on error:', e)
        }
        map.value = null
      }
      // 只在非取消状态下记录错误
      if (error.message !== 'Map initialization cancelled') {
        console.warn('Map initialization failed:', error)
      }
      reject(error)
    } finally {
      mapState.value.initPromise = null
    }
  })

  return mapState.value.initPromise
}

// 修改清理函数
const cleanup = async () => {
  // 标记正在销毁
  mapState.value.isDestroying = true

  try {
    // 立即重置所有状态
    mapVisible.value = false
    showLocationMask.value = false
    locationMaskFadeOut.value = false
    userSelectorVisible.value = false
    friendsListVisible.value = false
    selectedUsers.value = []
    activeGuardian.value = null

    // 停止定位更新
    if (cleanupFunction) {
      cleanupFunction()
      cleanupFunction = null
    }

    // 等待一个微任务周期，确保其他异步操作有机会完成
    await Promise.resolve()

    // 清理地图资源
    if (map.value) {
      try {
        // 立即停止所有操作
        map.value.setStatus({
          animateEnable: false,
          dragEnable: false,
          zoomEnable: false,
          doubleClickZoom: false,
          keyboardEnable: false,
          scrollWheel: false
        })

        // 移除所有事件监听器和覆盖物
        map.value.clearMap()
        
        // 销毁地图实例
        map.value.destroy()
      } catch (error) {
        console.warn('Failed to cleanup map:', error)
      }
    }
  } finally {
    // 确保状态被重置
    map.value = null
    mapState.value.isInitialized = false
    mapState.value.isDestroying = false
    mapState.value.initPromise = null
  }
}

// 修改路由离开守卫
onBeforeRouteLeave((to, from, next) => {
  mapState.value.isRouteChanging = true
  
  // 立即重置可见性状态
  mapVisible.value = false
  showLocationMask.value = false
  
  // 执行清理
  cleanup()
    .catch(error => {
      console.warn('Cleanup failed during route change:', error)
    })
    .finally(() => {
      mapState.value.isRouteChanging = false
      next()
    })
})

// 修改组件卸载钩子
onUnmounted(() => {
  cleanup().catch(error => {
    console.warn('Cleanup failed during unmount:', error)
  })
})

// 修改组件挂载钩子
onMounted(async () => {
  let isCancelled = false

  try {
    if (!mapState.value.isRouteChanging) {
      initAMapSecurityConfig()
      await loadAMapScript()

      if (isCancelled || mapState.value.isRouteChanging) return

      try {
        await initMap()
      } catch (error) {
        if (error.message === 'Map initialization cancelled') return
        // 不显示错误消息，只记录日志
        console.warn('Map initialization error:', error)
      }

      if (isCancelled || mapState.value.isRouteChanging) return

      if (map.value && mapState.value.isInitialized) {
        locationMaskFadeOut.value = false
        showLocationMask.value = true
        
        try {
          await handleLocateClick(true)
          
          if (isCancelled || mapState.value.isRouteChanging) return
          
          locationMaskFadeOut.value = true
          showLocationMask.value = false
          
          cleanupFunction = startLocationUpdate()
        } catch (error) {
          // 不显示错误消息，只记录日志
          if (!isCancelled && !mapState.value.isRouteChanging) {
            console.warn('Initial location error:', error)
          }
          locationMaskFadeOut.value = true
          showLocationMask.value = false
        }
      }
    }
  } catch (error) {
    if (!isCancelled && !mapState.value.isRouteChanging) {
      console.warn('Mount error:', error)
    }
  }

  return () => {
    isCancelled = true
  }
})

// 修改定位按钮点击处理函数
const handleLocateButtonClick = async () => {
  // 检查地图状态
  if (!map.value || !mapState.value.isInitialized || mapState.value.isDestroying || mapState.value.isLocating) {
    return
  }

  try {
    mapState.value.isLocating = true
    locationMaskFadeOut.value = false
    showLocationMask.value = true
    
    const locatePromise = handleLocateClick(true)
    mapState.value.locationPromise = locatePromise

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Location timeout')), 10000)
    })

    const result = await Promise.race([
      locatePromise,
      timeoutPromise
    ])
    
    // 检查地图状态和路由状态
    if (!map.value || !mapState.value.isInitialized || mapState.value.isDestroying || mapState.value.isRouteChanging) {
      return
    }

    locationMaskFadeOut.value = true
    showLocationMask.value = false
    
    return result
  } catch (error) {
    // 只记录到控制台，不显示给用户
    console.warn('Location error:', error)
  } finally {
    mapState.value.isLocating = false
    mapState.value.locationPromise = null
    locationMaskFadeOut.value = true
    showLocationMask.value = false
  }
}

// 遮罩控制状态
const showLocationMask = ref(true) // 控制遮罩显示
const locationMaskFadeOut = ref(false) // 控制遮罩淡出

// 错误处理函数
const handleMapError = (error, type = 'general') => {
  // 记录所有错误到控制台
  console.warn(`Map error (${type}):`, error)

  // 定义用户不需要看到的错误
  const silentErrors = [
    'mapNotRead',
    'Map not initialized',
    'Map initialization cancelled',
    'Location request cancelled',
    'Location timeout',
    'timeout',
    'cancelled',
    'destroyed',
    'Component is being destroyed',
    'Position unavailable',
    'Permission denied',
    'Timeout expired'
  ]

  // 检查是否需要显示错误消息
  const shouldShowError = () => {
    // 如果正在销毁或路由切换中，不显示错误
    if (mapState.value.isDestroying || mapState.value.isRouteChanging) {
      return false
    }

    // 如果是静默错误，不显示
    if (silentErrors.some(msg => error.message?.toLowerCase().includes(msg.toLowerCase()))) {
      return false
    }

    // 如果地图未初始化或正在初始化中，不显示错误
    if (!mapState.value.isInitialized || mapState.value.initPromise) {
      return false
    }

    return true
  }

  // 只在必要时显示错误消息
  if (shouldShowError()) {
    const errorMessages = {
      init: t('map.initFailed'),
      location: t('map.locationFailed'),
      general: t('map.generalError')
    }
    
    ElMessage.error({
      message: errorMessages[type] || errorMessages.general,
      grouping: true,
      duration: 3000
    })
  }
}
</script>

<style lang="scss" scoped>
@use "@/styles/base/mixins" as *;

.map-container {
  width: 100%;
  height: calc(100vh - var(--nav-height, 60px));
  position: relative;
  background: var(--bg-secondary);
  overflow: hidden;
}

.map-card {
  width: 100%;
  height: 100%;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  
  :deep(.el-card__body) {
    height: 100%;
    padding: 0;
    position: relative;
  }
}

.map-content {
  width: 100%;
  height: 100%;
  border-radius: calc(var(--border-radius) - 8px);
  overflow: hidden;
  opacity: 0;
  transition: opacity var(--transition-duration) ease-in;
  will-change: opacity;

  &.visible {
    opacity: 1;
  }
}

// 组件层级管理
.location-mask {
  position: absolute;
  inset: 0;
  z-index: z('mask');
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.85)
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  pointer-events: auto;
  transition: all var(--transition-duration) ease;
  will-change: opacity, transform;

  &.fade-out {
    opacity: 0;
    pointer-events: none;
    transition: all var(--transition-duration) ease;
    
    .location-content {
      transform: translateY(20px);
      transition: transform var(--transition-duration) ease;
    }
  }
}

.gps-indicator {
  position: absolute;
  top: spacing(4);
  right: spacing(4);
  z-index: z('controls');
}

.map-controls {
  position: absolute;
  right: spacing(4);
  bottom: spacing(12);
  z-index: z('controls');

  @include respond-to('mobile') {
    right: spacing(3);
    bottom: spacing(16);
  }
}

.guardian-info {
  position: absolute;
  left: spacing(4);
  bottom: spacing(4);
  z-index: z('controls');
}

/* 雷达扫描效果 */
.radar-container {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: z('controls') - 1;
}

.radar-sweep {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(var(--theme-primary), 0.2) 60deg,
    transparent 120deg
  );
  animation: sweep 3s linear infinite;
}

.radar-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(var(--theme-primary), 0.3);
}

@keyframes sweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 