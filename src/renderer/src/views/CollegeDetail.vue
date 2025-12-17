<template>
  <div class="detail-wrapper">
    <!-- 侧边栏 -->
    <div class="box-sidebar slide-in-left">
      <SideBar theme="light"></SideBar>
    </div>

    <!-- 详情内容区 -->
    <div class="detail-container" v-if="collegeData">
      
      <!-- 1. 顶部 Header 区域 -->
      <div class="header-section anim-item delay-1">
        <h1 class="main-title">{{ collegeData.name }}</h1>
        <div class="title-decoration">
          <span class="line-dot"></span>
          <span class="line-bar"></span>
          <span class="line-dot"></span>
        </div>
      </div>

      <!-- 2. 主体布局 -->
      <div class="content-body">
        
        <!-- 左侧：文字介绍 -->
        <div class="left-scroll-area custom-scrollbar">
          <!-- 发展背景 -->
          <div class="section-block anim-item delay-2" v-if="collegeData.background && collegeData.background.trim()">
            <h3 class="section-title"><span class="icon-box">📜</span> 校友会成立时间背景</h3>
            <p class="section-desc">{{ collegeData.background }}</p>
          </div>

          <!-- 学院简介 -->
          <div class="section-block anim-item delay-3" v-if="collegeData.description && collegeData.description.trim()">
            <h3 class="section-title"><span class="icon-box">🎓</span> 校友会发展历程</h3>
            <p class="section-desc">{{ collegeData.description }}</p>
          </div>

          <!-- 重点活动列表 -->
          <div class="section-block anim-item delay-4" v-if="collegeData.activitys && collegeData.activitys.length > 0">
            <h3 class="section-title"><span class="icon-box">🌟</span> 校友会精彩活动</h3>
            <ul class="activity-list">
              <li v-for="(act, idx) in collegeData.activitys" :key="idx">{{ act }}</li>
            </ul>
          </div>
          <div style="height: 40px;"></div>
        </div>

        <!-- 右侧：影像集锦 -->
        <div class="right-fixed-area anim-item delay-5">
          <div class="gallery-wrapper">
            <h3 class="gallery-title"><span class="icon-box">📸</span> 影像集锦</h3>
            
            <div class="carousel-box" v-if="galleryImages.length > 0">
              <el-carousel trigger="click" height="400px" indicator-position="outside" :interval="4000" arrow="hover">
                <el-carousel-item v-for="(img, idx) in galleryImages" :key="idx">
                  <el-image
                    :src="img"
                    fit="cover"
                    class="carousel-img"
                    loading="lazy"
                    :preview-src-list="galleryImages" 
                    :initial-index="idx"
                    :preview-teleported="true"
                    hide-on-click-modal
                  />
                </el-carousel-item>
              </el-carousel>
            </div>
            
            <div v-else class="empty-gallery">
              <div class="empty-icon">🖼️</div>
              <p>暂无影像资料</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SideBar from '@renderer/components/sidebar/SideBar.vue';

const route = useRoute();
const collegeData = ref<any>(null);
const galleryImages = ref<string[]>([]);

onMounted(async () => {
  const id = Number(route.query.id);
  if (!id) return;
  try {
    const json = await window.fileReadApi?.readConfigFileAccorName('college_association.json') as any;
    const list = json.college_associations || [];
    const target = list.find((c: any) => c.id === id);

    if (target) {
      collegeData.value = target;
      if (target.images) {
        const imgs = await window.fileReadApi?.getFlatDirImages(target.images);
        if (imgs && Array.isArray(imgs)) {
          galleryImages.value = imgs.map((path: string) => 'local-image://' + path);
        }
      }
    }
  } catch (e) {
    console.error("Detail load error", e);
  }
});
</script>

<!-- 1. 原有的 scoped 样式保持不变 -->
<style scoped>
.detail-wrapper { 
  width: 100%; 
  height: 100%; 
  display: flex; 
  overflow: hidden; 
  color: transparent;
}
.box-sidebar { width: 80px; flex-shrink: 0; z-index: 10; opacity: 0; animation: slideInLeft 0.6s forwards 0.2s; }
.detail-container { 
  flex: 1; 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  padding: 0 40px;
  overflow: hidden; 
  opacity: 0; 
  animation: fadeIn 0.5s forwards 0.2s; 
  background: #fdfdfd;
  border-radius: 12px;
  margin-left: 20px;
  margin-right: 40px;
}

/* Header */
.header-section { flex-shrink: 0; padding: 30px 0 20px 0; text-align: center; }
.main-title { font-family: 'Songti SC', serif; font-size: 38px; color: #9E1F35; margin: 0 0 15px 0; font-weight: bold; letter-spacing: 2px; }
.title-decoration { display: flex; align-items: center; justify-content: center; gap: 8px; }
.line-bar { width: 120px; height: 4px; background: linear-gradient(90deg, transparent, #9E1F35, transparent); border-radius: 2px; }
.line-dot { width: 6px; height: 6px; background: #9E1F35; border-radius: 50%; opacity: 0.6; }

/* Content Body */
.content-body { flex: 1; display: flex; gap: 60px; overflow: hidden; padding-bottom: 20px; }
.left-scroll-area { flex: 5; height: 100%; overflow-y: auto; padding-right: 20px; }
.right-fixed-area { flex: 4; height: 100%; display: flex; flex-direction: column; padding-top: 10px; }

/* Sections */
.section-block { margin-bottom: 35px; }
.section-title { font-size: 22px; color: #333; margin-bottom: 16px; font-weight: bold; display: flex; align-items: center; gap: 10px; border-left: 5px solid #9E1F35; padding-left: 15px; background: linear-gradient(to right, rgba(158, 31, 53, 0.05), transparent); padding-top: 5px; padding-bottom: 5px; border-radius: 0 4px 4px 0; }
.icon-box { filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2)); }
.section-desc { font-size: 16px; line-height: 1.9; color: #555; text-align: justify; white-space: pre-wrap; font-family: 'MySourceHanSerifRegular', serif; }
.activity-list { padding-left: 20px; color: #555; }
.activity-list li { margin-bottom: 10px; font-size: 16px; list-style-type: disc; line-height: 1.6; }
.activity-list li::marker { color: #9E1F35; }

/* Gallery */
.gallery-wrapper { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.05); height: fit-content; }
.gallery-title { font-size: 20px; color: #333; margin-bottom: 20px; font-weight: bold; }
.carousel-box { width: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.carousel-img { width: 100%; height: 100%; object-fit: cover; cursor: pointer; }
:deep(.el-carousel__indicators--outside button) { background-color: #ccc; height: 4px; }
:deep(.el-carousel__indicator.is-active button) { background-color: #9E1F35; }
.empty-gallery { height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 8px; color: #999; }
.empty-icon { font-size: 40px; margin-bottom: 10px; }

/* Scrollbar & Animation */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(158, 31, 53, 0.2); border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(158, 31, 53, 0.5); }
.anim-item { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; } .delay-3 { animation-delay: 0.3s; } .delay-4 { animation-delay: 0.4s; } .delay-5 { animation-delay: 0.5s; }
@keyframes slideInLeft { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>

<!-- 2. 新增：全局样式，用于覆盖挂载在 body 上的预览组件样式 -->
<style>
/* 
  隐藏 Element Plus 图片预览的底部操作栏 (放大、缩小、旋转等) 
  注意：这会影响该页面所有使用 el-image-viewer 的组件
*/
.el-image-viewer__actions {
  display: none !important;
}
</style>