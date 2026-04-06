'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

type Order = {
    id: string
    total_price: number
    status: string
    created_at: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    en_attente:    { label: 'En attente',    color: 'bg-amber-100 text-amber-700' },
    confirme:      { label: 'Confirmé',      color: 'bg-blue-100 text-blue-700' },
    en_production: { label: 'En production', color: 'bg-purple-100 text-purple-700' },
    livre:         { label: 'Livré',         color: 'bg-emerald-100 text-emerald-700' },
    annule:        { label: 'Annulé',        color: 'bg-red-100 text-red-700' },
}

function formatPrice(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [confirmId, setConfirmId] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) return
            supabase
                .from('orders')
                .select('*')
                .eq('user_id', data.user.id)
                .order('created_at', { ascending: false })
                .then(({ data: orders }) => {
                    setOrders(orders ?? [])
                    setLoading(false)
                })
        })
    }, [])

    async function cancelOrder() {
        if (!confirmId) return
        await supabase.from('orders').update({ status: 'annule' }).eq('id', confirmId)
        setOrders(prev => prev.map(o => o.id === confirmId ? { ...o, status: 'annule' } : o))
        setConfirmId(null)
    }

    return (
        <div>
            <div className="mb-10">
                <h1 className="font-black text-[32px] uppercase tracking-tight">Mes commandes</h1>
                <p className="text-[13px] text-black/40 mt-1">
                    {orders.length} commande{orders.length > 1 ? 's' : ''}
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-black/20 border-t-[#E31F2C] rounded-full animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white border border-black/8 rounded-xl p-12 text-center">
                    <p className="text-black/40 text-[14px] mb-2">Aucune commande pour le moment.</p>
                    <p className="text-black/30 text-[12px]">Finalisez une configuration pour passer commande.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map(order => {
                        const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-black/5 text-black/50' }
                        return (
                            <div key={order.id} className="bg-white border border-black/8 rounded-xl p-6 flex items-center justify-between">
                                <div>
                                    <div className="font-black text-[16px] uppercase tracking-tight">
                                        Commande #{order.id.slice(0, 8)}
                                    </div>
                                    <div className="text-[12px] text-black/40 mt-1">
                                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                  <span className={`text-[10px] tracking-[2px] uppercase px-3 py-1.5 rounded-full font-medium ${status.color}`}>
                    {status.label}
                  </span>
                                    <div className="text-right">
                                        <div className="text-[10px] tracking-[2px] uppercase text-black/40">Total</div>
                                        <div className="font-black text-[20px] text-[#E31F2C]">{formatPrice(order.total_price)}</div>
                                    </div>
                                    {order.status === 'en_attente' && (
                                        <button
                                            onClick={() => setConfirmId(order.id)}
                                            className="border border-black/20 text-black/40 px-5 py-2 text-[11px] font-light tracking-[2px] uppercase rounded-full hover:border-[#E31F2C] hover:text-[#E31F2C] transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal annulation */}
            {confirmId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
                    onClick={() => setConfirmId(null)}
                >
                    <div
                        className="bg-white rounded-2xl p-8 w-full max-w-sm mx-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h2 className="font-black text-[20px] uppercase tracking-tight mb-2">
                            Annuler la commande ?
                        </h2>
                        <p className="text-[13px] text-black/40 leading-relaxed mb-8">
                            Cette commande passera au statut "Annulé". Notre équipe sera notifiée.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelOrder}
                                className="flex-1 bg-black text-white py-3 rounded-full text-[11px] font-semibold tracking-[2px] uppercase hover:bg-[#E31F2C] transition-colors"
                            >
                                Confirmer
                            </button>
                            <button
                                onClick={() => setConfirmId(null)}
                                className="flex-1 border border-black/20 text-black/50 py-3 rounded-full text-[11px] font-light tracking-[2px] uppercase hover:border-black hover:text-black transition-colors"
                            >
                                Retour
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}