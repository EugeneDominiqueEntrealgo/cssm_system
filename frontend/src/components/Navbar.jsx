import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  Tooltip,
  Chip,
  Fade,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home,
  Dashboard,
  Inventory,
  Receipt,
  LocalOffer,
  People,
  Logout,
  AccountCircle,
  Assessment,
  Storefront,
  ExpandMore,
  Sparkles,
} from "@mui/icons-material";
import { colors } from "../theme";

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isStaff, isClient } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboardRoute = /^(\/admin|\/staff|\/client)\//.test(location.pathname);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuEl, setMobileMenuEl] = useState(null);

  const handleLogout = () => {
    setAnchorEl(null);
    setMobileMenuEl(null);
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/admin/dashboard";
    if (isStaff) return "/staff/dashboard";
    if (isClient) return "/client/dashboard";
    return "/";
  };

  const getNavItems = () => {
    if (isAdmin) {
      return [
        {
          label: "Dashboard",
          icon: <Dashboard fontSize="small" />,
          link: "/admin/dashboard",
        },
        {
          label: "Accounts",
          icon: <People fontSize="small" />,
          link: "/admin/accounts",
        },
        {
          label: "Staff Approvals",
          icon: <People fontSize="small" />,
          link: "/admin/approvals/staff",
        },
        {
          label: "Client Approvals",
          icon: <People fontSize="small" />,
          link: "/admin/approvals/clients",
        },
        {
          label: "Submissions",
          icon: <Inventory fontSize="small" />,
          link: "/admin/approvals/submissions",
        },
        {
          label: "Reports",
          icon: <Assessment fontSize="small" />,
          link: "/admin/reports",
        },
      ];
    }
    if (isStaff) {
      return [
        {
          label: "Dashboard",
          icon: <Dashboard fontSize="small" />,
          link: "/staff/dashboard",
        },
        {
          label: "Products",
          icon: <Inventory fontSize="small" />,
          link: "/staff/products",
        },
        {
          label: "Receipts",
          icon: <Receipt fontSize="small" />,
          link: "/staff/receipts",
        },
        {
          label: "Promos",
          icon: <LocalOffer fontSize="small" />,
          link: "/staff/promos",
        },
        {
          label: "Users",
          icon: <People fontSize="small" />,
          link: "/staff/users",
        },
        {
          label: "Submissions",
          icon: <Inventory fontSize="small" />,
          link: "/staff/submissions",
        },
      ];
    }
    if (isClient) {
      return [
        {
          label: "Dashboard",
          icon: <Dashboard fontSize="small" />,
          link: "/client/dashboard",
        },
        {
          label: "Order History",
          icon: <Receipt fontSize="small" />,
          link: "/client/history",
        },
        {
          label: "Profile",
          icon: <AccountCircle fontSize="small" />,
          link: "/client/profile",
        },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  const isActive = (link) => {
    if (link === "/") return location.pathname === "/";
    return location.pathname.startsWith(link);
  };

  const roleBadge = {
    admin: { label: "Admin", color: "#FF5252", bg: "rgba(255, 82, 82, 0.12)" },
    staff: { label: "Staff", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)" },
    client: {
      label: "Client",
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.12)",
    },
  };

  const getRoleBadge = () => {
    const role = user?.role?.toLowerCase();
    if (!role) return null;
    return (
      roleBadge[role] || {
        label: role,
        color: "#5EEAD4",
        bg: "rgba(94, 234, 212, 0.12)",
      }
    );
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${colors.dark || "#0F172A"} 0%, ${colors.primaryDark || "#1E293B"} 100%)`,
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
        color: "#fff",
      }}
    >
      <Toolbar sx={{ py: 1, gap: 1.5, minHeight: { xs: 64, md: 70 } }}>
        {/* Brand Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mr: { xs: 0, md: 3 },
            cursor: "pointer",
            userSelect: "none",
            visibility: isDashboardRoute ? "hidden" : "visible",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-1px)",
              "& .logo-icon": {
                transform: "rotate(-8deg) scale(1.1)",
                boxShadow: "0 0 20px rgba(94, 234, 212, 0.4)",
              },
            },
          }}
          onClick={() => navigate("/")}
        >
          <Box
            className="logo-icon"
            sx={{
              background:
                "linear-gradient(135deg, rgba(94,234,212,0.2) 0%, rgba(45,212,191,0.05) 100%)",
              borderRadius: "12px",
              p: 0.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(94, 234, 212, 0.3)",
              transition: "all 0.3s ease",
            }}
          >
            <Storefront sx={{ fontSize: 26, color: "#5EEAD4" }} />
          </Box>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "0.8px",
                background: "linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "1.05rem",
              }}
            >
              StoreHub
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                color: "#94A3B8",
                fontWeight: 500,
                letterSpacing: "0.5px",
                display: "block",
              }}
            >
              Sari-Sari Store System
            </Typography>
          </Box>
        </Box>

        {/* Desktop Navigation Links */}
        <Box
          sx={{
            display: isDashboardRoute ? "none" : { xs: "none", md: "flex" },
            flexGrow: 1,
            gap: 1,
            alignItems: "center",
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.link);
            return (
              <Button
                key={item.link}
                onClick={() => navigate(item.link)}
                startIcon={item.icon}
                disableRipple
                sx={{
                  color: active ? "#5EEAD4" : "#94A3B8",
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.875rem",
                  textTransform: "none",
                  bgcolor: active ? "rgba(94, 234, 212, 0.1)" : "transparent",
                  borderRadius: "10px",
                  px: 2,
                  py: 0.8,
                  border: active
                    ? "1px solid rgba(94, 234, 212, 0.25)"
                    : "1px solid transparent",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: active
                      ? "rgba(94, 234, 212, 0.15)"
                      : "rgba(255, 255, 255, 0.05)",
                    color: active ? "#5EEAD4" : "#F8FAFC",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Right Section (Profile & Actions) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            ml: "auto",
          }}
        >
          {isAuthenticated ? (
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                p: 0.6,
                pr: 1.2,
                borderRadius: "30px",
                cursor: "pointer",
                bgcolor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background:
                      "linear-gradient(135deg, #5EEAD4 0%, #0D9488 100%)",
                    color: "#0F172A",
                    fontWeight: 800,
                    fontSize: 15,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#10B981",
                    border: "2px solid #0F172A",
                  }}
                />
              </Box>

              <Box
                sx={{ display: { xs: "none", sm: "block" }, textAlign: "left" }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#F8FAFC",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    fontSize: "0.85rem",
                  }}
                >
                  {user?.name}
                </Typography>
                {getRoleBadge() && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: getRoleBadge().color,
                      fontWeight: 700,
                      fontSize: "0.625rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {getRoleBadge().label}
                  </Typography>
                )}
              </Box>

              <ExpandMore
                sx={{
                  fontSize: 18,
                  color: "#94A3B8",
                  transition: "transform 0.2s ease",
                  transform: Boolean(anchorEl)
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </Box>
          ) : (
            <Button
              variant="contained"
              disableElevation
              onClick={() => navigate("/login")}
              sx={{
                background: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)",
                color: "#FFFFFF",
                fontWeight: 700,
                borderRadius: "10px",
                px: 2.5,
                py: 0.8,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(13, 148, 136, 0.3)",
                transition: "all 0.2s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #0F766E 0%, #115E59 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(13, 148, 136, 0.4)",
                },
              }}
            >
              Login
            </Button>
          )}

          {/* Mobile Hamburger Button */}
          <IconButton
            edge="end"
            onClick={(e) => setMobileMenuEl(e.currentTarget)}
            sx={{
              display: isDashboardRoute ? "none" : { md: "none" },
              color: "#F8FAFC",
              bgcolor: "rgba(255, 255, 255, 0.05)",
              p: 1,
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          {/* Desktop Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            TransitionComponent={Fade}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1.5,
                minWidth: 230,
                borderRadius: "16px",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                overflow: "hidden",
                p: 0.5,
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: "#F8FAFC",
                borderRadius: "12px",
                mb: 0.5,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                {user?.name}
              </Typography>
              <Typography
                variant="caption"
                color="#64748B"
                display="block"
                sx={{ wordBreak: "break-all" }}
              >
                {user?.email}
              </Typography>
            </Box>

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate(getDashboardLink());
              }}
              sx={{
                borderRadius: "8px",
                py: 1,
                my: 0.2,
                fontWeight: 500,
                fontSize: "0.875rem",
                color: "#334155",
                "&:hover": { bgcolor: "#F1F5F9", color: "#0D9488" },
              }}
            >
              <ListItemIcon>
                <Dashboard fontSize="small" sx={{ color: "#0D9488" }} />
              </ListItemIcon>
              Dashboard
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              onClick={handleLogout}
              sx={{
                borderRadius: "8px",
                py: 1,
                my: 0.2,
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#EF4444",
                "&:hover": { bgcolor: "#FEF2F2" },
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: "#EF4444" }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

          {/* Mobile Navigation Drawer Menu */}
          <Menu
            anchorEl={mobileMenuEl}
            open={Boolean(mobileMenuEl)}
            onClose={() => setMobileMenuEl(null)}
            TransitionComponent={Fade}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1.5,
                minWidth: 250,
                borderRadius: "16px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                p: 1,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setMobileMenuEl(null);
                navigate("/");
              }}
              sx={{
                borderRadius: "8px",
                py: 1,
                fontWeight: 500,
                color: "#334155",
                "&:hover": { bgcolor: "#F1F5F9" },
              }}
            >
              <ListItemIcon>
                <Home fontSize="small" sx={{ color: "#64748B" }} />
              </ListItemIcon>
              Home
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            {navItems.map((item) => {
              const active = isActive(item.link);
              return (
                <MenuItem
                  key={item.link}
                  onClick={() => {
                    setMobileMenuEl(null);
                    navigate(item.link);
                  }}
                  sx={{
                    borderRadius: "8px",
                    py: 1,
                    my: 0.2,
                    bgcolor: active
                      ? "rgba(13, 148, 136, 0.08)"
                      : "transparent",
                    color: active ? "#0D9488" : "#334155",
                    fontWeight: active ? 700 : 500,
                    "&:hover": { bgcolor: "#F1F5F9" },
                  }}
                >
                  <ListItemIcon>
                    {React.cloneElement(item.icon, {
                      fontSize: "small",
                      sx: { color: active ? "#0D9488" : "#64748B" },
                    })}
                  </ListItemIcon>
                  {item.label}
                </MenuItem>
              );
            })}

            {isAuthenticated && (
              <>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    borderRadius: "8px",
                    py: 1,
                    color: "#EF4444",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#FEF2F2" },
                  }}
                >
                  <ListItemIcon>
                    <Logout fontSize="small" sx={{ color: "#EF4444" }} />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
