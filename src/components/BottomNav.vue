<template>
  <el-menu
    :default-active="activeIndex"
    mode="horizontal"
    class="bottom-nav"
    :ellipsis="false"
    router
  >
    <el-menu-item index="/">
      <div class="nav-item-content">
        <el-icon><Location /></el-icon>
        <span>{{ t('nav.map') }}</span>
      </div>
    </el-menu-item>
    <el-menu-item index="/friends">
      <div class="nav-item-content">
        <el-icon><ChatDotRound /></el-icon>
        <span>{{ t('nav.friends') }}</span>
      </div>
    </el-menu-item>
    <el-menu-item index="/profile">
      <div class="nav-item-content">
        <el-icon><Setting /></el-icon>
        <span>{{ t('nav.profile') }}</span>
      </div>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Location, ChatDotRound, Setting } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const activeIndex = ref('/')
const { t } = useI18n()

const routes = [
  {
    path: '/',
    icon: 'Location',
    text: t('nav.map')
  },
  {
    path: '/friends',
    icon: 'UserFilled',
    text: t('nav.friends')
  },
  {
    path: '/profile',
    icon: 'User',
    text: t('nav.profile')
  }
]

watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath
  },
  { immediate: true }
)
</script>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: space-between;
  border-bottom: none;
  height: 100%;
  width: 100%;
  padding: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.1);
}

.el-menu-item {
  display: flex !important;
  justify-content: center;
  align-items: center;
  height: 100% !important;
  padding: 10px 0 !important;
  flex: 1;
  min-width: 0 !important;
  transition: all 0.3s ease;
}

.nav-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* 未选中状态 */
.el-menu-item {
  color: var(--el-text-color-secondary) !important;
}

/* 选中状态 */
.el-menu-item.is-active {
  background: transparent !important;
}

.el-menu-item.is-active .nav-item-content {
  color: var(--theme-primary) !important;
  position: relative;
}

/* 选中项的指示器 */
.el-menu-item.is-active .nav-item-content::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 4px;
  background: var(--theme-gradient);
  border-radius: 2px;
}

/* 悬停效果 */
.el-menu-item:hover {
  background: rgba(64, 158, 255, 0.08) !important;
}

.el-menu-item:hover .nav-item-content {
  color: var(--theme-primary);
}

/* 图标和文字样式 */
.el-menu-item .el-icon {
  font-size: clamp(28px, 7vw, 32px);
  margin-bottom: 6px;
}

.el-menu-item span {
  font-size: clamp(14px, 4vw, 16px);
  line-height: 1.2;
  white-space: nowrap;
}

/* 添加动画效果 */
.el-menu-item .nav-item-content {
  transition: all 0.3s ease;
}

.el-menu-item:active .nav-item-content {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .el-menu-item .el-icon {
    font-size: 26px;
  }

  .el-menu-item span {
    font-size: 14px;
  }

  .nav-item-content {
    gap: 6px;
  }

  .el-menu-item.is-active .nav-item-content::after {
    bottom: -8px;
    width: 20px;
    height: 3px;
  }
}

@media (max-width: 480px) {
  .el-menu-item .el-icon {
    font-size: 24px;
  }

  .el-menu-item span {
    font-size: 13px;
  }

  .nav-item-content {
    gap: 4px;
  }
}
</style> 