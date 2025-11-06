/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";

function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({
    orD_ORDENID: 0,
    orD_PROVEEDOR: "",
    orD_MONTOTOTAL: "",
    orD_ESTADO: "",
    orD_COMENTARIO: "",
    orD_CREADOPOR: "",
    orD_APROBADOPOR: "",
  });

  const [successSB, setSuccessSB] = useState(false);
  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);

  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="Éxito"
      content="Operación realizada de forma exitosa!"
      open={successSB}
      onClose={closeSuccessSB}
      autoHideDuration={3000}
      close={closeSuccessSB}
    />
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const resetFormulario = () => {
    setFormulario({
      orD_ORDENID: 0,
      orD_PROVEEDOR: "",
      orD_MONTOTOTAL: "",
      orD_ESTADO: "",
      orD_COMENTARIO: "",
      orD_CREADOPOR: "",
      orD_APROBADOPOR: "",
    });
    setModoEdicion(false);
  };

  const MetodoInsertar = async () => {
    try {
      await axios.post("https://localhost:7187/api/Orden", formulario);
      const response = await axios.get("https://localhost:7187/api/Orden");
      setOrdenes(response.data);
      handleClose();
      openSuccessSB();
      resetFormulario();
    } catch (error) {
      console.error("Error al insertar:", error);
    }
  };

  const MetodoActualizar = async () => {
    try {
      const id = formulario.orD_ORDENID;
      await axios.put(`https://localhost:7187/api/Orden/${id}`, formulario);
      const response = await axios.get("https://localhost:7187/api/Orden");
      setOrdenes(response.data);
      handleClose();
      openSuccessSB();
      resetFormulario();
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://localhost:7187/api/Orden");
        setOrdenes(response.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);

  const handleDownloadPDF = async (ordenId) => {
    try {
      const response = await axios.get(`https://localhost:7187/api/Orden/DescargarPDF/${ordenId}`, {
        responseType: "blob", // Importante para manejar archivos binarios
      });

      // Crear una URL temporal para el archivo PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orden_${ordenId}.pdf`); // Nombre del archivo
      document.body.appendChild(link);
      link.click(); // Simular un clic para descargar
      document.body.removeChild(link); // Remover el enlace una vez descargado
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  const seleccionarOrden = (orden) => {
    resetFormulario();
    setFormulario({
      orD_ORDENID: orden.orD_ORDENID,
      orD_PROVEEDOR: orden.orD_PROVEEDOR,
      orD_MONTOTOTAL: orden.orD_MONTOTOTAL,
      orD_ESTADO: orden.orD_ESTADO,
      orD_COMENTARIO: orden.orD_COMENTARIO,
      orD_CREADOPOR: orden.orD_CREADOPOR,
      orD_APROBADOPOR: orden.orD_APROBADOPOR,
    });
    setModoEdicion(true);
    setOpen(true);
  };

  const handleGuardar = async () => {
    if (modoEdicion) {
      await MetodoActualizar();
    } else {
      await MetodoInsertar();
    }
  };

  const handleOpen = () => {
    resetFormulario();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const columns = [
    { Header: "ID Orden", accessor: "orD_ORDENID" },
    { Header: "Proveedor", accessor: "orD_PROVEEDOR" },
    { Header: "Monto Total", accessor: "orD_MONTOTOTAL" },
    { Header: "Estado", accessor: "orD_ESTADO" },
    { Header: "Acciones", accessor: "accion" },
  ];

  const rows = ordenes.map((orden) => ({
    orD_ORDENID: orden.orD_ORDENID,
    orD_PROVEEDOR: orden.orD_PROVEEDOR,
    orD_MONTOTOTAL: orden.orD_MONTOTOTAL,
    orD_ESTADO: orden.orD_ESTADO,
    accion: (
      <Grid container spacing={2}>
        <Grid item>
          <IconButton
            style={{ color: "green", fontSize: "1.5rem" }}
            onClick={() => seleccionarOrden(orden)}
          >
            <EditIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            style={{ color: "red", fontSize: "1.5rem" }}
            onClick={() => handleDownloadPDF(orden.orD_ORDENID)}
          >
            <PictureAsPdfIcon />
          </IconButton>
        </Grid>
      </Grid>
    ),
  }));

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    outline: "none",
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
                      Detalle Órdenes de Compra JAJA
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
                      Agregar Orden
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

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          <MDTypography variant="h6" mb={2}>
            {modoEdicion ? "Actualizar Orden" : "Agregar Orden"}
          </MDTypography>

          <TextField
            fullWidth
            label="Proveedor"
            margin="normal"
            name="orD_PROVEEDOR"
            value={formulario.orD_PROVEEDOR}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            label="Monto Total"
            margin="normal"
            name="orD_MONTOTOTAL"
            value={formulario.orD_MONTOTOTAL}
            onChange={handleInputChange}
            type="number"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Estado</InputLabel>
            <Select
              name="orD_ESTADO"
              value={formulario.orD_ESTADO}
              onChange={handleInputChange}
              label="Estado"
              fullWidth
              style={{ minHeight: "40px" }}
            >
              {/* Añadir las opciones de estado */}
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Aprobada">Aprobada</MenuItem>
              <MenuItem value="Rechazada">Rechazada</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Comentarios"
            name="orD_COMENTARIO"
            value={formulario.orD_COMENTARIO}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={4}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Creador"
            margin="normal"
            name="orD_CREADOPOR"
            value={formulario.orD_CREADOPOR}
            onChange={handleInputChange}
            disabled
          />
          <TextField
            fullWidth
            label="Aprobador"
            margin="normal"
            name="orD_APROBADOPOR"
            value={formulario.orD_APROBADOPOR}
            onChange={handleInputChange}
            disabled
          />

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sm={6} container justifyContent="flex-end">
              <MDButton variant="gradient" color="success" onClick={handleGuardar}>
                {modoEdicion ? "Actualizar" : "Guardar"}
              </MDButton>
            </Grid>
            <Grid item xs={12} sm={6} container justifyContent="flex-start">
              <MDButton variant="gradient" color="error" onClick={handleClose}>
                Cancelar
              </MDButton>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {renderSuccessSB}
    </DashboardLayout>
  );
}

export default Ordenes;
