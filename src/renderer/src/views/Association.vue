<template>
  <!--介绍内容-->
  <div class="main-box">
    <div class="box-sidebar">
      <SideBar></SideBar>
    </div>
    <div class="box-content-scroll">
      <div class="bottom-section">
        <div class="introduction-container">
          <div>
            <h1>深圳大学教育发展基金会介绍</h1>
          </div>
          <div style="padding: 10px 40px;">
            <text>{{ associationData.texts[0] }}</text>
          </div>
          <div class="img-container">
            <img :src="associationData.images[0]"/>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup lang="ts">
import SideBar from '@renderer/components/sidebar/SideBar.vue'
import { ref, onMounted } from 'vue'

interface AssociationData {
  images: string[]
  texts: string[]
}

const associationData = ref<AssociationData>({
  images: [],
  texts: ['']
})


onMounted(async () => {
  try {
    const data = await window.fileReadApi?.readConfigFile() as any;
    associationData.value = data.association;
    
    associationData.value.images = ['local-image://association/assoc_1.png']
  } catch (error) {
    console.error('Failed to load association data:', error)
  }
})
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
  top: 50%;
  background: transparent;
  border-radius: 20px;
}

/* 右侧内容滚动区域 */
.box-content-scroll {
  height: 100%;
  padding:0px;
  margin-right: 120px;
  margin-left: 40px;
  overflow-y: auto; /* 关键：内容超出时垂直滚动 */
  border-radius: 20px;
  /* --- 隐藏滚动条的核心代码 --- */
  
  /* 1. 针对 Firefox */
  scrollbar-width: none; 
  
  /* 2. 针对 IE 10+ */
  -ms-overflow-style: none; 
}

.box-content-scroll::-webkit-scrollbar {
    display: none;
}

.bottom-section {
  flex: 1; /* 占据剩余的所有空间 (100% - Header - Hero) */
  width: 100%;
  padding: 0;
  margin: 0;
  background: transparent;
  background-size: cover;
  background-position: center bottom; /* 对齐到底部 */
  
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

.introduction-container{
  display: flex;
  background: transparent;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  font-size: 17px;
}

.introduction-container h1{
  font-family: 'MySourceHanSerifBold';
}

.introduction-container text{
  font-family: 'MySourceHanSerifRegular';
}

.img-container{
  padding: 10px 15px;
  width: 70%;
  height: auto;
}
</style>