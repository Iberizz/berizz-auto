'use client'

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useRef, useEffect } from 'react'

const stats = [
    { value: 2.8, unit: 's', label: '0 à 100 km/h', decimals: 1 },
    { value: 720, unit: 'ch', label: 'Puissance max', decimals: 0 },
    { value: 340, unit: 'km/h', label: 'Vitesse de pointe', decimals: 0 },
    { value: 1.28, unit: 't', label: 'Poids à vide', decimals: 2 },
]

function AnimatedNumber({ value, decimals, inView }: { value: number, decimals: number, inView: boolean }) {
    const count = useMotionValue(0)
    const rounded = useTransform(count, (latest) => latest.toFixed(decimals))

    useEffect(() => {
        if (inView) {
            const controls = animate(count, value, { duration: 2, ease: 'easeOut' })
            return controls.stop
        }
    }, [inView, value, count])

    return <motion.span>{rounded}</motion.span>
}

export default function Stats() {
    const sentinelRef = useRef(null)
    const inView = useInView(sentinelRef, { once: true, amount: 0.5 })

    return (
        <section className="bg-black text-white py-20 md:py-40 px-6 md:px-20 text-center">
            <motion.h2
                initial={{opacity: 0, y: 40}}
                animate={inView ? {opacity: 1, y: 0} : {}}
                transition={{duration: 0.9}}
                className="font-black text-[clamp(40px,6vw,80px)] uppercase tracking-tight leading-[0.95] mb-16 md:mb-24"
            >
                Des chiffres qui<br/>
                <em className="text-[#E31F2C] not-italic">ne mentent pas.</em>
            </motion.h2>


            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 max-w-4xl mx-auto">
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{opacity: 0, y: 30}}
                        animate={inView ? {opacity: 1, y: 0} : {}}
                        transition={{delay: 0.1 * i + 0.2, duration: 0.8}}
                        className="bg-black py-10 md:py-16 px-6 md:px-10 group relative overflow-hidden"
                    >
                        <div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E31F2C] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"/>

                        <div className="font-black text-[48px] md:text-[64px] leading-none tracking-tight">
                            <AnimatedNumber value={s.value} decimals={s.decimals} inView={inView}/>
                            <sup className="text-xl md:text-3xl text-[#E31F2C] font-light tracking-normal align-super">
                                {s.unit}
                            </sup>
                        </div>

                        <div
                            className="text-[10px] md:text-[11px] font-light tracking-[3px] uppercase text-white/40 mt-3">
                            {s.label}
                        </div>
                    </motion.div>
                ))}
            </div>
            <div ref={sentinelRef} className="max-w-4xl mx-auto h-px"/>

        </section>
    )
}
