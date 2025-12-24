import * as Cesium from 'cesium'
import ms from 'milsymbol'
import { getCatesian3FromPX, cartesianToLatlng } from '../CesiumUtils'
import { xp } from './drawArrow/algorithm'

// Type declarations for the xp module
interface FineArrowResult {
  x: number;
  y: number;
  z?: number;
}

interface XpAlgorithm {
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
  attr?: string;
  type?: string;
  position: Cesium.ConstantPositionProperty;
}

export default class DrawTool {
  public name: string
  public viewer: Cesium.Viewer
  private _drawHandler: Cesium.ScreenSpaceEventHandler | null
  private _drawnEntities: Cesium.Entity[]
  private _tempPositions: Cesium.Cartesian3[]
  public temppath: any
  public fillMaterial: Cesium.Color
  public firstPoint: CustomEntity | null
  public floatPoint: CustomEntity | null
  public positions: Cesium.Cartesian3[]
  public arrowEntity: Cesium.Entity | null
  public pointImageUrl?: string

  constructor(viewer: Cesium.Viewer, options?: DrawToolOptions) {
    this.name = 'StragitArrow'
    this.viewer = viewer
    this._drawHandler = null
    this._drawnEntities = []
    this._tempPositions = []
    this.temppath = null
    this.fillMaterial =
      options?.fillMaterial || Cesium.Color.RED.withAlpha(0.5)
    this.firstPoint = null
    this.floatPoint = null
    this.positions = []
    this.arrowEntity = null
    this.pointImageUrl = options?.pointImageUrl
  }

  private _registerEvents(callback?: Function): void {
    this._drawHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas,
    )
    this.viewer.scene.globe.depthTestAgainstTerrain = true
    this._leftClickEventForPolyline()
    this._mouseMoveEventForPolyline()
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
    const that = this
    const update = function (): Cesium.PolygonHierarchy | null {
      if (positions.length < 2) {
        return null
      }
      const p1 = positions[1]
      const p2 = positions[2]
      const firstPoint = cartesianToLatlng(that.viewer, p1)
      const endPoints = cartesianToLatlng(that.viewer, p2)

      const arrow: Cesium.Cartesian3[] = []
      const res = (xp as XpModule).algorithm.fineArrow(
        [firstPoint[0], firstPoint[1]],
        [endPoints[0], endPoints[1]],
      )

      const index = JSON.stringify(res).indexOf('null')
      if (index !== -1) return new Cesium.PolygonHierarchy([])
      for (let i = 0; i < res.length; i++) {
        const c3 = new Cesium.Cartesian3(res[i].x, res[i].y, res[i].z || 0)
        arrow.push(c3)
      }
      return new Cesium.PolygonHierarchy(arrow)
    }
    return that.viewer.entities.add({
      id: `${this.name}${Date.now()}`,
      name: this.name,
      polygon: new Cesium.PolygonGraphics({
        hierarchy: new Cesium.CallbackProperty(update, false),
        show: true,
        fill: true,
        material: this.fillMaterial,
      }),
    })
  }

  private creatPoint(cartesian: Cesium.Cartesian3): CustomEntity {
    const point = this.viewer.entities.add({
      position: cartesian,
      billboard: {
        image: this.pointImageUrl,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    }) as CustomEntity

    point.attr = 'editPoint'
    return point
  }

  private _leftClickEventForPolyline(): void {
    this._drawHandler?.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        this._drawPath(e)
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )
  }

  private _mouseMoveEventForPolyline(): void {
    this._drawHandler?.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        if (this.positions.length < 1) return
        const cartesian = getCatesian3FromPX(e.endPosition, this.viewer)
        if (!cartesian || !this.floatPoint) return

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

  private _drawPath(e: Cesium.ScreenSpaceEventHandler.PositionedEvent): void {
    const cartesian = getCatesian3FromPX(e.position, this.viewer)
    console.log('cartesian>>>>', cartesian)
    if (!cartesian) return

    if (this.positions.length === 0) {
      this.firstPoint = this.creatPoint(cartesian)
      this.firstPoint.type = 'firstPoint'
      this.floatPoint = this.creatPoint(cartesian)
      this.floatPoint.type = 'floatPoint'
      this.positions.push(cartesian)
      this.positions.push(cartesian.clone())
    }

    if (this.positions.length === 3) {
      if (this.firstPoint) this.firstPoint.show = false
      if (this.floatPoint) this.floatPoint.show = false
      this.positions = []
      if (this.arrowEntity) {
        const clonedEntity = new Cesium.Entity({
          polygon: {
            hierarchy: (this.arrowEntity.polygon as any).hierarchy,
            material: (this.arrowEntity.polygon as any).material,
            show: (this.arrowEntity.polygon as any).show,
            fill: (this.arrowEntity.polygon as any).fill,
          },
          name: this.arrowEntity.name,
        })
        this.viewer.entities.add(clonedEntity)
        this._drawnEntities.push(clonedEntity)
        this.viewer.entities.remove(this.arrowEntity)
        this.arrowEntity = null
      }
    }
  }
}
