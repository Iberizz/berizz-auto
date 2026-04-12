'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

export default function AccountPage() {
    const [user, setUser] = useState<User | null>(null)
    const [stats, setStats] = useState({ configs: 0, messages: 0, orders: 0 })

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
            if (data.user) {
                Promise.all([
                    supabase.from('configurations').select('id', { count: 'exact' }).eq('user_id', data.user.id),
                    supabase.from('contacts').select('id', { count: 'exact' }).eq('user_id', data.user.id),
                    supabase.from('orders').select('id', { count: 'exact' }).eq('user_id', data.user.id),
                ]).then(([configs, messages, orders]) => {
                    setStats({
                        configs: configs.count ?? 0,
                        messages: messages.count ?? 0,
                        orders: orders.count ?? 0,
                    })
                })
            }
        })
    }, [])

    const CARDS = [
        { label: 'Configurations', value: stats.configs, href: '/account/configurations', desc: 'Vos Berizz configurés' },
        { label: 'Messages', value: stats.messages, href: '/account/messages', desc: 'Vos demandes envoyées' },
        { label: 'Commandes', value: stats.orders, href: '/account/orders', desc: 'Suivi de vos commandes' },
    ]

    return (
        <div>
            <div className="mb-10">
                <h1 className="font-black text-[32px] uppercase tracking-tight">
                    Bonjour<span className="text-[#E31F2C]">.</span>
                </h1>
                <p className="text-[13px] text-black/40 mt-1">{user?.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                {CARDS.map(card => (
                    <Link key={card.href} href={card.href}
                          className="bg-white border border-black/8 rounded-xl p-6 hover:border-[#E31F2C]/30 transition-colors group"
                    >
                        <div className="text-[11px] tracking-[3px] uppercase text-black/40 mb-2">{card.label}</div>
                        <div className="font-black text-[40px] leading-none text-[#E31F2C] mb-1">{card.value}</div>
                        <div className="text-[12px] text-black/40">{card.desc}</div>
                    </Link>
                ))}
            </div>

            <div className="bg-black text-white rounded-xl p-8 flex items-center justify-between">
                <div>
                    <div className="text-[11px] tracking-[3px] uppercase text-white/40 mb-2">Prêt à configurer ?</div>
                    <div className="font-black text-[22px] uppercase tracking-tight">Créez votre Berizz idéal</div>
                </div>
                <Link href="/configurateur"
                      className="bg-[#E31F2C] text-white px-8 py-3 text-[11px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-white hover:text-black transition-colors duration-300"
                >
                    Configurer
                </Link>
            </div>
        </div>
    )
}