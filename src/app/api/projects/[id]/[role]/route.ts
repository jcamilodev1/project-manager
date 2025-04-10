import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: { id: string; role: string } }
) {
  // Esperar a que los parámetros estén disponibles
  const resolvedParams = await Promise.resolve(params);
  const userId = resolvedParams.id;
  const roleId = resolvedParams.role;
  const numericRoleId = parseInt(roleId);

  if (!userId || isNaN(numericRoleId)) {
    return NextResponse.json({ error: 'Missing or invalid user ID or role ID' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase config error' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // Obtener el nombre del rol desde la tabla `roles`
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', numericRoleId)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const roleMap: Record<string, string> = {
      'Cliente': 'client',
      'Diseñador': 'designer',
      'Project Manager': 'project_manager',
    };

    const mappedRole = roleMap[roleData.name];

    if (!mappedRole) {
      return NextResponse.json({ error: 'Unknown role' }, { status: 400 });
    }

    // Buscar proyectos según el rol
    let query = supabase.from('projects').select('*');

    if (mappedRole === 'client') {
      query = query.eq('client_id', userId);
    } else if (mappedRole === 'designer') {
      query = query.eq('designer_id', userId);
    } else if (mappedRole === 'project_manager') {
      // No filtramos, ve todos
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
