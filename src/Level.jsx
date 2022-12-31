import useGame from "./stores/useGame";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useState, useMemo, useRef } from "react";
import * as THREE from 'three'

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

function GenerateBlock({position = [0,-0.2, -1.5], color='#7CA5B8', boxSize=[1,0.2,1]}) {
    return (
        <group position={position}>
            <mesh>
                <boxGeometry args={boxSize}/>
                <meshStandardMaterial color={color}/>
            </mesh>
        </group>
    )
}

export default function Level({count = 5}) {
    const [blocks, setBlocks] = useState([])
    const [sub, get] = useKeyboardControls()
    const phase = useGame((state) => state.phase)
    const start = useGame((state) => state.start)
    
    useEffect(() => {
        const unsubDrop = sub(
            (state) => state.drop,
            (value) => {
                if (value)  {
                    setBlocks([...blocks, GenerateBlock])
                    console.log(blocks)
                }                    
            }
        )

        const unsubAll = sub(
            () => start()
        )

        return () => {
            unsubAll()
            unsubDrop()
        }
    },[blocks])

    return <>
        <Start />
        {blocks.map((Block, idx) => { 
            return <Block key={idx} boxSize={[1,0.2,1]} position={[0,-0.2 + idx, -1.5]} color='#7CA5B8'/>
        })}
    </>
}