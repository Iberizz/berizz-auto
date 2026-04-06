'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

export default function Hero() {
    const heroRef = useRef<HTMLElement>(null)
    const carRef = useRef<HTMLDivElement>(null)
    const glowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

            tl.to('.hero-overlay', {
                opacity: 0,
                duration: 1,
                ease: 'power2.inOut',
            })
                .fromTo(
                    '.hero-flash',
                    { opacity: 0 },
                    { opacity: 0.16, duration: 0.08, ease: 'power1.out' }
                )
                .to('.hero-flash', {
                    opacity: 0,
                    duration: 0.45,
                    ease: 'power2.out',
                })
                .from(
                    carRef.current,
                    {
                        opacity: 0,
                        scale: 0.94,
                        y: 36,
                        duration: 1.5,
                    },
                    '-=0.15'
                )
                .from(
                    glowRef.current,
                    {
                        opacity: 0,
                        scale: 0.72,
                        duration: 1.2,
                        ease: 'power2.out',
                    },
                    '-=1.1'
                )
                .from(
                    '.hero-kicker',
                    {
                        opacity: 0,
                        y: 12,
                        duration: 0.45,
                    },
                    '-=0.75'
                )
                .from(
                    '.hero-title',
                    {
                        opacity: 0,
                        y: 52,
                        scale: 0.96,
                        duration: 0.75,
                    },
                    '-=0.3'
                )
                .from(
                    '.hero-tagline',
                    {
                        opacity: 0,
                        y: 20,
                        duration: 0.55,
                    },
                    '-=0.38'
                )
                .from(
                    '.hero-sub',
                    {
                        opacity: 0,
                        y: 18,
                        duration: 0.5,
                    },
                    '-=0.3'
                )
                .from(
                    '.hero-btns',
                    {
                        opacity: 0,
                        y: 20,
                        duration: 0.55,
                    },
                    '-=0.22'
                )
                .from(
                    '.hero-stats > div',
                    {
                        opacity: 0,
                        y: 16,
                        duration: 0.45,
                        stagger: 0.08,
                    },
                    '-=0.15'
                )
                .from(
                    '.hero-scroll',
                    {
                        opacity: 0,
                        duration: 0.45,
                    },
                    '-=0.15'
                )

            gsap.to(glowRef.current, {
                scale: 1.06,
                opacity: 0.92,
                duration: 2.6,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            })
        }, heroRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={heroRef}
            className="relative flex h-screen items-center overflow-hidden bg-black"
        >
            <div className="hero-overlay absolute inset-0 z-[60] bg-black pointer-events-none" />
            <div className="hero-flash absolute inset-0 z-[55] bg-[#E31F2C] opacity-0 pointer-events-none" />

            <div
                ref={glowRef}
                className="absolute bottom-[-6%] left-[64%] z-10 h-[56vh] w-[62vw] -translate-x-1/2 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle at 50% 55%, rgba(227,31,44,0.50) 0%, rgba(227,31,44,0.18) 32%, rgba(227,31,44,0.08) 52%, transparent 70%)',
                    filter: 'blur(56px)',
                }}
            />

            <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    background:
                        'linear-gradient(to right, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.88) 24%, rgba(0,0,0,0.56) 46%, rgba(0,0,0,0.18) 68%, transparent 100%)',
                }}
            />

            <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.34) 68%, rgba(0,0,0,0.82) 100%)',
                }}
            />

            <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    background:
                        'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 42%, transparent 100%)',
                }}
            />

            <div
                ref={carRef}
                className="absolute inset-0 z-10"
            >
                <Image
                    src="/images/hero-cinematic.jpeg"
                    alt="Berizz performance car"
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain object-center"
                />
            </div>

            <div className="relative z-30 mx-auto flex w-full max-w-[1440px] items-center px-6 md:px-10 lg:px-16">
                <div className="max-w-[620px] text-left">
                    <p className="hero-kicker mb-5 text-[10px] font-medium uppercase tracking-[0.5em] text-white/40 md:text-[11px]">
                        Introducing
                    </p>

                    <h1 className="hero-title leading-[0.82] uppercase tracking-[-0.04em]">
            <span
                className="block font-black text-white text-[clamp(72px,10vw,168px)]"
                style={{
                    textShadow: '0 0 24px rgba(227,31,44,0.14)',
                }}
            >
              BERIZZ
            </span>
                    </h1>

                    <p className="hero-tagline mt-4 text-[11px] font-semibold uppercase tracking-[0.42em] text-[#E31F2C] md:text-[13px]">
                        Built without mercy
                    </p>

                    <p className="hero-sub mt-6 max-w-[420px] text-[14px] leading-relaxed text-white/55 md:text-[16px]">
                        Rebuilt from the road up. Engineered to hit harder, move faster,
                        and leave nothing soft behind.
                    </p>

                    <div className="hero-btns mt-10 flex flex-col gap-4 sm:flex-row">
                        <Link
                            href="#models"
                            className="inline-flex min-w-[190px] items-center justify-center rounded-full bg-[#E31F2C] px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_30px_rgba(227,31,44,0.75)]"
                        >
                            Découvrir
                        </Link>

                        <Link
                            href="/configurateur"
                            className="inline-flex min-w-[190px] items-center justify-center rounded-full border border-white/20 px-10 py-4 text-[11px] font-medium uppercase tracking-[0.28em] text-white/80 transition-all duration-300 hover:border-[#E31F2C] hover:bg-[#E31F2C]/10 hover:text-white"
                        >
                            Configurer
                        </Link>
                    </div>
                </div>
            </div>

            <motion.div
                className="hero-scroll absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2"
                animate={{ y: [0, 8, 0], opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
        <span className="text-[9px] font-light uppercase tracking-[0.45em] text-white/30">
          Scroll
        </span>
                <div className="h-10 w-px bg-gradient-to-b from-white/35 to-transparent" />
            </motion.div>

            <div className="hero-stats hidden md:flex absolute bottom-10 right-10 z-30 gap-8 lg:right-14">
                {[
                    { value: '2.8s', label: '0-100' },
                    { value: '720ch', label: 'Puissance' },
                    { value: '340', label: 'Km/h max' },
                ].map((stat) => (
                    <div key={stat.label} className="text-right">
                        <div className="text-[24px] font-black tracking-[-0.03em] text-white">
                            {stat.value}
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.34em] text-white/30">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}