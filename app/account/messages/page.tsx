'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

type Message = {
    id: string
    subject: string
    message: string
    created_at: string
    read: boolean
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<Message | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) return
            supabase
                .from('contacts')
                .select('*')
                .eq('user_id', data.user.id)
                .order('created_at', { ascending: false })
                .then(({ data: msgs }) => {
                    setMessages(msgs ?? [])
                    setLoading(false)
                })
        })
    }, [])

    return (
        <div>
            <div className="mb-10">
                <h1 className="font-black text-[32px] uppercase tracking-tight">Mes messages</h1>
                <p className="text-[13px] text-black/40 mt-1">{messages.length} message{messages.length > 1 ? 's' : ''}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-6 h-6 border-2 border-black/20 border-t-[#E31F2C] rounded-full animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="p-12 text-center text-black/40 text-[14px]">Aucun message envoyé.</div>
                    ) : messages.map(msg => (
                        <div
                            key={msg.id}
                            onClick={() => setSelected(msg)}
                            className={`px-6 py-4 border-b border-black/8 cursor-pointer transition-colors ${
                                selected?.id === msg.id ? 'bg-[#f5f5f7]' : 'hover:bg-[#f5f5f7]'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] tracking-[2px] uppercase bg-black/5 px-2 py-0.5 rounded">
                  {msg.subject || '—'}
                </span>
                                <span className="text-[11px] text-black/30">
                  {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                </span>
                            </div>
                            <p className="text-[13px] text-black/60 truncate">{msg.message}</p>
                        </div>
                    ))}
                </div>

                {selected ? (
                    <div className="bg-white border border-black/8 rounded-xl p-6 h-fit sticky top-6">
                        <div className="text-[10px] tracking-[3px] uppercase text-[#E31F2C] mb-2">{selected.subject || '—'}</div>
                        <div className="text-[11px] text-black/30 mb-6">
                            {new Date(selected.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <p className="text-[14px] text-black/70 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                    </div>
                ) : (
                    <div className="bg-white border border-black/8 rounded-xl p-6 flex items-center justify-center text-black/20 text-[13px] h-48">
                        Sélectionne un message
                    </div>
                )}
            </div>
        </div>
    )
}