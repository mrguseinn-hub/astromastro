import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getAdminUser } from '@/lib/auth/admin-auth';

// GET - List all interpretations
export async function GET() {
  try {
    const admin = supabaseAdmin();
    const { data, error } = await admin
      .from('interpretation_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST - Create new interpretation
export async function POST(request: NextRequest) {
  try {
    await getAdminUser(); // Check auth

    const body = await request.json();
    const admin = supabaseAdmin();

    const { data, error } = await admin
      .from('interpretation_entries')
      .insert({
        entity_code: body.entity_code,
        name: body.name,
        description: body.description,
        psychological_theme: body.psychological_theme,
        scoring_contributions: body.scoring_contributions || {},
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

// PUT - Update interpretation
export async function PUT(request: NextRequest) {
  try {
    await getAdminUser();

    const body = await request.json();
    const admin = supabaseAdmin();

    const { data, error } = await admin
      .from('interpretation_entries')
      .update({
        entity_code: body.entity_code,
        name: body.name,
        description: body.description,
        psychological_theme: body.psychological_theme,
        scoring_contributions: body.scoring_contributions || {},
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

// DELETE - Delete interpretation
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
      .from('interpretation_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}