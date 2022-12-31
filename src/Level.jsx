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

function NewBlock() {
    return <>
        <mesh position={[0,-0.2, -1.5]}>
            <boxGeometry args={[1,0.2,1]}/>
            <meshStandardMaterial color="#7CA5B8"/>
        </mesh>
    </>
}

export default function Level() {
    return <>
        <Start />
        <NewBlock />
    </>
}