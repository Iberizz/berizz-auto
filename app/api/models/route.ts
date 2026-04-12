import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from('models')
        .select('*, model_color_images(*, colors(*))')
        .order('created_at')
    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json(data)
}

export async function POST(req: Request) {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
        .from('models')
        .insert(body)
        .select()
        .single()
    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json(data)
}