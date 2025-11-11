/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Overview page components
import Header from "layouts/profile/components/Header/header";

// Images
import team4 from "assets/images/team-4.jpg";

function Overview() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox px={2} mt={-10} mb={2}>
          <Grid container spacing={3}>
            {/* Columna izquierda: Card de perfil */}
            <Grid item xs={12} md={4}>
              <Card elevation={6}>
                <MDBox display="flex" justifyContent="center" mt={-6}>
                  <Avatar
                    alt="Jessica Jones"
                    src={team4}
                    sx={{ width: 112, height: 112, border: "4px solid #fff" }}
                  />
                </MDBox>

                <CardContent>
                  <MDBox textAlign="center" mt={3}>
                    <MDTypography variant="h5">
                      Cristian Juarez{""}
                      <MDTypography variant="button" color="text">
                        {/* , 26 */}
                      </MDTypography>
                    </MDTypography>

                    <MDTypography variant="button" color="text" display="block" mt={1}>
                      Guatemala, Villa Nueva
                    </MDTypography>

                    <MDTypography variant="button" color="text" display="block" mt={1}>
                      Programador de Soluciones Digitales
                    </MDTypography>

                    <MDTypography variant="button" color="text" display="block" mt={1}>
                      Universidad Mariano Galvez de Guatemala
                    </MDTypography>

                    <Divider sx={{ my: 2 }} />

                    <MDTypography variant="body2" color="text">
                      Cuento con cinco años de experiencia en proyectos web y de automatización. Mi
                      mayor logro ha sido liderar el desarrollo de sistemas internos que optimizaron
                      procesos y redujeron tiempos operativos en mi empresa.
                    </MDTypography>

                    {/* <Button size="small" sx={{ mt: 1 }} onClick={(e) => e.preventDefault()}>
                      Show more
                    </Button> */}
                  </MDBox>
                </CardContent>
              </Card>
            </Grid>

            {/* Columna derecha: Card "My account" con formulario estático */}
            <Grid item xs={12} md={8}>
              <Card elevation={6}>
                <CardHeader title={<MDTypography variant="h5">Mi Perfil</MDTypography>} />

                <CardContent>
                  <MDTypography variant="button" color="text" sx={{ opacity: 0.7 }}>
                    Información del usuario
                  </MDTypography>

                  <MDBox mt={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nombre de usuario"
                          placeholder="Username"
                          defaultValue="cristian.juarez"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="email"
                          label="Correo Electronico"
                          placeholder="Email"
                          defaultValue="cristian.juarez@atento.com"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Primer Nombre"
                          placeholder="First name"
                          defaultValue="Cristian"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Primer Apellido"
                          placeholder="Last name"
                          defaultValue="Juarez"
                        />
                      </Grid>
                    </Grid>
                  </MDBox>

                  <Divider sx={{ my: 3 }} />

                  <MDTypography variant="button" color="text" sx={{ opacity: 0.7 }}>
                    Información de contacto
                  </MDTypography>

                  <MDBox mt={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Dirección"
                          placeholder="Home Address"
                          defaultValue="Zona 12 Villa Nueva, Guatemala"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Ciudad"
                          placeholder="City"
                          defaultValue="Guatemala"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="País"
                          placeholder="Country"
                          defaultValue="Guatemala"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Código postal"
                          placeholder="Código postal"
                          defaultValue="502"
                          // diseño solamente; sin restricciones
                        />
                      </Grid>
                    </Grid>
                  </MDBox>

                  <Divider sx={{ my: 3 }} />

                  <MDTypography variant="button" color="text" sx={{ opacity: 0.7 }}>
                    Acerca de mí
                  </MDTypography>

                  <MDBox mt={2}>
                    <TextField
                      fullWidth
                      label="Acerca de mí"
                      multiline
                      minRows={4}
                      placeholder="A few words about you ..."
                      defaultValue={`Mi nombre es Cristian Juárez, tengo 26 años, cuento con cinco años de experiencia en proyectos web y de automatización. Mi mayor logro ha sido liderar el desarrollo de sistemas internos que optimizaron procesos y redujeron tiempos operativos.`}
                    />
                  </MDBox>
                </CardContent>

                <CardActions sx={{ justifyContent: "flex-end", pb: 3, px: 3 }}>
                  {/* <Button variant="contained" size="medium" onClick={(e) => e.preventDefault()}>
                    Guardar cambios
                  </Button> */}
                  <MDButton
                    variant="contained"
                    color="info"
                    size="medium"
                    onClick={(e) => e.preventDefault()}
                  >
                    Guardar cambios
                  </MDButton>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        {/* === Fin del contenido migrado === */}
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
