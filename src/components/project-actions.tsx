"use client"

import { useState } from "react"
import { MoreVertical, Edit, Trash, UserPlus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Project, 
  updateProject, 
  deleteProject, 
  assignProjectToDesigner,
  ProjectStatus,
  Designer
} from "@/lib/project-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/ui/form-error"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectActionsProps {
  project: Project
  onProjectUpdated: () => void
  designers?: Designer[]
}

export function ProjectActions({ project, onProjectUpdated, designers = [] }: ProjectActionsProps) {
  const { user, isProjectManager } = useAuth()
  const [openEdit, setOpenEdit] = useState(false)
  const [openAssign, setOpenAssign] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  
  // Estados para edición
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description || "")
  const [status, setStatus] = useState(project.status)
  const [selectedDesignerId, setSelectedDesignerId] = useState(project.designer_id || "")
  
  // Estados para carga y errores
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Si no es project manager, no mostrar acciones
  if (!isProjectManager) return null
  
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    if (!title.trim()) {
      setError("El título es obligatorio")
      setLoading(false)
      return
    }
    
    if (!user) return
    
    try {
      const updates = {
        title: title.trim(),
        description: description.trim() || null,
        status: status as ProjectStatus
      }
      
      const { error } = await updateProject(user, project.id, updates)
      
      if (error) {
        setError(error)
        setLoading(false)
        return
      }
      
      setOpenEdit(false)
      onProjectUpdated()
    } catch (err) {
      console.error("Error al actualizar proyecto:", err)
      setError("Ha ocurrido un error inesperado")
    } finally {
      setLoading(false)
    }
  }
  
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    if (!selectedDesignerId) {
      setError("Debes seleccionar un diseñador")
      setLoading(false)
      return
    }
    
    if (!user) return
    
    try {
      const { error } = await assignProjectToDesigner(user, project.id, selectedDesignerId)
      
      if (error) {
        setError(error)
        setLoading(false)
        return
      }
      
      setOpenAssign(false)
      onProjectUpdated()
    } catch (err) {
      console.error("Error al asignar proyecto:", err)
      setError("Ha ocurrido un error inesperado")
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async () => {
    setError(null)
    setLoading(true)
    
    if (!user) return
    
    try {
      const { error } = await deleteProject(user, project.id)
      
      if (error) {
        setError(error)
        setLoading(false)
        return
      }
      
      setOpenDelete(false)
      onProjectUpdated()
    } catch (err) {
      console.error("Error al eliminar proyecto:", err)
      setError("Ha ocurrido un error inesperado")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      {/* Menú de acciones */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Abrir acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background ">
          <DropdownMenuItem 
            onClick={() => setOpenEdit(true)} 
            className="hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer hover:text-primary transition-colors duration-200"
          >
            <Edit className="h-4 w-4 mr-2" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setOpenAssign(true)} 
            className="hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer hover:text-primary transition-colors duration-200"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Asignar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setOpenDelete(true)}
            className="hover:bg-red-100 dark:hover:bg-gray-800 cursor-pointer text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            <Trash className="h-4 w-4 mr-2" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Diálogo de edición */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Proyecto</DialogTitle>
            <DialogDescription>
              Actualiza los detalles del proyecto.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            {error && <FormError message={error || undefined} />}
            
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título del Proyecto</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del proyecto"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Descripción del proyecto"
                className="w-full min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <select 
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value={ProjectStatus.PENDING}>Pendiente</option>
                <option value={ProjectStatus.ASSIGNED}>Asignado</option>
                <option value={ProjectStatus.IN_PROGRESS}>En Progreso</option>
                <option value={ProjectStatus.COMPLETED}>Completado</option>
                <option value={ProjectStatus.CANCELLED}>Cancelado</option>
              </select>
            </div>
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenEdit(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de asignación */}
      <Dialog open={openAssign} onOpenChange={setOpenAssign}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Asignar Proyecto</DialogTitle>
            <DialogDescription>
              Asigna este proyecto a un diseñador.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAssign} className="space-y-4 py-4">
            {error && <FormError message={error || undefined} />}
            
            <div className="space-y-2">
              <Label htmlFor="designer">Seleccionar Diseñador</Label>
              {designers.length > 0 ? (
                <select 
                  id="designer"
                  value={selectedDesignerId}
                  onChange={(e) => setSelectedDesignerId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Seleccionar un diseñador</option>
                  {designers.map(designer => (
                    <option key={designer.id} value={designer.id}>
                      {designer.full_name || designer.email}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay diseñadores disponibles. Debes tener al menos un usuario con rol de Diseñador.
                </p>
              )}
            </div>
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenAssign(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || designers.length === 0}
              >
                {loading ? "Asignando..." : "Asignar Proyecto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Proyecto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {error && <FormError message={error || undefined} />}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDelete(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleDelete}
                disabled={loading}
                variant="destructive"
              >
                {loading ? "Eliminando..." : "Eliminar Proyecto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 