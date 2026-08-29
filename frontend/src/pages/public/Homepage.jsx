import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Divider,
} from "@mui/material";

import {
  ShoppingCart,
  LocalOffer,
  Storefront,
  ArrowForward,
  Inventory2Outlined,
  CheckCircleRounded,
  AccessTimeRounded,
  CancelRounded,
  LoginRounded,
  ShoppingBagOutlined,
  VerifiedOutlined,
  TrendingUpRounded,
} from "@mui/icons-material";

import API from "../../api/axios";
import { colors } from "../../theme";

const Homepage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    products: [],
    promos: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get("/public/homepage");

        setData({
          products: response.data?.products || [],
          promos: response.data?.promos || [],
        });
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStockStatus = (stock) => {
    if (stock <= 0) {
      return {
        label: "Out of Stock",
        color: "#B91C1C",
        background: "#FEF2F2",
        border: "#FECACA",
        icon: <CancelRounded sx={{ fontSize: 14 }} />,
      };
    }

    if (stock <= 10) {
      return {
        label: `Only ${stock} left`,
        color: "#B45309",
        background: "#FFFBEB",
        border: "#FDE68A",
        icon: <AccessTimeRounded sx={{ fontSize: 14 }} />,
      };
    }

    return {
      label: "In Stock",
      color: "#047857",
      background: "#ECFDF5",
      border: "#A7F3D0",
      icon: <CheckCircleRounded sx={{ fontSize: 14 }} />,
    };
  };

  const formatPrice = (price) => {
    return `₱${Number(price || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const scrollToProducts = () => {
    document.getElementById("products-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "72vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F8FAFC",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 68,
              height: 68,
              display: "grid",
              placeItems: "center",
              borderRadius: "20px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
              position: "relative",
            }}
          >
            <Storefront
              sx={{
                fontSize: 29,
                color: "#0F766E",
              }}
            />

            <CircularProgress
              size={68}
              thickness={2.5}
              sx={{
                color: colors.primary,
                position: "absolute",
              }}
            />
          </Box>

          <Box textAlign="center">
            <Typography
              sx={{
                color: "#0F172A",
                fontSize: "0.95rem",
                fontWeight: 700,
              }}
            >
              StoreHub
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                color: "#64748B",
                fontSize: "0.8rem",
              }}
            >
              Preparing the store for you...
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F8FAFC",
        color: "#0F172A",
      }}
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "#FFFFFF",

          pt: {
            xs: 7,
            sm: 8,
            md: 10,
          },

          pb: {
            xs: 8,
            sm: 9,
            md: 11,
          },

          background:
            "linear-gradient(135deg, #0B2924 0%, #0F4C42 55%, #126B5D 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 460,
            height: 460,
            borderRadius: "50%",
            bgcolor: "rgba(94, 234, 212, 0.06)",
            top: -250,
            right: -120,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            bgcolor: "rgba(255, 255, 255, 0.035)",
            bottom: -170,
            left: -100,
          }}
        />

        <Container maxWidth="lg">
          <Grid
            container
            spacing={{
              xs: 5,
              md: 7,
            }}
            alignItems="center"
            sx={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  maxWidth: 700,
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.9,

                    px: 1.5,
                    py: 0.7,

                    mb: 2.8,

                    borderRadius: 999,

                    bgcolor: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Storefront
                    sx={{
                      fontSize: 16,
                      color: "#5EEAD4",
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.82)",
                    }}
                  >
                    Your trusted neighborhood store
                  </Typography>
                </Box>

                <Typography
                  component="h1"
                  sx={{
                    maxWidth: 680,

                    fontSize: {
                      xs: "2.45rem",
                      sm: "3.25rem",
                      md: "4rem",
                    },

                    fontWeight: 800,
                    lineHeight: 1.05,
                    letterSpacing: "-0.045em",
                  }}
                >
                  Everyday essentials,
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      mt: 0.35,
                      color: "#99F6E4",
                    }}
                  >
                    made convenient.
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    mt: 2.6,

                    maxWidth: 590,

                    fontSize: {
                      xs: "0.95rem",
                      md: "1.05rem",
                    },

                    lineHeight: 1.75,

                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Discover available products, current promotions, and updated
                  stock from your local convenience store.
                </Typography>

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={1.5}
                  sx={{
                    mt: 3.5,
                  }}
                >
                  <Button
                    size="large"
                    variant="contained"
                    startIcon={<LoginRounded />}
                    endIcon={<ArrowForward />}
                    onClick={() => navigate("/login")}
                    sx={{
                      minHeight: 50,
                      px: 3,

                      borderRadius: "13px",

                      textTransform: "none",

                      bgcolor: "#5EEAD4",
                      color: "#0F3D36",

                      fontSize: "0.88rem",
                      fontWeight: 800,

                      boxShadow: "0 10px 28px rgba(45, 212, 191, 0.16)",

                      transition: "all .2s ease",

                      "&:hover": {
                        bgcolor: "#99F6E4",
                        transform: "translateY(-1px)",
                        boxShadow: "0 13px 30px rgba(45, 212, 191, 0.2)",
                      },
                    }}
                  >
                    Login to your account
                  </Button>

                  <Button
                    size="large"
                    variant="outlined"
                    startIcon={<ShoppingBagOutlined />}
                    onClick={scrollToProducts}
                    sx={{
                      minHeight: 50,
                      px: 3,

                      borderRadius: "13px",

                      color: "#FFFFFF",

                      borderColor: "rgba(255,255,255,0.22)",

                      bgcolor: "rgba(255,255,255,0.035)",

                      textTransform: "none",

                      fontSize: "0.88rem",
                      fontWeight: 650,

                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.45)",
                        bgcolor: "rgba(255,255,255,0.07)",
                      },
                    }}
                  >
                    Browse Products
                  </Button>
                </Stack>

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={{
                    xs: 1.1,
                    sm: 2.4,
                  }}
                  sx={{
                    mt: 3.8,
                  }}
                >
                  {[
                    {
                      icon: <VerifiedOutlined />,
                      text: "Reliable products",
                    },
                    {
                      icon: <TrendingUpRounded />,
                      text: "Updated stock",
                    },
                    {
                      icon: <LocalOffer />,
                      text: "Exclusive promos",
                    },
                  ].map((item) => (
                    <Box
                      key={item.text}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.7,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          color: "#5EEAD4",

                          "& svg": {
                            fontSize: 17,
                          },
                        }}
                      >
                        {item.icon}
                      </Box>

                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.67)",
                        }}
                      >
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>

            {/* HERO CARD */}

            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  maxWidth: 410,
                  mx: "auto",

                  p: {
                    xs: 1.3,
                    sm: 1.6,
                  },

                  borderRadius: "28px",

                  bgcolor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",

                  boxShadow: "0 25px 60px rgba(0,0,0,0.13)",
                }}
              >
                <Box
                  sx={{
                    p: {
                      xs: 2.5,
                      sm: 3,
                    },

                    bgcolor: "#FFFFFF",
                    color: "#0F172A",

                    borderRadius: "22px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 54,
                        height: 54,

                        display: "grid",
                        placeItems: "center",

                        borderRadius: "16px",

                        bgcolor: "#ECFDF5",
                        border: "1px solid #D1FAE5",
                      }}
                    >
                      <Storefront
                        sx={{
                          color: "#0F766E",
                          fontSize: 28,
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: "1.05rem",
                          fontWeight: 800,
                        }}
                      >
                        StoreHub
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.2,
                          color: "#94A3B8",
                          fontSize: "0.72rem",
                        }}
                      >
                        Sari-Sari Store System
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      mt: 2.2,

                      color: "#64748B",

                      fontSize: "0.85rem",
                      lineHeight: 1.65,
                    }}
                  >
                    Products, promotions, and store updates available in one
                    convenient place.
                  </Typography>

                  <Divider
                    sx={{
                      my: 2.4,
                      borderColor: "#F1F5F9",
                    }}
                  />

                  <Grid container spacing={1.4}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 2,

                          borderRadius: "16px",

                          bgcolor: "#F0FDFA",
                          border: "1px solid #CCFBF1",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#0F766E",
                            fontSize: "0.65rem",
                            fontWeight: 750,
                            letterSpacing: "0.05em",
                          }}
                        >
                          PRODUCTS
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.3,

                            fontSize: "1.45rem",
                            fontWeight: 800,

                            color: "#0F172A",
                          }}
                        >
                          {data.products.length}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 2,

                          borderRadius: "16px",

                          bgcolor: "#FFF7ED",
                          border: "1px solid #FFEDD5",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#C2410C",
                            fontSize: "0.65rem",
                            fontWeight: 750,
                            letterSpacing: "0.05em",
                          }}
                        >
                          PROMOS
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.3,

                            fontSize: "1.45rem",
                            fontWeight: 800,

                            color: "#0F172A",
                          }}
                        >
                          {data.promos.length}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =====================================================
          PROMOTIONS
      ===================================================== */}

      {data.promos.length > 0 && (
        <Box
          sx={{
            py: {
              xs: 7,
              md: 9,
            },

            bgcolor: "#FFFFFF",
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                mb: 4,
                maxWidth: 620,
              }}
            >
              <Chip
                icon={<LocalOffer />}
                label="Special Offers"
                sx={{
                  mb: 1.4,

                  bgcolor: "#FFF7ED",
                  color: "#C2410C",

                  border: "1px solid #FFEDD5",

                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}
              />

              <Typography
                component="h2"
                sx={{
                  fontSize: {
                    xs: "1.8rem",
                    md: "2.25rem",
                  },

                  fontWeight: 800,

                  letterSpacing: "-0.035em",

                  color: "#0F172A",
                }}
              >
                Current Promos & Offers
              </Typography>

              <Typography
                sx={{
                  mt: 1,

                  color: "#64748B",

                  fontSize: "0.92rem",
                  lineHeight: 1.7,

                  maxWidth: 540,
                }}
              >
                Save more with our latest deals and exclusive in-store
                promotions.
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              {data.promos.map((promo) => (
                <Grid item xs={12} sm={6} md={4} key={promo.id}>
                  <Card
                    sx={{
                      height: "100%",

                      borderRadius: "18px",

                      border: "1px solid #EEF2F6",

                      bgcolor: "#FFFFFF",

                      boxShadow: "0 6px 24px rgba(15,23,42,0.04)",

                      transition: "all .22s ease",

                      "&:hover": {
                        transform: "translateY(-4px)",
                        borderColor: "#FED7AA",
                        boxShadow: "0 14px 34px rgba(15,23,42,0.07)",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 2.8,

                        "&:last-child": {
                          pb: 2.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 46,
                          height: 46,

                          display: "grid",
                          placeItems: "center",

                          mb: 2,

                          borderRadius: "14px",

                          bgcolor: "#FFF7ED",
                          border: "1px solid #FFEDD5",
                        }}
                      >
                        <LocalOffer
                          sx={{
                            color: "#EA580C",
                            fontSize: 21,
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          color: "#0F172A",

                          fontSize: "1rem",
                          fontWeight: 800,

                          lineHeight: 1.35,
                        }}
                      >
                        {promo.title}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.8,

                          color: "#64748B",

                          fontSize: "0.82rem",
                          lineHeight: 1.65,

                          minHeight: 43,
                        }}
                      >
                        {promo.description}
                      </Typography>

                      <Divider
                        sx={{
                          my: 2.2,
                          borderColor: "#F1F5F9",
                        }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",

                          gap: 1.2,

                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#94A3B8",

                            fontSize: "0.68rem",
                            fontWeight: 500,
                          }}
                        >
                          {formatDate(promo.start_date)} –{" "}
                          {formatDate(promo.end_date)}
                        </Typography>

                        <Chip
                          size="small"
                          label={
                            promo.discount_type === "percentage"
                              ? `${promo.discount_value}% OFF`
                              : promo.discount_type === "fixed"
                                ? `₱${promo.discount_value} OFF`
                                : "Bundle Deal"
                          }
                          sx={{
                            height: 28,

                            bgcolor: "#F59E0B",
                            color: "#FFFFFF",

                            fontSize: "0.67rem",
                            fontWeight: 800,
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <Box
        id="products-section"
        sx={{
          py: {
            xs: 7,
            md: 9,
          },

          bgcolor: "#F8FAFC",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              mb: 4,
              maxWidth: 620,
            }}
          >
            <Chip
              icon={<ShoppingCart />}
              label="Product Catalog"
              sx={{
                mb: 1.4,

                bgcolor: "#ECFDF5",
                color: "#047857",

                border: "1px solid #D1FAE5",

                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            />

            <Typography
              component="h2"
              sx={{
                color: "#0F172A",

                fontSize: {
                  xs: "1.8rem",
                  md: "2.25rem",
                },

                fontWeight: 800,

                letterSpacing: "-0.035em",
              }}
            >
              Explore Our Products
            </Typography>

            <Typography
              sx={{
                mt: 1,

                color: "#64748B",

                fontSize: "0.92rem",
                lineHeight: 1.7,
              }}
            >
              Browse available convenience-store essentials and their current
              stock status.
            </Typography>
          </Box>

          {data.products.length === 0 ? (
            <Box
              sx={{
                py: 7,
                px: 3,

                textAlign: "center",

                bgcolor: "#FFFFFF",

                border: "1px dashed #CBD5E1",

                borderRadius: "20px",
              }}
            >
              <Box
                sx={{
                  width: 76,
                  height: 76,

                  display: "grid",
                  placeItems: "center",

                  mx: "auto",

                  borderRadius: "20px",

                  bgcolor: "#F8FAFC",
                }}
              >
                <Inventory2Outlined
                  sx={{
                    fontSize: 38,
                    color: "#94A3B8",
                  }}
                />
              </Box>

              <Typography
                sx={{
                  mt: 1.8,

                  color: "#0F172A",

                  fontSize: "1rem",
                  fontWeight: 750,
                }}
              >
                No products available
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,

                  color: "#94A3B8",

                  fontSize: "0.8rem",
                }}
              >
                Please check again later for new items.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {data.products.map((product) => {
                const stock = getStockStatus(product.stock);

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <Card
                      sx={{
                        height: "100%",

                        overflow: "hidden",

                        borderRadius: "18px",

                        bgcolor: "#FFFFFF",

                        border: "1px solid #E8EEEC",

                        boxShadow: "0 6px 24px rgba(15,23,42,0.04)",

                        transition: "all .24s ease",

                        "&:hover": {
                          transform: "translateY(-5px)",
                          borderColor: "#CCFBF1",
                          boxShadow: "0 15px 38px rgba(15,23,42,0.08)",
                        },

                        "&:hover .product-image": {
                          transform: "scale(1.035)",
                        },
                      }}
                    >
                      {/* PRODUCT IMAGE */}

                      <Box
                        sx={{
                          position: "relative",

                          height: 210,

                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",

                          overflow: "hidden",

                          bgcolor: "#EDF4F2",
                        }}
                      >
                        {product.image_url ? (
                          <Box
                            className="product-image"
                            component="img"
                            src={product.image_url}
                            alt={product.name}
                            sx={{
                              width: "100%",
                              height: "100%",

                              objectFit: "cover",

                              transition: "transform .35s ease",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 78,
                              height: 78,

                              display: "grid",
                              placeItems: "center",

                              borderRadius: "20px",

                              bgcolor: "rgba(255,255,255,0.65)",
                            }}
                          >
                            <ShoppingBagOutlined
                              sx={{
                                fontSize: 39,
                                color: "#86AFA4",
                              }}
                            />
                          </Box>
                        )}

                        <Chip
                          size="small"
                          label={product.category}
                          sx={{
                            position: "absolute",

                            top: 12,
                            left: 12,

                            height: 28,

                            maxWidth: "65%",

                            bgcolor: "rgba(255,255,255,0.92)",

                            color: "#334155",

                            fontSize: "0.66rem",
                            fontWeight: 700,

                            border: "1px solid rgba(255,255,255,0.7)",

                            boxShadow: "0 3px 10px rgba(15,23,42,0.07)",
                          }}
                        />

                        <Box
                          sx={{
                            position: "absolute",

                            right: 12,
                            bottom: 12,

                            display: "flex",
                            alignItems: "center",

                            gap: 0.45,

                            px: 1.05,
                            py: 0.58,

                            borderRadius: 999,

                            bgcolor: stock.background,

                            color: stock.color,

                            border: `1px solid ${stock.border}`,

                            fontSize: "0.65rem",

                            fontWeight: 700,
                          }}
                        >
                          {stock.icon}
                          {stock.label}
                        </Box>
                      </Box>

                      {/* PRODUCT DETAILS */}

                      <CardContent
                        sx={{
                          p: 2.3,

                          "&:last-child": {
                            pb: 2.3,
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#0F172A",

                            fontSize: "0.98rem",
                            fontWeight: 750,

                            lineHeight: 1.35,

                            display: "-webkit-box",

                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",

                            overflow: "hidden",

                            minHeight: 42,
                          }}
                        >
                          {product.name}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.65,

                            color: "#64748B",

                            fontSize: "0.78rem",
                            lineHeight: 1.6,

                            display: "-webkit-box",

                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",

                            overflow: "hidden",

                            minHeight: 40,
                          }}
                        >
                          {product.description ||
                            "Quality everyday essential available at StoreHub."}
                        </Typography>

                        <Divider
                          sx={{
                            my: 1.8,
                            borderColor: "#F1F5F9",
                          }}
                        />

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",

                            gap: 1,
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                color: "#94A3B8",

                                fontSize: "0.64rem",
                                fontWeight: 600,
                              }}
                            >
                              Price
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.15,

                                color: "#047857",

                                fontSize: "1.25rem",
                                fontWeight: 800,

                                lineHeight: 1.2,
                              }}
                            >
                              {formatPrice(product.price)}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              width: 40,
                              height: 40,

                              display: "grid",
                              placeItems: "center",

                              borderRadius: "12px",

                              bgcolor: "#ECFDF5",

                              border: "1px solid #D1FAE5",
                            }}
                          >
                            <ShoppingCart
                              sx={{
                                color: "#059669",
                                fontSize: 19,
                              }}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </Box>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <Box
        sx={{
          py: {
            xs: 7,
            md: 8,
          },

          bgcolor: "#FFFFFF",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position: "relative",

              overflow: "hidden",

              px: {
                xs: 3,
                sm: 4,
                md: 6,
              },

              py: {
                xs: 4.5,
                md: 5.5,
              },

              borderRadius: {
                xs: "22px",
                md: "26px",
              },

              color: "#FFFFFF",

              background: "linear-gradient(125deg, #0B2924 0%, #0F5B4E 100%)",

              boxShadow: "0 18px 45px rgba(15,91,78,0.13)",
            }}
          >
            <Box
              sx={{
                position: "absolute",

                width: 250,
                height: 250,

                borderRadius: "50%",

                right: -110,
                top: -160,

                bgcolor: "rgba(94,234,212,0.07)",
              }}
            />

            <Grid
              container
              spacing={3}
              alignItems="center"
              justifyContent="space-between"
              sx={{
                position: "relative",
                zIndex: 1,
              }}
            >
              <Grid item xs={12} md={8}>
                <Typography
                  sx={{
                    fontSize: {
                      xs: "1.7rem",
                      md: "2.2rem",
                    },

                    fontWeight: 800,

                    lineHeight: 1.2,

                    letterSpacing: "-0.035em",
                  }}
                >
                  Already have a StoreHub account?
                </Typography>

                <Typography
                  sx={{
                    mt: 1,

                    maxWidth: 620,

                    color: "rgba(255,255,255,0.68)",

                    fontSize: "0.88rem",
                    lineHeight: 1.7,
                  }}
                >
                  Login using your Account ID or registered email to access your
                  dashboard, orders, receipts, and account information.
                </Typography>
              </Grid>

              <Grid item xs={12} md="auto">
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/login")}
                  sx={{
                    minHeight: 48,

                    px: 3,

                    borderRadius: "13px",

                    bgcolor: "#FFFFFF",
                    color: "#0F766E",

                    textTransform: "none",

                    fontSize: "0.86rem",
                    fontWeight: 800,

                    boxShadow: "none",

                    "&:hover": {
                      bgcolor: "#F0FDFA",
                      boxShadow: "none",
                    },
                  }}
                >
                  Go to Login
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Homepage;
