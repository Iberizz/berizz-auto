'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-client'

type Model = {
    id: string
    name: string
    tagline: string
    base_price: number
    image: string
    active: boolean
}

type Color = {
    id: string
    name: string
    hex: string
}

type ColorImageEntry = {
    color_id: string
    image_path: string
    is_default: boolean
}

function formatPrice(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function ModelsPage() {
    const [models, setModels] = useState<Model[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Model | null>(null)
    const [adding, setAdding] = useState(false)
    const [form, setForm] = useState({ name: '', tagline: '', base_price: 0, image: '' })
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [colors, setColors] = useState<Color[]>([])
    const [colorImages, setColorImages] = useState<ColorImageEntry[]>([])

    async function load() {
        const res = await fetch('/api/models')
        const data = await res.json()
        setModels(data)
        setLoading(false)
    }

    useEffect(() => {
        load()
        supabase.from('colors').select('*').order('name').then(({ data }) => {
            if (data) setColors(data)
        })
    }, [])

    async function handleSave() {
        let modelId: string
        if (editing) {
            await fetch(`/api/models/${editing.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            modelId = editing.id
        } else {
            const res = await fetch('/api/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const created = await res.json()
            modelId = created.id
        }

        // Upsert model_color_images pour les couleurs renseignées
        const entries = colorImages.filter(e => e.image_path.trim() !== '')
        if (entries.length > 0) {
            // Supprimer les anciennes entrées pour ce modèle puis réinsérer
            await supabase.from('model_color_images').delete().eq('model_id', modelId)
            await supabase.from('model_color_images').insert(
                entries.map(e => ({ model_id: modelId, color_id: e.color_id, image_path: e.image_path, is_default: e.is_default }))
            )
        }

        setEditing(null)
        setAdding(false)
        setForm({ name: '', tagline: '', base_price: 0, image: '' })
        setColorImages(colors.map(c => ({ color_id: c.id, image_path: '', is_default: false })))
        load()
    }

    async function handleDelete(id: string) {
        if (!confirm('Supprimer ce modèle ?')) return
        await fetch(`/api/models/${id}`, { method: 'DELETE' })
        load()
    }

    async function openEdit(model: Model) {
        setEditing(model)
        setForm({ name: model.name, tagline: model.tagline, base_price: model.base_price, image: model.image })
        // Charger les images couleur existantes pour ce modèle
        const { data } = await supabase.from('model_color_images').select('*').eq('model_id', model.id)
        setColorImages(colors.map(c => {
            const existing = data?.find(e => e.color_id === c.id)
            return { color_id: c.id, image_path: existing?.image_path ?? '', is_default: existing?.is_default ?? false }
        }))
    }

    function openAdd() {
        setAdding(true)
        setEditing(null)
        setForm({ name: '', tagline: '', base_price: 0, image: '' })
        setColorImages(colors.map(c => ({ color_id: c.id, image_path: '', is_default: false })))
    }

    const isModalOpen = editing !== null || adding

    return (
        <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-black text-[32px] uppercase tracking-tight">Modèles</h1>
                    <p className="text-white/40 text-[13px] mt-1">{models.length} modèle{models.length > 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={openAdd}
                    className="w-full sm:w-auto bg-[#E31F2C] text-white px-5 py-2.5 rounded-lg text-[12px] font-semibold tracking-[1px] uppercase"
                >
                    + Ajouter
                </button>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-xl overflow-hidden">
                {/* Desktop */}
                <div className="hidden md:block">
                    <table className="w-full">{/* ton table actuel */}</table>
                </div>

                {/* Mobile */}
                <div className="md:hidden flex flex-col divide-y divide-white/10">
                    {models.map(model => (
                        <div key={model.id} className="p-4 flex flex-col gap-3">

                            <div className="flex items-center gap-3">
                                <div className="relative w-14 h-10 bg-white rounded overflow-hidden">
                                    <Image src={model.image} alt={model.name} fill className="object-contain p-1" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{model.name}</p>
                                    <p className="text-xs text-white/40">{model.tagline}</p>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-white/40">Prix</span>
                                <span>{formatPrice(model.base_price)}</span>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button onClick={() => openEdit(model)} className="flex-1 text-xs py-2 rounded bg-white/10">
                                    Éditer
                                </button>
                                <button onClick={() => handleDelete(model.id)} className="flex-1 text-xs py-2 rounded bg-[#E31F2C]/10 text-[#E31F2C]/60">
                                    Supprimer
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => {
                        setEditing(null);
                        setAdding(false)
                    }}/>
                    <div
                        className="relative bg-[#111] border border-white/10 rounded-none sm:rounded-2xl p-5 sm:p-8 w-full h-full sm:h-auto max-w-md z-10 overflow-y-auto">
                        <h2 className="font-black text-[20px] uppercase tracking-tight mb-6">
                            {editing ? 'Modifier le modèle' : 'Nouveau modèle'}
                        </h2>

                        <div className="flex flex-col gap-4 sm:gap-5">
                            {[
                                {key: 'name', label: 'Nom', type: 'text', placeholder: 'GT-R Apex'},
                                {key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'V8 Biturbo · 720ch'},
                                {
                                    key: 'image',
                                    label: 'Image par défaut',
                                    type: 'text',
                                    placeholder: '/images/model-gtr.png'
                                },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label
                                        className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={form[field.key as keyof typeof form]}
                                        onChange={e => setForm(prev => ({...prev, [field.key]: e.target.value}))}
                                        placeholder={field.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none focus:border-[#E31F2C] transition-colors"
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">Prix de
                                    base (€)</label>
                                <input
                                    type="number"
                                    value={form.base_price}
                                    onChange={e => setForm(prev => ({...prev, base_price: Number(e.target.value)}))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:border-[#E31F2C] transition-colors"
                                />
                            </div>

                            {/* Images par couleur */}
                            {colors.length > 0 && (
                                <div>
                                    <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-3">Images
                                        par couleur</label>
                                    <div className="flex flex-col gap-3">
                                        {colors.map(color => {
                                            const entry = colorImages.find(e => e.color_id === color.id)
                                            return (
                                                <div key={color.id}
                                                     className="bg-white/5 border border-white/20 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{
                                                            backgroundColor: color.hex,
                                                            border: '1px solid rgba(255,255,255,0.15)'
                                                        }}/>
                                                        <span
                                                            className="text-[12px] font-medium text-white/70">{color.name}</span>
                                                        <label
                                                            className="ml-auto flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-[1px] cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={entry?.is_default ?? false}
                                                                onChange={e => setColorImages(prev => prev.map(p =>
                                                                    p.color_id === color.id ? {
                                                                        ...p,
                                                                        is_default: e.target.checked
                                                                    } : {...p, is_default: false}
                                                                ))}
                                                                className="accent-[#E31F2C]"
                                                            />
                                                            Défaut
                                                        </label>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={entry?.image_path ?? ''}
                                                        onChange={e => setColorImages(prev => prev.map(p =>
                                                            p.color_id === color.id ? {
                                                                ...p,
                                                                image_path: e.target.value
                                                            } : p
                                                        ))}
                                                        placeholder={`/images/model-xxx-${color.name.toLowerCase().replace(/\s/g, '-')}.png`}
                                                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-[12px] text-white placeholder-white/20 outline-none focus:border-[#E31F2C] transition-colors"
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-[#E31F2C] text-white py-3 rounded-lg text-[12px] font-semibold tracking-[1px] uppercase hover:bg-[#c41925] transition-colors"
                            >
                                {editing ? 'Enregistrer' : 'Créer'}
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(null);
                                    setAdding(false)
                                }}
                                className="px-6 py-3 rounded-lg bg-white/5 text-white/50 text-[12px] uppercase tracking-[1px] hover:bg-white/10 transition-colors"
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