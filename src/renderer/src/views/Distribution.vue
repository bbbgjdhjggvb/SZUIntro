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
import { useRouter } from 'vue-router';

import chinaJson from '@/assets/map/china.json';

const router = useRouter();

const chartRef = ref<HTMLElement | null>(null);
let myChart: EChartsType | null = null;

// 定义需要“扎堆”处理的校友会名称列表
const clusteredNames = [
  '普宁校友分会', '大潮阳校友分会', '饶平校友分会', 
  '紫金校友分会', '惠来校友分会', '东莞校友分会',
  '兴宁校友分会', '广州校友分会', '吴川校友分会',
  '香港校友联谊会'
];

const alumniData = [
  { name: '北京地区校友分会', from: [116.407526, 39.90403], to: [135.00, 39.90403], align: 'right' },
  { name: '长三角校友分会', from: [120.473701, 30.230416], to: [135.00, 30.230416], align: 'right' },
  { name: '广州校友分会', from: [113.2644, 23.1291], to: [135.00, 23.1291], align: 'right' },
  { name: '吴川校友分会', from: [110.7782, 21.4418], to: [133.1821, 21.4418], align: 'right' },
  { name: '普宁校友分会', from: [116.1657, 23.2973], to: [98.00, 23.2973], align: 'left' },
  { name: '大潮阳校友分会', from: [116.6016, 23.2649], to: [133.1821, 23.2649], align: 'right' },
  { name: '饶平校友分会', from: [117.0039, 23.6641], to: [120.00, 23.6641], align: 'right' },
  { name: '紫金校友分会', from: [115.1821, 23.6384], to: [133.1821, 23.6384], align: 'right' },
  { name: '兴宁校友分会', from: [115.7312, 24.1365], to: [135.00, 24.1365], align: 'right' },
  { name: '惠来校友分会', from: [116.3007, 23.0332], to: [103.00, 23.0332], align: 'left' },
  { name: '四川校友分会', from: [104.0757, 31.8], to: [91.00, 31.8], align: 'left' },
  { name: '西藏校友分会', from: [91.1174, 29.6472], to: [81.00, 29.6472], align: 'left' },
  { name: '香港校友联谊会', from: [114.1694, 22.18], to: [105, 22.18], align: 'left' },
  { name: '东莞校友分会', from: [113.7518, 23.0207], to: [114.00, 23.0207], align: 'right' },
  { name: '河南校友分会', from: [113.7532, 34.7657], to: [120.0000, 34.7657], align: 'right' },
  { name: '喀什校友联谊会', from: [75.9938, 39.4677], to: [72.9938, 39.4677], align: 'left' },
];

// 数据过滤：只保留不在扎堆列表中的数据用于常规显示
const normalData = alumniData.filter(item => !clusteredNames.includes(item.name));

const linesData = normalData.map(item => ({
  coords: [item.from, item.to]
}));

const labelData = normalData.map(item => ({
  name: item.name,
  value: item.to,
  label: {
    position: item.align === 'left' ? 'left' : 'right'
  }
}));

