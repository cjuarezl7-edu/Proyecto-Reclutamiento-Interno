import { useState } from "react";
import { useNavigate } from "react-router-dom";

// @mui
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

// MD components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

// Layout
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Assets
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

// Auth
import { useAuth } from "auth/AuthContext";

export default function Cover() {
  const navigate = useNavigate();
  const { login, isRemember, setRemember } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorSB, setErrorSB] = useState({ open: false, msg: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const openError = (msg) => setErrorSB({ open: true, msg });
  const closeError = () => setErrorSB({ open: false, msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      openError("Ingresa correo y contraseña.");
      return;
    }
    try {
      setLoading(true);
      await login(form.email, form.password, isRemember);
      navigate("/dashboard"); // ajusta a tu ruta principal
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data ?? "Credenciales inválidas.";
      openError(typeof msg === "string" ? msg : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

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
            Iniciar sesión
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Ingrese su dirección de correo electrónico y contraseña
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={3} px={3} component="form" onSubmit={handleSubmit}>
          <MDBox mb={2}>
            <MDInput
              type="email"
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              variant="standard"
              fullWidth
              autoComplete="username"
            />
          </MDBox>
          <MDBox mb={2}>
            <MDInput
              type="password"
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              variant="standard"
              fullWidth
              autoComplete="current-password"
            />
          </MDBox>

          <MDBox display="flex" alignItems="center" ml={-1}>
            <Switch checked={isRemember} onChange={(e) => setRemember(e.target.checked)} />
            <MDTypography
              variant="button"
              fontWeight="regular"
              color="text"
              sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              onClick={() => setRemember(!isRemember)}
            >
              &nbsp;&nbsp;Recordarme
            </MDTypography>
          </MDBox>

          <MDBox mt={4} mb={1}>
            <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </MDButton>
          </MDBox>
        </MDBox>
      </Card>

      <MDSnackbar
        color="error"
        icon="warning"
        title="Error"
        content={errorSB.msg}
        open={errorSB.open}
        onClose={closeError}
        autoHideDuration={3500}
        close={closeError}
      />
    </CoverLayout>
  );
}
