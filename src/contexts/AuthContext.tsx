"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { UserWithRole, getCurrentUserWithRole, isClient, isProjectManager, isDesigner } from "@/lib/role-service";

type AuthContextType = {
  user: UserWithRole | null;
  isLoading: boolean;
  isClient: boolean;
  isProjectManager: boolean;
  isDesigner: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isClient: false,
  isProjectManager: false,
  isDesigner: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    setIsLoading(true);
    const userData = await getCurrentUserWithRole();
    setUser(userData);
    setIsLoading(false);
  };

  useEffect(() => {
    // Comprobar si hay una sesión activa al cargar
    refreshUser();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          await refreshUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isClient: isClient(user),
    isProjectManager: isProjectManager(user),
    isDesigner: isDesigner(user),
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 