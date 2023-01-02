import create from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export default create(subscribeWithSelector((set) => {
    return {        
        phase: 'start',
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