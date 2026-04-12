'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import Link from 'next/link'

type Config = {
    id: string
    model_id: string
    color_id: string
    packs: string[]
    total_price: number
    created_at: string
}

function formatPrice(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function ConfigurationsPage() {
    const [configs, setConfigs] = useState<Config[]>([])
    const [loading, setLoading] = useState(true)
    const [confirmId, setConfirmId] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) return
            supabase
                .from('configurations')
                .select('*')
                .eq('user_id', data.user.id)
                .order('created_at', { ascending: false })
                .then(({ data: configs }) => {
                    setConfigs(configs ?? [])
                    setLoading(false)
                })
        })
    }, [])

    async function deleteConfig() {
        if (!confirmId) return
        await supabase.from('configurations').delete().eq('id', confirmId)
        setConfigs(prev => prev.filter(c => c.id !== confirmId))
        setConfirmId(null)
    }

    return (
        <div>
            <div className="mb-10">
                <h1 className="font-black text-[32px] uppercase tracking-tight">Mes configurations</h1>
                <p className="text-[13px] text-black/40 mt-1">
                    {configs.length} configuration{configs.length > 1 ? 's' : ''} sauvegardée{configs.length > 1 ? 's' : ''}
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-black/20 border-t-[#E31F2C] rounded-full animate-spin" />
                </div>
            ) : configs.length === 0 ? (
                <div className="bg-white border border-black/8 rounded-xl p-12 text-center">
                    <p className="text-black/40 text-[14px] mb-6">Vous n'avez pas encore de configuration sauvegardée.</p>
                    <Link href="/configurateur" className="bg-black text-white px-8 py-3 text-[11px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] transition-colors">
                        Créer ma première config
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {configs.map(config => (
                        <div key={config.id} className="bg-white border border-black/8 rounded-xl p-6 flex items-center justify-between">
                            <div>
                                <div className="font-black text-[16px] uppercase tracking-tight">
                                    Configuration #{config.id.slice(0, 8)}
                                </div>
                                <div className="text-[12px] text-black/40 mt-1">
                                    {new Date(config.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right mr-3">
                                    <div className="text-[10px] tracking-[2px] uppercase text-black/40">Total</div>
                                    <div className="font-black text-[20px] text-[#E31F2C]">{formatPrice(config.total_price)}</div>
                                </div>
                                <Link
                                    href={`/configurateur?config=${config.id}`}
                                    className="bg-black text-white px-6 py-2.5 text-[11px] font-semibold tracking-[2px] uppercase rounded-full hover:bg-[#E31F2C] transition-colors"
                                >
                                    Reprendre
                                </Link>
                                <button
                                    onClick={() => setConfirmId(config.id)}
                                    className="border border-black/20 text-black/40 px-6 py-2.5 text-[11px] font-light tracking-[2px] uppercase rounded-full hover:border-[#E31F2C] hover:text-[#E31F2C] transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal confirm suppression */}
            {confirmId && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
                    onClick={() => setConfirmId(null)}
                >
                    <div
                        className="bg-white rounded-2xl p-8 w-full max-w-sm mx-6 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Icône */}
                        <div className="w-12 h-12 rounded-full bg-[#E31F2C]/10 flex items-center justify-center mb-6">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#E31F2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>

                        <h2 className="font-black text-[20px] uppercase tracking-tight mb-2">
                            Supprimer la configuration ?
                        </h2>
                        <p className="text-[13px] text-black/40 leading-relaxed mb-8">
                            Cette action est irréversible. La configuration sera définitivement supprimée.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={deleteConfig}
                                className="flex-1 bg-[#E31F2C] text-white py-3 rounded-full text-[11px] font-semibold tracking-[2px] uppercase hover:bg-[#c41925] transition-colors"
                            >
                                Supprimer
                            </button>
                            <button
                                onClick={() => setConfirmId(null)}
                                className="flex-1 border border-black/20 text-black/50 py-3 rounded-full text-[11px] font-light tracking-[2px] uppercase hover:border-black hover:text-black transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}