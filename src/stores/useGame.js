import create from 'zustand'

export default create((set) => {
    return {
        phase: 'ready',
        start: () => {
            
            set((state) => {
                if (state.phase === 'ready')
                    return { phase: 'playing'}
                return {}
            })
        },
        reset: () => {
            if (state.phase === 'playing')
                return { phase: 'ready'}
            return {}
        }
    }
})