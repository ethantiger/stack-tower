import useGame from "./stores/useGame";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

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

function GenerateBlock({position, color, boxSize, idx, animate = true}) {
    const block = useRef()
    useFrame((state, delta) => {
        if (animate) {
            const time = state.clock.elapsedTime

            // console.log(state)
            idx % 2 === 0 ? block.current.position.z = -1.5 * Math.sin(time + Math.PI/2) : block.current.position.x = -1.5 * Math.sin(time + Math.PI/2)
    
        }
    })

    return (
        <mesh ref={block} position={position}>
            <boxGeometry args={boxSize}/>
            <meshStandardMaterial color={color}/>
        </mesh>
    )
}

const nextBlock = (blocks) => {
    return {
        boxSize: [1,0.2,1],
        position: blocks.length % 2 === 0 ? [0,-0.2 + blocks.length * 0.2, -1.5] : [-1.5,-0.2 + blocks.length * 0.2, 0],
        color: '#7CA5B8'
    }
}

export default function Level() {
    const [blocks, setBlocks] = useState([])
    const [sub, get] = useKeyboardControls()
    const phase = useGame((state) => state.phase)
    const start = useGame((state) => state.start)
    const {clock} = useThree()
    
    useEffect(() => {
        const unsubDrop = sub(
            (state) => state.drop,
            (value) => {
                if (value)  {
                    setBlocks((blocks) => {
                        if (blocks.length > 0) return [...blocks, blocks[blocks.length - 1].animate = false]
                    })
                    const newBlock = nextBlock(blocks)
                    setBlocks([...blocks, newBlock ])
                    clock.start()
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
        {blocks.map((block, idx) => idx % 2 === 0 ? 
                <GenerateBlock key={idx} boxSize={block.boxSize} position={block.position} color={block.color} idx={idx} animate={block.animate}/> : 
                <GenerateBlock key={idx} boxSize={block.boxSize} position={block.position} color={block.color} idx={idx} animate={block.animate}/>
        )}
    </>
}