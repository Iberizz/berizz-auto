'use client'

import { useEffect, useState } from 'react'

type Color = { id: string; name: string; hex: string; price: number }

function formatPrice(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function ColorsPage() {
    const [colors, setColors] = useState<Color[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Color | null>(null)
    const [adding, setAdding] = useState(false)
    const [form, setForm] = useState({ name: '', hex: '#000000', price: 0 })
    const [error, setError] = useState('')

    async function load() {
        const res = await fetch('/api/colors')
        setColors(await res.json())
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    async function handleSave() {
        setError('')
        if (!form.name.trim() || !form.hex.trim()) {
            setError('Veuillez remplir tous les champs.')
            return
        }
        if (editing) {
            await fetch(`/api/colors/${editing.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
        } else {
            await fetch('/api/colors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
        }
        setEditing(null)
        setAdding(false)
        load()
    }

    async function handleDelete(id: string) {
        if (!confirm('Supprimer cette couleur ?')) return
        await fetch(`/api/colors/${id}`, { method: 'DELETE' })
        load()
    }

    function openEdit(color: Color) {
        setError('')
        setEditing(color)
        setForm({ name: color.name, hex: color.hex, price: color.price })
    }

    const isModalOpen = editing !== null || adding

    return (
        <div className="px-4 md:px-10 py-6 md:py-10">
            <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div>
                    <h1 className="font-black text-[24px] md:text-[32px] uppercase tracking-tight">Couleurs</h1>
                    <p className="text-white/40 text-[13px] mt-1">{colors.length} couleur{colors.length > 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => { setAdding(true); setEditing(null); setError(''); setForm({ name: '', hex: '#000000', price: 0 }) }}
                    className="bg-[#E31F2C] text-white px-5 py-2.5 rounded-lg text-[12px] font-semibold tracking-[1px] uppercase hover:bg-[#c41925] transition-colors"
                >
                    + Ajouter
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-3 text-center text-white/30 py-10">Chargement...</div>
                ) : colors.map((color) => (
                    <div key={color.id} className="bg-white/5 border border-white/20 rounded-xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-white/10" style={{ backgroundColor: color.hex }} />
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[14px]">{color.name}</div>
                            <div className="text-[12px] text-white/40 font-mono mt-0.5">{color.hex}</div>
                            <div className="text-[12px] text-white/60 mt-1">
                                {color.price > 0 ? `+${formatPrice(color.price)}` : 'Inclus'}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => openEdit(color)} className="text-[11px] px-3 py-1.5 rounded bg-white/20 text-white/60 hover:bg-white/15 hover:text-white transition-colors">
                                Éditer
                            </button>
                            <button onClick={() => handleDelete(color.id)} className="text-[11px] px-3 py-1.5 rounded bg-[#E31F2C]/10 text-[#E31F2C]/60 hover:bg-[#E31F2C]/20 hover:text-[#E31F2C] transition-colors">
                                Suppr.
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setEditing(null); setAdding(false) }} />
                    <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md mx-4 z-10">
                        <h2 className="font-black text-[20px] uppercase tracking-tight mb-6">
                            {editing ? 'Modifier la couleur' : 'Nouvelle couleur'}
                        </h2>
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">Nom</label>
                                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Rouge Berizz"
                                       className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none focus:border-[#E31F2C] transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">Couleur</label>
                                <div className="flex gap-3 items-center">
                                    <input type="color" value={form.hex} onChange={e => setForm(p => ({ ...p, hex: e.target.value }))}
                                           className="w-12 h-12 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                                    <input type="text" value={form.hex} onChange={e => setForm(p => ({ ...p, hex: e.target.value }))}
                                           className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white font-mono outline-none focus:border-[#E31F2C] transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">Prix supplémentaire (€)</label>
                                <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                                       className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:border-[#E31F2C] transition-colors" />
                            </div>
                        </div>
                        {error && (
                            <div className="mt-4 px-4 py-3 rounded-lg bg-[#E31F2C]/10 border border-[#E31F2C]/20 text-[#E31F2C] text-[12px]">
                                {error}
                            </div>
                        )}
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} className="flex-1 bg-[#E31F2C] text-white py-3 rounded-lg text-[12px] font-semibold tracking-[1px] uppercase hover:bg-[#c41925] transition-colors">
                                {editing ? 'Enregistrer' : 'Créer'}
                            </button>
                            <button onClick={() => { setEditing(null); setAdding(false) }} className="px-6 py-3 rounded-lg bg-white/5 text-white/50 text-[12px] uppercase tracking-[1px] hover:bg-white/10 transition-colors">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
