import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";

import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CalendarMonthOutlined,
  CheckCircleRounded,
  EmailOutlined,
  HomeOutlined,
  LocalOfferOutlined,
  LockOutlined,
  PersonOutlineRounded,
  PhoneOutlined,
  SecurityRounded,
  ShoppingCartOutlined,
  StorefrontRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import API from "../../api/axios";
import { colors } from "../../theme";

const RegisterClient = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const benefits = [
    {
      icon: <ShoppingCartOutlined />,
      title: "Purchase History",
      description: "View your transactions and receipts anytime.",
    },
    {
      icon: <LocalOfferOutlined />,
      title: "Promotions",
      description: "Stay updated with available StoreHub deals.",
    },
    {
      icon: <SecurityRounded />,
      title: "Secure Account",
      description: "Your account is protected by secure access controls.",
    },
  ];

  const clearMessages = () => {
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName.trim()} ${
        middleName.trim() ? `${middleName.trim()} ` : ""
      }${lastName.trim()}`.trim();

      const response = await API.post("/auth/register/client", {
        name: fullName,
        first_name: firstName.trim(),
        middle_name: middleName.trim(),
        last_name: lastName.trim(),
        birthdate,
        gender,
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setSuccess(
        response?.data?.message ||
          "Account created successfully. Please wait for Admin approval.",
      );

      setFirstName("");
      setMiddleName("");
      setLastName("");
      setBirthdate("");
      setGender("");
      setAddress("");
      setPhone("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2200);
    } catch (err) {
      console.error("Registration failed:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    "& .MuiOutlinedInput-root": {
      minHeight: 54,
      borderRadius: 3,
      bgcolor: "#F8FAFC",
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
        py: { xs: 4, md: 6 },

        "@keyframes fadeUp": {
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
      {/* Background glow */}
      <Box
        sx={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          bgcolor: "rgba(5,150,105,.06)",
          top: -300,
          right: -170,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: "50%",
          bgcolor: "rgba(245,158,11,.06)",
          bottom: -220,
          left: -130,
        }}
      />

      {/* Back button */}
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate("/login")}
        sx={{
          position: "absolute",
          top: { xs: 15, md: 24 },
          left: { xs: 15, md: 30 },
          zIndex: 10,
          color: "#475569",
          bgcolor: "rgba(255,255,255,.78)",
          backdropFilter: "blur(10px)",
          border: "1px solid #E2E8F0",
          borderRadius: 3,
          px: 2,
          py: 0.8,
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
        Back to Login
      </Button>

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 2,
          mt: { xs: 7, md: 0 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1100,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: ".92fr 1.08fr",
            },
            bgcolor: "#FFFFFF",
            borderRadius: { xs: 4, md: 6 },
            overflow: "hidden",
            border: "1px solid rgba(226,232,240,.9)",
            boxShadow: "0 30px 80px rgba(15,23,42,.12)",
            animation: "fadeUp .55s ease",
          }}
        >
          {/* LEFT PANEL */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 760,
              position: "relative",
              overflow: "hidden",
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
                borderRadius: "50%",
                top: -170,
                right: -170,
                background:
                  "radial-gradient(circle, rgba(253,230,138,.18), transparent 70%)",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                width: 320,
                height: 320,
                borderRadius: "50%",
                bottom: -150,
                left: -120,
                background:
                  "radial-gradient(circle, rgba(167,243,208,.14), transparent 70%)",
              }}
            />

            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,.11)",
                    border: "1px solid rgba(255,255,255,.15)",
                    borderRadius: 3.5,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <StorefrontRounded
                    sx={{
                      color: "#FDE68A",
                      fontSize: 34,
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

              <Box sx={{ mt: 7 }}>
                <Chip
                  icon={
                    <CheckCircleRounded
                      sx={{
                        color: "#A7F3D0 !important",
                      }}
                    />
                  }
                  label="Client Registration"
                  sx={{
                    mb: 2.5,
                    color: "#FFFFFF",
                    bgcolor: "rgba(255,255,255,.09)",
                    border: "1px solid rgba(255,255,255,.12)",
                    fontWeight: 700,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "2.8rem",
                    fontWeight: 900,
                    lineHeight: 1.08,
                    letterSpacing: "-.05em",
                  }}
                >
                  Create your
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      color: "#FDE68A",
                    }}
                  >
                    StoreHub account.
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    mt: 2.5,
                    maxWidth: 410,
                    color: "rgba(255,255,255,.7)",
                    lineHeight: 1.75,
                    fontSize: 14.5,
                  }}
                >
                  Register as a client to access your purchase records,
                  receipts, promotions and account information.
                </Typography>
              </Box>

              <Stack spacing={2.2} sx={{ mt: 5 }}>
                {benefits.map((item) => (
                  <Box
                    key={item.title}
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
                      {item.icon}
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 750,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.15,
                          fontSize: 12,
                          color: "rgba(255,255,255,.55)",
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Box
                sx={{
                  mt: 5,
                  p: 2.4,
                  bgcolor: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 3.5,
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                  <SecurityRounded
                    sx={{
                      color: "#FDE68A",
                      mt: 0.2,
                    }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        fontWeight: 800,
                      }}
                    >
                      Admin approval required
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 11.5,
                        lineHeight: 1.6,
                        color: "rgba(255,255,255,.62)",
                      }}
                    >
                      Your account may remain pending until it is reviewed and
                      approved by the StoreHub Administrator.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Typography
              sx={{
                position: "relative",
                zIndex: 2,
                fontSize: 11,
                color: "rgba(255,255,255,.42)",
              }}
            >
              Secure client registration • StoreHub
            </Typography>
          </Box>

          {/* RIGHT FORM PANEL */}
          <Box
            sx={{
              px: {
                xs: 3,
                sm: 5,
                md: 6,
              },
              py: {
                xs: 4,
                md: 6,
              },
            }}
          >
            {/* Mobile brand */}
            <Stack
              direction="row"
              spacing={1.3}
              alignItems="center"
              sx={{
                display: { xs: "flex", md: "none" },
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
                    color: "#059669",
                    fontSize: 29,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#0F172A",
                  }}
                >
                  StoreHub
                </Typography>

                <Typography
                  sx={{
                    color: "#94A3B8",
                    fontSize: 11,
                  }}
                >
                  Client Registration
                </Typography>
              </Box>
            </Stack>

            <Typography
              sx={{
                color: "#059669",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: ".14em",
              }}
            >
              Create Client Account
            </Typography>

            <Typography
              component="h1"
              sx={{
                mt: 1,
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
              Tell us about yourself
            </Typography>

            <Typography
              sx={{
                mt: 1.2,
                mb: 3.5,
                color: "#64748B",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Complete the form below to request your StoreHub client account.
            </Typography>

            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  mb: 2.5,
                  borderRadius: 3,
                }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                icon={<CheckCircleRounded />}
                sx={{
                  mb: 2.5,
                  borderRadius: 3,
                }}
              >
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleRegister} noValidate>
              <Stack spacing={2}>
                {/* Name row */}
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                >
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    value={firstName}
                    disabled={loading}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearMessages();
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineRounded />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldStyle}
                  />

                  <TextField
                    fullWidth
                    label="Middle Name"
                    value={middleName}
                    disabled={loading}
                    onChange={(e) => {
                      setMiddleName(e.target.value);
                      clearMessages();
                    }}
                    sx={fieldStyle}
                  />
                </Stack>

                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  value={lastName}
                  disabled={loading}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearMessages();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineRounded />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />

                {/* Birthdate + Gender */}
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                >
                  <TextField
                    fullWidth
                    label="Birthdate"
                    type="date"
                    value={birthdate}
                    disabled={loading}
                    onChange={(e) => {
                      setBirthdate(e.target.value);
                      clearMessages();
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonthOutlined />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldStyle}
                  />

                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    value={gender}
                    disabled={loading}
                    onChange={(e) => {
                      setGender(e.target.value);
                      clearMessages();
                    }}
                    sx={fieldStyle}
                  >
                    <MenuItem value="">Prefer not to say</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Stack>

                {/* Address */}
                <TextField
                  fullWidth
                  label="Address"
                  value={address}
                  disabled={loading}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearMessages();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeOutlined />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />

                {/* Phone */}
                <TextField
                  fullWidth
                  label="Phone Number"
                  placeholder="09XXXXXXXXX"
                  value={phone}
                  disabled={loading}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearMessages();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlined />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />

                {/* Email */}
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email Address"
                  placeholder="client@email.com"
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearMessages();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />

                {/* Password */}
                <TextField
                  fullWidth
                  required
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={loading}
                  helperText="Minimum 6 characters"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearMessages();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          disabled={loading}
                          edge="end"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />

                {/* Confirm */}
                <TextField
                  fullWidth
                  required
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  disabled={loading}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearMessages();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          disabled={loading}
                          edge="end"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyle}
                />

                {/* Submit */}
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForwardRounded />}
                  sx={{
                    minHeight: 55,
                    mt: 1,
                    bgcolor: "#047857",
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: 15,
                    boxShadow: "0 10px 25px rgba(5,150,105,.22)",
                    transition: "all .25s ease",

                    "&:hover": {
                      bgcolor: "#065F46",
                      transform: "translateY(-2px)",
                      boxShadow: "0 14px 32px rgba(5,150,105,.30)",
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
                          color: "#FFFFFF",
                          mr: 1.2,
                        }}
                      />
                      Creating account...
                    </>
                  ) : (
                    "Create Client Account"
                  )}
                </Button>
              </Stack>
            </Box>

            <Typography
              sx={{
                mt: 3,
                textAlign: "center",
                color: "#64748B",
                fontSize: 12.5,
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: colors?.primary || "#059669",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterClient;
