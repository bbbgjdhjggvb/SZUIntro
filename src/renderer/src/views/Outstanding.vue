<template>
  <div class="main-box">
    <!-- 侧边栏：添加 translate3d 开启硬件加速 -->
    <div class="box-sidebar slide-in-left">
      <SideBar theme="light"></SideBar>
    </div>
    
    <div class="box-content">
      <!-- 左倒车按钮 -->
      <button class="nav-btn prev-btn" @click="prevPage" :disabled="currentPage === 1">
        <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
      </button>

      <!-- Grid 内容区 -->
      <!-- mode="out-in" 确保上一页完全消失后，下一页再显示，减少同时渲染两页的性能压力 -->
      <transition name="page-fade" mode="out-in">
        <div class="grid-container" :key="currentPage">
          <div
            v-for="(outstanding, index) in displayedOutstandings"
            :key="outstanding.id || index"
            class="alunmi-card"
            @click="openModal(outstanding)" 
          >
             <div class="card-img-box">
              <img 
                :src="outstanding.image" 
                class="avater" 
                loading="lazy"
                @load="onImgLoad"
              />
             </div>

             <div class="card-content">
              <h3 class="name">{{ outstanding.name }}</h3>
              <p class="meta">
                <span>{{ outstanding.year }}级</span>
                <span v-if="outstanding.year && outstanding.major">|</span>
                <span>{{ outstanding.major }}</span>
              </p>
             </div>
          </div>
        </div>
      </transition>

      <!-- 右前进按钮 -->
      <button class="nav-btn next-btn" @click="nextPage" :disabled="currentPage === totalPages">
        <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
      </button>
    </div>

    <!-- 详情弹窗 Modal -->
    <transition name="modal-fade">
      <div v-if="showModal && currentAlumni" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="close-btn" @click="closeModal">×</button>
          
          <div class="modal-body">
            <div class="modal-img-container">
              <img :src="currentAlumni.image" class="modal-img" />
            </div>
            
            <div class="modal-text-container">
              <h2 class="modal-name">{{ currentAlumni.name }}</h2>
              <p class="modal-meta">
                 {{ currentAlumni.year }}级 {{ currentAlumni.major }}
              </p>
              <div class="modal-border"></div>
              <div class="modal-desc-scroll">
                <p class="modal-desc">{{ currentAlumni.description || '暂无详细介绍' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SideBar from '@renderer/components/sidebar/SideBar.vue'

interface Outstanding {
  id: number
  name: string
  year: string
  major: string
  image: string
  description?: string 
}

const outstandings = ref<Outstanding[]>([])
const currentPage = ref(1)
const pageSize = 15

// Modal state
const showModal = ref(false)
const currentAlumni = ref<Outstanding | null>(null)

const loading = ref(true)

const totalPages = computed(() => Math.ceil(outstandings.value.length / pageSize))

const displayedOutstandings = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return outstandings.value.slice(start, start + pageSize)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const openModal = (alumni: Outstanding) => {
  currentAlumni.value = alumni
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// 图片加载优化：只在加载完成后显示
const onImgLoad = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target) {
    target.classList.add('loaded')
  }
}

onMounted(async () => {
  try {
    const data = await window.fileReadApi?.readConfigFileAccorName("outstanding_alumni.json") as any
    let existingData = data.outstanding_alumni || []

    const imgUrlProcTask = existingData.map(async (e: any) => {
      const realImgUrl = 'local-image:/' + e.image
      return {
        ...e,
        image: realImgUrl || '',
        description: e.description || '暂无资料'
      }
    });
    let processedData = await Promise.all(imgUrlProcTask)

    outstandings.value = processedData
  } catch (error) {
    console.error('Failed to load alumni data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Reset & Layout */
.main-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  background: transparent;
  align-items: stretch;
  overflow: hidden; /* 防止动画溢出 */
}

/* 侧边栏优化：使用 translate3d */
.box-sidebar {
  width: 80px;
  position: relative;
  z-index: 10;
  opacity: 0; 
  /* translate3d(0,0,0) 开启 GPU 加速 */
  transform: translate3d(-30px, 0, 0); 
  animation: slideInLeft 0.5s ease-out forwards;
  animation-delay: 0.1s;
}

@keyframes slideInLeft {
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

.box-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; 
  padding-top: 0px; 
  align-items: center;
  position: relative;
  padding-left: 20px;
  padding-right: 20px;
  margin-right: 80px;
  margin-left: 10px;
}

/* Grid Container */
.grid-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 10px 10px;
  width: 100%;
  max-width: 1200px;
  padding: 10px;
  min-height: 600px; 
  /* 性能优化：告知浏览器即将变化，提前分配层级 */
  will-change: opacity, transform;
}

/* Card Styles - 性能优化版 */
.alunmi-card {
  background: white;
  border-radius: 12px;
  /* 使用静态阴影，不要 transition box-shadow */
  box-shadow: 0 4px 10px rgba(158, 31, 53, 0.08); 
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 9px;
  cursor: pointer;
  /* 仅对 transform 进行过渡，性能开销小 */
  transition: transform 0.1s ease-out, background-color 0.2s;
  /* 修复 webkit 字体抗锯齿 */
  -webkit-font-smoothing: antialiased;
}

/* 移除 Hover，改为 Active (触摸按下) */
.alunmi-card:active {
  /* 简单的缩放反馈，比阴影变化更流畅 */
  transform: scale(0.96); 
  background-color: #f5f5f5; 
}

/* 页面切换动画 - 渐进渐出优化 */
.page-fade-enter-active,
.page-fade-leave-active {
  /* 缩短动画时间到 0.25s 提升响应感 */
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-fade-enter-from {
  opacity: 0;
  /* 使用 translate3d 减少重绘 */
  transform: translate3d(0, 10px, 0); 
}

.page-fade-leave-to {
  opacity: 0;
  transform: translate3d(0, -10px, 0);
}

/* 图片容器 */
.card-img-box {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 12px;

  border: 3px solid #f8f8f8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  flex-shrink: 0;
  background: #e0e0e0; /* 纯色背景比 loading图 更省资源 */
}

/* 图片加载淡入 */
.avater {
  width: 100%;
  height: 100%;

  object-fit: cover;
  /** 对齐头部，防止切掉头部 */
  object-position: top center;

  display: block;
  opacity: 0;
  transition: opacity 0.3s ease; /* 简单的透明度过渡 */

  border-radius: 12px;
}

.avater.loaded {
  opacity: 1;
}

.card-content {
  text-align: center;
  width: 100%;
}

.name {
  font-family: 'Songti SC', serif;
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 4px 0;
  color: #333;
}

.meta {
  font-size: 12px;
  color: #9E1F35; 
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  font-weight: 500;
}

/* Buttons - 移除 Hover */
.nav-btn {
  position: absolute;
  top: 45%; 
  transform: translateY(-50%);
  background: #9E1F35;
  color: white;
  border: none;
  width: 54px; 
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(158, 31, 53, 0.3);
  z-index: 20;
  /* 移除 transition all，仅特定属性 */
  transition: transform 0.1s, opacity 0.2s;
}

.nav-btn:active {
  transform: translateY(-50%) scale(0.9);
  background: #7d182a;
}

.nav-btn:disabled {
  background: #ccc;
  opacity: 0.5;
  box-shadow: none;
}

.prev-btn { left: 10px; }
.next-btn { right: 10px; }

.icon { width: 54px; height: 54px; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  /* 模糊滤镜非常消耗性能，低性能设备建议移除或减少 px */
  backdrop-filter: blur(4px); 
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  width: 800px;
  height: 500px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  overflow: hidden;
  /* 简化 Modal 动画 */
  animation: modalPop 0.2s ease-out;
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  z-index: 10;
  padding: 10px;
}
.close-btn:active { color: #333; }

.modal-body { display: flex; width: 100%; height: 100%; }
.modal-img-container { flex: 0 0 45%; background: #f0f0f0; overflow: hidden; }
.modal-img { width: 100%; height: 100%; object-fit: cover; }
.modal-text-container { flex: 1; padding: 50px 40px; display: flex; flex-direction: column; }
.modal-name { font-family: 'Songti SC', serif; font-size: 36px; color: #333; margin-bottom: 10px; font-weight: bold; }
.modal-meta { font-size: 16px; color: #9E1F35; margin-bottom: 20px; }
.modal-border { width: 40px; height: 4px; background: #9E1F35; margin-bottom: 30px; }
.modal-desc-scroll { flex: 1; overflow-y: auto; padding-right: 10px; -webkit-overflow-scrolling: touch; } /* 开启 iOS 滚动回弹 */
.modal-desc { font-size: 15px; line-height: 1.8; color: #555; text-align: justify; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>