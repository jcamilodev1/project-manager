"use client"

import { useState, useRef } from "react"
import { Upload, X, FileIcon } from "lucide-react"
import { Button } from "./button"

interface FileUploadProps {
  onChange: (files: File[]) => void
  value?: File[]
  multiple?: boolean
  accept?: string
  label?: string
}

export function FileUpload({
  onChange,
  value = [],
  multiple = true,
  accept = "*/*",
  label = "Subir archivos"
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const newFiles = Array.from(e.target.files)
      if (multiple) {
        // Agregar nuevos archivos a los existentes
        const updatedFiles = [...files, ...newFiles]
        setFiles(updatedFiles)
        onChange(updatedFiles)
      } else {
        // Reemplazar archivo existente con el nuevo
        setFiles(newFiles)
        onChange(newFiles)
      }
    }
  }
  
  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove)
    setFiles(updatedFiles)
    onChange(updatedFiles)
    
    // Limpiar el input para permitir subir el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  
  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} bytes`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }
  
  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900/50"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-medium mb-1">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {multiple 
            ? "Arrastra archivos aquí o haz clic para seleccionar" 
            : "Arrastra un archivo aquí o haz clic para seleccionar"}
        </p>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Archivos seleccionados:</p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li 
                key={`${file.name}-${index}`} 
                className="flex items-center justify-between p-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium truncate max-w-[180px] md:max-w-[250px]">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{getFileSize(file.size)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile(index)
                  }}
                  className="h-6 w-6 text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 