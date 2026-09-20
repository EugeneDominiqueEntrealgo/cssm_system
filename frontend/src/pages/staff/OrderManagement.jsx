import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircleRounded,
  CancelRounded,
  AddRounded,
  CheckRounded,
  DeleteOutlineRounded,
  HourglassTopRounded,
  PointOfSaleRounded,
  RemoveRounded,
  RefreshRounded,
  SearchRounded,
  ShoppingCartRounded,
  ImageNotSupportedRounded,
} from "@mui/icons-material";
import API from "../../api/axios";

const statusConfig = {
  pending: { label: "Pending", color: "warning", icon: <HourglassTopRounded fontSize="small" /> },
  cancelled: { label: "Cancelled", color: "default", icon: <CancelRounded fontSize="small" /> },
  approved: { label: "Completed", color: "success", icon: <CheckCircleRounded fontSize="small" /> },
};

const OrderManagement = () => {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError("");
      const [pendingResponse, cancelledResponse, transactionsResponse, clientsResponse, productsResponse] = await Promise.all([
        API.get("/transactions/walk-in-requests/pending"),
        API.get("/transactions/walk-in-requests/cancelled"),
        API.get("/transactions"),
        API.get("/users?role=client"),
        API.get("/products?active=true"),
      ]);
      setPendingOrders(Array.isArray(pendingResponse.data) ? pendingResponse.data : []);
      setCancelledOrders(Array.isArray(cancelledResponse.data) ? cancelledResponse.data : []);
      setCompletedOrders(Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []);
      setClients(Array.isArray(clientsResponse.data) ? clientsResponse.data.filter((client) => client.status === "active") : []);
      setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load order management data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const refreshTimer = setInterval(() => loadOrders(true), 10000);
    return () => clearInterval(refreshTimer);
  }, [loadOrders]);

  const formatPrice = (price) => `₱${Number(price || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const query = search.trim().toLowerCase();
  const matchingClients = clients
    .filter((client) => !query || String(client.name || "").toLowerCase().includes(query))
    .sort((first, second) => String(first.name || "").localeCompare(String(second.name || "")));

  const selectedClient = clients.find((client) => String(client.id) === String(selectedClientId));
  const getClientIdentifier = (client) => client.user_id || client.email || `ID ${client.id}`;
  const total = orderItems.reduce((sum, item) => {
    const product = products.find((candidate) => String(candidate.id) === String(item.product_id));
    return sum + Number(product?.price || 0) * Number(item.quantity || 0);
  }, 0);

  const completedMatches = completedOrders.filter((order) => {
    if (!query) return false;
    const matchingIds = matchingClients.map((client) => String(client.id));
    return matchingIds.includes(String(order.user_id));
  });

  const removeProduct = (index) => setOrderItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const changeProduct = (index, field, value) => setOrderItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: field === "product_id" ? value : Math.max(1, Number(value) || 1) } : item));
  const addToOrder = (product) => {
    if (!selectedClientId || Number(product.stock) <= 0) return;
    setOrderItems((current) => {
      const existing = current.find((item) => String(item.product_id) === String(product.id));
      if (existing) {
        return current.map((item) => String(item.product_id) === String(product.id)
          ? { ...item, quantity: Math.min(Number(item.quantity) + 1, Number(product.stock)) }
          : item);
      }
      return [...current, { product_id: String(product.id), quantity: 1 }];
    });
    setAddedProductId(String(product.id));
    window.setTimeout(() => setAddedProductId((current) => current === String(product.id) ? null : current), 1100);
  };

  const cartQuantity = orderItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const getProductImage = (product) => product.image_url || product.image || "";

  const submitGuidedOrder = async () => {
    if (!selectedClientId) return setError("Select a registered client first.");
    if (!orderItems.length || orderItems.some((item) => !item.product_id)) return setError("Add at least one product to the order.");
    const seen = new Set();
    for (const item of orderItems) {
      if (seen.has(String(item.product_id))) return setError("Use one row per product and adjust its quantity.");
      seen.add(String(item.product_id));
      const product = products.find((candidate) => String(candidate.id) === String(item.product_id));
      if (!product || Number(item.quantity) > Number(product.stock)) return setError(`Insufficient stock for ${product?.name || "the selected product"}.`);
    }
    try {
      setCreatingOrder(true);
      setError("");
      await API.post("/transactions/walk-in-request/staff", { user_id: Number(selectedClientId), items: orderItems.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })) });
      setOrderItems([]);
      await loadOrders(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create the pending order.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const sections = useMemo(() => [
    { title: "Pending Orders", orders: pendingOrders, status: "pending" },
    { title: "Cancelled Orders", orders: cancelledOrders, status: "cancelled" },
    { title: "Completed Orders", orders: completedMatches, status: "approved" },
  ], [pendingOrders, cancelledOrders, completedMatches]);

  if (loading) {
    return <Box sx={{ minHeight: 420, display: "grid", placeItems: "center" }}><CircularProgress sx={{ color: "#0F766E" }} /></Box>;
  }

  return (
    <Box className="page-container" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ color: "#0F172A", fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 900, letterSpacing: "-.04em" }}>
            Order Management
          </Typography>
          <Typography sx={{ mt: 0.6, color: "#64748B", fontSize: 14 }}>
            Find a registered client, guide the order, then send it to Receipts for payment.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={refreshing ? <CircularProgress size={18} /> : <RefreshRounded />} onClick={() => loadOrders(true)} disabled={refreshing} sx={{ alignSelf: { xs: "flex-start", md: "center" }, borderRadius: 2.5, textTransform: "none", fontWeight: 800 }}>
          Refresh Orders
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #E2E8F0", borderRadius: 3 }}>
        <TextField fullWidth placeholder="Search registered client by name..." value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ color: "#64748B" }} /></InputAdornment> }} />
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, mb: 3, border: "1px solid #CCFBF1", borderRadius: 3, bgcolor: "#F0FDFA" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
          <Box><Typography sx={{ fontSize: 17, fontWeight: 900, color: "#134E4A" }}>1. Choose a registered client</Typography><Typography sx={{ mt: 0.4, color: "#0F766E", fontSize: 13 }}>Search by name, then guide the client through the product choices.</Typography></Box>
          {selectedClient && <Chip label={`Selected: ${selectedClient.name} · ${getClientIdentifier(selectedClient)}`} onDelete={() => { setSelectedClientId(""); setOrderItems([]); }} sx={{ alignSelf: { xs: "flex-start", md: "center" }, bgcolor: "#FFFFFF", color: "#0F766E", fontWeight: 800 }} />}
        </Stack>
        {!matchingClients.length ? <Typography sx={{ color: "#64748B", fontSize: 13 }}>No registered client matches this name.</Typography> : <Grid container spacing={1.2}>{matchingClients.map((client) => <Grid item xs={12} sm={6} md={4} key={client.id}><Button fullWidth variant={String(selectedClientId) === String(client.id) ? "contained" : "outlined"} onClick={() => setSelectedClientId(String(client.id))} sx={{ minHeight: 64, justifyContent: "flex-start", textAlign: "left", textTransform: "none", borderRadius: 2, fontWeight: 800, px: 1.5 }}><Box sx={{ minWidth: 0 }}><Typography sx={{ fontWeight: 850, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{client.name || "Unnamed client"}</Typography><Typography sx={{ mt: 0.2, fontSize: 11, fontWeight: 700, opacity: 0.78, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getClientIdentifier(client)}</Typography></Box></Button></Grid>)}</Grid>}
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.7fr) minmax(300px, .8fr)" }, gap: 2.5, alignItems: "start", mb: 3 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: "1px solid #E2E8F0", borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.8 }}><Box><Typography sx={{ fontSize: 17, fontWeight: 900 }}>2. Choose products</Typography><Typography sx={{ color: "#64748B", fontSize: 13 }}>{selectedClient ? `Building an order for ${selectedClient.name}` : "Select a client first to start an order."}</Typography></Box><Chip label={`${cartQuantity} item${cartQuantity === 1 ? "" : "s"}`} icon={<ShoppingCartRounded />} size="small" sx={{ fontWeight: 800 }} /></Stack>
          {!products.length ? <Typography sx={{ py: 3, color: "#94A3B8", textAlign: "center" }}>No active products available.</Typography> : <Grid container spacing={1.8}>{products.map((product) => { const image = getProductImage(product); const isAdded = addedProductId === String(product.id); const outOfStock = Number(product.stock) <= 0; return <Grid item xs={12} sm={6} md={4} key={product.id}><Card sx={{ height: "100%", border: "1px solid #E2E8F0", borderRadius: 2.5, overflow: "hidden", transition: "transform .2s ease, box-shadow .2s ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 24px rgba(15,23,42,.08)" } }}><Box sx={{ height: { xs: 150, sm: 135 }, bgcolor: "#F1F5F9", position: "relative", overflow: "hidden" }}>{image ? <Box component="img" src={image} alt={product.name} sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .35s ease", "&:hover": { transform: "scale(1.05)" } }} onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextSibling.style.display = "flex"; }} /> : null}<Stack sx={{ display: image ? "none" : "flex", position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", color: "#94A3B8" }}><ImageNotSupportedRounded /><Typography sx={{ fontSize: 11 }}>No image</Typography></Stack><Chip label={outOfStock ? "Out of stock" : `${product.stock} in stock`} size="small" sx={{ position: "absolute", top: 8, left: 8, fontWeight: 800, bgcolor: "rgba(255,255,255,.9)", color: outOfStock ? "#B91C1C" : "#047857" }} /></Box><CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}><Typography sx={{ fontWeight: 850, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</Typography><Typography sx={{ color: "#0F766E", fontWeight: 900, mt: .35 }}>{formatPrice(product.price)}</Typography><Button fullWidth size="small" variant={isAdded ? "contained" : "outlined"} startIcon={isAdded ? <CheckRounded /> : <AddRounded />} disabled={!selectedClient || outOfStock} onClick={() => addToOrder(product)} sx={{ mt: 1.2, textTransform: "none", fontWeight: 800, borderRadius: 1.8, ...(isAdded ? { bgcolor: "#0F766E" } : {}) }}>{isAdded ? "Added" : selectedClient ? "Add to order" : "Select client first"}</Button></CardContent></Card></Grid>; })}</Grid>}
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: "1px solid #E2E8F0", borderRadius: 3, position: { lg: "sticky" }, top: { lg: 20 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography sx={{ fontSize: 17, fontWeight: 900 }}>3. Review order</Typography><Typography sx={{ color: "#64748B", fontSize: 13 }}>Pending until payment at Receipts.</Typography></Box><ShoppingCartRounded sx={{ color: "#0F766E" }} /></Stack>
          {!orderItems.length ? <Typography sx={{ py: 4, color: "#94A3B8", textAlign: "center", fontSize: 13 }}>Your guided order is empty.</Typography> : <Stack spacing={1.2} sx={{ mt: 2 }}>{orderItems.map((item, index) => { const product = products.find((candidate) => String(candidate.id) === String(item.product_id)); return <Box key={`${item.product_id}-${index}`} sx={{ p: 1.2, bgcolor: "#F8FAFC", borderRadius: 2 }}><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product?.name || "Product"}</Typography><Typography sx={{ color: "#64748B", fontSize: 12 }}>{formatPrice(product?.price)} each</Typography></Box><IconButton size="small" onClick={() => changeProduct(index, "quantity", Number(item.quantity) - 1)} disabled={Number(item.quantity) <= 1}><RemoveRounded fontSize="small" /></IconButton><Typography sx={{ fontWeight: 800 }}>{item.quantity}</Typography><IconButton size="small" onClick={() => changeProduct(index, "quantity", Math.min(Number(item.quantity) + 1, Number(product?.stock || 1)))} disabled={!product || Number(item.quantity) >= Number(product.stock)}><AddRounded fontSize="small" /></IconButton><IconButton size="small" color="error" onClick={() => removeProduct(index)} aria-label="Remove product"><DeleteOutlineRounded fontSize="small" /></IconButton></Stack><Typography sx={{ mt: .5, textAlign: "right", fontWeight: 850 }}>{formatPrice(Number(product?.price || 0) * Number(item.quantity || 0))}</Typography></Box>; })}</Stack>}
          <Divider sx={{ my: 2 }} /><Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}><Typography sx={{ fontWeight: 900 }}>Estimated total</Typography><Typography sx={{ color: "#0F766E", fontWeight: 900, fontSize: 18 }}>{formatPrice(total)}</Typography></Stack><Button fullWidth variant="contained" disabled={creatingOrder || !selectedClient || !orderItems.length} onClick={submitGuidedOrder} sx={{ bgcolor: "#0F766E", textTransform: "none", fontWeight: 800, py: 1.1 }}>{creatingOrder ? "Saving..." : "Save Pending Order"}</Button>
        </Paper>
      </Box>

      <Grid container spacing={2.5}>
        {sections.map((section) => {
          const config = statusConfig[section.status];
          return (
            <Grid item xs={12} key={section.title}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: "1px solid #E2E8F0", borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center"><ShoppingCartRounded sx={{ color: "#0F766E" }} /><Typography sx={{ fontSize: 17, fontWeight: 900 }}>{section.title}</Typography></Stack>
                  <Chip label={section.orders.length} color={config.color} size="small" sx={{ fontWeight: 800 }} />
                </Stack>
                {section.orders.length === 0 ? (
                  <Typography sx={{ py: 2, color: "#94A3B8", fontSize: 13 }}>{section.status === "approved" && !query ? "Search a registered client to view completed orders." : query ? "No matching orders." : "No orders in this section."}</Typography>
                ) : (
                  <Stack spacing={1}>
                    {section.orders.map((order) => {
                      const items = Array.isArray(order.data?.items) ? order.data.items : [];
                      const customer = order.submitted_by_name || order.user_name || "Walk-in Customer";
                      return (
                        <Box key={`${section.status}-${order.id}`} sx={{ p: 1.6, border: "1px solid #F1F5F9", borderRadius: 2.5, bgcolor: "#FAFCFB" }}>
                          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center"><Typography sx={{ fontWeight: 850 }}>#{order.id || order.receipt_number}</Typography><Chip icon={config.icon} label={config.label} color={config.color} size="small" sx={{ fontWeight: 750 }} /></Stack>
                              <Typography sx={{ mt: 0.5, color: "#334155", fontSize: 13, fontWeight: 700 }}>{customer}</Typography>
                              <Typography sx={{ mt: 0.3, color: "#64748B", fontSize: 12 }}>{items.length ? items.map((item) => `${item.name || item.product_name || "Product"} x${item.quantity}`).join(", ") : `Receipt ${order.receipt_number || "—"}`}</Typography>
                            </Box>
                            <Stack direction={{ xs: "row", md: "column" }} spacing={1} alignItems={{ xs: "center", md: "flex-end" }}>
                              <Typography sx={{ color: "#64748B", fontSize: 11 }}>{new Date(order.reviewed_at || order.created_at || Date.now()).toLocaleString("en-PH")}</Typography>
                              {section.status === "pending" && <Button size="small" variant="contained" startIcon={<PointOfSaleRounded />} onClick={() => navigate("/staff/receipts")} sx={{ bgcolor: "#0F766E", textTransform: "none", fontWeight: 800, borderRadius: 2 }}>Process in Receipts</Button>}
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default OrderManagement;
