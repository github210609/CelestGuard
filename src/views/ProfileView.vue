<template>
  <div class="profile-container">
    <el-scrollbar class="profile-scrollbar">
      <div class="profile-content">
        <!-- 用户信息卡片 -->
        <div class="user-info glass-effect">
          <div class="avatar-wrapper">
            <el-avatar :size="avatarSize" :src="userInfo.avatar" />
            <div class="edit-avatar">
              <el-icon><EditPen /></el-icon>
            </div>
          </div>
          <h2 class="username">{{ userInfo.name }}</h2>
          <p class="user-id">{{ t('common.id') }}: {{ userInfo.id }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value guardian">{{ userInfo.guardianCount }}</span>
              <span class="stat-label">{{ t('profile.stats.guardian') }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value being-guarded">{{ userInfo.beingGuardedCount }}</span>
              <span class="stat-label">{{ t('profile.stats.beingGuarded') }}</span>
            </div>
          </div>
        </div>

        <!-- 功能菜单 -->
        <div class="menu-list">
          <div 
            v-for="(item, index) in menuItems" 
            :key="index"
            class="menu-item glass-effect"
            @click="handleMenuClick(item)"
          >
            <div class="menu-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <span class="menu-text">{{ item.text }}</span>
            <div class="menu-right">
              <span v-if="item.badge" class="menu-badge">{{ item.badge }}</span>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <!-- 退出登录 -->
        <div class="logout-section">
          <el-button 
            type="danger" 
            class="logout-btn glass-effect"
            @click="handleLogout"
          >
            <el-icon class="logout-icon"><SwitchButton /></el-icon>
            {{ t('profile.logout') }}
          </el-button>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, h, computed } from 'vue'
import { 
  Setting, 
  Lock, 
  Warning,
  ArrowRight,
  EditPen,
  Monitor,
  SwitchButton
} from '@element-plus/icons-vue'
import { ElMessageBox, ElRadioGroup, ElRadio } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/language'

const router = useRouter()
const { t } = useI18n()
const languageStore = useLanguageStore()
const locale = computed(() => languageStore.locale)

// 响应式头像大小
const avatarSize = computed(() => {
  const width = window.innerWidth
  if (width <= 480) return 80
  if (width <= 768) return 90
  return 100
})

const userInfo = ref({
  id: '10086',
  name: '守护者',
  avatar: 'https://placeholder.co/200',
  guardianCount: 5,
  beingGuardedCount: 3
})

// 使用计算属性来处理菜单项和语言选项
const menuItems = computed(() => [
  { text: t('profile.settings'), icon: Setting, action: 'settings' },
  { text: t('profile.privacy'), icon: Lock, action: 'privacy' },
  { text: t('profile.language'), icon: Monitor, action: 'language' },
  { text: t('profile.about'), icon: Warning, action: 'about' }
])

const languageOptions = computed(() => [
  { value: 'zh', label: t('profile.languages.zh') },
  { value: 'en', label: t('profile.languages.en') },
  { value: 'ko', label: t('profile.languages.ko') },
  { value: 'ja', label: t('profile.languages.ja') }
])

// 处理语言切换
const handleLanguageChange = async (lang) => {
  await languageStore.setLocale(lang)
  ElMessage({
    message: t('profile.languageChanged'),
    type: 'success',
    duration: 1000
  })
  // 强制重新渲染当前组件
  router.go(0)
}

// 处理菜单点击
const handleMenuClick = (item) => {
  if (item.action === 'language') {
    ElMessageBox({
      title: t('profile.language'),
      message: h('div', { class: 'language-options' }, [
        h(ElRadioGroup, {
          modelValue: locale.value,
          'onUpdate:modelValue': (val) => {
            handleLanguageChange(val)
            // 关闭对话框
            ElMessageBox.close()
          },
          class: 'language-radio-group'
        }, () => languageOptions.value.map(lang => 
          h(ElRadio, {
            label: lang.value,
            size: 'large',
            class: 'language-radio-item'
          }, () => lang.label)
        ))
      ]),
      showCancelButton: false,
      showConfirmButton: false,
      customClass: 'language-dialog',
      center: true,
      showClose: true
    }).catch(() => {})
  } else {
    console.log('Menu clicked:', item.action)
  }
}

const handleLogout = () => {
  ElMessageBox.confirm(
    t('profile.logoutConfirm.message'),
    t('profile.logoutConfirm.title'),
    {
      confirmButtonText: t('profile.logoutConfirm.confirm'),
      cancelButtonText: t('profile.logoutConfirm.cancel'),
      customClass: 'logout-dialog',
      distinguishCancelAndClose: false,
      confirmButtonClass: 'logout-confirm-btn',
      cancelButtonClass: 'logout-cancel-btn',
      draggable: false,
      closeOnClickModal: true,
      closeOnPressEscape: true,
      showClose: false,
      center: true,
      type: 'info',
      customStyle: {
        width: '90%',
        maxWidth: '400px'
      }
    }
  ).then(() => {
    localStorage.removeItem('isAuthenticated')
    ElMessage.success(t('profile.logoutSuccess'))
    router.push('/login')
  }).catch(() => {
    // 取消退出
  })
}
</script>

<style>
/* 全局主题变量 */
:root {
  --theme-primary: #5B6BF9;
  --theme-primary-light: #7C89FA;
  --theme-secondary: #FF7D6B;
  --theme-secondary-light: #FF9D91;
  --theme-danger: #FF6B6B;
  --theme-success: #4CAF50;
  --theme-warning: #FFC107;
  --theme-info: #2196F3;
  --theme-radius: 16px;
  --theme-shadow: 0 4px 20px rgba(91, 107, 249, 0.1);
  --theme-gradient: linear-gradient(135deg, #5B6BF9, #7C89FA);
  --theme-gradient-secondary: linear-gradient(135deg, #FF7D6B, #FF9D91);
  --theme-text-primary: #2C3E50;
  --theme-text-secondary: #606F7B;
  --theme-background: linear-gradient(135deg, #F5F7FF 0%, #FFF5F2 100%);
}

/* 退出登录对话框全局样式 */
.el-message-box.logout-dialog {
  border-radius: var(--theme-radius) !important;
  backdrop-filter: blur(10px) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(91, 107, 249, 0.1) !important;
  box-shadow: var(--theme-shadow) !important;
  overflow: hidden !important;
}

.el-message-box.logout-dialog .el-message-box__header {
  padding: 32px 24px 0 !important;
  text-align: center !important;
  border: none !important;
}

.el-message-box.logout-dialog .el-message-box__title {
  font-size: 22px !important;
  font-weight: 600 !important;
  background: var(--theme-gradient) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  padding-left: 0 !important;
  line-height: 1.4 !important;
}

.el-message-box.logout-dialog .el-message-box__content {
  padding: 20px 24px !important;
  text-align: center !important;
  font-size: 15px !important;
  line-height: 1.6 !important;
  color: var(--theme-text-secondary) !important;
}

.el-message-box.logout-dialog .el-message-box__btns {
  padding: 8px 24px 24px !important;
  text-align: center !important;
  border: none !important;
  display: flex !important;
  justify-content: center !important;
  gap: 16px !important;
}

.el-message-box.logout-dialog .logout-confirm-btn {
  background: var(--theme-gradient-secondary) !important;
  border: none !important;
  padding: 12px 32px !important;
  font-size: 15px !important;
  border-radius: 25px !important;
  transition: all 0.3s ease !important;
  height: auto !important;
  box-shadow: 0 4px 12px rgba(255, 125, 107, 0.2) !important;
  min-width: 120px !important;
  color: white !important;
  font-weight: 500 !important;
}

.el-message-box.logout-dialog .logout-confirm-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(255, 125, 107, 0.3) !important;
  opacity: 0.95 !important;
}

.el-message-box.logout-dialog .logout-cancel-btn {
  border: none !important;
  padding: 12px 32px !important;
  font-size: 15px !important;
  border-radius: 25px !important;
  background: rgba(91, 107, 249, 0.1) !important;
  color: var(--theme-primary) !important;
  transition: all 0.3s ease !important;
  height: auto !important;
  min-width: 120px !important;
  margin: 0 !important;
  font-weight: 500 !important;
}

.el-message-box.logout-dialog .logout-cancel-btn:hover {
  transform: translateY(-2px) !important;
  background: rgba(91, 107, 249, 0.15) !important;
  box-shadow: 0 4px 12px rgba(91, 107, 249, 0.1) !important;
}

@media (max-width: 480px) {
  .el-message-box.logout-dialog {
    width: 90% !important;
    margin: 0 auto !important;
  }

  .el-message-box.logout-dialog .el-message-box__btns {
    padding: 8px 20px 20px !important;
    flex-direction: column-reverse !important;
    gap: 12px !important;
  }

  .el-message-box.logout-dialog .logout-confirm-btn,
  .el-message-box.logout-dialog .logout-cancel-btn {
    width: 100% !important;
    padding: 10px 24px !important;
    min-width: unset !important;
  }
}

/* 语言选择对话框样式 */
.el-message-box.language-dialog {
  border-radius: var(--theme-radius) !important;
  backdrop-filter: blur(10px) !important;
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(91, 107, 249, 0.1) !important;
  box-shadow: var(--theme-shadow) !important;
  overflow: hidden !important;
  max-width: 400px !important;
}

.el-message-box.language-dialog .el-message-box__header {
  padding: 24px 24px 0 !important;
  text-align: center !important;
  border: none !important;
}

.el-message-box.language-dialog .el-message-box__title {
  font-size: 20px !important;
  font-weight: 600 !important;
  background: var(--theme-gradient) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  line-height: 1.4 !important;
}

.el-message-box.language-dialog .el-message-box__content {
  padding: 20px 24px 24px !important;
}

.el-message-box.language-dialog .el-message-box__close {
  color: var(--theme-text-secondary) !important;
  transition: all 0.3s ease !important;
}

.el-message-box.language-dialog .el-message-box__close:hover {
  color: var(--theme-primary) !important;
  transform: rotate(90deg) !important;
}

/* 语言选项样式 */
.language-options {
  margin: 0 !important;
  padding: 0 !important;
}

.language-radio-group {
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

.language-radio-item {
  margin-right: 0 !important;
  height: auto !important;
  padding: 12px !important;
  border-radius: var(--theme-radius) !important;
  transition: all 0.3s ease !important;
  background: rgba(91, 107, 249, 0.05) !important;
}

.language-radio-item:hover {
  background: rgba(91, 107, 249, 0.1) !important;
  transform: translateX(4px) !important;
}

.language-radio-item.is-checked {
  background: var(--theme-gradient) !important;
  color: white !important;
}

.language-radio-item .el-radio__label {
  font-size: 15px !important;
  padding-left: 8px !important;
}

.language-radio-item .el-radio__inner {
  background: white !important;
  border-color: rgba(91, 107, 249, 0.3) !important;
}

.language-radio-item.is-checked .el-radio__inner {
  border-color: white !important;
  background: white !important;
}

.language-radio-item.is-checked .el-radio__inner::after {
  background: var(--theme-primary) !important;
}

@media (max-width: 480px) {
  .el-message-box.language-dialog {
    width: 90% !important;
    margin: 0 auto !important;
  }

  .language-radio-item {
    padding: 10px !important;
  }

  .language-radio-item .el-radio__label {
    font-size: 14px !important;
  }
}
</style>

<style scoped>
.profile-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f5ff 0%, #f7ffef 100%);
}

.profile-scrollbar {
  height: 100%;
  overflow: auto;
}

.profile-content {
  min-height: 100%;
  height: fit-content;
  padding: clamp(16px, 4vw, 24px);
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 4vw, 24px);
}

.user-info {
  padding: clamp(20px, 5vw, 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: clamp(16px, 4vw, 24px);
}

.edit-avatar {
  position: absolute;
  right: 0;
  bottom: 0;
  width: clamp(24px, 6vw, 32px);
  height: clamp(24px, 6vw, 32px);
  background: var(--theme-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  border: 2px solid white;
  transition: all 0.3s ease;
}

.edit-avatar:hover {
  transform: scale(1.1);
}

.username {
  font-size: clamp(20px, 5vw, 24px);
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px;
}

.user-id {
  font-size: clamp(14px, 3.5vw, 16px);
  color: var(--el-text-color-secondary);
  margin: 0 0 clamp(16px, 4vw, 24px);
}

.user-stats {
  display: flex;
  align-items: center;
  gap: clamp(24px, 6vw, 32px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: clamp(24px, 6vw, 32px);
  font-weight: 600;
}

.stat-value.guardian {
  background: var(--theme-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-value.being-guarded {
  background: var(--theme-gradient-secondary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: clamp(12px, 3vw, 14px);
  color: var(--theme-text-secondary);
}

.stat-divider {
  width: 1px;
  height: clamp(24px, 6vw, 32px);
  background: var(--el-border-color-lighter);
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vw, 12px);
}

.menu-item {
  padding: clamp(12px, 3vw, 16px);
  display: flex;
  align-items: center;
  gap: clamp(12px, 3vw, 16px);
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(91, 107, 249, 0.1);
}

.menu-icon {
  width: clamp(36px, 9vw, 44px);
  height: clamp(36px, 9vw, 44px);
  background: var(--theme-gradient);
  border-radius: var(--theme-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: clamp(18px, 4.5vw, 22px);
}

.menu-text {
  flex: 1;
  font-size: clamp(14px, 3.5vw, 16px);
  color: var(--el-text-color-primary);
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-badge {
  background: var(--theme-secondary);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.arrow-icon {
  color: var(--el-text-color-secondary);
  font-size: clamp(16px, 4vw, 20px);
}

.logout-section {
  margin-top: auto;
  padding: clamp(16px, 4vw, 24px) clamp(24px, 6vw, 32px);
}

.logout-btn {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  height: clamp(44px, 11vw, 48px);
  font-size: clamp(14px, 3.5vw, 16px);
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(255, 107, 107, 0.3) !important;
  color: var(--theme-danger) !important;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 24px !important;
  box-shadow: 0 2px 12px rgba(255, 107, 107, 0.1);
}

.logout-btn:hover {
  transform: translateY(-2px);
  background: var(--theme-danger) !important;
  border-color: var(--theme-danger) !important;
  color: white !important;
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.2);
}

.logout-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.15);
}

.logout-icon {
  font-size: clamp(16px, 4vw, 18px);
  transition: all 0.3s ease;
}

.logout-btn:hover .logout-icon {
  transform: rotate(180deg);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: var(--theme-radius);
  box-shadow: var(--theme-shadow);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .profile-content {
    padding: 16px;
    gap: 16px;
  }

  .user-info {
    padding: 20px;
  }

  .menu-item {
    padding: 12px;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .profile-content {
    padding: 12px;
    gap: 12px;
  }

  .user-info {
    padding: 16px;
  }

  .menu-item {
    padding: 10px;
    gap: 10px;
  }

  .logout-section {
    padding-top: 16px;
  }
}
</style> 