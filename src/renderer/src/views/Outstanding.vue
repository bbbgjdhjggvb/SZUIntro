<template>
  <div class="main-box">
    <div class="box-sidebar slide-in-left">
      <SideBar theme="light"></SideBar>
    </div>
    <!-- 滚动窗口视图 -->
    <div class="box-content-scroll">
      <!-- 卡片容器 -->
      <div class="card-list">
        <div
          v-for="(outstanding, index) in outstandings"
          :key="index"
          class="alunmi-card"
          :style="{ '--delay': index * 0.1 + 's' }" 
        >
          <!-- 图片部分 -->
           <div class="card-img-box">
            <img :src="outstanding.image" class="avater" loading="lazy" />
            <!-- 增加一个半透明遮罩，增加质感 -->
            <div class="img-overlay"></div>
           </div>

           <!--文字部分-->
           <div class="card-content">
            <!--年级专业-->
            <h3 class="name">{{ outstanding.name }}</h3>
            <p class="meta">
              <span class="meta-year">{{ outstanding.year }}</span>
              <span class="meta-divider">|</span>
              <span class="meta-major">{{ outstanding.major }}</span>
            </p>
            <!--标签-->
            <div class="tags-box">
              <span
                v-for="(tag, tagIndex) in outstanding.lables"
                :key = "tagIndex"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>

           </div>
        </div>
        <!--站位块，防止最后一个卡片贴边-->
        <div class="spacer-end"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SideBar from '@renderer/components/sidebar/SideBar.vue'

interface Outstanding {
  id: number
  name: string
  year: string
  major: string
  lables: string[]
  image: string
}

const outstandings = ref<Outstanding[]>([])

onMounted(async () => {
  try {
    const data = await window.fileReadApi?.readConfigFile() as any
    outstandings.value = data.outstanding_alumni || []

    const imgUrlProcTask = outstandings.value.map(async (e) => {
      // 保持你原有的逻辑
      const realImgUrl = 'local-image:/' + e.image
      return {
        ...e,
        image: realImgUrl || ''
      }
    });
    outstandings.value = await Promise.all(imgUrlProcTask)
  } catch (error) {
    console.error('Failed to load alumni data:', error)
  }
})
</script>

<style scoped>
/* --- 变量定义 --- */
:root {
  --szu-red: #9E1F35;
  --szu-red-light: #FFEFF3;
  --card-width: 300px;
}

.main-box {
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.box-sidebar{
  width: 80px;
  padding:0px;
  margin:0px;
  top: 50%;
  background: transparent;
  border-radius: 20px;
  /* 侧边栏动画初始状态 */
  opacity: 0; 
  transform: translateX(-30px);
  animation: slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.2s; /* 等路由动画走一点再出来 */
}

/* 侧边栏进入动画关键帧 */
@keyframes slideInLeft {
  to { opacity: 1; transform: translateX(0); }
}

/** 隐藏滚动条，但是允许滑动 */
.box-content-scroll {
  flex: 1;
  height: 90%; /* 保持高度 */
  margin-left: 40px;
  background: transparent;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 20px;
  /* 优化滚动体验：平滑滚动 */
  scroll-behavior: smooth;
  
  /* 隐藏滚动条 */
  scrollbar-width: none; 
  -ms-overflow-style: none;
}

.box-content-scroll::-webkit-scrollbar {
    display: none;
}

.card-list{
  background: transparent;
  display: flex;
  flex-direction: row;
  gap: 24px; /* 稍微增加一点间距，让呼吸感更强 */
  height: 100%;
  padding-left: 10px; /* 左侧留一点余地 */
  padding-bottom: 20px; /* 预留阴影空间 */
  align-items: center; /* 垂直居中 */
}

/** 单个卡片样式 */
.alunmi-card{
  flex: 0 0 auto;
  width: 300px;
  height: 95%; /* 稍微留出上下空间给阴影 */
  background-color: #fff;
  border-radius: 16px; /* 更现代的圆角 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* 优化阴影：更柔和，带一点点红色倾向 */
  box-shadow: 0 10px 30px rgba(158, 31, 53, 0.08); 
  border: 1px solid rgba(158, 31, 53, 0.05); /* 极淡的描边 */
  
  /* 动画相关 */
  animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  animation-delay: var(--delay); /* 交错动画 */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  /* 触摸屏优化：禁止长按选中文字 */
  user-select: none; 
  cursor: grab;
}


.card-img-box{
  width: 100%;
  height: 58%;
  background-color: #f5f5f5; /* 图片未加载时的占位色 */
  position: relative;
  overflow: hidden;
}

.avater {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.6s ease;
}

/* 图片遮罩，增加层次感 */
.img-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20%;
  background: linear-gradient(to top, rgba(0,0,0,0.05), transparent);
  pointer-events: none;
}

.card-content{
  flex: 1;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #fff;
  position: relative;
}

/* 名字样式优化 */
.name {
  font-family: 'Songti SC', 'SimSun', serif; /* 强调衬线体 */
  font-size: 28px;
  color: #1a1a1a;
  margin: 0 0 10px 0;
  font-weight: 800;
  letter-spacing: 1px;
}

/* 信息行优化 */
.meta {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  font-family: sans-serif; /* 信息用无衬线体更易读 */
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.8;
}

.meta-divider {
  color: #ddd;
  font-size: 12px;
}

/* 标签容器 */
.tags-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  align-items: center;
  margin-top: auto; /* 将标签推到底部，保证对齐 */
}

/* 标签样式优化 */
.tag {
  background-color: #FFF5F7; /* 极浅的粉色 */
  color: #9E1F35;            /* 深大荔枝红 */
  border: 1px solid rgba(158, 31, 53, 0.1); /* 增加描边 */
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1.4;
  
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

/* 右侧占位 */
.spacer-end {
  flex: 0 0 40px;
}

/* --- 关键动画定义 --- */
@keyframes slideUpFade {
  0% {
    opacity: 0;
    transform: translateY(60px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>