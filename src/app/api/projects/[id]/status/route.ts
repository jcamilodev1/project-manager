// /app/api/projects/[id]/status/route.ts
import { ProjectStatus } from '@/lib/project-service';
import { Role } from '@/lib/role-service';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PUT(
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
  const { user, status } = body;

  if (!user || user.role !== Role.PROJECT_MANAGER) {
    return NextResponse.json({ error: 'Solo los Project Managers pueden cambiar el estado' }, { status: 403 });
  }

  if (!Object.values(ProjectStatus).includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 200 });
}
