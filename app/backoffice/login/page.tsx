'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin() {
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError('Email ou mot de passe incorrect.')
            setLoading(false)
        } else {
            router.push('/backoffice')
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6">

            {/* Logo */}
            <div className="mb-12 text-center">
                <Link href="/" className="font-black text-2xl tracking-[4px] uppercase">
                    BERIZZ<span className="text-[#E31F2C]">.</span>
                </Link>
                <div className="text-[10px] tracking-[4px] uppercase text-white/30 mt-1">Backoffice</div>
            </div>

            {/* Card */}
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8">
                <h1 className="font-black text-[22px] uppercase tracking-tight mb-1">Connexion</h1>
                <p className="text-[13px] text-white/40 mb-8">Accès réservé aux administrateurs.</p>

                <div className="flex flex-col gap-5">
                    <div>
                        <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            placeholder="admin@berizz.com"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none focus:border-[#E31F2C] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none focus:border-[#E31F2C] transition-colors"
                        />
                    </div>

                    {error && (
                        <p className="text-[12px] text-[#E31F2C] bg-[#E31F2C]/10 border border-[#E31F2C]/20 rounded-lg px-4 py-3">
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-[#E31F2C] text-white py-3.5 rounded-lg text-[12px] font-semibold tracking-[2px] uppercase hover:bg-[#c41925] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </div>
            </div>
        </div>
    )
}
