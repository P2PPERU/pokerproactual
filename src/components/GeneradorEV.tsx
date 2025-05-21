import React, { useState, useRef, useEffect } from "react";
import { autocompleteJugadores, buscarStatsJugador, obtenerAnalisisJugador } from "../api/jugadores";
import { loadStatsConfig, DEFAULT_STATS } from "../utils/statsConfig";

// Función para determinar el color basado en el valor y la métrica
const getStatColor = (stat: string, value: string | number): string => {
  if (value === "N/A" || value === undefined || value === null) {
    return "#ffffff"; // Color neutral para valores indefinidos
  }
  
  // Convertir a número si es un string
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  // Si no es un número válido, devolver color neutral
  if (isNaN(numValue)) {
    return "#ffffff";
  }
  
  // Definir rangos de colores para cada estadística
  switch (stat.toLowerCase()) {
    // Preflop stats
    case "vpip":
      if (numValue < 15) return "#67b7ff"; // Muy tight (azul claro)
      if (numValue <= 25) return "#44f7a3"; // Óptimo (verde)
      if (numValue <= 40) return "#f7d344"; // Loose (amarillo)
      return "#ff6b6b"; // Muy loose (rojo)
      
    case "pfr":
      if (numValue < 10) return "#67b7ff"; // Pasivo (azul claro)
      if (numValue <= 20) return "#44f7a3"; // Óptimo (verde)
      if (numValue <= 30) return "#f7d344"; // Agresivo (amarillo)
      return "#ff6b6b"; // Muy agresivo (rojo)
      
    case "three_bet":
    case "threebet":
    case "3 bet":
      if (numValue < 4) return "#67b7ff"; // Pasivo (azul claro)
      if (numValue <= 9) return "#44f7a3"; // Óptimo (verde)
      if (numValue <= 15) return "#f7d344"; // Agresivo (amarillo)
      return "#ff6b6b"; // Muy agresivo (rojo)
      
    case "fold_to_3bet_pct":
    case "fold to 3-bet":
      if (numValue < 50) return "#44f7a3"; // Óptimo (verde) - no se deja intimidar
      if (numValue <= 70) return "#f7d344"; // Regular (amarillo)
      return "#ff6b6b"; // Débil (rojo) - se deja intimidar mucho
      
    case "four_bet_preflop_pct":
    case "4-bet":
      if (numValue < 3) return "#67b7ff"; // Pasivo (azul claro)
      if (numValue <= 7) return "#44f7a3"; // Óptimo (verde)
      if (numValue <= 12) return "#f7d344"; // Agresivo (amarillo)
      return "#ff6b6b"; // Muy agresivo (rojo)
      
    case "fold_to_4bet_pct":
    case "fold to 4-bet":
      if (numValue < 40) return "#44f7a3"; // Óptimo (verde) - defiende su rango
      if (numValue <= 65) return "#f7d344"; // Regular (amarillo)
      return "#ff6b6b"; // Débil (rojo) - no defiende su rango
      
    // Postflop stats  
    case "cbet_flop":
      if (numValue < 40) return "#67b7ff"; // Pasivo (azul claro)
      if (numValue <= 70) return "#44f7a3"; // Óptimo (verde)
      if (numValue <= 85) return "#f7d344"; // Agresivo (amarillo)
      return "#ff6b6b"; // Muy agresivo (rojo)
      
    case "cbet_turn":
      if (numValue < 30) return "#67b7ff"; // Pasivo (azul claro)
      if (numValue <= 60) return "#44f7a3"; // Óptimo (verde)
      if (numValue <= 75) return "#f7d344"; // Agresivo (amarillo)
      return "#ff6b6b"; // Muy agresivo (rojo)
      
    case "fold_to_flop_cbet_pct":
    case "fold to flop cbet":
      if (numValue < 30) return "#44f7a3"; // Óptimo (verde) - no se deja intimidar
      if (numValue <= 50) return "#f7d344"; // Regular (amarillo)
      return "#ff6b6b"; // Débil (rojo) - se deja intimidar mucho
      
    case "fold_to_turn_cbet_pct":
    case "fold to turn cbet":
      if (numValue < 40) return "#44f7a3"; // Óptimo (verde) - no se deja intimidar
      if (numValue <= 60) return "#f7d344"; // Regular (amarillo)
      return "#ff6b6b"; // Débil (rojo) - se deja intimidar mucho
      
    case "wtsd":
      if (numValue < 20) return "#67b7ff"; // Tight (azul claro)
      if (numValue <= 30) return "#44f7a3"; // Óptimo (verde)
      if (numValue <= 40) return "#f7d344"; // Loose (amarillo)
      return "#ff6b6b"; // Muy loose (rojo)
      
    case "wsd":
      if (numValue < 45) return "#ff6b6b"; // Malo (rojo)
      if (numValue <= 52) return "#f7d344"; // Regular (amarillo)
      if (numValue <= 60) return "#44f7a3"; // Bueno (verde)
      return "#67b7ff"; // Excelente (azul claro)
      
    // Datos adicionales
    case "limp_pct":
    case "limp %":
      if (numValue < 5) return "#44f7a3"; // Óptimo (verde)
      if (numValue <= 15) return "#f7d344"; // Regular (amarillo)
      return "#ff6b6b"; // Malo (rojo)
      
    case "limp_raise_pct":
    case "limp-raise %":
      if (numValue < 2) return "#44f7a3"; // Óptimo (verde)
      if (numValue <= 5) return "#f7d344"; // Regular (amarillo)
      return "#ff6b6b"; // Sospechoso (rojo)
    
    case "winrate":
    case "bb_100":
      if (numValue < 0) return "#ff6b6b"; // Perdedor (rojo)
      if (numValue <= 3) return "#f7d344"; // Breakeven/pequeño ganador (amarillo)
      if (numValue <= 10) return "#44f7a3"; // Buen ganador (verde)
      return "#67b7ff"; // Crushea (azul claro)
      
    // Para métricas no categorizadas específicamente
    default:
      return "#ffffff"; // Color neutral
  }
};

