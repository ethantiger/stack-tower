import { Physics, Debug } from '@react-three/rapier'
import { OrbitControls } from '@react-three/drei'

import Level from './Level'
import Lights from './Lights'

import colorSchemes from './color'

const colors = colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
console.log(colors)
function App() {

  return <>
    <color args={[colors[Math.floor(Math.random() * colors.length)]]} attach='background'/>
    <OrbitControls />
    <Lights />
    <Physics>
      {/* <Debug /> */}
      <Level colors={colors}/>
    </Physics>
  </>
}

export default App
