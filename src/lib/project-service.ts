import { supabase } from './supabase';
import { UserWithRole, isClient, isProjectManager, isDesigner } from './role-service';
import { Database } from './database.types';

export type Project = Database['public']['Tables']['projects']['Row'];
export type NewProject = Omit<Database['public']['Tables']['projects']['Insert'], 'id' | 'created_at' | 'manager_id' | 'designer_id' | 'status'>;

// Posibles estados de un proyecto
export enum ProjectStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Crear un nuevo proyecto (solo para clientes)
export async function createProject(user: UserWithRole, project: NewProject): Promise<{ data: Project | null, error: string | null }> {
  if (!isClient(user)) {
    return { data: null, error: 'No tienes permisos para crear proyectos' };
  }

  // Asegurarse de que el cliente solo pueda crear proyectos propios
  if (project.client_id !== user.id) {
    return { data: null, error: 'Solo puedes crear proyectos para ti mismo' };
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...project,
      status: ProjectStatus.PENDING
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear proyecto:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// Obtener proyectos según el rol del usuario
export async function getProjects(user: UserWithRole): Promise<{ data: Project[], error: string | null }> {
  let query = supabase.from('projects').select('*');
  
  // Filtrar según el rol
  if (isClient(user)) {
    // Clientes solo ven sus propios proyectos
    query = query.eq('client_id', user.id);
  } else if (isProjectManager(user)) {
    // Project Managers ven todos los proyectos
    // (no se aplica filtro adicional)
  } else if (isDesigner(user)) {
    // Diseñadores solo ven proyectos asignados a ellos
    query = query.eq('designer_id', user.id);
  } else {
    return { data: [], error: 'Rol desconocido' };
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al obtener proyectos:', error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

// Obtener un proyecto específico
export async function getProject(user: UserWithRole, projectId: string): Promise<{ data: Project | null, error: string | null }> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error al obtener proyecto:', error);
    return { data: null, error: error.message };
  }

  // Verificar permisos según rol
  if (isClient(user) && data.client_id !== user.id) {
    return { data: null, error: 'No tienes acceso a este proyecto' };
  }

  if (isDesigner(user) && data.designer_id !== user.id) {
    return { data: null, error: 'No tienes acceso a este proyecto' };
  }

  return { data, error: null };
}

// Asignar un proyecto a un diseñador (solo para Project Managers)
export async function assignProjectToDesigner(
  user: UserWithRole, 
  projectId: string, 
  designerId: string
): Promise<{ data: Project | null, error: string | null }> {
  if (!isProjectManager(user)) {
    return { data: null, error: 'Solo los Project Managers pueden asignar proyectos' };
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
    console.error('Error al asignar proyecto:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// Actualizar un proyecto (solo para Project Managers)
export async function updateProject(
  user: UserWithRole, 
  projectId: string,
  updates: Partial<Project>
): Promise<{ data: Project | null, error: string | null }> {
  if (!isProjectManager(user)) {
    return { data: null, error: 'Solo los Project Managers pueden editar proyectos' };
  }

  // Proteger campos que no deben ser editados directamente
  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.created_at;
  delete safeUpdates.client_id; // No permitir cambiar el cliente

  const { data, error } = await supabase
    .from('projects')
    .update(safeUpdates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar proyecto:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// Eliminar un proyecto (solo para Project Managers)
export async function deleteProject(
  user: UserWithRole, 
  projectId: string
): Promise<{ success: boolean, error: string | null }> {
  if (!isProjectManager(user)) {
    return { success: false, error: 'Solo los Project Managers pueden eliminar proyectos' };
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error al eliminar proyecto:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Cambiar el estado de un proyecto (solo para Project Managers)
export async function updateProjectStatus(
  user: UserWithRole, 
  projectId: string,
  status: ProjectStatus
): Promise<{ data: Project | null, error: string | null }> {
  if (!isProjectManager(user)) {
    return { data: null, error: 'Solo los Project Managers pueden cambiar el estado de los proyectos' };
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar estado del proyecto:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
} 