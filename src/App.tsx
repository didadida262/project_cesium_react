import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CesiumContainer from './views/CesiumContainer'

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CesiumContainer />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
