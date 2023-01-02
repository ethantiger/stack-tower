import { useKeyboardControls } from "@react-three/drei"
import { useState } from "react"
import useGame from "./stores/useGame"

export default function Interface() {
    const drop = useKeyboardControls((state) => state.drop)
    const phase = useGame((state) => state.phase)
    const reset = useGame((state) => state.reset)
    const score = useGame((state) => state.score)

    return <>
        <div className="interface">
            {score && <div className="count">{score}</div>}
            {phase === 'stop' && <div className="restart" onClick={reset}>CLICK TO RESTART</div>}
            <div className="controls">
                <div className="raw">
                    <div className={`key large ${drop ? 'active': ''}`}></div>
                </div>
            </div>
        </div>
    </>
}