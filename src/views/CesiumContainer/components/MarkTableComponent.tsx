import React, { useState } from 'react'

interface MarkTableComponentProps {
  data: Array<{ name: string; key: string }>
  color: string
  lightColor: string
  onClick: (data: any) => void
}

const getIconComponent = (key: string) => {
  const iconMap: Record<string, JSX.Element> = {
    Point: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    Line: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="w-5 h-5"
      >
        <line x1="4" y1="12" x2="20" y2="12" />
      </svg>
    ),
    StraightArrow: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <line x1="4" y1="12" x2="16" y2="12" />
        <polyline points="14,8 18,12 14,16" />
      </svg>
    ),
    AttackArrow: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M3 12 L12 3 L21 12 L12 21 Z" />
      </svg>
    ),
    PincerArrow: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M3 12 L8 7 L12 12 L16 7 L21 12" />
        <path d="M3 12 L8 17 L12 12 L16 17 L21 12" />
      </svg>
    ),
  }

  return iconMap[key] || <span>{key}</span>
}

const MarkTableComponent: React.FC<MarkTableComponentProps> = ({
  data,
  color: _color,
  lightColor: _lightColor,
  onClick,
}) => {
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const handleRowClick = (item: any) => {
    setSelectedItem(item.key || item)
    onClick(item)
  }

  return (
    <div className="w-full h-full flex flex-col justify-between items-center">
      <div className="header w-full h-[28px] text-[12px] flex justify-between items-center px-[10px] text-[#FB685C] font-semibold border-b-[2px] border-solid border-[#FB685C]/30 bg-gradient-to-r from-transparent via-[#FB685C]/5 to-transparent">
        <div className="w-[calc(48%)] h-full flex items-center">名称</div>
        <div className="w-[calc(48%)] h-full flex items-center">ID</div>
      </div>
      <div className="content w-full h-[calc(100%_-_28px)] overflow-y-auto custom-scrollbar px-[4px] py-[4px]">
        {data.map((item, index) => {
          const isSelected = selectedItem === item.key || selectedItem === item
          return (
            <div
              key={index}
              className={`
                w-full h-[42px] text-[12px]
                flex justify-between items-center px-[10px]
                rounded-md transition-all duration-300
                border
                hover:cursor-pointer
                border-b-[1px] border-solid border-[#383B45]/50
                mb-[6px]
                ${
                  isSelected
                    ? 'text-[#FB685C] border-[#FB685C] bg-[#FB685C]/15'
                    : 'text-[#DCF0FF] border-transparent hover:border-[#FB685C]/50 hover:bg-gradient-to-r hover:from-[#FB685C]/10 hover:to-transparent hover:shadow-[0_2px_8px_rgba(251,104,92,0.3)]'
                }
              `}
              onClick={() => handleRowClick(item)}
            >
              <div className="w-[calc(48%)] h-full flex justify-between items-center select-none">
                {item.name}
              </div>
              <div className="flex items-center w-[calc(48%)] h-full select-none">
                <span className={isSelected ? 'text-[#FB685C]' : 'text-[#DCF0FF]'}>
                  {getIconComponent(item.key)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(56, 59, 69, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 104, 92, 0.5);
          border-radius: 3px;
          transition: background 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 104, 92, 0.7);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(251, 104, 92, 0.5) rgba(56, 59, 69, 0.3);
        }
      `}</style>
    </div>
  )
}

export default MarkTableComponent
