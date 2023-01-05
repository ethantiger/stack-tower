import useGame from "./stores/useGame";
import { useKeyboardControls, Text, Html } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from 'three'
import { RigidBody, CuboidCollider } from "@react-three/rapier";


function Start({colors}) {
    return <>
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
        <mesh receiveShadow position-y={-0.5}>
            <boxGeometry args={[1,0.4,1]} />
            <meshStandardMaterial color={colors[1]} />
        </mesh>
        <mesh position-y={-1.45}>
            <boxGeometry args={[1,1.5,1]} />
            <meshStandardMaterial color={colors[0]} />
        </mesh>
    </>
}

function GenerateBlock({position, color, boxSize, idx, animate = true, block}) {
    const blockRef= useRef()
    const [direction, setDirection] = useState(1)
    const speed = 2 + idx * 1.1/ 30
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
        <mesh castShadow receiveShadow ref={blockRef} position={position}>
            <boxGeometry args={boxSize}/>
            <meshStandardMaterial color={color}/>
        </mesh>
    )
}

function GenerateSlice({slicedMesh}) {
    return (
        <RigidBody>
            <mesh castShadow receiveShadow position={slicedMesh.position}>
                <boxGeometry args={slicedMesh.boxSize}/>
                <meshStandardMaterial color={slicedMesh.color}/>
            </mesh>
        </RigidBody> 
    )
}

function GenerateBounds({bound}) {
    return (
        <RigidBody type="fixed">
            <CuboidCollider 
                args={[bound.size[0]/2, bound.size[1]/2, bound.size[2]/2]}
                position={bound.position}
            />
        </RigidBody>
    )
}

