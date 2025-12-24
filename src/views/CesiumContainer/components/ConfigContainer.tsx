import React, { useState, useEffect } from 'react'
import { CesiumController } from '../CesiumController'

const ConfigContainer: React.FC = () => {
  const [isBorderVisible, setIsBorderVisible] = useState(true)

  const toggleBorder = async () => {
    setIsBorderVisible(!isBorderVisible)
    await CesiumController.toggleChinaBorder(!isBorderVisible)
  }

  // 检查边境线数据源状态
  const checkBorderStatus = () => {
    setIsBorderVisible(CesiumController.chinaBorderDataSource !== null)
  }

  useEffect(() => {
    // 初始化时检查边境线是否已加载
    checkBorderStatus()
    // 如果还没加载，延迟检查（边境线在2秒后加载）
    const timer = setTimeout(() => {
      checkBorderStatus()
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
      <div className="w-full px-[16px] py-[12px]">
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
      </div>
    </div>
  )
}

export default ConfigContainer
