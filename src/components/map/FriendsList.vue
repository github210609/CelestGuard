<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
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
          @click="$emit('select', user)"
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
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  availableFriends: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:visible', 'select'])
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/base/variables" as vars;
@use "@/styles/base/mixins" as mix;

.friends-list {
  position: absolute;
  right: spacing(4);
  top: spacing(4);
  z-index: z("list");
  @include glass-effect(0.9, 8px);
  border-radius: var(--border-radius);
  padding: 1rem;
  max-width: 90%;
  max-height: 60vh;
  overflow-y: auto;
  @include custom-scrollbar;
  
  .list-header {
    @include flex-center;
    justify-content: space-between;
    margin-bottom: 1rem;
    
    .title {
      font-size: var(--font-size-medium);
      font-weight: font-weight("semibold");
      color: var(--text-primary);
    }
    
    .close-btn {
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
  
  .list-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    
    .friend-item {
      @include flex-center;
      gap: 1rem;
      padding: 0.75rem;
      background: color.adjust($bg-primary, $alpha: -0.5);
      border-radius: var(--border-radius);
      transition: var(--transition-colors);
      
      &:hover {
        background: color.adjust($bg-primary, $alpha: -0.3);
      }
      
      .friend-avatar {
        flex-shrink: 0;
      }
      
      .friend-info {
        flex: 1;
        min-width: 0;
        
        .friend-name {
          font-size: var(--font-size-base);
          font-weight: font-weight("medium");
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .friend-status {
          font-size: var(--font-size-small);
          color: var(--text-secondary);
        }
      }
      
      .friend-actions {
        @include flex-center;
        gap: 0.5rem;
      }
    }
  }
  
  @include mobile {
    right: 12px;
    bottom: 80px;
    padding: 0.75rem;
  }
}
</style> 