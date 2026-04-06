'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isRegister, setIsRegister] = useState(false)

    async function handleAuth() {
        setLoading(true)
        setError('')

        if (isRegister) {
            const { error } = await supabase.auth.signUp({ email, password })
            if (error) {
                setError(error.message)
                setLoading(false)
                return
            }
            setError('Vérifiez votre email pour confirmer votre compte.')
            setLoading(false)
            return
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError('Email ou mot de passe incorrect.')
            setLoading(false)
            return
        }

        // Vérifier le rôle
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('id', data.user.id)
            .single()

        if (roleData?.role === 'admin') {
            router.push('/backoffice')
        } else {
            router.push('/account')
        }
    }

    async function handleGoogle() {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6">

            {/* Logo */}
            <div className="mb-12 text-center">
                <Link href="/" className="font-black text-2xl tracking-[4px] uppercase">
                    BERIZZ<span className="text-[#E31F2C]">.</span>
                </Link>
                <div className="text-[10px] tracking-[4px] uppercase text-white/30 mt-1">
                    {isRegister ? 'Créer un compte' : 'Mon espace'}
                </div>
            </div>

            {/* Card */}
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8">
                <h1 className="font-black text-[22px] uppercase tracking-tight mb-1">
                    {isRegister ? 'Inscription' : 'Connexion'}
                </h1>
                <p className="text-[13px] text-white/40 mb-8">
                    {isRegister ? 'Créez votre espace Berizz.' : 'Accédez à votre espace personnel.'}
                </p>

                <div className="flex flex-col gap-5">

                    {/* Google */}
                    <button
                        onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-lg text-[13px] font-medium hover:bg-white/90 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continuer avec Google
                    </button>

                    {/* Séparateur */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-[11px] text-white/30 uppercase tracking-[2px]">ou</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAuth()}
                            placeholder="vous@exemple.fr"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none focus:border-[#E31F2C] transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-[10px] tracking-[3px] uppercase text-white/40 block mb-2">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAuth()}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none focus:border-[#E31F2C] transition-colors"
                        />
                    </div>

                    {error && (
                        <p className={`text-[12px] rounded-lg px-4 py-3 ${
                            error.includes('Vérifiez')
                                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                : 'text-[#E31F2C] bg-[#E31F2C]/10 border border-[#E31F2C]/20'
                        }`}>
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleAuth}
                        disabled={loading}
                        className="w-full bg-[#E31F2C] text-white py-3.5 rounded-lg text-[12px] font-semibold tracking-[2px] uppercase hover:bg-[#c41925] transition-colors disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Chargement...' : isRegister ? "Créer mon compte" : 'Se connecter'}
                    </button>

                    {/* Toggle register/login */}
                    <button
                        onClick={() => { setIsRegister(!isRegister); setError('') }}
                        className="text-[12px] text-white/30 hover:text-white/60 transition-colors text-center"
                    >
                        {isRegister ? 'Déjà un compte ? Se connecter' : "Pas encore de compte ? S'inscrire"}
                    </button>
                </div>
            </div>
        </main>
    )
}