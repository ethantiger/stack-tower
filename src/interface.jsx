import { useKeyboardControls } from "@react-three/drei"

export default function Interface() {
    const drop = useKeyboardControls((state) => state.drop)
    return <>
        <div className="controls">
            <div className="raw">
                <div className={`key large ${drop ? 'active': ''}`}></div>
            </div>
        </div>
    </>
}