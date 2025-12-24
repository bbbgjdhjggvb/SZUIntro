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

// ================= 0. 样式配置 (统一维护中心) =================
const TEXT_STYLE_CONFIG = {
  color: '#FFFFFF',                // 文字颜色
  fontFamily: 'MySourceHanSerifHeavy', // 字体
  shadowColor: 'rgba(0,0,0,0.5)',  // 阴影颜色
  shadowBlur: 2,                   // 阴影模糊度
  mapFontSize: 22,                 // 地图上散点(如北京)和行业入口的字号
  listFontSize: 16                 // 左侧扎堆列表(如普宁)的字号
};

// ================= 1. 数据定义 =================
const clusteredNames = [
  '普宁校友分会', '大潮阳校友分会', '饶平校友分会', 
  '紫金校友分会', '惠来校友分会', '东莞校友分会',
  '兴宁校友分会', '广州校友分会', '吴川校友分会',
  '香港校友联谊会'
];

const chinaAlumniData = [
  { id: 1, name: '北京地区校友分会', from: [116.407526, 39.90403], to: [135.00, 39.90403], align: 'right' },
  { id: 2, name: '长三角校友分会', from: [120.473701, 30.230416], to: [135.00, 30.230416], align: 'right' },
  { id: 3, name: '广州校友分会', from: [113.2644, 23.1291], to: [135.00, 23.1291], align: 'right' },
  { id: 4, name: '吴川校友分会', from: [110.7782, 21.4418], to: [133.1821, 21.4418], align: 'right' },
  { id: 5, name: '普宁校友分会', from: [116.1657, 23.2973], to: [98.00, 23.2973], align: 'left' },
  { id: 6, name: '大潮阳校友分会', from: [116.6016, 23.2649], to: [133.1821, 23.2649], align: 'right' },
  { id: 7, name: '饶平校友分会', from: [117.0039, 23.6641], to: [120.00, 23.6641], align: 'right' },
  { id: 8, name: '紫金校友分会', from: [115.1821, 23.6384], to: [133.1821, 23.6384], align: 'right' },
  { id: 9, name: '兴宁校友分会', from: [115.7312, 24.1365], to: [135.00, 24.1365], align: 'right' },
  { id: 10, name: '惠来校友分会', from: [116.3007, 23.0332], to: [103.00, 23.0332], align: 'left' },
  { id: 11, name: '四川校友分会', from: [104.0757, 31.8], to: [75.00, 31.8], align: 'left' },
  { id: 12, name: '西藏校友分会', from: [91.1174, 29.6472], to: [78.00, 29.6472], align: 'left' },
  { id: 13, name: '香港校友联谊会', from: [114.1694, 22.18], to: [105, 22.18], align: 'left' },
  { id: 14, name: '东莞校友分会', from: [113.7518, 23.0207], to: [114.00, 23.0207], align: 'right' },
  { id: 15, name: '河南校友分会', from: [113.7532, 34.7657], to: [130.0000, 34.7657], align: 'right' },
  { id: 16, name: '喀什校友联谊会', from: [75.9938, 39.4677], to: [70.9938, 39.4677], align: 'left' },
];

const normalData = chinaAlumniData.filter(item => !clusteredNames.includes(item.name));
const chinaLinesData = normalData.map(item => ({ coords: [item.from, item.to] }));
const chinaLabelData = normalData.map(item => ({
  name: item.name,
  value: item.to,
  id: item.id, 
  label: { position: item.align === 'left' ? 'left' : 'right' }
}));

const overseasAlumniData = [
  { id: 17, name: '美国加州校友分会', from: [-119.4179, 36.7783], to: [-140, 36.7783], region: 'north_america', align: 'left' }, 
  { id: 18, name: '加拿大校友联谊会', from: [-106.3468, 56.1304], to: [-43, 56.1304], region: 'north_america', align: 'right' }, 
  { id: 19, name: '多伦多校友联谊会', from: [-79.3832, 43.6532], to: [-52, 43.6532], region: 'north_america', align: 'right' }, 
  { id: 20, name: '澳洲校友联谊会', from: [133.7751, -25.2744], to: [160, -25.2744], region: 'oceania', align: 'right' }, 
  { id: 21, name: '新西兰校友联谊会', from: [174.8860, -40.9006], to: [179, -40.9006], region: 'oceania', align: 'right' }, 
];

