/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { Select, MenuItem, InputLabel, FormControl, Dialog, DialogContent } from "@mui/material";

// ====== ENDPOINTS ======
const API_BASE = "http://cjuarez99-001-site1.anytempurl.com/api/Vacante";
const API_AREAS = "http://cjuarez99-001-site1.anytempurl.com/api/Catalogos/areas";
const API_ESTADOS = "http://cjuarez99-001-site1.anytempurl.com/api/Catalogos/estados-vacante";

// ====== HELPERS ======
const normalizeKeysDeep = (input) => {
  if (Array.isArray(input)) return input.map(normalizeKeysDeep);
  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [String(k).toLowerCase(), normalizeKeysDeep(v)])
    );
  }
  return input;
};

const mapCatalogo = (x) => ({
  id: x.id ?? x.car_codigo_area ?? x.cev_codigo_estado_vacante,
  nombre: x.nombre ?? x.car_nombre ?? x.cev_nombre,
});

const mapVacanteFromApi = (raw) => {
  const v = normalizeKeysDeep(raw);
  return {
    id: v.vac_codigo_vacante,
    areaId: v.vac_codigo_area ?? null,
    estadoId: v.cev_estado_vacante ?? null,

    areaNombre: v.nombre_area ?? null,
    titulo: v.vac_titulo ?? "",
    descripcion: v.vac_descripcion ?? "",

    requisitos: v.vac_requisitos ?? "",
    ofrecimiento: v.vac_ofrecimiento ?? "",
    requerimientos: v.vac_requerimientos ?? "",
    urlImagen: v.vac_url_imagen ?? "",

    fechaCreacion: v.vac_fecha_creacion ?? null,
    fechaCierre: v.vac_fecha_cierre ?? null,
    fechaModificacion: v.vac_fecha_modificacion ?? null,

    estadoNombre: v.estado_vacante ?? null,
    usuarioCreacion: v.usuario_creacion ?? null,
  };
};

const buildVacanteModel = (form, { isUpdate = false } = {}) => ({
  VAC_CODIGO_VACANTE: form.id ?? 0,
  VAC_CODIGO_AREA: Number(form.areaId) || 0,
  VAC_TITULO: form.titulo || null,
  VAC_DESCRIPCION: form.descripcion || null,

  // nuevos
  VAC_REQUISITOS: form.requisitos || null,
  VAC_OFRECIMIENTO: form.ofrecimiento || null,
  VAC_REQUERIMIENTOS: form.requerimientos || null,
  VAC_URL_IMAGEN: form.urlImagen || null,

  VAC_FECHA_CREACION: new Date().toISOString(),
  VAC_FECHA_CIERRE: form.fechaCierre ? new Date(form.fechaCierre).toISOString() : null,
  CEV_ESTADO_VACANTE: Number(form.estadoId) || 0,

  VAC_USUARIO_CREACION: Number(form.usuarioCreacion) || 1,
  ...(isUpdate && { VAC_USUARIO_MODIFICACION: Number(form.usuarioModificacion) || 1 }),
});

// truncador simple
const short = (s, n = 40) => (!s ? "-" : s.length > n ? s.slice(0, n - 1) + "…" : s);

