import * as Cesium from 'cesium'
import PointTool from './tools/PointTool'
import LineTool from './tools/LineTool'
import IconTool from './tools/IconTool'
import StragitArrowTool from './tools/StragitArrowTool'
import AttackArrow from './tools/AttackArrow'
import PincerArrow from './tools/PincerArrow'

import Polyline from './tools/Polyline'

import { handleAnimation, moveAToBGLBV2 } from './animation/Animations'
import { drawPoint, showExplosion } from './CesiumUtils'
// 位置常量已移至调用处使用，不再在此导入
import { getLonLat, LonLatType } from './CesiumUtils'

export class CesiumController {
  static viewer: Cesium.Viewer
  static drawTool: any
  static chinaBorderDataSource: Cesium.GeoJsonDataSource | null = null

  static remove() {
    this.drawTool && this.drawTool._removeAllEvent()
  }
  static init_world(containerId: string) {
    // Cesium.Ion.defaultAccessToken =
    //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMTQ4ZmRhMS00MjY3LTRlZTgtOGU3Yi01OTY4NTEwN2NkYzciLCJpZCI6Mjk0MTEyLCJpYXQiOjE3NDQ2ODU2OTd9.yMNzVcVvq9NI2sXWePenGj5ZJbshJqiGqctlNlDWEDA";

    const imageryProviderV1 = new Cesium.ArcGisMapServerImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    })
    const imageryProviderv2_GeoQ = new Cesium.UrlTemplateImageryProvider({
      url: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
    })

    const imageryProvider_tianditu =
      new Cesium.WebMapTileServiceImageryProvider({
        url: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=wW719713496',
        layer: 'img',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'w',
        maximumLevel: 18,
      })
    //   ok
    const imageryProvider_gaode = new Cesium.UrlTemplateImageryProvider({
      url: 'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      minimumLevel: 3,
      maximumLevel: 18,
    })

    this.viewer = new Cesium.Viewer(containerId, {
      selectionIndicator: false, // 禁用选择指示器
      infoBox: false, // 禁用右侧信息面板
      imageryProvider: imageryProviderV1,

      timeline: false, // 是否显示时间线控件
      baseLayerPicker: false,
      animation: false, // 可选：关闭动画控件
      shouldAnimate: true,
    });

    // 去除logo
    (this.viewer.cesiumWidget.creditContainer as HTMLElement).style.display =
      'none'
    // 显示帧率
    this.viewer.scene.debugShowFramesPerSecond = true;
    (window as any).viewer = this.viewer
  }
  static exportData() {
    const res = this.drawTool && this.drawTool.exportData()
    return res
  }
  /**
   * 统一的跳转函数
   * @param position 目标位置的Cartesian3坐标
   * @param height 相机高度（米），默认500000
   * @param showExplosionEffect 是否显示爆炸效果，默认false
   * @param explosionPosition 爆炸效果位置（如果showExplosionEffect为true），默认使用position
   */
  static flyToLocation(
    position: Cesium.Cartesian3,
    height = 500000,
    showExplosionEffect = false,
    explosionPosition?: Cesium.Cartesian3,
  ) {
    if (!this.viewer) return
    const destination: LonLatType = getLonLat(position)
    // 使用flyTo定位
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        destination.longitude,
        destination.latitude,
        height,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0), // 朝向
        pitch: Cesium.Math.toRadians(-80), // 俯仰角
        roll: 0.0,
      },
      duration: 2, // 飞行时间(秒)
    })
    // 如果需要显示爆炸效果
    if (showExplosionEffect) {
      showExplosion(this.viewer, explosionPosition || position)
    }
  }

  static clearAllMark() {
    this.drawTool && this.drawTool.clear()
  }
  static clearAllPoints() {
    this.drawTool && this.drawTool.clear()
  }
  static handleAttack(type: string) {
    console.log('//.///')
  }
  static mark(type: string, data?: any) {
    this.drawTool && this.drawTool._removeAllEvent()
    switch (type) {
      case 'Point':
        this.drawTool = new PointTool(this.viewer)
        this.drawTool.activate(type, (data: any) => {
          console.log('data')
        })
        break
      case 'Line':
        this.drawTool = new LineTool(this.viewer)
        this.drawTool.activate(type, (data: any) => {
          console.log('data')
        })
        break
      case 'PointIcon':
        this.drawTool = new IconTool(this.viewer, data.icon)
        this.drawTool.activate(type, (data: any) => {
          console.log('data')
        })
        break
      case 'StraightArrow':
        // =方案二
        this.drawTool = new StragitArrowTool(this.viewer)
        this.drawTool.activate(type, (data: any) => {
          console.log('data')
        })
        break
      case 'AttackArrow':
        this.drawTool = new AttackArrow(this.viewer)
        this.drawTool.activate(type, (data: any) => {
          console.log('data')
        })
        break
      case 'PincerArrow':
        this.drawTool = new PincerArrow(this.viewer)
        this.drawTool.activate(type, (data: any) => {
          console.log('data')
        })
        break
      //   case "StraightArrow":
      //     // =方案一
      //     this.handleAttack("straightArrow");
      //     break;
      //   case "AttackArrow":
      //     this.handleAttack("attackArrow");
      //     break;
      //   case "PincerArrow":
      //     this.handleAttack("pincerArrow");
      //     break;
      default:
        break
    }
  }

  static async showSituation(item: any) {
    await handleAnimation(this.viewer, item)
  }

  static drawPoints(points: any) {
    points.forEach((point: any) => {
      // 添加点实体
      if (!this.viewer) return
      const pointEntity = this.viewer.entities.add({
        name: '我的点',
        position: Cesium.Cartesian3.fromDegrees(
          point.lon, // 经度
          point.lat, // 纬度
          point.height, // 高度（米）
        ),
        point: {
          color: Cesium.Color.RED,
          pixelSize: 10,
          outlineColor: Cesium.Color.YELLOW,
          outlineWidth: 2,
        },
      })
      //   this.viewer.flyTo(pointEntity);
    })
  }


  /**
   * 省份到省会城市的映射表
   */
  private static provinceToCapitalMap: Record<string, string> = {
    '北京市': '北京',
    '天津市': '天津',
    '河北省': '石家庄',
    '山西省': '太原',
    '内蒙古自治区': '呼和浩特',
    '辽宁省': '沈阳',
    '吉林省': '长春',
    '黑龙江省': '哈尔滨',
    '上海市': '上海',
    '江苏省': '南京',
    '浙江省': '杭州',
    '安徽省': '合肥',
    '福建省': '福州',
    '江西省': '南昌',
    '山东省': '济南',
    '河南省': '郑州',
    '湖北省': '武汉',
    '湖南省': '长沙',
    '广东省': '广州',
    '广西壮族自治区': '南宁',
    '海南省': '海口',
    '重庆市': '重庆',
    '四川省': '成都',
    '贵州省': '贵阳',
    '云南省': '昆明',
    '西藏自治区': '拉萨',
    '陕西省': '西安',
    '甘肃省': '兰州',
    '青海省': '西宁',
    '宁夏回族自治区': '银川',
    '新疆维吾尔自治区': '乌鲁木齐',
    '台湾省': '台北',
    '香港特别行政区': '香港',
    '澳门特别行政区': '澳门',
  }

  /**
   * 绘制中国边境线
   * 从本地 GeoData.json 文件读取数据
   * @param geoJsonUrl GeoJSON数据源的URL（可选，默认使用本地文件）
   */
  static async drawChinaBorder(geoJsonUrl?: string) {
    if (!this.viewer) return

    // 使用本地 GeoData.json 文件
    const defaultGeoJsonUrl = '/GeoData.json'
    const url = geoJsonUrl || defaultGeoJsonUrl

    try {
      // 先直接加载原始GeoJSON数据，提取省会信息
      const response = await fetch(url)
      const geoJsonData = await response.json()
      
      // 遍历GeoJSON features，提取省会信息
      if (geoJsonData && geoJsonData.features && Array.isArray(geoJsonData.features)) {
        geoJsonData.features.forEach((feature: any) => {
          if (feature.properties) {
            const props = feature.properties
            const name = props.name
            const adcode = props.adcode
            const level = props.level
            const center = props.center
            
            // 判断是否为省份：level为'province'，或者adcode是省级（后4位为0000且不是100000）
            const isProvince = (level === 'province' || level === '省') || 
                              (adcode && adcode !== 100000 && adcode % 10000 === 0 && adcode < 900000)
            
            if (isProvince && name && center && Array.isArray(center) && center.length >= 2) {
              const [longitude, latitude] = center
              const capitalPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude)
              // 获取省会城市名称，如果映射表中没有则使用省份名称
              const capitalName = this.provinceToCapitalMap[name] || name
              drawPoint(this.viewer, capitalName, capitalPosition)
              console.log(`标记省会: ${capitalName} (${longitude}, ${latitude})`)
            }
          }
        })
      }
      
      // 然后加载GeoJSON数据到Cesium，使用默认样式
      const geoJsonDataSource = await Cesium.GeoJsonDataSource.load(url)
      
      // 取消填充色，使用多个重叠的 outline 实现加粗边框效果
      geoJsonDataSource.entities.values.forEach((entity: any) => {
        if (entity.polygon) {
          entity.polygon.fill = false // 禁用填充
          entity.polygon.outline = true // 启用边框
          entity.polygon.outlineColor = Cesium.Color.BLACK // 设置边框颜色为黑色
          
          // 通过创建多个稍微偏移的 outline 来实现加粗效果
          // 获取原始 hierarchy
          const originalHierarchy = entity.polygon.hierarchy.getValue()
          
          if (originalHierarchy && originalHierarchy.positions) {
            const positions = originalHierarchy.positions
            const numLayers = 5 // 创建 5 层重叠的 outline（增加层数）
            const offsetStep = 0.0002 // 每层偏移的度数（约 22 米，增大偏移距离）
            
            // 为每一层创建稍微偏移的 polygon outline
            for (let layer = 0; layer < numLayers; layer++) {
              // 跳过中间层（原始 outline 已经存在）
              if (layer === Math.floor(numLayers / 2)) continue
              
              // 计算偏移：外层向外，内层向内
              const layerOffset = layer - Math.floor(numLayers / 2)
              const offset = layerOffset * offsetStep
              
              // 计算偏移后的位置
              const offsetPositions = positions.map((pos: Cesium.Cartesian3) => {
                const cartographic = Cesium.Cartographic.fromCartesian(pos)
                // 简单地向内或向外偏移
                return Cesium.Cartesian3.fromRadians(
                  cartographic.longitude + offset,
                  cartographic.latitude + offset,
                  cartographic.height,
                )
              })
              
              // 创建新的 polygon 实体用于显示加粗边框
              this.viewer.entities.add({
                polygon: {
                  hierarchy: new Cesium.PolygonHierarchy(offsetPositions),
                  fill: false,
                  outline: true,
                  outlineColor: Cesium.Color.BLACK,
                  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                },
              })
            }
          }
        }
      })
      
      this.viewer.dataSources.add(geoJsonDataSource)
      this.chinaBorderDataSource = geoJsonDataSource // 保存数据源引用
      
      console.log('加载的实体数量:', geoJsonDataSource.entities.values.length)
      
      // 飞转到中国的大致中心位置
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(104.0, 35.0, 5000000),
        duration: 2,
      })
      
      console.log('边境线已绘制（使用本地GeoData.json文件）')
      return geoJsonDataSource
    } catch (error) {
      console.error('加载GeoJSON数据失败:', error)
      throw error
    }
  }

  /**
   * 移除中国边境线
   */
  static removeChinaBorder() {
    if (!this.viewer) return

    // 移除所有GeoJSON数据源
    const dataSources = this.viewer.dataSources
    for (let i = dataSources.length - 1; i >= 0; i--) {
      const ds = dataSources.get(i)
      if (ds) {
        this.viewer.dataSources.remove(ds)
      }
    }
    this.chinaBorderDataSource = null
  }

  /**
   * 切换中国边境线的显示/隐藏
   */
  static async toggleChinaBorder(show: boolean) {
    if (!this.viewer) return
    
    if (show) {
      // 如果开启且边境线不存在，则重新加载
      if (!this.chinaBorderDataSource) {
        await this.drawChinaBorder()
      } else {
        // 如果已存在，则显示
        this.chinaBorderDataSource.show = true
      }
    } else {
      // 如果关闭，则删除边境线和填充色
      this.removeChinaBorder()
    }
  }
}
