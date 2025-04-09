import { createClient } from '@supabase/supabase-js';

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    console.error('SUPABASE_SERVICE_KEY no está definido');
    return Response.json(
      { error: 'Error de configuración del servidor' },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error desde Supabase:', error);
      return Response.json(
        { error: error.message || 'Error al obtener buckets de Supabase' },
        { status: 500 }
      );
    }

    return Response.json({ buckets: buckets || [] });

  } catch (error) {
    console.error('Error fetching buckets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar la solicitud de buckets';
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}