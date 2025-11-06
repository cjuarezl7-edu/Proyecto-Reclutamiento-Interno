/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// react-router-dom components
import { Link } from "react-router-dom";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Tooltip from "@mui/material/Tooltip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAvatar from "components/MDAvatar";

function DefaultProjectCard({
  image,
  label,
  title,
  description,
  action, // { type: "internal"|"external", route, color, label }
  onActionClick, // () => void | Promise<void>
  actionVariant, // "gradient" | "contained" | "outlined"
  authors,
}) {
  const safeAction = action || {};
  const hasAction =
    Boolean(onActionClick) || Boolean(safeAction && (safeAction.label || safeAction.route));

  const renderAuthors = (authors || []).map(({ image: media, name }) => (
    <Tooltip key={name} title={name} placement="bottom">
      <MDAvatar
        src={media}
        alt={name}
        size="xs"
        sx={({ borders: { borderWidth }, palette: { white } }) => ({
          border: `${borderWidth[2]} solid ${white.main}`,
          cursor: "pointer",
          position: "relative",
          ml: -1.25,
          "&:hover, &:focus": { zIndex: "10" },
        })}
      />
    </Tooltip>
  ));

  // Título clicable solo si hay acción sin callback; si hay callback,
  // preferimos que el botón sea el disparador y el título quede como texto.
  const Title =
    hasAction && !onActionClick ? (
      safeAction.type === "internal" ? (
        <MDTypography
          component={Link}
          to={safeAction.route}
          variant="h5"
          textTransform="capitalize"
        >
          {title}
        </MDTypography>
      ) : (
        <MDTypography
          component="a"
          href={safeAction.route}
          target="_blank"
          rel="noreferrer"
          variant="h5"
          textTransform="capitalize"
        >
          {title}
        </MDTypography>
      )
    ) : (
      <MDTypography variant="h5" textTransform="capitalize">
        {title}
      </MDTypography>
    );

  // Botón de acción: si hay onActionClick, NO navega y ejecuta el callback
  const ActionButton = hasAction ? (
    safeAction.type === "internal" ? (
      <MDButton
        component={onActionClick ? "button" : Link}
        to={onActionClick ? undefined : safeAction.route}
        onClick={(e) => {
          if (onActionClick) {
            e.preventDefault();
            onActionClick();
          }
        }}
        variant={actionVariant || "gradient"}
        size="small"
        color={safeAction.color || "info"}
      >
        {safeAction.label || "Ver detalle"}
      </MDButton>
    ) : (
      <MDButton
        component={onActionClick ? "button" : "a"}
        href={onActionClick ? undefined : safeAction.route}
        target={onActionClick ? undefined : "_blank"}
        rel={onActionClick ? undefined : "noreferrer"}
        onClick={(e) => {
          if (onActionClick) {
            e.preventDefault();
            onActionClick();
          }
        }}
        variant={actionVariant || "gradient"}
        size="small"
        color={safeAction.color || "info"}
      >
        {safeAction.label || "Ver detalle"}
      </MDButton>
    )
  ) : null;

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
        boxShadow: "none",
        overflow: "visible",
      }}
    >
      <MDBox position="relative" width="100.25%" shadow="xl" borderRadius="xl">
        <CardMedia
          src={image}
          component="img"
          title={title}
          sx={{
            maxWidth: "100%",
            margin: 0,
            boxShadow: ({ boxShadows: { md } }) => md,
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </MDBox>

      <MDBox mt={1} mx={0.5}>
        {label && (
          <MDTypography
            variant="button"
            fontWeight="regular"
            color="text"
            textTransform="capitalize"
          >
            {label}
          </MDTypography>
        )}

        <MDBox mb={1}>{Title}</MDBox>

        {description && (
          <MDBox mb={3} lineHeight={0}>
            <MDTypography variant="button" fontWeight="light" color="text">
              {description}
            </MDTypography>
          </MDBox>
        )}

        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          {ActionButton}
          <MDBox display="flex">{renderAuthors}</MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// Defaults
DefaultProjectCard.defaultProps = {
  authors: [],
  action: undefined, // ahora es opcional
  onActionClick: undefined, // opcional
  actionVariant: "gradient", // por defecto: azul sólido
};

// PropTypes
DefaultProjectCard.propTypes = {
  image: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.shape({
    type: PropTypes.oneOf(["external", "internal"]),
    route: PropTypes.string,
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "light",
      "dark",
      "white",
    ]),
    label: PropTypes.string,
  }),
  onActionClick: PropTypes.func,
  actionVariant: PropTypes.oneOf(["gradient", "contained", "outlined"]),
  authors: PropTypes.arrayOf(PropTypes.object),
};

export default DefaultProjectCard;
