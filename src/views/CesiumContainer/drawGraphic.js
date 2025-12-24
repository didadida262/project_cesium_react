import * as Cesium from 'cesium'

export default class DrawTool {
  /**
   * 构造函数
   * @param viewer
   */
  constructor(viewer) {
    this.viewer = viewer
    this._drawHandler = null //事件
    this._drawnEntities = []
    this._dataSource = null //存储entities
    this._tempPositions = [] //存储点集合
    this._mousePos = null //移动点
    this._drawType = null //类型
  }

  /**
   * 激活点线面
   * @param drawType
   */
  activate(drawType, callback) {
    this.clearAll()
    this._drawType = drawType
    // this._dataSource = new Cesium.CustomDataSource('_dataSource')
    // this.viewer.dataSources.add(this._dataSource)
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
    switch (this._drawType) {
      case 'Point': {
        this._leftClickEventForPoint()
        break
      }
      case 'Polyline': {
        this._leftClickEventForPolyline()
        this._mouseMoveEventForPolyline()
        this._rightClickEventForPolyline()
        // this._doubleClickEventForPolyline()
        break
      }
      case 'Polygon': {
        this._leftClickEventForPolygon()
        this._mouseMoveEventForPolygon()
        this._rightClickEventForPolygon(callback)
        // this._doubleClickEventForPolygon(callback)
        break
      }
      default:
        break
    }
  }

  /**
   * 鼠标事件之绘制点的左击事件
   * @private
   */
  _leftClickEventForPoint() {
    this._drawHandler.setInputAction((e) => {
      this.viewer._element.style.cursor = 'pointer'
      let p = this.viewer.scene.pickPosition(e.position)
      if (!p) return
      //手动给他提高50m，也可以取消哈
      let carto_pt = Cesium.Cartographic.fromCartesian(p)
      let p1 = [
        Cesium.Math.toDegrees(carto_pt.longitude),
        Cesium.Math.toDegrees(carto_pt.latitude),
        carto_pt.height + 50,
      ]
      this._addPoint(p1)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
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

  /**
   * 鼠标事件之绘制线的双击事件
   * @private
   */
  _doubleClickEventForPolyline() {
    this._drawHandler.setInputAction((e) => {
      let p = this.viewer.scene.pickPosition(e.position)
      if (!p) return
      this._removeAllEvent()
      this._dataSource.entities.removeAll()
      this._dataSource.entities.add({
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
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
  }

  /**
   * 鼠标事件之绘制面的左击事件
   * @private
   */
  _leftClickEventForPolygon() {
    this._drawHandler.setInputAction((e) => {
      let p = this.viewer.scene.pickPosition(e.position)
      if (!p) return
      this._tempPositions.push(p)
      this._addPolygon()
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /**
   * 鼠标事件之绘制面的移动事件
   * @private
   */
  _mouseMoveEventForPolygon() {
    this._drawHandler.setInputAction((e) => {
      let p = this.viewer.scene.pickPosition(e.endPosition)
      if (!p) return
      this._mousePos = p
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  /**
   * 鼠标事件之绘制面的右击事件
   * @private
   */
  _rightClickEventForPolygon(callback) {
    this._drawHandler.setInputAction((e) => {
      let p = this.viewer.scene.pickPosition(e.position)
      if (!p) return
      this._tempPositions.push(this._tempPositions[0])
      this._removeAllEvent()
      this.viewer.entities.removeAll()
      const polygonEntity = this.viewer.entities.add({
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
        polygon: {
          hierarchy: this._tempPositions,
          extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          material: Cesium.Color.RED.withAlpha(0.4),
          clampToGround: true,
        },
      })
      // 调用回调函数，传递绘制完成的实体或其他相关数据
      if (callback && typeof callback === 'function') {
        callback(polygonEntity)
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
  /**
   * 鼠标事件之绘制面的右击事件
   * @private
   */
  _doubleClickEventForPolygon(callback) {
    this._drawHandler.setInputAction((e) => {
      let p = this.viewer.scene.pickPosition(e.position)
      if (!p) return
      this._tempPositions.push(this._tempPositions[0])
      this._removeAllEvent()
      this.viewer.entities.removeAll()
      const polygonEntity = this._dataSource.entities.add({
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
        polygon: {
          hierarchy: this._tempPositions,
          extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          material: Cesium.Color.RED.withAlpha(0.4),
          clampToGround: true,
        },
      })
      // 调用回调函数，传递绘制完成的实体或其他相关数据
      if (callback && typeof callback === 'function') {
        callback(polygonEntity)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
  }
  /**
   * 移除所有鼠标事件
   * @private
   */
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

  /**
   * 重置所有参数
   * @private
   */
  _resetParams() {
    if (this._dataSource != null) {
      this._dataSource.entities.removeAll()
      this.viewer.dataSources.remove(this._dataSource)
    }
    this._dataSource = null
    this._tempPositions = []
    this._mousePos = null
    this._drawType = null
  }

  /**
   * 清除
   */
  clearAll() {
    this._removeAllEvent()
    this._resetParams()
  }
  // 清除点
  clear() {
    this._drawnEntities.forEach((entity) => {
      if (entity.name === 'point') {
        this.viewer.entities.remove(entity)
      }
    })
  }

  // 导出数据
  exportPointData() {
    const entities = this.viewer.entities.values
    const result = []
    entities.forEach((entity) => {
      if (entity.point && entity.position) {
        const cartesian = entity.position.getValue(Cesium.JulianDate.now())
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const lon = Cesium.Math.toDegrees(cartographic.longitude)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        const height = cartographic.height
        result.push({ lon, lat, height })
      }
    })

    return result
  }

  /**
   * 画点
   * @param p
   */
  _addPoint(p) {
    const point = this.viewer.entities.add({
      id: 'point-' + Date.now(),
      name: 'point',
      position: Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2]),
      point: {
        color: Cesium.Color.RED,
        pixelSize: 10,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 2,
        // heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
      },
    })
    this._drawnEntities.push(point)
  }

  /**
   * 画线
   * @private
   */
  _addPolyline() {
    this.viewer.entities.add({
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
   * 画面
   * @private
   */
  _addPolygon() {
    if (this._tempPositions.length == 1) {
      console.log('1')
      //一个顶点+移动点
      this.viewer.entities.add({
        id: 'polygon-' + Date.now(),
        name: 'polygon',
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
    } else {
      console.log('2')

      this.viewer.entities.removeAll()
      //两个顶点+移动点
      this.viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.CallbackProperty(() => {
            let poss = Array.from(this._tempPositions)
            if (this._mousePos) {
              poss.push(this._mousePos)
            }
            return new Cesium.PolygonHierarchy(poss)
          }, false),
          extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          material: Cesium.Color.RED.withAlpha(0.4),
          clampToGround: true,
        },
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            let c = Array.from(this._tempPositions)
            if (this._mousePos) {
              c.push(this._mousePos)
              c.push(c[0]) //与第一个点相连
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
  }
}