// 计算自定义图形的配置
const getGraphicOption = () => {
  if (!myChart) return [];

  // 定义扎堆区域的地理范围 (广东东部及珠三角大致范围)
  // 左上角 [经度, 纬度] 和 右下角 [经度, 纬度]
  const clusterGeoRect = {
    topLeft: [112.5, 24.5], 
    bottomRight: [117.5, 21.5] 
  };

  // 将地理坐标转换为屏幕像素坐标
  const p1 = myChart.convertToPixel('geo', clusterGeoRect.topLeft);
  const p2 = myChart.convertToPixel('geo', clusterGeoRect.bottomRight);

  // 如果转换失败（地图未渲染完成），返回空
  if (!p1 || !p2) return [];

  const rectX = p1[0];
  const rectY = p1[1];
  const rectW = p2[0] - p1[0];
  const rectH = p2[1] - p1[1];

  // 列表框双列布局
  const singleColWidth = 120; // 单列文字预留宽度
  const padding = 10; // 边框内边距
  const gap = 10;
  const lineHeight = 30;
  const totalCount = clusteredNames.length;
  const rows = Math.ceil(totalCount / 2); // 左边5个，右边5个

  // 列表框的长度和宽度
  const listBoxWidth = singleColWidth * 2 + padding * 2 + gap;
  const listBoxHeight = rows * lineHeight + padding * 2;
  const guideLineLength = 160; // 引导线长度

  // 列表框位置：在地图框的左侧
  // 计算逻辑：地图框左边X - 引导线长 - 列表框宽
  const listBoxX = rectX - guideLineLength - listBoxWidth;
  // 列表框Y轴：垂直居中于地图框
  const listBoxY = rectY + (rectH / 2) - (listBoxHeight / 2) + 50;

  // 生成双列文字元素列表
  const textElements = clusteredNames.map((name, index) => {
    const isSecondCol = index >= rows; // 超过行数上限就进入第二列
    const rowIndex = index % rows;
    const currentTextX = isSecondCol
    ? listBoxX + padding + singleColWidth + gap
    : listBoxX + padding;
    const currentTextY = listBoxY + padding + rowIndex * lineHeight + 10;

    return {
      type: 'text',
      z: 999, // 层级置顶
      left: currentTextX,
      top: currentTextY,
      style: {
        text: name,
        fill: '#FFFFFF',
        font: 'bold 16px "Songti SC", serif',
        width: singleColWidth, // 限制宽度
        overflow: 'truncate',  // 如果名字太长就截断
        textVerticalAlign: 'middle', // 垂直居中，水平居左
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowBlur: 2,
        textShadowOffsetX: 1,
        textShadowOffsetY: 1
      },
      onclick: ()=>{
        handleNavigation(name);
      }
    };
  });

  return [
    // 1. 地图上的框（圈住扎堆区域）
    {
      type: 'rect',
      z: 999, // 层级置顶
      shape: { x: rectX, y: rectY, width: rectW, height: rectH },
      style: {
        stroke: '#FFFFFF',
        fill: 'rgba(255, 255, 255, 0.1)', // 淡淡的白色填充
        lineWidth: 2,
        lineDash: [0]
      }
    },
    // 2. 引导线
    {
      type: 'polyline',
      z: 999, // 层级置顶
      shape: {
        points: [
          [rectX, rectY + rectH / 2], // 起点：地图框左侧中间
          [rectX - guideLineLength, rectY + rectH / 2] // 终点：向左延伸
        ]
      },
      style: {
        stroke: '#FFFFFF',
        lineWidth: 2
      }
    },
    // 3. 列表框容器
    {
      type: 'rect',
      z: 999, //层级置顶
      shape: {
        x: listBoxX,
        y: listBoxY,
        width: listBoxWidth,
        height: listBoxHeight,
        r: 4 // 圆角
      },
      style: {
        stroke: '#FFFFFF',
        fill: 'rgba(255, 255, 255, 0.15)',
        // fill: 'rgba(0, 0, 0, 0.5)', // 半透明黑色背景，确保文字清晰
        lineWidth: 2
      }
    },
    // 4. 列表文字
    ...textElements
  ];
};

// 跳转函数
const handleNavigation = (name: string) => {
  console.log('跳转详情：', name);
  router.push({
    name: 'XYHDetail',
    params: {
      name: name
    }
  })
}

const initChart = () => {
  if (!chartRef.value) return;
  echarts.registerMap('china', chinaJson);
  myChart = echarts.init(chartRef.value);

  const colors = {
    type: 'linear', x:0, y:0, x2:0, y2:1,
    colorStops: [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.3, color: '#F2A8C1' },
      { offset: 1, color: '#FF0055' }
    ],
    global: false
  };
  
  const option = {
    backgroundColor: 'transparent',
    geo: {
      map: 'china',
      roam: false,
      zoom: 1.3,
      layoutCenter: ['47%', '65%'],
      layoutSize: '100%',
      itemStyle: {
        areaColor: colors,
        shadowColor: '#8B1A38',
        shadowOffsetX: -1,
        shadowOffsetY: 20,
        shadowBlur: 0,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
      emphasis: {
        itemStyle: { areaColor: colors },
        label: { show: false }
      }
    },
    // 初始化时 graphic 为空，需要在 setOption 后或 resize 中计算
    graphic: [], 
    series: [
      {
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 1,
        z: 2,
        lineStyle: {
          color: '#FFFFFF',
          width: 2,
          opacity: 0.7,
          curveness: 0
        },
        data: linesData // 使用过滤后的数据
      },
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 1,
        z: 3,
        data: labelData, // 使用过滤后的数据
        symbolSize: 0,
        slient: false, // 允许散点响应鼠标点击
        label: {
          show: true,
          formatter: '{b}',
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: "bolder",
          fontFamily: 'Songti SC, serif',
          textBorderColor: '#FFFFFF',
          textBorderWidth: 0.4,
          distance: 10
        }
      }
    ]
  };
  
  myChart.setOption(option);

  // 地图上散点响应鼠标点击事件
  myChart.on('click', (parama) => {
    if ( parama.componentType == 'series' && parama.seriesType === 'scatter'){
      handleNavigation(parama.name)
    }
  })

  // 必须在 setOption 之后，地图渲染有了坐标系，才能计算像素坐标
  updateGraphic();
}

// 独立的更新图形函数
const updateGraphic = () => {
  if (myChart) {
    myChart.setOption({
      graphic: getGraphicOption()
    });
  }
}

const resizeChart = () => {
  if (myChart) {
    myChart.resize();
    // 窗口大小改变后，像素坐标变了，需要重新计算绘制
    updateGraphic();
  }
}

onMounted(() => {
  nextTick(() => {
    initChart();
    window.addEventListener('resize', resizeChart);
  });
});

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