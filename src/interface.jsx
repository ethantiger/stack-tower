import { useKeyboardControls } from "@react-three/drei"
import { useEffect } from "react"
import { addEffect } from "@react-three/fiber"
import useGame from "./stores/useGame"


export default function Interface() {
    const drop = useKeyboardControls((state) => state.drop)
    const phase = useGame((state) => state.phase)
    const reset = useGame((state) => state.reset)
    const score = useGame((state) => state.score)
    // useEffect(() => {
    //     const unsub = addEffect(() => {
    //         const state = useGame.getState()
    //     })

    //     return () => {
    //         unsub()
    //     }
    // })

    return <>
        <div className="interface">
            <div className="count">{score}</div>
            {phase === 'stop' && <div className="restart" onClick={reset}>RESTART</div>}
            <div className="controls">
                <div className="raw">
                    <div className={`key large ${drop ? 'active': ''}`}></div>
                </div>
            </div>
        </div>
    </>
}