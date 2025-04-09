"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Project, getProjects } from "@/lib/project-service"
import { getDesigners } from "@/lib/user-service"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { CreateProjectButton } from "@/components/create-project"
import { ProjectDetails } from "@/components/project-details"
import { ProjectCard } from "@/components/project-card"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, signOut, isProjectManager } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [designers, setDesigners] = useState<Array<{ id: string; email: string; fullName: string | null }>>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estado para el diálogo de detalles
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Función para actualizar la lista de proyectos
  const refreshProjects = useCallback(async () => {
    console.log(user)
    if (!user) return;
    
    setLoadingProjects(true);
    try {
      const { data, error } = await getProjects(user);
      
      if (error) {
        console.error("Error fetching projects:", error);
        setError(error);
      } else {
        setProjects(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Ocurrió un error al cargar los proyectos");
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  // Función para cargar los diseñadores
  const loadDesigners = useCallback(async () => {
    if (!user || !isProjectManager) return;
    
    try {
      const { data, error } = await getDesigners(user);
      
      if (error) {
        console.error("Error fetching designers:", error);
      } else {
        setDesigners(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }, [user, isProjectManager]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
      return
    }

    if (user) {
      refreshProjects();
      
      // Cargar diseñadores solo si es Project Manager
      if (isProjectManager) {
        loadDesigners();
      }
    }
  }, [user, isLoading, router, refreshProjects, isProjectManager, loadDesigners]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/90">
        <div className="text-xl font-medium animate-pulse">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
      <header className="py-4 px-6 flex justify-between items-center shadow-sm">
        <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
          Grayola
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium mr-2">
            {user.roleName}: {user.email}
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
              Bienvenido, {user.fullName || user.email}!
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
                {user.roleName === "Cliente" 
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
  )
}