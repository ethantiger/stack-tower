import { useControls } from "leva"

export default function Lights() {
    const lightControls = useControls('Lights', {
        position: {
            value: {x:-5,y:3,z:10},
            step:0.01,
        }
    })
    return <>
        <directionalLight 
            position={[
                lightControls.position.x,
                lightControls.position.y,
                lightControls.position.z
            ]}
            intensity={1.5}
        />
        <ambientLight intensity={1}/>
    </>
}