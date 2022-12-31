import { useKeyboardControls } from "@react-three/drei"

function Start() {
    return <>
        <mesh position-y={-0.5}>
            <boxGeometry args={[1,0.4,1]} />
            <meshStandardMaterial color="#38369A" />
        </mesh>
        <mesh position-y={-1.45}>
            <boxGeometry args={[1,1.5,1]} />
            <meshStandardMaterial color="#020887" />
        </mesh>
    </>
}

function NewBlock({position, color, boxSize}) {
    return <>
        <mesh position={position}>
            <boxGeometry args={boxSize}/>
            <meshStandardMaterial color={color}/>
        </mesh>
    </>
}

export default function Level() {
    const [sub, get] = useKeyboardControls()
    return <>
        <Start />
        <NewBlock boxSize={[1,0.2,1]} position={[0,-0.2, -1.5]} color={'#7CA5B8'}/>
    </>
}