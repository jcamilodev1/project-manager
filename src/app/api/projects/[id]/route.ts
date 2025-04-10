import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await Promise.resolve(params);
  const projectId = resolvedParams.id;
  const body = await req.json();

  if (!process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );

  const { user, updates } = body;

  if (!user || user.role_id !== 2) {
    return NextResponse.json({ error: 'Solo los Project Managers pueden editar proyectos' }, { status: 403 });
  }

  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.created_at;
  delete safeUpdates.client_id;

  const { data, error } = await supabase
    .from('projects')
    .update(safeUpdates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 200 });
}

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await Promise.resolve(params);
  const projectId = resolvedParams.id;
  
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );
  
  const body = await req.json();
  const { user } = body;
  console.log(user)

  if (!user || user.role_id !== 2) {
    return NextResponse.json({ error: 'Solo los Project Managers pueden eliminar proyectos' }, { status: 403 });
  }

  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}