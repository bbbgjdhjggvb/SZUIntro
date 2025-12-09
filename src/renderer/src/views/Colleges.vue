<template>
  <!--介绍内容-->
  <div class="main-box">
    <!-- 1. 侧边栏：添加 slide-in-left 动画 -->
    <div class="box-sidebar slide-in-left">
      <SideBar theme="light"></SideBar>
    </div>

    <!-- 2. 右侧内容区：添加 pop-in 动画 -->
    <div class="box-content-scroll pop-in-up">
      <div class="card-section">
        
        <!-- 加载状态占位 (可选，防止数据未加载时空白) -->
        <div v-if="loading" class="loading-skeleton">
          Loading...
        </div>

        <el-row v-else :gutter="20">
          <el-col
            v-for="(college, index) in colleges"
            :key="index"
            :span="8"
            class="col-item card-anim-item"
            :style="{ '--delay': index * 0.05 + 's' }" 
          >
            <!-- 
               注意：:style="{ '--delay': ... }" 是核心 
               根据 index 计算延迟时间，实现瀑布流效果 
            -->

            <div class="img-card" @click="goToDetail(college)">
              <div class="img-wrapper">
                <el-image
                  :src="college.image"
                  fit="cover"
                  class="college-img"
                  loading="lazy"
                >
                  <template #error>
                    <div class="image-slot"></div>
                  </template>
                </el-image>
              </div>
              
              <!--文字覆盖-->
              <div class="text-overlay" v-if="college.name">
                {{ college.name }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideBar from '@renderer/components/sidebar/SideBar.vue'

const router = useRouter()

interface College {
  id: number
  name: string
  description: string
  image: string
}

const colleges = ref<College[]>([])
const loading = ref(true) // 添加 loading 状态控制动画时机

// 首次加载执行
onMounted(async () => {
  try {
    const data = await window.fileReadApi?.readConfigFile() as any
    const rawColleges = data.college_associations || []

    // 并行处理图片数据
    const imgUrlProcTask = rawColleges.map(async (e: any) => {
      const realImgUrl = 'local-image://' + e.image
      return {
        ...e,
        image: realImgUrl || ''
      }
    });
    
    // 稍微延迟一下赋值，保证动画和数据同步出现（可选优化）
    colleges.value = await Promise.all(imgUrlProcTask)
  } catch (error) {
    console.error('Failed to load colleges data:', error)
  } finally {
    loading.value = false // 数据准备好了，开始渲染 DOM 并触发 CSS 动画
  }
})

// 跳轉詳情頁
const goToDetail = (college: College) => {
  // 增加一点点击后的延迟，让用户看清按压效果
  setTimeout(() => {
    router.push({
      name: 'CollegeDetail',
      query: {
        name: college.name,
        image: college.image 
      }
    })
  }, 100)
}
</script>

<style scoped>
.main-box{
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  overflow: hidden; /* 防止动画溢出 */
}

/* --- 1. 侧边栏动画 --- */
.box-sidebar{
  width: 80px;
  margin: 0px;
  background: transparent;
  
  /* 初始状态不可见 */
  opacity: 0;
  transform: translateX(-30px);
  /* 执行动画 */
  animation: slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.1s;
}

@keyframes slideInLeft {
  to { opacity: 1; transform: translateX(0); }
}

/* --- 2. 右侧容器动画 --- */
.box-content-scroll {
  flex: 1;
  height: 100%;
  padding: 20px;
  margin-right: 120px;
  margin-left: 40px;
  border-radius: 20px;
  overflow-y: auto;
  background-color: #fff;
  
  /* 容器入场动画 */
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  animation: containerPop 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  animation-delay: 0.2s;

  /* 隐藏滚动条 */
  scrollbar-width: none; 
  -ms-overflow-style: none; 
}
.box-content-scroll::-webkit-scrollbar { display: none; }

@keyframes containerPop {
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.card-section {
  width: 100%;
}

.col-item{
  margin-bottom: 20px;
}

/* --- 3. 卡片瀑布流动画 (核心) --- */
.card-anim-item {
  opacity: 0;
  transform: translateY(30px);
  /* 使用 backwards 填充模式，让元素在动画开始前保持 opacity:0 */
  animation: cardFadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  /* 使用内联样式 var(--delay) 来控制延迟 */
  animation-delay: var(--delay, 0s); 
}

@keyframes cardFadeUp {
  to { opacity: 1; transform: translateY(0); }
}

/* --- 卡片交互样式优化 --- */
.img-card {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px; /* 稍微大一点圆角 */
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05); /* 初始淡阴影 */
  transition: all 0.3s ease;
  background: #000; /* 图片加载前背景黑，防止文字看不清 */
}

/* 悬停效果：上浮 + 阴影 */
.img-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0,0,0,0.15);
}

/* 图片容器，用于做图片缩放动画 */
.img-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.college-img {
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.5s ease;
}

/* 悬停时图片轻微放大 */
.img-card:hover .college-img {
  transform: scale(1.05);
}

/* 点击按压效果 */
.img-card:active {
  transform: scale(0.96);
  transition: transform 0.1s;
}

.image-slot {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

/* 文字覆盖层优化 */
.text-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px 10px;
  color: white;
  font-size: 18px; /* 稍微调整字体大小适配 */
  font-weight: bold;
  text-align: center;
  /* 更平滑的渐变遮罩，确保文字清晰 */
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  letter-spacing: 1px;
}

.loading-skeleton {
  padding: 50px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>