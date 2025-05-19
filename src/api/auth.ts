// src/api/auth.ts
export async function loginUsuario(usuario: string, password: string) {
  const resp = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: usuario, password }),
  });

  if (!resp.ok) {
    let errorMsg = 'Credenciales incorrectas';
    try {
      const error = await resp.json();
      errorMsg = error?.mensaje || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await resp.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  return data;
}
