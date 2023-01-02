
import { OrbitControls } from '@react-three/drei'

import Level from './Level'
import Lights from './Lights'
import { Perf } from 'r3f-perf'


function App() {

  return <>
    <color args={['#C6EBBE']} attach='background'/>
    <Perf position='top-left'/>
    <OrbitControls />
    <Lights />
    <Level />
  </>
}

export default App
