import { createClient } from '@supabase/supabase-js';
import { ProjectStatus } from '@/lib/project-service';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  const body = await req.json();
  const { user, designerId } = body;

  if (!process.env.SUPABASE_SERVICE_KEY) {
    return Response.json({ error: 'Error de configuración del servidor' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );

  if (!user || user.role_id !== 2) {
    return Response.json({ error: 'Solo los Project Managers pueden asignar proyectos' }, { status: 403 });
  }

  if (!designerId) {
    return Response.json({ error: 'El ID del diseñador es obligatorio' }, { status: 400 });
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
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ project: data }, { status: 200 });
}
