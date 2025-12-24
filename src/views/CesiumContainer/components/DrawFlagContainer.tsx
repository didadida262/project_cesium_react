import React from 'react'
import TableComponent from '../../../components/TableComponent'
import { MockredTableData } from '../const'

interface DrawFlagContainerProps {
  onClick: (data: any) => void
}

const DrawFlagContainer: React.FC<DrawFlagContainerProps> = ({ onClick }) => {
  return (
    <div
      className={`
        w-full h-full
        bg-gradient-to-br from-[rgb(18,20,22)] via-[rgb(20,22,26)] to-[rgb(18,20,22)]
        border-[2px] border-solid border-[#383B45] rounded-lg
        shadow-[0_4px_20px_rgba(0,0,0,0.5)]
        backdrop-blur-sm
      `}
    >
      <TableComponent
        data={MockredTableData}
        color="#FB685CFF"
        lightColor="rgb(23,16,28)"
        onClick={onClick}
      />
    </div>
  )
}

export default DrawFlagContainer
