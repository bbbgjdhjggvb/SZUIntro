<template>
  <div class="main-box">
    <div class="box-sidebar">
      <SideBar></SideBar>
    </div>
    <!--内容区-->
    <div class="max-container">
      <div ref="chartRef" class="chart-box"></div>
      
      <!-- 底部按钮 -->
      <div class="toggle-container">
        <div 
          class="toggle-btn" 
          :class="{ active: currentRegion === 'china' }"
          @click="toggleMap('china')"
        >
          国内校友分会
        </div>
        <div 
          class="toggle-btn" 
          :class="{ active: currentRegion === 'north_america' }"
          @click="toggleMap('north_america')"
        >
          北美校友分会
        </div>
        <div 
          class="toggle-btn" 
          :class="{ active: currentRegion === 'oceania' }"
          @click="toggleMap('oceania')"
        >
          大洋洲校友分会
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from '@renderer/components/sidebar/SideBar.vue';
import * as echarts from 'echarts';
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import type { EChartsType } from 'echarts';
import { useRouter } from 'vue-router';

// 确保路径正确
import chinaJson from '@/assets/map/china.json';
import northAmericaJson from '@/assets/map/NorthAmericaGeo.json';
import oceaniaJson from '@/assets/map/AoZhou.json';

const router = useRouter();
const chartRef = ref<HTMLElement | null>(null);
let myChart: EChartsType | null = null;
type Region = 'china' | 'north_america' | 'oceania';
const currentRegion = ref<Region>('china');

// ================= 1. 数据定义 =================

// 国内扎堆显示的城市
const clusteredNames = [
  '普宁校友分会', '大潮阳校友分会', '饶平校友分会', 
  '紫金校友分会', '惠来校友分会', '东莞校友分会',
  '兴宁校友分会', '广州校友分会', '吴川校友分会',
  '香港校友联谊会'
];

