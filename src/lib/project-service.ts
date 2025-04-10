import { supabase } from './supabase';
import { UserWithRole, isClient, isDesigner } from './role-service';
import { Database } from './database.types';
import { UserType } from '@/contexts/AuthContext';

export type Project = Database['public']['Tables']['projects']['Row'];

// Posibles estados de un proyecto
export enum ProjectStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
interface CreateProjectResponse {
  data: unknown;
  error?: string;
}

export interface NewProject {
  name: string;
  title?: string;
  description: string;
  client_id: string;
  files?: File[]; // si estás subiendo archivos
}

export async function createProject(
  user: UserType,
  project: NewProject,
  files?: File[]
): Promise<CreateProjectResponse> {
  const formData = new FormData();

  formData.append('name', project.name);
  formData.append('description', project.description);
  formData.append('client_id', project.client_id);
  formData.append('role', user?.role?.toString() || '');

  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append(`files`, file);
    });
  }
  console.log(files)
  const res = await fetch('/api/projects', {
    method: 'POST',
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    return { data: null, error: result.error || 'Error al crear el proyecto' };
  }

  return { data: result.project };
}

// Obtener proyectos según el rol del usuario
export async function getProjects(user: UserWithRole): Promise<{ data: Project[]; error: string | null }> {
  if (!user?.id || !user?.role) {
    return { data: [], error: 'Usuario inválido' };
  }

  try {
    const res = await fetch(`/api/projects/${user.id}/${user.role}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      const err = await res.json();
      return { data: [], error: err.error || 'Error al obtener proyectos' };
    }

    const { projects } = await res.json();
    return { data: projects, error: null };
  } catch (error: unknown) {

    let errorMessage = 'Error inesperado';
  
    if (error instanceof Error) {
      errorMessage = error.message;
    }
  
    return { data: [], error: errorMessage };
  }
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
): Promise<{ data: Project | null; error: string | null }> {
  if (user.role_id !== 2) {
    return {
      data: null,
      error: 'Solo los Project Managers pueden asignar proyectos',
    };
  }

  try {
    const res = await fetch(`/api/projects/${projectId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, designerId }),
    });

    const result = await res.json();

    if (!res.ok) {
      return { data: null, error: result.error || 'Error desconocido' };
    }

    return { data: result.project, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Error al asignar proyecto:', err);
    return { data: null, error: errorMsg };
  }
}

// Actualizar un proyecto (solo para Project Managers)
export async function updateProject(
  user: UserWithRole,
  projectId: string,
  updates: Partial<Project>
): Promise<{ data: Project | null; error: string | null }> {
  if (!user || user.role_id !== 2) {
    return { data: null, error: 'Solo los Project Managers pueden editar proyectos' };
  }

  const safeUpdates = { ...updates };
  delete safeUpdates.id;
  delete safeUpdates.created_at;
  delete safeUpdates.client_id;

  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, updates: safeUpdates }),
    });

    const json = await res.json();

    if (!res.ok) {
      return { data: null, error: json.error || 'Error al actualizar proyecto' };
    }

    return { data: json.project, error: null };
  } catch (err: unknown) {
    let errorMessage = 'Error inesperado';
  
    if (err instanceof Error) {
      errorMessage = err.message;
    }
  
    return { data: null, error: errorMessage };
  }
}

// Eliminar un proyecto (solo para Project Managers)
export async function deleteProject(
  user: UserWithRole,
  projectId: string
): Promise<{ success: boolean; error: string | null }> {
  console.log(user)
  if (!user || user.role_id !== 2) {
    return { success: false, error: 'Solo los Project Managers pueden eliminar proyectos' };
  }

  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user }),
    });

    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: json.error || 'Error al eliminar proyecto' };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    let errorMessage = 'Error inesperado';
  
    if (err instanceof Error) {
      errorMessage = err.message;
    }
  
    return { success: false, error: errorMessage };
  }
}

// Cambiar el estado de un proyecto (solo para Project Managers)
export async function updateProjectStatus(
  user: UserWithRole,
  projectId: string,
  status: ProjectStatus
): Promise<{ data: Project | null; error: string | null }> {
  if (!user || user.role_id !== 2) {
    return { data: null, error: 'Solo los Project Managers pueden cambiar el estado de los proyectos' };
  }

  try {
    const res = await fetch(`/api/projects/${projectId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, status }),
    });

    const json = await res.json();

    if (!res.ok) {
      return { data: null, error: json.error || 'Error al cambiar el estado' };
    }

    return { data: json.project, error: null };
  } catch (err: unknown) {
    let errorMessage = 'Error inesperado';
  
    if (err instanceof Error) {
      errorMessage = err.message;
    }
  
    return { data: null, error: errorMessage };
  }
}
export interface Designer {
  id: string;
  full_name: string;
  email: string;
}

export async function getDesigners(): Promise<{ designers: Designer[]; error: string | null }> {
  try {
    const res = await fetch('/api/designers');
    const result = await res.json();

    if (!res.ok) {
      return { designers: [], error: result.error || 'Error desconocido' };
    }

    return { designers: result.designers, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
    return { designers: [], error: errorMsg };
  }
}