<template>
  <div class="nav-container">
    <div class="nav-left">
      <h1 class="app-title">{{ t('appName') }}</h1>
    </div>
    <div class="nav-right">
      <el-dropdown 
        trigger="click" 
        :hide-on-click="false"
        @command="handleNotificationCommand"
      >
        <div class="notification-wrapper">
          <el-button 
            type="primary" 
            circle 
            class="notification-btn"
            size="large"
          >
            <el-badge 
              :value="unreadCount" 
              :hidden="unreadCount === 0"
              class="notification-badge"
              :max="99"
            >
              <el-icon class="notification-icon"><Bell /></el-icon>
            </el-badge>
          </el-button>
        </div>

        <template #dropdown>
          <el-dropdown-menu class="notification-dropdown">
            <div class="notification-header">
              <span>{{ t('notification.title') }}</span>
              <el-button 
                type="primary" 
                link 
                size="small"
                @click="markAllAsRead"
              >
                {{ t('notification.markAllAsRead') }}
              </el-button>
            </div>
            
            <el-scrollbar max-height="300px">
              <template v-if="notifications.length">
                <el-dropdown-item 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  :class="{ 'unread': !notification.isRead }"
                >
                  <div class="notification-item">
                    <el-avatar :size="32" :src="notification.avatar" />
                    <div class="notification-content">
                      <div class="notification-message">{{ getNotificationMessage(notification) }}</div>
                      <div class="notification-time">{{ formatTime(notification.time) }}</div>
                    </div>
                  </div>
                </el-dropdown-item>
              </template>
              <el-empty
                v-else
                :description="t('notification.empty')"
                :image-size="60"
              />
            </el-scrollbar>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 格式化时间
const formatTime = (time) => {
  const now = new Date()
  const diff = now - new Date(time)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return t('notification.timeAgo.justNow')
  if (hours < 1) return t('notification.timeAgo.minutesAgo', { minutes })
  if (days < 1) return t('notification.timeAgo.hoursAgo', { hours })
  return t('notification.timeAgo.daysAgo', { days })
}

// 模拟通知数据
const notifications = ref([
  {
    id: 1,
    type: 'online',
    name: '张三',
    time: new Date(Date.now() - 1000),
    isRead: false,
    avatar: 'https://placeholder.co/100'
  },
  {
    id: 2,
    type: 'location',
    name: '李四',
    time: new Date(Date.now() - 300000),
    isRead: false,
    avatar: 'https://placeholder.co/100'
  },
  {
    id: 3,
    type: 'offline',
    name: '王五',
    time: new Date(Date.now() - 600000),
    isRead: true,
    avatar: 'https://placeholder.co/100'
  }
])

// 获取通知消息文本
const getNotificationMessage = (notification) => {
  switch (notification.type) {
    case 'online':
      return t('notification.online', { name: notification.name })
    case 'offline':
      return t('notification.offline', { name: notification.name })
    case 'location':
      return t('notification.locationShared', { name: notification.name })
    default:
      return ''
  }
}

// 计算未读消息数量
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.isRead).length
})

// 标记所有通知为已读
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.isRead = true
  })
}

// 处理通知点击
const handleNotificationCommand = (command) => {
  console.log('Notification clicked:', command)
}
</script>

<style scoped>
.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 clamp(16px, 4vw, 24px);
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-right {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: clamp(22px, 5.5vw, 28px);
  font-weight: 600;
  background: var(--theme-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.notification-wrapper {
  position: relative;
  padding: 4px;
}

.notification-btn {
  width: clamp(44px, 11vw, 52px) !important;
  height: clamp(44px, 11vw, 52px) !important;
  background: var(--theme-gradient) !important;
  border: none !important;
  color: white !important;
  transition: all 0.3s ease;
}

.notification-icon {
  font-size: clamp(22px, 5.5vw, 26px) !important;
}

/* 修改未读气��样式 */
.notification-badge :deep(.el-badge__content) {
  transform: scale(0.9);
  padding: 0 5px;
  height: 16px;
  min-width: 16px;
  line-height: 16px;
  font-size: 12px;
  background-color: #f56c6c;
  border: 2px solid white;
  right: 0;
  top: 0;
}

.notification-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.notification-btn:active {
  background: rgba(64, 158, 255, 0.2) !important;
  transform: scale(0.95);
}

/* 通知下拉框样式 */
.notification-dropdown {
  min-width: 300px;
  padding: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-weight: bold;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.unread {
  background-color: var(--el-color-primary-light-9);
}

:deep(.el-dropdown-menu__item:not(.is-disabled):hover) {
  background-color: var(--el-color-primary-light-9);
}

:deep(.el-badge__content) {
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .app-title {
    font-size: clamp(20px, 5vw, 24px);
  }

  .notification-dropdown {
    min-width: 280px;
  }

  .notification-btn {
    width: 46px !important;
    height: 46px !important;
  }

  .notification-icon {
    font-size: 24px !important;
  }

  .notification-badge :deep(.el-badge__content) {
    transform: scale(0.85);
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: clamp(18px, 4.5vw, 22px);
  }

  .notification-btn {
    width: 42px !important;
    height: 42px !important;
  }

  .notification-icon {
    font-size: 22px !important;
  }

  .notification-badge :deep(.el-badge__content) {
    transform: scale(0.85);
  }
}
</style> 