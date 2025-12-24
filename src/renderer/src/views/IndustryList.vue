<template>
  <div class="main-box">
    <!-- 侧边栏 -->
    <div class="box-sidebar slide-in-left">
      <SideBar theme="light"></SideBar>
    </div>

    <!-- 内容区 -->
    <div class="box-content-scroll pop-in-up">
      <!-- 头部标题 -->
      <div class="header-title">
        <h2>行业校友会</h2>
        <p>Industry Alumni Associations</p>
      </div>

      <!-- 列表网格 -->
      <div class="card-grid" v-if="!loading">
        <div 
          v-for="(item, index) in industryList" 
          :key="item.id"
          class="industry-card"
          :style="{ '--delay': index * 0.05 + 's' }"
          @click="goToDetail(item.id)"
        >
          <!-- 封面图区域 -->
          <div class="card-cover">
            <el-image 
              :src="item.coverImage" 
              fit="cover" 
              class="cover-img" 
              loading="lazy"
            >
              <template #error>
                <div class="img-placeholder">
                  <!-- 行业分会可以用握手或建筑图标 -->
                  <span class="placeholder-icon">🤝</span>
                </div>
              </template>
              <template #placeholder>
                <div class="img-loading"></div>
              </template>
            </el-image>
            <div class="card-overlay"></div>
          </div>
          
          <!-- 文字引导区域 -->
          <div class="card-text">
            <h3 class="card-name">{{ item.name }}</h3>
            <div class="card-arrow">
              <!-- 引导箭头图标 -->
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载或空状态 -->
      <div v-else class="loading-state">
        <p>正在加载行业分会数据...</p>
      </div>
      
      <div v-if="!loading && industryList.length === 0" class="empty-state">
        <p>暂无行业分会数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SideBar from '@renderer/components/sidebar/SideBar.vue';

const router = useRouter();
const loading = ref(true);
const industryList = ref<any[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    // 1. 读取 association_distribution.json
    const rawData = await (window as any).fileReadApi?.readConfigFileAccorName('association_distribution.json');
    
    // 兼容处理：可能是直接的数组，也可能是对象包裹的数组
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (rawData && Array.isArray(rawData.association_distribution)) {
      list = rawData.association_distribution;
    }

    // 2. 筛选出行业分会 (type === 'industry')
    const filteredList = list.filter((item: any) => item.type === 'industry');

    // 3. 并行处理：读取每个分会文件夹下的第一张图片作为封面
    const tasks = filteredList.map(async (item: any) => {
      let coverUrl = '';
      if (item.images) {
        try {
          const images = await (window as any).fileReadApi?.getFlatDirImages(item.images);
          if (images && images.length > 0) {
            coverUrl = 'local-image://' + images[0];
          }
        } catch (e) {
          console.error(`Failed to get cover for ${item.name}`, e);
        }
      }
      return {
        ...item,
        coverImage: coverUrl
      };
    });

    industryList.value = await Promise.all(tasks);

  } catch (e) {
    console.error("Industry list load error", e);
  } finally {
    loading.value = false;
  }
});

const goToDetail = (id: number) => {
  router.push({
    name: 'XYHDetail',
    query: { id: id }
  });
};
</script>

<style scoped>
/* 
  完全复用 Colleges.vue 的样式逻辑 
*/
.main-box { 
  width: 100%;
  height: 100%;
  display: flex; 
  overflow: hidden; 
  color: transparent;
}

/* 侧边栏动画 */
.box-sidebar { width: 80px; flex-shrink: 0; z-index: 10; opacity: 0; animation: slideInLeft 0.6s forwards 0.2s; }

/* 内容滚动区 */
.box-content-scroll { 
  flex: 1; 
  height: 100%; 
  overflow-y: auto; 
  padding: 40px; 
  margin-left: 20px; 
  margin-right: 40px;
  opacity: 0; 
  animation: fadeUp 0.6s forwards 0.3s; 
  background: #f5f7fa; /* 稍微带点灰的背景衬托卡片 */
  border-radius: 12px;
}

/* 头部标题 */
.header-title { margin-bottom: 30px; border-left: 5px solid #9E1F35; padding-left: 20px; }
.header-title h2 { font-size: 32px; color: #333; margin: 0; font-family: 'Songti SC', serif; font-weight: bold; }
.header-title p { font-size: 14px; color: #999; margin-top: 5px; letter-spacing: 1px; text-transform: uppercase; }

/* 网格布局 */
.card-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 25px; 
  padding-bottom: 40px; 
}

/* 卡片样式 */
.industry-card {
  background: white; 
  border-radius: 12px; 
  overflow: hidden; 
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0; 
  animation: cardEnter 0.6s forwards; 
  animation-delay: var(--delay);
  display: flex; 
  flex-direction: column;
}

.industry-card:hover { 
  transform: translateY(-8px); 
  box-shadow: 0 12px 24px rgba(158, 31, 53, 0.15); 
}

/* 封面图容器 */
.card-cover { width: 100%; height: 160px; position: relative; overflow: hidden; background: #eee; }
.cover-img { width: 100%; height: 100%; transition: transform 0.5s ease; }
.industry-card:hover .cover-img { transform: scale(1.08); }
.card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.1), transparent); }

/* 文字区域 */
.card-text { 
  padding: 20px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border-top: 1px solid #f0f0f0; 
  background: #fff;
}
.card-name { 
  margin: 0; 
  font-size: 18px; 
  color: #333; 
  font-weight: 600; 
  font-family: 'Songti SC', serif; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-arrow { color: #ccc; transition: color 0.3s, transform 0.3s; }
.industry-card:hover .card-arrow { color: #9E1F35; transform: translateX(5px); }

/* 占位符与加载状态 */
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #e0e0e0; font-size: 40px; }
.loading-state, .empty-state { text-align: center; color: #999; margin-top: 50px; font-size: 16px; }

/* 动画定义 */
@keyframes slideInLeft { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes fadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes cardEnter { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* 隐藏滚动条 */
.box-content-scroll::-webkit-scrollbar { display: none; }
</style>