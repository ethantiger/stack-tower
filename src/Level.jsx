import useGame from "./stores/useGame";
import { useKeyboardControls, Text, Html } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
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

function GenerateBlock({position, color, boxSize, idx, animate = true, block}) {
    const blockRef= useRef()
    const [direction, setDirection] = useState(1)
    const speed = 2 + idx/ 30
    useFrame((state, delta) => {
        if (animate) {
            if (idx % 2 ===0) {
                if ((blockRef.current.position.z >= 1.5  && direction > 0) || (blockRef.current.position.z < -1.5 && direction < 0) ){
                    setDirection(direction * -1)
                }
                blockRef.current.position.z += speed * delta * direction
            } else {
                if ((blockRef.current.position.x >= 1.5 && direction > 0) || (blockRef.current.position.x < -1.5 && direction < 0) ){
                    setDirection(direction * -1)
                }
                blockRef.current.position.x += speed * delta * direction
            }
            // console.log(block.dropped)
            if (!block.dropped)
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
        idx,
        dropped: false,
    }
}

export default function Level() {
    const [blocks, setBlocks] = useState([])
    const [count , setCount] = useState(0)
    const addScore = useGame((state) => state.addScore)
    const resetScore = useGame((state) => state.resetScore)
    const [sub, get] = useKeyboardControls()
    // const [phase, setPhase] = useState('start')
    const phase = useGame((state) => state.phase)
    const stop = useGame((state) => state.stop)

    const [ smoothedCameraPosition, setSmoothedCameraPosition ] = useState(new THREE.Vector3(2,2.5,2))
    const [ smoothedCameraTarget, setSmoothedCameraTarget ] = useState(new THREE.Vector3())


    // const 
    const {scene, camera} = useThree()
    
    const end = () => {
        stop()
        return 0
    }

    const restart = () => {
        camera.position.copy(new THREE.Vector3(2,2.5,2))
        camera.lookAt(new THREE.Vector3(0,0,0))
        setSmoothedCameraPosition(new THREE.Vector3(2,2.5,2))
        setSmoothedCameraTarget(new THREE.Vector3())
        setBlocks([])
        setCount(0)
        resetScore()
    }

    const changeCurBlock = () => {
        const minOffset = 0.05
        // FIRST BLOCK (NO BASE)
        if (blocks.length === 1) {
            const curblock = blocks[blocks.length - 1]
            curblock.animate = false
            curblock.dropped = true
            const curBlockPosition = curblock.position
            const curBlockSize = curblock.boxSize
            const direction = curblock.idx % 2 === 0
            
            let offset = Math.abs(curBlockPosition[0])
            if (direction) {
                offset = Math.abs(curBlockPosition[2])
            }
            if (offset < minOffset) {
                // Perfect place condition
                curblock.position = [0,curBlockPosition[1],0]
            } else if (offset > curBlockSize[2]) {
                // Lose Condition
                return end()
            } else if (direction && curBlockPosition[2] > 0) {
                curblock.position= [curBlockPosition[0], curBlockPosition[1], offset / 2 ]
                curblock.boxSize = [curBlockSize[0],curBlockSize[1],  1-curBlockPosition[2]]
            } else if (direction && curBlockPosition[2] < 0) {
                curblock.position= [curBlockPosition[0], curBlockPosition[1], -offset / 2 ]
                curblock.boxSize = [curBlockSize[0],curBlockSize[1], 1 + curBlockPosition[2]]
            }
            addScore()
        // OTHER BLOCKS
        } else if (blocks.length > 0) {
            const curblock = blocks[blocks.length - 1]
            curblock.animate = false
            curblock.dropped = true
            const curBlockPosition = curblock.position
            const curBlockSize = curblock.boxSize
            const direction = curblock.idx % 2 === 0
            
            const basePosition = blocks[blocks.length - 2].position
    
            // CALCULATE CUTOFF AMOUNT AND NEW BLOCK SIZE
            let offset = 0;
            let newSize = 0;
            if (direction) {
                if (curBlockPosition[2] < 0 && basePosition[2] < 0) {
                    offset = Math.abs(Math.abs(curBlockPosition[2]) - Math.abs(basePosition[2]))
                } else if (curBlockPosition[2] > 0 && basePosition[2] > 0) {
                    offset = Math.abs(curBlockPosition[2] - basePosition[2])
                } else {
                    offset = Math.abs(curBlockPosition[2]) + Math.abs(basePosition[2])
                }
                newSize =curBlockSize[2] - Math.abs(offset)
            } else {
                if (curBlockPosition[0] < 0 && basePosition[0] < 0) {
                    offset = Math.abs(Math.abs(curBlockPosition[0]) - Math.abs(basePosition[0]))
                } else if (curBlockPosition[0] > 0 && basePosition[0] > 0) {
                    offset = Math.abs(curBlockPosition[0] - basePosition[0])
                } else {
                    offset = Math.abs(curBlockPosition[0]) + Math.abs(basePosition[0])
                }
                newSize =curBlockSize[0] - Math.abs(offset)
            }        
            // APPLY NEW POSITION AND NEW SIZE
            if (offset < minOffset) {
                curblock.position = [basePosition[0], curBlockPosition[1], basePosition[2]]
            } else if (offset > curBlockSize[0] && !direction || offset > curBlockSize[2] && direction) {
                // Lose condition
                return end()
            } else if (direction && curBlockPosition[2] > basePosition[2]) {
                curblock.position= [curBlockPosition[0], curBlockPosition[1], curBlockPosition[2] - offset /2 ]
                curblock.boxSize = [curBlockSize[0],curBlockSize[1],  newSize]
            } else if (direction && curBlockPosition[2] < basePosition[2]) {
                curblock.position= [curBlockPosition[0], curBlockPosition[1], curBlockPosition[2] + offset /2 ]
                curblock.boxSize = [curBlockSize[0],curBlockSize[1], newSize]
            } else if (!direction && curBlockPosition[0] > basePosition[0]) {
                curblock.position= [curBlockPosition[0] - offset / 2, curBlockPosition[1], curBlockPosition[2]]
                curblock.boxSize = [newSize,curBlockSize[1],curBlockSize[2]]
            } else if (!direction && curBlockPosition[0] < basePosition[0]) {
                curblock.position= [curBlockPosition[0] + offset / 2, curBlockPosition[1], curBlockPosition[2] ]
                curblock.boxSize = [newSize,curBlockSize[1], curBlockSize[2]]
            }
            addScore()
        }
        return 1
    }

    useEffect(() => {
        const unsubReset = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === 'start') restart()
            } 
        )

        const unsubDrop = sub(
            (state) => state.drop,
            (value) => {
                const gameState = useGame.getState()
                if (value && gameState.phase==='start')  {
                    // stop previous block animation
                    const generateNextBlock = changeCurBlock(blocks,scene)
                    // if (curBlocks) setBlocks(blocks[blocks.length-1].position = [...curBlocks])
                    // create new block arguments
                    if (generateNextBlock) {
                        const newBlock = nextBlock(blocks, count)
                        setCount(count+1)
                        setBlocks((blocks) => [...blocks, newBlock])
                    }
                }                    
            }
        )

        // const unsubAll = sub(
        //     () => start()
        // )
        return () => {
            // unsubAll()
            unsubReset()
            unsubDrop()
        }
    },[blocks])

    /**
     * CAMERA
     */
    useFrame((state, delta) => {
        if (blocks.length > 2) {
            const blockPosition = blocks[blocks.length -2].position
            const cameraPosition = new THREE.Vector3(2,blockPosition[1], 2)
            cameraPosition.y += 2.5

            // const cameraTarget = new THREE.Vector3(blockPosition[0], blockPosition[1], blockPosition[2])
            const cameraTarget = new THREE.Vector3(0, blockPosition[1], 0)

            smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
            smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

            state.camera.position.copy(smoothedCameraPosition)
            state.camera.lookAt(smoothedCameraTarget)
        }
    })

    return <>
        <Start />
        {/* {!count &&<Html
            font="/Rajdhani-Medium.woff"
            wrapperClass="title"
            position={[0,1,0]}
            center
            // rotation-y={0.8}
        >STACK TOWER</Html>} */}
        {/* <Text
            font="/Rajdhani-Medium.woff"
            rotation={[-Math.PI /2,0,Math.PI /2]}
            position={[0,-0.29, 0]}
            scale={3}
            textAlign="center"
            maxWidth={0.25}
        >STACK TOWER</Text> */}
         <Text
            font="/Rajdhani-Medium.woff"
            rotation={[0,0,0]}
            position={[0,-0.5, 0.51]}
            scale={2}
            textAlign="center"
            maxWidth={0.25}
        >STACK</Text>
        <Text
            font="/Rajdhani-Medium.woff"
            rotation={[0,Math.PI/2,0]}
            position={[0.51,-0.5, 0]}
            scale={2}
            textAlign="center"
            maxWidth={0.25}
        >TOWER</Text>
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