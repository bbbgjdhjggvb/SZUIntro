<template>
  <div class="main-box">
    <div class="box-sidebar slide-in-left">
      <SideBar></SideBar>
    </div>

    <div class="box-content-scroll">
      <div class="gallery-timeline-view">
        
        <!-- 中间展示区 -->
        <div class="display-area">
          <!-- 背景大水印 -->
          <div class="bg-year-watermark">{{ currentYear }}</div>

          <transition name="fade-slide" mode="out-in">
            <!-- 有照片的情况 -->
            <div v-if="previewPhotos.length > 0" class="fixed-frame-container" :key="currentYear">
              
              <!-- 这里是固定的相框外壳 -->
              <div class="photo-frame-shell" @click="enterDetail(currentYear)">

                <!-- Swiper 放在相框内部，负责切换图片 -->
                <swiper
                  :modules="modules"
                  :effect="'fade'"
                  :fade-effect="{ crossFade: true }"
                  :slides-per-view="1"
                  :loop="true"
                  :autoplay="{
                    delay: 3500,
                    disableOnInteraction: false,
                  }"
                  :allow-touch-move="false" 
                  class="inner-swiper"
                >
                  <swiper-slide
                    v-for="(photoPath, idx) in previewPhotos"
                    :key="`${currentYear}-${idx}`"
                    class="inner-slide"
                  >
                    <img :src="photoPath" class="photo-img" loading="lazy" />
                  </swiper-slide>
                </swiper>

                <!-- 触摸诱导层（浮在 Swiper 上方，固定不动） -->
                <div class="touch-guide-overlay">
                  <div class="touch-content">
                    <div class="text-group">
                      <span class="main-text">点击进入相册</span>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
            
            <!-- 无照片的情况 -->
            <div v-else class="no-photo" :key="'no-' + currentYear">
              <div class="empty-icon">📂</div>
              <p>{{ currentYear }} 年暂无数字化影像</p>
              <p class="sub-text">/alumni_gallery/{{ currentYear }}</p>
            </div>
          </transition>

          <!-- 年份标题 -->
          <div class="year-info">
            <h2 class="year-title">
              <span class="decoration-line"></span>
              <span class="year-number">{{ currentYear }}</span>
              <span class="year-text">届</span>
              <span class="decoration-line"></span>
            </h2>
            <p class="year-subtitle">SHENZHEN UNIVERSITY</p>
          </div>
        </div>

        <!-- 底部时光轴 (保持不变) -->
        <div class="timeline-wrapper">
          <div class="timeline-line"></div>
          <div class="year-swiper-container">
            <swiper
              :slides-per-view="'auto'"
              :centered-slides="true"
              :space-between="0"
              :grab-cursor="true"
              @swiper="onSwiper"
              @slide-change="onSlideChange"
              class="year-swiper"
            >
              <swiper-slide v-for="(year, index) in years" :key="year" class="year-slide">
                <div class="year-item" :class="{ 'is-active': year === currentYear }" @click="handleYearClick(index)">
                  <div class="dot-wrapper">
                    <div class="dot"></div>
                    <div class="dot-halo"></div>
                  </div>
                  <span class="text">{{ year }}</span>
                </div>
              </swiper-slide>
            </swiper>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from '@renderer/components/sidebar/SideBar.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/effect-fade' // 引入淡入淡出样式

// 引入模块：使用 Fade 效果替代 Coverflow
import { Autoplay, EffectFade } from 'swiper/modules'

import { ref, watch} from 'vue'
import { useRouter } from 'vue-router'

const modules = [Autoplay, EffectFade]

interface PhotoItem {
  fullPath: string
  displayName: string
  title: string
}

const STORAGE_KEY = 'gallery_current_year'
const startYear = 1988
const endYear = 2021
const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)

const inityear = () => {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    const y = parseInt(stored);
    if (y >= startYear && y <= endYear){
      return y;
    }
  }

  return startYear;
};
const currentYear = ref(inityear())
const swiperInstance = ref<any>(null)

