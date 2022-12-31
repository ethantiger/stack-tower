import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import Interface from './interface'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <KeyboardControls
      map={[
        {name: 'drop', keys:['Space']}
      ]}
    >
      <Canvas
        orthographic
        camera={{
          fov: 45,
          near:0.1,
          far:200,
          position:[2,2,2],
          zoom:300
        }}
        
      >
        <App />
      </Canvas>
      <Interface />
    </KeyboardControls>
  </React.StrictMode>,
)
