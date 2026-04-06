'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from "next/link";

export default function CTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
      <section
          id="cta"
          className="relative min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center text-center px-6 md:px-20 py-24 md:py-40 overflow-hidden"
          ref={ref}
      >

        {/* Background word */}
        <span className="absolute font-black text-[30vw] uppercase tracking-tight text-black/[0.03] pointer-events-none leading-none top-1/2 -translate-y-1/2 select-none">
        BERIZZ
      </span>

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9 }}
              className="font-black text-[clamp(48px,10vw,140px)] uppercase tracking-tight leading-[0.88] mb-6 md:mb-8"
          >
            Configurez<br />
            votre <em className="text-[#E31F2C] not-italic">vision.</em>
          </motion.h2>

          <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.8 }}
              className="text-[15px] md:text-[18px] font-light text-[#6e6e73] max-w-xl mx-auto mb-10 md:mb-14 leading-relaxed px-2"
          >
            Chaque Berizz est unique. Travaillez avec nos designers pour créer la voiture exactement comme vous l'imaginez.
          </motion.p>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
                href="/configurateur"
                className="w-full sm:w-auto bg-black text-white px-10 py-4 md:px-12 md:py-5 text-[12px] md:text-[13px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] transition-colors duration-300 text-center"
            >
              Démarrer la configuration
            </Link>
            <Link
                href="/contact"
                className="w-full sm:w-auto bg-transparent text-black px-10 py-4 md:px-12 md:py-5 text-[12px] md:text-[13px] font-light tracking-[2px] uppercase border border-black/25 rounded-full hover:border-[#E31F2C] hover:text-[#E31F2C] transition-colors duration-300 text-center"
            >
              Prendre rendez-vous
            </Link>
          </motion.div>
        </div>
      </section>
  )
}