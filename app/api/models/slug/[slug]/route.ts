import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
    _: Request,
    context: { params: Promise<{ slug: string }> }
) {
    const { slug } = await context.params

    const [{ data: model, error }, { data: packs }, { data: allModels }] = await Promise.all([
        supabaseAdmin
            .from('models')
            .select('*, model_color_images(*, colors(*))')
            .eq('slug', slug)
            .single(),
        supabaseAdmin
            .from('packs')
            .select('*')
            .order('price'),
        supabaseAdmin
            .from('models')
            .select('id, name, slug, image, tagline, base_price')
            .eq('active', true)
            .order('created_at'),
    ])

    if (error) return NextResponse.json({ error }, { status: 404 })

    return NextResponse.json({
        ...model,
        packs: packs ?? [],
        related_models: (allModels ?? []).filter(m => m.slug !== slug),
    })
}