import { Role } from "./role-service";

export async function createUserWithRole(
  email: string,
  password: string,
  role: Role,
  fullName: string
) {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role, fullName }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: new Error(data.error || 'Error desconocido') };
    }

    return { user: data.user };
  } catch (error) {
    console.error('Error en createUserWithRole:', error);
    return { error: new Error('Error inesperado al registrar usuario') };
  }
}

export async function getUser(
  id: string | undefined
) {
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: new Error(data.error || 'Error desconocido') };
    }

    return { user: data.user };
  } catch (error) {
    console.error('Error en createUserWithRole:', error);
    return { error: new Error('Error inesperado al registrar usuario') };
  }
}
