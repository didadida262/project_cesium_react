import React, { useState, useEffect } from 'react'
import { CesiumController } from '../CesiumController'

const ConfigContainer: React.FC = () => {
  const [isBorderVisible, setIsBorderVisible] = useState(false)
  const [isProvinceVisible, setIsProvinceVisible] = useState(true)

  const toggleBorder = async () => {
    setIsBorderVisible(!isBorderVisible)
    await CesiumController.toggleChinaBorder(!isBorderVisible)
  }

  const toggleProvince = async () => {
    setIsProvinceVisible(!isProvinceVisible)
    await CesiumController.toggleProvinceNames(!isProvinceVisible)
  }

  // 检查边境线数据源状态
  const checkBorderStatus = () => {
    setIsBorderVisible(CesiumController.chinaBorderDataSource !== null)
  }

  // 检查省份名称状态
  const checkProvinceStatus = () => {
    const entities = CesiumController.provinceNameEntities || []
    // 检查是否有实体且至少有一个实体是可见的
    if (entities.length > 0) {
      const firstEntity = entities[0]
      setIsProvinceVisible(firstEntity.show !== false)
    } else {
      setIsProvinceVisible(false)
    }
  }

  useEffect(() => {
    // 初始化时检查边境线和省份名称状态
    checkBorderStatus()
    checkProvinceStatus()
    // 如果还没加载，延迟检查（数据在2秒后加载）
    const timer = setTimeout(() => {
      checkBorderStatus()
      checkProvinceStatus()
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`
        w-full h-full
        bg-gradient-to-br from-[rgb(18,20,22)] via-[rgb(20,22,26)] to-[rgb(18,20,22)]
        border-[2px] border-solid border-[#383B45] rounded-lg
        shadow-[0_4px_20px_rgba(0,0,0,0.5)]
        backdrop-blur-sm
        flex flex-col
      `}
    >
      <div className="w-full px-[16px] py-[12px] space-y-[16px]">
        <div className="flex items-center justify-between">
          <span className="text-[#DCF0FF] text-[14px]">显示中国边境线</span>
          <div
            className={`
              relative w-[44px] h-[24px] rounded-full cursor-pointer transition-all duration-300
              ${isBorderVisible ? 'bg-[#FB685C]' : 'bg-[#383B45]'}
            `}
            onClick={toggleBorder}
          >
            <div
              className={`
                absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-white transition-all duration-300
                ${isBorderVisible ? 'translate-x-[20px]' : 'translate-x-0'}
              `}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-[#DCF0FF] text-[14px]">显示省份</span>
          <div
            className={`
              relative w-[44px] h-[24px] rounded-full cursor-pointer transition-all duration-300
              ${isProvinceVisible ? 'bg-[#FB685C]' : 'bg-[#383B45]'}
            `}
            onClick={toggleProvince}
          >
            <div
              className={`
                absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-white transition-all duration-300
                ${isProvinceVisible ? 'translate-x-[20px]' : 'translate-x-0'}
              `}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigContainer
