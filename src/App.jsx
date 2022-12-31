
import { OrbitControls } from '@react-three/drei'

import Level from './Level'
import Lights from './assets/Lights'


function App() {

  return <>
    <color args={['#C6EBBE']} attach='background'/>
    <OrbitControls />
    <Lights />
    <Level />

  </>
}

export default App
