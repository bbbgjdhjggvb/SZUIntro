<template>
  <div class="main-box">
    <div class="box-sidebar">
      <SideBar></SideBar>
    </div>
    <!--内容区-->
    <div class="max-container">
      <!-- 切换按钮 -->
      <div class="toggle-container">
        <div 
          class="toggle-btn" 
          :class="{ active: currentRegion === 'china' }"
          @click="toggleMap('china')"
        >
          国内分会
        </div>
        <div 
          class="toggle-btn" 
          :class="{ active: currentRegion === 'north_america' }"
          @click="toggleMap('north_america')"
        >
          北美分会
        </div>
        <div 
          class="toggle-btn" 
          :class="{ active: currentRegion === 'oceania' }"
          @click="toggleMap('oceania')"
        >
          大洋洲分会
        </div>
      </div>
      
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
import northAmericaJson from '@/assets/map/NorthAmericaGeo.json';
import oceaniaJson from '@/assets/map/AoZhou.json';

const router = useRouter();

const chartRef = ref<HTMLElement | null>(null);
let myChart: EChartsType | null = null;
type Region = 'china' | 'north_america' | 'oceania';
const currentRegion = ref<Region>('china');

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

const overseasAlumniData = [
  { name: '美国加州校友分会', coord: [-119.4179, 36.7783], region: 'north_america' }, // California, USA
  { name: '加拿大校友联谊会', coord: [-106.3468, 56.1304], region: 'north_america' }, // Canada
  { name: '多伦多校友联谊会', coord: [-79.3832, 43.6532], region: 'north_america' }, // Toronto, Canada
  { name: '澳洲校友联谊会', coord: [133.7751, -25.2744], region: 'oceania' }, // Australia
  { name: '新西兰校友联谊会', coord: [174.8860, -40.9006], region: 'oceania' }, // New Zealand
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
  if (!myChart || currentRegion.value !== 'china') return []; // 只有中国地图模式显示自定义引导线框

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
  router.push({
    name: 'XYHDetail',
    params: {
      name: name
    }
  })
}

const toggleMap = (region: Region) => {
  if (currentRegion.value === region) return;
  currentRegion.value = region;
  updateChartOptions();
  updateGraphic();
}

const updateChartOptions = () => {
  if (!myChart) return;

  const defaultColors = {
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: '#FFFFFF' },
      { offset: 0.3, color: '#F2A8C1' },
      { offset: 1, color: '#FF0055' }
    ],
    global: false
  };

  // 北美专用配色：减少白色渐变，避免阿拉斯加因独立bbox导致过白
  const naColors = {
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: '#FFF0F5' }, // 极淡的粉色 (LavenderBlush)，接近白色但带粉色调
      { offset: 0.3, color: '#F2A8C1' }, // 恢复中间色
      { offset: 1, color: '#FF0055' }
    ],
    global: false
  };

  const colors = currentRegion.value === 'north_america' ? naColors : defaultColors;

  if (currentRegion.value !== 'china') {
    // 海外模式配置
    const mapName = currentRegion.value;
    const currentData = overseasAlumniData.filter(d => d.region === mapName);

    // 针对每个区域的特定显示配置
    let center: number[] | undefined = undefined;
    let zoom = 1.2;
    let layoutCenter: string[] | undefined = undefined;
    let layoutSize: string | undefined = undefined;
    
    if (mapName === 'north_america') {
       // 北美
       zoom = 1.8; 
       layoutCenter = ['45%', '45%'];
       layoutSize = '75%';
    } else if (mapName === 'oceania') {
       // 大洋洲
       zoom = 1.0;
       layoutCenter = ['50%', '45%']; // 稍微上移
       layoutSize = '100%';
    }

    const option = {
      geo: {
        map: mapName, // 使用过滤后的地图
        roam: false, // 禁止缩放漫游
        zoom: zoom,
        center: center,
        layoutCenter: layoutCenter,
        layoutSize: layoutSize,
        silent: true, // 禁止地图板块的鼠标交互（去除hover高亮/阴影）
        label: { show: false },
        itemStyle: {
          areaColor: colors, // 复用配色
          shadowColor: '#8B1A38',
          shadowOffsetX: -1,
          shadowOffsetY: 20,
          shadowBlur: 0,
          borderColor: '#ffffff',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: { areaColor: colors },
          label: { show: false }
        }
      },
      graphic: [], // 清空国内的graphic
      series: [
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 1,
          z: 3,
          data: currentData.map(item => ({
            name: item.name,
            value: item.coord
          })),
          symbolSize: 8,
          itemStyle: {
            color: '#FFFFFF',
            shadowBlur: 10,
            shadowColor: '#333'
          },
          label: {
            show: true,
            formatter: '{b}',
            position: 'right',
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: "bold",
            fontFamily: 'MySourceHanSerifBold, Songti SC, serif',
            distance: 10,
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: [4, 8],
            borderRadius: 4
          }
        }
      ]
    };
    myChart.setOption(option, true); // true = not merge, replace components
  } else {
    // 国内模式配置 (原配置)
    const option = {
      geo: {
        map: 'china',
        roam: false,
        zoom: 1.3,
        center: null, // Reset center using layoutCenter/Size
        layoutCenter: ['47%', '65%'],
        layoutSize: '100%',
        silent: true, // 禁止地图板块的鼠标交互
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
      graphic: [], // 初始为空，由updateGraphic填充
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
          data: linesData
        },
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 1,
          z: 3,
          data: labelData,
          symbolSize: 0,
          silent: false,
          label: {
            show: true,
            formatter: '{b}',
            color: '#FFFFFF',
            fontSize: 22,
            fontWeight: "bolder",
            fontFamily: 'MySourceHanSerifBold, Songti SC, serif',
            distance: 10
          }
        }
      ]
    };
    myChart.setOption(option, true);
  }
}

const initChart = () => {
  if (!chartRef.value) return;
  echarts.registerMap('china', chinaJson as any);
  
  // 注册北美地图
  echarts.registerMap('north_america', northAmericaJson as any);

  // 注册大洋洲地图
  echarts.registerMap('oceania', oceaniaJson as any);
  
  myChart = echarts.init(chartRef.value);
  
  updateChartOptions();

  // 地图上散点响应鼠标点击事件
  myChart.on('click', (parama) => {
    if ( parama.componentType == 'series' && parama.seriesType === 'scatter'){
      handleNavigation(parama.name)
    }
  })

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
  position: relative; /* ensure absolute children position correctly */
}

.box-sidebar{
  width: 80px;
  padding: 0px;
  margin: 0px;
  background: transparent;
  border-radius: 20px;
  flex-shrink: 0;
  /**侧边栏动画 */
  opacity: 0;
  transform: translateX(-30px);
  animation: slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.2s; /* 等路由动画走一点再出来 */
}

/** 添加侧边栏过渡动画 */
@keyframes slideInLeft {
  to {opacity: 1; transform: translateX(0);}
}

.max-container{
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.chart-box{
  width: 100%;
  height: 100%;
  background: transparent;
}

.toggle-container {
  display: flex;
  position: absolute;
  top: 20px;
  right: 40px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 4px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.toggle-btn {
  padding: 8px 24px;
  border-radius: 24px;
  font-family: 'Songti SC', serif;
  font-size: 18px;
  font-weight: bold;
  color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toggle-btn.active {
  background: #FFFFFF;
  color: #8B1A38; /* Use a brand color for active text */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>