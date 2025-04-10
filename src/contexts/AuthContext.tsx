'use client';

import { getUser } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

export type UserType = {
  id?: string;
  name?: string;
  email?: string;
  role?: 'client' | 'project_manager' | 'designer';
  role_id?: number;
  full_name?: string;
};

export type AuthContextType = {
  user: UserType | null;
  isLoading: boolean;
  isClient: boolean;
  isProjectManager: boolean;
  isDesigner: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: UserType | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isClient: false,
  isProjectManager: false,
  isDesigner: false,
  signOut: async () => {},
  refreshUser: async () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUserState] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = (user: UserType | null) => {
    if (user?.id) {
      localStorage.setItem('userId', user.id);
    } else {
      localStorage.removeItem('userId');
    }
  };

  const signOut = async () => {
    localStorage.removeItem('userId');
    setUserState(null);
    router.push('/login'); // o a la ruta que desees
  };

  const refreshUser = async () => {
    try {
      const id = localStorage.getItem('userId');
      if (!id) throw new Error('No hay ID de usuario');

      const res = await getUser(id);
      if (res.user) {
        setUserState(res.user);
      } else {
        throw res.error || new Error('Usuario no encontrado');
      }
    } catch (err) {
      console.error('Error cargando usuario', err);
      setUserState(null);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedId = localStorage.getItem('userId');
        if (storedId) {
          await refreshUser();
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const isClient = user?.role_id === 1;
  const isProjectManager = user?.role_id === 2;
  const isDesigner = user?.role_id === 3;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isClient,
        isProjectManager,
        isDesigner,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
