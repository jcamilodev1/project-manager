"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/lib/role-service";

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  redirectTo = "/login",
}: RoleGuardProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y no hay usuario, redirigir
    if (!isLoading && !user) {
      router.push(redirectTo);
      return;
    }

    // Si hay usuario pero no tiene un rol permitido, redirigir
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }
  }, [user, isLoading, router, redirectTo, allowedRoles]);

  // Mientras carga, mostrar un indicador de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay usuario o no tiene un rol permitido, no mostrar nada
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  // Si todo está bien, mostrar los hijos
  return <>{children}</>;
};

export const ClientGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard allowedRoles={[Role.CLIENT]}>{children}</RoleGuard>
);

export const ProjectManagerGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard allowedRoles={[Role.PROJECT_MANAGER]}>{children}</RoleGuard>
);

export const DesignerGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard allowedRoles={[Role.DESIGNER]}>{children}</RoleGuard>
);

// Guard para múltiples roles (ej: Project Managers y Diseñadores)
export const StaffGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard 
    allowedRoles={[Role.PROJECT_MANAGER, Role.DESIGNER]}
  >
    {children}
  </RoleGuard>
); 