// --- 动态数据状态 ---
const photoItems = ref<PhotoItem[]>([]) 
const previewPhotos = ref<string[]>([]) 

// --- 核心逻辑：加载照片 ---
const loadYearPhotos = async (year: number) => {
  // 不清空 previewPhotos，利用 Vue 的 diff 算法让切换更平滑，或者根据需求清空
  // previewPhotos.value = [] 
  
  const yearDir = `/alumni_gallery/${year}`
  
  try {
    const items = await (window as any).fileReadApi?.getImageFilesInDir(yearDir)
    
    if (items && Array.isArray(items) && items.length > 0) {
      photoItems.value = items 

      // 取前 8 张轮播
      const slideItems = items.slice(0, 8)
      
      const urlTasks = slideItems.map(async (filePath) => {
        // '/'安全处理，即使后端传回
        let safePath = filePath.displayName.replace(/\\/g, '/')
        if(safePath.startsWith('/')) safePath = safePath.slice(1)
        return "local-image://" + safePath
      })
      
      previewPhotos.value = await Promise.all(urlTasks)
    } else {
      photoItems.value = []
      previewPhotos.value = []
    }
  } catch (error) {
    console.error(`加载 ${year} 照片失败:`, error)
    photoItems.value = []
    previewPhotos.value = []
  }
}

const router = useRouter()
// 按钮导航
const enterDetail = (year: number) => {
  router.push({
    name: 'GalleryDetail',
    params: {year: year}
  });
};

// 添加监听currentYear变化，并进行存储
watch(currentYear, (newYear) => {
  sessionStorage.setItem(STORAGE_KEY, newYear.toString());
  loadYearPhotos(newYear)
}, { immediate: true })

// 底部时间轴 Swiper 逻辑
const onSwiper = (swiper: any) => {
  swiperInstance.value = swiper
  const index = years.indexOf(currentYear.value)
  if (index !== -1){
    // speed=0 表示瞬间切换，没有滑动动画
    // runCallbacks=false 表示不触发 slideChange 事件，防止循环触发
    swiper.slideTo(index, 0, false)
  }
}

const onSlideChange = (swiper: any) => {
  currentYear.value = years[swiper.activeIndex]
}

const handleYearClick = (index: number) => {
  if (swiperInstance.value) {
    swiperInstance.value.slideTo(index)
  }
}

</script>

<style scoped>
:root {
  --szu-red: #9E1F35;
  --szu-red-light: #C44D62;
  --szu-gold: #D4AF37;
}

.main-box { width: 100%; height: 100%; display: flex; overflow: hidden; }

.box-sidebar { 
  width: 80px; 
  flex-shrink: 0; 
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

.box-content-scroll { flex: 1; height: 100%; overflow: hidden; position: relative; margin-right: 130px; margin-left: 60px;}
.gallery-timeline-view { display: flex; flex-direction: column; height: 100%; }

/* --- 中间展示区 --- */
.display-area { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  position: relative; 
  z-index: 2; 
}

.bg-year-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -60%); font-size: 20vw; font-family: 'Times New Roman', serif; font-weight: bold; color: #9E1F35; opacity: 0.04; pointer-events: none; z-index: 0; }

/* === 固定相框容器 (Fixed Frame) === */
.fixed-frame-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  /* 初始出现的动画 */
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* 相框外壳：负责形状、边框、阴影 */
.photo-frame-shell {
  width: 760px;  /* 固定宽度 */
  height: 360px; /* 固定高度 */
  position: relative;
  background: #fff;
  border-radius: 8px;
  /* 拍立得效果：上左右窄边框，下宽边框 */
  padding: 10px 10px 40px 10px; 
  box-shadow: 0 20px 50px rgba(158, 31, 53, 0.25);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 点击/按压效果 */
.photo-frame-shell:active {
  transform: scale(0.98);
  box-shadow: 0 10px 30px rgba(158, 31, 53, 0.2);
}

/* 内部 Swiper：填满上半部分 */
.inner-swiper {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: #f0f0f0; /* 图片未加载时的底色 */
  overflow: hidden;
}

.inner-slide {
  width: 100%;
  height: 100%;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证填满，不留白 */
  display: block;
}

/* === 触摸诱导层 (覆盖在 Swiper 之上) === */
.touch-guide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px; /* 刚好覆盖拍立得的底部留白区域 */
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  pointer-events: none; /* 让点击穿透给 shell */
}

