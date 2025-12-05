<template>
  <div 
    class="menu-btn" 
    :class="[`theme-${theme}`, { 'is-active': isActive }]"
    @click="handleClick"
  >
    <span class="btn-text">{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  isActive?: boolean
  theme: 'dark' | 'light'
}>()

const emit = defineEmits(['click'])
const handleClick = () => emit('click')
</script>

<style scoped>
.menu-btn {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.btn-text {
  font-family: 'Songti SC', 'SimSun', serif;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 2px;
}

/* --- Dark Theme (图1) --- */
/* 默认: 红底白字; 选中: 白底红字 */
.theme-dark .btn-text { color: #ffffff; }
.theme-dark:not(.is-active):hover { background-color: rgba(255, 255, 255, 0.1); }
.theme-dark.is-active {
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.theme-dark.is-active .btn-text { color: #9d1e48; }

/* --- Light Theme (图2) --- */
/* 默认: 白底黑字(或深灰); 选中: 红底白字 */
.theme-light .btn-text { color: #333333; }
.theme-light:not(.is-active):hover { background-color: #f5f5f5; }
.theme-light.is-active {
  background-color: #9d1e48; /* 深大红 */
  box-shadow: 0 4px 10px rgba(157, 30, 72, 0.3);
}
.theme-light.is-active .btn-text { color: #ffffff; }
</style>