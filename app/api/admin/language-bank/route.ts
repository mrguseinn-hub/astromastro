import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getAdminUser } from '@/lib/auth/admin-auth';

export async function GET() {
  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from('language_bank')
      .select('*')
      .order('theme')
      .order('subtype');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await getAdminUser();

    const body = await request.json();
    const admin = supabaseAdmin();

    const { data, error } = await admin
      .from('language_bank')
      .insert({
        theme: body.theme,
        subtype: body.subtype,
        sentence_text: body.sentence_text,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await getAdminUser();

    const body = await request.json();
    const admin = supabaseAdmin();

    const { data, error } = await admin
      .from('language_bank')
      .update({
        theme: body.theme,
        subtype: body.subtype,
        sentence_text: body.sentence_text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await getAdminUser();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const { error } = await admin
      .from('language_bank')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}