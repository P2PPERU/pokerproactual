import React, { useState, useRef } from "react";
import { autocompleteJugadores, buscarStatsJugador, obtenerAnalisisJugador } from "../api/jugadores";

interface StatsJugador {
  nick: string;
  vpip: number;
  pfr: number;
  threebet: number;
  // ...otros stats según tu backend
}

const GeneradorEV: React.FC = () => {
  const [nick, setNick] = useState("");
  const [sala] = useState("XPK"); // Cambia si tienes más salas
  const [stats, setStats] = useState<StatsJugador | null>(null);
  const [analisis, setAnalisis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const serverUrl = "http://localhost:3000"; // Cambia por tu URL real
  const token = localStorage.getItem("token") || "";
  const inputRef = useRef<HTMLInputElement>(null);

  // Maneja el cambio en el input y busca sugerencias
  const handleNickChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNick(value);
    setStats(null);
    setAnalisis(null);
    setError(null);

    if (value.length >= 3) {
      try {
        const sugerencias = await autocompleteJugadores(value, sala, serverUrl);
        
        // SOLUCIÓN: Convertir objetos a strings
        // Si sugerencias es un array de objetos con player_name, extraer solo los nombres
        if (Array.isArray(sugerencias) && sugerencias.length > 0 && typeof sugerencias[0] === 'object') {
          setSuggestions(sugerencias.map((obj: any) => obj.player_name || ''));
        } else {
          // Si ya son strings o si no es un array, asegurar que sea array de strings
          setSuggestions(Array.isArray(sugerencias) ? sugerencias : []);
        }
        
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Selecciona una sugerencia
  const handleSuggestionClick = (suggestion: string) => {
    setNick(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) inputRef.current.blur();
  };

  // Buscar stats y análisis IA
  const buscarJugador = async () => {
    setLoading(true);
    setError(null);
    setStats(null);
    setAnalisis(null);

    try {
      const statsData = await buscarStatsJugador(nick, sala, token, serverUrl);
      setStats(statsData);

      const analisisData = await obtenerAnalisisJugador(nick, sala, token, serverUrl);
      
      // Extraer el texto del análisis correctamente
      let analisisTexto = "";
      
      if (analisisData.analisis) {
        if (typeof analisisData.analisis === 'string') {
          analisisTexto = analisisData.analisis;
        } else if (typeof analisisData.analisis === 'object' && analisisData.analisis.analisis) {
          analisisTexto = analisisData.analisis.analisis;
        } else {
          analisisTexto = JSON.stringify(analisisData.analisis);
        }
      }
      
      setAnalisis(analisisTexto);
    } catch (err: any) {
      setError(err.message || "Error al buscar jugador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(28,28,42,0.96)",
        borderRadius: 14,
        padding: 28,
        width: "360px",
        maxWidth: "97vw",
        margin: "0 auto",
        boxShadow: "0 4px 18px #2226",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Generador EV</h2>
      <div style={{ width: "100%", display: "flex", gap: 6, position: "relative" }}>
        <input
          type="text"
          ref={inputRef}
          autoComplete="off"
          placeholder="Nick del jugador"
          value={nick}
          onChange={handleNickChange}
          onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 7,
            border: "none",
            background: "#202038",
            color: "#fff",
            fontSize: 15,
            marginBottom: 0,
          }}
        />
        <button
          onClick={buscarJugador}
          disabled={loading || !nick}
          style={{
            padding: "10px 16px",
            borderRadius: 7,
            border: "none",
            background: "#5056fa",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          Buscar
        </button>
        {/* Sugerencias Autocomplete */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 42,
              left: 0,
              width: "100%",
              background: "#191940",
              borderRadius: 7,
              zIndex: 20,
              boxShadow: "0 4px 12px #1115",
              maxHeight: 190,
              overflowY: "auto"
            }}
          >
            {suggestions.map((s, i) => (
              <div
                key={i}
                onMouseDown={() => handleSuggestionClick(s)}
                style={{
                  padding: "9px 12px",
                  cursor: "pointer",
                  borderBottom: i === suggestions.length - 1 ? "none" : "1px solid #232344",
                  color: "#fff"
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
      {loading && <div style={{ marginTop: 18 }}>Buscando...</div>}
      {error && (
        <div style={{ marginTop: 16, color: "#ff6363", fontSize: 14 }}>
          {error}
        </div>
      )}
      {stats && (
        <div style={{ width: "100%", marginTop: 22 }}>
          <h3 style={{ fontSize: 17, marginBottom: 6 }}>Stats de {stats.nick}</h3>
          <ul style={{ paddingLeft: 0, listStyle: "none", fontSize: 15 }}>
            <li>VPIP: {stats.vpip} %</li>
            <li>PFR: {stats.pfr} %</li>
            <li>3Bet: {stats.threebet} %</li>
            {/* ...otros stats */}
          </ul>
        </div>
      )}
      {analisis && (
        <div
          style={{
            background: "#181833",
            marginTop: 18,
            borderRadius: 10,
            padding: 14,
            width: "100%",
            fontSize: 15,
            lineHeight: 1.6,
            textAlign: "justify",
          }}
        >
          <strong>Análisis IA:</strong>
          <br />
          {analisis}
        </div>
      )}
    </div>
  );
};

export default GeneradorEV;