import { Role } from '@/lib/role-service';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return Response.json(
      { error: 'Error de configuración del servidor' },
      { status: 500 }
    );
  }

  try {
    const { email, password, role, fullName } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY
    );

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true 
    });

    if (authError || !authData.user) {
      return Response.json(
        { error: authError?.message || 'Error al crear usuario' },
        { status: 400 }
      );
    }

    // Insertar en tabla personalizada 'users'
    await supabase
  .from('users')
  .upsert([
    {
      id: authData.user.id,
      email,
      role_id: role || Role.CLIENT,
      full_name: fullName || null
    }
  ]);


    return Response.json({
      user: {
        id: authData.user.id,
        email: email,
        role: role || Role.CLIENT,
        roleName: role === Role.PROJECT_MANAGER ? 'Project Manager' : 
                 role === Role.DESIGNER ? 'Diseñador' : 'Cliente',
        fullName: fullName || null
      }
    });
  } catch (error) {
    console.error('Error inesperado al crear usuario:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