// ================= 2. 交互逻辑 =================
const handleNavigation = (id: number) => {
  if (!id) return;
  router.push({ name: 'XYHDetail', query: { id: id } })
}

const goToIndustryList = () =>{
  router.push({name: 'IndustryList'});
}

// ================= 3. Graphic 绘制逻辑 =================
const getChinaGraphicOption = () => {
  if (!myChart) return [];
  
  // 3.1 左侧列表
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
  const guideLineLength = 340; 
  const listBoxX = rectX - guideLineLength - listBoxWidth;
  const listBoxY = rectY + (rectH / 2) - (listBoxHeight / 2);

  const textElements = clusteredNames.map((name, index) => {
    const target = chinaAlumniData.find(d => d.name === name);
    const targetId = target ? target.id : 0;
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
        fill: TEXT_STYLE_CONFIG.color,
        font: `${TEXT_STYLE_CONFIG.listFontSize}px "${TEXT_STYLE_CONFIG.fontFamily}"`, 
        // Graphic 使用 shadowColor
        shadowColor: TEXT_STYLE_CONFIG.shadowColor,
        shadowBlur: TEXT_STYLE_CONFIG.shadowBlur,
        width: singleColWidth,
        overflow: 'truncate',
        textVerticalAlign: 'middle',
      },
      onclick: () => handleNavigation(targetId)
    };
  });

  const listGraphics = [
    { type: 'rect', z: 99, shape: { x: rectX, y: rectY, width: rectW, height: rectH }, style: { stroke: '#FFFFFF', fill: 'rgba(255, 255, 255, 0.1)', lineWidth: 2, lineDash: [0] } },
    { type: 'polyline', z: 99, shape: { points: [[rectX, rectY + rectH / 2], [listBoxX + listBoxWidth, listBoxY + listBoxHeight/2]] }, style: { stroke: '#FFFFFF', lineWidth: 2 } },
    { type: 'rect', z: 99, shape: { x: listBoxX, y: listBoxY, width: listBoxWidth, height: listBoxHeight, r: 4 }, style: { stroke: '#FFFFFF', fill: 'rgba(255, 255, 255, 0.15)', lineWidth: 2 } },
    ...textElements
  ];

  // 3.2 行业校友会
  const industryStartGeo = [115.0, 23.5]; 
  const industryEndGeo = [138, 23.5];

  const pStart = myChart.convertToPixel('geo', industryStartGeo);
  const pEnd = myChart.convertToPixel('geo', industryEndGeo);
  
  let industryGraphics: any[] = [];

  if (pStart && pEnd) {
    industryGraphics = [
      {
        type: 'polyline',
        z: 99,
        shape: { points: [pStart, pEnd] },
        style: {
          stroke: TEXT_STYLE_CONFIG.color,
          lineWidth: 2,
          opacity: 0.7
        },
        silent: true 
      },
      {
        type: 'text',
        z: 100,
        left: pEnd[0] + 10, 
        top: pEnd[1] - 12,  
        style: {
          text: '行业校友分会',
          fill: TEXT_STYLE_CONFIG.color,
          font: `${TEXT_STYLE_CONFIG.mapFontSize}px "${TEXT_STYLE_CONFIG.fontFamily}"`,
          // Graphic 使用 shadowColor
          shadowColor: TEXT_STYLE_CONFIG.shadowColor,
          shadowBlur: TEXT_STYLE_CONFIG.shadowBlur
        },
        onclick: goToIndustryList,
        onmouseover: function() { this.attr('cursor', 'pointer'); }
      }
    ];
  }

  return [...listGraphics, ...industryGraphics];
};

const getGraphicOption = () => {
  if (currentRegion.value === 'china') {
    return getChinaGraphicOption();
  } else {
    return []; 
  }
};

// ================= 【修复】添加 updateGraphic 函数 =================
const updateGraphic = () => {
  if (!myChart) return;
  myChart.setOption({ graphic: getGraphicOption() });
}

// ================= 4. ECharts 配置更新 =================

