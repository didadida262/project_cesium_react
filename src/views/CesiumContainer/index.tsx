import React from 'react'
import CesiumMap from './CesiumMap'

const CesiumContainer = () => {
  return (
    <div className="w-full h-full overflow-hidden">
      <CesiumMap />
    </div>
  )
} as React.FC

export default CesiumContainer
