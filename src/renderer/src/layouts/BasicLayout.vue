<template>
    <el-container class="layout-full" :style="{backgroundImage: `url(${currentBG})`}">
        <el-header height="90px" style="margin: 50px 0px; padding: 0px;">
            <MainHeader :pageName="currentPageText"/>
        </el-header>

        <!--中间主要的显示内容，包括侧边栏和滚动窗口-->
        <el-main class="layout-main" style="margin:0px;padding:0px 0px 40px 0px">
            <router-view></router-view>
        </el-main>
    </el-container>
</template>

<script setup lang="ts">
import MainHeader from '@renderer/components/MainHeader.vue';
import { useRoute } from 'vue-router';
import {computed} from "vue";

import bg from '@/assets/HomeBG.png'
import distributionGB from '@/assets/Distribution_BG.png'

const currentBG = computed(()=>{
    const bGMap = {
        'Home': bg,
        'Association': bg,
        'Distribution': distributionGB,
        'Colleges': bg,
        'Oustanding': bg,
        'Gallery': bg,
        'XYHDetail': distributionGB
    }

    return bGMap[route.name as string] || bg
})

const route = useRoute();
const currentPageText = computed(() => {
    const map = {
        'Home': '深圳大学校友之家',
        'Association': '校友总会',
        'Distribution': '校友会分布',
        'Colleges': '学院校友会',
        'Outstanding': '杰出校友',
        'Gallery': '校友图册',
        'XYHDetail': '校友分会介绍'
    }

    return map[route.name as string] || '首页';
});
</script>

<style scoped>
.layout-full{
    height: 100vh;
    width: 100vb;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-size: cover;
    background-position: center;
}

.layout-main {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    align-items: center;
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>