<template>
  <!--介绍内容-->
  <div class="main-box">
    <div class="box-sidebar">
      <SideBar theme="light"></SideBar>
    </div>
    <div class="box-content-scroll">
      <div class="card-section">
        <el-row :gutter="20">
          <el-col
            v-for="(college, index) in colleges"
            :key="index"
            :span="8"
            class="col-item"
          >
            <div class="img-card" @click="goToDetail(college)">
              <el-image
                :src="college.image"
                fit="cover"
                class="college-img"
              >
                <!--当图片加载失败时显示灰色区域-->
                <template #error>
                  <div class="image-slot"></div>
                </template>
              </el-image>
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

const router = useRouter() // 獲取 router 實例

interface College {

  id: number
  name: string
  description: string
  image: string
}

const colleges = ref<College[]>([])

// 首次加载执行
onMounted(async () => {
  try {
    const data = await window.fileReadApi?.readConfigFile() as any
    colleges.value = data.college_associations || []

    // 并行处理图片数据
    const imgUrlProcTask = colleges.value.map(async (e) => {
      const realImgUrl = await window.fileReadApi?.readImage(e.image)
      return {
        ...e,
        image: realImgUrl || ''
      }
    });
    colleges.value = await Promise.all(imgUrlProcTask)
  } catch (error) {
    console.error('Failed to load colleges data:', error)
  }
})

// 跳轉詳情頁
const goToDetail = (college: College) => {
  router.push({
    name: 'CollegeDetail',
    query: {
      name: college.name,
      image: college.image // 注意：這裡是已經轉換過後的 base64 或 協議路徑，如果太長可能需要考慮 id
    }
  })
}
</script>

<style scoped>
.main-box{
  width: 100%;
  height: 100%;

  background: transparent;
  border-radius: 20px;
  display: flex; /* 开启 Flex 布局，让左右并排 */
  flex-direction: row;
  align-items: stretch;
}

.box-sidebar{
  width: 80px;
  padding:0px;
  margin:0px;
  background: transparent;
  border-radius: 20px;
}

/* 右侧内容滚动区域 */
.box-content-scroll {
  flex: 1; /* fix: 讓它佔據剩餘空間，避免初始加載時寬度塌縮 */
  height: 100%;
  padding: 20px;
  margin-right: 120px;
  margin-left: 40px;
  border-radius: 20px;
  overflow-y: auto; /* 关键：内容超出时垂直滚动 */

  background-color: #fff;

  /* --- 隐藏滚动条的核心代码 --- */
  /* 1. 针对 Firefox */
  scrollbar-width: none; 
  
  /* 2. 针对 IE 10+ */
  -ms-overflow-style: none; 
}

.box-content-scroll::-webkit-scrollbar {
    display: none;
}

.card-section {
  flex: 1; /* 占据剩余的所有空间 (100% - Header - Hero) */
  width: 100%;
  padding: 0;
  margin: 0;
  background: transparent;
  background-size: cover;
  background-position: center bottom; /* 对齐到底部 */
}


/** 每一列的底部距离 */
.col-item{
    margin-bottom: 20px;
}

.img-card{
  position: relative;
  width: 100%;
  /* 强制宽高比 16:9 */
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  overflow: hidden;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease; /* 添加點擊反饋 */
}

.img-card:active {
  transform: scale(0.98);
}

.college-img{
  width: 100%;
  height: 100%;
  display: block;
}

.image-slot{
  width: 100%;
  height: 100%;
  background: #dcdcdc;
}

/** 覆盖住图片的名字 */
.text-overlay{
  position: absolute;
  bottom: 60px;
  left: 0;
  width: 100%;
  padding: 8px;
  color: white;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent); /* 增加一点渐变让文字更清晰 */
  box-sizing: border-box;
}

</style>