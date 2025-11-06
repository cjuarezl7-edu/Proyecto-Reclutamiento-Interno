import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  IconButton,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete"; // Icono de eliminar
import EditIcon from "@mui/icons-material/Edit"; // Icono de lápiz
import RestoreIcon from "@mui/icons-material/Restore"; // Icono de reciclaje (actualizar)
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Crear un componente Card local
const Card = ({ children }) => {
  return (
    <div
      style={{
        backgroundColor: "#1E1E1E", // Fondo oscuro
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        padding: "20px",
        marginBottom: "20px",
        color: "#FFFFFF", // Texto en blanco
      }}
    >
      {children}
    </div>
  );
};

function Tables() {
  const [empleados, setEmpleados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [openInsert, setOpenInsert] = useState(false); // Estado para abrir el formulario de insertar
  const [openDelete, setOpenDelete] = useState(false); // Estado para abrir el formulario de eliminar
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState(null); // Para almacenar el empleado seleccionado para eliminar o actualizar
  const [isEditing, setIsEditing] = useState(false); // Estado para saber si estamos actualizando o insertando
  const [newEmpleado, setNewEmpleado] = useState({
    EMP_NOMBRES: "",
    EMP_APELLIDOS: "",
    EMP_EMAIL: "",
    EMP_TELEFONO: "",
    EMP_ROL: "",
    EMP_DEPARTAMENTO: "",
  });

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await axios.get("https://localhost:44358/api/Empleado");
        setEmpleados(response.data);
      } catch (error) {
        console.error("Error al obtener datos de empleados:", error);
      }
    };

    const fetchDepartamentos = async () => {
      try {
        const response = await axios.get("https://localhost:44358/api/Departamento");
        setDepartamentos(response.data);
      } catch (error) {
        console.error("Error al obtener datos de departamentos:", error);
      }
    };

    fetchEmpleados();
    fetchDepartamentos();
  }, []);

  // Maneja el cambio en los inputs del formulario de insertar o actualizar
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmpleado({ ...newEmpleado, [name]: value });
  };

  // Función para abrir el formulario en modo insertar
  const handleClickOpenInsert = () => {
    setIsEditing(false); // No estamos editando
    setOpenInsert(true);
    setNewEmpleado({
      EMP_NOMBRES: "",
      EMP_APELLIDOS: "",
      EMP_EMAIL: "",
      EMP_TELEFONO: "",
      EMP_ROL: "",
      EMP_DEPARTAMENTO: "",
    });
  };

  // Función para abrir el formulario en modo actualizar (editar)
  const handleClickOpenUpdate = (empleado) => {
    setIsEditing(true); // Estamos en modo edición
    setSelectedEmpleadoId(empleado.emP_EMPLEADO); // Guardar el ID del empleado que se va a editar
    setNewEmpleado({
      EMP_NOMBRES: empleado.emP_NOMBRES,
      EMP_APELLIDOS: empleado.emP_APELLIDOS,
      EMP_EMAIL: empleado.emP_EMAIL,
      EMP_TELEFONO: empleado.emP_TELEFONO,
      EMP_ROL: empleado.emP_ROL,
      EMP_DEPARTAMENTO: empleado.emP_DEPARTAMENTO,
    });
    setOpenInsert(true); // Abrir el formulario para editar
  };

  const handleCloseInsert = () => {
    setOpenInsert(false);
    setIsEditing(false); // Restablecer el estado de edición
  };

  // Enviar los datos del formulario para insertar el empleado
  const handleInsert = async () => {
    try {
      await axios.post("https://localhost:44358/api/Empleado", newEmpleado);
      handleCloseInsert(); // Cerrar el modal y limpiar el formulario al finalizar
      const response = await axios.get("https://localhost:44358/api/Empleado");
      setEmpleados(response.data);
    } catch (error) {
      console.error("Error al insertar empleado:", error);
    }
  };

  // Enviar los datos para actualizar el empleado
  const handleUpdate = async () => {
    try {
      // Asegúrate de que EMP_EMPLEADO está incluido en los datos que se envían
      const empleadoToUpdate = {
        ...newEmpleado,
        EMP_EMPLEADO: selectedEmpleadoId, // Añadimos el ID del empleado
      };

      console.log("Datos que se están enviando para actualizar:", empleadoToUpdate); // Verificar los datos
      await axios.put(
        `https://localhost:44358/api/Empleado/${selectedEmpleadoId}`,
        empleadoToUpdate
      );
      handleCloseInsert(); // Cerrar el modal y limpiar el formulario
      const response = await axios.get("https://localhost:44358/api/Empleado");
      setEmpleados(response.data); // Refrescar la tabla de empleados
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
    }
  };

  // Función para abrir/cerrar el modal de eliminar
  const handleClickOpenDelete = (empleadoId) => {
    setSelectedEmpleadoId(empleadoId); // Guardar el ID del empleado seleccionado
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedEmpleadoId(null); // Limpiar el empleado seleccionado
  };

  // Función para eliminar el empleado
  const handleDelete = async () => {
    try {
      await axios.delete(`https://localhost:44358/api/Empleado/${selectedEmpleadoId}`);
      setOpenDelete(false); // Cerrar el modal de confirmación
      const response = await axios.get("https://localhost:44358/api/Empleado");
      setEmpleados(response.data); // Recargar empleados
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
    }
  };

  const columns = [
    { Header: "Código Empleado", accessor: "emP_EMPLEADO" },
    { Header: "Departamento", accessor: "departamentoNombre" },
    { Header: "Nombres", accessor: "emP_NOMBRES" },
    { Header: "Apellidos", accessor: "emP_APELLIDOS" },
    { Header: "Email", accessor: "emP_EMAIL" },
    { Header: "Teléfono", accessor: "emP_TELEFONO" },
    { Header: "Rol", accessor: "emP_ROL" },
    {
      Header: "Acción",
      accessor: "accion",
      Cell: ({ row }) => (
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Botón de actualizar */}
          <IconButton
            style={{ color: "green" }}
            onClick={() => handleClickOpenUpdate(row.original)}
          >
            <RestoreIcon />
          </IconButton>

          {/* Botón de eliminar */}
          <IconButton
            color="secondary"
            onClick={() => handleClickOpenDelete(row.original.emP_EMPLEADO)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  const rows = empleados.map((empleado) => ({
    emP_EMPLEADO: empleado.emP_EMPLEADO,
    departamentoNombre:
      departamentos.find((dep) => dep.deP_DEPARTAMENTO === empleado.emP_DEPARTAMENTO)?.deP_NOMBRE ||
      "Desconocido",
    emP_NOMBRES: empleado.emP_NOMBRES,
    emP_APELLIDOS: empleado.emP_APELLIDOS,
    emP_EMAIL: empleado.emP_EMAIL,
    emP_TELEFONO: empleado.emP_TELEFONO,
    emP_ROL: empleado.emP_ROL,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* Botón del lápiz que siempre estará visible */}
      <MDBox mx={2} mt={3} display="flex" justifyContent="flex-end">
        <IconButton
          style={{ backgroundColor: "green", color: "white" }}
          onClick={handleClickOpenInsert}
        >
          <EditIcon />
        </IconButton>
      </MDBox>

      {/* Modal de eliminar */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle style={{ color: "#FFFFFF", backgroundColor: "#1E1E1E" }}>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "#1E1E1E", color: "#FFFFFF" }}>
          <MDTypography>¿Desea eliminar este empleado?</MDTypography>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "#1E1E1E" }}>
          <Button onClick={handleCloseDelete} style={{ color: "white" }}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} style={{ color: "red" }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal del formulario de insertar o actualizar */}
      <Dialog open={openInsert} onClose={handleCloseInsert}>
        <DialogTitle style={{ color: "#FFFFFF", backgroundColor: "#1E1E1E" }}>
          {isEditing ? "Actualizar Empleado" : "Insertar Empleado"}
        </DialogTitle>
        <DialogContent
          style={{
            backgroundColor: "#2C2C2C", // Fondo oscuro
            color: "white", // Letras en blanco
            border: "2px solid #004D40", // Borde verde oscuro
            borderRadius: "15px", // Borde más redondeado
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)", // Sombra más suave
            padding: "20px",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                autoFocus
                margin="dense"
                name="EMP_NOMBRES"
                label="Nombres"
                type="text"
                fullWidth
                value={newEmpleado.EMP_NOMBRES}
                onChange={handleInputChange}
                style={{
                  backgroundColor: "#1E1E1E",
                  color: "white",
                  borderRadius: "5px",
                  borderColor: "#FFFFFF",
                }} // Fondo oscuro y texto claro
                InputLabelProps={{
                  style: { color: "#FFFFFF" }, // Etiqueta en blanco
                }}
                InputProps={{
                  style: { color: "#FFFFFF" }, // Texto en blanco
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="EMP_APELLIDOS"
                label="Apellidos"
                type="text"
                fullWidth
                value={newEmpleado.EMP_APELLIDOS}
                onChange={handleInputChange}
                style={{ backgroundColor: "#1E1E1E", color: "white", borderRadius: "5px" }} // Fondo oscuro y texto claro
                InputLabelProps={{
                  style: { color: "#FFFFFF" }, // Etiqueta en blanco
                }}
                InputProps={{
                  style: { color: "#FFFFFF" }, // Texto en blanco
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="EMP_EMAIL"
                label="Email"
                type="email"
                fullWidth
                value={newEmpleado.EMP_EMAIL}
                onChange={handleInputChange}
                style={{ backgroundColor: "#1E1E1E", color: "white", borderRadius: "5px" }} // Fondo oscuro y texto claro
                InputLabelProps={{
                  style: { color: "#FFFFFF" }, // Etiqueta en blanco
                }}
                InputProps={{
                  style: { color: "#FFFFFF" }, // Texto en blanco
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="EMP_TELEFONO"
                label="Teléfono"
                type="text"
                fullWidth
                value={newEmpleado.EMP_TELEFONO}
                onChange={handleInputChange}
                style={{ backgroundColor: "#1E1E1E", color: "white", borderRadius: "5px" }} // Fondo oscuro y texto claro
                InputLabelProps={{
                  style: { color: "#FFFFFF" }, // Etiqueta en blanco
                }}
                InputProps={{
                  style: { color: "#FFFFFF" }, // Texto en blanco
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="EMP_ROL"
                label="Rol"
                type="text"
                fullWidth
                value={newEmpleado.EMP_ROL}
                onChange={handleInputChange}
                style={{ backgroundColor: "#1E1E1E", color: "white", borderRadius: "5px" }} // Fondo oscuro y texto claro
                InputLabelProps={{
                  style: { color: "#FFFFFF" }, // Etiqueta en blanco
                }}
                InputProps={{
                  style: { color: "#FFFFFF" }, // Texto en blanco
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                margin="dense"
                name="EMP_DEPARTAMENTO"
                label="Departamento"
                fullWidth
                value={newEmpleado.EMP_DEPARTAMENTO}
                onChange={handleInputChange}
                style={{ backgroundColor: "#1E1E1E", color: "white", borderRadius: "5px" }} // Fondo oscuro y texto claro
                InputLabelProps={{
                  style: { color: "#FFFFFF" }, // Etiqueta en blanco
                }}
                InputProps={{
                  style: { color: "#FFFFFF" }, // Texto en blanco
                }}
              >
                {departamentos.map((departamento) => (
                  <MenuItem
                    key={departamento.deP_DEPARTAMENTO}
                    value={departamento.deP_DEPARTAMENTO}
                  >
                    {departamento.deP_NOMBRE}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "#1E1E1E" }}>
          <Button onClick={handleCloseInsert} style={{ color: "white" }}>
            Cancelar
          </Button>
          <Button onClick={isEditing ? handleUpdate : handleInsert} style={{ color: "green" }}>
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              {" "}
              {/* Usamos el componente Card local */}
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
                  Detalle Empleado
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
