// src/app/api/projects/[id]/files/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return Response.json(
      { error: 'Error de configuración del servidor' },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );

  // Esperar a que los parámetros estén disponibles
  const resolvedParams = await Promise.resolve(params);
  const project_id = resolvedParams.id;

  const { data, error } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', project_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener archivos del proyecto:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ files: data });
}
