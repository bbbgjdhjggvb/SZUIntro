<template>
  <div class="main-box">
    <div class="box-sidebar slide-in-left">
      <SideBar theme="light"></SideBar>
    </div>
    
    <div class="box-content">
      <!-- 左倒车按钮 -->
      <button class="nav-btn prev-btn" @click="prevPage" :disabled="currentPage === 1">
        <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
      </button>

      <!-- Grid 内容区 -->
      <div class="grid-container">
        <div
          v-for="(outstanding, index) in displayedOutstandings"
          :key="outstanding.id || index"
          class="alunmi-card"
          :style="{ '--delay': (index % 15) * 0.05 + 's' }"
          @click="openModal(outstanding)" 
        >
           <div class="card-img-box">
            <img :src="outstanding.image" class="avater" loading="lazy" />
           </div>

           <div class="card-content">
            <h3 class="name">{{ outstanding.name }}</h3>
            <p class="meta">
              <!-- 新增 '级' 后缀 -->
              <span>{{ outstanding.year }}级</span>
              <span v-if="outstanding.year && outstanding.major">|</span>
              <span>{{ outstanding.major }}</span>
            </p>
           </div>
        </div>
      </div>

      <!-- 右前进按钮 -->
      <button class="nav-btn next-btn" @click="nextPage" :disabled="currentPage === totalPages">
        <svg viewBox="0 0 24 24" class="icon"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
      </button>

      <!-- 底部 Pagination Dots -->
      <!-- <div class="pagination-dots">
        <span 
          v-for="p in totalPages" 
          :key="p" 
          class="dot" 
          :class="{ active: p === currentPage }"
          @click="goToPage(p)"
        ></span>
      </div> -->
    </div>

    <!-- 详情弹窗 Modal -->
    <transition name="modal-fade">
      <div v-if="showModal && currentAlumni" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="close-btn" @click="closeModal">×</button>
          
          <div class="modal-body">
            <!-- 左侧完整图片 -->
            <div class="modal-img-container">
              <img :src="currentAlumni.image" class="modal-img" />
            </div>
            
            <!-- 右侧文字介绍 -->
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
  lables: string[]
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

const goToPage = (p: number) => {
  currentPage.value = p
}

// Modal functions
const openModal = (alumni: Outstanding) => {
  currentAlumni.value = alumni
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  // briefly wait to clear currentAlumni for animation if needed, or just keep it
}

onMounted(async () => {
  try {
    const data = await window.fileReadApi?.readConfigFile() as any
    let existingData = data.outstanding_alumni || []

    const imgUrlProcTask = existingData.map(async (e: any) => {
      const realImgUrl = 'local-image:/' + e.image
      return {
        ...e,
        image: realImgUrl || '',
        // 如果原有数据没有description，赋一个初始值（如果有的话使用原有的）
        description: e.description || '杰出校友，在各自领域均有建树，为社会做出了重要贡献。深圳大学校友会致力于联络校友，弘扬母校传统，促进校友事业发展。'
      }
    });
    let processedData = await Promise.all(imgUrlProcTask)

    const totalTarget = 105
    if (processedData.length < totalTarget) {
        const mockCount = totalTarget - processedData.length
        const placeholderImg = processedData.length > 0 ? processedData[0].image : '' 
        
        // 长文本 Mock
        const mockDesc = "这里是校友的详细介绍文本。深圳大学（Shenzhen University），简称“深大”，位于广东省深圳市，是经中华人民共和国教育部批准设立，由广东省主管、深圳市人民政府主办的综合性大学。学校致力于培养高素质创新创业人才，引领社会进步和发展。这位校友在毕业后投身于行业建设，取得了卓越的成就..."

        for (let i = 0; i < mockCount; i++) {
            processedData.push({
                id: 9999 + i,
                name: `姓名姓名`,
                year: '1990',
                major: '会计专业',
                lables: [],
                image: placeholderImg,
                description: mockDesc
            })
        }
    }

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
}

.box-sidebar {
  width: 80px;
  position: relative;
  z-index: 10;
  opacity: 0; 
  transform: translateX(-30px);
  animation: slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.2s;
}

@keyframes slideInLeft {
  to { opacity: 1; transform: translateX(0); }
}

.box-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* 整体上移：使用 padding-bottom 代替 evenly，或者加 padding-top 调整 */
  justify-content: flex-start; 
  padding-top: 20px; /* 顶部预留空间，让整体靠上 */
  align-items: center;
  position: relative;
  padding-left: 40px;
  padding-right: 40px;
  margin-right: 80px;
  margin-left: 10px;
}

/* Grid Container */
.grid-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 20px 24px; /* 横向间距加大一点 */
  width: 100%;
  max-width: 1100px; /* 稍微限制最大宽度，防止太散 */
  padding: 10px;
}

/* Card Styles */
.alunmi-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(158, 31, 53, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 9px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer; /* 变为手型 */
  
  opacity: 0;
  animation: popIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
}

.alunmi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(158, 31, 53, 0.15);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.card-img-box {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 12px;
  border: 3px solid #f8f8f8;
  position: relative;
  flex-shrink: 0;
}

.avater {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 确保头部不被切掉 */
  object-position: top center; 
  display: block;
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

/* Navigation Buttons */
.nav-btn {
  position: absolute;
  top: 50%; /* 这里的 50% 是相对于 box-content 的 */
  /* 由于 box-content 现在是 flex-start，可能需要微调 top 值或者让它固定在屏幕中间 */
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
  box-shadow: 0 4px 16px rgba(158, 31, 53, 0.3);
  transition: all 0.3s ease;
  z-index: 20;
}

.nav-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

.prev-btn { left: 10px; }
.next-btn { right: 10px; }

.icon {
  width: 54px;
  height: 54px;
}

/* Pagination Dots */
.pagination-dots {
  position: absolute;
  bottom: 10px; 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(158, 31, 53, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dot:hover {
  background: rgba(158, 31, 53, 0.5);
}

.dot.active {
  background: #9E1F35;
  transform: scale(1.4);
}

/* --- Modal Styles --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
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
  animation: modalScaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  z-index: 10;
  transition: color 0.2s;
}
.close-btn:hover { color: #333; }

.modal-body {
  display: flex;
  width: 100%;
  height: 100%;
}

.modal-img-container {
  flex: 0 0 45%; 
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.modal-img {
  width: 100%;
  height: 100%;
  /* 左侧展示完整图片：object-fit cover 全屏铺满该区域 或者 contain 看需求。
     用户说“完整的图片”，通常 cover 比较好看且无留白，前提是照片比例合适。
     如果照片比例差异大，cover 可能会切。可以尝试 contain 并加背景色。
     这里先用 cover 保证美观。*/
  object-fit: cover; 
}

.modal-text-container {
  flex: 1;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.modal-name {
  font-family: 'Songti SC', serif;
  font-size: 36px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.modal-meta {
  font-size: 16px;
  color: #9E1F35;
  margin-bottom: 20px;
}

.modal-border {
  width: 40px;
  height: 4px;
  background: #9E1F35;
  margin-bottom: 30px;
}

.modal-desc-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  width: 100%;
}

/* 自定义滚动条 */
.modal-desc-scroll::-webkit-scrollbar {
  width: 6px;
}
.modal-desc-scroll::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 3px;
}

.modal-desc {
  font-size: 15px;
  line-height: 1.8;
  color: #555;
  text-align: justify;
}

@keyframes modalScaleIn {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>