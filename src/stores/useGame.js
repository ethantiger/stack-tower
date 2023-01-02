import create from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export default create(subscribeWithSelector((set) => {
    return {        
        phase: 'start',
        score: 0,
        addScore: () => {
            set((state) => {
                return { score: state.score + 1}
            })
        },
        resetScore: () => {
            set(() => {
                return { score: 0}
            })
        },
        stop: () => {
            // console.log('start')
            set((state) => {
                if (state.phase === 'start')
                    return { phase: 'stop'}
                return {}
            })
        },
        reset: () => {
            set((state) => {
                if (state.phase === 'stop')
                    return { phase: 'start'}
                return {}
            })
        }
    }
}))