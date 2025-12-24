import React, { useEffect, useRef, useState, useCallback } from 'react'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import ButtonComponent from '../../components/ButtonComponent'
import { CesiumController } from './CesiumController'
import {
  BTNMap,
  beijingPosition,
  gaoxiongPosition,
  tainanPosition,
} from './const'
import * as Cesium from 'cesium'
import DrawFlagContainer from './components/DrawFlagContainer'
import DrawAnimationContainer from './components/DrawAnimationContainer'
import MarkContainer from './components/MarkContainer'
import LocationJumpContainer from './components/LocationJumpContainer'
import ConfigContainer from './components/ConfigContainer'

const CesiumMap: React.FC = () => {
  const [currenModel, setCurrenModel] = useState('')
  const operationPanelRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 10 })
  const dragStartPosRef = useRef({ x: 0, y: 0 })
  const panelStartPosRef = useRef({ x: 0, y: 0 })
  const rafIdRef = useRef<number | null>(null)
  const panelSizeRef = useRef({ width: 500, height: 300 })

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!operationPanelRef.current) return
    setIsDragging(true)
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    panelStartPosRef.current = { ...panelPosition }

    // 缓存尺寸，避免频繁计算
    panelSizeRef.current = {
      width: operationPanelRef.current.offsetWidth,
      height: operationPanelRef.current.offsetHeight,
    }

    e.preventDefault()
    e.stopPropagation()
  }, [panelPosition])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      e.preventDefault()

      // 使用 requestAnimationFrame 节流更新
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - dragStartPosRef.current.x
        const deltaY = e.clientY - dragStartPosRef.current.y

        setPanelPosition({
          x: Math.max(
            0,
            Math.min(
              window.innerWidth - panelSizeRef.current.width,
              panelStartPosRef.current.x + deltaX,
            ),
          ),
          y: Math.max(
            0,
            Math.min(
              window.innerHeight - panelSizeRef.current.height,
              panelStartPosRef.current.y + deltaY,
            ),
          ),
        })

        rafIdRef.current = null
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [isDragging])

  const handleSelectFlag = (item: any) => {
    console.log('item>>>>', item)
    CesiumController.mark('PointIcon', item)
  }

  const handleSelectAnimation = (item: any) => {
    console.log('item>>>>', item)
    CesiumController.showSituation(item)
  }

  const handleSelectMark = (item: any) => {
    CesiumController.mark(item.key)
  }

  const handleSelectLocation = (item: any) => {
    console.log('handleSelectLocation called with item:', item)
    // 位置配置映射表
    const locationConfig: Record<
      string,
      {
        position: Cesium.Cartesian3
        height: number
        showExplosion?: boolean
        explosionPosition?: Cesium.Cartesian3
      }
    > = {
      beijing: {
        position: beijingPosition,
        height: 500000,
      },
      taiwan: {
        position: gaoxiongPosition,
        height: 900000,
        showExplosion: true,
        explosionPosition: tainanPosition,
      },
    }

    const config = locationConfig[item.key]
    if (config) {
      console.log('Found config for key:', item.key, config)
      CesiumController.flyToLocation(
        config.position,
        config.height,
        config.showExplosion || false,
        config.explosionPosition,
      )
    } else {
      console.warn('No config found for key:', item.key)
    }
  }

  const handleClickBTN = (btn: any) => {
    setCurrenModel(btn.text)
    CesiumController.remove()

    // 如果点击的是带有表格的按钮，且当前处于收起状态，则自动展开
    if (
      (btn.key === 'jump' ||
        btn.key === 'mark' ||
        btn.key === 'situation' ||
        btn.key === 'drawFlag' ||
        btn.key === 'config') &&
      isCollapsed
    ) {
      setIsCollapsed(false)
    }
  }

  useEffect(() => {
    CesiumController.init_world('cesiumContainer')
    // 等待场景加载完成后再绘制中国边境线
    const timer = setTimeout(() => {
      CesiumController.drawChinaBorder()
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full h-full relative text-[white] overflow-hidden">
      <div
        ref={operationPanelRef}
        className={`
          operation absolute z-10
          flex flex-col justify-start items-center gap-y-[10px]
          bg-gradient-to-br from-[rgb(18,20,22)] via-[rgb(22,24,28)] to-[rgb(18,20,22)]
          border-[2px] border-solid border-[#383B45] rounded-xl
          shadow-[0_8px_32px_rgba(0,0,0,0.6)]
          p-[12px]
          overflow-hidden
          ${isDragging ? 'shadow-[0_12px_48px_rgba(251,104,92,0.4)] border-[#FB685C]/50 will-change-transform' : 'backdrop-blur-sm'}
          ${!isCollapsed ? 'min-w-[500px]' : ''}
          ${isCollapsed ? 'panel-collapsed' : 'panel-expanded'}
        `}
        style={{
          top: `${panelPosition.y}px`,
          left: `${panelPosition.x}px`,
          willChange: isDragging ? 'transform' : 'auto',
        }}
      >
        {/* 拖拽手柄和收起按钮 */}
        <div className="w-full mb-[4px] flex items-center justify-between gap-x-[8px]">
          <div
            className="
              drag-handle flex-1 h-[8px] rounded-full
              bg-gradient-to-r from-transparent via-[#FB685C]/30 to-transparent
              cursor-move hover:via-[#FB685C]/50
              transition-all duration-300
              flex items-center justify-center
            "
            onMouseDown={handleMouseDown}
          >
            <div className="w-[40px] h-[2px] bg-[#FB685C]/50 rounded-full" />
          </div>
          <div
            className="
              collapse-btn w-[24px] h-[24px] rounded-md
              flex items-center justify-center
              cursor-pointer transition-all duration-300
              hover:bg-[#FB685C]/20 hover:border-[#FB685C]/50
              border border-transparent
            "
            onClick={toggleCollapse}
          >
            <svg
              className={`w-[16px] h-[16px] text-[#FB685C] transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="w-full flex justify-start items-center gap-x-[20px]">
          {BTNMap.map((item) => (
            <div
              key={item.key}
              className="flex justify-start items-center gap-x-[10px]"
              onClick={() => handleClickBTN(item)}
            >
              <ButtonComponent
                text={item.text}
                currenModel={currenModel}
                onClick={() => handleClickBTN(item)}
              />
            </div>
          ))}
        </div>

        {/* 内容区域 */}
        {!isCollapsed && (
          <div className="operation_content w-full h-[250px] rounded-lg overflow-hidden">
            {currenModel === '跳转至目标地点' && (
              <LocationJumpContainer onClick={handleSelectLocation} />
            )}
            {currenModel === '标注模式' && (
              <MarkContainer onClick={handleSelectMark} />
            )}
            {currenModel === '图标绘制' && (
              <DrawFlagContainer onClick={handleSelectFlag} />
            )}
            {currenModel === '动效演示' && (
              <DrawAnimationContainer onClick={handleSelectAnimation} />
            )}
            {currenModel === '通用配置' && <ConfigContainer />}
          </div>
        )}
      </div>

      <div id="cesiumContainer" className="w-full h-full" />

      <style>{`
        .operation {
          transition: max-height 0.3s ease, opacity 0.3s ease;
        }
        .panel-collapsed {
          max-height: 120px;
        }
        .panel-expanded {
          max-height: 500px;
        }
        .operation_content {
          min-height: 250px;
        }
      `}</style>
    </div>
  )
}

export default CesiumMap
