<template>
  <!--介绍内容-->
  <div class="main-box">
    <div class="box-sidebar">
      <SideBar></SideBar>
    </div>
    
    <!-- 右侧布局容器：负责居中显示卡片 -->
    <div class="right-layout-container">
      
      <!-- 1. 加载中状态 -->
      <div v-if="loading" class="status-container">
        <h2>数据加载中...</h2>
      </div>

      <!-- 2. 有数据状态：这是一个固定高度的卡片 -->
      <div v-else-if="branchInfo" class="introduction-card">
        <!-- 头部：固定不动 -->
        <div class="card-header">
          <h1>{{ branchInfo.name + "简介" }}</h1>
        </div>
        
        <!-- 内容区域：超出单独滚动 -->
        <div class="card-body-scroll">
          <div class="text-content">
            <p>{{ branchInfo.description }}</p>
          </div>
          
          <div class="img-container" v-if="branchInfo.image">
            <img :src="branchInfo.image" alt="校友会图片" />
          </div>
        </div>
      </div>

      <!-- 3. 无数据状态 -->
      <div v-else class="status-container error">
        <h2>未找到 "{{ branchName }}" 的相关信息</h2>
        <p>请确认 JSON 文件中是否存在该校友会，且名称完全一致。</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from '@renderer/components/sidebar/SideBar.vue'
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const branchInfo = ref<any>(null);

const branchName = computed(() => {
    return route.params.name as string;
});

onMounted(async () => {
  loading.value = true;
  try {
    if (branchName.value) {
      const rawData = await (window as any).fileReadApi?.readConfigFileAccorName('association_distribution.json');

      if (rawData && rawData.association_distribution) {
        let match = null;
        for (const area of rawData.association_distribution) {
          if (area.XYHS && Array.isArray(area.XYHS)) {
            const target = area.XYHS.find((item: any) => item.name === branchName.value);
            if (target) {
              match = target;
              break;
            }
          }
        }
        branchInfo.value = match;
      }
    }
  } catch (error) {
    console.error("读取校友会数据失败:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* 主容器 */
.main-box {
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  overflow: hidden; /* 禁止主容器出现滚动条 */
}

/* 侧边栏 */
.box-sidebar {
  width: 80px;
  background: transparent;
  flex-shrink: 0;
  z-index: 10;
}

/* 右侧布局容器：完全接管右侧空间，负责居中 */
.right-layout-container {
  flex: 1;
  height: 100%;
  margin-left: 20px; /* 侧边栏间距 */
  margin-right: 60px; /* 右侧留白 */
  display: flex;
  flex-direction: column;
  align-items: center;     /* 水平居中 */
  justify-content: center; /* 垂直居中 */
  overflow: hidden;        /* 禁止外部滚动 */
}

/* --- 核心卡片样式 --- */
.introduction-card {
  width: 80%;
  height: 85%;      /* 固定高度占比，例如占屏幕高度的 85% */
  background-color: rgba(255, 255, 255, 0.95); /* 稍微一点点透 */
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column; /* 纵向布局：头 + 身 */
  overflow: hidden; /* 防止圆角被子元素遮挡 */
}

/* 卡片头部：固定不动 */
.card-header {
  flex-shrink: 0; /* 禁止压缩 */
  padding: 25px 0 15px 0;
  text-align: center;
  border-bottom: 1px solid #eee; /* 分隔线 */
  background: white;
}

.card-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-family: 'MySourceHanSerifBold', serif;
}

/* 卡片滚动区域：只有这里会滚动 */
.card-body-scroll {
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 开启垂直滚动 */
  padding: 20px 40px;
  
  /* 隐藏滚动条样式 */
  scrollbar-width: none; 
  -ms-overflow-style: none;
}
.card-body-scroll::-webkit-scrollbar {
  display: none;
}

/* 文本内容样式 */
.text-content p {
  font-size: 18px;
  font-family: 'MySourceHanSerifRegular';
  line-height: 1.8;
  color: #444;
  text-indent: 2em;
  text-align: justify; /* 两端对齐，大段文字更整齐 */
  margin-bottom: 20px;
}

/* 图片容器 */
.img-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.img-container img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 状态提示 */
.status-container {
  padding: 40px;
  background: white;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.status-container.error h2 { color: #d9534f; }
.status-container.error p { color: #666; margin-top: 10px;}
</style>