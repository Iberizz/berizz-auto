'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

const NAV = [
    { label: 'Tableau de bord', href: '/account' },
    { label: 'Mes configurations', href: '/account/configurations' },
    { label: 'Mes messages', href: '/account/messages' },
    { label: 'Mes commandes', href: '/account/orders' },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7]">

            {/* Top bar */}
            <header className="bg-white border-b border-black/10 px-8 md:px-20 h-[56px] flex items-center justify-between">
                <Link href="/" className="font-black text-xl tracking-[4px] uppercase">
                    BERIZZ<span className="text-[#E31F2C]">.</span>
                </Link>
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-6">
                        {NAV.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-[12px] tracking-[1px] uppercase font-medium transition-colors ${
                                    pathname === item.href ? 'text-[#E31F2C]' : 'text-black/50 hover:text-black'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <button
                        onClick={handleLogout}
                        className="text-[11px] tracking-[2px] uppercase text-black/40 hover:text-[#E31F2C] transition-colors"
                    >
                        Déconnexion
                    </button>
                </div>
            </header>

            <main className="px-8 md:px-20 py-12">
                {children}
            </main>
        </div>
    )
}