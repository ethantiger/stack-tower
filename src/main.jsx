import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Sparkles } from '@react-three/drei'
import Interface from './interface'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <KeyboardControls
      map={[
        {name: 'drop', keys:['Space']}
      ]}
    >
      <Canvas
        shadows
        orthographic
        camera={{
          fov: 45,
          near:0.1,
          far:200,
          position:[2,2.5,2],
          zoom:300
        }}
        
      >
        <App />
        <Sparkles 
          size={2}
          scale={[5,100,0]}
          speed={0.1}
          count={500}
          position={[-1,45,-1]}
          rotation-y={0.85}
        />
      </Canvas>
      <Interface />
    </KeyboardControls>
  </React.StrictMode>,
)
