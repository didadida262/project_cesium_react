import * as Cesium from 'cesium'

// 笛卡尔坐标转换成经纬度 Cesium.Cartographic.fromCartesian(cartesian);
export const tainanPosition = Cesium.Cartesian3.fromDegrees(120.213, 22.997) // 台南
export const taipeiPosition = Cesium.Cartesian3.fromDegrees(121.565, 25.033) // 台北
export const taizhongPosition = Cesium.Cartesian3.fromDegrees(120.648, 24.163) // 台中
export const gaoxiongPosition = Cesium.Cartesian3.fromDegrees(120.307, 22.624) // 高雄

export const jinhuPosition = Cesium.Cartesian3.fromDegrees(119.04, 33.0) // 金湖
export const putianPosition = Cesium.Cartesian3.fromDegrees(119.138, 25.292) // 莆田
export const shantouPosition = Cesium.Cartesian3.fromDegrees(116.686, 23.358) // 汕头
export const xiamenPosition = Cesium.Cartesian3.fromDegrees(118.116, 24.468) // 厦门
export const nanjingPosition = Cesium.Cartesian3.fromDegrees(
  118.78211699999997,
  32.03577000000001,
) // 南京
export const beijingPosition = Cesium.Cartesian3.fromDegrees(116.4074, 39.9042) // 北京
export const ways = [
  {
    name: '1',
    startPosition: putianPosition,
    endPosition: taipeiPosition,
    model: '/models/Cesium_Air.glb',
  },
  {
    name: '2',
    startPosition: xiamenPosition,
    endPosition: taizhongPosition,
    model: '/models/Cesium_Air.glb',
  },
  {
    name: 'follow',
    startPosition: shantouPosition,
    endPosition: tainanPosition,
    model: '/models/Cesium_Air.glb',
  },
]

export const BTNMap = [
  {
    text: '通用配置',
    key: 'config',
  },
  {
    text: '跳转至目标地点',
    key: 'jump',
  },

  {
    text: '标注模式',
    key: 'mark',
  },
  {
    text: '动效演示',
    key: 'situation',
  },
  {
    text: '图标绘制',
    key: 'drawFlag',
  },
]
export const options = [
  {
    label: '绘制点',
    key: 'Point',
  },

  {
    label: '绘制线段',
    key: 'Line',
  },
]

export const MockPointData = [
  { lon: 121.5654, lat: 25.033000000000005, height: 99999.99999997854 },
  {
    lon: 120.44284378603572,
    lat: 23.718834525216245,
    height: 49.9703782274476,
  },
  {
    lon: 120.36979188737665,
    lat: 23.684609396995818,
    height: 49.94755060794172,
  },
  {
    lon: 120.34727084010676,
    lat: 23.640036419478168,
    height: 49.815015555840766,
  },
  {
    lon: 120.40425107610908,
    lat: 23.62479788925661,
    height: 49.91505409535976,
  },
  {
    lon: 120.46221982225876,
    lat: 23.67681529612735,
    height: 49.98082774137771,
  },
]

export const MockredTableData = [
  {
    name: '红旗',
    icon: '/images/icon/flagRed.svg',
  },
  {
    name: '绿旗',
    icon: '/images/icon/flagGreen.svg',
  },
]
export const MockMarkTableData = [
  {
    name: '绘制点',
    key: 'Point',
  },

  {
    name: '绘制线段',
    key: 'Line',
  },
  {
    name: '直线箭头',
    key: 'StraightArrow',
  },

  {
    name: '攻击箭头',
    key: 'AttackArrow',
  },
  {
    name: '钳形箭头',
    key: 'PincerArrow',
  },

  //   {
  //     label: "绘制区域",
  //     key: "Polygon",
  //   },

  //   {
  //     label: "测量",
  //     key: "measure",
  //   },
]

export const MockScriptTableData = [
  {
    name: '攻T1',
    key: 1,
    animationData: {
      name: 'air',
      degree: 0,
      positions: [
        putianPosition,
        taipeiPosition,
        taizhongPosition,
        tainanPosition,
        gaoxiongPosition,
      ],
      model: '/models/SK_East_Fighter_Su33.glb',
    },
  },

  {
    name: '攻T2',
    key: 2,
    animationData: {
      name: 'air',
      degree: -90,
      positions: [xiamenPosition, taizhongPosition],
      model: '/models/Cesium_Air.glb',
    },
  },

  {
    name: '攻T3',
    key: 3,
    animationData: {
      name: 'air',
      degree: -90,

      positions: [shantouPosition, tainanPosition],
      model: '/models/Cesium_Air.glb',
    },
  },
  {
    name: '攻T4',
    key: 4,
    animationData: {
      name: 'air',
      positions: [xiamenPosition, gaoxiongPosition],
      degree: -90,
      model: '/models/Cesium_Air.glb',
    },
  },

  {
    name: '攻T4',
    key: 5,
    animationData: {
      name: 'air',
      degree: -90,

      positions: [taipeiPosition, tainanPosition],
      model: '/models/Cesium_Air.glb',
    },
  },
]

// 地点跳转数据
export const MockLocationJumpTableData = [
  {
    name: '北京',
    key: 'beijing',
  },
  {
    name: '台湾',
    key: 'taiwan',
  },
]
