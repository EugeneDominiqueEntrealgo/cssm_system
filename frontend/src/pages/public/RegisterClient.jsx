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
} from "@mui/material";

import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CalendarMonthOutlined,
  CheckCircleRounded,
  EmailOutlined,
  HomeOutlined,
  LockOutlined,
  PersonOutlineRounded,
  PhoneOutlined,
  SecurityRounded,
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
      minHeight: 50,
      borderRadius: "10px",
      bgcolor: "#FFFFFF",
      fontSize: "0.82rem",
      transition: "border-color .2s ease, box-shadow .2s ease",

      "& fieldset": {
        borderColor: "#DDE6E2",
      },

      "&:hover fieldset": {
        borderColor: "#A9BBB4",
      },

      "&.Mui-focused": {
        boxShadow: "0 0 0 3px rgba(15,118,110,.07)",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#0F766E",
        borderWidth: "1.5px",
      },
    },

    "& .MuiInputLabel-root": {
      fontSize: "0.8rem",
    },

    "& .MuiFormHelperText-root": {
      mx: 0,
      mt: 0.55,
      fontSize: "0.64rem",
      color: "#879690",
    },

    "& .MuiInputAdornment-root svg": {
      fontSize: 19,
      color: "#879690",
    },
  };

  return (
    <Box
      sx={{
        minHeight: { xs: "100vh", md: "calc(100vh - 70px)" },
        bgcolor: "#F4F7F6",
        display: "flex",
        alignItems: "center",
        py: { xs: 2, sm: 3, md: 3.5 },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 1.4, sm: 2.5 },
        }}
      >
        <Box
          sx={{
            maxWidth: 980,
            mx: "auto",
            bgcolor: "#FFFFFF",
            border: "1px solid #DFE7E4",
            borderRadius: { xs: "16px", md: "20px" },
            boxShadow:
              "0 20px 55px rgba(31,58,50,.09), 0 2px 8px rgba(31,58,50,.03)",
            overflow: "hidden",
          }}
        >
          {/* ================= TOP BAR ================= */}
          <Box
            sx={{
              minHeight: 64,
              px: { xs: 1.6, sm: 2.2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              borderBottom: "1px solid #E7ECEA",
              bgcolor: "#FBFCFC",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "10px",
                  bgcolor: "#173F37",
                  color: "#F8D978",
                }}
              >
                <StorefrontRounded sx={{ fontSize: 20 }} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: "#173D36",
                    fontSize: "0.9rem",
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  StoreHub
                </Typography>

                <Typography
                  sx={{
                    mt: 0.2,
                    color: "#8D9A96",
                    fontSize: "0.56rem",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Client Registration
                </Typography>
              </Box>
            </Stack>

            <Button
              startIcon={<ArrowBackRounded />}
              onClick={() => navigate("/login")}
              sx={{
                minHeight: 34,
                px: 1.2,
                borderRadius: "9px",
                color: "#60736D",
                textTransform: "none",
                fontSize: "0.68rem",
                fontWeight: 800,
                "&:hover": {
                  bgcolor: "#EEF4F2",
                  color: "#0F766E",
                },
              }}
            >
              Back to Login
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "310px minmax(0, 1fr)",
              },
            }}
          >
            {/* ================= INFO RAIL ================= */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "space-between",
                p: 3.2,
                color: "#FFFFFF",
                background:
                  "linear-gradient(160deg, #173F37 0%, #0F5E53 58%, #0F766E 100%)",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: "#F8D978",
                    fontSize: "0.62rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: ".12em",
                  }}
                >
                  New Client
                </Typography>

                <Typography
                  sx={{
                    mt: 1.2,
                    fontSize: "1.65rem",
                    lineHeight: 1.08,
                    fontWeight: 900,
                    letterSpacing: "-.04em",
                  }}
                >
                  Create your StoreHub account
                </Typography>

                <Typography
                  sx={{
                    mt: 1.5,
                    color: "rgba(255,255,255,.64)",
                    fontSize: "0.72rem",
                    lineHeight: 1.7,
                  }}
                >
                  Complete your account details to request client access.
                </Typography>

                <Stack spacing={1.25} sx={{ mt: 3 }}>
                  {[
                    "View purchase and order history",
                    "Access your StoreHub profile",
                    "Receive account access after approval",
                  ].map((item) => (
                    <Stack
                      key={item}
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <CheckCircleRounded
                        sx={{
                          mt: 0.05,
                          color: "#F8D978",
                          fontSize: 16,
                        }}
                      />

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,.74)",
                          fontSize: "0.68rem",
                          lineHeight: 1.45,
                        }}
                      >
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Box
                sx={{
                  mt: 4,
                  pt: 2,
                  borderTop: "1px solid rgba(255,255,255,.13)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <SecurityRounded
                    sx={{
                      color: "#F8D978",
                      fontSize: 17,
                    }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.69rem",
                        fontWeight: 800,
                      }}
                    >
                      Admin approval required
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.35,
                        color: "rgba(255,255,255,.56)",
                        fontSize: "0.61rem",
                        lineHeight: 1.5,
                      }}
                    >
                      Your account may remain pending until reviewed by the
                      StoreHub Administrator.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* ================= FORM ================= */}
            <Box
              sx={{
                p: {
                  xs: 1.7,
                  sm: 2.5,
                  md: 3.2,
                },
              }}
            >
              <Box sx={{ mb: 2.3 }}>
                <Typography
                  sx={{
                    color: "#173D36",
                    fontSize: { xs: "1.35rem", sm: "1.55rem" },
                    lineHeight: 1.1,
                    fontWeight: 900,
                    letterSpacing: "-.035em",
                  }}
                >
                  Create client account
                </Typography>

                <Typography
                  sx={{
                    mt: 0.55,
                    color: "#7D8C87",
                    fontSize: "0.71rem",
                    lineHeight: 1.55,
                  }}
                >
                  Enter your personal and account information below.
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError("")}
                  sx={{
                    mb: 1.7,
                    borderRadius: "10px",
                    fontSize: "0.72rem",
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
                    mb: 1.7,
                    borderRadius: "10px",
                    fontSize: "0.72rem",
                  }}
                >
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={handleRegister} noValidate>
                <Stack spacing={1.35}>
                  {/* Name */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                      },
                      gap: 1.2,
                    }}
                  >
                    <TextField
                      fullWidth
                      required
                      size="small"
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
                      size="small"
                      label="Middle Name"
                      value={middleName}
                      disabled={loading}
                      onChange={(e) => {
                        setMiddleName(e.target.value);
                        clearMessages();
                      }}
                      sx={fieldStyle}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    required
                    size="small"
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
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                      },
                      gap: 1.2,
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Birthdate"
                      type="date"
                      value={birthdate}
                      disabled={loading}
                      onChange={(e) => {
                        setBirthdate(e.target.value);
                        clearMessages();
                      }}
                      InputLabelProps={{ shrink: true }}
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
                      size="small"
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
                  </Box>

                  {/* Address + Phone */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1.2fr .8fr",
                      },
                      gap: 1.2,
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
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

                    <TextField
                      fullWidth
                      size="small"
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
                  </Box>

                  <TextField
                    fullWidth
                    required
                    size="small"
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

                  {/* Passwords */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                      },
                      gap: 1.2,
                    }}
                  >
                    <TextField
                      fullWidth
                      required
                      size="small"
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
                              size="small"
                              onClick={() =>
                                setShowPassword((prev) => !prev)
                              }
                            >
                              {showPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldStyle}
                    />

                    <TextField
                      fullWidth
                      required
                      size="small"
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
                              size="small"
                              onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                              }
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldStyle}
                    />
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    endIcon={loading ? null : <ArrowForwardRounded />}
                    sx={{
                      minHeight: 46,
                      mt: 0.4,
                      borderRadius: "10px",
                      bgcolor: "#173F37",
                      color: "#FFFFFF",
                      textTransform: "none",
                      fontSize: "0.79rem",
                      fontWeight: 900,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "#0F766E",
                        boxShadow: "none",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "#A6BBB4",
                        color: "#FFFFFF",
                      },
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress
                          size={16}
                          thickness={5}
                          sx={{
                            mr: 1,
                            color: "#FFFFFF",
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
                  mt: 2.1,
                  textAlign: "center",
                  color: "#7B8A85",
                  fontSize: "0.68rem",
                }}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: colors?.primary || "#0F766E",
                    textDecoration: "none",
                    fontWeight: 900,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterClient;
