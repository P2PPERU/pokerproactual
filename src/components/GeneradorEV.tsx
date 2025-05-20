// src/components/GeneradorEV.tsx - Versión mejorada
import React, { useState, useRef, useEffect } from "react";
import { autocompleteJugadores, buscarStatsJugador, obtenerAnalisisJugador } from "../api/jugadores";
import { loadStatsConfig, DEFAULT_STATS } from "../utils/statsConfig";

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
  const [sala] = useState("XPK");
  const [stats, setStats] = useState<StatsJugador | null>(null);
  const [analisis, setAnalisis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsConfig, setStatsConfig] = useState(DEFAULT_STATS);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedStats, setSelectedStats] = useState<Record<string, boolean>>({});

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
        background: "rgba(24, 28, 47, 0.97)", // Fondo más oscuro como en la imagen 1
        borderRadius: 14,
        padding: 24,
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 style={{ marginBottom: 20, fontSize: 28, fontWeight: 600 }}>Generador EV</h2>
      
      {/* Barra de búsqueda similar a la imagen 1 */}
      <div style={{ 
        width: "100%", 
        display: "flex", 
        gap: 10, 
        position: "relative",
        marginBottom: 20
      }}>
        <div style={{
          display: "flex",
          width: "150px",
          padding: "8px 16px",
          alignItems: "center",
          border: "1px solid #2d3047",
          borderRadius: "7px",
          background: "#2d3047",
          color: "#fff",
          marginRight: "10px"
        }}>
          <span>{sala}</span>
          <span style={{ marginLeft: 'auto' }}>▼</span>
        </div>
        <input
          type="text"
          ref={inputRef}
          autoComplete="off"
          placeholder="Buscar jugador por nombre o alias..."
          value={nick}
          onChange={handleNickChange}
          onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 7,
            border: "none",
            background: "#2d3047",
            color: "#fff",
            fontSize: 15,
            marginBottom: 0,
          }}
        />
        <button
          onClick={buscarJugador}
          disabled={loading || !nick}
          style={{
            padding: "12px 24px",
            borderRadius: 7,
            border: "none",
            background: "#4A54F4", // Similar al botón azul de la imagen 1
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
              top: 48,
              left: 0,
              width: "100%",
              background: "#20233A",
              borderRadius: 7,
              zIndex: 20,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              maxHeight: 190,
              overflowY: "auto"
            }}
          >
            {suggestions.map((s, i) => (
              <div
                key={i}
                onMouseDown={() => handleSuggestionClick(s)}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  borderBottom: i === suggestions.length - 1 ? "none" : "1px solid #2C2C50",
                  color: "#fff"
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
      
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
        <div style={{ width: "100%" }}>
          {/* Cabecera con info del jugador y botón de copiar - similar a la imagen 1 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16
          }}>
            <h3 style={{ 
              fontSize: 20, 
              color: "#d0d0ff",
              background: "#2d3047",
              padding: "8px 14px",
              borderRadius: 6,
              display: "inline-block"
            }}>
              {stats.nick}
            </h3>
            
            <button
              onClick={copySelectedStats}
              style={{
                background: "#2d3047",
                border: "none",
                borderRadius: 6,
                color: "white",
                padding: "8px 14px",
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>📋</span> Copiar Stats
            </button>
          </div>
          
          {/* Contenedor principal con dos columnas como en la imagen 1 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 20
          }}>
            {/* Panel izquierdo: Estadísticas */}
            <div>
              {/* Primera fila de estadísticas principales */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginBottom: 15
              }}>
                <StatBox
                  title="MANOS JUGADAS"
                  value={stats.total_manos || "N/A"}
                  onClick={() => toggleStatSelection("total_manos")}
                  isSelected={selectedStats["total_manos"]}
                />
                <StatBox
                  title="WINRATE"
                  value={`${stats.bb_100 || "N/A"} BB/100`}
                  onClick={() => toggleStatSelection("bb_100")}
                  isSelected={selectedStats["bb_100"]}
                />
                <StatBox
                  title="GANANCIAS USD"
                  value={`$${stats.win_usd || "N/A"}`}
                  onClick={() => toggleStatSelection("win_usd")}
                  isSelected={selectedStats["win_usd"]}
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
                  value={`${stats.vpip || "N/A"}`}
                  onClick={() => toggleStatSelection("vpip")}
                  isSelected={selectedStats["vpip"]}
                />
                <StatBox
                  title="PFR"
                  value={`${stats.pfr || "N/A"}`}
                  onClick={() => toggleStatSelection("pfr")}
                  isSelected={selectedStats["pfr"]}
                />
                <StatBox
                  title="3 BET"
                  value={`${stats.threebet || stats.three_bet || "N/A"}`}
                  onClick={() => toggleStatSelection("three_bet")}
                  isSelected={selectedStats["three_bet"]}
                />
                <StatBox
                  title="FOLD TO 3-BET"
                  value={`${stats.fold_to_3bet_pct || "N/A"}`}
                  onClick={() => toggleStatSelection("fold_to_3bet_pct")}
                  isSelected={selectedStats["fold_to_3bet_pct"]}
                />
                <StatBox
                  title="4-BET"
                  value={`${stats.four_bet_preflop_pct || "N/A"}`}
                  onClick={() => toggleStatSelection("four_bet_preflop_pct")}
                  isSelected={selectedStats["four_bet_preflop_pct"]}
                />
                <StatBox
                  title="FOLD TO 4-BET"
                  value={`${stats.fold_to_4bet_pct || "N/A"}`}
                  onClick={() => toggleStatSelection("fold_to_4bet_pct")}
                  isSelected={selectedStats["fold_to_4bet_pct"]}
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
                  value={`${stats.cbet_flop || "N/A"}`}
                  onClick={() => toggleStatSelection("cbet_flop")}
                  isSelected={selectedStats["cbet_flop"]}
                />
                <StatBox
                  title="CBET TURN"
                  value={`${stats.cbet_turn || "N/A"}`}
                  onClick={() => toggleStatSelection("cbet_turn")}
                  isSelected={selectedStats["cbet_turn"]}
                />
                <StatBox
                  title="FOLD TO FLOP CBET"
                  value={`${stats.fold_to_flop_cbet_pct || "N/A"}`}
                  onClick={() => toggleStatSelection("fold_to_flop_cbet_pct")}
                  isSelected={selectedStats["fold_to_flop_cbet_pct"]}
                />
                <StatBox
                  title="FOLD TO TURN CBET"
                  value={`${stats.fold_to_turn_cbet_pct || "N/A"}`}
                  onClick={() => toggleStatSelection("fold_to_turn_cbet_pct")}
                  isSelected={selectedStats["fold_to_turn_cbet_pct"]}
                />
                <StatBox
                  title="WTSD"
                  value={`${stats.wtsd || "N/A"}`}
                  onClick={() => toggleStatSelection("wtsd")}
                  isSelected={selectedStats["wtsd"]}
                />
                <StatBox
                  title="WSD"
                  value={`${stats.wsd || "N/A"}`}
                  onClick={() => toggleStatSelection("wsd")}
                  isSelected={selectedStats["wsd"]}
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
                    value={`${stats.limp_pct || "N/A"}`}
                    onClick={() => toggleStatSelection("limp_pct")}
                    isSelected={selectedStats["limp_pct"]}
                  />
                )}
                {stats.limp_raise_pct !== undefined && (
                  <StatBox
                    title="LIMP-RAISE %"
                    value={`${stats.limp_raise_pct || "N/A"}`}
                    onClick={() => toggleStatSelection("limp_raise_pct")}
                    isSelected={selectedStats["limp_raise_pct"]}
                  />
                )}
                {stats.probe_bet_turn_pct !== undefined && (
                  <StatBox
                    title="PROBE BET TURN"
                    value={`${stats.probe_bet_turn_pct || "N/A"}`}
                    onClick={() => toggleStatSelection("probe_bet_turn_pct")}
                    isSelected={selectedStats["probe_bet_turn_pct"]}
                  />
                )}
                {stats.bet_river_pct !== undefined && (
                  <StatBox
                    title="BET RIVER %"
                    value={`${stats.bet_river_pct || "N/A"}`}
                    onClick={() => toggleStatSelection("bet_river_pct")}
                    isSelected={selectedStats["bet_river_pct"]}
                  />
                )}
                {stats.fold_to_river_bet_pct !== undefined && (
                  <StatBox
                    title="FOLD TO RIVER BET"
                    value={`${stats.fold_to_river_bet_pct || "N/A"}`}
                    onClick={() => toggleStatSelection("fold_to_river_bet_pct")}
                    isSelected={selectedStats["fold_to_river_bet_pct"]}
                  />
                )}
                {stats.wwsf !== undefined && (
                  <StatBox
                    title="WWSF"
                    value={`${stats.wwsf || "N/A"}`}
                    onClick={() => toggleStatSelection("wwsf")}
                    isSelected={selectedStats["wwsf"]}
                  />
                )}
              </div>
            </div>
            
            {/* Panel derecho: Análisis IA - mejorado según la imagen 1 */}
            <div>
              <div style={{ 
                background: "#1A1A38", 
                borderRadius: 10, 
                padding: 16,
                height: "100%"
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

// Componente StatBox mejorado para parecerse a las tarjetas en la imagen 1
const StatBox: React.FC<{
  title: string;
  value: string;
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ title, value, isSelected = false, onClick }) => {
  return (
    <div
      style={{
        background: "#1A1A38", // Color similar al de la imagen 1
        borderRadius: 6,
        padding: 10,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
        border: isSelected ? "1px solid #4A54F4" : "1px solid transparent", // Borde azul si está seleccionado
        transition: "all 0.2s",
      }}
      onClick={onClick}
    >
      <div style={{ 
        fontSize: 12, 
        fontWeight: "bold", 
        marginBottom: 4,
        color: "#8888a8" // Color de título más apagado como en la imagen 1
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: 18, 
        fontWeight: "bold",
        color: "#ffffff" // Valor en blanco para resaltar
      }}>
        {value}
      </div>
    </div>
  );
};

export default GeneradorEV;