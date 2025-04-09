"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { UserWithRole, getCurrentUserWithRole, isClient, isProjectManager, isDesigner } from "@/lib/role-service"

type AuthContextType = {
  user: UserWithRole | null;
  isLoading: boolean;
  isClient: boolean;
  isProjectManager: boolean;
  isDesigner: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isClient: false,
  isProjectManager: false,
  isDesigner: false,
  signOut: async () => {},
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  const refreshUser = async () => {
    setIsLoading(true)
    console.log("first")
    const userData = await getCurrentUserWithRole()
    console.log(userData)
    setUser(userData)
    setIsLoading(false)
  }

  useEffect(() => {
    refreshUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log("Auth state changed:", event)
        if (event === "SIGNED_IN") {
          await refreshUser()
          console.log("Redirecting to dashboard")
          setTimeout(() => {
            router.push("/dashboard")
          }, 0)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          router.push("/login") // opcional
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/login")
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isClient: isClient(user),
    isProjectManager: isProjectManager(user),
    isDesigner: isDesigner(user),
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
