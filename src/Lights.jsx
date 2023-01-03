import { useControls } from "leva"
import { useHelper } from "@react-three/drei"
import { useRef } from "react"
import { DirectionalLightHelper } from "three"
import { useFrame } from "@react-three/fiber"

export default function Lights() {
    const light = useRef()
    // useHelper(light, DirectionalLightHelper, 1)
    // const lightControls = useControls('Lights', {
    //     position: {
    //         value: {x:5,y:2.5,z:-5},
    //         step:0.01,
    //     }
    // })

    useFrame((state) => {
        light.current.position.y = state.camera.position.y
        light.current.target.position.y = state.camera.position.y - 2.5
        light.current.target.updateMatrixWorld()
    })

    return <>
        <directionalLight 
            ref={light}
            castShadow
            // position={[
            //     lightControls.position.x,
            //     lightControls.position.y,
            //     lightControls.position.z
            // ]}
            position={[5,2.5,-5]}
            intensity={1.5}
        />
        <ambientLight intensity={1}/>
    </>
}