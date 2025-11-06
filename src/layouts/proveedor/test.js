/* prettier-ignore */

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
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar"; // Importación de MDSnackbar
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestoreIcon from "@mui/icons-material/Restore";
import AddIcon from "@mui/icons-material/AddCircle";

// prettier-ignore
const example = "This line will not be formatted";

function Tables() {
  const [MetodoLlenar, setMetodoLlenar] = useState([]);
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false); // Nuevo estado
  const [formulario, setFormulario] = useState({
    prO_PROVEEDOR: "",
    prO_NOMBRE: "",
    prO_DIRECCION: "",
    prO_NIT: "",
    prO_TELEFONO: "",
    prO_CORREO: "",
    prO_FECHA_CREACION: "",
    prO_USUARIO_CREACION: "",
  });

  // Estados para la alerta
  const [successSB, setSuccessSB] = useState(false);
  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);

  // Renderizar la alerta de éxito
  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="Éxito"
      //content="El proveedor se ha insertado correctamente."
      content="Operacion realizada de forma exitosa!"
      open={successSB}
      onClose={closeSuccessSB}
      autoHideDuration={3000}
      close={closeSuccessSB}
    />
  );

  // Función para manejar el cambio en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const resetFormulario = () => {
    setFormulario({
      prO_PROVEEDOR: "",
      prO_NOMBRE: "",
      prO_DIRECCION: "",
      prO_NIT: "",
      prO_TELEFONO: "",
      prO_CORREO: "",
      prO_FECHA_CREACION: "",
      prO_USUARIO_CREACION: "",
    });
    setModoEdicion(false); // Resetea el modo de edición
  };

  // Función para insertar registro
  const MetodoInsertar = async () => {
    try {
      const datosAEnviar = {
        ...formulario,
        prO_PROVEEDOR: formulario.prO_PROVEEDOR || 0, // Si está vacío, asigna 0
      };
      console.log("Datos enviados:", datosAEnviar); // Verifica los datos antes de enviarlos
      await axios.post("https://localhost:7187/api/Proveedor", datosAEnviar); // Inserta usando la API
      const response = await axios.get("https://localhost:7187/api/Proveedor"); // Actualiza la tabla
      setMetodoLlenar(response.data);
      handleClose(); // Cierra el modal después de insertar
      openSuccessSB(); // Muestra la alerta de éxito
      resetFormulario(); // Limpia los datos del formulario
    } catch (error) {
      console.error("Error al insertar:", error);
    }
  };

  // Funcion para actualizar registro
  const MetodoActualizar = async () => {
    try {
      const id = formulario.prO_PROVEEDOR;
      const url = `https://localhost:7187/api/Proveedor/${id}`;
      await axios.put(url, formulario); // Actualiza usando la API
      const response = await axios.get("https://localhost:7187/api/Proveedor"); // Actualiza la tabla
      setMetodoLlenar(response.data);
      handleClose(); // Cierra el modal después de actualizar
      openSuccessSB(); // Muestra la alerta de éxito
      resetFormulario(); // Limpia los datos del formulario
    } catch (error) {
      if (error.response) {
        // La solicitud se realizó y el servidor respondió con un código de estado
        // que está fuera del rango de 2xx
        console.error("Error al actualizar:", error.response.data);
      } else if (error.request) {
        // La solicitud se realizó pero no se recibió respuesta
        console.error("Error en la solicitud:", error.request);
      } else {
        // Algo salió mal al configurar la solicitud
        console.error("Error:", error.message);
      }
    }
  };

  const handleDelete = async () => {
    try {
      const id = proveedorSeleccionado.prO_PROVEEDOR; // Obtén el ID del proveedor seleccionado
      await axios.delete(`https://localhost:7187/api/Proveedor/${id}`); // Elimina el proveedor usando la API
      const response = await axios.get("https://localhost:7187/api/Proveedor"); // Actualiza la tabla
      setMetodoLlenar(response.data); // Actualiza el estado
      handleCloseDelete(); // Cierra el modal
      openSuccessSB(); // Muestra la alerta de éxito
      resetFormulario(); // Limpia los datos del formulario
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://localhost:7187/api/Proveedor");
        setMetodoLlenar(response.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);

  const seleccionarProveedor = (Proveedor) => {
    resetFormulario(); // Limpia los datos del formulario
    setFormulario({
      prO_PROVEEDOR: Proveedor.prO_PROVEEDOR,
      prO_NOMBRE: Proveedor.prO_NOMBRE,
      prO_DIRECCION: Proveedor.prO_DIRECCION,
      prO_NIT: Proveedor.prO_NIT,
      prO_TELEFONO: Proveedor.prO_TELEFONO,
      prO_CORREO: Proveedor.prO_CORREO,
      prO_FECHA_CREACION: Proveedor.prO_FECHA_CREACION,
      prO_USUARIO_CREACION: Proveedor.prO_USUARIO_CREACION,
    });
    setModoEdicion(true); // Establece el modo de edición
    setOpen(true); // Abre el modal
  };

  const handleGuardar = async () => {
    if (modoEdicion) {
      await MetodoActualizar(); // Actualiza si estamos en modo edición
    } else {
      await MetodoInsertar(); // Inserta si estamos en modo inserción
    }
  };

  const handleOpen = () => {
    resetFormulario(); // Limpia los datos del formulario
    setOpen(true); // Abre el modal
  };
  const handleClose = () => setOpen(false);

  const [openDelete, setOpenDelete] = useState(false); // Controla la visibilidad del modal
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null); // Guarda el proveedor seleccionado

  const handleOpenDelete = (proveedor) => {
    setProveedorSeleccionado(proveedor); // Establece el proveedor seleccionado para eliminar
    setOpenDelete(true); // Abre el modal
  };

  const handleCloseDelete = () => {
    setOpenDelete(false); // Cierra el modal
  };

  const columns = [
    { Header: "Código", accessor: "codigo" },
    { Header: "Nombre", accessor: "nombre" },
    { Header: "Nit", accessor: "nit" },
    { Header: "Fecha Creación", accessor: "fecha" },
    { Header: "Usuario Creación", accessor: "usuario" },
    { Header: "Acciones", accessor: "accion" },
  ];

  const rows = MetodoLlenar.map((Metodo) => ({
    codigo: Metodo.prO_PROVEEDOR,
    nombre: Metodo.prO_NOMBRE,
    nit: Metodo.prO_NIT,
    fecha: Metodo.prO_FECHA_CREACION,
    usuario: Metodo.prO_USUARIO_CREACION,
    accion: (
      <Grid container spacing={2}>
        <Grid item>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Botón de actualización */}
            <IconButton
              style={{ color: "green", fontSize: "1.5rem" }}
              onClick={() => seleccionarProveedor(Metodo)}
            >
              <EditIcon />
            </IconButton>
            {/* <MDTypography variant="caption" style={{ marginTop: "4px" }}>
              Actualizar
            </MDTypography> */}
          </div>
        </Grid>
        <Grid item>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Botón de eliminación */}
            <IconButton
              style={{ color: "red", fontSize: "1.5rem" }}
              onClick={() => handleOpenDelete(Metodo)}
            >
              <DeleteIcon />
            </IconButton>
            {/* <MDTypography variant="caption" style={{ marginTop: "4px" }}>
              Eliminar
            </MDTypography> */}
          </div>
        </Grid>
      </Grid>
    ),
  }));

  // Estilos del modal
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
          {/* Grid principal */}
          <Grid item xs={12} order={0}>
            <Card>
              {/* Título */}
              <Grid container>
                <Grid item xs={12} order={0}>
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
                      Detalle Proveedores
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>

              {/* Botón Agregar Proveedor */}
              <Grid container justifyContent="center">
                <Grid item xs={12} order={0}>
                  <MDBox pt={3} display="flex" justifyContent="center">
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={handleOpen}
                      startIcon={<AddIcon />}
                    >
                      Agregar Proveedor
                    </MDButton>
                  </MDBox>
                </Grid>
              </Grid>

              {/* Tabla de Datos */}
              <Grid container>
                <Grid item xs={12} order={0}>
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

      {/* Modal de eliminar */}
      <Modal open={openDelete} onClose={handleCloseDelete}>
        <Box sx={modalStyle}>
          {/* Ícono de cierre "X" */}
          <IconButton
            aria-label="close"
            onClick={handleCloseDelete}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Título centrado */}
          <MDTypography variant="h6" mb={2} textAlign="center">
            Confirmar Eliminación
          </MDTypography>

          <MDTypography variant="body1" mb={3} textAlign="center">
            ¿Está seguro de que desea eliminar este proveedor?
          </MDTypography>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sm={6} container justifyContent="flex-end">
              <MDButton variant="gradient" color="error" onClick={handleDelete}>
                Eliminar
              </MDButton>
            </Grid>
            <Grid item xs={12} sm={6} container justifyContent="flex-start">
              <MDButton variant="gradient" color="info" onClick={handleCloseDelete}>
                Cancelar
              </MDButton>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          {/* Ícono de cierre "X" */}
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
            {modoEdicion ? "Actualizar Proveedor" : "Agregar Proveedor"}
          </MDTypography>

          <TextField
            fullWidth
            label="Nombre"
            margin="normal"
            name="prO_NOMBRE"
            value={formulario.prO_NOMBRE}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            label="Direccion"
            margin="normal"
            name="prO_DIRECCION"
            value={formulario.prO_DIRECCION}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            label="NIT"
            margin="normal"
            name="prO_NIT"
            value={formulario.prO_NIT}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                handleInputChange(e);
              }
            }}
            type="text"
          />
          <TextField
            fullWidth
            label="Teléfono"
            margin="normal"
            name="prO_TELEFONO"
            value={formulario.prO_TELEFONO}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,8}$/.test(value)) {
                handleInputChange(e);
              }
            }}
            type="text"
            inputProps={{
              maxLength: 8,
              minLength: 8,
            }}
          />
          <TextField
            fullWidth
            label="Correo"
            margin="normal"
            name="prO_CORREO"
            value={formulario.prO_CORREO}
            onChange={handleInputChange}
            type="email" // Valida que el formato sea de correo electrónico
          />
          <TextField
            fullWidth
            label="Fecha Creación"
            margin="normal"
            name="prO_FECHA_CREACION"
            value={formulario.prO_FECHA_CREACION}
            onChange={handleInputChange}
            style={{ display: "none" }} // Oculta el TextField
          />
          <TextField
            fullWidth
            label="Usuario Creación"
            margin="normal"
            name="prO_USUARIO_CREACION"
            value={formulario.prO_USUARIO_CREACION}
            onChange={handleInputChange}
            style={{ display: "none" }} // Oculta el TextField
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
      {/* Render de la alerta de éxito */}
      {renderSuccessSB}
    </DashboardLayout>
  );
}

export default Tables;
