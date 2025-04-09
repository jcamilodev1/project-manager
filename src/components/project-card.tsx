import { Project } from "@/lib/project-service"
import { Button } from "@/components/ui/button"
import { ProjectActions } from "@/components/project-actions"

interface ProjectCardProps {
  project: Project
  onProjectUpdated: () => Promise<void>
  designers: Array<{ id: string; email: string; fullName: string | null }>
  onViewDetails: (project: Project) => void
}

export function ProjectCard({ 
  project, 
  onProjectUpdated, 
  designers, 
  onViewDetails 
}: ProjectCardProps) {
  return (
    <div 
      className="p-6 border-2 border-gray-200 rounded-xl bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="flex justify-between mb-2">
        <h2 className="text-xl font-semibold">{project.title}</h2>
        <ProjectActions 
          project={project} 
          onProjectUpdated={onProjectUpdated}
          designers={designers}
        />
      </div>
      <p className="text-muted-foreground mb-4">
        {project.description || "Sin descripción"}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
          {project.status}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          className="hover:bg-primary hover:text-primary-foreground"
          onClick={() => onViewDetails(project)}
        >
          Ver Detalles
        </Button>
      </div>
    </div>
  )
}