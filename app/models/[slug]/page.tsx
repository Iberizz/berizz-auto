'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { useParams, useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
type Color = { id: string; name: string; hex: string; price: number }
type ModelColorImage = { color_id: string; image_path: string; is_default: boolean; colors: Color }
type Pack = { id: string; name: string; description: string; price: number; icon: string; image: string }
type RelatedModel = { id: string; name: string; slug: string; image: string; tagline: string; base_price: number }
type Model = {
  id: string
  slug: string
  name: string
  tagline: string
  base_price: number
  image: string
  description: string
  acceleration: string
  power: string
  top_speed: string
  weight: string
  model_color_images: ModelColorImage[]
  packs: Pack[]
  related_models: RelatedModel[]
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedValue({ value }: { value: string }) {
  const [display, setDisplay] = useState(value)
  const [triggered, setTriggered] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered) setTriggered(true)
    }, { threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [triggered])

  useEffect(() => {
    if (!triggered) return
    const numericMatch = value?.match(/[\d.]+/)
    const numeric = numericMatch ? parseFloat(numericMatch[0]) : null
    const suffix = value?.replace(/[\d.]+/, '') ?? ''
    if (numeric === null) { setDisplay(value); return }
    const duration = 1200
    const steps = 40
    const stepDuration = duration / steps
    let current = 0
    const increment = numeric / steps
    const timer = setInterval(() => {
      current += increment
      if (current >= numeric) { setDisplay(value); clearInterval(timer); return }
      const decimals = value.includes('.') ? 1 : 0
      setDisplay(current.toFixed(decimals) + suffix)
    }, stepDuration)
    return () => clearInterval(timer)
  }, [triggered, value])

  return <span ref={ref}>{display}</span>
}

