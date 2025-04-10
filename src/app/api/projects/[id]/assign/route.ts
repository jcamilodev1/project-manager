import { createClient } from '@supabase/supabase-js';
import { ProjectStatus } from '@/lib/project-service';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const projectId = await Promise.resolve(params).then(p => p.id);
  const body = await req.json();
  const { user, designerId } = body;

  if (!process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );

  if (!user || user.role_id !== 2) {
    return NextResponse.json({ error: 'Solo los Project Managers pueden asignar proyectos' }, { status: 403 });
  }

  if (!designerId) {
    return NextResponse.json({ error: 'El ID del diseñador es obligatorio' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      designer_id: designerId,
      manager_id: user.id,
      status: ProjectStatus.ASSIGNED
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 200 });
}