export default function Level({colors}) {
    const [blocks, setBlocks] = useState([])
    const [slicedMeshes, setSlicedMeshes] = useState([])
    const [bounds ,setBounds] = useState([{size:[1,0.4,1], position:[0,-0.5,0]}])
    const [count , setCount] = useState(0)
    const addScore = useGame((state) => state.addScore)
    const resetScore = useGame((state) => state.resetScore)
    const [sub, get] = useKeyboardControls()
    // const [phase, setPhase] = useState('start')
    const phase = useGame((state) => state.phase)
    const stop = useGame((state) => state.stop)

    const [ smoothedCameraPosition, setSmoothedCameraPosition ] = useState(new THREE.Vector3(2,2.5,2))
    const [ smoothedCameraTarget, setSmoothedCameraTarget ] = useState(new THREE.Vector3())

    const [hitSound] = useState(() => new Audio('/impactMetal_medium_002.ogg'))
    const [successSound] = useState(() => new Audio('/jingles_PIZZI04.ogg'))
    const [loseSound] = useState(() => new Audio('/jingles_PIZZI07.ogg'))

    const {scene, camera} = useThree()

    const end = () => {
        loseSound.currentTime = 0 
        loseSound.play()
        stop()
        return 0
    }

    const restart = () => {
        setBlocks([])
        setBounds([{size:[1,0.4,1], position:[0,-0.5,0]}])
        setSlicedMeshes([])
        setCount(0)
        resetScore()
    }

    const drop = (e) => {
        const gameState = useGame.getState()
        if (gameState.phase==='start')  {
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

    const nextBlock = () => {
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
            color: colors[Math.floor(Math.random() * colors.length)],
            idx: count,
            dropped: false,
        }
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
            
            // Calculate offset
            let offset = Math.abs(curBlockPosition[0])
            if (direction) {
                offset = Math.abs(curBlockPosition[2])
            }

            if (offset < minOffset) {
                // Perfect place condition
                curblock.position = [0,curBlockPosition[1],0]
                successSound.currentTime = 0
                successSound.play()
            } else if (offset > curBlockSize[2]) {
                // Lose Condition
                return end()
            } else if (direction && curBlockPosition[2] > 0) {
                // Create sliced Mesh
                setSlicedMeshes([...slicedMeshes, {
                    boxSize: [curBlockSize[0], curBlockSize[1], offset],
                    position: [curBlockPosition[0], curBlockPosition[1], curBlockPosition[2] + 0.5 - curBlockPosition[2] + offset /2],
                    color: curblock.color
                }])
                curblock.position= [curBlockPosition[0], curBlockPosition[1], offset / 2 ]
                curblock.boxSize = [curBlockSize[0],curBlockSize[1],  1-curBlockPosition[2]]
                
                hitSound.currentTime = 0
                hitSound.play()
            } else if (direction && curBlockPosition[2] < 0) {
                // Create sliced Mesh
                setSlicedMeshes([...slicedMeshes, {
                    boxSize: [curBlockSize[0], curBlockSize[1], offset],
                    position: [curBlockPosition[0], curBlockPosition[1], curBlockPosition[2] + -0.5 - curBlockPosition[2] - offset /2],
                    color: curblock.color
                }])
                curblock.position= [curBlockPosition[0], curBlockPosition[1], -offset / 2 ]
                curblock.boxSize = [curBlockSize[0],curBlockSize[1], 1 + curBlockPosition[2]]
                hitSound.currentTime = 0
                hitSound.play()
            }
            setBounds([...bounds, {
                size: curblock.boxSize,
                position: curblock.position
            }])
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
                successSound.currentTime = 0
                successSound.play()
            } else if (offset > curBlockSize[0] && !direction || offset > curBlockSize[2] && direction) {
                // Lose condition
                return end()
            } else if (direction && curBlockPosition[2] > basePosition[2]) {
                // Create sliced Mesh
                setSlicedMeshes([...slicedMeshes, {
                    boxSize: [curBlockSize[0], curBlockSize[1], offset],
                    position: [curBlockPosition[0], curBlockPosition[1], curBlockPosition[2] + (basePosition[2] + curBlockSize[2] / 2 - curBlockPosition[2]) + offset /2],
                    color: curblock.color
                }])
                curblock.position= [curBlockPosition[0], curBlockPosition[1], curBlockPosition[2] - offset /2 ]
                curblock.boxSize = [curBlockSize[0],curBlockSize[1],  newSize]
                
                hitSound.currentTime = 0
                hitSound.play()
            } else if (direction && curBlockPosition[2] < basePosition[2]) {
                // Create sliced Mesh
                setSlicedMeshes([...slicedMeshes, {
                    boxSize: [curBlockSize[0], curBlockSize[1], offset],
                    position: [curBlockPosition[0], curBlockPosition[1], curBlockPosition[2] + (basePosition[2] - curBlockSize[2] / 2 - curBlockPosition[2]) - offset /2],
                    color: curblock.color
                }])
                curblock.position= [curBlockPosition[0], curBlockPosition[1], curBlockPosition[2] + offset /2 ]
                curblock.boxSize = [curBlockSize[0],curBlockSize[1], newSize]
                
                hitSound.currentTime = 0
                hitSound.play()
            } else if (!direction && curBlockPosition[0] > basePosition[0]) {
                // Create sliced Mesh
                setSlicedMeshes([...slicedMeshes, {
                    boxSize: [offset, curBlockSize[1], curBlockSize[2]],
                    position: [curBlockPosition[0] + (basePosition[0] + curBlockSize[0] / 2 - curBlockPosition[0]) + offset /2, curBlockPosition[1],curBlockPosition[2]],
                    color: curblock.color
                }])
                curblock.position= [curBlockPosition[0] - offset / 2, curBlockPosition[1], curBlockPosition[2]]
                curblock.boxSize = [newSize,curBlockSize[1],curBlockSize[2]]
                
                hitSound.currentTime = 0
                hitSound.play()
            } else if (!direction && curBlockPosition[0] < basePosition[0]) {
                // Create sliced Mesh
                setSlicedMeshes([...slicedMeshes, {
                    boxSize: [offset, curBlockSize[1], curBlockSize[2]],
                    position: [curBlockPosition[0] + (basePosition[0] - curBlockSize[0] / 2 - curBlockPosition[0]) - offset /2, curBlockPosition[1],curBlockPosition[2]],
                    color: curblock.color
                }])
                curblock.position= [curBlockPosition[0] + offset / 2, curBlockPosition[1], curBlockPosition[2] ]
                curblock.boxSize = [newSize,curBlockSize[1], curBlockSize[2]]
                
                hitSound.currentTime = 0
                hitSound.play()
            }
            setBounds([...bounds, {
                size: curblock.boxSize,
                position: curblock.position
            }])
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
                if (value) 
                    drop()                    
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
            let cameraPosition = new THREE.Vector3(2,blockPosition[1] + 2.5, 2)
            
            // const cameraTarget = new THREE.Vector3(blockPosition[0], blockPosition[1], blockPosition[2])
            const cameraTarget = new THREE.Vector3(0, blockPosition[1], 0)

            smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
            smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

            state.camera.position.copy(smoothedCameraPosition)
            state.camera.lookAt(smoothedCameraTarget)
        } else {
            setSmoothedCameraPosition(new THREE.Vector3(2,2.5,2))
            setSmoothedCameraTarget(new THREE.Vector3())
            camera.position.copy(new THREE.Vector3(2,2.5,2))
            camera.lookAt(new THREE.Vector3(0,0,0))
        }
    })

    return <>
        <Start colors={colors} />
        <Text
            font="/Rajdhani-Medium.woff"
            rotation={[-Math.PI / 2,0,0]}
            position={[0,-0.29, 0]}
            scale={0.5}
            textAlign="center"
            onPointerMissed={drop}
        >
           PRESS SPACE OR CLICK TO PLAY 
        </Text>
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
        {slicedMeshes.map((mesh,idx) =>
            <GenerateSlice key={idx} slicedMesh={mesh} />
        )}
        {bounds.map((bound, idx) =>
            <GenerateBounds key={idx} bound={bound} />
        )}
    </>
}