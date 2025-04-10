import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'project-files'

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  path: string;
  url: string;
  type: string;
  project_id: string; // Cambiado a snake_case
  created_at: string;
}

export type Bucket = {
  id: string;
  name: string;
  owner: string;
  public: boolean;
  file_size_limit: number | null;
  allowed_mime_types: string[] | null;
  created_at: string; 
  updated_at: string; 
};
/**
 * Inicializa el bucket si no existe
 */
export default async function initStorage(): Promise<void> {
  // Verificar si el bucket ya existe
  const res = await fetch('/api/buckets');
  const data = await res.json();
  console.log(data)
  const bucketExists = data.buckets.some((bucket:Bucket) => bucket.name === BUCKET_NAME);
  if (!bucketExists) {
    // Crear bucket si no existe
    console.error('El bucket no existe. Debe crearse desde el panel de administración.');
    throw new Error('El bucket de almacenamiento no está configurado');
  }
}

/**
 * Sube un archivo al storage de Supabase
 */
export async function uploadFile(
  file: File, 
  project_id: string
): Promise<FileInfo | null> {
  try {
    // Asegurar que el bucket exista
    await initStorage();
    
    // Verificar que el archivo sea válido
    if (!file || file.size === 0) {
      console.error("Archivo inválido o vacío");
      return null;
    }
    
    // Crear un ID único para el archivo
    const fileId = uuidv4();
    const fileName = file.name;
    
    // Obtener extensión del archivo
    const fileExt = fileName.split('.').pop() || '';
    
    // Crear path para el archivo
    const filePath = `${project_id}/${fileId}.${fileExt}`;
    
    // Subir archivo
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error al subir archivo:', uploadError);
      return null;
    }
    
    // Obtener URL del archivo
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
      console.error("No se pudo obtener la URL del archivo");
      // Intentar eliminar el archivo si no se pudo obtener la URL
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return null;
    }
    
    // Crear entrada en la base de datos con la información del archivo
    const fileInfo: FileInfo = {
      id: fileId,
      name: fileName,
      size: file.size,
      path: filePath,
      url: urlData.publicUrl,
      type: file.type,
      project_id,
      created_at: new Date().toISOString()
    };
    
    // Guardar la información del archivo en la tabla project_files
    const { error: dbError } = await supabase
      .from('project_files')
      .insert(fileInfo);
    
    if (dbError) {
      console.error('Error al guardar información del archivo:', dbError);
      // Si hay error al guardar en DB, eliminar archivo
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return null;
    }
    
    console.log(`Archivo ${fileName} subido correctamente con ID: ${fileId}`);
    return fileInfo;
  } catch (error) {
    console.error('Error inesperado al subir archivo:', error);
    return null;
  }
}

/**
 * Sube múltiples archivos
 */
export async function uploadFiles(
  files: File[], 
  project_id: string
): Promise<FileInfo[]> {
  const results: FileInfo[] = [];
  
  for (const file of files) {
    const fileInfo = await uploadFile(file, project_id);
    if (fileInfo) {
      results.push(fileInfo);
    }
  }
  
  return results;
}

/**
 * Obtiene los archivos de un proyecto
 */
export async function getProjectFiles(project_id: string): Promise<FileInfo[]> {
  try {
    const res = await fetch(`/api/projects/${project_id}/files`);

    if (!res.ok) {
      console.error('Error al obtener archivos del proyecto');
      return [];
    }
    console.log(res)
    const { files } = await res.json();
    return files;
  } catch (error) {
    console.error('Error inesperado al obtener archivos:', error);
    return [];
  }
}

/**
 * Elimina un archivo
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    // Obtener información del archivo
    const { data, error } = await supabase
      .from('project_files')
      .select('path')
      .eq('id', fileId)
      .single();
    
    if (error || !data) {
      console.error('Error al obtener información del archivo:', error);
      return false;
    }
    
    // Eliminar archivo del storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([data.path]);
    
    if (storageError) {
      console.error('Error al eliminar archivo del storage:', storageError);
      return false;
    }
    
    // Eliminar registro de la base de datos
    const { error: dbError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);
    
    if (dbError) {
      console.error('Error al eliminar registro del archivo:', dbError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error inesperado al eliminar archivo:', error);
    return false;
  }
} 