import { supabase } from './supabase';
import { UserWithRole, isProjectManager, Role } from './role-service';

interface Designer {
  id: string;
  email: string;
  fullName: string | null;
}

/**
 * Obtiene la lista de todos los diseñadores (usuarios con rol 3)
 * Esta función solo puede ser usada por Project Managers
 */
export async function getDesigners(user: UserWithRole): Promise<{ data: Designer[], error: string | null }> {
  // Verificar que el usuario sea Project Manager
  if (!isProjectManager(user)) {
    return { data: [], error: 'Solo los Project Managers pueden obtener la lista de diseñadores' };
  }

  // Obtener diseñadores de la base de datos
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('role_id', Role.DESIGNER);

  if (error) {
    console.error('Error al obtener diseñadores:', error);
    return { data: [], error: error.message };
  }

  // Transformar el resultado para devolverlo con nombres de campo consistentes
  const designers: Designer[] = data.map(d => ({
    id: d.id,
    email: d.email,
    fullName: d.full_name
  }));

  return { data: designers, error: null };
} 