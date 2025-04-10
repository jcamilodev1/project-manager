
// Definición de roles
export enum Role {
  CLIENT = 1,
  PROJECT_MANAGER = 2,
  DESIGNER = 3
}

// Interface para usuario con rol
export interface UserWithRole {
  id?: string;
  email?: string;
  role_id?: number;
  roleName?: string;
  full_name?: string | null;
  role?: string;
}


// Verificar si el usuario tiene un rol específico
export function hasRole(user: UserWithRole | null, role: Role): boolean {
  return user?.role_id === role;
}


// Verificar si el usuario es cliente
export function isClient(user: UserWithRole | null): boolean {
  console.log(user)
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
