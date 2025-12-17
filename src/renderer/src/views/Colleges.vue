<template>
  <div class="main-box">
    <!-- 侧边栏 -->
    <div class="box-sidebar slide-in-left">
      <SideBar theme="light"></SideBar>
    </div>

    <!-- 内容区 -->
    <div class="box-content-scroll pop-in-up">
      <div class="header-title">
        <h2>学院校友会分布</h2>
        <p>College Alumni Associations</p>
      </div>

      <div class="card-grid" v-if="!loading">
        <div 
          v-for="(item, index) in collegeList" 
          :key="item.id"
          class="college-card"
          :style="{ '--delay': index * 0.05 + 's' }"
          @click="goToDetail(item)"
        >
          <div class="card-cover">
            <el-image 
              :src="item.coverImage" 
              fit="cover" 
              class="cover-img" 
              loading="lazy"
            >
              <template #error>
                <div class="img-placeholder">
                  <span class="placeholder-icon">🏛️</span>
                </div>
              </template>
              <template #placeholder>
                <div class="img-loading"></div>
              </template>
            </el-image>
            <div class="card-overlay"></div>
          </div>
          
          <div class="card-text">
            <h3 class="card-name">{{ item.name }}</h3>
            <div class="card-arrow">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="loading-state">正在加载学院数据...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SideBar from '@renderer/components/sidebar/SideBar.vue';

const router = useRouter();
const loading = ref(true);
const collegeList = ref<any[]>([]);

// 初始化数据
onMounted(async () => {
  try {
    // 1. 读取 JSON 配置
    const data = await window.fileReadApi?.readConfigFileAccorName('college_association.json') as any; // 确保文件名对应
    const rawList = data.college_associations || [];

    // 2. 并行处理：为每个学院去读取文件夹，取第一张图做封面
    const tasks = rawList.map(async (college: any) => {
      let coverUrl = '';
      if (college.images) {
        try {
          // 调用刚才写的新 API
          const images = await window.fileReadApi?.getFlatDirImages(college.images); // 注意：需要在 d.ts 中声明这个方法，或者使用 invoke
          // 如果使用了 ipcRenderer.invoke，写法如下：
          // const images = await window.electron.ipcRenderer.invoke('get-flat-dir-images', college.images);
          
          if (images && images.length > 0) {
            coverUrl = 'local-image://' + images[0];
          }
        } catch (e) {
          console.error(`Failed to get cover for ${college.name}`, e);
        }
      }
      return {
        ...college,
        coverImage: coverUrl
      };
    });

    collegeList.value = await Promise.all(tasks);
  } catch (error) {
    console.error("Data load failed", error);
  } finally {
    loading.value = false;
  }
});

const goToDetail = (college: any) => {
  // 传递 id 即可，详情页重新读数据或从 store 获取，这里为了简单直接传对象字符串
  // 推荐：只传 ID，详情页根据 ID 查 JSON。这里演示传 ID。
  router.push({
    name: 'CollegeDetail',
    query: { id: college.id }
  });
};
</script>

<style scoped>
.main-box { 
  width: 100%;
  height: 100%;
  display: flex; 
  overflow: hidden; 
  color: transparent;
}
.box-sidebar { width: 80px; flex-shrink: 0; z-index: 10; opacity: 0; animation: slideInLeft 0.6s forwards 0.2s; }
.box-content-scroll { 
  flex: 1; 
  height: 100%; 
  overflow-y: auto; 
  padding: 40px; 
  margin-left: 20px; 
  margin-right: 40px;
  opacity: 0; 
  animation: fadeUp 0.6s forwards 0.3s; 
  background: #f5f7fa;
  border-radius: 12px;
}

.header-title { margin-bottom: 30px; border-left: 5px solid #9E1F35; padding-left: 20px; }
.header-title h2 { font-size: 32px; color: #333; margin: 0; font-family: 'Songti SC', serif; font-weight: bold; }
.header-title p { font-size: 14px; color: #999; margin-top: 5px; letter-spacing: 1px; text-transform: uppercase; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; padding-bottom: 40px; }

.college-card {
  background: white; border-radius: 12px; overflow: hidden; cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: 0; animation: cardEnter 0.6s forwards; animation-delay: var(--delay);
  display: flex; flex-direction: column;
}

.college-card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(158, 31, 53, 0.15); }

.card-cover { width: 100%; height: 160px; position: relative; overflow: hidden; background: #eee; }
.cover-img { width: 100%; height: 100%; transition: transform 0.5s ease; }
.college-card:hover .cover-img { transform: scale(1.08); }
.card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.1), transparent); }

.card-text { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; }
.card-name { margin: 0; font-size: 18px; color: #333; font-weight: 600; font-family: 'Songti SC', serif; }
.card-arrow { color: #ccc; transition: color 0.3s, transform 0.3s; }
.college-card:hover .card-arrow { color: #9E1F35; transform: translateX(5px); }

.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #e0e0e0; font-size: 40px; }

@keyframes slideInLeft { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes fadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes cardEnter { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* 滚动条隐藏 */
.box-content-scroll::-webkit-scrollbar { display: none; }
</style>