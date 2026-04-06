import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json(data)
}

export async function PATCH(req: Request) {
    const { id, status } = await req.json()
    const { error } = await supabaseAdmin
        .from('orders')
        .update({ status })
        .eq('id', id)
    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json({ success: true })
}