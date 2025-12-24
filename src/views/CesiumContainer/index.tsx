import React from 'react'
import CesiumMap from './CesiumMap'

const CesiumContainer: React.FC = () => {
  return (
    <div className="w-full h-full overflow-hidden">
      <CesiumMap />
    </div>
  )
}

export default CesiumContainer