/* 也可以选择覆盖全图，这里设计为覆盖底部文字区，显得更干净 */
.touch-content {
  display: flex;
  align-items: center;
  color: #9E1F35; /* 深大红字体 */
}


.text-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.main-text {
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
}

.sub-text {
  font-size: 11px;
  opacity: 0.7;
  letter-spacing: 0.5px;
}

/* 动画定义 */
@keyframes popIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulseIcon {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(158, 31, 53, 0.4); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(158, 31, 53, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(158, 31, 53, 0); }
}

/* 年份标题样式 */
.year-info { text-align: center; margin-top: 20px; z-index: 2; }
.year-title { 
  font-family: "Times New Roman", serif;
  font-size: 48px;
  color: #9E1F35;
  display: flex;
  align-items: center; 
  justify-content: center; 
  gap: 15px; 
  margin: 0; 
}

.decoration-line { width: 40px; height: 2px; background: linear-gradient(90deg, transparent, #9E1F35); }
.decoration-line:last-child { background: linear-gradient(90deg, #9E1F35, transparent); }
.year-subtitle { font-size: 10px; letter-spacing: 4px; color: #7A1225; opacity: 0.6; margin-top: 5px; }

.year-number{
  font-family: "Times New Roman", serif;
  font-size: 60px;
  font-weight: bold;
  line-height: 1;
  transform: translateY(4px);
}

.year-text{
  font-family: "MySourceHanSerifBold";
  font-size: 56px;
  margin-left: -5px;
  margin-top: 8px;
  opacity: 0.9;
  /* transform: translateY(-1px); */
}

/* 缺省状态 */
.no-photo { text-align: center; color: #9E1F35; opacity: 0.6; padding: 100px 0;}

/* 底部时间轴样式 (保持不变) */
.timeline-wrapper { height: 220px; background: transparent; position: relative; display: flex; align-items: center; margin-bottom: 20px; }
.timeline-line { position: absolute; top: 45px; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, rgba(158, 31, 53, 0) 0%, rgba(158, 31, 53, 0.6) 20%, rgba(158, 31, 53, 1) 50%, rgba(158, 31, 53, 0.6) 80%, rgba(158, 31, 53, 0) 100%); z-index: 1; }
.year-swiper-container { width: 100%; height: 100%; z-index: 2; mask-image: linear-gradient(90deg, transparent, black 15%, black 85%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, black 15%, black 85%, transparent); }
.year-slide { width: 100px; height: 100%; display: flex; justify-content: center; padding-top: 25px; cursor: pointer; user-select: none; }
.year-item { display: flex; flex-direction: column; align-items: center; transition: all 0.4s; opacity: 0.5; transform: scale(0.85); }
.dot-wrapper { position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.dot { width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 2px solid #9E1F35; z-index: 2; transition: all 0.3s; }
.dot-halo { position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(158, 31, 53, 0.15); transform: scale(0); transition: transform 0.4s ease; }
.text { font-family: 'Times New Roman', sans-serif; font-size: 14px; font-weight: bold; color: #7A1225; transition: all 0.3s; }
.year-item.is-active { opacity: 1; transform: scale(1.1) translateY(-5px); }
.year-item.is-active .dot { background: #9E1F35; border-color: #fff; box-shadow: 0 0 0 2px #9E1F35; width: 14px; height: 14px; }
.year-item.is-active .dot-halo { transform: scale(1); animation: pulse 2s infinite; }
.year-item.is-active .text { color: #9E1F35; font-size: 20px; text-shadow: 0 1px 0 rgba(255,255,255,1); }
</style>