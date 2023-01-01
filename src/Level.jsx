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

function GenerateBlock({position, color, boxSize, idx, animate = true, block}) {
    const blockRef= useRef()
    useFrame((state, delta) => {
        if (animate) {
            const time = state.clock.elapsedTime

            // console.log(state)
            idx % 2 === 0 ? blockRef.current.position.z = -1.5 * Math.sin(time + Math.PI/2) : blockRef.current.position.x = -1.5 * Math.sin(time + Math.PI/2)
            
            block.position = [blockRef.current.position.x, blockRef.current.position.y, blockRef.current.position.z]
        } else {
            block.position = [blockRef.current.position.x, blockRef.current.position.y, blockRef.current.position.z]

        }
    })

    return (
        <mesh ref={blockRef} position={position}>
            <boxGeometry args={boxSize}/>
            <meshStandardMaterial color={color}/>
        </mesh>
    )
}
const changeCurBlock = (blocks,scene) => {
    if (blocks.length === 1) {
        console.log(blocks)
        const curblock = blocks[blocks.length - 1]
        curblock.animate = false

        const curBlockPosition = curblock.position
        const curBlockSize = curblock.boxSize
        const direction = curblock.idx % 2 === 0
        

        if (direction && curBlockPosition[2] > 0) {
            curblock.position= [curBlockPosition[0], curBlockPosition[1], curBlockPosition[2] / 2 ]
            curblock.boxSize = [curBlockSize[0],curBlockSize[1],  1-curBlockPosition[2]]
        } else if (direction && curBlockPosition[2] < 0) {
            curblock.position= [curBlockPosition[0], curBlockPosition[1], curBlockPosition[2] / 2 ]
            curblock.boxSize = [curBlockSize[0],curBlockSize[1], 1 + curBlockPosition[2]]
        }
        // return [...blocks, blocks[blocks.length - 1] = curblock] 
    } else if (blocks.length > 0) {
        const curblock = blocks[blocks.length - 1]
        const curBlockPosition = curblock.position
        const curBlockSize = curblock.boxSize
        const direction = curblock.idx % 2 === 0
        
        const basePosition = blocks[blocks.length - 2].position
        const baseSize = blocks[blocks.length - 2].boxSize

        console.log('baseSize',baseSize)
        console.log('cursize', curBlockSize)
        console.log('basepos', basePosition)
        console.log('curpos', curBlockPosition)


        // console.log(scene)
        let offset = curBlockSize[0] / 2 - baseSize[0] / 2 + curBlockPosition[0] + basePosition[0]
        let newSize = curBlockSize[0] - Math.abs(offset)
        if (direction) {
            offset = curBlockSize[2] / 2 - baseSize[2] / 2 + curBlockPosition[2] + basePosition[2]
            newSize = curBlockSize[2] - Math.abs(offset)
        }

        curblock.animate = false

        if (direction && curBlockPosition[2] > basePosition[2]) {
            curblock.position= [curBlockPosition[0], curBlockPosition[1], offset/2 ]
            curblock.boxSize = [curBlockSize[0],curBlockSize[1],  newSize]
        } else if (direction && curBlockPosition[2] < basePosition[2]) {
            curblock.position= [curBlockPosition[0], curBlockPosition[1], offset/2 ]
            curblock.boxSize = [curBlockSize[0],curBlockSize[1], newSize]
        } else if (!direction && curBlockPosition[0] > basePosition[0]) {
            curblock.position= [offset / 2, curBlockPosition[1], curBlockPosition[2]]
            curblock.boxSize = [newSize,curBlockSize[1],curBlockSize[2]]
        } else if (!direction && curBlockPosition[0] < basePosition[0]) {
            curblock.position= [offset / 2, curBlockPosition[1], curBlockPosition[2] ]
            curblock.boxSize = [newSize,curBlockSize[1], curBlockSize[2]]
        }
        console.log(blocks)

        // return [...blocks, blocks[blocks.length - 1] = curblock] 
    }
    // return [...blocks]
}

const nextBlock = (blocks, idx) => {
    const oldBlock = blocks[blocks.length - 1]
    let positionX = 0
    let positionZ = 0
    if (blocks.length > 0) {
        positionX = oldBlock.position[0]
        positionZ = oldBlock.position[2]
    }
    return {
        boxSize: blocks.length > 0 ? oldBlock.boxSize : [1,0.2,1],
        position: blocks.length % 2 === 0 ? [positionX,-0.2 + blocks.length * 0.2, -1.5] : [-1.5,-0.2 + blocks.length * 0.2, positionZ],
        color: '#7CA5B8',
        idx
    }
}

export default function Level() {
    const [blocks, setBlocks] = useState([])
    const [count , setCount] = useState(0)
    const [sub, get] = useKeyboardControls()
    const phase = useGame((state) => state.phase)
    const start = useGame((state) => state.start)
    const {clock, scene} = useThree()
    
    useEffect(() => {
        const unsubDrop = sub(
            (state) => state.drop,
            (value) => {
                if (value)  {
                    // stop previous block animation
                    changeCurBlock(blocks,scene)
                    // create new block arguments
                    const newBlock = nextBlock(blocks, count)
                    setCount(count+1)
                    setBlocks((blocks) => [...blocks, newBlock])
                    // reset the clock for animation
                    requestAnimationFrame(() => clock.start())
                    // clock.start()
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
        {blocks.map((block, idx) => 
            <GenerateBlock 
                key={idx} 
                boxSize={block.boxSize} 
                position={block.position} 
                color={block.color} 
                idx={block.idx} 
                animate={block.animate}
                block={block}
            />
        )}
    </>
}