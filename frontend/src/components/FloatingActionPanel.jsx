import React, { useState } from "react";
import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Badge,
} from "@mui/material";
import {
  AddShoppingCartRounded,
  FavoriteBorderRounded,
  ShareRounded,
  TuneRounded,
  HomeRounded,
} from "@mui/icons-material";

/**
 * Floating Action Panel with Quick Access Menu
 */
const FloatingActionPanel = ({
  favoriteCount = 0,
  cartCount = 0,
  onQuickOrder,
  onViewFavorites,
  onShare,
  onToggleFilters,
}) => {
  const [open, setOpen] = useState(false);

  // Configuration object for SpeedDial actions
  const actions = [
    {
      icon: (
        <Badge badgeContent={cartCount} color="error" max={99}>
          <AddShoppingCartRounded />
        </Badge>
      ),
      name: `Cart (${cartCount})`,
      action: onQuickOrder,
    },
    {
      icon: (
        <Badge badgeContent={favoriteCount} color="error" max={99}>
          <FavoriteBorderRounded />
        </Badge>
      ),
      name: `Favorites (${favoriteCount})`,
      action: onViewFavorites,
    },
    {
      icon: <ShareRounded />,
      name: "Share",
      action: onShare,
    },
    {
      icon: <TuneRounded />,
      name: "Filters",
      action: onToggleFilters,
    },
    {
      icon: <HomeRounded />,
      name: "Top of Page",
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 24, sm: 32 },
        right: { xs: 16, sm: 32 },
        zIndex: 1100,
      }}
    >
      <SpeedDial
        ariaLabel="Quick navigation and action panel"
        icon={<SpeedDialIcon />}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        open={open}
        direction="up"
        sx={{
          "& .MuiFab-primary": {
            bgcolor: "#0D9488",
            color: "#FFFFFF",
            boxShadow: "0px 8px 24px rgba(13, 148, 136, 0.4)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "&:hover": {
              bgcolor: "#0F766E",
              boxShadow: "0px 10px 28px rgba(13, 148, 136, 0.55)",
              transform: "scale(1.05)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          },
          "& .MuiSpeedDialAction-fab": {
            bgcolor: "#1E293B",
            color: "#5EEAD4",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: "#0F172A",
              color: "#FFFFFF",
              borderColor: "#5EEAD4",
              transform: "scale(1.1)",
            },
          },
          "& .MuiSpeedDialAction-staticTooltipLabel": {
            bgcolor: "#1E293B",
            color: "#F8FAFC",
            fontSize: "0.75rem",
            fontWeight: 600,
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
            whiteSpace: "nowrap",
          },
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.name.startsWith('Cart') ? (
              <Box
                key={cartCount}
                sx={{
                  display: 'flex',
                  animation: cartCount > 0 ? 'cartPulse 0.45s ease-out' : 'none',
                  '@keyframes cartPulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.22)' },
                    '100%': { transform: 'scale(1)' },
                  },
                }}
              >
                {action.icon}
              </Box>
            ) : action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => {
              setOpen(false);
              action.action?.();
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default FloatingActionPanel;
