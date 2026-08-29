import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Assessment,
  AccountCircle,
  Dashboard,
  Inventory,
  LocalOffer,
  Logout,
  Menu as MenuIcon,
  People,
  Receipt,
  ShoppingCart,
  Storefront,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 258;

const navigation = {
  admin: [
    ["Dashboard", "/admin/dashboard", Dashboard],
    ["Accounts", "/admin/accounts", People],
    ["Staff Approvals", "/admin/approvals/staff", People],
    ["Client Approvals", "/admin/approvals/clients", People],
    ["Submissions", "/admin/approvals/submissions", Inventory],
    ["Reports", "/admin/reports", Assessment],
    ["Product Monitor", "/admin/product-monitor", Inventory],
  ],
  staff: [
    ["Dashboard", "/staff/dashboard", Dashboard],
    ["Products", "/staff/products", Inventory],
    ["Receipts", "/staff/receipts", Receipt],
    ["Promos", "/staff/promos", LocalOffer],
    ["Users", "/staff/users", People],
    ["Submissions", "/staff/submissions", Inventory],
  ],
  client: [
    ["Dashboard", "/client/dashboard", Dashboard],
    ["Walk-in Order", "/client/checkout", ShoppingCart],
    ["Order History", "/client/history", Receipt],
    ["Favorites", "/client/favorites", Storefront],
    ["Profile", "/client/profile", AccountCircle],
  ],
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = String(user?.role || "client").toLowerCase();
  const items = navigation[role] || navigation.client;

  const handleNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ px: 2.5, py: 2.4 }}>
        <Box sx={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 2, bgcolor: "#CCFBF1", color: "#0F766E" }}>
          <Storefront fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>StoreHub</Typography>
          <Typography variant="caption" sx={{ color: "#64748B" }}>Stock management</Typography>
        </Box>
      </Stack>
      <Divider />
      <Typography variant="overline" sx={{ px: 2.5, pt: 2.5, pb: 0.8, color: "#94A3B8", fontWeight: 800, letterSpacing: 1.1 }}>
        Workspace
      </Typography>
      <List sx={{ px: 1.25, py: 0 }}>
        {items.map(([label, path, Icon]) => {
          const active = location.pathname.startsWith(path);
          return (
            <ListItemButton
              key={path}
              selected={active}
              onClick={() => handleNavigate(path)}
              sx={{
                minHeight: 44,
                mb: 0.5,
                borderRadius: 1.5,
                color: active ? "#0F766E" : "#475569",
                "&.Mui-selected": { bgcolor: "#CCFBF1", color: "#0F766E", fontWeight: 700 },
                "&.Mui-selected:hover": { bgcolor: "#99F6E4" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}><Icon fontSize="small" /></ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 600 }} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List sx={{ px: 1.25, py: 1.25 }}>
        <ListItemButton onClick={() => { logout(); navigate("/"); }} sx={{ borderRadius: 1.5, color: "#DC2626", minHeight: 44 }}>
          <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}><Logout fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, fontWeight: 700 }} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      {!isDesktop && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          aria-label="Open dashboard menu"
          sx={{
            position: "fixed",
            zIndex: 1300,
            top: 18,
            left: 12,
            bgcolor: "#FFFFFF",
            color: "#0F766E",
            boxShadow: "0 4px 14px rgba(15,23,42,.12)",
            border: "1px solid rgba(15, 118, 110, 0.12)",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            border: 0,
            borderRight: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
            boxShadow: "0 10px 30px -18px rgba(15, 23, 42, 0.28)",
            height: "100vh",
            position: "sticky",
            top: 0,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: "#F8FAFC",
          "& .page-container": {
            minHeight: "calc(100vh - 24px)",
            px: { xs: 2, sm: 3, md: 3.5 },
            py: { xs: 2, md: 3.5 },
            pb: 4,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;