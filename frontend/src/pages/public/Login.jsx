import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  CheckRounded,
  LockOutlined,
  SecurityRounded,
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

      // EXISTING AUTHENTICATION FLOW — PRESERVED
      const user = await login(cleanIdentifier, password);

      if (!user) {
        throw new Error("Unable to retrieve account information.");
      }

      const role = String(user.role || "").toLowerCase();

      // EXISTING FIRST-LOGIN FLOW — PRESERVED
      if (user.must_change_password) {
        navigate("/change-password", {
          replace: true,
        });
        return;
      }

      // EXISTING ROLE REDIRECTS — PRESERVED
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

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 54,
      borderRadius: "10px",
      bgcolor: "#FFFFFF",
      fontSize: "0.9rem",
      transition: "border-color .2s ease, box-shadow .2s ease",
      "& fieldset": {
        borderColor: "#D8E1DE",
      },
      "&:hover fieldset": {
        borderColor: "#91A9A2",
      },
      "&.Mui-focused": {
        boxShadow: "0 0 0 3px rgba(13, 110, 97, 0.08)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#0D6E61",
        borderWidth: "1.5px",
      },
    },
    "& input::placeholder": {
      color: "#A1ADA9",
      opacity: 1,
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#EEF3F1",
        display: "grid",
        placeItems: "center",
        px: { xs: 1.5, sm: 2.5 },
        py: { xs: 1.5, sm: 2.5 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1080,
          minHeight: { xs: "auto", md: 650 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.92fr 1.08fr" },
          overflow: "hidden",
          bgcolor: "#FFFFFF",
          border: "1px solid #DDE6E2",
          borderRadius: { xs: "18px", md: "22px" },
          boxShadow:
            "0 24px 65px rgba(28, 49, 43, 0.10), 0 3px 10px rgba(28, 49, 43, 0.04)",
        }}
      >
        {/* LEFT — EDITORIAL STORE IDENTITY */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            position: "relative",
            overflow: "hidden",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 5.5,
            color: "#F7FBF9",
            background:
              "linear-gradient(145deg, #153C35 0%, #0E5A4F 58%, #0B6B5D 100%)",
          }}
        >
          {/* architectural lines */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.08,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "100% 72px",
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 260,
              height: 260,
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "50%",
              right: -110,
              top: 120,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 170,
              height: 170,
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "50%",
              right: -65,
              top: 165,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "10px",
                  bgcolor: "#F8D978",
                  color: "#173C35",
                }}
              >
                <StorefrontRounded sx={{ fontSize: 22 }} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    letterSpacing: "-0.025em",
                    lineHeight: 1.05,
                  }}
                >
                  StoreHub
                </Typography>

                <Typography
                  sx={{
                    mt: 0.28,
                    color: "rgba(255,255,255,.57)",
                    fontSize: "0.62rem",
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                  }}
                >
                  Store Management Platform
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ mt: 8.5, maxWidth: 390 }}>
              <Typography
                sx={{
                  color: "#F8D978",
                  fontSize: "0.68rem",
                  fontWeight: 900,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                }}
              >
                Access Portal
              </Typography>

              <Typography
                component="h1"
                sx={{
                  mt: 1.7,
                  fontSize: "2.75rem",
                  lineHeight: 1.05,
                  fontWeight: 900,
                  letterSpacing: "-0.055em",
                }}
              >
                One workspace.
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: "rgba(255,255,255,.72)",
                  }}
                >
                  The right view for every role.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 2.2,
                  maxWidth: 350,
                  color: "rgba(255,255,255,.62)",
                  fontSize: "0.82rem",
                  lineHeight: 1.75,
                }}
              >
                StoreHub automatically routes each authorized account to the
                correct workspace after sign in.
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 4.5,
                flexWrap: "wrap",
                rowGap: 1,
              }}
            >
              {["ADMIN", "STAFF", "CLIENT"].map((role) => (
                <Box
                  key={role}
                  sx={{
                    px: 1.2,
                    py: 0.7,
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,.14)",
                    bgcolor: "rgba(255,255,255,.06)",
                    color: "rgba(255,255,255,.72)",
                    fontSize: "0.61rem",
                    fontWeight: 800,
                    letterSpacing: ".08em",
                  }}
                >
                  {role}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                width: "100%",
                maxWidth: 360,
                borderTop: "1px solid rgba(255,255,255,.15)",
                pt: 2,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityRounded
                  sx={{
                    color: "#F8D978",
                    fontSize: 17,
                  }}
                />

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.56)",
                    fontSize: "0.68rem",
                    lineHeight: 1.5,
                  }}
                >
                  Secure account access with automatic role recognition.
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* RIGHT — LOGIN WORKSPACE */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            bgcolor: "#FCFDFC",
            px: { xs: 2.2, sm: 5, md: 7 },
            py: { xs: 2.3, sm: 5 },
          }}
        >
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate("/")}
            sx={{
              position: { xs: "static", sm: "absolute" },
              top: 26,
              right: 30,
              mb: { xs: 2.2, sm: 0 },
              color: "#5F746E",
              textTransform: "none",
              fontSize: "0.72rem",
              fontWeight: 800,
              borderRadius: "9px",
              px: 1,
              "&:hover": {
                bgcolor: "#EFF6F3",
                color: "#0D6E61",
              },
            }}
          >
            Back to Store
          </Button>

          <Box sx={{ width: "100%", maxWidth: 420, mx: "auto" }}>
            {/* mobile brand */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                display: { xs: "flex", md: "none" },
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "9px",
                  bgcolor: "#143F37",
                  color: "#F8D978",
                }}
              >
                <StorefrontRounded sx={{ fontSize: 20 }} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: "#173E37",
                    fontSize: "1rem",
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  StoreHub
                </Typography>
                <Typography
                  sx={{
                    mt: 0.25,
                    color: "#90A09C",
                    fontSize: "0.58rem",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                  }}
                >
                  Access Portal
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "8px",
                  bgcolor: "#E7F3EF",
                  color: "#0D6E61",
                  fontSize: "0.65rem",
                  fontWeight: 900,
                }}
              >
                01
              </Box>

              <Typography
                sx={{
                  color: "#70837D",
                  fontSize: "0.67rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: ".11em",
                }}
              >
                Account sign in
              </Typography>
            </Box>

            <Typography
              sx={{
                color: "#173E37",
                fontSize: { xs: "1.8rem", sm: "2.15rem" },
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.05em",
              }}
            >
              Welcome back.
            </Typography>

            <Typography
              sx={{
                mt: 0.8,
                mb: 3,
                color: "#748680",
                fontSize: "0.8rem",
                lineHeight: 1.6,
              }}
            >
              Use your Account ID or registered email to continue to StoreHub.
            </Typography>

            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  mb: 2.2,
                  borderRadius: "10px",
                  fontSize: "0.74rem",
                  alignItems: "center",
                  "& .MuiAlert-message": {
                    py: 0.2,
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={1.8}>
                <Box>
                  <Typography
                    component="label"
                    htmlFor="login-identifier"
                    sx={{
                      display: "block",
                      mb: 0.6,
                      color: "#38564F",
                      fontSize: "0.71rem",
                      fontWeight: 800,
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
                    placeholder="ADM-0001 or name@email.com"
                    onChange={(event) => {
                      setIdentifier(event.target.value);
                      if (error) setError("");
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AlternateEmailRounded
                            sx={{
                              color: "#8EA19B",
                              fontSize: 19,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Box>

                <Box>
                  <Typography
                    component="label"
                    htmlFor="login-password"
                    sx={{
                      display: "block",
                      mb: 0.6,
                      color: "#38564F",
                      fontSize: "0.71rem",
                      fontWeight: 800,
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
                      if (error) setError("");
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined
                            sx={{
                              color: "#8EA19B",
                              fontSize: 19,
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
                            size="small"
                            sx={{ color: "#71847E" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputSx}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForwardRounded />}
                  sx={{
                    minHeight: 52,
                    mt: 0.4,
                    borderRadius: "10px",
                    bgcolor: "#143F37",
                    color: "#FFFFFF",
                    fontSize: "0.82rem",
                    fontWeight: 900,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#0D6E61",
                      boxShadow: "none",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#A6BDB7",
                      color: "#FFFFFF",
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={17}
                        thickness={5}
                        sx={{
                          mr: 1,
                          color: "#FFFFFF",
                        }}
                      />
                      Signing in...
                    </>
                  ) : (
                    "Continue to StoreHub"
                  )}
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                mt: 2.6,
                display: "flex",
                alignItems: "center",
                gap: 0.8,
              }}
            >
              <CheckRounded
                sx={{
                  fontSize: 16,
                  color: "#0D6E61",
                }}
              />
              <Typography
                sx={{
                  color: "#788B85",
                  fontSize: "0.66rem",
                }}
              >
                Your account role is identified automatically after sign in.
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 3.2,
                pt: 2.4,
                borderTop: "1px solid #E8EEEC",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={1.2}
              >
                <Typography
                  sx={{
                    color: "#7D8E89",
                    fontSize: "0.7rem",
                  }}
                >
                  Need a client account?
                </Typography>

                <Link
                  to="/register/client"
                  style={{
                    color: "#0D6E61",
                    fontSize: "0.7rem",
                    fontWeight: 900,
                    textDecoration: "none",
                  }}
                >
                  Create client account →
                </Link>
              </Stack>
            </Box>

            <Typography
              sx={{
                mt: 2.6,
                color: "#B1BCB8",
                fontSize: "0.58rem",
                letterSpacing: ".02em",
              }}
            >
              © {new Date().getFullYear()} StoreHub · Secure account access
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
