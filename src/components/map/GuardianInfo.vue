<template>
  <div class="guardian-info glass-effect">
    <div class="guardian-header">
      <div class="guardian-basic">
        <el-avatar :size="40" :src="guardian.avatar" />
        <div class="guardian-details">
          <span class="guardian-name">{{ guardian.name }}</span>
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
      <span>{{ guardian.location }}</span>
    </div>
  </div>
</template>

<script setup>
import { Location, Position } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  guardian: {
    type: Object,
    required: true
  }
})
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/base/variables" as vars;
@use "@/styles/base/mixins" as mix;

.guardian-info {
  position: absolute;
  left: spacing(4);
  bottom: spacing(4);
  z-index: z("info");
  @include glass-effect(0.9, 8px);
  border-radius: var(--border-radius);
  padding: 1rem;
  max-width: 90%;
  transition: var(--transition-base);
  
  &.minimized {
    transform: translateX(calc(100% - 48px));
    
    .toggle-btn {
      transform: rotate(180deg);
    }
  }
  
  .info-header {
    @include flex-center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    
    .title {
      font-size: var(--font-size-medium);
      font-weight: font-weight("semibold");
      color: var(--text-primary);
    }
    
    .toggle-btn {
      @include flex-center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition-transform);
      
      &:hover {
        color: var(--theme-primary);
      }
    }
  }
  
  .info-content {
    @include flex-center;
    flex-direction: column;
    gap: 1rem;
    
    .user-card {
      width: 100%;
      padding: 1rem;
      background: color.adjust($bg-primary, $alpha: -0.5);
      border-radius: var(--border-radius);
      @include flex-center;
      gap: 1rem;
      transition: var(--transition-colors);
      
      &:hover {
        background: color.adjust($bg-primary, $alpha: -0.3);
      }
      
      .user-avatar {
        flex-shrink: 0;
      }
      
      .user-details {
        flex: 1;
        min-width: 0;
        
        .user-name {
          font-weight: font-weight("medium");
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .user-status {
          font-size: var(--font-size-small);
          color: var(--text-secondary);
        }
      }
      
      .user-actions {
        @include flex-center;
        gap: 0.5rem;
      }
    }
  }
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
  font-size: var(--font-size-medium);
  font-weight: font-weight("medium");
  color: var(--text-primary);
}

.guardian-status {
  font-size: var(--font-size-mini);
  color: var(--text-secondary);
}

.navigate-btn {
  @include gradient-bg($theme-primary, $theme-primary-light);
  border: none !important;
}

.guardian-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

@include mobile {
  .guardian-info {
    padding: 12px;
  }
}
</style> 