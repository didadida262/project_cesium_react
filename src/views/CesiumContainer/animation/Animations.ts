import * as Cesium from 'cesium'
import { taipeiPosition, tainanPosition } from '../const'
import { getOrientation, showExplosion } from '../CesiumUtils'

interface IMoveItem {
  startPosition: Cesium.Cartesian3;
  endPosition: Cesium.Cartesian3;
  model: string;
  name: string;
}
interface IMoveItemV2 {
  positions: Cesium.Cartesian3[]; // 替换原来的startPosition和endPosition
  model: string;
  name: string;
}

export const handleAnimation = async (viewer: Cesium.Viewer, item: any) => {
  await moveAToBGLBV2(viewer, item.animationData)
  //   await moveAToBGLBV3(viewer, item.animationData);
}
// 支持多点运动
export const moveAToBGLBV3 = async (
  viewer: Cesium.Viewer,
  item: IMoveItemV2,
) => {
  if (!viewer || !item.positions || item.positions.length < 2) return

  viewer.clock.shouldAnimate = true // 确保时钟可以动画
  viewer.clock.multiplier = 1 // 恢复默认速度

  // 3. 加载新模型
  const modelEntity = viewer.entities.add({
    name: item.name + '_' + new Date().getTime(),
    position: item.positions[0], // 初始位置设为第一个点
    orientation: getOrientation(
      item,
      // 初始朝向设为第一个点到第二个点的方向
    ),
    model: {
      uri: item.model,
      minimumPixelSize: 64,
      maximumScale: 200000,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    } as any,
  })

  // 5. 定义时间范围（基于点数计算总时间）
  const startTime = Cesium.JulianDate.fromDate(new Date())
  const durationPerSegment = 20 // 每段运动时间（秒）
  const totalDuration = durationPerSegment * (item.positions.length - 1)
  const stopTime = Cesium.JulianDate.addSeconds(
    startTime,
    totalDuration,
    new Cesium.JulianDate(),
  )

  // 6. 强制重置时钟
  viewer.clock.startTime = startTime.clone()
  viewer.clock.stopTime = stopTime.clone()
  viewer.clock.currentTime = startTime.clone()
  //   viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP // 无限循环

  // 7. 设置路径关键点（多个位置点）
  const positionProperty = new Cesium.SampledPositionProperty()
  modelEntity.position = positionProperty

  // 添加所有位置点作为关键帧
  item.positions.forEach((position: Cesium.Cartesian3, index: number) => {
    const time = Cesium.JulianDate.addSeconds(
      startTime,
      index * durationPerSegment,
      new Cesium.JulianDate(),
    )
    positionProperty.addSample(time, position)
  })

  // 8. 更新模型朝向（使其始终面向运动方向）
  modelEntity.orientation = new Cesium.VelocityOrientationProperty(
    positionProperty,
  )

  // 9. 添加事件监听器（使用闭包保存引用）
  const onTickHandler = viewer.clock.onTick.addEventListener(() => {
    const currentTime = viewer.clock.currentTime
    if (Cesium.JulianDate.compare(currentTime, stopTime) >= 0) {
      viewer.trackedEntity = undefined
      viewer.entities.remove(modelEntity)
      viewer.clock.onTick.removeEventListener(onTickHandler) // 移除监听
    }
  })
}

// 自动校正模型方向
export const moveAToBGLBV2 = async (
  viewer: Cesium.Viewer,
  item: IMoveItemV2,
) => {
  if (!viewer) return
  viewer.clock.shouldAnimate = true // 确保时钟可以动画
  viewer.clock.multiplier = 1 // 恢复默认速度

  // 3. 加载新模型
  const modelEntity = viewer.entities.add({
    name: item.name + '_' + new Date().getTime(),
    position: item.positions[0],
    orientation: getOrientation(item),
    model: {
      uri: item.model,
      minimumPixelSize: 64,
      maximumScale: 200000,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 或 RELATIVE_TO_GROUND
      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 关键设置
    } as any,
  })
  // 5. 定义时间范围（重新初始化）
  const startTime = Cesium.JulianDate.fromDate(new Date())
  const stopTime = Cesium.JulianDate.addSeconds(
    startTime,
    5,
    new Cesium.JulianDate(),
  )

  // 6. 强制重置时钟
  viewer.clock.startTime = startTime.clone()
  viewer.clock.stopTime = stopTime.clone()
  viewer.clock.currentTime = startTime.clone()
  viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
  //   viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 无限循环

  // 7. 设置路径关键点
  modelEntity.position = new Cesium.SampledPositionProperty();
  (modelEntity.position as Cesium.SampledPositionProperty).addSample(
    startTime,
    item.positions[0],
  );
  (modelEntity.position as Cesium.SampledPositionProperty).addSample(
    stopTime,
    item.positions[1],
  )

  // 8. 添加事件监听器（使用闭包保存引用）
  const onTickHandler = viewer.clock.onTick.addEventListener(() => {
    const currentTime = viewer.clock.currentTime
    if (Cesium.JulianDate.compare(currentTime, stopTime) >= 0) {
      viewer.trackedEntity = undefined
      viewer.entities.remove(modelEntity)
      viewer.clock.onTick.removeEventListener(onTickHandler) // 移除监听
    }
  })
}
export const moveAToBGLB = async (viewer: Cesium.Viewer, item: IMoveItemV2) => {
  if (!viewer) return

  viewer.clock.shouldAnimate = true // 确保时钟可以动画
  viewer.clock.multiplier = 1 // 恢复默认速度

  // 3. 加载新模型
  const modelEntity = viewer.entities.add({
    name: item.name + '_' + new Date().getTime(),
    position: item.positions[0],
    model: {
      uri: item.model,
      minimumPixelSize: 64,
      maximumScale: 200000,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 或 RELATIVE_TO_GROUND
      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 关键设置
      // 关键：绕 Z 轴顺时针旋转 90 度（弧度制：Math.PI/2）
      modelMatrix: Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromRotationZ(-Math.PI / 2), // 负值表示顺时针
      ),
    } as any,
  })

  // 4. 设置模型方向（跟随路径）
  modelEntity.orientation = new Cesium.VelocityOrientationProperty(
    modelEntity.position as Cesium.SampledPositionProperty,
  )

  // 5. 定义时间范围（重新初始化）
  const startTime = Cesium.JulianDate.fromDate(new Date())
  const stopTime = Cesium.JulianDate.addSeconds(
    startTime,
    5,
    new Cesium.JulianDate(),
  )

  // 6. 强制重置时钟
  viewer.clock.startTime = startTime.clone()
  viewer.clock.stopTime = stopTime.clone()
  viewer.clock.currentTime = startTime.clone()
  viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
  //   viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // 无限循环

  // 7. 设置路径关键点
  modelEntity.position = new Cesium.SampledPositionProperty();
  (modelEntity.position as Cesium.SampledPositionProperty).addSample(
    startTime,
    item.positions[0],
  );
  (modelEntity.position as Cesium.SampledPositionProperty).addSample(
    stopTime,
    item.positions[1],
  )

  // 8. 添加事件监听器（使用闭包保存引用）
  const onTickHandler = viewer.clock.onTick.addEventListener(() => {
    const currentTime = viewer.clock.currentTime
    if (Cesium.JulianDate.compare(currentTime, stopTime) >= 0) {
      viewer.trackedEntity = undefined
      viewer.entities.remove(modelEntity)
      viewer.clock.onTick.removeEventListener(onTickHandler) // 移除监听
    }
  })
}
