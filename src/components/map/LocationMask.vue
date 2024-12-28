<template>
  <div 
    class="location-mask" 
    :class="{ 'fade-out': fadeOut }"
  >
    <div class="location-content">
      <div class="location-animation">
        <div class="pulse-rings">
          <div class="pulse-ring"></div>
          <div class="pulse-ring"></div>
          <div class="pulse-ring"></div>
        </div>
        <div class="location-icon">
          <div class="satellite">
            <el-icon><Location /></el-icon>
          </div>
          <div class="signal-waves">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
          </div>
        </div>
      </div>
      <div class="location-text">
        <h2>{{ t('map.locatingTitle') }}</h2>
        <p>{{ t('map.locatingDesc') }}</p>
        <span class="loading-dots">{{ t('map.locatingTip') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Location } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  fadeOut: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss">
@use "sass:color";
@use "@/styles/base/variables" as vars;
@use "@/styles/base/mixins" as mix;

.location-mask {
  position: absolute;
  inset: 0;
  z-index: z("mask");
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  
  & {
    transition: all vars.$transition-duration vars.$transition-timing;
  }
  
  &.active {
    opacity: 1;
    pointer-events: auto;
  }
  
  &.fade-out {
    opacity: 0;
    pointer-events: none;
  }
  
  .loading-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #fff;
    
    .loading-text {
      margin-top: 1rem;
      font-size: vars.$font-size-medium;
    }
  }
}

.location-content {
  @include flex-center;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 90%;
  text-align: center;
  position: relative;
  z-index: 2;
  transform: translateY(0);
  transition: transform var(--transition-duration) var(--transition-timing);
  will-change: transform;
}

.location-animation {
  position: relative;
  width: clamp(120px, 25vw, 180px);
  height: clamp(120px, 25vw, 180px);
  @include flex-center;
  margin-bottom: 1rem;
}

.pulse-rings {
  position: absolute;
  width: 100%;
  height: 100%;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 2px solid color.adjust(vars.$theme-primary, $alpha: -0.2);
  border-radius: 50%;
  opacity: 0;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  &:nth-child(2) {
    animation-delay: 0.5s;
  }

  &:nth-child(3) {
    animation-delay: 1s;
  }
}

.location-icon {
  position: relative;
  width: 60px;
  height: 60px;
  background: vars.$bg-primary;
  border-radius: 50%;
  @include flex-center;
  color: vars.$theme-primary;
  font-size: 24px;
  box-shadow: vars.$shadow-light;
  animation: float 3s ease-in-out infinite;
  z-index: 2;
}

.satellite {
  animation: rotate 8s linear infinite;
}

.signal-waves {
  position: absolute;
  width: 100%;
  height: 100%;
}

.wave {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 2px solid color.adjust(vars.$theme-primary, $alpha: -0.4);
  border-radius: 50%;
  opacity: 0;
  animation: wave 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  &:nth-child(2) {
    animation-delay: 0.5s;
  }

  &:nth-child(3) {
    animation-delay: 1s;
  }
}

.location-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2;

  h2 {
    font-size: clamp(1.25rem, 4vw, 1.5rem);
    font-weight: 600;
    margin: 0;
    color: vars.$text-primary;
  }

  p {
    font-size: clamp(0.875rem, 3vw, 1rem);
    color: vars.$text-regular;
    margin: 0;
  }
}

.loading-dots {
  font-size: 0.875rem;
  color: vars.$text-secondary;

  &::after {
    content: '';
    animation: dots 1.5s steps(4, end) infinite;
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}

@keyframes wave {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
  100% { content: ''; }
}
</style> 