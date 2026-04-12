import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from('colors')
        .select('*')
        .order('name')
    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(req: Request) {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
        .from('colors')
        .insert(body)
        .select()
        .single()
    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json(data)
}