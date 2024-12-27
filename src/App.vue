<template>
  <el-container class="layout-container">
    <el-header height="var(--header-height)" class="app-header">
      <NavBar />
    </el-header>
    
    <el-main class="app-main">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </el-main>

    <el-footer height="var(--footer-height)" class="app-footer">
      <BottomNav />
    </el-footer>
  </el-container>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import BottomNav from './components/BottomNav.vue'
</script>

<style>
:root {
  --header-height: 72px;
  --footer-height: 72px;
  --theme-primary: #409EFF;
  --theme-secondary: #67C23A;
  --theme-warning: #E6A23C;
  --theme-danger: #F56C6C;
  --theme-gradient: linear-gradient(135deg, #409EFF, #67C23A);
  --theme-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  --theme-radius: 12px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.app-header {
  width: 100%;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-main {
  flex: 1;
  padding: 0;
  margin-top: var(--header-height);
  margin-bottom: var(--footer-height);
  overflow: hidden;
  position: relative;
  background-color: #f5f7fa;
}

.app-footer {
  width: 100%;
  padding: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  :root {
    --header-height: 68px;
    --footer-height: 68px;
  }
}

@media screen and (max-width: 768px) {
  :root {
    --header-height: 64px;
    --footer-height: 64px;
  }
}

@media screen and (max-width: 480px) {
  :root {
    --header-height: 60px;
    --footer-height: 60px;
  }
}

/* 添加全局动画 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(2); opacity: 0; }
}

/* 添加全局过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
