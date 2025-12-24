import * as Cesium from 'cesium'

export interface LonLatType {
  longitude: number;
  latitude: number;
  height: number;
}
// 爆炸效果演示
export const showExplosion = (
  viewer: Cesium.Viewer,
  position: Cesium.Cartesian3,
) => {
  if (!viewer) return
}

export const getOrientation = (item: any) => {
  const position = item.positions[0]
  const startPosition = item.positions[0]
  const endPosition = item.positions[1]
  const degree = item.degree
  // 1. 计算方向向量
  const direction = Cesium.Cartesian3.subtract(
    endPosition,
    startPosition,
    new Cesium.Cartesian3(),
  )
  Cesium.Cartesian3.normalize(direction, direction)

  // 2. 计算heading角度
  const eastNorthUp = Cesium.Transforms.eastNorthUpToFixedFrame(startPosition)
  const localDirection = Cesium.Matrix4.multiplyByPointAsVector(
    Cesium.Matrix4.inverseTransformation(eastNorthUp, new Cesium.Matrix4()),
    direction,
    new Cesium.Cartesian3(),
  )
  const heading = Math.atan2(localDirection.x, localDirection.y)

  // 3. 生成Orientation
  const hpr = new Cesium.HeadingPitchRoll(
    // 矫正坐标系，偏移x-90
    heading + Cesium.Math.toRadians(degree),
    0,
    0,
  )
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr,
  )
  return new Cesium.ConstantProperty(orientation)
}

export const getLonLat = (cartesian: Cesium.Cartesian3) => {
  const position = Cesium.Cartographic.fromCartesian(cartesian)
  const longitude = Cesium.Math.toDegrees(position.longitude)
  const latitude = Cesium.Math.toDegrees(position.latitude)
  const height = Cesium.Math.toDegrees(position.height)
  return {
    longitude,
    latitude,
    height,
  }
}

// 获取相机坐标
export const logCameraStateOnMouseEvents = (viewer: Cesium.Viewer) => {
  if (!viewer) return

  // 初始化事件处理器
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

  // 1. 监听左键点击
  handler.setInputAction(
    (click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const camera = viewer.scene.camera
      const position = camera.position
      const heading = camera.heading
      const pitch = camera.pitch
      const roll = camera.roll

      console.log('=== 鼠标点击时相机状态 ===')
      console.log('位置 (destination):', position)
      console.log('方向 (orientation):', {
        heading: Cesium.Math.toDegrees(heading),
        pitch: Cesium.Math.toDegrees(pitch),
        roll: Cesium.Math.toDegrees(roll),
      })
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK,
  )

  // 2. 监听鼠标移动（可选）
  handler.setInputAction(
    (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      const camera = viewer.scene.camera
      console.log('鼠标移动时相机位置:', camera.position)
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE,
  )

  // 3. 监听滚轮缩放（可选）
  handler.setInputAction(() => {
    const camera = viewer.scene.camera
    console.log('滚轮缩放后相机高度:', camera.positionCartographic.height)
  }, Cesium.ScreenSpaceEventType.WHEEL)
}

// 删除指定path
export const removePath = (viewer: Cesium.Viewer, path: any) => {
  viewer.entities.remove(path)
  path = null
}

export const drawPoint = (
  viewer: Cesium.Viewer,
  label: string,
  position: any,
) => {
  viewer.entities.add({
    name: label,
    position: position,
    point: {
      pixelSize: 12, // 增大点的大小
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 关键设置
      heightReference: Cesium.HeightReference.NONE,
      // 根据距离自适应点的大小
      scaleByDistance: new Cesium.NearFarScalar(
        2000000,  // 2000公里内
        1.0,      // 正常大小
        8000000,  // 8000公里外
        0.6,      // 缩小到60%
      ),
    },
    label: {
      text: label,
      font: '20px sans-serif', // 进一步增大基础字体大小
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 关键设置
      heightReference: Cesium.HeightReference.NONE,
      // 根据距离自适应标签大小，在远距离时适度缩小
      scaleByDistance: new Cesium.NearFarScalar(
        2000000,  // 2000公里内
        1.0,      // 正常大小
        8000000,  // 8000公里外
        0.7,      // 缩小到70%
      ),
      // 根据距离控制标签显示范围
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        0,        // 最小距离（总是显示）
        25000000, // 最大距离（25000公里外不显示）
      ),
    },
  })
}

export const getCatesian3FromPX = (point: any, viewer: Cesium.Viewer) => {
  const picks = viewer.scene.drillPick(point)
  let cartesian
  let isOn3dtiles = false
  // 检查是否点击在3D tiles上
  for (let i = 0; i < picks.length; i++) {
    if (
      (picks[i] && picks[i].primitive) ||
      picks[i] instanceof Cesium.Cesium3DTileFeature
    ) {
      isOn3dtiles = true
      break
    }
  }
  
  // 如果点击在3D tiles上，使用pickPosition；否则使用globe.pick获取准确的地面位置
  if (isOn3dtiles) {
    cartesian = viewer.scene.pickPosition(point)
    // 如果pickPosition失败，回退到globe.pick
    if (!cartesian) {
      const ray = viewer.camera.getPickRay(point)
      if (ray) {
        cartesian = viewer.scene.globe.pick(ray, viewer.scene)
      }
    }
  } else {
    // 使用pickPosition获取准确的位置（需要depthTestAgainstTerrain，由工具自己设置）
    cartesian = viewer.scene.pickPosition(point)
    // 如果pickPosition失败，回退到globe.pick
    if (!cartesian) {
      const ray = viewer.camera.getPickRay(point)
      if (!ray) return null
      cartesian = viewer.scene.globe.pick(ray, viewer.scene)
    }
  }
  return cartesian
}

export const cartesianToLatlng = (viewer: Cesium.Viewer, cartesian: any) => {
  const latlng =
    viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian)
  const lat = Cesium.Math.toDegrees(latlng.latitude)
  const lng = Cesium.Math.toDegrees(latlng.longitude)
  return [lng, lat]
}