export default function ModelPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const heroRef = useRef(null)

  const { scrollYProgress } = useScroll({ offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const [showSticky, setShowSticky] = useState(false)
  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const [model, setModel] = useState<Model | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)
  const [activeGallery, setActiveGallery] = useState(0)

  useEffect(() => {
    fetch(`/api/models/slug/${slug}`)
        .then(r => { if (!r.ok) { router.replace('/'); return null } return r.json() })
        .then(data => {
          if (!data) return
          setModel(data)
          const defaultImg = data.model_color_images?.find((ci: ModelColorImage) => ci.is_default)
          setSelectedColor(defaultImg?.colors ?? data.model_color_images?.[0]?.colors ?? null)
          setLoading(false)
        })
  }, [slug, router])

  const colors = model?.model_color_images?.map(ci => ci.colors).filter(Boolean) ?? []
  const galleryImages = model?.model_color_images?.map(ci => ci.image_path) ?? []
  const currentImage = selectedColor
      ? model?.model_color_images?.find(ci => ci.color_id === selectedColor.id)?.image_path ?? model?.image ?? ''
      : model?.image ?? ''
  const totalPrice = model && selectedColor ? model.base_price + (selectedColor.price ?? 0) : model?.base_price ?? 0

  if (loading) return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Navbar />
        <div className="w-8 h-8 border-2 border-black/20 border-t-[#E31F2C] rounded-full animate-spin" />
      </main>
  )

  if (!model || !selectedColor) return null

  const specs = [
    { label: '0 – 100 km/h', value: model.acceleration },
    { label: 'Puissance max', value: model.power },
    { label: 'Vitesse de pointe', value: model.top_speed },
    { label: 'Poids à vide', value: model.weight },
  ]

  return (
      <main className="bg-white min-h-screen">
        <Navbar />

        {/* ── STICKY BAR ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showSticky && (
              <motion.div
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/10 px-8 md:px-20 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <span className="font-black text-[18px] uppercase tracking-tight">{model.name}</span>
                  <span className="text-[12px] text-[#6e6e73] hidden md:block">{model.tagline}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-bold text-[16px] tracking-tight hidden md:block">{formatPrice(totalPrice)}</span>
                  <Link
                      href={`/configurateur?model=${model.id}`}
                      className="bg-[#E31F2C] text-white px-6 py-2 text-[11px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-black transition-colors duration-300"
                  >
                    Configurer
                  </Link>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* ── HERO ─────────────────────────────────────────────────────────────── */}
        <section ref={heroRef} className="relative h-screen bg-gradient-to-br from-[#d0d0d0] via-[#e8e8e8] to-[#d0d0d0] overflow-hidden pt-[52px]">
          <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute top-[68px] left-8 md:left-12 z-20"
          >
            <Link href="/#models" className="flex items-center gap-2 text-[11px] tracking-[3px] uppercase text-black/50 hover:text-[#E31F2C] transition-colors">
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <path d="M19 5H1M1 5L6 1M1 5L6 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Retour gamme
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            <div className="flex flex-col justify-center pl-8 md:pl-20 pr-6 md:pr-10 z-10">
              <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] mb-4"
              >
                {model.tagline}
              </motion.p>
              <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.9 }}
                  className="font-black text-[clamp(56px,8vw,120px)] leading-[0.85] tracking-tight uppercase"
              >
                {model.name}
              </motion.h1>

              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="mt-6 flex items-center gap-4"
              >
                <span className="text-[11px] tracking-[3px] uppercase text-black/40">Couleur</span>
                <div className="flex gap-2">
                  {colors.map(color => (
                      <button
                          key={color.id}
                          onClick={() => setSelectedColor(color)}
                          title={color.name}
                          className={`w-6 h-6 rounded-full transition-all duration-300 ${selectedColor?.id === color.id ? 'ring-2 ring-black ring-offset-2 scale-110' : 'hover:scale-110'}`}
                          style={{ backgroundColor: color.hex, border: '1px solid rgba(0,0,0,0.15)' }}
                      />
                  ))}
                </div>
                <span className="text-[12px] text-black/50">{selectedColor.name}</span>
              </motion.div>

              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Link
                    href={`/configurateur?model=${model.id}`}
                    className="bg-black text-white px-8 py-3 text-[12px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] transition-colors duration-300 text-center"
                >
                  Configurer
                </Link>
                <Link
                    href="/contact"
                    className="border border-black/25 text-black px-8 py-3 text-[12px] font-light tracking-[2px] uppercase rounded-full hover:border-[#E31F2C] hover:text-[#E31F2C] transition-colors duration-300 text-center"
                >
                  Prendre RDV
                </Link>
              </motion.div>

              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="mt-10 pt-8 border-t border-black/10"
              >
                <p className="text-[10px] tracking-[3px] uppercase text-[#6e6e73] mb-1">À partir de</p>
                <p className="font-black text-[32px] tracking-tight">{formatPrice(totalPrice)}</p>
              </motion.div>
            </div>

            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative h-full hidden md:block">
              <AnimatePresence mode="wait">
                <motion.div
                    key={currentImage}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full h-full"
                >
                  <Image src={currentImage} alt={model.name} fill className="object-contain" priority />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] tracking-[4px] uppercase text-black/40 font-light">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-black/40 to-transparent animate-pulse"/>
          </motion.div>
        </section>

        {/* ── SPECS ────────────────────────────────────────────────────────────── */}
        <section className="bg-black text-white py-28 md:py-40 px-8 md:px-20">
          <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="mb-16"
          >
            <span className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] block mb-4">Caractéristiques</span>
            <h2 className="font-black text-[clamp(40px,5vw,72px)] uppercase tracking-tight leading-[0.95]">
              Des chiffres qui<br />
              <em className="text-[#E31F2C] not-italic">ne mentent pas.</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 max-w-5xl">
            {specs.map((spec, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i + 0.2, duration: 0.8 }}
                    className="bg-black py-10 md:py-16 px-6 md:px-10 group relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E31F2C] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <div className="font-black text-[clamp(32px,4vw,56px)] leading-none tracking-tight">
                    {spec.value
                        ? <AnimatedValue value={spec.value} />
                        : <span className="text-white/20">—</span>
                    }
                  </div>
                  <div className="text-[10px] md:text-[11px] font-light tracking-[3px] uppercase text-white/40 mt-3">{spec.label}</div>
                </motion.div>
            ))}
          </div>
        </section>

        {/* ── DESCRIPTION ──────────────────────────────────────────────────────── */}
        {model.description && (
            <section className="bg-white py-28 md:py-40 px-8 md:px-20">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] block mb-4">ADN</span>
                  <h2 className="font-black text-[clamp(36px,4vw,60px)] uppercase tracking-tight leading-[0.95] mb-8">
                    L'âme de la<br />
                    <em className="text-[#E31F2C] not-italic">{model.name}.</em>
                  </h2>
                  <p className="text-[16px] font-light text-[#6e6e73] leading-relaxed">{model.description}</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative h-64 md:h-80 bg-[#f5f5f7] overflow-hidden"
                >
                  <Image src={currentImage} alt={model.name} fill className="object-contain mix-blend-multiply p-8" />
                  <div className="absolute top-4 right-4 w-16 h-16 border border-[#E31F2C]/20 rounded-full" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 bg-[#E31F2C]/10 rounded-full" />
                </motion.div>
              </div>
            </section>
        )}

        {/* ── GALERIE ──────────────────────────────────────────────────────────── */}
        <section className="bg-[#f5f5f7] py-28 md:py-40 px-8 md:px-20">
          <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="mb-12"
          >
            <span className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] block mb-4">Galerie</span>
            <h2 className="font-black text-[clamp(40px,5vw,72px)] uppercase tracking-tight leading-[0.95]">
              Toutes les<br />
              <em className="text-[#E31F2C] not-italic">teintes.</em>
            </h2>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-[16/9] bg-[#e8e8e8] overflow-hidden mb-4"
          >
            <AnimatePresence mode="wait">
              <motion.div
                  key={galleryImages[activeGallery]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
              >
                <Image
                    src={galleryImages[activeGallery] ?? model.image}
                    alt={`${model.name} vue ${activeGallery + 1}`}
                    fill
                    className="object-contain"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-4 right-4 text-right">
              <div className="w-8 h-px bg-black/30 ml-auto mb-1"/>
              <p className="text-[10px] tracking-[3px] uppercase text-black/50">
                {colors[activeGallery]?.name ?? ''}
              </p>
            </div>
          </motion.div>

          <div className={`grid gap-3 ${galleryImages.length <= 4 ? 'grid-cols-4' : 'grid-cols-4 md:grid-cols-5'}`}>
            {galleryImages.map((img, i) => (
                <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i + 0.4, duration: 0.6 }}
                    onClick={() => { setActiveGallery(i); setSelectedColor(colors[i] ?? selectedColor) }}
                    className={`relative aspect-[4/3] overflow-hidden border-2 transition-all duration-300 ${activeGallery === i ? 'border-[#E31F2C]' : 'border-transparent'}`}
                >
                  <Image src={img} alt={`Vue ${i + 1}`} fill className="object-contain bg-[#e8e8e8]" />
                  {activeGallery === i && <div className="absolute inset-0 bg-[#E31F2C]/10" />}
                  <div
                      className="absolute bottom-2 right-2 w-3 h-3 rounded-full border border-white/50"
                      style={{ backgroundColor: colors[i]?.hex ?? '#ccc' }}
                  />
                </motion.button>
            ))}
          </div>
        </section>

        {/* ── COLOR SELECTOR ───────────────────────────────────────────────────── */}
        <section className="bg-white py-28 md:py-40 px-8 md:px-20 border-t border-black/8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
            >
              <span className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] block mb-4">Couleurs</span>
              <h2 className="font-black text-[clamp(40px,5vw,72px)] uppercase tracking-tight leading-[0.95] mb-8">
                Votre<br />
                <em className="text-[#E31F2C] not-italic">signature.</em>
              </h2>
              <div className="flex flex-wrap gap-6">
                {colors.map((color) => (
                    <button
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className="flex flex-col items-center gap-2 group"
                    >
                      <div
                          className="relative w-10 h-10 rounded-full transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: color.hex, border: '2px solid rgba(0,0,0,0.08)' }}
                      >
                        {selectedColor?.id === color.id && (
                            <motion.div layoutId="colorRing" className="absolute inset-[-5px] rounded-full border-2 border-[#E31F2C]" />
                        )}
                      </div>
                      <span className={`text-[10px] tracking-[2px] uppercase transition-colors duration-200 ${selectedColor?.id === color.id ? 'text-black font-semibold' : 'text-[#6e6e73] font-light'}`}>
                    {color.name}
                  </span>
                      {color.price > 0 && (
                          <span className="text-[10px] text-[#E31F2C]">+{formatPrice(color.price)}</span>
                      )}
                    </button>
                ))}
              </div>
              <motion.p
                  key={selectedColor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-[13px] font-light text-[#6e6e73] border-l-2 border-[#E31F2C] pl-4"
              >
                Couleur sélectionnée : <span className="font-semibold text-black">{selectedColor.name}</span>
                {selectedColor.price > 0 && <span className="text-[#E31F2C] ml-2">+{formatPrice(selectedColor.price)}</span>}
              </motion.p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                  key={selectedColor.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden bg-[#f5f5f7]"
              >
                <Image
                    src={model.model_color_images.find(ci => ci.color_id === selectedColor.id)?.image_path ?? model.image}
                    alt={selectedColor.name}
                    fill
                    className="object-contain mix-blend-multiply p-8"
                />
                <div className="absolute bottom-6 right-6 text-right">
                  <div className="w-12 h-px bg-black/30 ml-auto mb-1"/>
                  <p className="text-[10px] tracking-[3px] uppercase text-[#6e6e73]">{selectedColor.name}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ── PACKS ────────────────────────────────────────────────────────────── */}
        {model.packs && model.packs.length > 0 && (
            <section className="bg-[#0a0a0a] text-white py-28 md:py-40 px-8 md:px-20">
              <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9 }}
                  className="mb-16"
              >
                <span className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] block mb-4">Options</span>
                <h2 className="font-black text-[clamp(40px,5vw,72px)] uppercase tracking-tight leading-[0.95]">
                  Personnalisez<br />
                  <em className="text-[#E31F2C] not-italic">votre vision.</em>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
                {model.packs.map((pack, i) => (
                    <motion.div
                        key={pack.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08 * i + 0.2, duration: 0.8 }}
                        className="bg-[#0a0a0a] p-8 md:p-10 group relative overflow-hidden hover:bg-[#111] transition-colors duration-300"
                    >
                      {pack.image && (
                          <div className="relative w-full aspect-[16/9] mb-6 overflow-hidden bg-white/5">
                            <Image src={pack.image} alt={pack.name} fill className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                          </div>
                      )}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          {pack.icon && <span className="text-2xl mb-2 block">{pack.icon}</span>}
                          <h3 className="font-black text-[20px] uppercase tracking-tight">{pack.name}</h3>
                        </div>
                        <span className="text-[#E31F2C] font-bold text-[18px] tracking-tight whitespace-nowrap ml-4">
                    +{formatPrice(pack.price)}
                  </span>
                      </div>
                      <p className="text-[13px] font-light text-white/50 leading-relaxed">{pack.description}</p>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E31F2C] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </motion.div>
                ))}
              </div>

              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-12 text-center"
              >
                <Link
                    href={`/configurateur?model=${model.id}`}
                    className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 text-[12px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] hover:text-white transition-colors duration-300"
                >
                  Configurer avec mes options
                  <svg width="14" height="7" viewBox="0 0 20 10" fill="none">
                    <path d="M1 5H19M19 5L14 1M19 5L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </Link>
              </motion.div>
            </section>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────────────── */}
        <section className="relative bg-black text-white py-40 px-8 md:px-20 text-center overflow-hidden">
        <span className="absolute font-black text-[30vw] uppercase tracking-tight text-white/[0.03] pointer-events-none leading-none top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 select-none whitespace-nowrap">
          BERIZZ
        </span>
          <div className="relative z-10">
            <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
                className="font-black text-[clamp(48px,8vw,120px)] uppercase tracking-tight leading-[0.88] mb-8"
            >
              Elle vous<br />
              <em className="text-[#E31F2C] not-italic">attend.</em>
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.8 }}
                className="text-[18px] font-light text-white/50 max-w-md mx-auto mb-12 leading-relaxed"
            >
              Configurez votre {model.name} ou prenez rendez-vous avec un conseiller Berizz.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                  href={`/configurateur?model=${model.id}`}
                  className="bg-white text-black px-12 py-5 text-[13px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] hover:text-white transition-colors duration-300"
              >
                Configurer ma {model.name}
              </Link>
              <Link
                  href="/contact"
                  className="bg-transparent text-white px-12 py-5 text-[13px] font-light tracking-[2px] uppercase border border-white/25 rounded-full hover:border-[#E31F2C] hover:text-[#E31F2C] transition-colors duration-300"
              >
                Prendre rendez-vous
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── DÉCOUVRIR AUSSI ──────────────────────────────────────────────────── */}
        {model.related_models && model.related_models.length > 0 && (
            <section className="bg-white py-28 md:py-40 px-8 md:px-20 border-t border-black/8">
              <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9 }}
                  className="mb-16"
              >
                <span className="text-[11px] font-medium tracking-[5px] uppercase text-[#E31F2C] block mb-4">La gamme</span>
                <h2 className="font-black text-[clamp(40px,5vw,72px)] uppercase tracking-tight leading-[0.95]">
                  Découvrir<br />
                  <em className="text-[#E31F2C] not-italic">aussi.</em>
                </h2>
              </motion.div>

              <div className="flex flex-col divide-y divide-[#d2d2d7]">
                {model.related_models.map((m, i) => (
                    <Link href={`/models/${m.slug}`} key={m.id}>
                      <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * i + 0.2, duration: 0.8 }}
                          className="py-8 hover:bg-[#f5f5f7] transition-colors group cursor-pointer px-4 md:px-0"
                      >
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
                        Découvrir
                        <svg width="14" height="7" viewBox="0 0 20 10" fill="none">
                          <path d="M1 5H19M19 5L14 1M19 5L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </span>
                          </div>
                        </div>

                        <div className="flex md:hidden items-center gap-4">
                          <span className="text-[11px] font-light tracking-[2px] text-[#6e6e73] w-6">{String(i + 1).padStart(2, '0')}</span>
                          <div className="relative w-[90px] h-[60px] flex-shrink-0">
                            <Image src={m.image} alt={m.name} fill sizes="90px" className="object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1">
                            <div className="font-black text-[20px] uppercase tracking-tight leading-none group-hover:text-[#E31F2C] transition-colors duration-300">{m.name}</div>
                            <div className="text-[11px] font-light text-[#6e6e73] mt-0.5">{m.tagline}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-light text-[#6e6e73]">À partir de</div>
                            <div className="font-bold text-[14px]">{formatPrice(m.base_price)}</div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                ))}
              </div>
            </section>
        )}

        <Footer />
      </main>
  )
}
