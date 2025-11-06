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

import { useEffect, useState } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");
  const [openMenus, setOpenMenus] = useState({});

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);
  const toggleMenu = (key, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (miniSidenav) setMiniSidenav(dispatch, false);
    setOpenMenus((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { console.debug('[Sidenav] toggleMenu', key, next[key]); } catch {}
      return next;
    });
  };
  
  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = routes.map((routeItem) => {
    const { type, name, icon, title, noCollapse, key, href, route, collapse } = routeItem;
    let returnValue;

    if (type === "collapse") {
      // Parent with children (dropdown)
      if (Array.isArray(collapse) && collapse.length > 0) {
        const childActive = collapse.some((ch) => ch.key === collapseName);
        const isOpen = openMenus[key] ?? childActive;
        returnValue = (
          <SidenavCollapse
            key={key}
            name={name}
            icon={icon}
            active={isOpen}
            hasChildren
            open={isOpen}
            onClick={(e) => toggleMenu(key, e)}
            itemProps={{ onMouseDown: (e) => { e.preventDefault(); e.stopPropagation(); } }}
            listItemSx={{ display: "block", p: 0, position: "relative", zIndex: 1 }}
          >
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="ul" disablePadding>
                {collapse.map((ch) => {
                  const { key: ckey, name: cname, icon: cicon, route: croute, href: chref } = ch;
                  const active = ckey === collapseName;
                  return chref ? (
                    <MDBox key={ckey} pl={3}>
                      <Link
                        href={chref}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ textDecoration: "none" }}
                      >
                        <SidenavCollapse name={cname} icon={cicon} active={active} />
                      </Link>
                    </MDBox>
                  ) : (
                    <MDBox key={ckey} pl={3}>
                      <NavLink to={croute}>
                        <SidenavCollapse name={cname} icon={cicon} active={active} />
                      </NavLink>
                    </MDBox>
                  );
                })}
              </List>
            </Collapse>
          </SidenavCollapse>
        );
      }
      // Leaf item (no children)
      returnValue = href ? (
        <SidenavCollapse
          key={key}
          name={name}
          icon={icon}
          active={key === collapseName}
          itemComponent={Link}
          itemProps={{ href, target: "_blank", rel: "noreferrer", sx: { textDecoration: "none" } }}
        />
      ) : (
        <SidenavCollapse
          key={key}
          name={name}
          icon={icon}
          active={key === collapseName}
          itemComponent={NavLink}
          itemProps={{ to: route }}
        />
      );
    } else if (type === "title") {
      returnValue = (
        <MDTypography
          key={key}
          color={textColor}
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {title}
        </MDTypography>
      );
    } else if (type === "divider") {
      returnValue = (
        <Divider
          key={key}
          light={
            (!darkMode && !whiteSidenav && !transparentSidenav) ||
            (darkMode && !transparentSidenav && whiteSidenav)
          }
        />
      );
    }

    return returnValue;
  });

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <List>{renderRoutes}</List>
      {/* <MDBox p={2} mt="auto">
        <MDButton
          component="a"
          href="https://www.creative-tim.com/product/material-dashboard-pro-react"
          target="_blank"
          rel="noreferrer"
          variant="gradient"
          color={sidenavColor}
          fullWidth
        >
          upgrade to pro
        </MDButton>
      </MDBox> */}
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
