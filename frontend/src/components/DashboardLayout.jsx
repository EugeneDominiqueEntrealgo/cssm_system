import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

import {
  AssessmentRounded,
  AccountCircleRounded,
  DashboardRounded,
  Inventory2Rounded,
  LocalOfferRounded,
  LogoutRounded,
  MenuRounded as MenuIcon,
  PeopleAltRounded,
  ReceiptLongRounded,
  ShoppingCartRounded,
  StorefrontRounded,
  CloseRounded,
} from "@mui/icons-material";

import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

const drawerWidth = 272;
const collapsedWidth = 82;
const mobileDrawerWidth = 292;

const navigation = {
  admin: [
    ["Dashboard", "/admin/dashboard", DashboardRounded],
    ["Accounts", "/admin/accounts", PeopleAltRounded],
    ["Staff Approvals", "/admin/approvals/staff", PeopleAltRounded],
    ["Client Approvals", "/admin/approvals/clients", PeopleAltRounded],
    ["Submissions", "/admin/approvals/submissions", Inventory2Rounded],
    ["Reports", "/admin/reports", AssessmentRounded],
    ["Product Monitor", "/admin/product-monitor", Inventory2Rounded],
  ],

  staff: [
    ["Dashboard", "/staff/dashboard", DashboardRounded],
    ["Products", "/staff/products", Inventory2Rounded],
    ["Order Management", "/staff/order-management", ShoppingCartRounded],
    ["Receipts", "/staff/receipts", ReceiptLongRounded],
    ["Promos", "/staff/promos", LocalOfferRounded],
    ["Users", "/staff/users", PeopleAltRounded],
    ["Submissions", "/staff/submissions", Inventory2Rounded],
  ],

  client: [
    ["Dashboard", "/client/dashboard", DashboardRounded],
    ["Walk-in Order", "/client/checkout", ShoppingCartRounded],
    ["Order History", "/client/history", ReceiptLongRounded],
    ["Favorites", "/client/favorites", StorefrontRounded],
    ["Profile", "/client/profile", AccountCircleRounded],
  ],
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const role = String(user?.role || "client").toLowerCase();
  const items = navigation[role] || navigation.client;

  const activeDrawerWidth = isDesktop
    ? collapsed
      ? collapsedWidth
      : drawerWidth
    : mobileDrawerWidth;

  const handleNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/");
  };

  const getInitials = () => {
    const name = String(user?.name || "").trim();

    if (!name) {
      return "U";
    }

    const parts = name.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = () => {
    if (role === "admin") return "Administrator";
    if (role === "staff") return "Staff account";
    return "Client account";
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#063F35",
        color: "#F2FFFA",
        borderRadius: { xs: 0, md: "22px" },
        backgroundImage:
          "radial-gradient(circle at 92% 8%, rgba(61, 211, 162, .22) 0 14%, transparent 15%), radial-gradient(circle at 8% 62%, rgba(15, 118, 110, .38) 0 17%, transparent 18%), linear-gradient(150deg, #075844 0%, #063F35 52%, #022E29 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)",
      }}
    >
      {/* =========================================================
          BRAND / SIDEBAR HEADER
      ========================================================= */}
      <Box
        sx={{
          position: "relative",
          px: collapsed && isDesktop ? 1.2 : 2,
          pt: 2,
          pb: 1.6,
          transition: "padding .24s ease",
        }}
      >
        <Box
          sx={{
            minHeight: 68,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            px: collapsed && isDesktop ? 0.8 : 1.1,
            py: 1,
            borderRadius: "16px",
            bgcolor: "rgba(1, 45, 38, .28)",
            border: "1px solid rgba(137, 255, 214, .15)",
            transition: "all .22s ease",
          }}
        >
          <Tooltip
            title={isDesktop ? (collapsed ? "Expand sidebar" : "Collapse sidebar") : "StoreHub"}
            placement="right"
            arrow
          >
            <IconButton
              onClick={() => isDesktop && setCollapsed((previous) => !previous)}
              aria-label={isDesktop ? (collapsed ? "Expand sidebar" : "Collapse sidebar") : "StoreHub"}
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: "13px",
                background:
                  "linear-gradient(145deg, #0D6B55 0%, #0A4A40 100%)",
                color: "#FFE27A",
                boxShadow: "0 9px 20px rgba(0,0,0,.18)",
                cursor: isDesktop ? "pointer" : "default",
                transition: "transform .2s ease, background-color .2s ease",
                "&:hover": {
                  background: "linear-gradient(145deg, #16866B 0%, #0D5B4D 100%)",
                  color: "#FFF1A8",
                  transform: isDesktop ? "scale(1.06)" : "none",
                },
              }}
            >
              <StorefrontRounded sx={{ fontSize: 23 }} />
            </IconButton>
          </Tooltip>

          {!(collapsed && isDesktop) && (
            <Box
              sx={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  color: "#F4FFFB",
                  fontSize: "1rem",
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: "-.03em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                StoreHub
              </Typography>

              <Typography
                sx={{
                  mt: 0.32,
                  color: "#9ED0BF",
                  fontSize: "0.59rem",
                  fontWeight: 650,
                  letterSpacing: ".025em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Store management workspace
              </Typography>
            </Box>
          )}

        </Box>

        {!isDesktop && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            aria-label="Close dashboard menu"
            sx={{
              position: "absolute",
              top: 27,
              right: 27,
              width: 34,
              height: 34,
              borderRadius: "10px",
              color: "#C6E8DB",
              bgcolor: "rgba(0,0,0,.18)",
              border: "1px solid rgba(166, 231, 211, .2)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,.12)",
                color: "#FFFFFF",
              },
            }}
          >
            <CloseRounded sx={{ fontSize: 19 }} />
          </IconButton>
        )}
      </Box>

      {/* =========================================================
          WORKSPACE NAVIGATION
      ========================================================= */}
      <Box
        sx={{
          px: collapsed && isDesktop ? 1.15 : 1.55,
          pt: 0.9,
          minHeight: 0,
          overflowY: "auto",
          flexShrink: 1,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            bgcolor: "rgba(170, 236, 215, .25)",
          },
        }}
      >
        {!(collapsed && isDesktop) && (
          <Typography
            sx={{
              px: 1.1,
              mb: 0.8,
              color: "#8BC5B2",
              fontSize: "0.56rem",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: ".13em",
            }}
          >
            Workspace
          </Typography>
        )}

        <List sx={{ p: 0 }}>
          {items.map(([label, path, Icon]) => {
            const active = location.pathname.startsWith(path);

            const button = (
              <ListItemButton
                key={path}
                selected={active}
                onClick={() => handleNavigate(path)}
                sx={{
                  position: "relative",
                  minHeight: 46,
                  mb: 0.45,
                  px: collapsed && isDesktop ? 0.7 : 0.8,
                  py: 0.55,
                  justifyContent:
                    collapsed && isDesktop ? "center" : "flex-start",
                  borderRadius: "13px",
                  color: active ? "#FFFFFF" : "#B5D8CB",
                  overflow: "hidden",
                  transition:
                    "background-color .18s ease, color .18s ease, transform .18s ease",

                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: 10,
                    bottom: 10,
                    width: 3,
                    borderRadius: "0 6px 6px 0",
                    bgcolor: "#0F766E",
                    opacity: active ? 1 : 0,
                    transform: active ? "scaleY(1)" : "scaleY(.45)",
                    transition: "all .2s ease",
                  },

                  "&.Mui-selected": {
                    bgcolor: "linear-gradient(100deg, #1ECBA0 0%, #19B68F 100%)",
                    color: "#FFFFFF",
                    boxShadow: "0 10px 22px rgba(0,0,0,.16)",
                  },

                  "&.Mui-selected:hover": {
                    bgcolor: "#1AB58E",
                  },

                  "&:hover": {
                    bgcolor: active ? "#1AB58E" : "rgba(255,255,255,.08)",
                    color: "#FFFFFF",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed && isDesktop ? 0 : 42,
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "10px",
                      bgcolor: active ? "rgba(255,255,255,.23)" : "rgba(255,255,255,.08)",
                      transition: "all .18s ease",
                    }}
                  >
                    <Icon sx={{ fontSize: 19 }} />
                  </Box>
                </ListItemIcon>

                {!(collapsed && isDesktop) && (
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: "0.78rem",
                      fontWeight: active ? 850 : 700,
                      letterSpacing: "-.005em",
                    }}
                    sx={{ ml: 0.25 }}
                  />
                )}
              </ListItemButton>
            );

            if (collapsed && isDesktop) {
              return (
                <Tooltip
                  key={path}
                  title={label}
                  placement="right"
                  arrow
                >
                  {button}
                </Tooltip>
              );
            }

            return button;
          })}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* =========================================================
          USER / ACCOUNT AREA
      ========================================================= */}
      <Box
        sx={{
          px: collapsed && isDesktop ? 1.15 : 1.55,
          pb: 1.5,
          flexShrink: 0,
          bgcolor: "#063F35",
        }}
      >
        <Divider
          sx={{
            mb: 1.35,
            borderColor: "rgba(162, 225, 207, .18)",
          }}
        />

        {collapsed && isDesktop ? (
          <Tooltip
            title={`${user?.name || "StoreHub User"} · ${getRoleLabel()}`}
            placement="right"
            arrow
          >
            <Box
              sx={{
                mb: 0.8,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "#0B6755",
                  color: "#FFE27A",
                  fontSize: "0.67rem",
                  fontWeight: 900,
                }}
              >
                {getInitials()}
              </Avatar>
            </Box>
          </Tooltip>
        ) : (
          <Box
            sx={{
              mb: 1,
              p: 1.15,
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: "13px",
              bgcolor: "rgba(0, 30, 25, .25)",
              border: "1px solid rgba(154, 225, 205, .16)",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "#0B6755",
                  color: "#FFE27A",
                  fontSize: "0.67rem",
                  fontWeight: 900,
                }}
              >
                {getInitials()}
              </Avatar>

              <Box
                sx={{
                  position: "absolute",
                  right: -1,
                  bottom: 0,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  bgcolor: "#22C55E",
                  border: "2px solid #0A4A40",
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                noWrap
                sx={{
                  color: "#F2FFFA",
                  fontSize: "0.72rem",
                  fontWeight: 850,
                }}
              >
                {user?.name || "StoreHub User"}
              </Typography>

              <Typography
                noWrap
                sx={{
                  mt: 0.12,
                  color: "#9ED0BF",
                  fontSize: "0.58rem",
                  fontWeight: 650,
                }}
              >
                {getRoleLabel()}
              </Typography>
            </Box>
          </Box>
        )}

        {collapsed && isDesktop ? (
          <Tooltip title="Logout" placement="right" arrow>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 44,
                px: 0.7,
                justifyContent: "center",
                borderRadius: "12px",
                color: "#FF9D93",
                "&:hover": {
                  bgcolor: "rgba(255, 118, 105, .16)",
                  color: "#FFC0B8",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  color: "inherit",
                  justifyContent: "center",
                }}
              >
                <LogoutRounded sx={{ fontSize: 19 }} />
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>
        ) : (
          <ListItemButton
            onClick={handleLogout}
            aria-label="Sign out"
            sx={{
              minHeight: 44,
              px: 0.9,
              borderRadius: "12px",
              color: "#FF9D93",
              border: "1px solid rgba(255, 157, 147, .3)",
              bgcolor: "rgba(255, 118, 105, .08)",
              "&:hover": {
                bgcolor: "rgba(255, 118, 105, .16)",
                color: "#FFC0B8",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 41,
                color: "inherit",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "9px",
                  bgcolor: "rgba(255, 118, 105, .14)",
                }}
              >
                <LogoutRounded sx={{ fontSize: 18 }} />
              </Box>
            </ListItemIcon>

            <ListItemText
              primary="Sign out"
              primaryTypographyProps={{
                fontSize: "0.76rem",
                fontWeight: 800,
              }}
            />
          </ListItemButton>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#F5F8F7",
      }}
    >
      {/* =========================================================
          MOBILE MENU TRIGGER
      ========================================================= */}
      {!isDesktop && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          aria-label="Open dashboard menu"
          sx={{
            position: "fixed",
            zIndex: 1400,
            top: 14,
            left: 14,
            width: 42,
            height: 42,
            borderRadius: "12px",
            bgcolor: "#FFFFFF",
            color: "#174E44",
            border: "1px solid #DFE8E5",
            boxShadow: "0 9px 24px rgba(28,55,48,.12)",
            "&:hover": {
              bgcolor: "#F1F7F4",
              color: "#0F766E",
            },
          }}
        >
          <MenuIcon sx={{ fontSize: 21 }} />
        </IconButton>
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            overflow: "visible",
          },
        }}
        sx={{
          flexShrink: 0,
          px: { md: 1.8, lg: 2.2 },
          py: { md: 1.8, lg: 2.2 },

          "& .MuiDrawer-paper": {
            width: activeDrawerWidth,
            maxWidth: "88vw",
            height: { xs: "100vh", md: "calc(100vh - 36px)", lg: "calc(100vh - 44px)" },
            boxSizing: "border-box",
            overflow: "visible",
            border: 0,
            borderRadius: { xs: 0, md: "22px" },
            bgcolor: "#063F35",
            position: isDesktop ? "sticky" : "fixed",
            top: { xs: 0, md: 18 },
            left: { xs: 0, md: 18 },
            boxShadow: isDesktop
              ? "0 18px 38px rgba(4, 45, 37, .25)"
              : "12px 0 44px rgba(20,45,38,.16)",
            transition:
              "width .24s cubic-bezier(.4,0,.2,1), box-shadow .2s ease",
          },
        }}
      >
        {drawerContent}

      </Drawer>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: {
            xs: "100%",
            md: `calc(100% - ${activeDrawerWidth + 36}px)`,
          },
          bgcolor: "#F4F8F6",
          transition: "width .24s cubic-bezier(.4,0,.2,1)",

          "& .page-container": {
            width: "100%",
            minHeight: "100vh",
            px: {
              xs: 1.4,
              sm: 2.25,
              md: 2.8,
              lg: 3.25,
            },
            pt: {
              xs: 7.5,
              md: 3.5,
            },
            pb: {
              xs: 2.5,
              md: 3.5,
            },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
