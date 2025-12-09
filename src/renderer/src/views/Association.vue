<template>
  <div class="main-box">
    <!-- 侧边栏：添加 slide-in 动画类 -->
    <div class="box-sidebar slide-in-left">
      <SideBar></SideBar>
    </div>

    <div class="box-content-scroll">
      <div class="bottom-section">
        
        <!-- 加载中显示骨架屏或 Loading (可选) -->
        <div v-if="loading" class="loading-state">
          Loading...
        </div>

        <!-- 内容区域：添加 transition-group 实现子元素依次进场 -->
        <div v-else class="introduction-container pop-in-up">
          
          <!-- 标题 -->
          <div class="anim-item delay-1">
            <h1>深圳大学教育发展基金会介绍</h1>
          </div>
          
          <!-- 文本 -->
          <div class="anim-item delay-2" style="padding: 10px 40px;">
            <p class="intro-text">{{ associationData.texts[0] }}</p>
          </div>
          
          <!-- 图片 -->
          <div class="img-container anim-item delay-3">
            <img :src="associationData.images[0]" class="fade-img" />
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from '@renderer/components/sidebar/SideBar.vue'
import { ref, onMounted } from 'vue'

interface AssociationData {
  images: string[]
  texts: string[]
}

const loading = ref(true) // 添加加载状态
const associationData = ref<AssociationData>({
  images: [],
  texts: ['']
})

onMounted(async () => {
  try {
    // 模拟一个小延迟，让动画看起来更自然（可选）
    // await new Promise(resolve => setTimeout(resolve, 300));

    const data = await window.fileReadApi?.readConfigFile() as any;
    if(data && data.association) {
        associationData.value = data.association;
        // 如果你需要转换图片路径
        associationData.value.images = ['local-image://association/assoc_1.png']
    }
  } catch (error) {
    console.error('Failed to load association data:', error)
  } finally {
    loading.value = false // 数据加载完毕，显示内容
  }
})
</script>

<style scoped>
/* 保留你原有的布局样式 */
.main-box {
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.box-sidebar {
  width: 80px;
  margin: 0px;
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

.box-content-scroll {
  height: 100%;
  margin-right: 120px;
  margin-left: 40px;
  overflow-y: auto;
  border-radius: 20px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.box-content-scroll::-webkit-scrollbar { display: none; }

.bottom-section {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- 内容容器动画 --- */
.introduction-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  font-size: 17px;
  border-radius: 12px; /* 建议加个圆角 */
  box-shadow: 0 8px 30px rgba(0,0,0,0.05); /* 加点阴影更有层次 */
  padding: 40px 0; /* 增加内边距 */
  
  /* 容器本身的入场动画 */
  opacity: 0;
  transform: scale(0.95);
  animation: containerPop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.3s;
}

@keyframes containerPop {
  to { opacity: 1; transform: scale(1); }
}

/* --- 内部元素交错动画 --- */
.anim-item {
  opacity: 0;
  transform: translateY(20px);
  animation: itemFadeUp 0.6s ease-out forwards;
}

/* 延迟控制 */
.delay-1 { animation-delay: 0.4s; }
.delay-2 { animation-delay: 0.5s; }
.delay-3 { animation-delay: 0.6s; }

@keyframes itemFadeUp {
  to { opacity: 1; transform: translateY(0); }
}

/* 字体样式 */
.introduction-container h1 {
  font-family: 'MySourceHanSerifBold';
  margin-bottom: 20px;
}
.intro-text {
  font-family: 'MySourceHanSerifRegular';
  line-height: 1.8;
  text-align: justify;
}

.img-container {
  padding: 10px 15px;
  width: 70%;
  height: auto;
  margin-top: 20px;
}
.img-container img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>