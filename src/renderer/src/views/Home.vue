<template>
  <!--卡片导航栏-->
  <div class="bottom-section fade-in">
    <div class="cards-container">
      <!--卡片-->
      <div
        v-for="(item, index) in navItems"
        :key="index"
        class="nav-card card-entrance"
        :style="{ '--delay': index * 0.1 + 's' }"
        @click="handleNavClick(item.route)"
      >
        <div 
          class="card-bg-layer" 
          :style="{ backgroundImage: `url(${item.img})` }"
        ></div>
        <!-- 顶部白色渐变遮罩 -->
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
  { title: '校友图册', subtitle:'校友毕业图册展示',img:GalleryBG, route: '/gallery' }
]);

const handleNavClick = (path :string) => {
  if (path){
    // 保持你的点击延迟逻辑，这很好
    setTimeout(() => {
      route.push(path);
    }, 150);
  }
}
</script>

<style scoped>
.bottom-section {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 30px;
  justify-content: center;
}

/* 容器淡入动画 */
.fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
  max-width: 1400px;
}

/* --- 卡片样式 --- */
.nav-card {
  width: 240px; 
  height: 480px; 
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  background-color: #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  
  /* 基础过渡：用于 hover/active */
  transition: all 0.3s ease-out;

  /* --- 关键：入场动画设置 --- */
  opacity: 0; /* 初始隐藏 */
  transform: translateY(60px) scale(0.9); /* 初始位置：靠下且稍微缩小 */
  /* 使用 both 填充模式确保动画开始前保持隐藏，结束后保持显示 */
  animation: cardPopUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  /* 读取内联样式的延迟变量 */
  animation-delay: var(--delay, 0s);
}

/* 定义卡片弹出的关键帧 */
@keyframes cardPopUp {
  0% {
    opacity: 0;
    transform: translateY(60px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 悬浮状态 */
.nav-card:hover {
  transform: translateY(-8px) scale(1.02); /* 稍微加强了一点 hover 效果 */
  box-shadow: 0 20px 40px rgba(169, 27, 75, 0.25);
  z-index: 10; /* 确保悬浮时在最上层 */
}

/* 点击状态 */
.nav-card:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}

/* --- 内部层级样式 (保持不变) --- */
.card-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  z-index: 1;
  transition: transform 0.6s ease;
}

.card-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 45%;
  background: linear-gradient(to bottom, 
    #ffffff 0%, 
    #ffffff 40%, 
    rgba(255, 255, 255, 0) 100%
  );
  z-index: 2;
  pointer-events: none;
}

.card-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding-top: 50px;
  text-align: center;
  z-index: 3;
}

.card-title {
  font-family: 'MySourceHanSerifHeavy';
  font-size: 32px;
  color: #9d1e48;
  margin: 0 0 12px 0;
  letter-spacing: 2px;
}

.card-subtitle {
  font-family: 'Source Han Sans CN';
  font-size: 16px;
  color: #cf7e93;
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
}
</style>