function Vacantes() {
  // ====== STATE ======
  const [vacantes, setVacantes] = useState([]);
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [form, setForm] = useState({
    id: 0,
    areaId: "",
    titulo: "",
    descripcion: "",
    requisitos: "",
    ofrecimiento: "",
    requerimientos: "",
    urlImagen: "",
    fechaCierre: "",
    estadoId: "",
    usuarioCreacion: "1",
    usuarioModificacion: "1",
  });

  const [areas, setAreas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  const [successSB, setSuccessSB] = useState(false);
  const [errorSB, setErrorSB] = useState({ open: false, msg: "" });
  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);
  const openError = (msg) => setErrorSB({ open: true, msg });
  const closeError = () => setErrorSB({ open: false, msg: "" });

  const [openDelete, setOpenDelete] = useState(false);
  const [vacanteAEliminar, setVacanteAEliminar] = useState(null);

  // Imagen (archivo + preview)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Viewer Dialog para imagen
  const [imgViewerOpen, setImgViewerOpen] = useState(false);

  // Para preview unificada: primero DataURL (si hay), luego URL BD
  const srcPreview = imagePreview || form.urlImagen || "";

  // ====== HANDLERS ======
  const handleOpenDelete = (vacante) => {
    setVacanteAEliminar(vacante);
    setOpenDelete(true);
  };
  const handleCloseDelete = () => {
    setVacanteAEliminar(null);
    setOpenDelete(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // seleccionar archivo + validaciones + preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valid = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!valid.includes(file.type)) {
      openError("Formato no permitido. Usa JPG, PNG, GIF o WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      openError("La imagen supera los 10 MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setForm((s) => ({ ...s, urlImagen: "" }));
  };

  // subir archivo si hay y devolver URL
  const uploadImageIfNeeded = async () => {
    if (!imageFile) return null;
    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      const { data } = await axios.post(
        "http://cjuarez99-001-site1.anytempurl.com/api/Vacante/upload-image",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data?.url || data?.URL || data?.Url || null;
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      openError("No se pudo subir la imagen.");
      throw err;
    }
  };

  const resetForm = () => {
    setForm({
      id: 0,
      areaId: "",
      titulo: "",
      descripcion: "",
      requisitos: "",
      ofrecimiento: "",
      requerimientos: "",
      urlImagen: "",
      fechaCierre: "",
      estadoId: "",
      usuarioCreacion: "1",
      usuarioModificacion: "1",
    });
    setModoEdicion(false);
    setImageFile(null);
    setImagePreview("");
    setImgViewerOpen(false);
  };

  // ====== LOADERS ======
  const loadCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      const [areasRes, estadosRes] = await Promise.all([
        axios.get(API_AREAS),
        axios.get(API_ESTADOS),
      ]);
      const aData = normalizeKeysDeep(areasRes.data);
      const eData = normalizeKeysDeep(estadosRes.data);
      setAreas((Array.isArray(aData) ? aData : []).map(mapCatalogo));
      setEstados((Array.isArray(eData) ? eData : []).map(mapCatalogo));
    } catch (err) {
      console.error("Error catálogos:", err);
      openError("No se pudieron cargar los catálogos.");
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const loadAll = async () => {
    try {
      const { data } = await axios.get(API_BASE);
      const mapped = Array.isArray(data) ? data.map(mapVacanteFromApi) : [];
      setVacantes(mapped);
    } catch (err) {
      console.error(err);
      openError("No se pudo obtener el listado de vacantes.");
    }
  };

  const ensureCatalogsLoaded = async () => {
    if (areas.length && estados.length) return;
    await loadCatalogos();
  };

  const getById = async (id) => {
    const { data } = await axios.get(`${API_BASE}/${id}`);
    return {
      id: data.VAC_CODIGO_VACANTE,
      areaId: data.VAC_CODIGO_AREA ?? null,
      estadoId: data.CEV_ESTADO_VACANTE ?? null,
      titulo: data.VAC_TITULO ?? "",
      descripcion: data.VAC_DESCRIPCION ?? "",

      requisitos: data.VAC_REQUISITOS ?? "",
      ofrecimiento: data.VAC_OFRECIMIENTO ?? "",
      requerimientos: data.VAC_REQUERIMIENTOS ?? "",
      urlImagen: data.VAC_URL_IMAGEN ?? "",

      fechaCierre: data.VAC_FECHA_CIERRE ?? null,
      areaNombre: data.NOMBRE_AREA ?? null,
      estadoNombre: data.ESTADO_VACANTE ?? null,
      usuarioCreacion: data.USUARIO_CREACION ?? null,
    };
  };

  // ====== CRUD ======
  const isValidUrl = (s) => {
    if (!s) return true;
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  };

  const MetodoInsertar = async () => {
    try {
      let finalUrl = form.urlImagen || "";
      if (imageFile) {
        const uploadedUrl = await uploadImageIfNeeded();
        if (uploadedUrl) finalUrl = uploadedUrl;
      }
      const payload = {
        ...buildVacanteModel(form, { isUpdate: false }),
        VAC_URL_IMAGEN: finalUrl || null,
      };

      const { data } = await axios.post(API_BASE, payload);
      if (data?.id) {
        await loadAll();
        handleClose();
        openSuccessSB();
        resetForm();
      } else {
        openError("No se recibió ID creado.");
      }
    } catch (error) {
      console.error("Error al insertar:", error);
      openError(error?.response?.data ?? "Error al insertar la vacante.");
    }
  };

  const MetodoActualizar = async () => {
    try {
      const id = form.id;
      let finalUrl = form.urlImagen || "";
      if (imageFile) {
        const uploadedUrl = await uploadImageIfNeeded();
        if (uploadedUrl) finalUrl = uploadedUrl;
      }
      const payload = {
        ...buildVacanteModel(form, { isUpdate: true }),
        VAC_URL_IMAGEN: finalUrl || null,
      };

      await axios.put(`${API_BASE}/${id}`, payload);
      await loadAll();
      handleClose();
      openSuccessSB();
      resetForm();
    } catch (error) {
      console.error("Error al actualizar:", error);
      openError(error?.response?.data ?? "Error al actualizar la vacante.");
    }
  };

  const MetodoEliminar = async () => {
    if (!vacanteAEliminar) return;
    try {
      await axios.delete(`${API_BASE}/${vacanteAEliminar.id}`);
      await loadAll();
      openSuccessSB();
    } catch (error) {
      console.error("Error al eliminar:", error);
      openError(error?.response?.data ?? "Error al eliminar la vacante.");
    } finally {
      handleCloseDelete();
    }
  };

  // ====== EFFECTS ======
  useEffect(() => {
    loadCatalogos();
    loadAll();
  }, []);

  const seleccionarVacante = async (fila) => {
    try {
      await ensureCatalogsLoaded();
      const det = await getById(fila.id);

      setForm({
        id: det.id,
        areaId: det.areaId != null ? String(det.areaId) : "",
        titulo: det.titulo ?? "",
        descripcion: det.descripcion ?? "",
        requisitos: det.requisitos ?? "",
        ofrecimiento: det.ofrecimiento ?? "",
        requerimientos: det.requerimientos ?? "",
        urlImagen: det.urlImagen ?? "",
        fechaCierre: det.fechaCierre ? String(det.fechaCierre).slice(0, 10) : "",
        estadoId: det.estadoId != null ? String(det.estadoId) : "",
        usuarioCreacion: "1",
        usuarioModificacion: "1",
      });

      setImageFile(null);
      setImagePreview(det.urlImagen || "");
      setModoEdicion(true);
      setOpen(true);
    } catch (err) {
      console.error(err);
      openError("No se pudo cargar el detalle de la vacante.");
    }
  };

  const handleGuardar = async () => {
    if (!form.areaId) return openError("El área es obligatoria.");
    if (!form.estadoId) return openError("El estado es obligatorio.");
    if (!isValidUrl(form.urlImagen)) return openError("La URL de imagen no es válida.");

    if (modoEdicion) await MetodoActualizar();
    else await MetodoInsertar();
  };

  const handleOpen = () => {
    resetForm();
    setOpen(true);
  };

  const handleClose = () => {
    setImgViewerOpen(false); // asegurarse que el visor quede cerrado
    setOpen(false);
  };

  // ====== TABLA (vista corta) ======
  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Área", accessor: "areaNombre" },
      { Header: "Título", accessor: "tituloShort" },
      { Header: "Estado", accessor: "estadoNombre" },
      { Header: "F. Creación", accessor: "fechaCreacion" },
      { Header: "F. Cierre", accessor: "fechaCierre" },
      { Header: "Acciones", accessor: "accion" },
    ],
    []
  );

  const rows = vacantes.map((v) => ({
    id: v.id,
    areaNombre: v.areaNombre ?? "-",
    tituloShort: short(v.titulo, 30),
    estadoNombre: v.estadoNombre ?? "-",
    fechaCreacion: v.fechaCreacion ? String(v.fechaCreacion).slice(0, 10) : "-",
    fechaCierre: v.fechaCierre ? String(v.fechaCierre).slice(0, 10) : "-",
    accion: (
      <Grid container spacing={1}>
        <Grid item>
          <IconButton
            style={{ color: "green", fontSize: "1.5rem" }}
            onClick={() => seleccionarVacante(v)}
            aria-label="Editar"
          >
            <EditIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            style={{ color: "crimson", fontSize: "1.5rem" }}
            onClick={() => handleOpenDelete(v)}
            aria-label="Eliminar"
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    ),
  }));

  // ====== ESTILOS DE MODALES ======
  const modalSx = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "95%", sm: "85%", md: 720 },
    maxHeight: { xs: "90vh", md: "85vh" },
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const confirmModalSx = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "92%", sm: 520, md: 560 },
    maxHeight: { xs: "85vh", md: "75vh" },
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <Grid container>
                <Grid item xs={12}>
                  <MDBox
                    mx={2}
                    mt={-3}
                    py={3}
                    px={2}
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                  >
                    <MDTypography variant="h6" color="white">
                      Mantenimiento de Vacantes
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>

              <Grid container justifyContent="center">
                <Grid item xs={12}>
                  <MDBox pt={3} display="flex" justifyContent="center">
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={handleOpen}
                      startIcon={<AddIcon />}
                    >
                      Agregar Vacante
                    </MDButton>
                  </MDBox>
                </Grid>
              </Grid>

              <Grid container>
                <Grid item xs={12}>
                  <MDBox pt={3}>
                    <DataTable
                      table={{ columns, rows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  </MDBox>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* ====== MODAL ALTA / EDICIÓN ====== */}
      <Modal open={open} onClose={handleClose} keepMounted>
        <Box sx={modalSx}>
          {/* Header sticky */}
          <MDBox
            px={3}
            py={2}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              bgcolor: "background.paper",
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <MDTypography variant="h6">
              {modoEdicion ? "Actualizar Vacante" : "Agregar Vacante"}
            </MDTypography>
            <IconButton
              aria-label="Cerrar"
              onClick={handleClose}
              size="large"
              sx={{ color: (t) => t.palette.text.secondary }}
            >
              <CloseIcon />
            </IconButton>
          </MDBox>

          {/* Contenido con scroll interno */}
          <MDBox
            px={{ xs: 2, sm: 3 }}
            py={2}
            sx={{
              overflowY: "auto",
              flex: 1,
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.2)", borderRadius: 8 },
              scrollbarColor: "rgba(0,0,0,0.2) transparent",
              scrollbarWidth: "thin",
            }}
          >
            <TextField
              fullWidth
              label="Título"
              margin="normal"
              name="titulo"
              value={form.titulo}
              onChange={handleInputChange}
            />

            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={form.descripcion}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" disabled={loadingCatalogos}>
                  <InputLabel>Área</InputLabel>
                  <Select
                    name="areaId"
                    value={form.areaId}
                    label="Área"
                    onChange={handleInputChange}
                    fullWidth
                    sx={{ minHeight: 45 }}
                  >
                    {areas.map((a) => (
                      <MenuItem key={a.id} value={String(a.id)}>
                        {a.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" disabled={loadingCatalogos}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estadoId"
                    value={form.estadoId}
                    label="Estado"
                    onChange={handleInputChange}
                    fullWidth
                    sx={{ minHeight: 45 }}
                  >
                    {estados.map((e) => (
                      <MenuItem key={e.id} value={String(e.id)}>
                        {e.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              type="date"
              label="Fecha de cierre"
              margin="normal"
              name="fechaCierre"
              value={form.fechaCierre}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Requisitos"
              name="requisitos"
              value={form.requisitos}
              onChange={handleInputChange}
              margin="normal"
              multiline
              minRows={3}
            />

            <TextField
              fullWidth
              label="Ofrecimiento"
              name="ofrecimiento"
              value={form.ofrecimiento}
              onChange={handleInputChange}
              margin="normal"
              multiline
              minRows={3}
            />

            <TextField
              fullWidth
              label="Requerimientos"
              name="requerimientos"
              value={form.requerimientos}
              onChange={handleInputChange}
              margin="normal"
              multiline
              minRows={3}
            />

            {/* Carga de imagen + URL + Vista previa (abre visor) */}
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={7}>
                <MDTypography variant="subtitle2" gutterBottom>
                  Imagen de la vacante
                </MDTypography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <MDButton variant="outlined" color="info" component="label">
                    Seleccionar imagen
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                      aria-label="Seleccionar imagen"
                    />
                  </MDButton>

                  <TextField
                    fullWidth
                    label="URL Imagen (opcional)"
                    name="urlImagen"
                    value={form.urlImagen}
                    onChange={handleInputChange}
                    placeholder="https://…"
                  />

                  {(imagePreview || form.urlImagen) && (
                    <MDButton variant="outlined" color="error" onClick={handleClearImage}>
                      Limpiar imagen
                    </MDButton>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={5}>
                <MDTypography variant="subtitle2" gutterBottom>
                  Vista previa (click para ampliar)
                </MDTypography>

                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "16/10",
                    borderRadius: 2,
                    border: (t) => `1px dashed ${t.palette.divider}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    bgcolor: (t) => t.palette.grey[50],
                  }}
                >
                  {srcPreview ? (
                    <img
                      src={srcPreview}
                      alt="Miniatura de la vacante"
                      onClick={() => setImgViewerOpen(true)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        cursor: "zoom-in",
                      }}
                    />
                  ) : (
                    <MDTypography variant="button" color="text">
                      Sin imagen
                    </MDTypography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </MDBox>

          {/* Footer sticky */}
          <MDBox
            px={{ xs: 2, sm: 3 }}
            py={2}
            sx={{
              position: "sticky",
              bottom: 0,
              zIndex: 1,
              bgcolor: "background.paper",
              borderTop: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sm={6}
                display="flex"
                justifyContent={{ xs: "stretch", sm: "flex-end" }}
              >
                <MDButton variant="gradient" color="success" onClick={handleGuardar} fullWidth>
                  {modoEdicion ? "Actualizar" : "Guardar"}
                </MDButton>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                display="flex"
                justifyContent={{ xs: "stretch", sm: "flex-start" }}
              >
                <MDButton variant="gradient" color="error" onClick={handleClose} fullWidth>
                  Cancelar
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </Box>
      </Modal>

      {/* ====== MODAL CONFIRMACIÓN ELIMINAR ====== */}
      <Modal open={openDelete} onClose={handleCloseDelete} keepMounted>
        <Box
          sx={confirmModalSx}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <MDBox
            px={3}
            py={2}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              bgcolor: "background.paper",
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <MDTypography id="confirm-delete-title" variant="h6">
              Confirmar eliminación
            </MDTypography>
            <IconButton
              aria-label="Cerrar"
              onClick={handleCloseDelete}
              size="large"
              sx={{ color: (t) => t.palette.text.secondary }}
            >
              <CloseIcon />
            </IconButton>
          </MDBox>

          <MDBox
            px={{ xs: 2, sm: 3 }}
            py={2}
            sx={{
              overflowY: "auto",
              flex: 1,
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.2)", borderRadius: 8 },
              scrollbarColor: "rgba(0,0,0,0.2) transparent",
              scrollbarWidth: "thin",
            }}
          >
            <MDTypography variant="body1" mb={1}>
              Estás a punto de eliminar la siguiente vacante:
            </MDTypography>

            <MDBox
              mt={1}
              mb={2}
              p={2}
              sx={{
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                bgcolor: (t) => t.palette.grey[50],
              }}
            >
              <MDTypography variant="subtitle2" gutterBottom>
                ID: {vacanteAEliminar?.id ?? "-"}
              </MDTypography>
              <MDTypography variant="subtitle2" gutterBottom>
                Título: {vacanteAEliminar?.titulo ?? "(sin título)"}
              </MDTypography>
              <MDTypography variant="subtitle2" gutterBottom>
                Área: {vacanteAEliminar?.areaNombre ?? "-"}
              </MDTypography>
              <MDTypography variant="subtitle2" gutterBottom>
                Estado: {vacanteAEliminar?.estadoNombre ?? "-"}
              </MDTypography>
            </MDBox>

            <MDTypography variant="body2" color="text.secondary">
              Esta acción es permanente y no se puede deshacer.
            </MDTypography>
          </MDBox>

          <MDBox
            px={{ xs: 2, sm: 3 }}
            py={2}
            sx={{
              position: "sticky",
              bottom: 0,
              zIndex: 1,
              bgcolor: "background.paper",
              borderTop: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sm={6}
                display="flex"
                justifyContent={{ xs: "stretch", sm: "flex-end" }}
              >
                <MDButton
                  variant="gradient"
                  color="error"
                  onClick={MetodoEliminar}
                  fullWidth
                  autoFocus
                >
                  Eliminar
                </MDButton>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                display="flex"
                justifyContent={{ xs: "stretch", sm: "flex-start" }}
              >
                <MDButton variant="gradient" color="info" onClick={handleCloseDelete} fullWidth>
                  Cancelar
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </Box>
      </Modal>

      {/* ====== VISOR DE IMAGEN (Dialog MUI) ====== */}
      <Dialog
        open={imgViewerOpen}
        onClose={() => setImgViewerOpen(false)}
        fullScreen
        keepMounted={false}
        BackdropProps={{ sx: { backgroundColor: "rgba(0,0,0,0.92)" } }}
        PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none" } }}
      >
        {/* Botón cerrar */}
        <IconButton
          aria-label="Cerrar imagen"
          title="Cerrar"
          onClick={() => setImgViewerOpen(false)}
          sx={{
            position: "fixed",
            top: { xs: 8, sm: 16 },
            right: { xs: 8, sm: 16 },
            zIndex: (t) => t.zIndex.modal + 1,
            bgcolor: "rgba(0,0,0,0.55)",
            color: "white",
            backdropFilter: "blur(2px)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent
          sx={{
            p: 0,
            m: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "transparent",
          }}
        >
          {srcPreview && (
            <img
              src={srcPreview}
              alt="Vista ampliada"
              onClick={() => setImgViewerOpen(false)} // click en imagen también cierra
              style={{
                maxWidth: "100vw",
                maxHeight: "100vh",
                objectFit: "contain",
                display: "block",
                cursor: "zoom-out",
                userSelect: "none",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <MDSnackbar
        color="success"
        icon="check"
        title="Éxito"
        content="Operación realizada con éxito."
        open={successSB}
        onClose={closeSuccessSB}
        autoHideDuration={2500}
        close={closeSuccessSB}
      />
      <MDSnackbar
        color="error"
        icon="warning"
        title="Error"
        content={errorSB.msg || "Ocurrió un error."}
        open={errorSB.open}
        onClose={closeError}
        autoHideDuration={3500}
        close={closeError}
      />
    </DashboardLayout>
  );
}

export default Vacantes;
