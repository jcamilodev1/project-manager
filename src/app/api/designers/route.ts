import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email') // ajusta los campos que necesites
    .eq('role_id', 3); // 3 = diseñador

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ designers: data }, { status: 200 });
}
