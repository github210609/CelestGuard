<template>
  <div 
    class="gps-signal-indicator"
    :class="{
      'poor-signal': accuracy && getSignalStrength(accuracy) === 2,
      'no-signal': !accuracy || getSignalStrength(accuracy) === 1
    }"
  >
    <div class="signal-bars">
      <div 
        v-for="i in 4" 
        :key="i"
        :class="[
          'signal-bar',
          { active: accuracy && getSignalStrength(accuracy) >= i }
        ]"
        :style="{
          backgroundColor: accuracy && getSignalStrength(accuracy) >= i 
            ? getSignalColor(getSignalStrength(accuracy))
            : 'rgba(0, 0, 0, 0.2)'
        }"
      ></div>
    </div>
    <span 
      class="signal-text"
      :class="{
        'warning': accuracy && getSignalStrength(accuracy) === 2,
        'error': !accuracy || getSignalStrength(accuracy) === 1
      }"
    >
      {{ getSignalText(getSignalStrength(accuracy)) }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  accuracy: {
    type: Number,
    default: null
  },
  getSignalStrength: {
    type: Function,
    required: true
  },
  getSignalColor: {
    type: Function,
    required: true
  },
  getSignalText: {
    type: Function,
    required: true
  }
})
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/base/variables" as *;
@use "@/styles/base/mixins" as *;

.gps-signal-indicator {
  position: absolute;
  top: spacing(4);
  right: spacing(4);
  padding: 8px 12px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: z("controls");
  transition: all var(--transition-duration) var(--transition-timing);
  @include glass-effect(0.9, 8px);

  &.poor-signal {
    background: rgba($theme-warning, 0.15);
    box-shadow: 0 0 0 1px rgba($theme-warning, 0.3);
    animation: pulse 2s infinite;

    .signal-bar {
      &:not(.active) {
        background-color: rgba($theme-warning, 0.2);
      }
      &.active {
        background-color: var(--theme-warning) !important;
      }
    }

    .signal-text {
      color: var(--theme-warning);
      font-weight: font-weight("medium");
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }

  &.no-signal {
    background: rgba($theme-danger, 0.15);
    box-shadow: 0 0 0 1px rgba($theme-danger, 0.3);
    animation: pulse 1s infinite;

    .signal-bar {
      &:not(.active) {
        background-color: rgba($theme-danger, 0.2);
      }
      &.active {
        background-color: var(--theme-danger) !important;
      }
    }

    .signal-text {
      color: var(--theme-danger);
      font-weight: font-weight("medium");
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }

  @include mobile {
    top: 12px;
    right: 12px;
    padding: 6px 10px;
  }
}

.signal-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  padding: 0 2px;
}

.signal-bar {
  width: 4px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 1px;
  transition: all var(--transition-duration) var(--transition-timing);

  &:nth-child(1) { height: 25%; }
  &:nth-child(2) { height: 50%; }
  &:nth-child(3) { height: 75%; }
  &:nth-child(4) { height: 100%; }

  &.active {
    opacity: 1;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
}

.signal-text {
  font-size: var(--font-size-small);
  color: var(--text-regular);
  white-space: nowrap;
  transition: all var(--transition-duration) var(--transition-timing);
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 