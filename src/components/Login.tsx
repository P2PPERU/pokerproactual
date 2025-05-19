import React, { useState } from "react";

interface LoginProps {
  onLogin: (usuario: string, clave: string) => void;
  onGuest: () => void;
  onRegister: () => void;
  onForgot: () => void;
}

const Login: React.FC<LoginProps> = ({
  onLogin,
  onGuest,
  onRegister,
  onForgot,
}) => {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(usuario, clave);
  };

  return (
    <div
      style={{
        width: "340px",
        background: "rgba(30, 28, 52, 0.97)",
        borderRadius: 18,
        boxShadow: "0 8px 32px 0 rgba(31,38,135,0.20)",
        padding: "30px 24px 20px 24px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "#fff",
        minHeight: 410,
        maxWidth: "94vw",
      }}
    >
      <h2
        style={{
          fontWeight: 700,
          fontSize: 24,
          marginBottom: 8,
          letterSpacing: 1,
          textAlign: "center",
        }}
      >
        POKER PRO TRACK
      </h2>
      <div style={{ fontSize: 40, marginBottom: 12, marginTop: 4 }}>♠️</div>
      <form
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          style={{
            width: "100%",
            padding: "11px 12px",
            marginBottom: 12,
            borderRadius: 7,
            border: "none",
            background: "#22223a",
            color: "#fff",
            fontSize: 15,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          style={{
            width: "100%",
            padding: "11px 12px",
            marginBottom: 13,
            borderRadius: 7,
            border: "none",
            background: "#22223a",
            color: "#fff",
            fontSize: 15,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#5359fa",
            color: "#fff",
            padding: 12,
            borderRadius: 7,
            border: "none",
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 8,
            cursor: "pointer",
            boxShadow: "0 2px 8px #2222",
            transition: "background .2s",
          }}
        >
          Iniciar sesión
        </button>
      </form>
      <button
        onClick={onGuest}
        style={{
          width: "100%",
          background: "#191922",
          color: "#fff",
          padding: 11,
          borderRadius: 7,
          border: "none",
          fontWeight: 500,
          fontSize: 15,
          marginBottom: 9,
          cursor: "pointer",
        }}
      >
        Entrar como invitado
      </button>
      <button
        onClick={onRegister}
        style={{
          width: "100%",
          background: "transparent",
          color: "#a1a1f6",
          padding: "5px 0",
          border: "none",
          fontWeight: 500,
          fontSize: 15,
          textDecoration: "underline",
          marginBottom: 3,
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        Registrarse
      </button>
      <button
        onClick={onForgot}
        style={{
          width: "100%",
          background: "transparent",
          color: "#a1a1f6",
          padding: "2px 0",
          border: "none",
          fontWeight: 400,
          fontSize: 14,
          textDecoration: "underline",
          marginBottom: 1,
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        ¿Olvidaste tu contraseña?
      </button>
      <div
        style={{
          marginTop: 10,
          color: "#888",
          fontSize: 12,
          textAlign: "center",
        }}
      >
        © PokerProTrack 2025 by Peru EV+
      </div>
    </div>
  );
};

export default Login;