// Definiciones de tooltips para cada estadística
const statTooltips: Record<string, string> = {
  "total_manos": "Número total de manos registradas para este jugador",
  "bb_100": "Ganancias/pérdidas en big blinds por cada 100 manos jugadas",
  "win_usd": "Ganancias/pérdidas totales en dólares",
  
  "vpip": "Voluntarily Put Money In Pot - % de veces que el jugador pone dinero voluntariamente en el bote preflop",
  "pfr": "Pre-Flop Raise - % de veces que el jugador sube preflop",
  "three_bet": "% de veces que el jugador hace 3-bet preflop (re-sube sobre una subida)",
  "fold_to_3bet_pct": "% de veces que el jugador se retira ante un 3-bet",
  "four_bet_preflop_pct": "% de veces que el jugador hace 4-bet preflop",
  "fold_to_4bet_pct": "% de veces que el jugador se retira ante un 4-bet",
  
  "cbet_flop": "Continuation Bet - % de veces que el jugador apuesta en el flop después de haber subido preflop",
  "cbet_turn": "Continuation Bet - % de veces que el jugador apuesta en el turn después de haber apostado en el flop",
  "fold_to_flop_cbet_pct": "% de veces que el jugador se retira ante una c-bet en el flop",
  "fold_to_turn_cbet_pct": "% de veces que el jugador se retira ante una c-bet en el turn",
  "wtsd": "Went To ShowDown - % de veces que el jugador llega a mostrar sus cartas",
  "wsd": "Won at ShowDown - % de veces que el jugador gana cuando llega a mostrar sus cartas",
  
  "limp_pct": "% de veces que el jugador hace limp preflop (iguala la ciega grande sin subir)",
  "limp_raise_pct": "% de veces que el jugador sube después de que alguien más haya hecho limp",
  "probe_bet_turn_pct": "% de veces que el jugador apuesta en el turn sin haber sido el último en apostar en el flop",
  "bet_river_pct": "% de veces que el jugador apuesta en el river",
  "fold_to_river_bet_pct": "% de veces que el jugador se retira ante una apuesta en el river",
  "wwsf": "Won When Saw Flop - % de veces que el jugador gana cuando ve el flop"
};

interface StatsJugador {
  nick: string;
  [key: string]: any;
}

const statsMapping: Record<string, string> = {
  "vpip": "vpip",
  "pfr": "pfr",
  "three_bet": "threebet",
  "fold_to_3bet_pct": "fold_to_3bet_pct",
  "four_bet_preflop_pct": "four_bet_preflop_pct",
  "fold_to_4bet_pct": "fold_to_4bet_pct",
  "cbet_flop": "cbet_flop",
  "cbet_turn": "cbet_turn",
  "wwsf": "wwsf",
  "wtsd": "wtsd",
  "wsd": "wsd",
};

