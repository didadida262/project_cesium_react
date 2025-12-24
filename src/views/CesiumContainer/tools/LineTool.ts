import * as Cesium from 'cesium'

interface LineData {
  start: {
    lon: number;
    lat: number;
    height: number;
  };
  end: {
    lon: number;
    lat: number;
    height: number;
  };
  entity?: Cesium.Entity;
}

export default class DrawTool {
  private name: string
  private viewer: Cesium.Viewer
  private _drawHandler: Cesium.ScreenSpaceEventHandler | null
  private _drawnEntities: Cesium.Entity[]
  private _tempPositions: Cesium.Cartesian3[]
  private temppath: Cesium.Entity | null
  private _mousePos: Cesium.Cartesian3 | null

  /**
   * 构造函数
   * @param viewer Cesium 查看器实例
   */
  constructor(viewer: Cesium.Viewer) {
    this.name = 'Line'
    this.viewer = viewer
    this._drawHandler = null
    this._drawnEntities = []
    this._tempPositions = []
    this.temppath = null
    this._mousePos = null
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
   * 清除所有绘制的线
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
   * 导出所有线的数据
   * @returns 包含所有线数据的数组
   */
  exportData(): LineData[] {
    const result: LineData[] = []

    this._drawnEntities.forEach((entity) => {
      if (
        entity.name === this.name &&
        entity.polyline &&
        entity.polyline.positions
      ) {
        // 获取当前时间
        const now = Cesium.JulianDate.now()
        const positions = entity.polyline.positions.getValue(now)
        const startCartesian = positions[0]
        const endCartesian = positions[positions.length - 1]

        const startCartographic =
          Cesium.Cartographic.fromCartesian(startCartesian)
        const endCartographic = Cesium.Cartographic.fromCartesian(endCartesian)

        result.push({
          start: {
            lon: Cesium.Math.toDegrees(startCartographic.longitude),
            lat: Cesium.Math.toDegrees(startCartographic.latitude),
            height: startCartographic.height,
          },
          end: {
            lon: Cesium.Math.toDegrees(endCartographic.longitude),
            lat: Cesium.Math.toDegrees(endCartographic.latitude),
            height: endCartographic.height,
          },
          entity: entity,
        })
      }
    })

    return result
  }

  /**
   * 激活绘制工具
   * @param drawType 绘制类型（未使用）
   * @param callback 回调函数（未使用）
   */
  activate(drawType?: string, callback?: () => void): void {
    this._registerEvents(callback)
  }

  /**
   * 注册鼠标事件
   * @param callback 回调函数（未使用）
   */
  private _registerEvents(callback?: () => void): void {
    this._drawHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas,
    )
    this.viewer.scene.globe.depthTestAgainstTerrain = true
    this._leftClickEventForPolyline()
    this._mouseMoveEventForPolyline()
  }

  /**
   * 鼠标左键点击事件（绘制线）
   */
  private _leftClickEventForPolyline(): void {
    this._drawHandler?.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        // 使用 globe.pick 获取准确的地面位置，不依赖 depthTestAgainstTerrain
        const ray = this.viewer.camera.getPickRay(e.position)
        if (!ray) return
        const p = this.viewer.scene.globe.pick(ray, this.viewer.scene)
        if (!p) return

        this._tempPositions.push(p)
        this._drawPath()
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )
  }

  /**
   * 绘制路径（根据点数量决定绘制临时路径还是最终路径）
   */
  private _drawPath(): void {
    if (this._tempPositions.length === 1) {
      this._drawTempPath()
    } else {
      this._drawFinalPath()
    }
  }

  /**
   * 绘制临时路径（只有一个点时）
   */
  private _drawTempPath(): void {
    this.temppath = this.viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          const c = Array.from(this._tempPositions)
          if (this._mousePos) {
            c.push(this._mousePos)
          }
          return c
        }, false),
        clampToGround: true,
        width: 8,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.RED.withAlpha(0.5),
        ),
        depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
      },
    })
  }

  /**
   * 绘制最终路径
   */
  private _drawFinalPath(): void {
    const line = this.viewer.entities.add({
      id: `${this.name}${Date.now()}`,
      name: this.name,
      polyline: {
        positions: this._tempPositions,
        clampToGround: true,
        width: 8,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.RED.withAlpha(0.5),
        ),
        depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 或 RELATIVE_TO_GROUND
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // 关键设置
      } as any,
    })

    this._tempPositions = []
    if (this.temppath) {
      this.viewer.entities.remove(this.temppath)
    }
    this.temppath = null
    this._drawnEntities.push(line)
  }

  /**
   * 鼠标移动事件（绘制线时预览）
   */
  private _mouseMoveEventForPolyline(): void {
    this._drawHandler?.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        // 使用 globe.pick 获取准确的地面位置，不依赖 depthTestAgainstTerrain
        const ray = this.viewer.camera.getPickRay(e.endPosition)
        if (!ray) return
        const p = this.viewer.scene.globe.pick(ray, this.viewer.scene)
        if (!p) return
        this._mousePos = p
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    )
  }
}
