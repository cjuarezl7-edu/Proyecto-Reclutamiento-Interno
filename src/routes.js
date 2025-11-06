// src/routes.js
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import Icon from "@mui/material/Icon";

import Dashboard from "layouts/dashboard";
import Vacante from "layouts/vacante/vacante";
import Postulacion from "layouts/postulacion/postulacion";
import Profile from "layouts/profile/perfil";
import SignIn from "layouts/authentication/sign-in/login";
import SignUp from "layouts/authentication/sign-up";
import Mantenimiento1 from "layouts/mantenimiento/Mantenimiento1";
import Mantenimiento2 from "layouts/mantenimiento/Mantenimiento2";

import { useAuth } from "auth/AuthContext";

// (Opcional) Página muy simple para 403
const Unauthorized = () => <div style={{ padding: 24 }}>No autorizado</div>;

// Cierra sesión y redirige al login
function Logout() {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, [logout]);
  return <Navigate to="/authentication/sign-in" replace />;
}

const routes = [
  // ===== PRIVADAS (aparecen en el menú) =====
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    requiresAuth: true,
  },
  // Sección Mantenimiento (dropdown colapsable con submenús)
  {
    type: "collapse",
    name: "Mantenimiento",
    key: "mantenimiento",
    icon: <Icon fontSize="small">build</Icon>,
    collapse: [
      {
        type: "collapse",
        name: "Mantenimiento 1",
        key: "mantenimiento1",
        icon: <Icon fontSize="small">handyman</Icon>,
        route: "/mantenimiento1",
        component: <Mantenimiento1 />,
        requiresAuth: true,
      },
      {
        type: "collapse",
        name: "Mantenimiento 2",
        key: "mantenimiento2",
        icon: <Icon fontSize="small">build_circle</Icon>,
        route: "/mantenimiento2",
        component: <Mantenimiento2 />,
        requiresAuth: true,
      },
    ],
    requiresAuth: true,
  },
  {
    type: "collapse",
    name: "Vacante",
    key: "vacante",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/vacante",
    component: <Vacante />,
    requiresAuth: true,
  },
  {
    type: "collapse",
    name: "Postulacion",
    key: "postulacion",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/postulacion",
    component: <Postulacion />,
    requiresAuth: true,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
    requiresAuth: true,
  },

  // 👉 NUEVA opción de menú para cerrar sesión
  {
    type: "collapse",
    name: "Salir",
    key: "logout",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "/logout",
    component: <Logout />,
    requiresAuth: true,
  },

  // ===== PÚBLICAS (NO en el menú; sin "type") =====
  {
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
    requiresAuth: false,
  },
  {
    key: "sign-up",
    route: "/authentication/sign-up",
    component: <SignUp />,
    requiresAuth: false,
  },

  // ===== (Opcional) No autorizado =====
  {
    key: "unauthorized",
    route: "/unauthorized",
    component: <Unauthorized />,
    requiresAuth: false,
  },
];

export default routes;
