/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal"; // <-- IMPORT MODAL
import IconButton from "@mui/material/IconButton"; // <-- IMPORT ICONBUTTON
import CloseIcon from "@mui/icons-material/Close"; // <-- IMPORT CLOSE ICON
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDSnackbar from "components/MDSnackbar";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";
import Header from "layouts/postulacion/componenets/Header/index";
import IMG_VACANTE1 from "assets/images/Vacante_IMG1.png";

///===
import Fade from "@mui/material/Fade";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import LabelImportantOutlinedIcon from "@mui/icons-material/LabelImportantOutlined";

// ====== ENDPOINTS ======
// const API_POSTULACIONES = "https://localhost:7187/api/Postulaciones/postulaciones";
// const API_VACANTE = "https://localhost:7187/api/Vacante";

const API_POSTULACIONES =
  "http://cjuarez99-001-site1.anytempurl.com/api/Postulaciones/postulaciones";
const API_VACANTE = "http://cjuarez99-001-site1.anytempurl.com/api/Vacante";

// ====== HELPERS ======
// Formateo de fecha
const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "—";
  }
};

// Normaliza todas las keys a minúsculas
const normalizeKeysDeep = (input) => {
  if (Array.isArray(input)) return input.map(normalizeKeysDeep);
  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [String(k).toLowerCase(), normalizeKeysDeep(v)])
    );
  }
  return input;
};

const truncate = (txt, n = 140) => (!txt ? "" : txt.length > n ? txt.slice(0, n - 1) + "…" : txt);

// Map para tarjetas
const mapVacanteToCard = (raw) => {
  const v = normalizeKeysDeep(raw);
  return {
    id: v.vac_codigo_vacante,
    titulo: v.vac_titulo ?? "Vacante",
    descripcion: v.vac_descripcion ?? "",
    descripcionShort: truncate(v.vac_descripcion ?? "", 150),
    area: v.nombre_area ?? "—",
    estado: v.estado_vacante ?? "",
    fechaCierre: v.vac_fecha_cierre ?? null,
    autor: v.usuario_creacion ?? "",
    route: `/postulacion/detalle/${v.vac_codigo_vacante}`,
  };
};

