import React, { useEffect, useState } from "react";
import { DEFAULT_STATS, saveStatsConfig, loadStatsConfig } from "../utils/statsConfig";

const StatsSettings: React.FC = () => {
  const [stats, setStats] = useState(DEFAULT_STATS);

  // Al cargar, intenta leer la config guardada
  useEffect(() => {
    loadStatsConfig().then((config) => {
      if (config) setStats(config);
    });
  }, []);

  // Maneja el cambio de selección de stats
  const handleToggle = (index: number) => {
    const updatedStats = [...stats];
    updatedStats[index].checked = !updatedStats[index].checked;
    setStats(updatedStats);
  };

  // Guarda al usuario hacer clic
  const handleSave = async () => {
    await saveStatsConfig(stats);
    alert("¡Configuración guardada!");
  };

  return (
    <div style={{
      background: "#21213d",
      color: "#fff",
      borderRadius: 10,
      padding: 28,
      maxWidth: 380,
      margin: "30px auto",
      boxShadow: "0 3px 12px #0002"
    }}>
      <h2 style={{ marginTop: 0, fontWeight: 700, marginBottom: 18 }}>Selecciona los stats que quieres copiar</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {stats.map((stat, i) => (
          <li key={stat.key} style={{ marginBottom: 9 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={stat.checked}
                onChange={() => handleToggle(i)}
              />
              {stat.label}
            </label>
          </li>
        ))}
      </ul>
      <button
        onClick={handleSave}
        style={{
          marginTop: 24,
          padding: "10px 20px",
          border: "none",
          borderRadius: 6,
          background: "#5a4de7",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Guardar selección
      </button>
    </div>
  );
};

export default StatsSettings;
