'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-client'

type Pack = { id: string; name: string; description: string; price: number; icon: string; image: string | null }

function formatPrice(n: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function PacksPage() {
    const [packs, setPacks] = useState<Pack[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Pack | null>(null)
    const [adding, setAdding] = useState(false)
    const [form, setForm] = useState({ name: '', description: '', price: 0, icon: '⚡', image: '' })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)

    async function load() {
        const res = await fetch('/api/packs')
        setPacks(await res.json())
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setPreview(URL.createObjectURL(file))
    }

    async function uploadImage(packId: string): Promise<string | null> {
        if (!imageFile) return form.image || null
        setUploading(true)
        const ext = imageFile.name.split('.').pop()
        const path = `${packId}-${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('packs').upload(path, imageFile, { upsert: true })
        setUploading(false)
        if (error) { console.error(error); return null }
        const { data } = supabase.storage.from('packs').getPublicUrl(path)
        return data.publicUrl
    }

    async function handleSave() {
        if (editing) {
            const imageUrl = await uploadImage(editing.id)
            await fetch(`/api/packs/${editing.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, image: imageUrl }),
            })
        } else {
            // Créer d'abord sans image pour avoir l'ID
            const res = await fetch('/api/packs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, image: null }),
            })
            const newPack = await res.json()
            if (newPack?.id && imageFile) {
                const imageUrl = await uploadImage(newPack.id)
                await fetch(`/api/packs/${newPack.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: imageUrl }),
                })
            }
        }
        closeModal()
        load()
    }

    async function handleDelete(id: string) {
        if (!confirm('Supprimer ce pack ?')) return
        await supabase.storage.from('packs').remove([`${id}.jpg`, `${id}.png`, `${id}.webp`])
        await fetch(`/api/packs/${id}`, { method: 'DELETE' })
        load()
    }

    function openEdit(pack: Pack) {
        setEditing(pack)
        setForm({ name: pack.name, description: pack.description, price: pack.price, icon: pack.icon, image: pack.image || '' })
        setPreview(pack.image || null)
        setImageFile(null)
    }

    function closeModal() {
        setEditing(null)
        setAdding(false)
        setImageFile(null)
        setPreview(null)
        setForm({ name: '', description: '', price: 0, icon: '⚡', image: '' })
    }

    const isModalOpen = editing !== null || adding

    return (
        <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-black text-[32px] uppercase tracking-tight">Options & Packs</h1>
                    <p className="text-white/40 text-[13px] mt-1">{packs.length} pack{packs.length > 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => {
                        setAdding(true);
                        setEditing(null)
                    }}
                    className="w-full sm:w-auto bg-[#E31F2C] text-white px-5 py-2.5 rounded-lg text-[12px] font-semibold tracking-[1px] uppercase hover:bg-[#c41925] transition-colors"
                >
                    + Ajouter
                </button>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-xl overflow-hidden">
                {/* Desktop */}
                <div className="hidden md:block">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-white/20">
                            <th className="text-left px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30">Pack</th>
                            <th className="text-left px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30">Image</th>
                            <th className="text-left px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30">Description</th>
                            <th className="text-left px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30">Prix</th>
                            <th className="text-right px-6 py-3 text-[11px] tracking-[2px] uppercase text-white/30">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-white/30 text-[13px]">
                                    Chargement...
                                </td>
                            </tr>
                        ) : packs.map(pack => (
                            <tr key={pack.id} className="border-b border-white/5">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <span className="text-xl">{pack.icon}</span>
                                    <span className="font-semibold text-[14px]">{pack.name}</span>
                                </td>

                                <td className="px-6 py-4">
                                    {pack.image && (
                                        <div className="relative w-20 h-12 rounded overflow-hidden">
                                            <Image src={pack.image} alt={pack.name} fill className="object-cover" />
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-white/50">{pack.description}</td>
                                <td className="px-6 py-4 text-[#E31F2C]">+{formatPrice(pack.price)}</td>

                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openEdit(pack)}>Éditer</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden flex flex-col divide-y divide-white/10">
                    {packs.map(pack => (
                        <div key={pack.id} className="p-4 flex flex-col gap-3">

                            <div className="flex items-center gap-3">
                                <span className="text-xl">{pack.icon}</span>
                                <div>
                                    <p className="font-semibold text-sm">{pack.name}</p>
                                    <p className="text-xs text-white/40 line-clamp-2">{pack.description}</p>
                                </div>
                            </div>

                            {pack.image && (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-white/5">
                                    <Image src={pack.image} alt={pack.name} fill className="object-cover" />
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-white/40">Prix</span>
                                <span className="text-[#E31F2C]">+{formatPrice(pack.price)}</span>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => openEdit(pack)}
                                    className="flex-1 text-xs py-2 rounded bg-white/10"
                                >
                                    Éditer
                                </button>
                                <button
                                    onClick={() => handleDelete(pack.id)}
                                    className="flex-1 text-xs py-2 rounded bg-[#E31F2C]/10 text-[#E31F2C]/60"
                                >
                                    Supprimer
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal}/>
                    <div
                        className="relative bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md z-10 max-h-[90vh] overflow-y-auto">
                        <h2 className="font-black text-[20px] uppercase tracking-tight mb-6">
                            {editing ? 'Modifier le pack' : 'Nouveau pack'}
                        </h2>
                        <div className="flex flex-col gap-4 sm:gap-5">
                            {[
                                {key: 'name', label: 'Nom', placeholder: 'Pack Sport'},
                                {
                                    key: 'description',
                                    label: 'Description',
                                    placeholder: 'Jantes 21", freins renforcés...'
                                },
                                {key: 'icon', label: 'Icône (emoji)', placeholder: '⚡'},
                            ].map(field => (
                                <div key={field.key}>
                                    <label
                                        className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">{field.label}</label>
                                    <input
                                        type="text"
                                        value={form[field.key as keyof typeof form]}
                                        onChange={e => setForm(p => ({...p, [field.key]: e.target.value}))}
                                        placeholder={field.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none focus:border-[#E31F2C] transition-colors"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">Prix
                                    (€)</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={e => setForm(p => ({...p, price: Number(e.target.value)}))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:border-[#E31F2C] transition-colors"
                                />
                            </div>

                            {/* Image upload */}
                            <div>
                                <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">Image
                                    du pack</label>
                                {preview && (
                                    <div className="relative w-full h-36 rounded-lg overflow-hidden bg-white/5 mb-3">
                                        <Image src={preview} alt="preview" fill className="object-cover"/>
                                    </div>
                                )}
                                <label
                                    className="block w-full border border-dashed border-white/20 rounded-lg px-4 py-4 text-center cursor-pointer hover:border-white/40 transition-colors">
                                    <span className="text-[12px] text-white/40">
                                        {imageFile ? imageFile.name : 'Cliquer pour uploader une image'}
                                    </span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleSave}
                                disabled={uploading}
                                className="flex-1 bg-[#E31F2C] text-white py-3 rounded-lg text-[12px] font-semibold tracking-[1px] uppercase hover:bg-[#c41925] transition-colors disabled:opacity-50"
                            >
                                {uploading ? 'Upload...' : editing ? 'Enregistrer' : 'Créer'}
                            </button>
                            <button onClick={closeModal}
                                    className="px-6 py-3 rounded-lg bg-white/5 text-white/50 text-[12px] uppercase tracking-[1px] hover:bg-white/10 transition-colors">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
