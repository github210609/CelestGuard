<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
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
          @click="$emit('remove', user)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <div class="add-user-btn glass-effect" @click="$emit('add')">
        <el-icon><Plus /></el-icon>
        <span>{{ t('friends.add') }}</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { Close, Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedUsers: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:visible', 'add', 'remove'])
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/base/variables" as vars;
@use "@/styles/base/mixins" as mix;

.user-selector-dialog {
  :deep(.el-dialog__body) {
    padding: 1rem;
  }
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  background: color.adjust($bg-primary, $alpha: -0.5);
  cursor: pointer;
  transition: all var(--transition-duration) var(--transition-timing);
  
  &:hover {
    background: color.adjust($bg-primary, $alpha: -0.3);
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .user-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      
      .user-name {
        font-size: var(--font-size-base);
        font-weight: font-weight("medium");
        color: var(--text-primary);
      }
      
      .user-status {
        font-size: var(--font-size-small);
        color: var(--text-secondary);
      }
    }
  }
}

@include mix.mobile {
  .user-selector-dialog {
    :deep(.el-dialog__body) {
      padding: 0.75rem;
    }
  }
  
  .user-item {
    padding: 0.5rem;
  }
}
</style> 