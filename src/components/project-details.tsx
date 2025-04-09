"use client"

import { useState, useEffect } from "react"
import { FileIcon, Download, User } from "lucide-react"
import { getProjectFiles, FileInfo } from "@/lib/storage-service"
import { Project } from "@/lib/project-service"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ProjectDetailsProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export function ProjectDetails({ project, isOpen, onClose }: ProjectDetailsProps) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFiles() {
      if (isOpen && project) {
        setLoading(true)
        try {
          const projectFiles = await getProjectFiles(project.id)
          setFiles(projectFiles)
        } catch (err) {
          console.error("Error al cargar archivos:", err)
          setError("No se pudieron cargar los archivos del proyecto")
        } finally {
          setLoading(false)
        }
      }
    }

    loadFiles()
  }, [isOpen, project])

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} bytes`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{project.title}</DialogTitle>
          <DialogDescription>
            {project.description || "Sin descripción"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Información del Proyecto */}
          <div className="space-y-2">
            <h3 className="font-medium">Información del Proyecto</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Estado:</div>
              <div className="font-medium">
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  {project.status}
                </span>
              </div>
              
              <div className="text-muted-foreground">Cliente:</div>
              <div>{project.client_id || "No disponible"}</div>
              
              <div className="text-muted-foreground">Diseñador asignado:</div>
              <div>
                {project.designer_id ? (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{project.designer_id}</span>
                  </div>
                ) : (
                  "No asignado"
                )}
              </div>

              <div className="text-muted-foreground">Fecha de creación:</div>
              <div>{new Date(project.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Archivos del Proyecto */}
          <div className="space-y-2">
            <h3 className="font-medium">Archivos del Proyecto</h3>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-t-2 border-primary rounded-full"></div>
              </div>
            ) : error ? (
              <div className="p-3 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
                {error}
              </div>
            ) : files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex bg-background items-center justify-between p-2 border border-gray-200 dark:border-gray-800 rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <FileIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{getFileSize(file.size)}</p>
                      </div>
                    </div>
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download
                      className="p-1 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Download className="h-4 w-4 text-gray-500 hover:text-primary" />
                      <span className="sr-only">Descargar</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay archivos en este proyecto
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 