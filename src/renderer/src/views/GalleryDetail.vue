<template>
  <div class="main-box">
    <!-- 1. 侧边栏 (保持透明背景，只显示图标) -->
    <div class="box-sidebar">
      <SideBar></SideBar>
    </div>

    <!-- 2. 右侧内容区 (白色背景加在这里) -->
    <div class="box-content-scroll">
      
      <div class="page-container" :class="{ 'loaded': isLoaded }">
        
        <!-- 图片网格列表 -->
        <div class="gallery-grid">
          <div 
            v-for="(item, index) in photoItems" 
            :key="item.fullPath" 
            class="photo-card"
            :style="{ '--delay': index * 0.05 + 's' }" 
            @click="openFullScreen(item)"
          >
            <!-- 图片容器 (移除了遮罩层 overlay) -->
            <div class="img-wrapper">
              <img :src="getSafeUrl(item.displayName, 'thumb')"/>
            </div>
            <!-- 标题 -->
            <div class="card-footer">
              <span class="photo-title">{{ item.title || '未命名照片' }}</span>
            </div>
          </div>
        </div>
        
        <div class="bottom-spacer"></div>
      </div>
    </div>

    <!-- 3. 全屏展示层 -->
    <transition name="fade">
      <div v-if="fullScreen.show" class="fullscreen-modal" @click="closeFullScreen">
        <div class="fullscreen-content">
          <img :src="fullScreen.url" class="fullscreen-image" @click.stop />
          <div class="fullscreen-caption">
            <h3>{{ fullScreen.title }}</h3>
            <p>点击屏幕任意处退出</p>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import SideBar from '@renderer/components/sidebar/SideBar.vue'
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const year = route.params.year || '1988' 

const isLoaded = ref(false)

interface PhotoItem {
  fullPath: string
  displayName: string
  title: string
}

const photoItems = ref<PhotoItem[]>([])

const fullScreen = reactive({
  show: false,
  url: '',
  title: ''
})

const getSafeUrl = (path: string, type: 'thumb' | 'original' = 'original') => {
  let safePath = path.replace(/\\/g, '/');
  if(safePath.startsWith('/')) safePath = safePath.slice(1);
  const baseUrl = "local-image://" + safePath;
  return type === 'thumb' ? `${baseUrl}?type=thumb`:baseUrl;
}

const loadPhotos = async () => {
  const yearDir = `/alumni_gallery/${year}`
  try {
    const items = await (window as any).fileReadApi?.getImageFilesInDir(yearDir)
    if (items && Array.isArray(items)) {
      photoItems.value = items
    }
  } catch (error) {
    console.error(`加载失败:`, error)
  } finally {
    setTimeout(() => { isLoaded.value = true }, 100)
  }
}

const openFullScreen = (item: PhotoItem) => {
  fullScreen.url = getSafeUrl(item.displayName, 'original')
  fullScreen.title = item.title || '未命名照片'
  fullScreen.show = true
}

const closeFullScreen = () => {
  fullScreen.show = false
}

onMounted(() => {
  loadPhotos()
})
</script>

<style scoped>
.main-box {
  width: 100%;
  height: 100%;
  background: transparent; /* 关键：改为透明，露出底下的红色背景 */
  display: flex; 
  flex-direction: row;
  align-items: stretch;
  position: relative;
  overflow: hidden;
}

.box-sidebar {
  width: 100px; /* 根据左侧返回按钮的实际宽度调整，留出空间 */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 右侧白色内容盒子 */
.box-content-scroll {
  flex: 1; 
  height: 95%; /* 不占满高度，留点上下边距更好看 */
  margin-top: 10px;
  margin-right: 88px; /* 右边距 */
  margin-left: 10px;   /* 左边紧贴 sidebar 区域，由 sidebar 的 width 撑开距离 */
  
  background: rgba(255, 255, 255, 0.95); /* 白色背景移到这里，微透明更有质感 */
  border-radius: 20px; /* 圆角 */
  box-shadow: 0 10px 30px rgba(0,0,0,0.1); /* 添加阴影增加层次感 */

  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  
  /* 隐藏滚动条 */
  scrollbar-width: none; 
  -ms-overflow-style: none; 
}

.box-content-scroll::-webkit-scrollbar {
  display: none;
}

/* === 页面容器 === */
.page-container {
  padding: 30px 50px; /* 内部内边距 */
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.page-container.loaded {
  opacity: 1;
  transform: translateY(0);
}

.title {
  margin: 0;
  font-family: 'Times New Roman', serif;
  font-size: 36px;
  color: #9E1F35;
  font-weight: bold;
}

.subtitle {
  display: block;
  margin-top: 10px;
  font-size: 14px;
  color: #999;
  letter-spacing: 2px;
}

/* === 网格布局 === */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* 卡片稍微大一点方便触摸 */
  gap: 30px;
}

/* === 照片卡片 (触摸屏优化版) === */
.photo-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  /* 初始阴影，稍微明显一点 */
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  /* 移除 hover 的 transform transition，只保留 active 效果 */
  transition: transform 0.1s ease, box-shadow 0.1s ease; 
  
  /* 入场动画 */
  animation: fadeUp 0.6s backwards;
  animation-delay: var(--delay, 0s);
  
  /* 消除触摸高亮背景色 */
  -webkit-tap-highlight-color: transparent;
}

/* 
   关键：Active 状态 (手指按下时) 
   模拟按压效果：缩小 + 阴影减弱
*/
.photo-card:active {
  transform: scale(0.96);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.img-wrapper {
  width: 100%;
  aspect-ratio: 4/3;
  background: #f0f0f0;
  position: relative;
  overflow: hidden;
}

.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-footer {
  padding: 15px;
  background: #fff;
  border-top: 1px solid #f9f9f9;
}

.photo-title {
  display: block;
  font-size: 15px; /* 字体稍微大一点方便阅读 */
  color: #444;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.bottom-spacer { height: 60px; }

/* === 全屏展示 === */
.fullscreen-modal {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-content {
  position: relative;
  max-width: 95%;
  max-height: 95%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fullscreen-image {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 4px;
  border: 4px solid #fff;
}

.fullscreen-caption {
  margin-top: 20px;
  text-align: center;
  color: #fff;
}

.fullscreen-caption h3 {
  font-size: 22px;
  font-weight: normal;
  margin-bottom: 8px;
}

.fullscreen-caption p {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
}

/* === Vue Transition 动画 === */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>