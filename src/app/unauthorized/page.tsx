"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function UnauthorizedPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
      <header className="py-4 px-6 flex justify-between items-center shadow-sm">
        <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
          Grayola
        </Link>
        <ModeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H9m1.5-1H12l-3 3m0 0l-3-3H9m1.5-1v1M9 7v3m0 0v4m0-4h2" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold">Acceso Restringido</h1>
          
          <p className="text-lg text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
          
          {user && (
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium">
                Has iniciado sesión como <span className="font-bold">{user.email}</span>
              </p>
              <p className="text-sm">
                Tu rol actual es <span className="font-bold">{user.roleName}</span>
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-3 pt-2">
            <Button asChild>
              <Link href="/dashboard">
                Ir al Dashboard
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/">
                Volver al Inicio
              </Link>
            </Button>
            
            {user && (
              <Button variant="ghost" onClick={signOut}>
                Cerrar Sesión
              </Button>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Grayola. Todos los derechos reservados.
      </footer>
    </div>
  );
} 