import React, { useLayoutEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import QueryEditor from './QueryEditor'

function useObservedHeight<T extends HTMLElement>(ref: React.RefObject<T> | React.RefObject<T | null>) {
    const [height, setHeight] = useState(0)

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return

        // Initial measure
        setHeight(el.getBoundingClientRect().height)

        const ro = new ResizeObserver(([entry]) => {
            setHeight(entry.contentRect.height)
        })
        ro.observe(el)

        return () => ro.disconnect()
    }, [ref])

    return height
}

export default function App() {
    const slotRef = useRef<HTMLDivElement>(null)
    const slotHeight = useObservedHeight(slotRef)

    return (
        <div
            style={{
                height: '100vh',
                display: 'grid',
                gridTemplateRows: 'auto 1fr auto',
            }}
        >
            <h1>Trino query editor - Example app</h1>
            <div ref={slotRef} style={{ minHeight: 0 }}>
                <QueryEditor theme="dark" height={slotHeight} />
            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
