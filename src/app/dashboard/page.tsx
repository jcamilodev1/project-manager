"use client";
import { useEffect, useState, useCallback } from "react";
import { ProjectCard } from "@/components/project-card";
import { getDesigners, getProjects, Project } from "@/lib/project-service";
import { Role, UserWithRole } from "@/lib/role-service";
import { Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProjectButton } from "@/components/create-project";
import { ProjectDetails } from "@/components/project-details";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/contexts/AuthContext";

interface Designer {
  id: string;
  full_name: string;
  email: string;
}

export default function DashboardPage() {
  const { signOut, user, refreshUser } = useAuth()

  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [designers, setDesigners] = useState<Designer[]>([]);
  
  // Estado para el diálogo de detalles
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const refreshProjects = useCallback(async () => {
    if (!user) return;
    const dataUser: UserWithRole = {
      id: user.id,
      email: user.email,
      role: user.role_id?.toString() || '', // asegurarse de que sea una cadena
      roleName: Role[Number(user.role_id)], // convertir explícitamente a número
      full_name: user.full_name
    };


    setLoadingProjects(true);
    try {
      const response = await getProjects(dataUser);
      const data = await getDesigners()
      console.log(data)
      setDesigners(data.designers)
      if (response.error) {
        throw new Error(response.error || "Error al obtener proyectos");
      }
      setProjects(response.data || []);

    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Error al cargar los proyectos");
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  useEffect(() => {
    refreshUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (user) {
      refreshProjects();
    }
    console.log(user)
  }, [user, refreshProjects]);
  const role = {
    1: "Cliente",
    3: "Diseñador",
    2: "Project Manager"
  }
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
      <header className="py-4 px-6 flex justify-between items-center shadow-sm">
        <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
          Grayola
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium mr-2">
            {role[user?.role_id as keyof typeof role]}: {user?.email}
          </span>
          <Button variant="ghost" onClick={signOut} className="hover:bg-primary/10">
            Cerrar Sesión
          </Button>
          <ModeToggle />
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Panel de Proyectos</h1>
            <p className="text-muted-foreground">
              Bienvenido, {user?.full_name || user?.email}!
            </p>
          </div>
          
          {loadingProjects ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg my-4">
              {error}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onProjectUpdated={refreshProjects}
                  designers={designers}
                  onViewDetails={(project) => {
                    setSelectedProject(project);
                    setShowDetailsDialog(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No hay proyectos</h3>
              <p className="text-muted-foreground mb-6">
                {user?.role_id === 1 
                  ? "¡Comienza creando tu primer proyecto!" 
                  : "Aún no hay proyectos asignados."}
              </p>
            </div>
          )}
        </div>
      </main>
      
      {/* Botón para crear proyecto (solo visible para clientes) */}
      <CreateProjectButton onProjectCreated={refreshProjects} />
      
      {/* Diálogo de detalles del proyecto */}
      {selectedProject && (
        <ProjectDetails 
          project={selectedProject}
          isOpen={showDetailsDialog}
          onClose={() => setShowDetailsDialog(false)}
        />
      )}
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Grayola. Todos los derechos reservados.
      </footer>
    </div>
  );
}
