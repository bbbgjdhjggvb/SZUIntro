<template>
  <div class="main-box">
    <div class="box-sidebar">
      <SideBar></SideBar>
    </div>
    <!--中国地图-->
    <div class="max-container">
      <div ref="chartRef" class="chart-box"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from '@renderer/components/sidebar/SideBar.vue';
import * as echarts from 'echarts';
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import type { EChartsType } from 'echarts';

import chinaJson from '@/assets/map/china.json';

// 图表引用，使用正确的类型
const chartRef = ref<HTMLElement | null>(null);
let myChart: EChartsType | null = null;

// 模拟校友会数据
const alumniData = [
  { 
    name: '北京地区校友分会', 
    from: [116.407526, 39.90403],
    to: [135.00, 39.90403],
    align: 'right'
  },
  { 
    name: '长三角校友分会', 
    from: [120.473701, 30.230416],
    to: [135.00, 30.230416],
    align: 'right'
  },
  { 
    name: '广州校友分会', 
    from: [113.2644, 23.0],
    to: [90.00, 23.0],
    align: 'left'
  },
  { 
    name: '吴川校友分会', 
    from: [110.7782, 21.1] ,
    to: [133.1821, 21.1],
    align: 'right'
  },
  { 
    name: '普宁校友分会', 
    from: [116.1657, 25.9] ,
    to: [98.00, 25.9],
    align: 'left'
  },
  { 
    name: '大潮阳校友分会', 
    from: [116.6016, 23.2649] ,
    to: [133.1821, 23.2649],
    align: 'right'
  },
  { 
    name: '饶平校友分会', 
    from: [117.0039, 24.2] ,
    to: [120.00, 24.2],
    align: 'right'
  },
  { 
    name: '紫金校友分会', 
    from: [115.1821, 24.8] ,
    to: [133.1821, 24.8],
    align: 'right'
  },
  { 
    name: '兴宁校友分会', 
    from: [115.7312, 27.1365] ,
    to: [135.00, 27.1365],
    align: 'right'
  },
  { 
    name: '惠来校友分会', 
    from: [116.3007, 23.8] ,
    to: [103.00, 23.8],
    align: 'left'
  },
  { 
    name: '四川校友分会', 
    from: [104.0757, 31.8] ,
    to: [91.00, 31.8],
    align: 'left'
  },
  { 
    name: '西藏校友分会', 
    from: [91.1174, 29.6472] ,
    to: [81.00, 29.6472],
    align: 'left'
  },
  { 
    name: '香港校友联谊会', 
    from: [114.1694, 22.0] ,
    to: [105, 22.0],
    align: 'left'
  },
  { 
    name: '东莞校友分会', 
    from: [113.7518, 22.6] ,
    to: [114.00, 22.6],
    align: 'right'
  },
  { 
    name: '河南校友分会', 
    from: [113.7532, 34.7657] ,
    to: [120.0000, 34.7657],
    align: 'right'
  },
  { 
    name: '喀什校友联谊会', 
    from: [75.9938, 39.4677] ,
    to: [72.9938, 39.4677],
    align: 'left'
  },
];

// 拆分echart需要的数据，名字和坐标一组，坐标前后一组，名字，终点位置，左右一组
// const scatterData = alumniData.map(item => ({
//   name: item.name,
//   value: item.from
// }));

const linesData = alumniData.map(item => ({
  coords: [item.from, item.to]
}));

const labelData = alumniData.map(item => ({
  name: item.name,
  value: item.to,
  label: {
    position: item.align === 'left' ? 'left' : 'right'
  }
}));

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  // 注册中国地图数据
  echarts.registerMap('china', chinaJson);
  
  // 初始化图表实例
  myChart = echarts.init(chartRef.value);

  // 配色
  const colors = {
    type: 'linear',
    x:0, y:0, x2:0, y2:1,
    colorStops: [
      { offset: 0, color: '#FFFFFF' },    // 0% 顶部纯白
      { offset: 0.3, color: '#F2A8C1' },  // 60% 位置是粉色（保持中间透亮）
      { offset: 1, color: '#FF0055' }     // 100% 底部是非常深的暗红（增加厚重感）
    ],
    global: false
  };
  
  // 配置图表选项
  const option = {
    backgroundColor: 'transparent',

    geo: {
      map: 'china',
      roam: false,
      zoom: 1.3,
      layoutCenter: ['47%', '65%'],
      layoutSize: '100%',

      // 3D效果和渐变色
      itemStyle: {
        areaColor: colors,
        // 阴影效果
        shadowColor: '#8B1A38', // 深红色阴影，模拟侧面厚度
        shadowOffsetX: -1,       // X轴偏移
        shadowOffsetY: 20,      // Y轴偏移（向下偏移产生厚度感）
        shadowBlur: 0,           // 模糊度设为0，这就变成了硬朗的“立体块”

        borderColor: '#ffffff',
        borderWidth: 2,
      },

      // 【关键修改】：高亮状态也引用同一个颜色对象
      emphasis: {
        itemStyle: {
          areaColor: colors,
        },
        label: { show: false }
      }
    },
    series: [
      // 画线条
      {
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 1,
        z: 2,
        lineStyle: {
          color: '#FFFFFF',
          width: 2, // 线条粗细
          opacity: 0.7,
          curveness: 0 // 0表示直线，如果不为0则是曲线
        },
        data: linesData
      },
      // 3. 终点文字层（隐形点 + 显示文字）
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 1,
        z: 3,
        data: labelData,
        symbolSize: 0, // 设为0，也就是点本身不显示
        label: {
          show: true,
          formatter: '{b}', // 显示数据项名称
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: "bolder",
          fontFamily: 'Songti SC, serif', // 宋体风格
          textBorderColor: '#FFFFFF', // 边框颜色 = 字体颜色
          textBorderWidth: 0.4,       // 描边宽度：值越大字越粗（0.5 - 2 之间调整）
          distance: 10 // 文字距离线头的距离
        }
      }
    ]
  };
  
  // 设置配置项
  myChart.setOption(option);
}

// 调整图表尺寸
const resizeChart = () => {
  if (myChart) {
    myChart.resize();
  }
}

// 组件挂载时初始化图表
onMounted(() => {
  nextTick(() => {
    initChart();
    // 监听窗口大小变化
    window.addEventListener('resize', resizeChart);
  });
});

// 组件卸载时清理资源
onUnmounted(() => {
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
  window.removeEventListener('resize', resizeChart);
});
</script>

<style scoped>
.main-box{
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.box-sidebar{
  width: 80px;
  padding: 0px;
  margin: 0px;
  background: transparent;
  border-radius: 20px;
  flex-shrink: 0;
}

.max-container{
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-box{
  width: 100%;
  height: 100%;
  background: transparent;
}
</style>