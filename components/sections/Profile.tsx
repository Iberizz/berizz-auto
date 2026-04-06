"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";

const hotspots = [
  {
    id: 1,
    label: "Aileron actif",
    sub: "Déploiement automatique à 200km/h",
    x: "63%",
    y: "40%",
    image: "/images/profile-aileron.png",
  },
  {
    id: 2,
    label: "Cx 0.24",
    sub: "Validé en soufflerie 400h",
    x: "30%",
    y: "70%",
    image: "/images/profile-cx.png",
  },
  {
    id: 3,
    label: "Carbone forgé",
    sub: "Structure 40% plus légère que l'acier",
    x: "33%",
    y: "49%",
    image: "/images/profile-carbone.png",
  },
  {
    id: 4,
    label: "Diffuseur armé",
    sub: "Appui aérodynamique 180kg à 300km/h",
    x: "72%",
    y: "71%",
    image: "/images/profile-diffuseur.png",
  },
];

export default function Profile() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [dragStart, setDragStart] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const active = activeHotspot !== null ? hotspots[activeHotspot - 1] : null;

  const goTo = (index: number) => {
    setActiveCard(Math.max(0, Math.min(hotspots.length - 1, index)));
  };

  return (
      <section
          id="performance"
          className="relative bg-black overflow-hidden"
          ref={ref}
      >

        {/* ===================== MOBILE ===================== */}
        <div className="flex flex-col min-h-screen md:hidden">

          {/* TOP 60% — Image + Texte */}
          <div className="relative flex-[6] flex flex-col justify-end pb-8 px-7 min-h-0">

            {/* Image de fond */}
            <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 1.4 }}
                className="absolute inset-0"
            >
              <Image
                  src="/images/profile-main.png"
                  alt="Berizz GT-R"
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  priority
              />
              {/* Gradient fort en bas pour lisibilité du texte */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
            </motion.div>

            {/* Texte */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.3 }}
                className="relative z-10"
            >
            <span className="text-[10px] tracking-[5px] uppercase text-[#E31F2C] mb-4 block">
              001 / Design
            </span>

              <h2 className="font-black text-[clamp(40px,11vw,64px)] leading-[0.88] uppercase tracking-tight mb-4 text-white">
                Chaque<br />
                ligne,<br />
                <em className="text-[#E31F2C] not-italic">calculée.</em>
              </h2>

              <p className="text-[13px] text-white/45 leading-relaxed max-w-[280px]">
                Pas un centimètre carré au hasard. La carrosserie Berizz est
                sculptée par le vent, validée en soufflerie pendant 400 heures.
              </p>
            </motion.div>
          </div>

          {/* BOTTOM 40% — Carrousel */}
          <div className="flex-[4] bg-black flex flex-col justify-center px-5 py-5 gap-4 min-h-0">

            {/* Progress + compteur */}
            <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[4px] uppercase text-white/30 font-light">
              {String(activeCard + 1).padStart(2, "0")} /{" "}
              {String(hotspots.length).padStart(2, "0")}
            </span>
              <div className="flex gap-2">
                {hotspots.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className="relative h-[3px] rounded-full overflow-hidden transition-all duration-300"
                        style={{
                          width: activeCard === i ? 24 : 8,
                          background: "rgba(255,255,255,0.15)",
                        }}
                    >
                      {activeCard === i && (
                          <motion.div
                              layoutId="dot-active"
                              className="absolute inset-0 bg-[#E31F2C] rounded-full"
                          />
                      )}
                    </button>
                ))}
              </div>
            </div>

            {/* Card swipeable */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragStart={(_, info) => setDragStart(info.point.x)}
                onDragEnd={(_, info) => {
                  const delta = info.point.x - dragStart;
                  if (delta < -40) goTo(activeCard + 1);
                  else if (delta > 40) goTo(activeCard - 1);
                }}
                className="cursor-grab active:cursor-grabbing"
            >
              <AnimatePresence mode="wait">
                <motion.div
                    key={activeCard}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl flex"
                >
                  {/* Image à gauche */}
                  <div className="relative w-28 flex-shrink-0">
                    <Image
                        src={hotspots[activeCard].image}
                        alt={hotspots[activeCard].label}
                        fill
                        className="object-cover"
                    />
                    {/* Badge numéro */}
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[#E31F2C] flex items-center justify-center shadow-[0_0_12px_rgba(227,31,44,0.5)]">
                    <span className="text-[9px] font-black text-white">
                      {hotspots[activeCard].id}
                    </span>
                    </div>
                  </div>

                  {/* Texte à droite */}
                  <div className="flex-1 px-4 py-4 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] tracking-[3px] uppercase text-[#E31F2C] font-medium mb-1.5">
                        {hotspots[activeCard].label}
                      </div>
                      <div className="text-[12px] text-white/55 font-light leading-relaxed">
                        {hotspots[activeCard].sub}
                      </div>
                    </div>

                    {/* Flèches */}
                    <div className="flex gap-2 mt-3">
                      <button
                          onClick={() => goTo(activeCard - 1)}
                          disabled={activeCard === 0}
                          className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center disabled:opacity-20 hover:border-[#E31F2C] transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M7.5 2L3.5 6L7.5 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                          onClick={() => goTo(activeCard + 1)}
                          disabled={activeCard === hotspots.length - 1}
                          className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center disabled:opacity-20 hover:border-[#E31F2C] transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M4.5 2L8.5 6L4.5 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* ===================== DESKTOP ===================== */}
        <div className="hidden md:flex min-h-screen items-center">

          {/* Image de fond */}
          <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1.4 }}
              className="absolute inset-0"
          >
            <Image
                src="/images/profile-main.png"
                alt="Berizz GT-R"
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          </motion.div>

          {/* Texte desktop */}
          <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              className="relative z-20 pl-20 pr-10 max-w-[420px]"
          >
          <span className="text-[11px] tracking-[5px] uppercase text-[#E31F2C] mb-5 block">
            001 / Design
          </span>

            <h2 className="font-black text-[clamp(40px,7vw,96px)] leading-[0.9] uppercase tracking-tight mb-7 text-white">
              Chaque<br />
              ligne,<br />
              <em className="text-[#E31F2C] not-italic">calculée.</em>
            </h2>

            <p className="text-[15px] text-white/50 leading-relaxed max-w-[320px]">
              Pas un centimètre carré au hasard. La carrosserie Berizz est sculptée
              par le vent, validée en soufflerie pendant 400 heures.
            </p>

            {/* Panel desktop */}
            <motion.div
                animate={{ opacity: active ? 1 : 0, y: active ? 0 : 10 }}
                transition={{ duration: 0.3 }}
                className="mt-8 border-l-2 border-[#E31F2C] pl-4 min-h-[160px]"
            >
              {active && (
                  <>
                    <div className="text-[11px] tracking-[3px] uppercase text-[#E31F2C] mb-1">
                      {active.label}
                    </div>
                    <div className="text-[13px] text-white/60 font-light mb-4">
                      {active.sub}
                    </div>
                    <motion.div
                        key={active.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="w-52 h-36 relative rounded overflow-hidden border border-white/10"
                    >
                      <Image src={active.image} alt={active.label} fill className="object-cover" />
                    </motion.div>
                  </>
              )}
            </motion.div>
          </motion.div>

          {/* Hotspots desktop */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {hotspots.map((h, i) => {
              const y = useTransform(scrollYProgress, [0, 1], [0, -40 * (i + 1)]);
              const x = useTransform(scrollYProgress, [0, 1], [0, 20 * (i % 2 === 0 ? 1 : -1)]);

              return (
                  <motion.div
                      key={h.id}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 1 + i * 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute pointer-events-auto cursor-pointer"
                      style={{ left: h.x, top: h.y, x, y }}
                      onClick={() => setActiveHotspot(h.id)}
                  >
                    <div className="relative flex items-start">
                      <motion.div
                          animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className="absolute w-5 h-5 rounded-full bg-[#E31F2C]"
                      />
                      <div className="relative w-4 h-4 rounded-full flex items-center justify-center z-10 bg-[#E31F2C] border-2 border-white/30">
                        <span className="text-[8px] font-black text-white">{h.id}</span>
                      </div>
                      <div className="absolute left-0 -top-12 flex flex-col items-start">
                    <span className={`text-[10px] font-medium tracking-[3px] uppercase whitespace-nowrap mb-1 transition-colors duration-300 ${activeHotspot === h.id ? "text-[#E31F2C]" : "text-white/70"}`}>
                      {h.label}
                    </span>
                        <svg width="30" height="20" viewBox="0 0 30 20">
                          <path d="M30 0 L8 0 L8 20" stroke="white" strokeOpacity="0.5" strokeWidth="1"/>
                        </svg>
                      </div>
                    </div>
                  </motion.div>
              );
            })}
          </div>
        </div>
      </section>
  );
}