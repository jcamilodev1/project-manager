// app/api/login/route.ts
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return Response.json(
      { error: 'Error de configuración del servidor' },
      { status: 500 }
    );
  }

  try {
    const { email, password } = await request.json();
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY
    );

    // Autenticar usuario
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes("Invalid login")) {
        errorMessage = "Email o contraseña incorrectos";
      }
      return Response.json({ error: errorMessage }, { status: 400 });
    }

    if (data && data.user) {
      // Obtener datos del usuario SIN activar RLS
      const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

      if (userError) {
        console.error('Error al obtener datos de usuario:', userError);
      }

      return Response.json({
        session: data.session,
        user: data.user,
        userData: userData || null
      });
    }

    return Response.json(
      { error: 'Error inesperado durante la autenticación' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error en el proceso de inicio de sesión:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}