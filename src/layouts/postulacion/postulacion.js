/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import LabelImportantOutlinedIcon from "@mui/icons-material/LabelImportantOutlined";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

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

// 🔍 Zoom imagen
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

// ====== ENDPOINTS ======
const API_POSTULACIONES =
  "http://cjuarez99-001-site1.anytempurl.com/api/Postulaciones/postulaciones";
const API_VACANTE = "http://cjuarez99-001-site1.anytempurl.com/api/Vacante";

// ====== CSS GLOBAL PARA UNIFORMAR TARJETAS ======
const globalCss = `
  /* Igualar altura del Card y empujar acciones al fondo */
  .card-equal .MuiCard-root{
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .card-equal .MuiCardContent-root{
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .card-equal .MuiCardActions-root{
    margin-top: auto;
  }

  /* --- IMAGEN UNIFORME --- */
  .card-equal .MuiCardMedia-root{
    height: 180px;
    width: 100%;
  }
  .card-equal .MuiCardMedia-root img{
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
  .card-equal img{
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
  }

  /* --- TÍTULO A 2 LÍNEAS --- */
  .clamp-title-2{
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.35;
    min-height: calc(1.35em * 2);
  }

  /* --- DESCRIPCIÓN A 3 LÍNEAS --- */
  .clamp-3{
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.6;
    min-height: calc(1.6em * 3);
  }

  /* Zoom modal seguro */
  .rmiz__zoomed {
    width: auto !important;
    height: auto !important;
    max-width: 95vw !important;
    max-height: 90vh !important;
  }
  .rmiz__overlay {
    z-index: 2000 !important;
    background: rgba(0,0,0,0.85) !important;
    backdrop-filter: blur(2px);
  }
`;

// ====== HELPERS ======
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

const normalizeKeysDeep = (input) => {
  if (Array.isArray(input)) return input.map(normalizeKeysDeep);
  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [String(k).toLowerCase(), normalizeKeysDeep(v)])
    );
  }
  return input;
};

// Fuerza mínimo N caracteres y “…”; rellena con NBSP.
function ellipsizeFixed(text, minChars = 95) {
  const clean = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return " ".repeat(minChars) + "…";
  if (clean.length >= minChars) {
    const cutAt = clean.lastIndexOf(" ", minChars - 1);
    const trimmed = cutAt > minChars * 0.5 ? clean.slice(0, cutAt) : clean.slice(0, minChars);
    return trimmed + "…";
  }
  const padCount = minChars - clean.length;
  const pad = "\u00A0".repeat(padCount);
  return clean + pad + "…";
}

const mapVacanteToCard = (raw) => {
  const v = normalizeKeysDeep(raw);
  return {
    id: v.vac_codigo_vacante,
    titulo: v.vac_titulo ?? "Vacante",
    descripcion: v.vac_descripcion ?? "",
    area: v.nombre_area ?? "—",
    estado: v.estado_vacante ?? "",
    fechaCierre: v.vac_fecha_cierre ?? null,
    autor: v.usuario_creacion ?? "",
    // algunos listados NO traen url de imagen; dejamos vacío y lo hidratamos luego
    urlImagen: v.vac_url_imagen || v.url_imagen || v.urlimagen || "",
    route: `/postulacion/detalle/${v.vac_codigo_vacante}`,
  };
};

// Crea un diccionario id -> urlImagen consultando el detalle
async function fetchImagesFor(items) {
  const results = await Promise.allSettled(
    items.map(async (it) => {
      // si ya trae urlImagen válida, respétala
      if (it.urlImagen && String(it.urlImagen).trim() !== "") {
        return { id: it.id, url: it.urlImagen };
      }
      const { data } = await axios.get(`${API_VACANTE}/${it.id}`);
      const d = normalizeKeysDeep(data);
      const url = d.vac_url_imagen || d.url_imagen || d.urlimagen || data.VAC_URL_IMAGEN || "";
      return { id: it.id, url: url || "" };
    })
  );

  const map = new Map();
  results.forEach((r) => {
    if (r.status === "fulfilled" && r.value) {
      map.set(r.value.id, r.value.url);
    }
  });
  return map;
}

// 👉 separa texto en bullets por saltos de línea o ; o • o -
const toItems = (txt) => {
  if (!txt) return [];
  const raw = String(txt)
    .replace(/\r/g, "")
    .split(/\n|;|•|- /g)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(raw)];
};

