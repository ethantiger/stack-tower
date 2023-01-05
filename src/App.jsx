import { Physics, Debug } from '@react-three/rapier'
import { OrbitControls, Sparkles } from '@react-three/drei'
import { useEffect, useState } from 'react'
import useGame from './stores/useGame'
import Level from './Level'
import Lights from './Lights'

import colorSchemes from './color'

function App() {
  const [colors, setColors] = useState([])
  const [bgColor, setBgColor] = useState([])
  const phase = useGame((state) => state.phase)
  const score = useGame((state) => state.score)
  useEffect(() => {    
    if (phase === 'start' && score === 0) {
      const colorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
      setColors(colorScheme)
      setBgColor(colorScheme[Math.floor(Math.random() * colorScheme.length)])
    }
  }, [phase])
  return <>
    <color args={[bgColor]} attach='background'/>
    <OrbitControls />
    <Lights />
    
    <Physics>
      {/* <Debug /> */}
      <Level colors={colors}/>
    </Physics>
  </>
}

export default App