// 国内数据
const chinaAlumniData = [
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

// 国内数据预处理
const normalData = chinaAlumniData.filter(item => !clusteredNames.includes(item.name));
const chinaLinesData = normalData.map(item => ({ coords: [item.from, item.to] }));
const chinaLabelData = normalData.map(item => ({
  name: item.name,
  value: item.to,
  label: { position: item.align === 'left' ? 'left' : 'right' }
}));

// 海外数据配置 (已添加 align 参数)
// offset: [X轴偏移量, 0]。Y轴固定为0以保持水平。
const overseasAlumniData = [
  // 北美
  { 
    name: '美国加州校友分会', 
    coord: [-119.4179, 36.7783], 
    region: 'north_america', 
    offset: [-180, 0], 
    align: 'left' 
  }, 
  { 
    name: '加拿大校友联谊会', 
    coord: [-106.3468, 56.1304], 
    region: 'north_america', 
    offset: [180, 0], 
    align: 'right' 
  }, 
  { 
    name: '多伦多校友联谊会', 
    coord: [-79.3832, 43.6532], 
    region: 'north_america', 
    offset: [200, 0], 
    align: 'right' 
  }, 
  // 大洋洲
  { 
    name: '澳洲校友联谊会', 
    coord: [133.7751, -25.2744], 
    region: 'oceania', 
    offset: [220, 0], 
    align: 'right' 
  }, 
  { 
    name: '新西兰校友联谊会', 
    coord: [174.8860, -40.9006], 
    region: 'oceania', 
    offset: [150, 0], 
    align: 'right' 
  }, 
];

// ================= 2. 交互逻辑 =================

const handleNavigation = (name: string) => {
  router.push({
    name: 'XYHDetail',
    params: { name: name }
  })
}

const toggleMap = (region: Region) => {
  if (currentRegion.value === region) return;
  currentRegion.value = region;
  
  // 1. 切换地图底图配置
  updateChartOptions();
  
  // 2. 延迟绘制引导线动画 (400ms 确保地图渲染完成)
  setTimeout(() => {
    updateGraphic(true); // true = 播放生长动画
  }, 400);
}

// ================= 3. Graphic 绘制逻辑 =================

// 国内扎堆区域 Graphic (保持不变)
const getChinaGraphicOption = () => {
  if (!myChart) return [];
  const clusterGeoRect = { topLeft: [112.5, 24.5], bottomRight: [117.5, 21.5] };
  const p1 = myChart.convertToPixel('geo', clusterGeoRect.topLeft);
  const p2 = myChart.convertToPixel('geo', clusterGeoRect.bottomRight);

  if (!p1 || !p2) return [];

  const rectX = p1[0];
  const rectY = p1[1];
  const rectW = p2[0] - p1[0];
  const rectH = p2[1] - p1[1];

  const singleColWidth = 140;
  const padding = 10;
  const gap = 5;
  const lineHeight = 30;
  const totalCount = clusteredNames.length;
  const rows = Math.ceil(totalCount / 2);
  const listBoxWidth = singleColWidth * 2 + padding * 2 + gap;
  const listBoxHeight = rows * lineHeight + padding * 2;
  const guideLineLength = 240; 
  const listBoxX = rectX - guideLineLength - listBoxWidth;
  const listBoxY = rectY + (rectH / 2) - (listBoxHeight / 2);

  const textElements = clusteredNames.map((name, index) => {
    const isSecondCol = index >= rows;
    const rowIndex = index % rows;
    const currentTextX = isSecondCol ? listBoxX + padding + singleColWidth + gap : listBoxX + padding;
    const currentTextY = listBoxY + padding + rowIndex * lineHeight + 10;

    return {
      type: 'text',
      z: 100,
      left: currentTextX,
      top: currentTextY,
      style: {
        text: name,
        fill: '#FFFFFF',
        font: '16px "MySourceHanSerifHeavy"',
        width: singleColWidth,
        overflow: 'truncate',
        textVerticalAlign: 'middle',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowBlur: 2
      },
      onclick: () => handleNavigation(name)
    };
  });

  return [
    { type: 'rect', z: 99, shape: { x: rectX, y: rectY, width: rectW, height: rectH }, style: { stroke: '#FFFFFF', fill: 'rgba(255, 255, 255, 0.1)', lineWidth: 2, lineDash: [0] } },
    { type: 'polyline', z: 99, shape: { points: [[rectX, rectY + rectH / 2], [listBoxX + listBoxWidth, listBoxY + listBoxHeight/2]] }, style: { stroke: '#FFFFFF', lineWidth: 2 } },
    { type: 'rect', z: 99, shape: { x: listBoxX, y: listBoxY, width: listBoxWidth, height: listBoxHeight, r: 4 }, style: { stroke: '#FFFFFF', fill: 'rgba(255, 255, 255, 0.15)', lineWidth: 2 } },
    ...textElements
  ];
};

// 计算海外 Graphic (支持 align 参数)
const getOverseasGraphicOption = (region: Region, animate: boolean) => {
  if (!myChart) return [];
  const currentData = overseasAlumniData.filter(d => d.region === region);
  const elements: any[] = [];

  currentData.forEach((item) => {
    const point = myChart!.convertToPixel('geo', item.coord);
    if (!point || isNaN(point[0]) || isNaN(point[1])) return;

    // 终点坐标
    const endPointX = point[0] + item.offset[0];
    const endPointY = point[1]; 

    // === 1. 绘制水平引导线 ===
    const startPoints = [point, point]; 
    const finalPoints = [point, [endPointX, endPointY]];

    elements.push({
      type: 'polyline', 
      z: 100,
      id: `line_${item.name}`,
      shape: { points: animate ? startPoints : finalPoints },
      style: { 
        stroke: '#FFFFFF', 
        lineWidth: 2, 
        shadowBlur: 2, 
        shadowColor: 'rgba(0,0,0,0.5)' 
      },
      transition: ['shape'],
      $action: 'replace'
    });

    // === 2. 绘制文字 (根据 align 参数决定位置) ===
    // 如果 align 是 'left' (左对齐)，说明文字在终点的右侧
    // 如果 align 是 'right' (右对齐)，说明文字在终点的左侧
    const textPadding = 10;
    const textX = item.align === 'left' 
      ? endPointX + textPadding 
      : endPointX - textPadding;

    elements.push({
      type: 'text', 
      z: 101,
      id: `text_${item.name}`,
      left: textX,
      top: endPointY - 10,
      style: {
        text: item.name,
        fill: '#FFFFFF',
        font: '20px "MySourceHanSerifHeavy"',
        align: item.align, // 使用配置的 align 参数
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowBlur: 4,
        opacity: animate ? 0 : 1 
      },
      transition: ['style'],
      onclick: () => handleNavigation(item.name)
    });
  });

  return elements;
};

// 统一 Graphic 入口
const getGraphicOption = (isInitialRender: boolean = false) => {
  if (currentRegion.value === 'china') {
    return getChinaGraphicOption();
  } else {
    return getOverseasGraphicOption(currentRegion.value, isInitialRender);
  }
};

// ================= 4. ECharts 配置更新 =================

const updateChartOptions = () => {
  if (!myChart) return;

  // 配色方案
  const chinaColors = { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FFFFFF' }, { offset: 0.3, color: '#F2A8C1' }, { offset: 1, color: '#FF0055' }], global: false };
  const northAmericaColors = { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FFEBF0' }, { offset: 0.3, color: '#F2A8C1' }, { offset: 1, color: '#FF0055' }], global: false };
  const oceaniaColors = { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FFF5F7' }, { offset: 0.4, color: '#F2A8C1' }, { offset: 1, color: '#D00045' }], global: false };

  let selectedColors = chinaColors;
  if (currentRegion.value === 'north_america') selectedColors = northAmericaColors;
  else if (currentRegion.value === 'oceania') selectedColors = oceaniaColors;

  let option: any = {
    geo: {
      map: currentRegion.value,
      roam: false,
      silent: true,
      itemStyle: {
        areaColor: selectedColors,
        shadowColor: '#8B1A38',
        shadowOffsetX: -1,
        shadowOffsetY: 20,
        shadowBlur: 0,
        borderColor: '#ffffff',
        borderWidth: 1.5,
      },
      emphasis: { itemStyle: { areaColor: selectedColors }, label: { show: false } }
    },
    graphic: [], 
    series: [] 
  };

  if (currentRegion.value === 'china') {
    option.geo.layoutCenter = ['48%', '60%']; 
    option.geo.layoutSize = '92%'; 
    option.geo.zoom = 1.3;
    option.series = [
      {
        type: 'lines', coordinateSystem: 'geo', zlevel: 1, z: 2,
        lineStyle: { color: '#FFFFFF', width: 2, opacity: 0.7, curveness: 0 },
        data: chinaLinesData
      },
      {
        type: 'scatter', coordinateSystem: 'geo', zlevel: 1, z: 3,
        data: chinaLabelData, symbolSize: 0, silent: false,
        label: {
          show: true, formatter: '{b}', color: '#FFFFFF', fontSize: 22,
          fontFamily: 'MySourceHanSerifHeavy', distance: 10
        }
      }
    ];
  } else if (currentRegion.value === 'north_america') {
    option.geo.layoutCenter = ['45%', '50%']; 
    option.geo.layoutSize = '90%'; 
    option.geo.zoom = 1.2;
  } else if (currentRegion.value === 'oceania') {
    option.geo.layoutCenter = ['45%', '44%'];
    option.geo.layoutSize = '95%';
    option.geo.zoom = 1.1;
  }

  myChart.setOption(option, true);
};

// 更新 Graphic (控制动画)
const updateGraphic = (animate: boolean = false) => {
  if (!myChart) return;

  if (currentRegion.value !== 'china') {
    // 1. 初始状态 (不可见)
    const initialGraphics = getGraphicOption(animate);
    myChart.setOption({ graphic: initialGraphics });

    if (animate) {
      // 2. 最终状态 (可见 + 生长)
      setTimeout(() => {
        const finalGraphics = getOverseasGraphicOption(currentRegion.value, false);
        myChart!.setOption({ graphic: finalGraphics });
      }, 50);
    }
  } else {
    myChart.setOption({ graphic: getGraphicOption(false) });
  }
}

// ================= 5. 生命周期 =================

const initChart = () => {
  if (!chartRef.value) return;
  echarts.registerMap('china', chinaJson as any);
  echarts.registerMap('north_america', northAmericaJson as any);
  echarts.registerMap('oceania', oceaniaJson as any);
  
  myChart = echarts.init(chartRef.value);
  
  updateChartOptions();
  
  // 初始加载
  setTimeout(() => {
    updateGraphic(true); 
  }, 400);

  myChart.on('click', (parama) => {
    if (parama.componentType == 'series' && parama.seriesType === 'scatter'){
      handleNavigation(parama.name)
    }
  })
}

const resizeChart = () => {
  if (myChart) {
    myChart.resize();
    updateGraphic(false);
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
.main-box{ width: 100%; height: 100%; background: transparent; display: flex; flex-direction: row; position: relative; }
.box-sidebar{ width: 80px; flex-shrink: 0; z-index: 10; opacity: 0; transform: translateX(-30px); animation: slideInLeft 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: 0.2s; }
@keyframes slideInLeft { to {opacity: 1; transform: translateX(0);} }
.max-container{ flex: 1; width: 100%; height: 100%; position: relative; overflow: hidden; }
.chart-box{ width: 100%; height: 100%; }

.toggle-container { display: flex; position: absolute; bottom: 0px; left: 48%; transform: translateX(-50%); z-index: 1000; background: rgba(255, 255, 255, 0.15); border-radius: 40px; padding: 6px 10px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.2); gap: 10px; }
.toggle-btn { padding: 10px 30px; border-radius: 30px; font-family: 'MySourceHanSerifHeavy', serif; font-size: 18px; color: rgba(255, 255, 255, 0.8); cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
.toggle-btn:hover { background: rgba(255, 255, 255, 0.2); color: #fff; }
.toggle-btn.active { background: linear-gradient(135deg, #FFFFFF 0%, #FFE0E6 100%); color: #8B1A38; box-shadow: 0 2px 10px rgba(139, 26, 56, 0.3); transform: scale(1.05); }
</style>