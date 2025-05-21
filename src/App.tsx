import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import { loginUsuario } from "./api/auth";
import GeneradorEV from "./components/GeneradorEV";
import Sidebar from "./components/Sidebar";
import StatsSettings from "./components/StatsSettings";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  suscripcion: string;
}

const TABS = [
  "Generador EV",
  "Settings"
  // Puedes agregar más: "Ranking", "Historial", "Perfil", etc.
];

// Estilos globales que se inyectan en el componente
const globalStyles = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [selectedTab, setSelectedTab] = useState(TABS[0]);
  
  // Recupera usuario si ya estaba logueado
  useEffect(() => {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      setUsuario(JSON.parse(usuarioStr));
    }
  }, []);

  const handleLogin = async (user: string, clave: string) => {
    try {
      const res = await loginUsuario(user, clave);
      // Guardar en localStorage
      localStorage.setItem('usuario', JSON.stringify(res.usuario));
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      setUsuario(res.usuario);
    } catch (err: any) {
      alert(err.message || "Error al iniciar sesión");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  if (!usuario) {
    return (
      <Login
        onLogin={handleLogin}
        onGuest={() => setUsuario({
          id: 0, 
          nombre: "Invitado", 
          email: "", 
          rol: "guest", 
          suscripcion: ""
        })}
        onRegister={() => alert("registro")}
        onForgot={() => alert("recuperar clave")}
      />
    );
  }

  return (
    <>
      {/* Estilos globales para scrollbars y animaciones */}
      <style>{globalStyles}</style>
      
      {/* Contenedor principal con tamaño mínimo */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        overflow: "auto",
        background: "linear-gradient(135deg, #392679 0%, #184178 100%)"
      }}>
        {/* Contenedor con tamaño mínimo que garantiza proporciones */}
        <div style={{
          display: "flex",
          width: "100%",
          height: "100%",
          minWidth: "1200px",  // Asegura un ancho mínimo para toda la app
          minHeight: "680px"   // Asegura un alto mínimo para toda la app
        }}>
          {/* Sidebar con ancho fijo */}
          <div style={{
            width: "190px",
            flexShrink: 0,
            height: "100%",
            overflow: "auto"
          }}>
            <Sidebar
              tabs={TABS}
              selected={selectedTab}
              onSelect={setSelectedTab}
              usuario={usuario}
              onLogout={handleLogout}
            />
          </div>
          
          {/* Área de contenido principal */}
          <div style={{
            flex: 1,
            height: "100%",
            minWidth: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Contenido según el tab seleccionado */}
            {selectedTab === "Generador EV" ? (
              <div style={{ 
                width: "100%", 
                height: "100%", 
                overflow: "hidden",
                display: "flex" 
              }}>
                <GeneradorEV />
              </div>
            ) : (
              <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "44px 0 0 0",
                overflow: "auto"
              }}>
                <div style={{
                  width: "100%",
                  maxWidth: 540,
                  margin: "0 auto",
                  padding: "0 16px",
                  boxSizing: "border-box"
                }}>
                  <StatsSettings />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;