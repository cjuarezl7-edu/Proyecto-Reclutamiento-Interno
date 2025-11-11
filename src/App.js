import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

// Auth
import { AuthProvider, useAuth } from "auth/AuthContext";
import ProtectedRoute from "auth/ProtectedRoute";

function AppContent() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;

  const { isAuthenticated, user } = useAuth();
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Aplanar rutas (soporta submenús en routes.collapse)
  const flattenRoutes = (items) => {
    const out = [];
    items.forEach((it) => {
      if (it.route && it.component) out.push(it);
      if (Array.isArray(it.collapse)) out.push(...flattenRoutes(it.collapse));
    });
    return out;
  };

  const flatRoutes = flattenRoutes(routes);

  // Separamos públicas/privadas por requiresAuth
  const publicRoutes = flatRoutes.filter((r) => !r.requiresAuth && r.route);
  const privateRoutes = flatRoutes.filter((r) => r.requiresAuth && r.route);

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return (
    <>
      {/* Sidenav solo si hay sesión */}
      {layout === "dashboard" && isAuthenticated && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName={user ? `¡Bienvenido, ${user.nombre}!` : "Material Dashboard 2"}
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
        </>
      )}
      {layout === "vr" && <Configurator />}

      <Routes>
        {/* Públicas */}
        {publicRoutes.map((r) => (
          <Route key={r.key || r.route} path={r.route} element={r.component} />
        ))}

        {/* Privadas (bajo guard) */}
        <Route element={<ProtectedRoute />}>
          {privateRoutes.map((r) => (
            <Route key={r.key || r.route} path={r.route} element={r.component} />
          ))}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/authentication/sign-in" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [controller] = useMaterialUIController();
  const { direction, darkMode } = controller;

  const [rtlCache, setRtlCache] = useState(null);

  useMemo(() => {
    const cacheRtl = createCache({ key: "rtl", stylisPlugins: [rtlPlugin] });
    setRtlCache(cacheRtl);
  }, []);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  const Themed = (
    <>
      <CssBaseline />
      {/* AuthProvider envuelve a TODO para que AppContent pueda usar useAuth */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>{Themed}</ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>{Themed}</ThemeProvider>
  );
}
