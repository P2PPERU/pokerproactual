// src/api/jugadores.ts

// Buscar sugerencias de nick (autocomplete)
export async function autocompleteJugadores(query: string, sala: string, serverUrl: string) {
  const url = `${serverUrl}/api/jugador/autocomplete/${sala}/${encodeURIComponent(query)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Error en autocomplete");
  return await resp.json(); // Espera un array de jugadores sugeridos
}

// Buscar stats de un jugador
export async function buscarStatsJugador(nick: string, sala: string, token: string, serverUrl: string) {
  const url = `${serverUrl}/api/jugador/${sala}/${encodeURIComponent(nick)}`;
  const resp = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!resp.ok) throw new Error("No se encontró el jugador");
  return await resp.json();
}

// Obtener análisis IA de un jugador
export async function obtenerAnalisisJugador(nick: string, sala: string, token: string, serverUrl: string) {
  const url = `${serverUrl}/api/jugador/${sala}/${encodeURIComponent(nick)}/analisis`;
  const resp = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!resp.ok) {
    let errorMsg = "Error al obtener análisis IA";
    try {
      const error = await resp.json();
      errorMsg = error?.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  
  // Simplemente devolver los datos tal como vienen - el procesamiento se hace en el componente
  return await resp.json();
}