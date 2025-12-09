<template>
  <div class="detail-container">
    <!-- 1. 侧边栏：滑入动画 -->
    <div class="box-sidebar slide-in-left">
      <SideBar theme="light"></SideBar>
    </div>
    
    <!-- 2. 主要内容区：容器放大入场 -->
    <div class="content-area container-pop">
      
      <!-- 左侧图片区域：延迟 0.3s 上浮 -->
      <div class="image-section anim-item delay-1">
        <el-image 
          v-if="imageUrl"
          :src="imageUrl" 
          fit="contain" 
          class="detail-image"
        >
          <template #error>
            <div class="image-placeholder">
              <span>暂无图片</span>
            </div>
          </template>
        </el-image>
        <div v-else class="image-placeholder">
          <span>暂无图片</span>
        </div>
      </div>

      <!-- 右侧文字区域 -->
      <div class="text-section">
        <!-- 标题：延迟 0.4s 上浮 -->
        <h1 class="anim-item delay-2">{{ title || '未命名学院' }}</h1>
        
        <!-- 描述文本：延迟 0.5s 上浮 -->
        <div class="description anim-item delay-3">
          <p>这里是学院介绍内容的预留区域。</p>
          <p>深圳大学{{ title }}成立于...</p>
          <p>（此处展示更多详细介绍信息）</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SideBar from '@renderer/components/sidebar/SideBar.vue'

const route = useRoute()
const title = ref('')
const imageUrl = ref('')

onMounted(() => {
  // 从路由参数中获取数据
  title.value = route.query.name as string || ''
  imageUrl.value = route.query.image as string || ''
})
</script>

<style scoped>
/* 容器布局 */
.detail-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: transparent;
  overflow: hidden;
}

/* --- 1. 侧边栏动画 --- */
.box-sidebar {
  width: 80px;
  background: transparent;
  
  opacity: 0;
  transform: translateX(-30px);
  animation: slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.1s;
}

@keyframes slideInLeft {
  to { opacity: 1; transform: translateX(0); }
}

/* --- 2. 内容容器动画 --- */
.content-area {
  flex: 1;
  display: flex;
  padding: 30px; /* 稍微增加内边距 */
  margin-right: 120px;
  margin-left: 40px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.95); /* 稍微不透明一点，提升阅读体验 */
  gap: 40px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08); /* 增加阴影立体感 */

  /* 容器入场动画 */
  opacity: 0;
  transform: scale(0.98) translateY(20px);
  animation: containerExpand 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  animation-delay: 0.2s;
}

@keyframes containerExpand {
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* --- 3. 内部元素交错动画 --- */
.anim-item {
  opacity: 0;
  transform: translateY(20px);
  animation: itemFadeUp 0.6s ease-out forwards;
}

/* 定义不同的延迟时间，形成流水线效果 */
.delay-1 { animation-delay: 0.3s; } /* 图片 */
.delay-2 { animation-delay: 0.4s; } /* 标题 */
.delay-3 { animation-delay: 0.5s; } /* 文本 */

@keyframes itemFadeUp {
  to { opacity: 1; transform: translateY(0); }
}

/* --- 样式细节优化 --- */
.image-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.03); /* 内部阴影，增加质感 */
}

.detail-image {
  width: 100%;
  height: 100%;
  max-height: 100%;
  transition: transform 0.5s;
}
/* 鼠标放上去稍微动一下图片，增加交互感 */
.image-section:hover .detail-image {
  transform: scale(1.03);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  color: #999;
  font-size: 16px;
}

.text-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
}

h1 {
  font-family: 'MySourceHanSerifBold', serif; /* 保持字体统一 */
  font-size: 36px;
  color: #9E1F35; /* 深大红 */
  margin-bottom: 24px;
  border-bottom: 2px solid rgba(158, 31, 53, 0.2);
  padding-bottom: 15px;
  display: inline-block;
}

.description {
  font-family: 'MySourceHanSerifRegular', serif;
  font-size: 18px;
  line-height: 1.8;
  color: #444;
  white-space: pre-wrap;
  text-align: justify; /* 两端对齐更整齐 */
}
</style>