const GeneradorEV: React.FC = () => {
  const [nick, setNick] = useState("");
  const [sala, setSala] = useState("XPK");
  const [stats, setStats] = useState<StatsJugador | null>(null);
  const [analisis, setAnalisis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsConfig, setStatsConfig] = useState(DEFAULT_STATS);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedStats, setSelectedStats] = useState<Record<string, boolean>>({});
  const [mesasDetectadas, setMesasDetectadas] = useState<string[]>([]);
  const [modoDeteccion, setModoDeteccion] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const serverUrl = "http://localhost:3000";
  const token = localStorage.getItem("token") || "";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await loadStatsConfig();
      if (config) setStatsConfig(config);
    };
    loadConfig();
  }, []);

  const handleNickChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNick(value);
    setStats(null);
    setAnalisis(null);
    setError(null);

    if (value.length >= 3) {
      try {
        const sugerencias = await autocompleteJugadores(value, sala, serverUrl);
        
        if (Array.isArray(sugerencias) && sugerencias.length > 0 && typeof sugerencias[0] === 'object') {
          setSuggestions(sugerencias.map((obj: any) => obj.player_name || ''));
        } else {
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

  const handleSuggestionClick = (suggestion: string) => {
    setNick(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) inputRef.current.blur();
  };

  // Función para redondear según regla especial
  const roundNumberSpecial = (value: any): string => {
    if (value === undefined || value === null || value === "" || isNaN(Number(value))) {
      return "N/A";
    }
    
    const numValue = parseFloat(value);
    const decimal = numValue - Math.floor(numValue);
    
    // Si el decimal es .51 o mayor, redondear hacia arriba
    // Si es .50 o menor, redondear hacia abajo
    if (decimal > 0.50) {
      return Math.ceil(numValue).toString();
    } else {
      return Math.floor(numValue).toString();
    }
  };

  const formatValue = (value: any, prefix: string = "", suffix: string = ""): string => {
    if (value === undefined || value === null || value === "" || value === "N/A") {
      return "N/A";
    }
    
    // Si es un valor numérico, aplicar el redondeo especial
    if (!isNaN(Number(value))) {
      return `${prefix}${roundNumberSpecial(value)}${suffix}`;
    }
    
    // Devolver el valor original si no es un número
    return `${prefix}${value}${suffix}`;
  };

  const normalizeData = (data: any): StatsJugador => {
    const normalized: any = { ...data };
    
    Object.entries(statsMapping).forEach(([backendKey, frontendKey]) => {
      if (normalized[backendKey] !== undefined) {
        normalized[frontendKey] = normalized[backendKey];
      }
    });

    return normalized;
  };

  const buscarJugador = async () => {
    setLoading(true);
    setError(null);
    setStats(null);
    setAnalisis(null);
    setSelectedStats({});

    try {
      const statsData = await buscarStatsJugador(nick, sala, token, serverUrl);
      console.log("Datos recibidos:", statsData);
      
      const normalizedStats = normalizeData(statsData);
      setStats(normalizedStats);

      const analisisData = await obtenerAnalisisJugador(nick, sala, token, serverUrl);
      
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

  const toggleStatSelection = (key: string) => {
    setSelectedStats(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copySelectedStats = () => {
    if (!stats) return;
    
    const selectedKeys = Object.entries(selectedStats)
      .filter(([_, selected]) => selected)
      .map(([key]) => key);
    
    if (selectedKeys.length === 0) {
      const defaultSelectedStats = statsConfig
        .filter(stat => stat.checked)
        .map(stat => stat.key);
      
      if (defaultSelectedStats.length === 0) {
        alert("No hay estadísticas seleccionadas para copiar");
        return;
      }
      
      const textToCopy = defaultSelectedStats
        .map(key => {
          const stat = statsConfig.find(s => s.key === key);
          if (!stat || !stats[key]) return null;
          return stat.format.replace('{value}', stats[key] || 'N/A');
        })
        .filter(Boolean)
        .join(" ");
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => console.error("Error al copiar: ", err));
    } else {
      const textToCopy = selectedKeys
        .map(key => {
          const stat = statsConfig.find(s => s.key === key);
          if (!stat || !stats[key]) return null;
          return `${stat.label}: ${stats[key]}`;
        })
        .filter(Boolean)
        .join(" ");
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => console.error("Error al copiar: ", err));
    }
  };

  const toggleDeteccionMesas = () => {
    setModoDeteccion(!modoDeteccion);
    if (!modoDeteccion) {
      // Simulación de detección de mesas
      setMesasDetectadas([
        "Mesa #1: NL50 [6 jugadores]",
        "Mesa #2: NL100 [9 jugadores]",
        "Mesa #3: NL25 [5 jugadores]"
      ]);
    } else {
      setMesasDetectadas([]);
    }
  };

  const handleSalaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSala(e.target.value);
    setStats(null);
    setAnalisis(null);
    setError(null);
    setSuggestions([]);
  };

  const formatAnalisisIA = (text: string): React.ReactNode => {
    if (!text) return null;
    
    const sections = {
      estilo: "",
      errores: "",
      explotacion: ""
    };
    
    const estiloMatch = text.match(/Estilo(.*?)(?=Errores|$)/s);
    const erroresMatch = text.match(/Errores(.*?)(?=Cómo explotarlo|$)/s);
    const explotacionMatch = text.match(/Cómo explotarlo(.*?)$/s);
    
    if (estiloMatch) sections.estilo = estiloMatch[1].trim();
    if (erroresMatch) sections.errores = erroresMatch[1].trim();
    if (explotacionMatch) sections.explotacion = explotacionMatch[1].trim();
    
    if (!sections.estilo && !sections.errores && !sections.explotacion) {
      return (
        <div style={{ whiteSpace: 'pre-line' }}>
          {text}
        </div>
      );
    }
    
    return (
      <div>
        {sections.estilo && (
          <>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#6F7CFF'
            }}>
              1️⃣ Estilo de juego:
            </div>
            <div style={{ marginBottom: '12px' }}>{sections.estilo}</div>
          </>
        )}
        
        {sections.errores && (
          <>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#6F7CFF'
            }}>
              2️⃣ Errores explotables:
            </div>
            <div style={{ marginBottom: '12px' }}>{sections.errores}</div>
          </>
        )}
        
        {sections.explotacion && (
          <>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#6F7CFF'
            }}>
              3️⃣ Cómo explotarlo:
            </div>
            <div>{sections.explotacion}</div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        background: "rgba(24, 28, 47, 0.97)",
        width: "100%",
        height: "100%",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        padding: "16px",
      }}
    >
      <h2 style={{ marginBottom: 16, fontSize: 28, fontWeight: 600, textAlign: "center" }}>Generador EV</h2>
      
      <div style={{ 
        display: "flex", 
        gap: 10, 
        alignItems: "center",
        marginBottom: 20,
        background: "#1a1d2e", 
        padding: "10px 20px", 
        borderRadius: 5
      }}>
        {/* Selector de sala */}
        <div style={{
          display: "flex",
          width: "90px",
          padding: "4px 8px",
          alignItems: "center",
          border: "1px solid #2d3047",
          borderRadius: "5px",
          background: "#2d3047",
          color: "#fff",
          position: "relative",
          cursor: "pointer"
        }}>
          <select
            value={sala}
            onChange={handleSalaChange}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#fff",
              appearance: "none",
              outline: "none",
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            <option value="XPK">XPK</option>
            <option value="PPP">PPPoker</option>
            <option value="SUP">SupremaPoker</option>
          </select>
          <span style={{ position: "absolute", right: 6, pointerEvents: "none", fontSize: 10 }}>▼</span>
        </div>
        
        {/* Input de búsqueda - ahora con borde azul oscuro en lugar de verde */}
        <div style={{ 
          position: "relative", 
          width: "450px"
        }}>
          <input
            type="text"
            ref={inputRef}
            autoComplete="off"
            placeholder="Buscar jugador..."
            value={nick}
            onChange={handleNickChange}
            onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            style={{
              width: "100%",
              padding: "6px 10px",
              borderRadius: 25,
              border: "2px solid #2c3e7e", // Cambiado de verde a azul oscuro
              background: "#151825",
              color: "#fff",
              fontSize: 14,
              height: 35
            }}
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 41,
                left: 0,
                width: "100%",
                background: "#20233A",
                borderRadius: 5,
                zIndex: 20,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                maxHeight: 150,
                overflowY: "auto"
              }}
            >
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onMouseDown={() => handleSuggestionClick(s)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: i === suggestions.length - 1 ? "none" : "1px solid #2C2C50",
                    color: "#fff",
                    fontSize: 13
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Espacio entre el input y el botón Buscar */}
        <div style={{ width: "30px" }}></div>
        
        {/* Botón Buscar - naranja */}
        <button
          onClick={buscarJugador}
          disabled={loading || !nick}
          style={{
            padding: "6px 20px",
            borderRadius: 5,
            border: "none",
            background: "#ff7b24", // Color naranja
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? "wait" : "pointer",
            height: 35,
            minWidth: "80px"
          }}
        >
          Buscar
        </button>
        
        {/* Espacio flexible */}
        <div style={{ flex: 1 }}></div>
        
        {/* Botón Detectar Mesas - con texto en dos líneas */}
        <button
          onClick={toggleDeteccionMesas}
          style={{
            padding: "5px 10px",
            borderRadius: 5,
            border: "none",
            background: modoDeteccion ? "#f44a54" : "#44a3f7",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            height: 50,
            width: "100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            lineHeight: "1.2"
          }}
        >
          <div>Detectar</div>
          <div>Mesas</div>
        </button>
        
        {/* Botón Copiar Stats - con texto en dos líneas */}
        {stats && (
          <button
            onClick={copySelectedStats}
            style={{
              padding: "5px 10px",
              borderRadius: 5,
              border: "none",
              background: "#44f7a3",
              color: "#222",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              height: 50,
              width: "100px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              lineHeight: "1.2"
            }}
          >
            <div>Copiar</div>
            <div>Stats</div>
          </button>
        )}
      </div>
      
      {modoDeteccion && mesasDetectadas.length > 0 && (
        <div style={{
          marginBottom: 20,
          background: "rgba(68, 163, 247, 0.1)",
          borderRadius: 10,
          padding: 15,
          border: "1px solid rgba(68, 163, 247, 0.3)"
        }}>
          <h3 style={{ marginBottom: 10, color: "#44a3f7" }}>Mesas Detectadas</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {mesasDetectadas.map((mesa, i) => (
              <div key={i} style={{
                background: "rgba(74, 84, 244, 0.2)",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(74, 84, 244, 0.4)",
                cursor: "pointer",
                fontSize: 14
              }}>
                {mesa}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {loading && (
        <div style={{ 
          margin: "20px 0", 
          display: "flex", 
          justifyContent: "center",
          alignItems: "center",
          height: 100
        }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: "50%", 
            border: "3px solid #4A54F4",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite"
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      {error && (
        <div style={{ 
          marginTop: 16, 
          color: "#ff6363", 
          fontSize: 14,
          padding: "10px 16px",
          background: "rgba(255, 99, 99, 0.1)",
          borderRadius: 8,
          border: "1px solid rgba(255, 99, 99, 0.3)"
        }}>
          {error}
        </div>
      )}

      {stats && (
        <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          gap: 20, 
          flexWrap: "wrap",
          height: "calc(100% - 150px)",
          overflow: "hidden"
        }}>
          {/* Panel izquierdo: Estadísticas */}
          <div style={{ 
            flex: 3, 
            minWidth: 600,
            display: "flex",
            flexDirection: "column",
            overflow: "auto"
          }}>
            {/* Nick destacado */}
            <div style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              color: "#6F7CFF", 
              marginBottom: 16, 
              textShadow: "0 2px 8px rgba(25, 25, 54, 0.5)",
              borderBottom: "1px solid #2d3047",
              paddingBottom: 8
            }}>
              {stats.nick}
            </div>
          
            {/* Primera fila de estadísticas principales */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 15
            }}>
              <StatBox
                title="MANOS JUGADAS"
                value={formatValue(stats.total_manos)}
                onClick={() => toggleStatSelection("total_manos")}
                isSelected={selectedStats["total_manos"]}
                statKey="total_manos"
              />
              <StatBox
                title="WINRATE"
                value={formatValue(stats.bb_100, "", " BB/100")}
                onClick={() => toggleStatSelection("bb_100")}
                isSelected={selectedStats["bb_100"]}
                statKey="bb_100"
              />
              <StatBox
                title="GANANCIAS USD"
                value={formatValue(stats.win_usd, "$")}
                onClick={() => toggleStatSelection("win_usd")}
                isSelected={selectedStats["win_usd"]}
                statKey="win_usd"
              />
            </div>
            
            {/* Segunda fila de estadísticas preflop */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 10,
              marginBottom: 15
            }}>
              <StatBox
                title="VPIP"
                value={formatValue(stats.vpip)}
                onClick={() => toggleStatSelection("vpip")}
                isSelected={selectedStats["vpip"]}
                statKey="vpip"
              />
              <StatBox
                title="PFR"
                value={formatValue(stats.pfr)}
                onClick={() => toggleStatSelection("pfr")}
                isSelected={selectedStats["pfr"]}
                statKey="pfr"
              />
              <StatBox
                title="3 BET"
                value={formatValue(stats.threebet || stats.three_bet)}
                onClick={() => toggleStatSelection("three_bet")}
                isSelected={selectedStats["three_bet"]}
                statKey="three_bet"
              />
              <StatBox
                title="FOLD TO 3-BET"
                value={formatValue(stats.fold_to_3bet_pct)}
                onClick={() => toggleStatSelection("fold_to_3bet_pct")}
                isSelected={selectedStats["fold_to_3bet_pct"]}
                statKey="fold_to_3bet_pct"
              />
              <StatBox
                title="4-BET"
                value={formatValue(stats.four_bet_preflop_pct)}
                onClick={() => toggleStatSelection("four_bet_preflop_pct")}
                isSelected={selectedStats["four_bet_preflop_pct"]}
                statKey="four_bet_preflop_pct"
              />
              <StatBox
                title="FOLD TO 4-BET"
                value={formatValue(stats.fold_to_4bet_pct)}
                onClick={() => toggleStatSelection("fold_to_4bet_pct")}
                isSelected={selectedStats["fold_to_4bet_pct"]}
                statKey="fold_to_4bet_pct"
              />
            </div>
            
            {/* Tercera fila de estadísticas postflop */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 10,
              marginBottom: 15
            }}>
              <StatBox
                title="CBET FLOP"
                value={formatValue(stats.cbet_flop)}
                onClick={() => toggleStatSelection("cbet_flop")}
                isSelected={selectedStats["cbet_flop"]}
                statKey="cbet_flop"
              />
              <StatBox
                title="CBET TURN"
                value={formatValue(stats.cbet_turn)}
                onClick={() => toggleStatSelection("cbet_turn")}
                isSelected={selectedStats["cbet_turn"]}
                statKey="cbet_turn"
              />
              <StatBox
                title="FOLD TO FLOP CBET"
                value={formatValue(stats.fold_to_flop_cbet_pct)}
                onClick={() => toggleStatSelection("fold_to_flop_cbet_pct")}
                isSelected={selectedStats["fold_to_flop_cbet_pct"]}
                statKey="fold_to_flop_cbet_pct"
              />
              <StatBox
                title="FOLD TO TURN CBET"
                value={formatValue(stats.fold_to_turn_cbet_pct)}
                onClick={() => toggleStatSelection("fold_to_turn_cbet_pct")}
                isSelected={selectedStats["fold_to_turn_cbet_pct"]}
                statKey="fold_to_turn_cbet_pct"
              />
              <StatBox
                title="WTSD"
                value={formatValue(stats.wtsd)}
                onClick={() => toggleStatSelection("wtsd")}
                isSelected={selectedStats["wtsd"]}
                statKey="wtsd"
              />
              <StatBox
                title="WSD"
                value={formatValue(stats.wsd)}
                onClick={() => toggleStatSelection("wsd")}
                isSelected={selectedStats["wsd"]}
                statKey="wsd"
              />
            </div>
            
            {/* Cuarta fila de estadísticas avanzadas */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 10
            }}>
              {stats.limp_pct !== undefined && (
                <StatBox
                  title="LIMP %"
                  value={formatValue(stats.limp_pct)}
                  onClick={() => toggleStatSelection("limp_pct")}
                  isSelected={selectedStats["limp_pct"]}
                  statKey="limp_pct"
                />
              )}
              {stats.limp_raise_pct !== undefined && (
                <StatBox
                  title="LIMP-RAISE %"
                  value={formatValue(stats.limp_raise_pct)}
                  onClick={() => toggleStatSelection("limp_raise_pct")}
                  isSelected={selectedStats["limp_raise_pct"]}
                  statKey="limp_raise_pct"
                />
              )}
              {stats.probe_bet_turn_pct !== undefined && (
                <StatBox
                  title="PROBE BET TURN"
                  value={formatValue(stats.probe_bet_turn_pct)}
                  onClick={() => toggleStatSelection("probe_bet_turn_pct")}
                  isSelected={selectedStats["probe_bet_turn_pct"]}
                  statKey="probe_bet_turn_pct"
                />
              )}
              {stats.bet_river_pct !== undefined && (
                <StatBox
                  title="BET RIVER %"
                  value={formatValue(stats.bet_river_pct)}
                  onClick={() => toggleStatSelection("bet_river_pct")}
                  isSelected={selectedStats["bet_river_pct"]}
                  statKey="bet_river_pct"
                />
              )}
              {stats.fold_to_river_bet_pct !== undefined && (
                <StatBox
                  title="FOLD TO RIVER BET"
                  value={formatValue(stats.fold_to_river_bet_pct)}
                  onClick={() => toggleStatSelection("fold_to_river_bet_pct")}
                  isSelected={selectedStats["fold_to_river_bet_pct"]}
                  statKey="fold_to_river_bet_pct"
                />
              )}
              {stats.wwsf !== undefined && (
                <StatBox
                  title="WWSF"
                  value={formatValue(stats.wwsf)}
                  onClick={() => toggleStatSelection("wwsf")}
                  isSelected={selectedStats["wwsf"]}
                  statKey="wwsf"
                />
              )}
            </div>
          </div>
          
          {/* Panel derecho: Análisis IA */}
          <div style={{ 
            flex: 2,
            minWidth: 350,
            maxWidth: 500
          }}>
            <div style={{ 
              background: "#1A1A38", 
              borderRadius: 10, 
              padding: 16,
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}>
              <h3 style={{ 
                marginTop: 0, 
                marginBottom: 16, 
                fontSize: 18,
                color: "#d0d0ff",
                paddingBottom: 8,
                borderBottom: "1px solid #2d3047"
              }}>
                Análisis IA:
              </h3>
              
              <div style={{ flex: 1, overflow: "auto" }}>
                {analisis ? (
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: "#eaeaea" }}>
                    {formatAnalisisIA(analisis)}
                  </div>
                ) : (
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    justifyContent: "center", 
                    alignItems: "center",
                    height: "80%",
                    color: "#8888a8",
                    fontSize: 14
                  }}>
                    <button
                      style={{
                        padding: "10px 18px",
                        marginBottom: "20px",
                        background: "#4A54F4",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      Solicitar Análisis IA
                    </button>
                    <div>Solicita un análisis IA para este jugador</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notificación de copiado */}
      {copySuccess && (
        <div style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "#4CAF50",
          color: "white",
          padding: "10px 20px",
          borderRadius: 8,
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          zIndex: 1000
        }}>
          ¡Stats copiados al portapapeles!
        </div>
      )}
    </div>
  );
};

