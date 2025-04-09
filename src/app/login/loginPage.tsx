"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

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

// Validación de contraseña (mínimo 6 caracteres)
const isValidPassword = (password: string) => {
  return password.length >= 6;
};

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    // Mostrar mensaje de éxito si se viene de registro exitoso
    if (searchParams?.get("registered") === "true") {
      setShowSuccessMessage(true);
    }
  }, [searchParams]);

  const validateForm = () => {
    let isValid = true;
    
    // Limpiar errores previos
    setEmailError(null);
    setPasswordError(null);
    
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
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      isValid = false;
    }
    
    return isValid;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("first")
    if (!validateForm()) {
      return;
    }
    
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })  

      if (error) {
        if (error.message.includes("Invalid login")) {
          setError("Email o contraseña incorrectos");
        } else {
          setError(error.message);
        }
        return;
      }

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
            <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>
          
          {showSuccessMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cuenta creada con éxito. Ya puedes iniciar sesión.
            </div>
          )}
          
          <FormError message={error || undefined} />
          
          <form onSubmit={handleSignIn} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base">Contraseña</Label>
                <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline hover:text-primary/80">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
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
            </div>
            
            <Button type="submit" variant="outline" className="w-full h-11 mt-2" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline hover:text-primary/80">
              Regístrate
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