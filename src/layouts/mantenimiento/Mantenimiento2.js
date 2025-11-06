import React from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

export default function Mantenimiento2() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4">Mantenimiento 2</MDTypography>
        <MDTypography variant="button" color="text">Pantalla de ejemplo para Mantenimiento 2</MDTypography>
      </MDBox>
    </DashboardLayout>
  );
}