export default function Overview() {
  // Listado
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Snackbar error
  const [errorSB, setErrorSB] = useState({ open: false, msg: "" });
  const openError = (msg) => setErrorSB({ open: true, msg });
  const closeError = () => setErrorSB({ open: false, msg: "" });

  // Modal de detalle
  const [openDetail, setOpenDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setDetail(null);
  };

  const renderErrorSB = (
    <MDSnackbar
      color="error"
      icon="warning"
      title="Error"
      content={errorSB.msg || "Ocurrió un error al cargar las vacantes."}
      open={errorSB.open}
      onClose={closeError}
      autoHideDuration={3500}
      close={closeError}
    />
  );

  // Carga listado
  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_POSTULACIONES);
      const arr = Array.isArray(data) ? data : [];
      const mapped = arr.map(mapVacanteToCard);
      setItems(mapped);
    } catch (e) {
      console.error(e);
      openError("No se pudo cargar el muro de vacantes.");
    } finally {
      setLoading(false);
    }
  };

  // Trae detalle y abre modal
  const fetchDetailAndOpen = async (id) => {
    try {
      setLoadingDetail(true);
      setOpenDetail(true);

      const { data } = await axios.get(`${API_VACANTE}/${id}`);
      const d = {
        id: data.VAC_CODIGO_VACANTE,
        areaNombre: data.NOMBRE_AREA ?? "—",
        titulo: data.VAC_TITULO ?? "",
        descripcion: data.VAC_DESCRIPCION ?? "",
        fechaCreacion: data.VAC_FECHA_CREACION ?? null,
        fechaCierre: data.VAC_FECHA_CIERRE ?? null,
        estadoNombre: data.ESTADO_VACANTE ?? "—",
        usuarioCreacion: data.USUARIO_CREACION ?? "—",
      };
      setDetail(d);
    } catch (e) {
      console.error(e);
      openError("No se pudo cargar el detalle de la vacante.");
      setOpenDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Cards (sin paginación, usamos items directo)
  const gridCards = useMemo(
    () =>
      items.map((x) => (
        <Grid item xs={12} md={6} xl={3} key={x.id}>
          <DefaultProjectCard
            image={IMG_VACANTE1}
            label={x.area || "Vacante"}
            title={x.titulo}
            description={x.descripcionShort}
            action={{
              type: "internal", // ignorado si onActionClick está presente (retrocompatibilidad)
              route: "#",
              color: "info",
              label: "Ver detalle",
            }}
            actionVariant="gradient"
            onActionClick={() => fetchDetailAndOpen(x.id)}
          />
        </Grid>
      )),
    [items]
  );

  // Estilo modal
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    borderRadius: 8,
    boxShadow: 24,
    p: 3,
    outline: "none",
  };

  // contenedor “card” del modal
  const modalCardSx = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "95vw", sm: 640, md: 780 },
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    overflow: "hidden", // para que el header/footers tengan borde limpio
    outline: "none",
    display: "flex",
    flexDirection: "column",
    maxHeight: "85vh",
  };

  // header con barra de acento
  const modalHeaderSx = (t) => ({
    position: "relative",
    px: 3,
    pt: 3,
    pb: 2,
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: 6,
      background: `linear-gradient(90deg, ${t.palette.info.main}, ${t.palette.info.light})`,
    },
  });

  // cuerpo scrollable
  const modalBodySx = {
    px: 3,
    py: 2,
    overflowY: "auto",
  };

  // footer sticky
  const modalFooterSx = {
    px: 3,
    py: 2,
    borderTop: (t) => `1px solid ${t.palette.divider}`,
    position: "sticky",
    bottom: 0,
    bgcolor: "background.paper",
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            Vacantes Disponibles
          </MDTypography>
          <MDBox mb={1}>
            <MDTypography variant="button" color="text">
              Tu potencial es infinito, atrévete a explorarlo
            </MDTypography>
          </MDBox>
        </MDBox>

        <MDBox p={2}>
          {loading ? (
            <Card style={{ padding: 24, textAlign: "center" }}>
              <MDTypography variant="button" color="text">
                Cargando vacantes…
              </MDTypography>
            </Card>
          ) : items.length === 0 ? (
            <Card style={{ padding: 24, textAlign: "center" }}>
              <MDTypography variant="button" color="text">
                No hay vacantes disponibles por ahora.
              </MDTypography>
            </Card>
          ) : (
            <Grid container spacing={6}>
              {gridCards}
            </Grid>
          )}
        </MDBox>
      </Header>
      <Footer />

      {/* MODAL DETALLE */}
      <Modal
        open={openDetail}
        onClose={handleCloseDetail}
        closeAfterTransition
        slots={{ backdrop: Box }}
        slotProps={{
          backdrop: {
            sx: {
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(9,14,23,0.35)",
              backdropFilter: "blur(3px)",
            },
          },
        }}
      >
        <Fade in={openDetail}>
          <Box sx={modalCardSx}>
            {/* HEADER */}
            <Box sx={(t) => modalHeaderSx(t)}>
              <Grid container alignItems="center">
                <Grid item xs>
                  <MDTypography variant="h6">{detail?.titulo || "Detalle de vacante"}</MDTypography>
                  <MDTypography variant="button" color="text" sx={{ opacity: 0.8 }}>
                    {detail?.autor ? `Publicado por ${detail.autor}` : ""}
                  </MDTypography>
                </Grid>
                <Grid item>
                  <IconButton onClick={handleCloseDetail} aria-label="close">
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* BODY */}
            <Box sx={modalBodySx}>
              {loadingDetail ? (
                <>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={22} />
                  <Skeleton variant="rectangular" height={120} sx={{ my: 2, borderRadius: 2 }} />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="text" width="95%" />
                  <Skeleton variant="text" width="88%" />
                </>
              ) : detail ? (
                <Grid container spacing={2}>
                  {/* Columna izquierda */}
                  <Grid item xs={12} md={7}>
                    {/* <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        icon={<WorkOutlineIcon />}
                        label={detail.areaNombre || "—"}
                        color="info"
                        variant="outlined"
                        sx={{ height: 28 }}
                      />
                      <Chip
                        icon={<LabelImportantOutlinedIcon />}
                        label={detail.estadoNombre || "—"}
                        color="success"
                        variant="outlined"
                        sx={{ height: 28 }}
                      />
                    </Stack> */}

                    <MDBox mt={2}>
                      <MDTypography variant="subtitle2" color="text" sx={{ mb: 0.5 }}>
                        Descripción
                      </MDTypography>
                      <MDTypography variant="button" color="text" sx={{ whiteSpace: "pre-wrap" }}>
                        {detail.descripcion || "Sin descripción"}
                      </MDTypography>
                    </MDBox>
                  </Grid>

                  {/* Columna derecha */}
                  <Grid item xs={12} md={5}>
                    <Box
                      sx={{
                        p: 2,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        borderRadius: 2,
                      }}
                    >
                      <Stack spacing={1.2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarMonthIcon fontSize="small" />
                          <MDTypography variant="button" color="text">
                            Creación: <strong>{formatDate(detail.fechaCreacion)}</strong>
                          </MDTypography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarMonthIcon fontSize="small" />
                          <MDTypography variant="button" color="text">
                            Cierre: <strong>{formatDate(detail.fechaCierre)}</strong>
                          </MDTypography>
                        </Stack>
                        <Divider sx={{ my: 1 }} />
                        <MDTypography variant="button" color="text">
                          Publicado por: <strong>{detail.usuarioCreacion || "—"}</strong>
                        </MDTypography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <MDTypography variant="button" color="text">
                  No se encontró información de la vacante.
                </MDTypography>
              )}
            </Box>

            {/* FOOTER */}
            <Box sx={modalFooterSx}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} display="flex" justifyContent="flex-end">
                  <MDButton
                    variant="gradient"
                    color="success"
                    disabled={loadingDetail || !detail}
                    onClick={() => {
                      // futuro: POST /api/Postulaciones/aplicar
                    }}
                  >
                    Aplicar
                  </MDButton>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MDButton variant="gradient" color="secondary" onClick={handleCloseDetail}>
                    Cancelar
                  </MDButton>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {renderErrorSB}
    </DashboardLayout>
  );
}
