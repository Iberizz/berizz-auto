import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protéger /backoffice
    if (request.nextUrl.pathname.startsWith('/backoffice') &&
        !request.nextUrl.pathname.startsWith('/backoffice/login')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        // Vérifier le rôle admin
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (roleData?.role !== 'admin') {
            return NextResponse.redirect(new URL('/account', request.url))
        }
    }

    // Protéger /account
    if (request.nextUrl.pathname.startsWith('/account')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Rediriger /backoffice/login vers /login
    if (request.nextUrl.pathname === '/backoffice/login') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
}

export const config = {
    matcher: ['/backoffice/:path*', '/account/:path*', '/backoffice/login'],
}