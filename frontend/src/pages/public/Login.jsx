import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  AlternateEmailRounded,
  ArrowBackRounded,
  ArrowForwardRounded,
  CheckCircleRounded,
  Inventory2Outlined,
  LocalOfferOutlined,
  LockOutlined,
  SecurityRounded,
  ShoppingCartOutlined,
  StorefrontRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const features = [
    {
      icon: <Inventory2Outlined />,
      title: "Smart Inventory",
      description: "Monitor products and stock levels efficiently.",
    },
    {
      icon: <ShoppingCartOutlined />,
      title: "Easy Transactions",
      description: "Manage sales and receipts in one organized system.",
    },
    {
      icon: <LocalOfferOutlined />,
      title: "Promos & Discounts",
      description: "Keep promotions simple, accurate and updated.",
    },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier || !password) {
      setError("Please enter your Account ID or Email and password.");
      return;
    }

    try {
      setLoading(true);

      const user = await login(cleanIdentifier, password);

      if (!user) {
        throw new Error("Unable to retrieve account information.");
      }

      const role = String(user.role || "").toLowerCase();

      // First-login temporary password flow
      if (user.must_change_password) {
        navigate("/change-password", {
          replace: true,
        });
        return;
      }

      switch (role) {
        case "admin":
          navigate("/admin/dashboard", {
            replace: true,
          });
          break;

        case "staff":
          navigate("/staff/dashboard", {
            replace: true,
          });
          break;

        case "client":
          navigate("/client/dashboard", {
            replace: true,
          });
          break;

        default:
          throw new Error("Invalid account role.");
      }
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",

        background:
          "linear-gradient(135deg, #F0FDF4 0%, #F8FAFC 50%, #FFFBEB 100%)",

        py: {
          xs: 3,
          md: 5,
        },

        "@keyframes loginFadeUp": {
          from: {
            opacity: 0,
            transform: "translateY(24px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
    >
      {/* BACKGROUND DECORATION */}

      <Box
        sx={{
          position: "absolute",
          top: -280,
          right: -170,
          width: 520,
          height: 520,
          borderRadius: "50%",
          bgcolor: "rgba(5,150,105,.06)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: -210,
          left: -120,
          width: 370,
          height: 370,
          borderRadius: "50%",
          bgcolor: "rgba(245,158,11,.07)",
          pointerEvents: "none",
        }}
      />

      {/* BACK HOME */}

      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate("/")}
        sx={{
          position: "absolute",
          zIndex: 10,

          top: {
            xs: 15,
            md: 24,
          },

          left: {
            xs: 15,
            md: 30,
          },

          px: 2,
          py: 0.9,

          bgcolor: "rgba(255,255,255,.78)",
          backdropFilter: "blur(12px)",

          color: "#475569",

          border: "1px solid #E2E8F0",
          borderRadius: 3,

          fontSize: 13,
          fontWeight: 700,
          textTransform: "none",

          transition: "all .25s ease",

          "&:hover": {
            bgcolor: "#FFFFFF",
            color: "#047857",
            transform: "translateX(-3px)",
            boxShadow: "0 8px 25px rgba(15,23,42,.08)",
          },
        }}
      >
        Back to Home
      </Button>

      {/* Upper-side quick links: Shop ? Services ? About Us ? Contract */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 10,
          top: { xs: 15, md: 24 },
          right: { xs: 15, md: 30 },
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 0.6,
          borderRadius: 3,
          bgcolor: "rgba(255,255,255,.85)",
          border: "1px solid rgba(226,232,240,.8)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 10px rgba(15,23,42,.06)",
        }}
      >
        {["Shop", "Services", "About Us", "Contract"].map((label, idx) => (
          <React.Fragment key={label}>
            {idx > 0 && (
              <Box sx={{ color: "#94A3B8", fontSize: 18, lineHeight: 1 }}>?</Box>
            )}
            <Link
              to="#"
              onClick={(e) => e.preventDefault()}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#047857",
                textDecoration: "none",
                whiteSpace: "nowrap",
                letterSpacing: ".05em",
              }}
            >
              {label}
            </Link>
          </React.Fragment>
        ))}
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 2,

          mt: {
            xs: 7,
            md: 0,
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1060,

            mx: "auto",

            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              md: "1.08fr .92fr",
            },

            bgcolor: "#FFFFFF",

            border: "1px solid rgba(226,232,240,.9)",

            borderRadius: {
              xs: 4,
              md: 6,
            },

            overflow: "hidden",

            boxShadow:
              "0 30px 80px rgba(15,23,42,.12), 0 5px 15px rgba(15,23,42,.03)",

            animation: "loginFadeUp .55s ease",
          }}
        >
          {/* LEFT BRAND SIDE */}

          <Box
            sx={{
              position: "relative",
              overflow: "hidden",

              display: {
                xs: "none",
                md: "flex",
              },

              flexDirection: "column",
              justifyContent: "space-between",

              minHeight: 660,

              p: 6,

              color: "#FFFFFF",

              background:
                "linear-gradient(145deg, #022C22 0%, #064E3B 42%, #047857 75%, #059669 100%)",
            }}
          >
            <Box
              sx={{
                position: "absolute",

                width: 420,
                height: 420,

                top: -180,
                right: -170,

                borderRadius: "50%",

                background:
                  "radial-gradient(circle, rgba(253,230,138,.19), transparent 70%)",
              }}
            />

            <Box
              sx={{
                position: "absolute",

                width: 320,
                height: 320,

                bottom: -150,
                left: -120,

                borderRadius: "50%",

                background:
                  "radial-gradient(circle, rgba(167,243,208,.14), transparent 70%)",
              }}
            />

            {/* subtle grid */}

            <Box
              sx={{
                position: "absolute",
                inset: 0,

                opacity: 0.035,

                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",

                backgroundSize: "42px 42px",
              }}
            />

            <Box
              sx={{
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* BRAND */}

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 58,
                    height: 58,

                    display: "grid",
                    placeItems: "center",

                    borderRadius: 3.5,

                    bgcolor: "rgba(255,255,255,.11)",

                    border: "1px solid rgba(255,255,255,.15)",

                    backdropFilter: "blur(10px)",
                  }}
                >
                  <StorefrontRounded
                    sx={{
                      fontSize: 34,
                      color: "#FDE68A",
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 24,
                      fontWeight: 900,
                      lineHeight: 1.05,
                      letterSpacing: "-.04em",
                    }}
                  >
                    StoreHub
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "rgba(255,255,255,.58)",
                      fontSize: 11.5,
                    }}
                  >
                    Convenience Store Management System
                  </Typography>
                </Box>
              </Stack>

              {/* MAIN TEXT */}

              <Box sx={{ mt: 7 }}>
                <Chip
                  icon={
                    <CheckCircleRounded
                      sx={{
                        color: "#A7F3D0 !important",
                      }}
                    />
                  }
                  label="Simple • Secure • Reliable"
                  sx={{
                    mb: 2.5,

                    color: "#FFFFFF",

                    bgcolor: "rgba(255,255,255,.09)",

                    border: "1px solid rgba(255,255,255,.12)",

                    backdropFilter: "blur(8px)",

                    fontWeight: 700,
                  }}
                />

                <Typography
                  component="h1"
                  sx={{
                    maxWidth: 470,

                    fontSize: "2.9rem",

                    lineHeight: 1.07,

                    fontWeight: 900,

                    letterSpacing: "-.05em",
                  }}
                >
                  Manage your store
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      color: "#FDE68A",
                    }}
                  >
                    smarter every day.
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    mt: 2.5,

                    maxWidth: 450,

                    color: "rgba(255,255,255,.7)",

                    fontSize: 15,

                    lineHeight: 1.75,
                  }}
                >
                  Inventory, transactions, promotions, receipts and customer
                  records — organized through one reliable store management
                  platform.
                </Typography>
              </Box>

              {/* FEATURES */}

              <Stack
                spacing={2.2}
                sx={{
                  mt: 5,
                }}
              >
                {features.map((feature) => (
                  <Box
                    key={feature.title}
                    sx={{
                      display: "flex",

                      alignItems: "center",

                      gap: 1.6,
                    }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,

                        flexShrink: 0,

                        display: "grid",
                        placeItems: "center",

                        borderRadius: 2.5,

                        bgcolor: "rgba(255,255,255,.09)",

                        border: "1px solid rgba(255,255,255,.11)",

                        color: "#FDE68A",
                      }}
                    >
                      {feature.icon}
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 750,
                        }}
                      >
                        {feature.title}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.15,

                          color: "rgba(255,255,255,.55)",

                          fontSize: 12,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                position: "relative",
                zIndex: 2,

                color: "rgba(255,255,255,.47)",
              }}
            >
              <SecurityRounded
                sx={{
                  fontSize: 17,
                }}
              />

              <Typography
                sx={{
                  fontSize: 11.5,
                }}
              >
                Secure access for Admin, Staff and Client accounts.
              </Typography>
            </Stack>
          </Box>

          {/* RIGHT LOGIN SIDE */}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",

              px: {
                xs: 3,
                sm: 5,
                md: 5.5,
              },

              py: {
                xs: 4,
                sm: 5,
                md: 6,
              },
            }}
          >
            {/* MOBILE BRAND */}

            <Stack
              direction="row"
              spacing={1.3}
              alignItems="center"
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },

                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,

                  display: "grid",
                  placeItems: "center",

                  bgcolor: "#ECFDF5",

                  border: "1px solid #D1FAE5",

                  borderRadius: 3,
                }}
              >
                <StorefrontRounded
                  sx={{
                    fontSize: 29,
                    color: "#059669",
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: "#0F172A",

                    fontSize: 20,

                    fontWeight: 900,

                    lineHeight: 1.1,
                  }}
                >
                  StoreHub
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,

                    color: "#94A3B8",

                    fontSize: 11,
                  }}
                >
                  Store Management System
                </Typography>
              </Box>
            </Stack>

            {/* FORM HEADING */}

            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  mb: 1,

                  color: "#059669",

                  fontSize: 11,

                  fontWeight: 800,

                  textTransform: "uppercase",

                  letterSpacing: ".14em",
                }}
              >
                Secure Account Access
              </Typography>

              <Typography
                sx={{
                  color: "#0F172A",

                  fontSize: {
                    xs: "1.9rem",
                    sm: "2.2rem",
                  },

                  fontWeight: 900,

                  lineHeight: 1.15,

                  letterSpacing: "-.04em",
                }}
              >
                Welcome back
              </Typography>

              <Typography
                sx={{
                  mt: 1.2,

                  color: "#64748B",

                  fontSize: 14,

                  lineHeight: 1.65,
                }}
              >
                Enter your Account ID or registered email and password to
                continue.
              </Typography>
            </Box>

            {/* ERROR */}

            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  fontSize: 13,
                }}
              >
                {error}
              </Alert>
            )}

            {/* FORM */}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.3}>
                {/* ACCOUNT ID / EMAIL */}

                <Box>
                  <Typography
                    component="label"
                    htmlFor="login-identifier"
                    sx={{
                      display: "block",

                      mb: 0.8,

                      color: "#334155",

                      fontSize: 13,

                      fontWeight: 700,
                    }}
                  >
                    Account ID or Email
                  </Typography>

                  <TextField
                    id="login-identifier"
                    fullWidth
                    autoFocus
                    disabled={loading}
                    autoComplete="username"
                    value={identifier}
                    placeholder="ADM-0001 or admin@email.com"
                    onChange={(event) => {
                      setIdentifier(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AlternateEmailRounded
                            sx={{
                              color: "#94A3B8",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        minHeight: 55,

                        bgcolor: "#F8FAFC",

                        borderRadius: 3,

                        transition: "all .2s ease",

                        "& fieldset": {
                          borderColor: "#E2E8F0",
                        },

                        "&:hover fieldset": {
                          borderColor: "#94A3B8",
                        },

                        "&.Mui-focused": {
                          bgcolor: "#FFFFFF",

                          boxShadow: "0 0 0 4px rgba(5,150,105,.06)",
                        },

                        "&.Mui-focused fieldset": {
                          borderColor: "#059669",

                          borderWidth: "1.5px",
                        },
                      },
                    }}
                  />
                </Box>

                {/* PASSWORD */}

                <Box>
                  <Typography
                    component="label"
                    htmlFor="login-password"
                    sx={{
                      display: "block",

                      mb: 0.8,

                      color: "#334155",

                      fontSize: 13,

                      fontWeight: 700,
                    }}
                  >
                    Password
                  </Typography>

                  <TextField
                    id="login-password"
                    fullWidth
                    disabled={loading}
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Enter your password"
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined
                            sx={{
                              color: "#94A3B8",
                            }}
                          />
                        </InputAdornment>
                      ),

                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            type="button"
                            edge="end"
                            disabled={loading}
                            onClick={() =>
                              setShowPassword((previous) => !previous)
                            }
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        minHeight: 55,

                        bgcolor: "#F8FAFC",

                        borderRadius: 3,

                        transition: "all .2s ease",

                        "& fieldset": {
                          borderColor: "#E2E8F0",
                        },

                        "&:hover fieldset": {
                          borderColor: "#94A3B8",
                        },

                        "&.Mui-focused": {
                          bgcolor: "#FFFFFF",

                          boxShadow: "0 0 0 4px rgba(5,150,105,.06)",
                        },

                        "&.Mui-focused fieldset": {
                          borderColor: "#059669",

                          borderWidth: "1.5px",
                        },
                      },
                    }}
                  />
                </Box>

                {/* SUBMIT */}

                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForwardRounded />}
                  sx={{
                    minHeight: 55,

                    mt: 0.6,

                    bgcolor: "#047857",

                    borderRadius: 3,

                    color: "#FFFFFF",

                    fontSize: 15,

                    fontWeight: 800,

                    textTransform: "none",

                    boxShadow: "0 10px 25px rgba(5,150,105,.22)",

                    transition: "all .25s ease",

                    "&:hover": {
                      bgcolor: "#065F46",

                      transform: "translateY(-2px)",

                      boxShadow: "0 14px 32px rgba(5,150,105,.3)",
                    },

                    "&.Mui-disabled": {
                      bgcolor: "#9FD3C3",

                      color: "#FFFFFF",
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={20}
                        thickness={5}
                        sx={{
                          mr: 1.2,
                          color: "#FFFFFF",
                        }}
                      />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Stack>
            </Box>

            {/* SECURITY INFO */}

            <Box
              sx={{
                display: "flex",

                alignItems: "flex-start",

                gap: 1.2,

                mt: 3,

                p: 1.8,

                bgcolor: "#F0FDF4",

                border: "1px solid #D1FAE5",

                borderRadius: 3,
              }}
            >
              <SecurityRounded
                sx={{
                  mt: 0.1,

                  color: "#059669",

                  fontSize: 20,
                }}
              />

              <Box>
                <Typography
                  sx={{
                    color: "#334155",

                    fontSize: 12.5,

                    fontWeight: 750,
                  }}
                >
                  One secure login
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,

                    color: "#64748B",

                    fontSize: 11.5,

                    lineHeight: 1.55,
                  }}
                >
                  Your account role is automatically identified after successful
                  authentication.
                </Typography>
              </Box>
            </Box>

            {/* REGISTER */}

            <Box
              sx={{
                mt: 3.5,

                pt: 3,

                borderTop: "1px solid #F1F5F9",

                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: "#64748B",

                  fontSize: 12.5,
                }}
              >
                Don't have a client account?{" "}
                <Link
                  to="/register/client"
                  style={{
                    color: "#059669",

                    fontWeight: 800,

                    textDecoration: "none",
                  }}
                >
                  Create account
                </Link>
              </Typography>

              <Typography
                sx={{
                  mt: 1.5,

                  color: "#CBD5E1",

                  fontSize: 10.5,
                }}
              >
                © {new Date().getFullYear()} StoreHub • Convenience Store
                Management System
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
