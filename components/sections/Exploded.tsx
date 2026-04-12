'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function Exploded() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
      <section
          id="tech"
          className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-2 items-center overflow-hidden"
          ref={ref}
      >

        {/* Text */}
        <div className="p-8 md:p-20 order-1 md:order-2">
          <motion.span
              initial={{opacity: 0, y: 20}}
              animate={inView ? {opacity: 1, y: 0} : {}}
              transition={{duration: 0.7}}
              className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] mb-5 block"
          >
            002 / Architecture
          </motion.span>

          <motion.h2
              initial={{opacity: 0, y: 20}}
              animate={inView ? {opacity: 1, y: 0} : {}}
              transition={{duration: 0.8, delay: 0.1}}
              className="font-black text-[clamp(36px,6vw,88px)] leading-[0.9] uppercase tracking-tight mb-7"
          >
            Every piece,<br/>
            <em className="text-[#E31F2C] not-italic">precision</em><br/>
            placed.
          </motion.h2>

          <motion.p
              initial={{opacity: 0, y: 20}}
              animate={inView ? {opacity: 1, y: 0} : {}}
              transition={{duration: 0.8, delay: 0.2}}
              className="text-[14px] md:text-[15px] font-light text-[#6e6e73] leading-relaxed max-w-[360px]"
          >
            On a tout démonté pour vous montrer l'intérieur. Un moteur V8 biturbo sur mesure, une carte électronique de
            Formule 1, et une structure carbone qui pèse moins qu'un vélo de course.
          </motion.p>
        </div>

        {/* Video */}
        <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={inView ? {opacity: 1, scale: 1} : {}}
            transition={{delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1]}}
            className="relative h-[50vh] md:h-screen flex items-center justify-center overflow-hidden order-1 md:order-2"
        >
          <div className="relative w-full h-full overflow-hidden">
            <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-contain"
            >
              <source src="/images/explo-ressemble.mp4" type="video/mp4"/>
            </video>

            {/* Crop watermark */}
            <div className="absolute top-0 right-0 w-72 h-24 bg-white z-10"/>
          </div>

          {/* Label */}
          <div className="absolute bottom-10 md:bottom-20 right-6 md:right-10 text-right z-20">
            <div className="w-20 h-px bg-black ml-auto mb-2"/>
            <p className="text-[9px] tracking-[3px] uppercase text-[#6e6e73] leading-relaxed">
              Exploded component view<br/>Berizz GT-R
            </p>
          </div>
        </motion.div>

      </section>
  )
}