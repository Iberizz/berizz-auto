import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
    _: Request,
    context: { params: Promise<{ slug: string }> }
) {
    const { slug } = await context.params
    const { data, error } = await supabaseAdmin
        .from('models')
        .select('*, model_color_images(*, colors(*))')
        .eq('slug', slug)
        .single()
    if (error) return NextResponse.json({ error }, { status: 404 })
    return NextResponse.json(data)
}
