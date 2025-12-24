// cesium：点绘制
import * as Cesium from 'cesium'

interface PointData {
  lon: number;
  lat: number;
  height: number;
}

export default class DrawTool {
  private name: string
  private viewer: Cesium.Viewer
  private _drawHandler: Cesium.ScreenSpaceEventHandler | null
  private _drawnEntities: Cesium.Entity[]

  /**
   * 构造函数
   * @param viewer Cesium 查看器实例
   */
  constructor(viewer: Cesium.Viewer) {
    this.name = 'Point'
    this.viewer = viewer
    this._drawHandler = null // 事件处理器
    this._drawnEntities = [] // 存储绘制的实体
  }

  /**
   * 激活绘制工具
   * @param drawType 绘制类型（未使用）
   * @param callback 回调函数（未使用）
   */
  activate(drawType?: string, callback?: () => void): void {
    this._registerEvents(callback) // 注册鼠标事件
  }

  /**
   * 注册鼠标事件
   * @param callback 回调函数（未使用）
   */
  private _registerEvents(callback?: () => void): void {
    this._drawHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas,
    )
    this.viewer.scene.globe.depthTestAgainstTerrain = true // 开启深度测试
    this._leftClickEventForPoint()
  }

  /**
   * 鼠标事件之绘制点的左击事件
   */
  private _leftClickEventForPoint(): void {
    this._drawHandler?.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        // this.viewer._element.style.cursor = "pointer";
        // 使用 globe.pick 获取准确的地面位置，不依赖 depthTestAgainstTerrain
        const ray = this.viewer.camera.getPickRay(e.position)
        if (!ray) return
        const p = this.viewer.scene.globe.pick(ray, this.viewer.scene)
        if (!p) return

        // 手动提高50m，也可以取消
        const cartoPt = Cesium.Cartographic.fromCartesian(p)
        const p1 = [
          Cesium.Math.toDegrees(cartoPt.longitude),
          Cesium.Math.toDegrees(cartoPt.latitude),
          cartoPt.height + 50,
        ]
        this._addPoint(p1)
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )
  }

  /**
   * 画点
   * @param p 点的坐标 [经度, 纬度, 高度]
   */
  private _addPoint(p: any): void {
    const point = this.viewer.entities.add({
      id: `${this.name}${Date.now()}`,
      name: this.name,
      position: Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]),
      point: {
        color: Cesium.Color.RED,
        pixelSize: 10,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // 关键设置
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 或 RELATIVE_TO_GROUND
      },
    })
    this._drawnEntities.push(point)
  }

  /**
   * 移除所有鼠标事件
   */
  private _removeAllEvent(): void {
    if (this._drawHandler) {
      this._drawHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      )
      this._drawHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      )
      this._drawHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.RIGHT_CLICK,
      )
      this._drawHandler.destroy()
      this._drawHandler = null
    }
  }

  /**
   * 清除所有绘制的点
   */
  clear(): void {
    this._drawnEntities.forEach((entity) => {
      if (entity.name === this.name) {
        this.viewer.entities.remove(entity)
      }
    })
    this._drawnEntities = []
  }

  /**
   * 导出所有点的数据
   * @returns 包含所有点坐标的数组
   */
  exportData(): PointData[] {
    const result: PointData[] = []

    this._drawnEntities.forEach((entity) => {
      if (entity.name === this.name && entity.position) {
        const cartesian = entity.position.getValue(
          Cesium.JulianDate.now(),
        ) as Cesium.Cartesian3
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const lon = Cesium.Math.toDegrees(cartographic.longitude)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        const height = cartographic.height
        result.push({ lon, lat, height })
      }
    })

    return result
  }
}
