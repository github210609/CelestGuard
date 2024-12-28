<template>
  <div class="map-controls">
    <div class="control-panel glass-effect">
      <el-tooltip
        :content="t('map.selectUsers')"
        placement="left"
        :show-after="300"
      >
        <el-button 
          type="primary" 
          circle 
          class="control-button"
          @click="$emit('show-users')"
        >
          <el-icon><User /></el-icon>
        </el-button>
      </el-tooltip>

      <div class="control-divider"></div>

      <el-tooltip
        :content="t('map.locateMe')"
        placement="left"
        :show-after="300"
      >
        <el-button 
          type="primary" 
          circle 
          class="control-button"
          :class="{ 'loading': isLocating }"
          @click="$emit('locate')"
        >
          <el-icon><Aim /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { Aim, User } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  isLocating: {
    type: Boolean,
    default: false
  }
})

defineEmits(['locate', 'show-users'])
</script>

<style lang="scss" scoped>
@use "@/styles/base/variables" as *;
@use "@/styles/base/mixins" as *;

.map-controls {
  position: absolute;
  right: spacing(4);
  bottom: spacing(4);
  z-index: z("controls");
  
  @include mobile {
    right: 16px;
    bottom: 140px;
  }
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-radius: $border-radius;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: $shadow-controls;
  transform: translateZ(0);
  will-change: transform;

  @include mobile {
    padding: 8px;
    gap: 8px;
  }
}

.control-button {
  width: 44px !important;
  height: 44px !important;
  padding: 0 !important;
  font-size: 20px !important;
  background-color: $theme-primary !important;
  border-color: $theme-primary !important;
  color: white !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;

  &:hover {
    background-color: $theme-primary-light !important;
    border-color: $theme-primary-light !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }

  &.loading {
    pointer-events: none;
    opacity: 0.8;
    animation: pulse 1.5s infinite;
  }

  @include mobile {
    width: 40px !important;
    height: 40px !important;
    font-size: 18px !important;
  }
}

.control-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 0;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}
</style> 