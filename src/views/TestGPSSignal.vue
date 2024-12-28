<template>
  <div class="test-container">
    <GPSSignalIndicator
      :accuracy="accuracy"
      :get-signal-strength="getSignalStrength"
      :get-signal-color="getSignalColor"
      :get-signal-text="getSignalText"
    />
    
    <div class="controls glass-effect">
      <h3>GPS 信号测试控制器</h3>
      
      <div class="control-group">
        <span class="label">信号强度:</span>
        <el-slider
          v-model="accuracy"
          :min="0"
          :max="100"
          :step="1"
          :marks="{
            0: '无信号',
            20: '优',
            50: '中',
            100: '差'
          }"
        />
      </div>

      <div class="control-group">
        <span class="label">模拟状态:</span>
        <el-button-group>
          <el-button
            type="success"
            :class="{ active: accuracy <= 20 }"
            @click="setAccuracy(10)"
          >
            信号良好
          </el-button>
          <el-button
            type="warning"
            :class="{ active: accuracy > 20 && accuracy <= 50 }"
            @click="setAccuracy(35)"
          >
            信号一般
          </el-button>
          <el-button
            type="danger"
            :class="{ active: accuracy > 50 }"
            @click="setAccuracy(80)"
          >
            信号差
          </el-button>
          <el-button
            type="info"
            :class="{ active: accuracy === null }"
            @click="setAccuracy(null)"
          >
            无信号
          </el-button>
        </el-button-group>
      </div>

      <div class="status-info">
        <p>当前状态：{{ getSignalText(getSignalStrength(accuracy)) }}</p>
        <p>信号强度：{{ accuracy === null ? '无信号' : accuracy }}</p>
        <p>信号等级：{{ getSignalStrength(accuracy) }} 格</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import GPSSignalIndicator from '@/components/map/GPSSignalIndicator.vue'

const accuracy = ref(20)

// 获取信号强度（1-4格）
const getSignalStrength = (accuracy) => {
  if (!accuracy) return 1
  if (accuracy > 50) return 2
  if (accuracy > 20) return 3
  return 4
}

// 获取信号颜色
const getSignalColor = (strength) => {
  switch (strength) {
    case 4:
      return 'var(--theme-success)'
    case 3:
      return 'var(--theme-primary)'
    case 2:
      return 'var(--theme-warning)'
    default:
      return 'var(--theme-danger)'
  }
}

// 获取信号文本
const getSignalText = (strength) => {
  switch (strength) {
    case 4:
      return 'GPS 信号良好'
    case 3:
      return 'GPS 信号一般'
    case 2:
      return 'GPS 信号较差'
    default:
      return 'GPS 信号丢失'
  }
}

// 设置精度值
const setAccuracy = (value) => {
  accuracy.value = value
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/styles/base/variables" as *;
@use "@/styles/base/mixins" as *;

.test-container {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: spacing(4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.controls {
  width: 100%;
  max-width: 600px;
  padding: spacing(4);
  border-radius: var(--border-radius);
  @include glass-effect(0.9, 8px);

  h3 {
    margin: 0 0 spacing(4);
    color: var(--text-primary);
    font-size: var(--font-size-large);
    font-weight: font-weight("medium");
  }
}

.control-group {
  margin-bottom: spacing(4);

  .label {
    display: block;
    margin-bottom: spacing(2);
    color: var(--text-regular);
    font-size: var(--font-size-base);
  }

  :deep(.el-button) {
    &.active {
      opacity: 1;
    }
    &:not(.active) {
      opacity: 0.6;
    }
  }
}

.status-info {
  margin-top: spacing(4);
  padding: spacing(3);
  background: rgba($bg-primary, 0.5);
  border-radius: var(--border-radius);

  p {
    margin: spacing(1) 0;
    color: var(--text-regular);
    font-size: var(--font-size-base);

    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style> 