// Componente StatBox mejorado con colores condicionales y tooltips
const StatBox: React.FC<{
  title: string;
  value: string;
  isSelected?: boolean;
  onClick?: () => void;
  statKey?: string; // Nueva prop para identificar el tipo de estadística
}> = ({ title, value, isSelected = false, onClick, statKey }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Usar la key en minúsculas para buscar el tooltip
  const tooltipKey = statKey ? statKey.toLowerCase() : title.toLowerCase();
  const tooltipText = statTooltips[tooltipKey] || `Estadística: ${title}`;
  
  // Obtener color condicional basado en el valor y tipo de estadística
  const valueColor = statKey ? getStatColor(statKey, value) : "#ffffff";
  
  return (
    <div
      style={{
        background: "#1A1A38",
        borderRadius: 6,
        padding: 10,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
        border: isSelected ? "1px solid #4A54F4" : "1px solid transparent",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Borde de selección */}
      {isSelected && (
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          background: "#4A54F4",
          width: 8,
          height: 8,
          borderBottomLeftRadius: 8
        }}/>
      )}
      
      {/* Título de la estadística */}
      <div style={{ 
        fontSize: 12, 
        fontWeight: "bold", 
        marginBottom: 4,
        color: "#8888a8"
      }}>
        {title}
      </div>
      
      {/* Valor con color condicional */}
      <div style={{ 
        fontSize: 18, 
        fontWeight: "bold",
        color: valueColor // Color condicional basado en el valor
      }}>
        {value}
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(42, 46, 70, 0.95)",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 6,
          fontSize: 12,
          width: "220px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
          zIndex: 100,
          pointerEvents: "none",
          marginBottom: 5,
          textAlign: "left",
          lineHeight: "1.4"
        }}>
          {tooltipText}
        </div>
      )}
    </div>
  );
};

export default GeneradorEV;