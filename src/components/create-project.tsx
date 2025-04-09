"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { createProject, NewProject } from "@/lib/project-service"
import { uploadFiles } from "@/lib/storage-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/ui/form-error"
import { FileUpload } from "@/components/ui/file-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface CreateProjectButtonProps {
  onProjectCreated?: () => void;
}

export function CreateProjectButton({ onProjectCreated }: CreateProjectButtonProps) {
  const { user, isClient } = useAuth()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Solo mostrar el botón si el usuario es cliente
  if (!isClient) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!title.trim()) {
      setError("El título del proyecto es obligatorio")
      setLoading(false)
      return
    }

    if (!user) {
      setError("Debes iniciar sesión para crear un proyecto")
      setLoading(false)
      return
    }

    const newProject: NewProject = {
      title: title.trim(),
      description: description.trim() || null,
      client_id: user.id,
    }

    try {
      // 1. Crear el proyecto
      const { data: project, error } = await createProject(user, newProject)
      
      if (error) {
        setError(error)
        setLoading(false)
        return
      }

      // 2. Si hay archivos, subirlos
      if (files.length > 0 && project) {
        setUploadingFiles(true)
        await uploadFiles(files, project.id)
        setUploadingFiles(false)
      }
      
      // Éxito: cerrar el diálogo y limpiar el formulario
      setOpen(false)
      setTitle("")
      setDescription("")
      setFiles([])
      
      // Llamar a la función de actualización si se proporcionó
      if (onProjectCreated) {
        onProjectCreated()
      }
      
    } catch (err) {
      console.error("Error al crear proyecto:", err)
      setError("Ha ocurrido un error inesperado")
    } finally {
      setLoading(false)
      setUploadingFiles(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <PlusCircle className="h-6 w-6" />
          <span className="sr-only">Crear proyecto</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Completa los datos para crear un nuevo proyecto.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <FormError message={error || undefined} />}
          
          <div className="space-y-2">
            <Label htmlFor="title">Título del Proyecto</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título del proyecto"
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Describe tu proyecto (opcional)"
              className="w-full min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Archivos</Label>
            <FileUpload 
              onChange={setFiles} 
              value={files} 
              multiple={true}
              label="Subir archivos del proyecto"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || uploadingFiles}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploadingFiles}>
              {loading 
                ? "Creando..." 
                : uploadingFiles 
                  ? "Subiendo archivos..." 
                  : "Crear Proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 