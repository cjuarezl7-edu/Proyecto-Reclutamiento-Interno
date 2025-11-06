// src/api/auth.js
/* eslint-disable no-console */
import axios from "./axios"; // asegura que apunta a src/api/axios.js

export async function loginApi(email, password) {
  console.log("[AUTH] Login API call →", email);

  try {
    const resp = await axios.post("/api/Auth/login", { email, password });

    // Logs de depuración (opcional)
    console.log("🔎 resp.status:", resp?.status);
    console.log("🔎 resp.data:", resp?.data);

    const data = resp?.data;
    if (!data) throw new Error("Respuesta vacía del servidor.");

    // Normaliza SIEMPRE a camelCase
    const normalized = {
      token: data.Token ?? data.token,
      expiresAt: data.ExpiresAt ?? data.expiresAt,
      usuarioId: data.UsuarioId ?? data.usuarioId,
      empleadoId: data.EmpleadoId ?? data.empleadoId,
      rolId: data.RolId ?? data.rolId,
      nombre: data.Nombre ?? data.nombre,
      email: data.Email ?? data.email,
    };

    console.log("🔐 loginApi (normalizado):", normalized);
    return normalized;
  } catch (err) {
    // Intenta tomar el mensaje del backend antes que el genérico de Axios
    const serverMsg =
      (typeof err?.response?.data === "string" && err.response.data) ||
      err?.response?.data?.message ||
      err?.response?.data?.Message ||
      (err?.response?.status === 401 ? "Credenciales inválidas." : null);

    const msg = serverMsg || err?.message || "No fue posible iniciar sesión.";
    console.error("❌ loginApi error:", msg);
    throw new Error(msg); // ← el caller (AuthContext/login.js) mostrará ESTE texto
  }
}
