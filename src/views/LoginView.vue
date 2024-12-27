<template>
  <div class="login-container">
    <div class="login-content glass-effect">
      <div class="login-header">
        <h1 class="app-title">{{ t('appName') }}</h1>
        <h2 class="welcome-text">{{ t('login.title') }}</h2>
        <p class="subtitle">{{ t('login.subtitle') }}</p>
      </div>

      <el-form 
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :placeholder="t('login.placeholder.username')"
            :prefix-icon="User"
            class="themed-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="t('login.placeholder.password')"
            :prefix-icon="Lock"
            show-password
            class="themed-input"
          />
        </el-form-item>

        <div class="form-options">
          <el-checkbox 
            v-model="loginForm.remember"
            class="themed-checkbox"
          >
            {{ t('login.remember') }}
          </el-checkbox>
          <el-link type="primary" class="forgot-link">
            {{ t('login.forgot') }}
          </el-link>
        </div>

        <el-button 
          type="primary" 
          class="login-button"
          :loading="loading"
          @click="handleLogin"
        >
          {{ t('login.submit') }}
        </el-button>
      </el-form>

      <div class="register-link">
        <span>{{ t('login.noAccount') }}</span>
        <el-link type="primary" class="register-btn">
          {{ t('login.register') }}
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loginRules = {
  username: [
    { required: true, message: () => t('login.error.username'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: () => t('login.error.password'), trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  loading.value = true
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('isAuthenticated', 'true')
    router.push('/')
  } catch (error) {
    ElMessage.error(t('login.error.invalid'))
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* 全局样式覆盖 */
.themed-input.el-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.6) !important;
  border: 1px solid rgba(91, 107, 249, 0.1) !important;
  box-shadow: none !important;
  transition: all 0.3s ease !important;
}

.themed-input.el-input :deep(.el-input__wrapper:hover) {
  border-color: var(--theme-primary) !important;
  background: rgba(255, 255, 255, 0.8) !important;
}

.themed-input.el-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--theme-primary) !important;
  box-shadow: 0 0 0 1px var(--theme-primary) !important;
  background: rgba(255, 255, 255, 0.95) !important;
}

.themed-input.el-input :deep(.el-input__inner) {
  height: 44px !important;
  color: var(--theme-text-primary) !important;
}

.themed-input.el-input :deep(.el-input__prefix-inner) {
  color: var(--theme-primary) !important;
}

.themed-checkbox.el-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: var(--theme-gradient) !important;
  border-color: var(--theme-primary) !important;
}

.themed-checkbox.el-checkbox :deep(.el-checkbox__label) {
  color: var(--theme-text-secondary) !important;
}
</style>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--theme-background);
  padding: clamp(16px, 4vw, 24px);
}

.login-content {
  width: 100%;
  max-width: 420px;
  padding: clamp(24px, 6vw, 40px);
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 5vw, 28px);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: var(--theme-radius);
  box-shadow: var(--theme-shadow);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: clamp(8px, 2vw, 12px);
}

.app-title {
  font-size: clamp(28px, 7vw, 36px);
  font-weight: 600;
  margin: 0 0 clamp(12px, 3vw, 16px);
  background: var(--theme-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-text {
  font-size: clamp(20px, 5vw, 24px);
  font-weight: 600;
  color: var(--theme-text-primary);
  margin: 0 0 clamp(8px, 2vw, 12px);
}

.subtitle {
  font-size: clamp(14px, 3.5vw, 16px);
  color: var(--theme-text-secondary);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 4vw, 20px);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(8px, 2vw, 12px);
}

.forgot-link {
  font-size: clamp(13px, 3.25vw, 14px);
  color: var(--theme-primary) !important;
  text-decoration: none !important;
}

.forgot-link:hover {
  opacity: 0.8;
}

.login-button {
  width: 100%;
  height: clamp(44px, 11vw, 48px);
  font-size: clamp(15px, 3.75vw, 16px);
  background: var(--theme-gradient) !important;
  border: none !important;
  transition: all 0.3s ease;
  margin-top: clamp(8px, 2vw, 12px);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(91, 107, 249, 0.2);
}

.login-button:active {
  transform: translateY(0);
}

.register-link {
  text-align: center;
  font-size: clamp(13px, 3.25vw, 14px);
  color: var(--theme-text-secondary);
  margin-top: clamp(12px, 3vw, 16px);
}

.register-btn {
  margin-left: 8px;
  font-weight: 500;
  text-decoration: none !important;
}

.register-btn:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .login-content {
    padding: clamp(20px, 5vw, 32px);
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-content {
    padding: 20px;
  }
}
</style> 