import { Role } from '@/lib/role-service';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime';

export enum ProjectStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return Response.json(
      { error: 'Error de configuración del servidor' },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    const formData = await request.formData();
    console.log(formData)
    const name = formData.get('name')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const client_id = formData.get('client_id')?.toString() || '';
    const role = formData.get('role')?.toString() || Role.CLIENT;
    const files = formData.getAll('files') as File[];
    console.log(files)
    if (!name || !description || !client_id) {
      return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (role !== Role.CLIENT) {
      return Response.json({ error: 'Solo los clientes pueden crear proyectos' }, { status: 403 });
    }

    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        title: name,
        description,
        client_id,
        status: ProjectStatus.PENDING
      })
      .select()
      .single();

    if (insertError || !project) {
      return Response.json(
        { error: insertError?.message || 'Error al crear proyecto' },
        { status: 400 }
      );
    }

    // Subir archivos si existen
    if (files && files.length > 0) {
      const fileUploadPromises = files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const extension = mime.getExtension(file.type) || 'bin';
        const fileName = `${uuidv4()}.${extension}`;
        const filePath = `projects/${project.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true
          });

        if (uploadError) {
          console.error('Error al subir archivo:', uploadError);
          return { success: false, error: uploadError.message };
        }

        const publicUrl = supabase
          .storage
          .from('project-files')
          .getPublicUrl(filePath).data.publicUrl;

        const { error: insertFileError } = await supabase
          .from('project_files')
          .insert({
            name: file.name,
            size: file.size,
            path: filePath,
            type: file.type,
            url: publicUrl,
            project_id: project.id,
            created_at: new Date().toISOString()
          });

        if (insertFileError) {
          console.error('Error al registrar archivo:', insertFileError);
          return { success: false, error: insertFileError.message };
        }

        return { success: true, filePath, url: publicUrl };
      });

      const uploadResults = await Promise.all(fileUploadPromises);
      const failed = uploadResults.filter(f => !f.success);
      const successful = uploadResults.filter(f => f.success);

      if (failed.length === files.length) {
        return Response.json(
          { error: 'Proyecto creado pero todos los archivos fallaron al subir' },
          { status: 500 }
        );
      }

      return Response.json({
        project,
        uploaded_files: successful,
        ...(failed.length > 0 && {
          warning: `${failed.length} de ${files.length} archivos fallaron al subir`
        })
      }, { status: 201 });
    }

    return Response.json({ project }, { status: 201 });

  } catch (error) {
    console.error('Error inesperado al crear proyecto:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
