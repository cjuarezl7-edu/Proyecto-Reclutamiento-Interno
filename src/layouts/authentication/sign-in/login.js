/* eslint-disable prettier/prettier */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// Authentication layout
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

// Contexto Auth
import { useAuth } from "auth/AuthContext";

function Cover() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();

  // 👉 Si ya hay sesión, redirige al dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorSB, setErrorSB] = useState({ open: false, msg: "" });

  const openError = (msg) => setErrorSB({ open: true, msg });
  const closeError = () => setErrorSB({ open: false, msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) return openError("El correo electrónico es obligatorio.");
    if (!password) return openError("La contraseña es obligatoria.");

    try {
      setSubmitting(true);
      console.log("[LOGIN] intentando conexión →", normalizedEmail);

      // sin "Recordarme": usamos sesión (sessionStorage) => remember:false
      const ok = await login({
        email: normalizedEmail,
        password,
        remember: false,
      });

      if (ok) {
        console.log("[LOGIN] OK → redirigiendo a /dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        openError("Credenciales incorrectas o sesión no válida.");
      }
    } catch (err) {
      console.error("[LOGIN] Error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "No fue posible iniciar sesión.";
      openError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {/* Iniciar sesión */}
            Reclutamiento Interno
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Ingrese su dirección de correo electrónico y contraseña
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          <form onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Correo electrónico"
                variant="standard"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </MDBox>

            <MDBox mt={4} mb={1}>
              <MDButton
                type="submit"
                variant="gradient"
                color="info"
                fullWidth
                disabled={submitting}
              >
                {submitting ? "Ingresando..." : "Ingresar"}
              </MDButton>
            </MDBox>
          </form>
        </MDBox>
      </Card>

      <MDSnackbar
        color="error"
        icon="warning"
        title="Error"
        content={errorSB.msg}
        open={errorSB.open}
        onClose={closeError}
        autoHideDuration={3000}
        close={closeError}
      />
    </CoverLayout>
  );
}

export default Cover;