const updateChartOptions = () => {
  if (!myChart) return;

  const chinaColors = { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FFFFFF' }, { offset: 0.3, color: '#F2A8C1' }, { offset: 1, color: '#FF0055' }], global: false };
  const northAmericaColors = { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FFEBF0' }, { offset: 0.3, color: '#F2A8C1' }, { offset: 1, color: '#FF0055' }], global: false };
  const oceaniaColors = { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#FFF5F7' }, { offset: 0.4, color: '#F2A8C1' }, { offset: 1, color: '#D00045' }], global: false };

  let selectedColors = chinaColors;
  let layoutCenter = ['48%', '60%'];
  let layoutSize = '92%';
  let zoom = 1.3;
  let currentLinesData: any[] = [];
  let currentLabelData: any[] = [];

  if (currentRegion.value === 'china') {
    selectedColors = chinaColors;
    layoutCenter = ['48%', '60%'];
    layoutSize = '92%';
    zoom = 1.3;
    currentLinesData = chinaLinesData;
    currentLabelData = chinaLabelData;
  } else if (currentRegion.value === 'north_america') {
    selectedColors = northAmericaColors;
    layoutCenter = ['45%', '50%'];
    layoutSize = '90%';
    zoom = 1.2;
    const naData = overseasAlumniData.filter(item => item.region === 'north_america');
    currentLinesData = naData.map(item => ({ coords: [item.from, item.to] }));
    currentLabelData = naData.map(item => ({
      name: item.name,
      value: item.to,
      id: item.id, 
      label: { 
        position: item.align === 'left' ? 'left' : 'right',
        distance: 15 
      }
    }));
  } else if (currentRegion.value === 'oceania') {
    selectedColors = oceaniaColors;
    layoutCenter = ['45%', '44%'];
    layoutSize = '95%';
    zoom = 1.1;
    const ocData = overseasAlumniData.filter(item => item.region === 'oceania');
    currentLinesData = ocData.map(item => ({ coords: [item.from, item.to] }));
    currentLabelData = ocData.map(item => ({
      name: item.name,
      value: item.to,
      id: item.id, 
      label: { 
        position: item.align === 'left' ? 'left' : 'right',
        distance: 15 
      }
    }));
  }

  let option: any = {
    geo: {
      map: currentRegion.value,
      roam: false,
      silent: true,
      zoom: zoom,
      layoutCenter: layoutCenter,
      layoutSize: layoutSize,
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
    series: [
      {
        id: 'lines_' + currentRegion.value, 
        type: 'lines', coordinateSystem: 'geo', zlevel: 1, z: 2,
        lineStyle: { color: '#FFFFFF', width: 2, opacity: 0.7, curveness: 0 },
        silent: true, 
        data: currentLinesData
      },
      {
        id: 'scatter_' + currentRegion.value,
        type: 'scatter', coordinateSystem: 'geo', zlevel: 1, z: 3,
        data: currentLabelData, 
        symbolSize: 20, 
        itemStyle: { color: 'transparent' }, 
        silent: false,
        label: {
          show: true, 
          formatter: '{b}', 
          // Series Label 使用 textShadowColor
          color: TEXT_STYLE_CONFIG.color, 
          fontSize: TEXT_STYLE_CONFIG.mapFontSize, 
          fontFamily: TEXT_STYLE_CONFIG.fontFamily,
          textShadowColor: TEXT_STYLE_CONFIG.shadowColor,
          textShadowBlur: TEXT_STYLE_CONFIG.shadowBlur
        }
      }
    ]
  };

  myChart.setOption(option, true);
};

const toggleMap = (region: Region) => {
  if (currentRegion.value === region) return;
  currentRegion.value = region;
  updateChartOptions();
  updateGraphic();
}

// ================= 5. 生命周期 =================

const initChart = () => {
  if (!chartRef.value) return;
  echarts.registerMap('china', chinaJson as any);
  echarts.registerMap('north_america', northAmericaJson as any);
  echarts.registerMap('oceania', oceaniaJson as any);
  
  myChart = echarts.init(chartRef.value);
  updateChartOptions();
  setTimeout(() => { updateGraphic(); }, 200);

  myChart.on('click', (params: any) => {
    if (params.componentType === 'series' && params.seriesType === 'scatter'){
      const id = params.data.id;
      handleNavigation(id);
    }
  })
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
/* 样式保持不变 */
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