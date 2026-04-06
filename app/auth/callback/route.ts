import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data } = await supabase.auth.exchangeCodeForSession(code)

        if (data.user) {
            // Vérifier le rôle
            const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (roleData?.role === 'admin') {
                return NextResponse.redirect(`${origin}/backoffice`)
            }
            return NextResponse.redirect(`${origin}/account`)
        }
    }

    return NextResponse.redirect(`${origin}/login`)
}