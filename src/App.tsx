import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import { loginUsuario } from "./api/auth";  // Importa la función
import GeneradorEV from "./components/GeneradorEV";
import Sidebar from "./components/Sidebar"; // Importa el nuevo componente
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
    <div style={{
      display: "flex",
      width: "100vw",
      height: "100vh",
      minHeight: 0,
      minWidth: 0,
      background: "linear-gradient(135deg, #392679 0%, #184178 100%)",
      overflow: "hidden"
    }}>
      <Sidebar
        tabs={TABS}
        selected={selectedTab}
        onSelect={setSelectedTab}
        usuario={usuario}
        onLogout={handleLogout}
      />
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 44,
        minWidth: 0,
        minHeight: 0,
        overflowY: "auto"
      }}>
        <div style={{
          width: "100%",
          maxWidth: 540,
          margin: "0 auto",
          marginTop: 0,
          padding: "0 16px",
          boxSizing: "border-box"
        }}>
          {selectedTab === "Generador EV" && <GeneradorEV />}
          {selectedTab === "Settings" && <StatsSettings />}
        </div>
      </div>
    </div>
  );
}

export default App;