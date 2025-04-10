"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Role } from "@/lib/role-service"
import { createUserWithRole } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/mode-toggle"
import { FormError, ErrorText } from "@/components/ui/form-error"
import { cn } from "@/lib/utils"

// Validación de email usando regex
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de contraseña
const isValidPassword = (password: string) => {
  // Al menos 6 caracteres, una letra minúscula, una mayúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role>(Role.CLIENT)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [fullNameError, setFullNameError] = useState<string | null>(null)

  const validateForm = () => {
    let isValid = true;
    
    // Limpiar errores previos
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setFullNameError(null);
    
    // Validar nombre completo
    if (!fullName.trim()) {
      setFullNameError("El nombre completo es obligatorio");
      isValid = false;
    }
    
    // Validar email
    if (!email) {
      setEmailError("El email es obligatorio");
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Formato de email no válido");
      isValid = false;
    }
    
    // Validar contraseña
    if (!password) {
      setPasswordError("La contraseña es obligatoria");
      isValid = false;
    } else if (!isValidPassword(password)) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres, incluir mayúsculas, minúsculas y números");
      isValid = false;
    }
    
    // Validar confirmación de contraseña
    if (!confirmPassword) {
      setConfirmPasswordError("Confirma tu contraseña");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      isValid = false;
    }
    
    return isValid;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true)
    setError(null)

    try {
      const { error } = await createUserWithRole(
        email, 
        password, 
        selectedRole,
        fullName
      );

      if (error) {
        if (error.message?.includes("email already registered")) {
          setError("Este email ya está registrado. Inicia sesión o utiliza otro email.");
        } else {
          setError(error.message || "Ha ocurrido un error al registrar el usuario");
        }
        return;
      }

      // Redirigir a login con mensaje de éxito
      router.push("/login?registered=true")
    } catch (err) {
      console.error(err)
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
      <header className="py-4 px-6 flex justify-between items-center shadow-sm">
        <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
          Grayola
        </Link>
        <ModeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Crear Cuenta</h1>
            <p className="text-muted-foreground">Regístrate para comenzar a usar Grayola</p>
          </div>
          
          <FormError message={error || undefined} />
          
          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base">Nombre Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Tu nombre completo"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fullNameError) setFullNameError(null);
                }}
                required
                className={cn("h-11 px-4", fullNameError && "border-red-300 focus:ring-red-400")}
              />
              {fullNameError && <ErrorText>{fullNameError}</ErrorText>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                required
                className={cn("h-11 px-4", emailError && "border-red-300 focus:ring-red-400")}
              />
              {emailError && <ErrorText>{emailError}</ErrorText>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-base">Rol</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={selectedRole === Role.CLIENT ? "default" : "outline"}
                  onClick={() => setSelectedRole(Role.CLIENT)}
                  className={cn(
                    "py-2 px-3 rounded-md text-sm font-medium transition-all relative",
                    selectedRole === Role.CLIENT 
                      ? "border-2 border-primary shadow-sm" 
                      : "hover:border-primary/50"
                  )}
                >
                  {selectedRole === Role.CLIENT && (
                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-foreground"></div>
                  )}
                  Cliente
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === Role.PROJECT_MANAGER ? "default" : "outline"}
                  onClick={() => setSelectedRole(Role.PROJECT_MANAGER)}
                  className={cn(
                    "py-2 px-3 rounded-md text-sm font-medium transition-all relative",
                    selectedRole === Role.PROJECT_MANAGER 
                      ? "border-2 border-primary shadow-sm" 
                      : "hover:border-primary/50"
                  )}
                >
                  {selectedRole === Role.PROJECT_MANAGER && (
                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-foreground"></div>
                  )}
                  Project Manager
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === Role.DESIGNER ? "default" : "outline"}
                  onClick={() => setSelectedRole(Role.DESIGNER)}
                  className={cn(
                    "py-2 px-3 rounded-md text-sm font-medium transition-all relative",
                    selectedRole === Role.DESIGNER 
                      ? "border-2 border-primary shadow-sm" 
                      : "hover:border-primary/50"
                  )}
                >
                  {selectedRole === Role.DESIGNER && (
                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary-foreground"></div>
                  )}
                  Diseñador
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                required
                className={cn("h-11 px-4", passwordError && "border-red-300 focus:ring-red-400")}
              />
              {passwordError && <ErrorText>{passwordError}</ErrorText>}
              {!passwordError && (
                <p className="text-xs text-muted-foreground mt-1">
                  La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número.
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                }}
                required
                className={cn("h-11 px-4", confirmPasswordError && "border-red-300 focus:ring-red-400")}
              />
              {confirmPasswordError && <ErrorText>{confirmPasswordError}</ErrorText>}
            </div>
            
            <Button type="submit" variant="outline" className="w-full h-11 mt-2" disabled={loading}>
              {loading ? "Creando cuenta..." : "Registrarse"}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline hover:text-primary/80">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Grayola. Todos los derechos reservados.
      </footer>
    </div>
  )
} 