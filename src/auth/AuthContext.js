/* eslint-disable prettier/prettier */
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "api/axios";
import { loginApi } from "api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { usuarioId, empleadoId, rolId, nombre, email, expiresAt }
  const [token, setToken] = useState(null); // string
  const [loading, setLoading] = useState(true);

  // Restaurar sesión
  useEffect(() => {
    const savedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        setUser(userObj);
        setToken(savedToken);
        axios.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
        console.log("[AUTH] Sesión restaurada:", userObj.email);
      } catch (e) {
        console.warn("[AUTH] No se pudo restaurar sesión:", e);
      }
    }
    setLoading(false);
  }, []);

  // Login
  const login = async ({ email, password, remember }) => {
    console.log("[AUTH] Login API call →", email);

    // ⬇️ AHORA loginApi SIEMPRE devuelve camelCase
    const res = await loginApi(email, password);
    console.log("[AUTH] Res (camelCase):", res);

    const { token, usuarioId, empleadoId, rolId, nombre, email: emailResp, expiresAt } = res;
    if (!token) throw new Error("No se recibió token válido del servidor.");

    const userData = { usuarioId, empleadoId, rolId, nombre, email: emailResp, expiresAt };

    setUser(userData);
    setToken(token);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));
    storage.setItem("rememberMe", remember ? "1" : "0");

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    console.log("[AUTH] Login exitoso → usuario:", nombre);
    return true;
  };

  const logout = () => {
    console.log("[AUTH] Logout ejecutado");
    setUser(null);
    setToken(null);
    localStorage.clear();
    sessionStorage.clear();
    delete axios.defaults.headers.common.Authorization;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!user && !!token,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
