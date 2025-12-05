<template>
    <header class="header-container">
        <!-- 左侧的logo-->
         <div class="left-brand">
            <img :src="logo1" class="logo-img" alt="深圳大学"/>
            <div class="spacer"></div>
            <img :src="logo2" class="logo-img" alt="深圳大学教育基金会"/>
         </div>

         <!--中间的透明区域-->
         <div class="header-space"></div>

         <div class="page-info">
            <span class="nav-text">{{pageName}}</span>
         </div>
    </header>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import logo1 from '@/assets/SZULogo.png'
import logo2 from '@/assets/SZUJJHLogo.png'

const props = defineProps({
    pageName: {
        type: String,
        default: '首页'
    }
})
</script>

<style scoped>
.header-container {
    height: 100%; /* 让容器撑满父元素的高度 */
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    background: transparent;
    box-sizing: border-box;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* 左侧 Logo 区域 */
.left-brand {
  display: flex;
  align-items: center;
  height: 100%;
  padding-right: 44px;
  padding-left: 80px;
  background-color: #fff;
  border-radius: 0 20px 20px 0; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.header-space{
  flex-grow: 1;
}

.logo-img {
  height: 50px; /* 根据实际图片比例调整高度 */
  margin-right: 20px;
  width: auto;
  object-fit: contain;
}

.page-info{
  display: flex;
  align-items: center;
  height: 100%;
  padding-right: 60px; /* 距离右边的边距 */
}

.nav-text {
  font-size: 28px;
  font-weight: bold;
  color: #ffffff; /* 参考图中右侧文字为白色 */
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>