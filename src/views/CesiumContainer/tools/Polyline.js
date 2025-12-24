// 尚未完成

import * as Cesium from 'cesium'
export default class DrawTool {
  /**
   * 构造函数
   * @param viewer
   */
  constructor(viewer) {
    this.name = 'Polyline'
    this.viewer = viewer
    this._drawHandler = null //事件
    this._drawnEntities = []
    this._tempPositions = [] //存储点集合
  }

  _removeAllEvent() {
    this._drawHandler &&
      (this._drawHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      ),
      this._drawHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE,
      ),
      this._drawHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.RIGHT_CLICK,
      ),
      this._drawHandler.destroy(),
      (this._drawHandler = null))
  }

  // 清除数据
  clear() {
    console.log('_drawnEntities>>>>', this._drawnEntities)
    this._drawnEntities.forEach((entity) => {
      if (entity.name === this.name) {
        this.viewer.entities.remove(entity)
      }
    })
  }

  // 导出数据
  exportData() {
    const entities = this.viewer.entities.values
    const result = []
    entities.forEach((entity) => {
      console.warn('entity>>>', entity)
      if (entity.name === this.name && entity.polyline.positions) {
        console.warn('entity>>>2', entity)
        const positions = entity.polyline.positions.getValue() // 获取坐标数组（Cartesian3）
        console.warn('positions>>>2', positions)

        // 提取起点和终点
        const startCartesian = positions[0]
        const endCartesian = positions[positions.length - 1]
        // 转换为经纬度
        const startCartographic =
          Cesium.Cartographic.fromCartesian(startCartesian)
        const endCartographic = Cesium.Cartographic.fromCartesian(endCartesian)
        console.warn('startCartographic>>>2', startCartographic)
        console.warn('endCartographic>>>2', endCartographic)

        // const cartesian = entity.position.getValue(Cesium.JulianDate.now())
        // const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        // const lon = Cesium.Math.toDegrees(cartographic.longitude)
        // const lat = Cesium.Math.toDegrees(cartographic.latitude)
        // const height = cartographic.height
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
          entity: entity, // 可选：保留实体引用
        })
        // result.push({ lon, lat, height })
      }
    })

    return result
  }

  /**
   * 激活点线面
   * @param drawType
   */
  activate(drawType, callback) {
    this._registerEvents(callback) //注册鼠标事件
  }

  /**
   * 注册鼠标事件
   */
  _registerEvents(callback) {
    this._drawHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas,
    )
    this.viewer.scene.globe.depthTestAgainstTerrain = true //开启深度测试
    this._leftClickEventForPolyline()
    this._mouseMoveEventForPolyline()
    this._rightClickEventForPolyline()
  }

  /**
   * 鼠标事件之绘制线的左击事件
   * @private
   */
  _leftClickEventForPolyline() {
    this._drawHandler.setInputAction((e) => {
      let p = this.viewer.scene.pickPosition(e.position)
      if (!p) return
      this._tempPositions.push(p)
      this._addPolyline()
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /**
   * 画线
   * @private
   */
  _addPolyline() {
    this.viewer.entities.add({
      id: this.name + Date.now(),
      name: this.name,
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          let c = Array.from(this._tempPositions)
          if (this._mousePos) {
            c.push(this._mousePos)
          }
          return c
        }, false),
        clampToGround: true, //贴地
        width: 3,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
      },
    })
  }
  /**
   * 鼠标事件之绘制线的移动事件
   * @private
   */
  _mouseMoveEventForPolyline() {
    this._drawHandler.setInputAction((e) => {
      let p = this.viewer.scene.pickPosition(e.endPosition)
      if (!p) return
      this._mousePos = p
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  /**
   * 鼠标事件之绘制线的右击事件
   * @private
   */
  _rightClickEventForPolyline() {
    this._drawHandler.setInputAction((e) => {
      let p = this.viewer.scene.pickPosition(e.position)
      if (!p) return
      // this._removeAllEvent()
      // this.viewer.entities.removeAll()
      const line = this.viewer.entities.add({
        polyline: {
          positions: this._tempPositions,
          clampToGround: true, //贴地
          width: 3,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.YELLOW,
          }),
          depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.YELLOW,
          }),
        },
      })
      this._tempPositions = []
      this._drawnEntities.push(line)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
}
