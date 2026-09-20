import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Fab,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  AccessTimeRounded,
  ArrowForwardRounded,
  CheckCircleRounded,
  EmailRounded,
  FilterAltOffRounded,
  Inventory2Outlined,
  KeyboardArrowUpRounded,
  LocalOfferRounded,
  LocationOnRounded,
  LoginRounded,
  PhoneRounded,
  RefreshRounded,
  SearchRounded,
  SellOutlined,
  ShoppingBagOutlined,
  ShoppingCartRounded,
  StorefrontRounded,
  SupportAgentRounded,
  TrendingUpRounded,
  VerifiedRounded,
} from "@mui/icons-material";

import API from "../../api/axios";
import Navbar from "../../components/Navbar";

const STORE = {
  name: "StoreHub",
  tagline: "Local convenience, made simpler.",
  address: "Garcia, Batuan, Bohol",
  phone: "+63 912 345 6789",
  email: "contact@storehub.ph",
  openingHour: 7,
  closingHour: 21,
};

const Homepage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    products: [],
    promos: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("featured");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const fetchHomepageData = async () => {
    setLoading(true);
    setError("");

    try {
      // Existing API kept exactly as-is.
      const response = await API.get("/public/homepage");

      setData({
        products: response.data?.products || [],
        promos: response.data?.promos || [],
      });
    } catch (err) {
      console.error("Failed to fetch homepage data:", err);
      setError(
        "We could not load the latest store data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 520);
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const formatPrice = (price) =>
    `₱${Number(price || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

  const getStockStatus = (stockValue) => {
    const stock = Number(stockValue || 0);

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        color: "#B91C1C",
        bg: "#FEF2F2",
        border: "#FECACA",
      };
    }

    if (stock <= 10) {
      return {
        label: `Only ${stock} left`,
        color: "#B45309",
        bg: "#FFFBEB",
        border: "#FDE68A",
      };
    }

    return {
      label: "In Stock",
      color: "#047857",
      bg: "#ECFDF5",
      border: "#A7F3D0",
    };
  };

  const categories = useMemo(() => {
    const values = data.products
      .map((product) => product.category)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [data.products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = data.products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sortOrder === "price-low") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortOrder === "price-high") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (sortOrder === "name") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortOrder === "stock") {
        return Number(b.stock || 0) - Number(a.stock || 0);
      }

      return 0;
    });
  }, [data.products, search, activeCategory, sortOrder]);

  const featuredProducts = useMemo(
    () =>
      [...data.products]
        .filter((product) => Number(product.stock || 0) > 0)
        .sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))
        .slice(0, 4),
    [data.products]
  );

  const availableProducts = useMemo(
    () =>
      data.products.filter((product) => Number(product.stock || 0) > 0).length,
    [data.products]
  );

  const activePromos = useMemo(() => {
    const today = new Date();

    return data.promos.filter((promo) => {
      if (!promo.end_date) return true;
      const endDate = new Date(promo.end_date);
      endDate.setHours(23, 59, 59, 999);
      return endDate >= today;
    });
  }, [data.promos]);

  const isOpen =
    now.getHours() >= STORE.openingHour &&
    now.getHours() < STORE.closingHour;

  const storeStatusText = isOpen
    ? "Open now · closes at 9:00 PM"
    : now.getHours() < STORE.openingHour
    ? "Closed · opens at 7:00 AM"
    : "Closed · opens tomorrow at 7:00 AM";

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#F7FAF9",
          pt: { xs: 9, sm: 10 },
        }}
      >
        <Navbar homepage />
        <Box
          sx={{
            py: { xs: 7, md: 10 },
            background:
              "linear-gradient(135deg, #062E2A 0%, #0C4F47 55%, #0E6D60 100%)",
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Skeleton
                  variant="rounded"
                  width={180}
                  height={28}
                  sx={{ bgcolor: "rgba(255,255,255,.12)", mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="92%"
                  height={78}
                  sx={{ bgcolor: "rgba(255,255,255,.12)" }}
                />
                <Skeleton
                  variant="text"
                  width="68%"
                  height={42}
                  sx={{ bgcolor: "rgba(255,255,255,.10)" }}
                />
                <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                  <Skeleton
                    variant="rounded"
                    width={160}
                    height={48}
                    sx={{ bgcolor: "rgba(255,255,255,.12)" }}
                  />
                  <Skeleton
                    variant="rounded"
                    width={140}
                    height={48}
                    sx={{ bgcolor: "rgba(255,255,255,.10)" }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={5}>
                <Skeleton
                  variant="rounded"
                  height={320}
                  sx={{
                    bgcolor: "rgba(255,255,255,.10)",
                    borderRadius: "28px",
                  }}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton
                  variant="rounded"
                  height={340}
                  sx={{ borderRadius: "20px" }}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F7FAF9",
        color: "#10201D",
        overflowX: "hidden",
        pt: { xs: 9, sm: 10 },
      }}
    >
      <Navbar homepage />

      {/* =========================================================
          ANNOUNCEMENT BAR
          No route dependency.
      ========================================================= */}
      <Box
        sx={{
          bgcolor: "#073D37",
          color: "white",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={{ xs: 0.4, sm: 2 }}
            sx={{ py: 1.05 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeRounded sx={{ fontSize: 16, color: "#99F6E4" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
                {storeStatusText}
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "rgba(255,255,255,.66)",
              }}
            >
              Everyday essentials · Updated availability · Local service
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* =========================================================
          ERROR BANNER
      ========================================================= */}
      {error && (
        <Container maxWidth="lg" sx={{ pt: 2 }}>
          <Alert
            severity="warning"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshRounded />}
                onClick={fetchHomepageData}
              >
                Retry
              </Button>
            }
            sx={{ borderRadius: "14px" }}
          >
            {error}
          </Alert>
        </Container>
      )}

      {/* =========================================================
          HERO
      ========================================================= */}
      <Box
        id="home-section"
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #062E2A 0%, #0B4B43 55%, #0E6D60 100%)",
          color: "white",
          py: { xs: 7, sm: 8, md: 10 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            bgcolor: "rgba(153,246,228,.06)",
            top: -210,
            right: -110,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,.04)",
            bottom: -140,
            left: -100,
          }}
        />

        <Container maxWidth="lg">
          <Grid
            container
            spacing={{ xs: 5, md: 7 }}
            alignItems="center"
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Grid item xs={12} md={7}>
              <Chip
                icon={
                  <StorefrontRounded
                    sx={{ fontSize: "16px !important", color: "#5EEAD4" }}
                  />
                }
                label="Your neighborhood convenience store"
                sx={{
                  mb: 2.2,
                  color: "rgba(255,255,255,.86)",
                  bgcolor: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.10)",
                  "& .MuiChip-label": {
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  },
                }}
              />

              <Typography
                component="h1"
                sx={{
                  maxWidth: 760,
                  fontSize: {
                    xs: "2.15rem",
                    sm: "3rem",
                    md: "4rem",
                  },
                  fontWeight: 900,
                  lineHeight: 1.04,
                  letterSpacing: "-0.055em",
                }}
              >
                Everyday essentials,
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    mt: 0.4,
                    color: "#99F6E4",
                  }}
                >
                  always within reach.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 2.2,
                  maxWidth: 620,
                  color: "rgba(255,255,255,.68)",
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  lineHeight: 1.75,
                }}
              >
                Check product availability, browse current promotions, and
                discover everyday essentials from your local StoreHub in one
                simple place.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.4}
                sx={{ mt: 3.4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingBagOutlined />}
                  onClick={() => scrollTo("products-section")}
                  sx={{
                    minHeight: 50,
                    px: 3,
                    borderRadius: "14px",
                    bgcolor: "#5EEAD4",
                    color: "#082F2A",
                    textTransform: "none",
                    fontWeight: 800,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#99F6E4",
                      boxShadow: "none",
                    },
                  }}
                >
                  Browse Products
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  endIcon={<ArrowForwardRounded />}
                  onClick={() => scrollTo("promos-section")}
                  sx={{
                    minHeight: 50,
                    px: 3,
                    borderRadius: "14px",
                    borderColor: "rgba(255,255,255,.22)",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": {
                      borderColor: "rgba(255,255,255,.55)",
                      bgcolor: "rgba(255,255,255,.05)",
                    },
                  }}
                >
                  View Promotions
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={{ xs: 1.5, sm: 3 }}
                sx={{
                  mt: 3.3,
                  flexWrap: "wrap",
                  rowGap: 1.2,
                }}
              >
                {[
                  [<VerifiedRounded />, "Reliable products"],
                  [<TrendingUpRounded />, "Updated stock"],
                  [<SupportAgentRounded />, "Local support"],
                ].map(([icon, label]) => (
                  <Stack
                    key={label}
                    direction="row"
                    spacing={0.7}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        display: "flex",
                        color: "#5EEAD4",
                        "& svg": { fontSize: 16 },
                      }}
                    >
                      {icon}
                    </Box>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,.58)",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.4, sm: 1.8 },
                  borderRadius: "28px",
                  bgcolor: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.10)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2.2, sm: 2.6 },
                    borderRadius: "22px",
                    bgcolor: "#FFFFFF",
                    color: "#10201D",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <Stack direction="row" spacing={1.3} alignItems="center">
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "15px",
                          bgcolor: "#ECFDF5",
                          border: "1px solid #D1FAE5",
                        }}
                      >
                        <StorefrontRounded
                          sx={{ color: "#0F766E", fontSize: 24 }}
                        />
                      </Box>

                      <Box>
                        <Typography
                          sx={{ fontSize: "1rem", fontWeight: 900 }}
                        >
                          {STORE.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#94A3B8",
                            fontSize: "0.68rem",
                          }}
                        >
                          Garcia, Batuan, Bohol
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      size="small"
                      icon={
                        <CheckCircleRounded
                          sx={{
                            fontSize: "14px !important",
                            color: isOpen
                              ? "#047857 !important"
                              : "#B91C1C !important",
                          }}
                        />
                      }
                      label={isOpen ? "OPEN" : "CLOSED"}
                      sx={{
                        height: 26,
                        bgcolor: isOpen ? "#ECFDF5" : "#FEF2F2",
                        color: isOpen ? "#047857" : "#B91C1C",
                        fontWeight: 900,
                        fontSize: "0.62rem",
                      }}
                    />
                  </Stack>

                  <Divider sx={{ my: 2.2, borderColor: "#EEF2F6" }} />

                  <Typography
                    sx={{
                      color: "#64748B",
                      fontSize: "0.78rem",
                      lineHeight: 1.65,
                    }}
                  >
                    A quick look at what is currently available in the store.
                  </Typography>

                  <Grid container spacing={1.3} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.6,
                          bgcolor: "#F0FDFA",
                          border: "1px solid #CCFBF1",
                          borderRadius: "15px",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.6rem",
                            color: "#0F766E",
                            fontWeight: 800,
                            letterSpacing: ".06em",
                          }}
                        >
                          AVAILABLE
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: "1.45rem",
                            fontWeight: 900,
                          }}
                        >
                          {availableProducts}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.6,
                          bgcolor: "#FFF7ED",
                          border: "1px solid #FFEDD5",
                          borderRadius: "15px",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.6rem",
                            color: "#C2410C",
                            fontWeight: 800,
                            letterSpacing: ".06em",
                          }}
                        >
                          ACTIVE PROMOS
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: "1.45rem",
                            fontWeight: 900,
                          }}
                        >
                          {activePromos.length}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    sx={{
                      mt: 1.5,
                      p: 1.5,
                      borderRadius: "14px",
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <LocationOnRounded
                      sx={{ mt: 0.1, fontSize: 18, color: "#0F766E" }}
                    />
                    <Box>
                      <Typography
                        sx={{ fontSize: "0.72rem", fontWeight: 800 }}
                      >
                        Visit the store
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.2,
                          color: "#64748B",
                          fontSize: "0.68rem",
                          lineHeight: 1.5,
                        }}
                      >
                        Open daily from 7:00 AM to 9:00 PM.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================================================
          TRUST / STAT BAR
      ========================================================= */}
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #E8EFED",
        }}
      >
        <Container maxWidth="lg">
          <Grid container>
            {[
              {
                icon: <Inventory2Outlined />,
                value: data.products.length,
                label: "Products listed",
              },
              {
                icon: <CheckCircleRounded />,
                value: availableProducts,
                label: "Available now",
              },
              {
                icon: <LocalOfferRounded />,
                value: activePromos.length,
                label: "Active promos",
              },
              {
                icon: <AccessTimeRounded />,
                value: "7 Days",
                label: "Open weekly",
              },
            ].map((item, index) => (
              <Grid item xs={6} md={3} key={item.label}>
                <Stack
                  direction="row"
                  spacing={1.3}
                  alignItems="center"
                  sx={{
                    py: { xs: 2.2, md: 2.7 },
                    px: { xs: 0.7, sm: 2 },
                    borderRight:
                      index !== 3
                        ? { md: "1px solid #E8EFED" }
                        : "none",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "13px",
                      bgcolor: "#F0FDFA",
                      color: "#0F766E",
                      "& svg": { fontSize: 20 },
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: "0.95rem", md: "1.1rem" },
                      }}
                    >
                      {item.value}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#82908D",
                        fontSize: "0.65rem",
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}
      {featuredProducts.length > 0 && (
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#F7FAF9" }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "flex-end" }}
              spacing={2}
              sx={{ mb: 3.5 }}
            >
              <Box>
                <Typography
                  sx={{
                    color: "#0F766E",
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                  }}
                >
                  Popular right now
                </Typography>
                <Typography
                  component="h2"
                  sx={{
                    mt: 0.8,
                    fontSize: { xs: "1.7rem", md: "2.2rem" },
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                  }}
                >
                  Featured products
                </Typography>
                <Typography
                  sx={{
                    mt: 0.8,
                    color: "#72807D",
                    fontSize: "0.84rem",
                  }}
                >
                  A quick look at selected products currently available.
                </Typography>
              </Box>

              <Button
                endIcon={<ArrowForwardRounded />}
                onClick={() => scrollTo("products-section")}
                sx={{
                  color: "#0F766E",
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Browse all products
              </Button>
            </Stack>

            <Grid container spacing={2.3}>
              {featuredProducts.map((product) => {
                const stock = getStockStatus(product.stock);

                return (
                  <Grid item xs={12} sm={6} md={3} key={product.id}>
                    <Card
                      sx={{
                        height: "100%",
                        overflow: "hidden",
                        borderRadius: "20px",
                        bgcolor: "#FFFFFF",
                        border: "1px solid #E7EEEC",
                        boxShadow: "0 8px 24px rgba(15,23,42,.035)",
                        transition:
                          "transform .25s ease, box-shadow .25s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow:
                            "0 18px 38px rgba(15,23,42,.08)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          height: 180,
                          bgcolor: "#EEF4F2",
                          overflow: "hidden",
                        }}
                      >
                        {product.image_url ? (
                          <Box
                            component="img"
                            src={product.image_url}
                            alt={product.name}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center 38%",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: "100%",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <ShoppingBagOutlined
                              sx={{ fontSize: 42, color: "#A7B5B2" }}
                            />
                          </Box>
                        )}

                        <Chip
                          label={product.category || "General"}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            bgcolor: "rgba(255,255,255,.94)",
                            fontWeight: 800,
                            fontSize: "0.6rem",
                          }}
                        />
                      </Box>

                      <CardContent sx={{ p: 2.2 }}>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: "0.88rem",
                            lineHeight: 1.35,
                            minHeight: 38,
                          }}
                        >
                          {product.name}
                        </Typography>

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-end"
                          spacing={1}
                          sx={{ mt: 1.8 }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                color: "#94A3B8",
                                fontSize: "0.58rem",
                                fontWeight: 700,
                              }}
                            >
                              PRICE
                            </Typography>
                            <Typography
                              sx={{
                                color: "#047857",
                                fontSize: "1.1rem",
                                fontWeight: 900,
                              }}
                            >
                              {formatPrice(product.price)}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              px: 1,
                              py: 0.55,
                              borderRadius: 999,
                              bgcolor: stock.bg,
                              color: stock.color,
                              border: `1px solid ${stock.border}`,
                              fontSize: "0.58rem",
                              fontWeight: 800,
                            }}
                          >
                            {stock.label}
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Box>
      )}

      {/* =========================================================
          PROMOTIONS
      ========================================================= */}
      <Box
        id="promos-section"
        sx={{
          scrollMarginTop: 90,
          py: { xs: 6, md: 8 },
          bgcolor: "#FFFFFF",
          borderTop: "1px solid #EEF2F1",
          borderBottom: "1px solid #EEF2F1",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 3.7 }}>
            <Chip
              icon={
                <LocalOfferRounded
                  sx={{ fontSize: "15px !important", color: "#C2410C" }}
                />
              }
              label="Current offers"
              sx={{
                bgcolor: "#FFF7ED",
                color: "#C2410C",
                fontWeight: 800,
                fontSize: "0.65rem",
                border: "1px solid #FFEDD5",
              }}
            />

            <Typography
              component="h2"
              sx={{
                mt: 1.2,
                fontSize: { xs: "1.7rem", md: "2.2rem" },
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              Promotions worth checking
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                maxWidth: 560,
                color: "#72807D",
                fontSize: "0.84rem",
                lineHeight: 1.65,
              }}
            >
              See the latest store offers without leaving the homepage.
            </Typography>
          </Box>

          {activePromos.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: "20px",
                border: "1px dashed #CBD5D1",
                bgcolor: "#FBFCFC",
                textAlign: "center",
              }}
            >
              <LocalOfferRounded sx={{ fontSize: 36, color: "#A7B5B2" }} />
              <Typography sx={{ mt: 1, fontWeight: 900 }}>
                No active promotions right now
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  color: "#81908D",
                  fontSize: "0.78rem",
                }}
              >
                Check again later for new store offers.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2.4}>
              {activePromos.slice(0, 3).map((promo) => (
                <Grid item xs={12} md={4} key={promo.id}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: "20px",
                      border: "1px solid #F1E8E1",
                      boxShadow: "0 8px 26px rgba(15,23,42,.035)",
                    }}
                  >
                    <CardContent sx={{ p: 2.6 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "14px",
                            bgcolor: "#FFF7ED",
                            color: "#EA580C",
                          }}
                        >
                          <LocalOfferRounded sx={{ fontSize: 21 }} />
                        </Box>

                        <Chip
                          size="small"
                          label={
                            promo.discount_type === "percentage"
                              ? `${promo.discount_value}% OFF`
                              : promo.discount_type === "fixed"
                              ? `₱${promo.discount_value} OFF`
                              : "SPECIAL DEAL"
                          }
                          sx={{
                            bgcolor: "#F59E0B",
                            color: "#FFFFFF",
                            fontWeight: 900,
                            fontSize: "0.6rem",
                          }}
                        />
                      </Stack>

                      <Typography
                        sx={{
                          mt: 2,
                          fontWeight: 900,
                          fontSize: "1rem",
                          lineHeight: 1.35,
                        }}
                      >
                        {promo.title}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.8,
                          color: "#72807D",
                          fontSize: "0.76rem",
                          lineHeight: 1.65,
                          minHeight: 50,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {promo.description ||
                          "Enjoy this current StoreHub promotion while it is available."}
                      </Typography>

                      <Divider sx={{ my: 2, borderColor: "#F2F4F3" }} />

                      <Typography
                        sx={{
                          color: "#94A3B8",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                        }}
                      >
                        {formatDate(promo.start_date)}
                        {promo.end_date
                          ? ` – ${formatDate(promo.end_date)}`
                          : ""}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* =========================================================
          PRODUCT CATALOG
      ========================================================= */}
      <Box
        id="products-section"
        sx={{
          scrollMarginTop: 90,
          py: { xs: 6, md: 8 },
          bgcolor: "#F7FAF9",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "flex-end" }}
            spacing={2}
            sx={{ mb: 3.2 }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#0F766E",
                  fontSize: "0.68rem",
                  fontWeight: 900,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                }}
              >
                Product catalog
              </Typography>

              <Typography
                component="h2"
                sx={{
                  mt: 0.8,
                  fontSize: { xs: "1.7rem", md: "2.2rem" },
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                Find what you need
              </Typography>

              <Typography
                sx={{
                  mt: 0.7,
                  color: "#72807D",
                  fontSize: "0.84rem",
                }}
              >
                Search products and check their latest available stock.
              </Typography>
            </Box>

            <Typography
              sx={{
                px: 1.3,
                py: 0.7,
                borderRadius: 999,
                bgcolor: "#FFFFFF",
                border: "1px solid #E3EBE8",
                color: "#64748B",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              {filteredProducts.length} result
              {filteredProducts.length !== 1 ? "s" : ""}
            </Typography>
          </Stack>

          {/* Search + sort */}
          <Paper
            elevation={0}
            sx={{
              mb: 2.4,
              p: { xs: 1.5, sm: 1.8 },
              borderRadius: "18px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E4ECE9",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.3}
            >
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product name, category, or description..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: "#82908D" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "13px",
                    bgcolor: "#FAFCFB",
                  },
                }}
              />

              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: "100%", md: 190 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "13px",
                    bgcolor: "#FAFCFB",
                  },
                }}
              >
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <MenuItem value="featured">Featured</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="name">Name: A–Z</MenuItem>
                  <MenuItem value="stock">Most Stock</MenuItem>
                </Select>
              </FormControl>

              {(search || activeCategory !== "All") && (
                <Button
                  startIcon={<FilterAltOffRounded />}
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                  }}
                  sx={{
                    whiteSpace: "nowrap",
                    borderRadius: "13px",
                    color: "#64748B",
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 1.5,
                pb: 0.2,
                overflowX: "auto",
                "&::-webkit-scrollbar": { height: 4 },
              }}
            >
              {categories.map((category) => {
                const selected = activeCategory === category;

                return (
                  <Chip
                    key={category}
                    label={category}
                    clickable
                    onClick={() => setActiveCategory(category)}
                    sx={{
                      flexShrink: 0,
                      bgcolor: selected ? "#0F766E" : "#F6F9F8",
                      color: selected ? "#FFFFFF" : "#52615E",
                      border: selected
                        ? "1px solid #0F766E"
                        : "1px solid #E3EBE8",
                      fontWeight: 800,
                      fontSize: "0.66rem",
                    }}
                  />
                );
              })}
            </Stack>
          </Paper>

          {filteredProducts.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                py: 6,
                px: 3,
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                border: "1px dashed #CBD5D1",
                textAlign: "center",
              }}
            >
              <SearchRounded sx={{ fontSize: 38, color: "#A7B5B2" }} />
              <Typography sx={{ mt: 1.2, fontWeight: 900 }}>
                No products found
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  color: "#81908D",
                  fontSize: "0.76rem",
                }}
              >
                Try another search or category.
              </Typography>

              <Button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                sx={{
                  mt: 2,
                  color: "#0F766E",
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Show all products
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2.4}>
              {filteredProducts.map((product) => {
                const stock = getStockStatus(product.stock);

                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={product.id}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        borderRadius: "20px",
                        bgcolor: "#FFFFFF",
                        border: "1px solid #E5ECEA",
                        boxShadow: "0 6px 22px rgba(15,23,42,.035)",
                        transition:
                          "transform .25s ease, box-shadow .25s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow:
                            "0 18px 38px rgba(15,23,42,.08)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          height: 190,
                          bgcolor: "#EEF4F2",
                          overflow: "hidden",
                        }}
                      >
                        {product.image_url ? (
                          <Box
                            component="img"
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform .35s ease",
                              "&:hover": {
                                transform: "scale(1.035)",
                              },
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: "100%",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <ShoppingBagOutlined
                              sx={{ fontSize: 44, color: "#A7B5B2" }}
                            />
                          </Box>
                        )}

                        <Chip
                          size="small"
                          label={product.category || "General"}
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            maxWidth: "65%",
                            bgcolor: "rgba(255,255,255,.94)",
                            color: "#42514E",
                            fontWeight: 800,
                            fontSize: "0.6rem",
                          }}
                        />

                        <Box
                          sx={{
                            position: "absolute",
                            right: 12,
                            bottom: 12,
                            px: 1,
                            py: 0.55,
                            borderRadius: 999,
                            bgcolor: stock.bg,
                            color: stock.color,
                            border: `1px solid ${stock.border}`,
                            fontSize: "0.58rem",
                            fontWeight: 900,
                          }}
                        >
                          {stock.label}
                        </Box>
                      </Box>

                      <CardContent
                        sx={{
                          p: 2.2,
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          "&:last-child": { pb: 2.2 },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.9rem",
                            fontWeight: 900,
                            lineHeight: 1.35,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: 40,
                          }}
                        >
                          {product.name}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.7,
                            color: "#72807D",
                            fontSize: "0.72rem",
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: 36,
                            flex: 1,
                          }}
                        >
                          {product.description ||
                            "Everyday essential currently listed at StoreHub."}
                        </Typography>

                        <Divider
                          sx={{ my: 1.7, borderColor: "#EEF2F1" }}
                        />

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-end"
                          spacing={1}
                        >
                          <Box>
                            <Typography
                              sx={{
                                color: "#94A3B8",
                                fontSize: "0.58rem",
                                fontWeight: 700,
                              }}
                            >
                              PRICE
                            </Typography>
                            <Typography
                              sx={{
                                color: "#047857",
                                fontSize: "1.12rem",
                                fontWeight: 900,
                              }}
                            >
                              {formatPrice(product.price)}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              px: 1.1,
                              py: 0.65,
                              bgcolor: "#F0FDFA",
                              border: "1px solid #CCFBF1",
                              borderRadius: "11px",
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#0F766E",
                                fontSize: "0.62rem",
                                fontWeight: 900,
                              }}
                            >
                              {Number(product.stock || 0)} in stock
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </Box>

      {/* =========================================================
          WHY STOREHUB
      ========================================================= */}
      <Box
        id="about-section"
        sx={{
          scrollMarginTop: 90,
          py: { xs: 6, md: 8 },
          bgcolor: "#FFFFFF",
          borderTop: "1px solid #EEF2F1",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", maxWidth: 620, mx: "auto" }}>
            <Typography
              sx={{
                color: "#0F766E",
                fontSize: "0.68rem",
                fontWeight: 900,
                letterSpacing: ".12em",
                textTransform: "uppercase",
              }}
            >
              Why StoreHub
            </Typography>

            <Typography
              component="h2"
              sx={{
                mt: 0.9,
                fontSize: { xs: "1.7rem", md: "2.2rem" },
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              Built around everyday convenience
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "#72807D",
                fontSize: "0.84rem",
                lineHeight: 1.7,
              }}
            >
              Simple information, updated availability, and easier access to
              the products and promotions you need.
            </Typography>
          </Box>

          <Grid container spacing={2.3} sx={{ mt: 2.5 }}>
            {[
              {
                icon: <TrendingUpRounded />,
                title: "Updated availability",
                text: "Check current product stock before visiting the store.",
              },
              {
                icon: <SellOutlined />,
                title: "Current promotions",
                text: "See available offers and discounts in one place.",
              },
              {
                icon: <StorefrontRounded />,
                title: "Local convenience",
                text: "Designed around the everyday needs of the neighborhood.",
              },
              {
                icon: <SupportAgentRounded />,
                title: "Easy store contact",
                text: "Reach the store quickly through phone or email.",
              },
            ].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.title}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    p: 2.5,
                    borderRadius: "18px",
                    border: "1px solid #E5ECEA",
                    bgcolor: "#FBFCFC",
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "14px",
                      bgcolor: "#ECFDF5",
                      color: "#0F766E",
                      "& svg": { fontSize: 21 },
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    sx={{
                      mt: 1.6,
                      fontWeight: 900,
                      fontSize: "0.88rem",
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.6,
                      color: "#72807D",
                      fontSize: "0.74rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =========================================================
          STORE INFO / CONTACT
      ========================================================= */}
      <Box
        id="contact-section"
        sx={{
          scrollMarginTop: 90,
          py: { xs: 6, md: 8 },
          bgcolor: "#F7FAF9",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: { xs: 2.6, sm: 3.2 },
                  borderRadius: "22px",
                  border: "1px solid #E3EBE8",
                  bgcolor: "#FFFFFF",
                }}
              >
                <Typography
                  sx={{
                    color: "#0F766E",
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                  }}
                >
                  Visit us
                </Typography>

                <Typography
                  sx={{
                    mt: 0.9,
                    fontSize: { xs: "1.45rem", md: "1.8rem" },
                    fontWeight: 900,
                    letterSpacing: "-0.035em",
                  }}
                >
                  Your local StoreHub
                </Typography>

                <Typography
                  sx={{
                    mt: 0.8,
                    maxWidth: 560,
                    color: "#72807D",
                    fontSize: "0.8rem",
                    lineHeight: 1.7,
                  }}
                >
                  Drop by for everyday essentials, current store promotions,
                  and updated product availability.
                </Typography>

                <Grid container spacing={1.6} sx={{ mt: 1.4 }}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: "15px",
                        bgcolor: "#F8FBFA",
                        border: "1px solid #E7EEEC",
                      }}
                    >
                      <Stack direction="row" spacing={1.2}>
                        <LocationOnRounded sx={{ color: "#0F766E" }} />
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 900,
                            }}
                          >
                            Address
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.3,
                              color: "#72807D",
                              fontSize: "0.72rem",
                            }}
                          >
                            {STORE.address}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: "15px",
                        bgcolor: "#F8FBFA",
                        border: "1px solid #E7EEEC",
                      }}
                    >
                      <Stack direction="row" spacing={1.2}>
                        <AccessTimeRounded sx={{ color: "#0F766E" }} />
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 900,
                            }}
                          >
                            Store hours
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.3,
                              color: "#72807D",
                              fontSize: "0.72rem",
                            }}
                          >
                            Daily · 7:00 AM–9:00 PM
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  p: { xs: 2.6, sm: 3.2 },
                  borderRadius: "22px",
                  bgcolor: "#0A3F39",
                  color: "#FFFFFF",
                }}
              >
                <Typography
                  sx={{
                    color: "#99F6E4",
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                  }}
                >
                  Contact
                </Typography>

                <Typography
                  sx={{
                    mt: 0.9,
                    fontSize: "1.35rem",
                    fontWeight: 900,
                  }}
                >
                  Need to ask about an item?
                </Typography>

                <Typography
                  sx={{
                    mt: 0.8,
                    color: "rgba(255,255,255,.64)",
                    fontSize: "0.78rem",
                    lineHeight: 1.7,
                  }}
                >
                  Contact the store for product availability, new arrivals, or
                  current promotions.
                </Typography>

                <Stack spacing={1.2} sx={{ mt: 2.2 }}>
                  <Button
                    component="a"
                    href={`tel:${STORE.phone.replace(/\s+/g, "")}`}
                    startIcon={<PhoneRounded />}
                    sx={{
                      justifyContent: "flex-start",
                      color: "#FFFFFF",
                      bgcolor: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: "13px",
                      px: 1.6,
                      py: 1.1,
                      textTransform: "none",
                      fontWeight: 700,
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,.10)",
                      },
                    }}
                  >
                    {STORE.phone}
                  </Button>

                  <Button
                    component="a"
                    href={`mailto:${STORE.email}`}
                    startIcon={<EmailRounded />}
                    sx={{
                      justifyContent: "flex-start",
                      color: "#FFFFFF",
                      bgcolor: "rgba(255,255,255,.06)",
                      border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: "13px",
                      px: 1.6,
                      py: 1.1,
                      textTransform: "none",
                      fontWeight: 700,
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,.10)",
                      },
                    }}
                  >
                    {STORE.email}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <Box sx={{ py: { xs: 5, md: 6 }, bgcolor: "#FFFFFF" }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "24px",
              color: "#FFFFFF",
              background:
                "linear-gradient(135deg, #0A3F39 0%, #0F766E 100%)",
              overflow: "hidden",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2.5}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: "1.35rem", md: "1.65rem" },
                    fontWeight: 900,
                  }}
                >
                  Ready to explore the store?
                </Typography>
                <Typography
                  sx={{
                    mt: 0.6,
                    color: "rgba(255,255,255,.65)",
                    fontSize: "0.8rem",
                  }}
                >
                  Browse available products or sign in using the existing
                  StoreHub login page.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                sx={{ width: { xs: "100%", md: "auto" } }}
              >
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartRounded />}
                  onClick={() => scrollTo("products-section")}
                  sx={{
                    minHeight: 46,
                    px: 2.4,
                    borderRadius: "13px",
                    bgcolor: "#5EEAD4",
                    color: "#073D37",
                    textTransform: "none",
                    fontWeight: 900,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#99F6E4",
                      boxShadow: "none",
                    },
                  }}
                >
                  Browse products
                </Button>

                {/* Existing route from App.jsx */}
                <Button
                  variant="outlined"
                  startIcon={<LoginRounded />}
                  onClick={() => navigate("/login")}
                  sx={{
                    minHeight: 46,
                    px: 2.4,
                    borderRadius: "13px",
                    borderColor: "rgba(255,255,255,.22)",
                    color: "#FFFFFF",
                    textTransform: "none",
                    fontWeight: 800,
                    "&:hover": {
                      borderColor: "rgba(255,255,255,.5)",
                      bgcolor: "rgba(255,255,255,.05)",
                    },
                  }}
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* =========================================================
          SINGLE HOMEPAGE FOOTER
          Do not render the old global Footer in App.jsx.
      ========================================================= */}
      <Box
        component="footer"
        sx={{
          bgcolor: "#071F1C",
          color: "#FFFFFF",
          pt: { xs: 5, md: 6 },
          pb: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "13px",
                    bgcolor: "rgba(94,234,212,.10)",
                    border: "1px solid rgba(94,234,212,.14)",
                  }}
                >
                  <StorefrontRounded sx={{ color: "#5EEAD4" }} />
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 900 }}>
                    {STORE.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.42)",
                      fontSize: "0.65rem",
                    }}
                  >
                    {STORE.tagline}
                  </Typography>
                </Box>
              </Stack>

              <Typography
                sx={{
                  mt: 1.8,
                  maxWidth: 380,
                  color: "rgba(255,255,255,.50)",
                  fontSize: "0.75rem",
                  lineHeight: 1.75,
                }}
              >
                Your neighborhood store for everyday essentials, updated
                product availability, and current promotions in one simple
                place.
              </Typography>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Typography
                sx={{
                  color: "#99F6E4",
                  fontSize: "0.66rem",
                  fontWeight: 900,
                  letterSpacing: ".1em",
                }}
              >
                EXPLORE
              </Typography>

              <Stack spacing={0.9} sx={{ mt: 1.4 }}>
                {[
                  ["Home", "home-section"],
                  ["Products", "products-section"],
                  ["Promotions", "promos-section"],
                  ["About", "about-section"],
                ].map(([label, id]) => (
                  <Button
                    key={label}
                    onClick={() => scrollTo(id)}
                    sx={{
                      justifyContent: "flex-start",
                      minWidth: 0,
                      p: 0,
                      color: "rgba(255,255,255,.50)",
                      textTransform: "none",
                      fontSize: "0.72rem",
                      "&:hover": {
                        bgcolor: "transparent",
                        color: "#99F6E4",
                      },
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Typography
                sx={{
                  color: "#99F6E4",
                  fontSize: "0.66rem",
                  fontWeight: 900,
                  letterSpacing: ".1em",
                }}
              >
                CONTACT
              </Typography>

              <Stack spacing={1.05} sx={{ mt: 1.4 }}>
                <Stack direction="row" spacing={0.8}>
                  <LocationOnRounded
                    sx={{
                      mt: 0.1,
                      fontSize: 15,
                      color: "rgba(255,255,255,.35)",
                    }}
                  />
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.50)",
                      fontSize: "0.7rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {STORE.address}
                  </Typography>
                </Stack>

                <Typography
                  component="a"
                  href={`tel:${STORE.phone.replace(/\s+/g, "")}`}
                  sx={{
                    color: "rgba(255,255,255,.50)",
                    fontSize: "0.7rem",
                    textDecoration: "none",
                    "&:hover": { color: "#99F6E4" },
                  }}
                >
                  {STORE.phone}
                </Typography>

                <Typography
                  component="a"
                  href={`mailto:${STORE.email}`}
                  sx={{
                    color: "rgba(255,255,255,.50)",
                    fontSize: "0.7rem",
                    textDecoration: "none",
                    wordBreak: "break-word",
                    "&:hover": { color: "#99F6E4" },
                  }}
                >
                  {STORE.email}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <Typography
                sx={{
                  color: "#99F6E4",
                  fontSize: "0.66rem",
                  fontWeight: 900,
                  letterSpacing: ".1em",
                }}
              >
                STORE STATUS
              </Typography>

              <Box
                sx={{
                  mt: 1.4,
                  p: 1.5,
                  borderRadius: "14px",
                  bgcolor: "rgba(255,255,255,.035)",
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: isOpen ? "#34D399" : "#F87171",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                    }}
                  >
                    {isOpen ? "Open now" : "Currently closed"}
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    mt: 0.7,
                    color: "rgba(255,255,255,.42)",
                    fontSize: "0.67rem",
                    lineHeight: 1.55,
                  }}
                >
                  Open daily · 7:00 AM–9:00 PM
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider
            sx={{
              my: 3.2,
              borderColor: "rgba(255,255,255,.07)",
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,.32)",
                fontSize: "0.66rem",
              }}
            >
              © {new Date().getFullYear()} StoreHub. All rights reserved.
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,.28)",
                fontSize: "0.64rem",
              }}
            >
              Built for everyday local retail.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* BACK TO TOP */}
      {showBackToTop && (
        <Fab
          size="small"
          aria-label="Back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          sx={{
            position: "fixed",
            right: { xs: 16, sm: 24 },
            bottom: { xs: 16, sm: 24 },
            bgcolor: "#0F766E",
            color: "#FFFFFF",
            boxShadow: "0 12px 30px rgba(15,118,110,.24)",
            "&:hover": {
              bgcolor: "#0B5F58",
            },
          }}
        >
          <KeyboardArrowUpRounded />
        </Fab>
      )}
    </Box>
  );
};

export default Homepage;
