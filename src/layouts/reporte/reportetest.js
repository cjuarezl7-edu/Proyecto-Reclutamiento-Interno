/* eslint-disable prettier/prettier */
import React, { useState } from "react";
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

function ReporteOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const fetchOrdenes = async (inicio, fin) => {
    try {
      if (!inicio || !fin) {
        console.error("Debe seleccionar ambas fechas.");
        return;
      }

      // Formatear las fechas a 'YYYY-MM-DD'
      const formattedInicio = new Date(inicio).toISOString().split("T")[0];
      const formattedFin = new Date(fin).toISOString().split("T")[0];

      const url = `https://localhost:7187/api/Orden/FiltrarPorFecha?fechaInicio=${formattedInicio}&fechaFin=${formattedFin}`;
      console.log(`Consultando API con URL: ${url}`);

      const response = await axios.get(url);
      setOrdenes(response.data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      if (error.response) {
        console.error("Detalles del error:", error.response.data);
      }
    }
  };

  const handleDownloadPDF = async (ordenId) => {
    try {
      const response = await axios.get(`https://localhost:7187/api/Orden/DescargarPDF/${ordenId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orden_${ordenId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  const handleDownloadExcel = async (ordenId) => {
    try {
      const response = await axios.get(
        `https://localhost:7187/api/Orden/DescargarExcel/${ordenId}`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orden_${ordenId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el Excel:", error);
    }
  };

  const handleBuscar = () => {
    if (fechaInicio && fechaFin) {
      fetchOrdenes(fechaInicio, fechaFin);
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
        <Grid item>
          <IconButton
            style={{ color: "red", fontSize: "1.5rem" }}
            onClick={() => handleDownloadPDF(orden.orD_ORDENID)}
          >
            <PictureAsPdfIcon />
          </IconButton>
        </Grid>
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
                      Reporte Órdenes de Compra
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>

              <MDBox p={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Fecha de Inicio"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Fecha de Fin"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
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
