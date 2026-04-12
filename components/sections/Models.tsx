'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Model = {
    id: string
    name: string
    tagline: string
    base_price: number
    image: string
    active: boolean
    slug: string
}

function formatPrice(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function Models() {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-100px' })
    const [models, setModels] = useState<Model[]>([])

    useEffect(() => {
        fetch('/api/models')
            .then(r => r.json())
            .then(data => setModels(data.filter((m: Model) => m.active).slice(0, 4)))
    }, [])

    return (
        <section id="models" className="bg-white py-20 md:py-40 px-6 md:px-20" ref={ref}>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9 }}
                className="mb-16 md:mb-20"
            >
        <span className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] block mb-4">
          003 / La gamme
        </span>
                <h2 className="font-black text-[clamp(40px,8vw,100px)] uppercase tracking-tight leading-[0.9]">
                    Choisissez<br />
                    votre <em className="text-[#E31F2C] not-italic">caractère.</em>
                </h2>
            </motion.div>

            <div className="flex flex-col divide-y divide-[#d2d2d7]">
                {models.map((m, i) => (
                    <Link
                        href={`/models/${m.slug}`}
                        key={m.id}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.1 * i + 0.3, duration: 0.8 }}
                            className="py-8 border-b border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors group cursor-pointer px-4 md:px-0"
                        >
                            {/* MOBILE */}
                            <div className="flex flex-col gap-4 md:hidden">
                                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-light tracking-[2px] text-[#6e6e73] w-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                                    <div className="relative w-[110px] h-[70px] flex-shrink-0">
                                        <Image src={m.image} alt={m.name} fill sizes="110px" className="object-contain mix-blend-multiply" />
                                    </div>
                                    <div>
                                        <div className="font-black text-[22px] uppercase tracking-tight leading-none group-hover:text-[#E31F2C] transition-colors duration-300">{m.name}</div>
                                        <div className="text-[12px] font-light text-[#6e6e73] mt-0.5">{m.tagline}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end pl-10">
                                    <div className="text-right">
                                        <div className="text-[10px] font-light text-[#6e6e73]">À partir de</div>
                                        <div className="font-bold text-[16px]">{formatPrice(m.base_price)}</div>
                                    </div>
                                    <span className="text-[11px] tracking-[2px] uppercase text-[#E31F2C] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                    Découvrir
                    <svg width="12" height="6" viewBox="0 0 20 10" fill="none">
                      <path d="M1 5H19M19 5L14 1M19 5L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                                </div>
                            </div>

                            {/* DESKTOP */}
                            <div className="hidden md:grid grid-cols-[80px_180px_1fr_200px_140px] items-center gap-10 py-2">
                <span className="text-[11px] font-light tracking-[2px] text-[#6e6e73] text-center">
                  {String(i + 1).padStart(2, '0')}
                </span>
                                <div className="relative w-[160px] h-[100px]">
                                    <Image src={m.image} alt={m.name} fill sizes="160px" className="object-contain mix-blend-multiply" />
                                </div>
                                <div>
                                    <div className="font-black text-[36px] uppercase tracking-tight leading-none group-hover:text-[#E31F2C] transition-colors duration-300">{m.name}</div>
                                    <div className="text-[13px] font-light text-[#6e6e73] mt-1">{m.tagline}</div>
                                </div>
                                <div className="text-right pr-10">
                                    <div className="text-[11px] font-light text-[#6e6e73] tracking-wide">À partir de</div>
                                    <div className="font-bold text-[20px] tracking-tight">{formatPrice(m.base_price)}</div>
                                </div>
                                <div className="flex justify-end pr-4">
                  <span className="text-[11px] tracking-[2px] uppercase text-[#E31F2C] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                    Configurer
                    <svg width="14" height="7" viewBox="0 0 20 10" fill="none">
                      <path d="M1 5H19M19 5L14 1M19 5L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    )
}