'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: 'Performance', href: '/#performance' },
  { label: 'Technologie', href: '/#tech' },
  { label: 'Modèles', href: '/#models' },
]

const TRANSPARENT_PAGES = ['/contact', '/']
const DARK_PAGES = ['/contact', '/']
const MINIMAL_PAGES = ['/configurateur', '/contact']

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  const isTransparent = TRANSPARENT_PAGES.includes(pathname)
  const isDark = DARK_PAGES.includes(pathname)
  const isMinimal = MINIMAL_PAGES.includes(pathname)
  const isSolid = !isTransparent || scrolled || open
  const visibleLinks = isMinimal ? [] : NAV_LINKS

  const [logoClicks, setLogoClicks] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const textColor = !isSolid && isDark ? 'text-white' : 'text-black'
  const logoColor = !isSolid && isDark ? 'text-white' : 'text-black'
  const hamburgerColor = !isSolid && isDark ? 'bg-white' : 'bg-black'

  const handleLogoClick = (e) => {
    e.preventDefault()

    const newCount = logoClicks + 1
    setLogoClicks(newCount)

    if (newCount === 3) {
      router.push('/backoffice')
      setLogoClicks(0) // reset after success
    } else {
      router.push('/')
    }

    // optional: reset if user is too slow
    setTimeout(() => setLogoClicks(0), 2000)
  }

  function scrollTo(id: string) {
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
      <>
        <motion.nav
            initial={false}
            animate={{
              backgroundColor: isSolid ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0)',
              borderBottomColor: isSolid ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0)',
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-14 h-[56px] border-b backdrop-blur-2xl"
        >
          {/* Logo */}
          <Link
              href="/"
              onClick={handleLogoClick}
              className={`font-black text-xl tracking-[4px] uppercase z-50 transition-colors duration-300 ${logoColor}`}
          >
            BERIZZ<span className="text-[#E31F2C]">.</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center list-none gap-1">
            {visibleLinks.map((link) => {
              const id = link.href.replace('/#', '')
              return (
                  <li key={link.label}>
                    <button
                        onClick={() => scrollTo(id)}
                        className={`relative px-4 py-1 text-[14px] font-light tracking-[1px] hover:text-[#E31F2C] transition-colors duration-300 group ${textColor}`}
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-4 right-4 h-px bg-[#E31F2C] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </button>
                  </li>
              )
            })}

            {!isMinimal && <li className="mx-3 w-px h-4 bg-black/15" />}

            {/* Mon compte ou Login */}
            <li>
              {user ? (
                  <Link
                      href="/account"
                      className={`relative px-4 py-1 text-[12px] font-light tracking-[1px] hover:text-[#E31F2C] transition-colors duration-300 group ${textColor}`}
                  >
                    Mon compte
                    <span className="absolute bottom-0 left-4 right-4 h-px bg-[#E31F2C] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
              ) : (
                  <Link
                      href="/login"
                      className={`relative px-4 py-1 text-[12px] font-light tracking-[1px] hover:text-[#E31F2C] transition-colors duration-300 group ${textColor}`}
                  >
                    Connexion
                    <span className="absolute bottom-0 left-4 right-4 h-px bg-[#E31F2C] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
              )}
            </li>

            {!isMinimal && <li className="mx-3 w-px h-4 bg-black/15" />}

            {/* Configurer */}
            {!isMinimal && (
                <li>
                  <Link
                      href="/configurateur"
                      className={`text-[11px] font-semibold tracking-[2px] uppercase px-5 py-2 rounded-full transition-all duration-300 ${
                          isSolid || !isDark
                              ? 'text-white bg-black hover:bg-[#E31F2C]'
                              : 'text-black bg-white hover:bg-[#E31F2C] hover:text-white'
                      }`}
                  >
                    Configurer
                  </Link>
                </li>
            )}
          </ul>

          {/* Hamburger */}
          <button
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="md:hidden z-50 flex flex-col justify-center items-end gap-[5px] w-8 h-8"
          >
            <motion.span
                animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`block h-[1.5px] origin-center w-6 transition-colors duration-300 ${open ? 'bg-black' : hamburgerColor}`}
            />
            <motion.span
                animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className={`block h-[1.5px] w-[18px] transition-colors duration-300 ${open ? 'bg-black' : hamburgerColor}`}
            />
            <motion.span
                animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`block h-[1.5px] origin-center transition-colors duration-300 ${open ? 'bg-black' : hamburgerColor}`}
                style={{ width: open ? '24px' : '12px' }}
            />
          </button>
        </motion.nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 z-40 md:hidden"
              >
                <div className="absolute inset-0 bg-white" />
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 flex flex-col h-full pt-[56px] px-8 pb-12"
                >
                  <nav className="flex flex-col mt-10">
                    {visibleLinks.map((link, i) => (
                        <motion.div
                            key={link.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i + 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <Link
                              href={link.href}
                              onClick={() => setOpen(false)}
                              className="flex items-center justify-between py-5 border-b border-black/8 group"
                          >
                      <span className="font-black text-[28px] uppercase tracking-tight leading-none group-hover:text-[#E31F2C] transition-colors duration-300">
                        {link.label}
                      </span>
                            <svg width="20" height="10" viewBox="0 0 20 10" fill="none" className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                              <path d="M1 5H19M19 5L14 1M19 5L14 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          </Link>
                        </motion.div>
                    ))}

                    {pathname !== '/contact' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25, duration: 0.5 }}
                        >
                          <Link
                              href="/contact"
                              onClick={() => setOpen(false)}
                              className="flex items-center justify-between py-5 border-b border-black/8 group"
                          >
                      <span className="font-black text-[28px] uppercase tracking-tight leading-none group-hover:text-[#E31F2C] transition-colors duration-300">
                        Contact
                      </span>
                            <svg width="20" height="10" viewBox="0 0 20 10" fill="none" className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                              <path d="M1 5H19M19 5L14 1M19 5L14 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          </Link>
                        </motion.div>
                    )}

                    {/* Mon compte mobile */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <Link
                          href={user ? '/account' : '/login'}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between py-5 border-b border-black/8 group"
                      >
                    <span className="font-black text-[28px] uppercase tracking-tight leading-none group-hover:text-[#E31F2C] transition-colors duration-300">
                      {user ? 'Mon compte' : 'Connexion'}
                    </span>
                        <svg width="20" height="10" viewBox="0 0 20 10" fill="none" className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                          <path d="M1 5H19M19 5L14 1M19 5L14 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </Link>
                    </motion.div>
                  </nav>

                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.5 }}
                      className="mt-auto flex flex-col gap-3"
                  >
                    <Link
                        href="/configurateur"
                        onClick={() => setOpen(false)}
                        className="block w-full bg-black text-white text-center py-4 text-[12px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] transition-colors duration-300"
                    >
                      Configurer mon Berizz
                    </Link>
                    <p className="text-center text-[11px] font-light text-[#6e6e73] tracking-wide">
                      Showroom Paris — Av. Montaigne
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </>
  )
}