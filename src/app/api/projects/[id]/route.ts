import { createClient } from '@supabase/supabase-js';

export enum ProjectStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  const body = await req.json();

  if (!process.env.SUPABASE_SERVICE_KEY) {
    return Response.json({ error: 'Error de configuración del servidor' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );

  const { user, updates } = body;

  if (!user || user.role_id !== 2) {
    return Response.json({ error: 'Solo los Project Managers pueden editar proyectos' }, { status: 403 });
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
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ project: data }, { status: 200 });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return Response.json({ error: 'Error de configuración del servidor' }, { status: 500 });
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );
  
  const body = await req.json();
  const { user } = body;
  console.log(user)

  if (!user || user.role_id !== 2) {
    return Response.json({ error: 'Solo los Project Managers pueden eliminar proyectos' }, { status: 403 });
  }

  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 200 });
}