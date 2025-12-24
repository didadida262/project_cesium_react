import * as Cesium from 'cesium'
import { getCatesian3FromPX, cartesianToLatlng } from '../CesiumUtils'
import { xp } from './drawArrow/algorithm'

// Type declarations for the xp module
interface FineArrowResult {
  x: number;
  y: number;
  z?: number;
}

interface XpAlgorithm {
  doubleArrow(lnglatArr: number[][]): unknown;
  tailedAttackArrow(lnglatArr: number[][]): unknown;
  fineArrow: (
    start: [number, number],
    end: [number, number]
  ) => FineArrowResult[];
}

interface XpModule {
  algorithm: XpAlgorithm;
  version: string;
  createTime: string;
  author: string;
}

interface DrawToolOptions {
  fillMaterial?: Cesium.Color;
  pointImageUrl?: string;
}

interface CustomEntity extends Cesium.Entity {
  wz: number;
  attr?: string;
  type?: string;
  position: Cesium.ConstantPositionProperty;
}

export default class DrawTool {
  public name: string
  public viewer: Cesium.Viewer
  private _drawHandler: Cesium.ScreenSpaceEventHandler | null
  private _drawnEntities: Cesium.Entity[]
  public temppath: any
  public fillMaterial: Cesium.Color
  public firstPoint: any
  public floatPoint: any
  public positions: Cesium.Cartesian3[]
  public arrowEntity: any
  public pointImageUrl?: string
  state: number
  selectPoint: null
  clickStep: number
  modifyHandler: null
  outlineMaterial: Cesium.PolylineDashMaterialProperty
  pointArr: any[]
  objId: number

  constructor(viewer: Cesium.Viewer, options?: DrawToolOptions) {
    this.name = 'PincerArrow'
    this.viewer = viewer
    this._drawHandler = null
    this._drawnEntities = []
    this.temppath = null

    this.positions = []
    this.pointImageUrl = '/images/point.png'
    this.fillMaterial = Cesium.Color.RED.withAlpha(0.8)
    this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.fromCssColorString('#f00').withAlpha(0.7),
    })
    this.firstPoint = null
    this.floatPoint = null
    this.arrowEntity = null
    this.state = -1 //state用于区分当前的状态 0 为删除 1为添加 2为编辑
    this.selectPoint = null
    this.clickStep = 0
    this.modifyHandler = null
    this.pointArr = [] //中间各点
    this.objId = Number(
      new Date().getTime() + '' + Number(Math.random() * 1000).toFixed(0),
    ) //用于区分多个相同箭头时
  }

  private _registerEvents(callback?: Function): void {
    this._drawHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas,
    )
    this.viewer.scene.globe.depthTestAgainstTerrain = true
    this._leftClickEvent()
    this._mouseMoveEvent()
  }

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

  public clear(): void {
    this._drawnEntities.forEach((entity) => {
      if (entity.name === this.name) {
        this.viewer.entities.remove(entity)
      }
    })
    this._drawnEntities = []
  }

  public exportData(): any[] {
    const result: any[] = []
    return result
  }

  public activate(drawType: string, callback?: Function): void {
    this._registerEvents(callback)
  }

  private showArrowOnMap(positions: Cesium.Cartesian3[]): Cesium.Entity {
    const update = () => {
      //计算面
      if (positions.length < 3) {
        return null
      }
      const lnglatArr = []
      for (let i = 0; i < positions.length; i++) {
        const lnglat = cartesianToLatlng(this.viewer, positions[i])
        lnglatArr.push(lnglat)
      }
      const res: any = (xp as XpModule).algorithm.doubleArrow(lnglatArr)
      let returnData = []
      const index = JSON.stringify(res.polygonalPoint).indexOf('null')
      if (index == -1) returnData = res.polygonalPoint
      return new Cesium.PolygonHierarchy(returnData)
    }
    return this.viewer.entities.add({
      polygon: new Cesium.PolygonGraphics({
        hierarchy: new Cesium.CallbackProperty(update, false),
        show: true,
        fill: true,
        material: this.fillMaterial,
      }),
    })
  }

  public creatPoint(cartesian: Cesium.Cartesian3): any {
    const point: any = this.viewer.entities.add({
      position: cartesian,
      billboard: {
        image: this.pointImageUrl,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        //heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })
    point.attr = 'editPoint'
    return point
  }

  private _leftClickEvent(): void {
    this._drawHandler?.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const cartesian = getCatesian3FromPX(e.position, this.viewer)
        if (!cartesian) return
        if (this.positions.length == 0) {
          this.floatPoint = this.creatPoint(cartesian)
        }
        if (this.positions.length > 4) {
          //结束绘制
          const point = this.creatPoint(cartesian)
          point.wz = this.positions.length
          this.pointArr.push(point)
          for (let i = 0; i < this.pointArr.length; i++) {
            this.pointArr[i].show = false
          }
          //移除动态点
          this.floatPoint.show = false
          this.viewer.entities.remove(this.floatPoint)
          this.floatPoint = null
          this.pointArr = []
          this.positions = []
          this.arrowEntity = null
          return
        } else {
          this.positions.push(cartesian)
          const point = this.creatPoint(cartesian)
          if (this.positions.length > 2) {
            point.wz = this.positions.length - 1 //点对应的在positions中的位置  屏蔽mouseMove里往postions添加时 未创建点
          } else {
            point.wz = this.positions.length //点对应的在positions中的位置
          }
          this.pointArr.push(point)
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )
  }

  private _mouseMoveEvent(): void {
    this._drawHandler?.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        //移动时绘制面
        if (this.positions.length < 2) return
        const cartesian = getCatesian3FromPX(e.endPosition, this.viewer)
        if (!cartesian) return
        this.floatPoint.position.setValue(cartesian)
        if (this.positions.length >= 2) {
          if (!Cesium.defined(this.arrowEntity)) {
            this.positions.push(cartesian)
            this.arrowEntity = this.showArrowOnMap(this.positions)
          } else {
            this.positions.pop()
            this.positions.push(cartesian)
          }
        }
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    )
  }
}