// 👉 Componente Ver más / Ver menos (para listas largas)
function ShowMoreList({ items, max = 5 }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, max);
  const hasMore = items.length > max;

  if (!items || items.length === 0) {
    return (
      <MDTypography variant="button" color="text">
        —
      </MDTypography>
    );
  }

  return (
    <Box>
      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
        {visible.map((it, idx) => (
          <li key={`${it}-${idx}`} style={{ marginBottom: 4 }}>
            <MDTypography variant="button" color="text" sx={{ lineHeight: 1.4 }}>
              {it}
            </MDTypography>
          </li>
        ))}
      </ul>

      {hasMore && (
        <MDButton
          size="small"
          color="info"
          variant="outlined"
          onClick={() => setExpanded((e) => !e)}
          sx={{ mt: 0.5 }}
        >
          {expanded ? "Ver menos" : "Ver más"}
        </MDButton>
      )}
    </Box>
  );
}

export default function Overview() {
  const sectionTitleSx = { display: "flex", alignItems: "center", gap: 1, fontWeight: 700 };

  const theme = useTheme();
  const upXl = useMediaQuery(theme.breakpoints.up("xl"));
  const upLg = useMediaQuery(theme.breakpoints.up("lg"));
  const upMd = useMediaQuery(theme.breakpoints.up("md"));
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));

  const maxChars = useMemo(() => {
    if (upXl) return 160;
    if (upLg) return 150;
    if (upMd) return 130;
    if (upSm) return 110;
    return 90; // xs
  }, [upXl, upLg, upMd, upSm]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errorSB, setErrorSB] = useState({ open: false, msg: "" });
  const openError = (msg) => setErrorSB({ open: true, msg });
  const closeError = () => setErrorSB({ open: false, msg: "" });

  // Modal
  const [openDetail, setOpenDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Zoom
  const [zoomOpen, setZoomOpen] = useState(false);
  const handleZoomChange = (shouldOpen) => setZoomOpen(Boolean(shouldOpen));
  const handleCloseDetail = () => {
    setOpenDetail(false);
    setDetail(null);
    setZoomOpen(false);
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

  // Cargar listado + hidratar imágenes en background
  const load = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_POSTULACIONES);
      const arr = Array.isArray(data) ? data : [];
      const mapped = arr.map(mapVacanteToCard);
      setItems(mapped); // pinta rápido con fallback

      // hidratar imágenes desde el detalle (solo si hace falta)
      const needsHydration = mapped.filter(
        (it) => !it.urlImagen || String(it.urlImagen).trim() === ""
      );
      if (needsHydration.length > 0) {
        const map = await fetchImagesFor(mapped);
        // actualiza solo las que consiguieron url
        setItems((prev) =>
          prev.map((p) => {
            const url = map.get(p.id);
            return url && String(url).trim() !== "" ? { ...p, urlImagen: url } : p;
          })
        );
      }
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
      const dNorm = normalizeKeysDeep(data);
      const d = {
        id: data.VAC_CODIGO_VACANTE,
        areaNombre: data.NOMBRE_AREA ?? "—",
        titulo: data.VAC_TITULO ?? "",
        descripcion: data.VAC_DESCRIPCION ?? "",
        fechaCreacion: data.VAC_FECHA_CREACION ?? null,
        fechaCierre: data.VAC_FECHA_CIERRE ?? null,
        estadoNombre: data.ESTADO_VACANTE ?? "—",
        usuarioCreacion: data.USUARIO_CREACION ?? "—",
        requisitos: data.VAC_REQUISITOS ?? "",
        ofrecimiento: data.VAC_OFRECIMIENTO ?? "",
        requerimientos: data.VAC_REQUERIMIENTOS ?? "",
        urlImagen:
          data.VAC_URL_IMAGEN ?? dNorm.vac_url_imagen ?? dNorm.url_imagen ?? dNorm.urlimagen ?? "",
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

  // Cards (usa urlImagen hidratada si existe, si no fallback)
  const gridCards = useMemo(
    () =>
      items.map((x) => {
        const imgSrc =
          x.urlImagen && String(x.urlImagen).trim() !== "" ? x.urlImagen : IMG_VACANTE1;
        return (
          <Grid item xs={12} md={6} xl={3} key={x.id} sx={{ display: "flex" }}>
            <Box className="card-equal" sx={{ width: "100%", display: "flex" }}>
              <DefaultProjectCard
                image={imgSrc}
                label={x.area || "Vacante"}
                title={<span className="clamp-title-2">{x.titulo}</span>}
                description={<span className="clamp-3">{ellipsizeFixed(x.descripcion, 95)}</span>}
                action={{
                  type: "internal",
                  route: "#",
                  color: "info",
                  label: "Ver detalle",
                }}
                actionVariant="gradient"
                onActionClick={() => fetchDetailAndOpen(x.id)}
              />
            </Box>
          </Grid>
        );
      }),
    [items]
  );

  // Estilos modal
  const modalCardSx = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "95vw", sm: 640, md: 880 },
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    overflow: "hidden",
    outline: "none",
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
  };

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

  const modalBodySx = {
    px: 3,
    py: 2,
    overflowY: "auto",
  };

  const modalFooterSx = {
    px: 3,
    py: 2,
    borderTop: (t) => `1px solid ${t.palette.divider}`,
    position: "sticky",
    bottom: 0,
    bgcolor: "background.paper",
  };

  const zoomSafeCss = `
  .rmiz__zoomed {
    width: auto !important;
    height: auto !important;
    max-width: 95vw !important;
    max-height: 90vh !important;
  }
  .rmiz__overlay {
    z-index: 2000 !important;
    background: rgba(0,0,0,0.85) !important;
    backdrop-filter: blur(2px);
  }
  `;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <style>{globalCss}</style>
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
            <style>{zoomSafeCss}</style>

            {/* HEADER */}
            <Box sx={(t) => modalHeaderSx(t)}>
              <Grid container alignItems="center">
                <Grid item xs>
                  <MDTypography variant="h6">{detail?.titulo || "Detalle de vacante"}</MDTypography>
                  <MDTypography variant="button" color="text" sx={{ opacity: 0.8 }}>
                    {detail?.usuarioCreacion ? `Publicado por ${detail.usuarioCreacion}` : ""}
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
                  <Skeleton variant="rectangular" height={160} sx={{ my: 2, borderRadius: 2 }} />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="text" width="95%" />
                  <Skeleton variant="text" width="88%" />
                </>
              ) : detail ? (
                <Grid container spacing={2}>
                  {/* Columna izquierda: texto + bullets */}
                  <Grid item xs={12} md={7}>
                    <MDBox mb={2}>
                      <MDTypography variant="subtitle2" color="text" sx={sectionTitleSx}>
                        <LabelImportantOutlinedIcon fontSize="small" />
                        <strong>Descripción</strong>
                      </MDTypography>
                      <MDTypography variant="button" color="text" sx={{ whiteSpace: "pre-wrap" }}>
                        {detail.descripcion || "Sin descripción"}
                      </MDTypography>
                    </MDBox>

                    <MDBox mb={2}>
                      <MDTypography variant="subtitle2" color="text" sx={sectionTitleSx}>
                        <WorkOutlineIcon fontSize="small" />
                        <strong>Requisitos</strong>
                      </MDTypography>
                      <ShowMoreList items={toItems(detail.requisitos)} max={6} />
                    </MDBox>

                    <MDBox mb={2}>
                      <MDTypography variant="subtitle2" color="text" sx={sectionTitleSx}>
                        <WorkOutlineIcon fontSize="small" />
                        <strong>Ofrecimiento</strong>
                      </MDTypography>
                      <ShowMoreList items={toItems(detail.ofrecimiento)} max={6} />
                    </MDBox>

                    <MDBox mb={2}>
                      <MDTypography variant="subtitle2" color="text" sx={sectionTitleSx}>
                        <WorkOutlineIcon fontSize="small" />
                        <strong>Requerimientos</strong>
                      </MDTypography>
                      <ShowMoreList items={toItems(detail.requerimientos)} max={6} />
                    </MDBox>
                  </Grid>

                  {/* Columna derecha: imagen + metadatos */}
                  <Grid item xs={12} md={5}>
                    {detail.urlImagen ? (
                      <Box
                        sx={{
                          mb: 2,
                          border: (t) => `1px solid ${t.palette.divider}`,
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <Zoom
                          key={detail.urlImagen}
                          isZoomed={zoomOpen}
                          onZoomChange={handleZoomChange}
                          zoomMargin={24}
                          zoomZindex={2000}
                          overlayBgColorEnd="rgba(0,0,0,0.85)"
                        >
                          <img
                            src={detail.urlImagen}
                            alt={detail.titulo || "Imagen de vacante"}
                            style={{
                              width: "100%",
                              height: 220,
                              objectFit: "cover",
                              display: "block",
                              cursor: "zoom-in",
                            }}
                          />
                        </Zoom>
                      </Box>
                    ) : null}

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

                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip
                            label={detail.areaNombre || "—"}
                            variant="outlined"
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                          <Chip
                            label={detail.estadoNombre || "—"}
                            color={
                              String(detail.estadoNombre).toLowerCase().includes("abier")
                                ? "success"
                                : "default"
                            }
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        </Stack>

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
                    Cerrar
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
