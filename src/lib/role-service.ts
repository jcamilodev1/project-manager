import { supabase } from './supabase';

// Definición de roles
export enum Role {
  CLIENT = 1,
  PROJECT_MANAGER = 2,
  DESIGNER = 3
}

// Interface para usuario con rol
export interface UserWithRole {
  id: string;
  email: string;
  role: Role;
  roleName: string;
  fullName: string | null;
}

// Tipo para errores
type ErrorResponse = {
  message: string;
  status?: number;
};

// Obtener el rol del usuario actual
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('Error al obtener usuario autenticado:', authError);
    return null;
  }
  
  // Obtener información de rol desde la tabla users
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      roles (
        id,
        name
      )
    `)
    .eq('id', user.id)
    .single();
  
  if (error || !data) {
    console.error('Error al obtener rol de usuario:', error);
    return null;
  }
  
  return {
    id: data.id,
    email: data.email,
    role: data.role_id as Role,
    roleName: data.roles?.name || 'Unknown',
    fullName: data.full_name
  };
}

// Verificar si el usuario tiene un rol específico
export function hasRole(user: UserWithRole | null, role: Role): boolean {
  return user?.role === role;
}

// Verificar si el usuario es cliente
export function isClient(user: UserWithRole | null): boolean {
  return hasRole(user, Role.CLIENT);
}

// Verificar si el usuario es project manager
export function isProjectManager(user: UserWithRole | null): boolean {
  return hasRole(user, Role.PROJECT_MANAGER);
}

// Verificar si el usuario es diseñador
export function isDesigner(user: UserWithRole | null): boolean {
  return hasRole(user, Role.DESIGNER);
}

// Crear un nuevo usuario con rol (para registro)
export async function createUserWithRole(
  email: string, 
  password: string, 
  role: Role = Role.CLIENT,
  fullName?: string
): Promise<{ user: UserWithRole | null; error: ErrorResponse | null }> {
  // 1. Crear el usuario en auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError || !authData.user) {
    return { user: null, error: { message: authError?.message || 'Unknown error' } };
  }
  
  try {
    // 2. Insertar datos del usuario en la tabla users
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        role_id: role,
        full_name: fullName || null
      });
    
    if (userError) {
      console.error('Error al crear usuario en la tabla users:', userError);
      // No podemos eliminar el usuario de auth sin permisos de admin
      // Solo registramos el error
      return { user: null, error: { message: userError.message } };
    }
    
    return { 
      user: {
        id: authData.user.id,
        email: email,
        role: role,
        roleName: role === Role.CLIENT ? 'Cliente' : 
                  role === Role.PROJECT_MANAGER ? 'Project Manager' : 'Diseñador',
        fullName: fullName || null
      }, 
      error: null 
    };
  } catch (error) {
    // Registramos el error pero no intentamos eliminar el usuario
    console.error('Error inesperado al crear usuario:', error);
    return { 
      user: null, 
      error: { 
        message: error instanceof Error ? error.message : 'Error desconocido al crear usuario' 
      } 
    };
  }
} 