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
  static highlightedEntities: Map<Cesium.Entity, Cesium.Color> = new Map() // 存储高亮的实体及其颜色
  static clickHandler: Cesium.ScreenSpaceEventHandler | null = null // 点击事件处理器
  
  // 舒适的高亮配色方案（柔和的半透明颜色）
  private static readonly HIGHLIGHT_COLORS: Cesium.Color[] = [
    Cesium.Color.fromCssColorString('#FF6B6B').withAlpha(0.6), // 柔和红色
    Cesium.Color.fromCssColorString('#4ECDC4').withAlpha(0.6), // 青绿色
    Cesium.Color.fromCssColorString('#45B7D1').withAlpha(0.6), // 天蓝色
    Cesium.Color.fromCssColorString('#FFA07A').withAlpha(0.6), // 浅橙色
    Cesium.Color.fromCssColorString('#98D8C8').withAlpha(0.6), // 薄荷绿
    Cesium.Color.fromCssColorString('#F7DC6F').withAlpha(0.6), // 柔黄色
    Cesium.Color.fromCssColorString('#BB8FCE').withAlpha(0.6), // 淡紫色
    Cesium.Color.fromCssColorString('#85C1E2').withAlpha(0.6), // 浅蓝色
    Cesium.Color.fromCssColorString('#F8B88B').withAlpha(0.6), // 桃色
    Cesium.Color.fromCssColorString('#90EE90').withAlpha(0.6), // 浅绿色
    Cesium.Color.fromCssColorString('#FFB6C1').withAlpha(0.6), // 浅粉色
    Cesium.Color.fromCssColorString('#87CEEB').withAlpha(0.6), // 天空蓝
    Cesium.Color.fromCssColorString('#DDA0DD').withAlpha(0.6), // 梅色
    Cesium.Color.fromCssColorString('#20B2AA').withAlpha(0.6), // 浅海绿
    Cesium.Color.fromCssColorString('#FFD700').withAlpha(0.6), // 金色
  ]

  static remove() {
    if (this.drawTool && typeof this.drawTool._removeAllEvent === 'function') {
      this.drawTool._removeAllEvent()
    }
  }
  static init_world(containerId: string) {
    // 检查容器是否存在
    const container = document.getElementById(containerId)
    if (!container) {
      console.error(`Container element with id "${containerId}" not found`)
      return
    }
    
    // 如果已经初始化过，先销毁旧的 viewer
    if (this.viewer) {
      console.warn('Cesium viewer already initialized, destroying old instance')
      this.viewer.destroy()
      this.viewer = null as any
    }
    
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

    try {
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
      
      console.log('Cesium viewer created successfully')
    } catch (error) {
      console.error('Error creating Cesium viewer:', error)
      throw error
    }
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
    if (!this.viewer) {
      console.error('Cesium viewer is not initialized')
      return
    }
    if (!position) {
      console.error('Position is invalid')
      return
    }
    try {
      const destination: LonLatType = getLonLat(position)
      console.log('Flying to location:', {
        longitude: destination.longitude,
        latitude: destination.latitude,
        height,
      })
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
    } catch (error) {
      console.error('Error in flyToLocation:', error)
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
    if (!this.viewer) {
      console.error('Cesium viewer is not initialized')
      return
    }
    // 清理之前的工具
    if (this.drawTool && typeof this.drawTool._removeAllEvent === 'function') {
      this.drawTool._removeAllEvent()
    }
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
          // 明确设置 outlineWidth 为 1，避免超出 WebGL 线宽范围
          entity.polygon.outlineWidth = 1.0
          
          // 为每个实体添加可点击标识
          entity.properties = entity.properties || {}
          entity.properties.isProvinceRegion = true // 标记为省市区域
          
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
      
      // 初始化点击高亮功能
      this.initProvinceClickHighlight()
      
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

    // 清除所有高亮
    this.clearAllHighlights()

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

  /**
   * 初始化省市区域点击高亮功能
   */
  static initProvinceClickHighlight(): void {
    if (!this.viewer) {
      console.error('Cesium viewer is not initialized')
      return
    }

    // 如果已经存在点击处理器，先移除
    if (this.clickHandler) {
      this.clickHandler.destroy()
      this.clickHandler = null
    }

    // 创建新的点击事件处理器
    this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)

    // 监听左键点击事件
    this.clickHandler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (!this.viewer || !this.chinaBorderDataSource) return

      // 获取点击位置的地理坐标
      const cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid)
      if (!cartesian) {
        // 如果pickEllipsoid失败，尝试使用pickPosition
        const ray = this.viewer.camera.getPickRay(click.position)
        if (ray) {
          const pickedPosition = this.viewer.scene.globe.pick(ray, this.viewer.scene)
          if (!pickedPosition) return
          
          const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition)
          const longitude = Cesium.Math.toDegrees(cartographic.longitude)
          const latitude = Cesium.Math.toDegrees(cartographic.latitude)
          
          // 遍历所有实体，检查点击位置是否在 polygon 内
          for (let i = 0; i < this.chinaBorderDataSource.entities.values.length; i++) {
            const entity = this.chinaBorderDataSource.entities.values[i]
            if (entity.polygon && this.isPointInPolygon(longitude, latitude, entity)) {
              this.toggleProvinceHighlight(entity)
              return
            }
          }
        }
        return
      }

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude)

      // 先尝试使用 drillPick 查找直接点击的实体（更高效）
      const pickedObjects = this.viewer.scene.drillPick(click.position)
      let clickedEntity: Cesium.Entity | null = null

      for (const picked of pickedObjects) {
        if (picked.id && picked.id instanceof Cesium.Entity) {
          const entity = picked.id as Cesium.Entity
          // 检查是否是省市区域的 polygon 实体
          if (entity.polygon) {
            // 检查是否是数据源中的实体
            const isInDataSource = this.chinaBorderDataSource!.entities.values.some(e => e === entity)
            if (isInDataSource) {
              clickedEntity = entity
              break
            }
          }
        }
      }

      // 如果没有直接找到，遍历所有实体检查点击位置是否在 polygon 内
      if (!clickedEntity) {
        for (let i = 0; i < this.chinaBorderDataSource.entities.values.length; i++) {
          const entity = this.chinaBorderDataSource.entities.values[i]
          if (entity.polygon && this.isPointInPolygon(longitude, latitude, entity)) {
            clickedEntity = entity
            break
          }
        }
      }

      if (clickedEntity) {
        this.toggleProvinceHighlight(clickedEntity)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /**
   * 检查点是否在 polygon 内
   */
  private static isPointInPolygon(
    longitude: number,
    latitude: number,
    entity: Cesium.Entity
  ): boolean {
    if (!entity.polygon || !entity.polygon.hierarchy) return false

    let hierarchy: any = entity.polygon.hierarchy
    if (typeof (entity.polygon.hierarchy as any).getValue === 'function') {
      hierarchy = (entity.polygon.hierarchy as any).getValue(Cesium.JulianDate.now())
    }
    if (!hierarchy || !hierarchy.positions) return false

    const positions = hierarchy.positions
    let inside = false

    for (let i = 0, j = positions.length - 1; i < positions.length; j = i++) {
      const xi = Cesium.Math.toDegrees(
        Cesium.Cartographic.fromCartesian(positions[i]).longitude
      )
      const yi = Cesium.Math.toDegrees(
        Cesium.Cartographic.fromCartesian(positions[i]).latitude
      )
      const xj = Cesium.Math.toDegrees(
        Cesium.Cartographic.fromCartesian(positions[j]).longitude
      )
      const yj = Cesium.Math.toDegrees(
        Cesium.Cartographic.fromCartesian(positions[j]).latitude
      )

      const intersect =
        yi > latitude !== yj > latitude &&
        longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi

      if (intersect) inside = !inside
    }

    return inside
  }

  /**
   * 根据实体获取唯一的高亮颜色
   * 使用实体名称或ID的哈希值确保相同实体总是得到相同颜色，不同实体得到不同颜色
   */
  private static getUniqueHighlightColor(entity: Cesium.Entity): Cesium.Color {
    // 获取实体的唯一标识（优先使用name，如果没有则使用id）
    const identifier = (entity.name as string) || (entity.id as string) || String(entity.id)
    
    // 简单的哈希函数：将字符串转换为数字
    let hash = 0
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    
    // 使用哈希值的绝对值模颜色数组长度，确保索引在有效范围内
    const colorIndex = Math.abs(hash) % this.HIGHLIGHT_COLORS.length
    return this.HIGHLIGHT_COLORS[colorIndex]
  }

  /**
   * 检查颜色是否已被其他高亮实体使用
   * 如果已被使用，返回下一个可用的颜色
   */
  private static getAvailableColor(entity: Cesium.Entity): Cesium.Color {
    const preferredColor = this.getUniqueHighlightColor(entity)
    
    // 获取所有当前已使用的颜色
    const usedColors = new Set<string>()
    this.highlightedEntities.forEach((color, usedEntity) => {
      if (usedEntity !== entity) {
        usedColors.add(color.toCssColorString())
      }
    })
    
    // 如果首选颜色未被使用，直接返回
    if (!usedColors.has(preferredColor.toCssColorString())) {
      return preferredColor
    }
    
    // 如果首选颜色已被使用，查找下一个可用的颜色
    for (let i = 0; i < this.HIGHLIGHT_COLORS.length; i++) {
      const testColor = this.HIGHLIGHT_COLORS[i]
      const colorStr = testColor.toCssColorString()
      if (!usedColors.has(colorStr)) {
        return testColor
      }
    }
    
    // 如果所有颜色都被使用（不太可能发生），基于首选颜色生成一个变体
    return preferredColor
  }

  /**
   * 根据实体获取对应的边框颜色（比填充色稍深一些）
   */
  private static getOutlineColor(fillColor: Cesium.Color): Cesium.Color {
    // 获取填充色的RGB值，然后稍微加深作为边框色
    const red = Math.min(255, fillColor.red * 255 * 0.8)
    const green = Math.min(255, fillColor.green * 255 * 0.8)
    const blue = Math.min(255, fillColor.blue * 255 * 0.8)
    return Cesium.Color.fromBytes(Math.floor(red), Math.floor(green), Math.floor(blue), 255)
  }

  /**
   * 切换省市区域的高亮状态
   */
  static toggleProvinceHighlight(entity: Cesium.Entity): void {
    if (!entity.polygon) return

    const isHighlighted = this.highlightedEntities.has(entity)

    if (isHighlighted) {
      // 取消高亮：恢复原始状态
      entity.polygon.fill = new Cesium.ConstantProperty(false)
      entity.polygon.outline = new Cesium.ConstantProperty(true)
      entity.polygon.outlineColor = new Cesium.ConstantProperty(Cesium.Color.BLACK)
      entity.polygon.outlineWidth = new Cesium.ConstantProperty(1.0)
      this.highlightedEntities.delete(entity)
      console.log('取消高亮:', entity.name || '未知区域')
    } else {
      // 添加高亮：为每个区域分配一个唯一的颜色（确保不同区域颜色不同）
      const highlightColor = this.getAvailableColor(entity)
      const outlineColor = this.getOutlineColor(highlightColor)
      
      entity.polygon.fill = new Cesium.ConstantProperty(true)
      entity.polygon.material = new Cesium.ColorMaterialProperty(highlightColor)
      entity.polygon.outline = new Cesium.ConstantProperty(true)
      entity.polygon.outlineColor = new Cesium.ConstantProperty(outlineColor)
      entity.polygon.outlineWidth = new Cesium.ConstantProperty(1.0) // 保持 1.0 避免 lineWidth 错误
      
      this.highlightedEntities.set(entity, highlightColor)
      console.log('高亮显示:', entity.name || '未知区域', '颜色:', highlightColor.toCssColorString())
    }
  }

  /**
   * 清除所有高亮
   */
  static clearAllHighlights(): void {
    this.highlightedEntities.forEach((_color, entity) => {
      if (entity.polygon) {
        entity.polygon.fill = new Cesium.ConstantProperty(false)
        entity.polygon.outline = new Cesium.ConstantProperty(true)
        entity.polygon.outlineColor = new Cesium.ConstantProperty(Cesium.Color.BLACK)
        entity.polygon.outlineWidth = new Cesium.ConstantProperty(1.0)
      }
    })
    this.highlightedEntities.clear()
    console.log('已清除所有高亮')
  }

  /**
   * 销毁点击处理器
   */
  static destroyClickHandler(): void {
    if (this.clickHandler) {
      this.clickHandler.destroy()
      this.clickHandler = null
    }
  }
}
