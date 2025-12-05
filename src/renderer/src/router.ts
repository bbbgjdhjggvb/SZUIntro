/** 路由问题要如何解决
 * 需求：
 * 1. 首页页面有5张卡片，点击分别跳转到校友总会，校友会分布，学院校友会，杰出校友，校友图册页面
 * 2. 校友分布，会有一些跳转连接，点击跳转到校友分会介绍
 * 3. 学院校友会，会有学院校友会卡片，点击跳转到学院校友会介绍
 * 4. 校友图册，会有时间点，点击后会跳转到毕业照片显示
 * 
 * 解决方法：
 * /
 * |--> BasicLayout
 * |    |--> 首页
 * |    |--> 校友总会
 * |    |--> 校友会分布
 * |    |    |--> BasicLayout
 * |    |         |--> 学院校友会1
 * |    |         |--> 学院校友会1
 * |    |         |--> ...
 * |    |--> 学院校友会分布
 * |    |--> 杰出校友
 * |    |--> 校友图册页面
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from './layouts/BasicLayout.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: BasicLayout, //所有子页面都会在这个basiclayout中渲染
        children: [
            {
                // 首页
                path: '',
                name: 'Home',
                component: () => import('@/views/Home.vue'),
                meta: { layout: 'BasicLayout' } // 标记：使用通用布局
            },
            {
                // 校友总会
                path: 'association',
                name: 'Association',
                component: () => import('@/views/Association.vue'),
                meta: { layout: 'BasicLayout' } // 标记：使用通用布局
            },
            {
                // 校友会分布
                path: 'distribution',
                name: 'Distribution',
                component: () => import('@/views/Distribution.vue'),
                meta: { layout: 'BasicLayout' } // 标记：使用通用布局
            },
            {
                // 学院校友会
                path: 'colleges',
                name: 'Colleges',
                component: () => import('@/views/Colleges.vue'),
                meta: { layout: 'BasicLayout' } // 标记：使用通用布局
            },
            {
                // 杰出校友
                path: 'outstanding',
                name: 'Outstanding',
                component: () => import('@/views/Outstanding.vue'),
                meta: { layout: 'BasicLayout' } // 标记：使用通用布局
            },
            {
                // 校友图册
                path: 'gallery',
                name: 'Gallery',
                component: () => import('@/views/Gallery.vue'),
                meta: { layout: 'BasicLayout' } // 标记：使用通用布局
            }

        ]
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router