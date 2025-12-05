<script setup lang="ts">
/** 返回按钮
 * 红底白图
 * 当是主要页面时是主页按钮，当是子页面时是返回按钮
 * 路由判判断应该要在该组件实现
 */

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 图标资源
import ReturnIcon from '@/assets/ReturnBackLight.png'


// 罗列哪些是主要页面
const MAIN_PAGES_NAME = [
  'Home',
  'Association',
  'Distribution',
  'Colleges',
  'Outstanding',
  'Gallery'
]

// 计算当前是不是在主要页面
const isMainPage = computed(() =>{
  return MAIN_PAGES_NAME.includes(route.name as string)
})

// 用来路由跳转
const router = useRouter()
// 用来获取当前路径
const route = useRoute()

const goBack = () => {
  if (isMainPage.value){
    router.push({name: 'Home'})
  } else{
    router.back()
  }
}
</script>

<template>
  <div 
    class="return-btn" 
    @click="goBack"
  >
  <!-- 修改开始：直接使用 SVG 替换了 el-icon -->
    <svg 
      v-if="isMainPage"
      viewBox="0 0 24 24" 
      fill="currentColor" 
      class="icon-home"
    >
      <!-- 这里我放的是方案一（填充风格）的 path -->
      <path d="M11.03 2.59a1.501 1.501 0 0 1 1.94 0l7.5 5.5c.5.37.8.97.8 1.59v9.06c0 1.25-1 2.26-2.25 2.26h-2.25a.75.75 0 0 1-.75-.75V15a2.25 2.25 0 0 0-2.25-2.25h-3.5A2.25 2.25 0 0 0 8 15v5.25a.75.75 0 0 1-.75.75h-2.25A2.26 2.26 0 0 1 2.75 18.75V9.68c0-.62.3-1.22.8-1.59l7.48-5.5Z"></path>
    </svg>
  <img v-else
    :src="ReturnIcon"
    class="icon-back"
  >
  </img>
  </div>
</template>

<style scoped>
.return-btn {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #c42329, #9E1F26);
  color: #FFFFFF;
  transition: all 0.3s ease;
  border-radius: 50%;
  cursor: pointer;


  box-shadow: 0 4px 10px rgba(158, 31, 38, 0.4), 
              0 2px 4px rgba(0, 0, 0, 0.1);
  
  /* 5. 动画过渡 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.icon-home{
  color: #fff;
  width: 35px;
  width: 35px;
}

.icon-back{
  width: 35px;
  height: 35px;
  object-fit: contain;
}

</style>