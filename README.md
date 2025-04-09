# Grayola App

Grayola es una aplicación web para la gestión de proyectos de diseño, permitiendo la colaboración entre clientes y diseñadores.

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Una cuenta en Supabase (para la base de datos y autenticación)

## Instrucciones de Instalación

1. Clona el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd grayola-app
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
```

3. Configura las variables de entorno:
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
src/
├── app/                    # Rutas y páginas de Next.js
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de interfaz base
│   └── ...              # Otros componentes específicos
├── contexts/             # Contextos de React
├── lib/                  # Utilidades y servicios
└── ...
```

## Arquitectura y Tecnologías

### Frontend
- **Next.js 14**: Framework de React para renderizado del lado del servidor
- **TypeScript**: Para tipado estático y mejor desarrollo
- **Tailwind CSS**: Para estilos y diseño responsive
- **Lucide Icons**: Biblioteca de iconos
- **shadcn/ui**: Componentes de UI reutilizables

### Backend
- **Supabase**: 
  - Base de datos PostgreSQL
  - Autenticación y autorización
  - Almacenamiento de archivos
  - APIs en tiempo real

### Características Principales

1. **Sistema de Autenticación**
   - Registro y inicio de sesión de usuarios
   - Roles diferenciados (Cliente, Diseñador, Project Manager)
   - Protección de rutas basada en roles

2. **Gestión de Proyectos**
   - Creación y edición de proyectos
   - Asignación de diseñadores
   - Sistema de estados del proyecto
   - Carga y gestión de archivos

3. **Interfaz Adaptativa**
   - Diseño responsive
   - Modo claro/oscuro
   - Componentes reutilizables
   - Feedback visual de acciones

## Flujo de Trabajo

1. **Clientes**:
   - Pueden crear nuevos proyectos
   - Ver el estado de sus proyectos
   - Subir archivos de referencia
   - Comunicarse con los diseñadores

2. **Diseñadores**:
   - Ver proyectos asignados
   - Actualizar el estado de los proyectos
   - Subir archivos de diseño
   - Comunicarse con los clientes

3. **Project Managers**:
   - Gestionar todos los proyectos
   - Asignar diseñadores
   - Supervisar el progreso
   - Administrar usuarios


## Desarrollo Local y Pruebas

Para ejecutar pruebas:
```bash
npm run test
# o
yarn test
```

Para crear una build de producción:
```bash
npm run build
# o
yarn build
```
