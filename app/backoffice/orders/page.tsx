'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

type Order = {
    id: string
    user_id: string
    model_id: string
    color_id: string
    packs: string[]
    total_price: number
    status: string
    created_at: string
    // joined
    model_name?: string
    color_name?: string
    user_email?: string
}

const STATUSES = [
    { key: 'en_attente',    label: 'En attente',    color: 'bg-amber-500/20 text-amber-400' },
    { key: 'confirme',      label: 'Confirmé',      color: 'bg-blue-500/20 text-blue-400' },
    { key: 'en_production', label: 'En production', color: 'bg-purple-500/20 text-purple-400' },
    { key: 'livre',         label: 'Livré',         color: 'bg-emerald-500/20 text-emerald-400' },
    { key: 'annule',        label: 'Annulé',        color: 'bg-red-500/20 text-red-400' },
]

function statusStyle(key: string) {
    return STATUSES.find(s => s.key === key) ?? { label: key, color: 'bg-white/10 text-white/50' }
}

function formatPrice(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function BackofficeOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [models, setModels] = useState<Record<string, string>>({})
    const [colors, setColors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [openId, setOpenId] = useState<string | null>(null)

    useEffect(() => {
        Promise.all([
            fetch('/api/orders').then(r => r.json()),
            fetch('/api/models').then(r => r.json()),
            fetch('/api/colors').then(r => r.json()),
        ]).then(([ordersData, modelsData, colorsData]) => {
            const modelsMap: Record<string, string> = {}
            const colorsMap: Record<string, string> = {}
            modelsData.forEach((m: any) => { modelsMap[m.id] = m.name })
            colorsData.forEach((c: any) => { colorsMap[c.id] = c.name })
            setModels(modelsMap)
            setColors(colorsMap)
            setOrders(ordersData ?? [])
            setLoading(false)
        })
    }, [])

    async function updateStatus(orderId: string, newStatus: string) {
        setUpdatingId(orderId)
        const res = await fetch('/api/orders', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, status: newStatus }),
        })
        if (res.ok) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        }
        setUpdatingId(null)
    }

    const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

    return (
        <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
            {/* Header */}
            <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                    <h1 className="font-black text-[32px] uppercase tracking-tight">Commandes</h1>
                    <p className="text-white/40 text-[13px] mt-1">{orders.length} commande{orders.length > 1 ? 's' : ''} au
                        total</p>
                </div>
                {/* Résumé statuts */}
                <div className="flex flex-wrap gap-2">
                    {STATUSES.map(s => {
                        const count = orders.filter(o => o.status === s.key).length
                        if (count === 0) return null
                        return (
                            <div key={s.key}
                                 className={`px-3 py-1.5 rounded-full text-[11px] tracking-[1px] uppercase font-medium ${s.color}`}>
                                {count} {s.label}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-2 mb-6">
                {['all', ...STATUSES.map(s => s.key)].map(key => (
                    <button
                        key={key}
                        onClick={() => setFilterStatus(key)}
                        className={`px-4 py-1.5 rounded-full text-[11px] tracking-[1px] uppercase font-medium transition-colors ${
                            filterStatus === key
                                ? 'bg-white text-black'
                                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                        }`}
                    >
                        {key === 'all' ? 'Toutes' : STATUSES.find(s => s.key === key)?.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/20 rounded-xl overflow-hidden">
                {/* Desktop */}
                <div className="hidden md:block">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-white/20">
                            <th className="px-6 py-3 text-left text-[11px] uppercase text-white/30">Commande</th>
                            <th className="px-6 py-3 text-left text-[11px] uppercase text-white/30">Modèle</th>
                            <th className="px-6 py-3 text-left text-[11px] uppercase text-white/30">Couleur</th>
                            <th className="px-6 py-3 text-left text-[11px] uppercase text-white/30">Total</th>
                            <th className="px-6 py-3 text-left text-[11px] uppercase text-white/30">Date</th>
                            <th className="px-6 py-3 text-left text-[11px] uppercase text-white/30">Statut</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                                    Chargement...
                                </td>
                            </tr>
                        ) : filtered.map(order => {
                            const st = statusStyle(order.status)
                            return (
                                <tr key={order.id} className="border-b border-white/5">
                                    <td className="px-6 py-4 text-xs">#{order.id.slice(0, 8)}</td>
                                    <td className="px-6 py-4">{models[order.model_id]}</td>
                                    <td className="px-6 py-4">{colors[order.color_id]}</td>
                                    <td className="px-6 py-4 text-[#E31F2C]">{formatPrice(order.total_price)}</td>
                                    <td className="px-6 py-4 text-white/40 text-xs">
                                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <button
                                                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] uppercase tracking-[1px] ${st.color}`}
                                                onClick={() => setOpenId(openId === order.id ? null : order.id)}
                                            >
                                                {st.label}
                                            </button>

                                            {openId === order.id && (
                                                <div
                                                    className="absolute z-50 mt-2 w-full bg-[#111] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                                                    {STATUSES.map(s => (
                                                        <div
                                                            key={s.key}
                                                            onClick={() => {
                                                                updateStatus(order.id, s.key)
                                                                setOpenId(null)
                                                            }}
                                                            className="px-3 py-2 text-[12px] hover:bg-white/10 cursor-pointer"
                                                        >
                                                            {s.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden flex flex-col divide-y divide-white/10">
                    {filtered.map(order => {
                        const st = statusStyle(order.status)
                        return (
                            <div key={order.id} className="p-4 flex flex-col gap-3">

                                <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-white/50">
                        #{order.id.slice(0, 8)}
                    </span>
                                    <span className={`text-[10px] px-2 py-1 rounded ${st.color}`}>
                        {st.label}
                    </span>
                                </div>

                                <div className="text-sm font-semibold">
                                    {models[order.model_id] ?? '—'}
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Couleur</span>
                                    <span>{colors[order.color_id] ?? '—'}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Prix</span>
                                    <span className="text-[#E31F2C]">{formatPrice(order.total_price)}</span>
                                </div>

                                <div className="text-xs text-white/40">
                                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                </div>

                                <select
                                    value={order.status}
                                    onChange={e => updateStatus(order.id, e.target.value)}
                                    className="mt-2 text-xs px-3 py-2 rounded bg-white/10"
                                >
                                    {STATUSES.map(s => (
                                        <option key={s.key} value={s.key}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
