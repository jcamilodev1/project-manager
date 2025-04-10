// /app/api/projects/[id]/status/route.ts
import { ProjectStatus } from '@/app/api/projects/route'; // asegúrate que esté exportado
import { Role } from '@/lib/role-service';
import { createClient } from '@supabase/supabase-js';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;

  if (!process.env.SUPABASE_SERVICE_KEY) {
    return Response.json({ error: 'Error de configuración del servidor' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );

  const body = await req.json();
  const { user, status } = body;

  if (!user || user.role !== Role.PROJECT_MANAGER) {
    return Response.json({ error: 'Solo los Project Managers pueden cambiar el estado' }, { status: 403 });
  }

  if (!Object.values(ProjectStatus).includes(status)) {
    return Response.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ project: data }, { status: 200 });
}
