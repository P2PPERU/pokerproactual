import React from "react";

interface SidebarProps {
  tabs: string[];
  selected: string;
  onSelect: (tab: string) => void;
  usuario: { nombre: string; rol: string };
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tabs, selected, onSelect, usuario, onLogout }) => (
  <div style={{
    width: 190,
    minWidth: 190,
    background: "#1b1834",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    paddingTop: 18,
    boxShadow: "2px 0 14px #20214644",
    position: "relative",
    zIndex: 10,
    alignItems: "stretch"
  }}>
    {/* Panel de usuario arriba */}
    <div style={{
      margin: "0 0 28px 0",
      padding: "0 20px",
      textAlign: "left"
    }}>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 4, marginTop: 12 }}>
        {usuario.nombre}
      </div>
      <div style={{
        color: "#bbbbdd",
        fontWeight: 400,
        fontSize: 14,
        marginBottom: 8,
        textTransform: "capitalize"
      }}>
        {usuario.rol}
      </div>
      <button
        onClick={onLogout}
        style={{
          background: "#232239",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontWeight: 600,
          cursor: "pointer",
          fontSize: 14,
          padding: "6px 16px"
        }}
      >
        Cerrar sesión
      </button>
    </div>
    {/* Tabs */}
    <div style={{ flex: 1 }}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          style={{
            background: tab === selected ? "#5056fa" : "transparent",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            padding: "14px 18px",
            fontSize: 16,
            fontWeight: 600,
            margin: "8px 10px",
            cursor: "pointer",
            transition: "background .18s"
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
);

export default Sidebar;
