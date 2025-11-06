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
import IconButton from "@mui/material/IconButton";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import MDButton from "components/MDButton";
import TextField from "@mui/material/TextField";
import { Select, MenuItem } from "@mui/material";

function ReporteOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [selectedProveedor, setSelectedProveedor] = useState("Todos");

  useEffect(() => {
    // Cargar la lista de proveedores al cargar la página
    const fetchProveedores = async () => {
      try {
        const response = await axios.get("https://apptualizate.net/ApiDemo/api/Proveedor");
        setProveedores(response.data);
      } catch (error) {
        console.error("Error al obtener los proveedores:", error);
      }
    };

    fetchProveedores();
  }, []);

  const fetchOrdenes = async (inicio, fin, proveedor) => {
    try {
      let url = `https://apptualizate.net/ApiDemo/api/Orden/FiltrarPorFecha?fechaInicio=${inicio}&fechaFin=${fin}`;
      if (proveedor && proveedor !== "Todos") {
        url += `&proveedor=${encodeURIComponent(proveedor)}`;
      }

      const response = await axios.get(url);
      setOrdenes(response.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  const handleDownloadPDF = async (ordenId) => {
    try {
      const response = await axios.get(
        `https://apptualizate.net/ApiDemo/api/Orden/DescargarPDF/${ordenId}`,
        {
          responseType: "blob", // Importante para manejar archivos binarios
        }
      );

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

  const handleDownloadExcel = async (ordenId) => {
    try {
      const response = await axios.get(
        `https://apptualizate.net/ApiDemo/api/Orden/DescargarExcel/${ordenId}`,
        {
          responseType: "blob", // Importante para manejar archivos binarios
        }
      );

      // Crear una URL temporal para el archivo Excel
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orden_${ordenId}.xlsx`); // Nombre del archivo
      document.body.appendChild(link);
      link.click(); // Simular un clic para descargar
      document.body.removeChild(link); // Remover el enlace una vez descargado
    } catch (error) {
      console.error("Error al descargar el Excel:", error);
    }
  };

  const handleBuscar = () => {
    if (fechaInicio && fechaFin) {
      fetchOrdenes(fechaInicio, fechaFin, selectedProveedor); // Llamar la función para filtrar por fechas y proveedor
    } else {
      console.error("Debe seleccionar ambas fechas");
    }
  };

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
        {/* Botón para exportar a PDF */}
        <Grid item>
          <IconButton
            style={{ color: "red", fontSize: "1.5rem" }}
            onClick={() => handleDownloadPDF(orden.orD_ORDENID)}
          >
            <PictureAsPdfIcon />
          </IconButton>
        </Grid>
        {/* Botón para exportar a Excel */}
        <Grid item>
          <IconButton
            style={{ color: "green", fontSize: "1.5rem" }}
            onClick={() => handleDownloadExcel(orden.orD_ORDENID)}
          >
            <InsertDriveFileIcon />
          </IconButton>
        </Grid>
      </Grid>
    ),
  }));

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
                      Reporte ordenes de Compra
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>

              <MDBox p={3}>
                <Grid container spacing={2} alignItems="center">
                  {/* Select para Proveedor */}
                  <Grid item xs={12} md={3}>
                    <Select
                      fullWidth
                      value={selectedProveedor}
                      onChange={(e) => setSelectedProveedor(e.target.value)}
                      displayEmpty
                      style={{ minHeight: "44px" }}
                    >
                      <MenuItem value="Todos">Todos</MenuItem>
                      {proveedores.map((proveedor) => (
                        <MenuItem key={proveedor.prO_PROVEEDOR} value={proveedor.prO_NOMBRE}>
                          {proveedor.prO_NOMBRE}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>

                  {/* Input para Fecha de Inicio */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Fecha de Inicio"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                    />
                  </Grid>

                  {/* Input para Fecha de Fin */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Fecha de Fin"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                    />
                  </Grid>

                  {/* Botón de Buscar */}
                  <Grid item xs={12} md={3}>
                    <MDButton variant="gradient" color="success" fullWidth onClick={handleBuscar}>
                      Buscar
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>

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
    </DashboardLayout>
  );
}

export default ReporteOrdenes;
