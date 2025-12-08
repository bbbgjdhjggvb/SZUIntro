<template>
  <div class="detail-container">
    <div class="box-sidebar">
      <SideBar theme="light"></SideBar>
    </div>
    
    <div class="content-area">
      <div class="image-section">
        <!-- 如果傳入了圖片URL則顯示，否則顯示佔位符 -->
        <el-image 
          v-if="imageUrl"
          :src="imageUrl" 
          fit="contain" 
          class="detail-image"
        >
          <template #error>
            <div class="image-placeholder">
              <span>TEST Image Placeholder</span>
            </div>
          </template>
        </el-image>
        <div v-else class="image-placeholder">
          <span>TEST Image Placeholder</span>
        </div>
      </div>

      <div class="text-section">
        <h1>{{ title || 'TEST Title' }}</h1>
        <div class="description">
          <p>TEST Description Content. 這裡是預留的文字區域。</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
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
  // 從路由參數中獲取數據
  title.value = route.query.name as string || ''
  imageUrl.value = route.query.image as string || ''
})
</script>

<style scoped>
.detail-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: transparent;
  border-radius: 20px;
}

.box-sidebar {
  width: 80px;
  background: transparent;
}

.content-area {
  flex: 1;
  display: flex;
  padding: 20px;
  margin-right: 120px;
  margin-left: 40px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  gap: 40px;
  overflow: hidden;
}

.image-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
}

.detail-image {
  width: 100%;
  height: 100%;
  max-height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  color: #666;
  font-size: 24px;
  font-weight: bold;
}

.text-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
}

h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 24px;
  border-bottom: 2px solid #c42329; /* 深大手冊紅色 */
  padding-bottom: 10px;
  display: inline-block;
}

.description {
  font-size: 18px;
  line-height: 1.6;
  color: #555;
  white-space: pre-wrap;
}
</style>
