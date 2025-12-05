<template>
  <!--卡片导航栏-->
  <div class="bottom-section">
    <div class="cards-container">
      <!--卡片-->
      <div
        v-for="(item, index) in navItems"
        :key="index"
        class="nav-card"
        @click="handleNavClick(item.route)"
      >
        <div 
          class="card-bg-layer" 
          :style="{ backgroundImage: `url(${item.img})` }"
        ></div>
        <!-- 顶部白色渐变遮罩 (用于衬托文字) -->
        <div class="card-mask"></div>
        <!-- 文字内容 -->
        <div class="card-content">
          <h2 class="card-title">{{ item.title }}</h2>
          <p class="card-subtitle">{{ item.subtitle }}</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router"

import AssociationBG from "@/assets/Home_Association_BG.png"
import DistributionBG from "@/assets/Home_Distribution_BG.png";
import CollegesBG from "@/assets/College_Associa_BG.png";
import OutstandingBG from "@/assets/Outstanding_BG.png";
import GalleryBG from "@/assets/Alum_BG.png";

const route = useRouter();

const navItems = ref([
  { title: '校友总会', subtitle:'校友总会、基金会简介', img:AssociationBG, route:'/association'},
  { title: '校友会分布', subtitle:'全球、全国校友分会分布图', img:DistributionBG, route: '/distribution' },
  { title: '学院校友会', subtitle:'各学院校友会简介', img:CollegesBG, route: '/colleges' },
  { title: '杰出校友', subtitle:'杰出校友履历简介', img:OutstandingBG, route: '/outstanding' },
  { title: '校友图册', subtitle:'校友图册展示',img:GalleryBG, route: '/gallery' }
]);

const handleNavClick = (path :string) => {
  if (path) route.push(path);
}
</script>

<style scoped>
.bottom-section {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 30px;
  /* align-items: center; */
  justify-content: center;
  /* 如果有固定的上下边距需求 */
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 20px; /* 卡片之间的间距 */
  width: 100%;
  max-width: 1400px; /* 限制最大宽度，防止在大屏拉太开 */
}

/* --- 卡片样式 --- */
.nav-card {
   /* 尺寸设置：根据设计图比例调整，比如 9:16 */
  width: 240px; 
  height: 480px; 
  position: relative;
  border-radius: 20px; /* 圆角 */
  overflow: hidden; /* 裁剪超出圆角的图片 */
  cursor: pointer;
  background-color: #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  
  /* 动画过渡 */
  transition: all 0.3s ease-out;
}

/* 悬浮状态：轻微上浮 + 阴影加深 */
.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(169, 27, 75, 0.3); /* 使用深大红色的阴影 */
}

/* 点击状态：轻微缩放 (按压感) */
.nav-card:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}

/* --- 内部层级样式 --- */
/* 1. 背景图片层 */
.card-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 核心代码：背景图填充方式 */
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  z-index: 1;
  
  /* 背景图缩放动画 */
  transition: transform 0.6s ease;
}

/* 2. 白色渐变遮罩层 (模拟图中的上半部分白色背景) */
.card-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 45%; /* 遮罩覆盖高度，约占卡片一半 */
  /* 从纯白渐变到透明 */
  background: linear-gradient(to bottom, 
    #ffffff 0%, 
    #ffffff 40%, 
    rgba(255, 255, 255, 0) 100%
  );
  z-index: 2;
  pointer-events: none; /* 让点击穿透 */
}

/* 3. 文字内容层 */
.card-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding-top: 50px; /* 控制文字距离顶部的距离 */
  text-align: center;
  z-index: 3;
}

.card-title {
  /* 字体设置 */
  font-family: 'Noto Serif SC', 'Songti SC', 'SimSun', serif; 
  font-size: 32px;
  font-weight: 700;
  color: #9d1e48; /* 深大红 */
  margin: 0 0 12px 0;
  letter-spacing: 2px;
}

.card-subtitle {
  font-size: 14px;
  color: #cf7e93; /* 浅红色 */
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
}

</style>