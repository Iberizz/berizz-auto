'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const LINKS = [
    { label: 'Performance', href: '/#performance' },
    { label: 'Technologie', href: '/#tech' },
    { label: 'Modèles', href: '/#models' },
    { label: 'Configurateur', href: '/configurateur' },
    { label: 'Contact', href: '/contact' },
]

const LEGAL = [
    { label: 'Mentions légales', href: '#' },
    { label: 'Confidentialité', href: '#' },
]

export default function Footer() {
    return (
        <footer className="bg-black text-white border-t border-white/20">

            {/* Main */}
            <div className="px-8 md:px-20 py-16 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-12">

                {/* Logo + tagline */}
                <div className="flex flex-col gap-6">
                    <Link href="/" className="font-black text-2xl tracking-[4px] uppercase w-fit">
                        BERIZZ<span className="text-[#E31F2C]">.</span>
                    </Link>
                    <p className="text-[13px] font-light text-white/40 leading-relaxed max-w-[220px]">
                        Rebuilt from the road up.<br />Engineered for pure sensation.
                    </p>
                    {/* Showroom */}
                    <div className="text-[11px] text-white/30 leading-relaxed">
                        <div className="text-[10px] tracking-[3px] uppercase text-[#E31F2C] mb-2">Showroom</div>
                        12 Avenue Montaigne<br />
                        75008 Paris, France
                    </div>
                </div>

                {/* Nav */}
                <div>
                    <div className="text-[10px] tracking-[3px] uppercase text-white/30 mb-6">Navigation</div>
                    <ul className="flex flex-col gap-3">
                        {LINKS.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    className="text-[14px] font-light text-white/60 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-6">
                    <div className="text-[10px] tracking-[3px] uppercase text-white/30 mb-0">Votre Berizz</div>
                    <p className="text-[13px] font-light text-white/40 leading-relaxed">
                        Configurez votre véhicule sur mesure ou prenez rendez-vous avec nos conseillers.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/configurateur"
                            className="bg-white text-black px-6 py-3 text-[11px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] hover:text-white transition-colors duration-300 text-center"
                        >
                            Configurer
                        </Link>
                        <Link
                            href="/contact"
                            className="border border-white/20 text-white/60 px-6 py-3 text-[11px] font-light tracking-[2px] uppercase rounded-full hover:border-[#E31F2C] hover:text-[#E31F2C] transition-colors duration-300 text-center"
                        >
                            Prendre RDV
                        </Link>
                    </div>
                </div>

            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/20 px-8 md:px-20 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] font-light text-white/25 tracking-wide">
                    © 2025 Berizz Auto. Tous droits réservés.
                </p>
                <div className="flex items-center gap-6">
                    {LEGAL.map((l) => (
                        <a
                        key={l.label}
                        href={l.href}
                        className="text-[11px] font-light text-white/25 hover:text-white/50 transition-colors"
                        >
                    {l.label}
                        </a>
                        ))}
                </div>
            </div>

        </footer>
    )
}