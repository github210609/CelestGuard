<template>
  <div class="friends-container">
    <div class="friends-content">
      <!-- 搜索框 -->
      <div class="search-box glass-effect">
        <div class="search-wrapper">
          <el-input
            v-model="searchText"
            :placeholder="t('friends.searchPlaceholder')"
            :prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-button
            class="add-friend-btn glass-effect"
            type="primary"
            :icon="Plus"
            @click="showAddFriendDialog"
          >
            {{ t('friends.add') }}
          </el-button>
        </div>
      </div>

      <!-- 好友列表 -->
      <div class="friends-list">
        <el-scrollbar>
          <template v-if="friendsList.length">
            <div 
              v-for="friend in friendsList" 
              :key="friend.id"
              class="friend-item glass-effect"
            >
              <div class="friend-info">
                <div class="avatar-wrapper">
                  <el-avatar :size="50" :src="friend.avatar" />
                  <div :class="['status-indicator', friend.online ? 'online' : 'offline']">
                    <span class="status-ripple"></span>
                  </div>
                </div>
                <div class="friend-details">
                  <span class="friend-name">{{ friend.name }}</span>
                  <span class="friend-location">{{ friend.lastLocation || t('userStatus.noLocation') }}</span>
                  <span :class="['friend-status', friend.online ? 'online' : 'offline']">
                    {{ friend.online ? t('userStatus.online') : t('userStatus.offline') }}
                  </span>
                </div>
              </div>
              <div class="friend-actions">
                <el-tooltip 
                  :content="t('friends.viewLocation')"
                  placement="top" 
                  :show-after="500"
                >
                  <el-button 
                    type="primary" 
                    circle
                    class="locate-btn"
                    @click="locateFriend(friend)"
                  >
                    <el-icon><Location /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </template>
          <el-empty 
            v-else 
            :description="t('friends.empty')"
            :image-size="200"
          >
            <template #description>
              <p class="empty-text">{{ t('friends.emptyTip') }}</p>
            </template>
          </el-empty>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Location, Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const searchText = ref('')

// 模拟好友数据
const friendsList = ref([
  {
    id: 1,
    name: '张三',
    online: false,
    avatar: 'https://placeholder.co/100',
    location: { lat: 30.5, lng: 114.3 }
  },
  {
    id: 2,
    name: '李四',
    online: false,
    avatar: 'https://placeholder.co/100',
    location: { lat: 31.2, lng: 121.5 }
  }
])

// 定位好友
const locateFriend = (friend) => {
  router.push({
    path: '/',
    query: { 
      friendId: friend.id,
      lat: friend.location.lat,
      lng: friend.location.lng
    }
  })
}

// 添加好友相关
const addFriendDialogVisible = ref(false)
const addFriendForm = ref({
  userId: '',
  message: ''
})

const showAddFriendDialog = () => {
  addFriendDialogVisible.value = true
}

const sendFriendRequest = () => {
  if (!addFriendForm.value.userId) {
    ElMessage.warning('请输入用户ID')
    return
  }
  
  // TODO: 实现发送好友请求的逻辑
  ElMessage.success('好友请求已发送')
  addFriendDialogVisible.value = false
  addFriendForm.value = {
    userId: '',
    message: ''
  }
}
</script>

<style scoped>
.friends-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f5ff 0%, #f7ffef 100%);
}

.friends-content {
  height: 100%;
  padding: clamp(12px, 3vw, 20px);
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 3vw, 20px);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: var(--theme-radius);
  box-shadow: var(--theme-shadow);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.search-box {
  padding: clamp(8px, 2vw, 16px);
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.friends-list {
  flex: 1;
  overflow: hidden;
}

.friend-item {
  padding: clamp(12px, 3vw, 20px);
  margin-bottom: clamp(8px, 2vw, 16px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.friend-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.2);
}

.friend-info {
  display: flex;
  align-items: center;
  gap: clamp(12px, 3vw, 20px);
}

.avatar-wrapper {
  position: relative;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.online {
  background-color: var(--theme-secondary);
}

.status-indicator.offline {
  background-color: var(--el-text-color-secondary);
}

.status-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: ripple 1.5s infinite;
}

.online .status-ripple {
  background-color: var(--theme-secondary);
}

.friend-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.friend-name {
  font-size: clamp(16px, 4vw, 18px);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.friend-location {
  font-size: clamp(12px, 3vw, 14px);
  color: var(--el-text-color-secondary);
}

.friend-status {
  font-size: clamp(12px, 3vw, 14px);
}

.locate-btn {
  width: clamp(36px, 9vw, 44px) !important;
  height: clamp(36px, 9vw, 44px) !important;
  font-size: clamp(16px, 4vw, 20px) !important;
  background: var(--theme-gradient) !important;
  border: none !important;
  transition: all 0.3s ease !important;
}

.locate-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.empty-text {
  color: var(--el-text-color-secondary);
  font-size: 16px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .friend-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .friend-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}

.search-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.search-input {
  flex: 1;
}

.add-friend-btn {
  white-space: nowrap;
  background: var(--theme-gradient) !important;
  border: none !important;
  padding: 8px 16px !important;
  height: 40px !important;
  font-size: clamp(13px, 3.5vw, 14px) !important;
  display: flex !important;
  align-items: center;
  gap: 4px;
  border-radius: 20px !important;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.add-friend-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.add-friend-btn:active {
  transform: translateY(0);
}

/* 添加好友对话框 */
.add-friend-dialog {
  border-radius: var(--theme-radius);
  max-width: 500px;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px 20px 10px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
}

@media (max-width: 768px) {
  .search-wrapper {
    gap: 8px;
  }

  .add-friend-btn {
    padding: 8px 12px !important;
    height: 36px !important;
  }
}

@media (max-width: 480px) {
  .add-friend-btn {
    padding: 8px !important;
  }
  
  .add-friend-btn :deep(.el-icon) {
    margin: 0;
  }
  
  .add-friend-btn span {
    display: none;
  }
}
</style> 