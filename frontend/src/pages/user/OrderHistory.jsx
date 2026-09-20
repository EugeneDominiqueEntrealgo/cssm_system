import React, { useState, useEffect } from 'react';
import { Alert, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Receipt, PointOfSale, LocalPrintshop, CancelOutlined } from '@mui/icons-material';
import API from '../../api/axios';
import { colors } from '../../theme';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [walkInRequests, setWalkInRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ severity: '', message: '' });
  const [cancelRequest, setCancelRequest] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [ordersResponse, requestsResponse] = await Promise.all([
          API.get('/transactions/my'),
          API.get('/transactions/walk-in-requests/my'),
        ]);
        setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
        setWalkInRequests(Array.isArray(requestsResponse.data) ? requestsResponse.data : []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setNotice({ severity: 'error', message: error.response?.data?.message || 'Failed to load order history.' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelRequest = async () => {
    if (!cancelRequest) return;
    setCancelling(true);
    try {
      await API.post(`/transactions/walk-in-requests/${cancelRequest.id}/cancel`);
      setWalkInRequests((current) => current.map((request) => (
        request.id === cancelRequest.id ? { ...request, status: 'cancelled' } : request
      )));
      setNotice({ severity: 'success', message: 'Order cancelled successfully.' });
      setCancelRequest(null);
    } catch (error) {
      setNotice({ severity: 'error', message: error.response?.data?.message || 'Unable to cancel this order.' });
    } finally {
      setCancelling(false);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await API.get(`/transactions/${id}`);
      setSelectedOrder(response.data);
      setViewDialog(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const formatPrice = (price) => `₱${parseFloat(price).toFixed(2)}`;

  // Additive: Print a clean thermal-style receipt (does not alter data)
  const handlePrint = () => {
    const t = selectedOrder;
    if (!t) return;

    const lines = (t.items || [])
      .map((item) => {
        const name = item.product_name || 'Item';
        const qty = Number(item.quantity || 0);
        const price = Number(item.subtotal ?? t.total_amount ?? 0);
        return `
          <tr>
            <td>${name} x${qty}</td>
            <td style="text-align:right">${formatPrice(price)}</td>
          </tr>`;
      })
      .join('');

    const win = window.open('', '_blank', 'width=420,height=600');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Receipt ${t.receipt_number || ''}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Courier New', monospace;
              color: #111827; background: #fff; width: 300px; margin: 0 auto; padding: 24px 8px;
            }
            .center { text-align: center; }
            .store { font-size: 18px; font-weight: 700; letter-spacing: 1px; }
            .muted { color: #4B5563; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 3px 0; font-size: 12px; vertical-align: top; }
            @media print { body { width: 300px; } }
          </style>
        </head>
        <body>
          <div class="center"><div class="store">STOREHUB</div><div class="muted">Sari-Sari Store</div></div>
          <div style="border-top:1px dashed #374151;margin:10px 0"></div>
          <table>
            <tr><td class="muted">Receipt#</td><td style="text-align:right">${t.receipt_number || '—'}</td></tr>
            <tr><td class="muted">Date</td><td style="text-align:right">${new Date(t.created_at).toLocaleString('en-PH')}</td></tr>
            <tr><td class="muted">Staff</td><td style="text-align:right">${t.staff_name || '—'}</td></tr>
            <tr><td class="muted">Payment</td><td style="text-align:right">${t.payment_method || '—'}</td></tr>
          </table>
          <div style="border-top:1px dashed #374151;margin:10px 0"></div>
          <table>${lines}</table>
          <div style="border-top:1px dashed #374151;margin:10px 0"></div>
          <table>
            <tr style="font-weight:700">
              <td>TOTAL</td>
              <td style="text-align:right">${formatPrice(t.total_amount)}</td>
            </tr>
          </table>
          <div class="center muted" style="margin-top:14px">Thank you for shopping at StoreHub!</div>
          <div class="center muted">Please keep this receipt for reference.</div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        <CircularProgress size={48} sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Box className="page-container">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" className="page-title" sx={{ mb: 1 }}>
          Order History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View all your past purchases and receipts.
        </Typography>
      </Box>

      {notice.message && (
        <Alert severity={notice.severity} onClose={() => setNotice({ severity: '', message: '' })} sx={{ mb: 2 }}>
          {notice.message}
        </Alert>
      )}

      {walkInRequests.length > 0 && (
        <Paper sx={{ mb: 3, p: 2.5, borderRadius: 3, border: '1px solid #FDE68A', bgcolor: '#FFFBEB' }}>
          <Typography variant="h6" sx={{ color: '#92400E', fontWeight: 800, mb: 1.5 }}>
            Walk-in Order Requests
          </Typography>
          {walkInRequests.map((request) => {
            const isPending = request.status === 'pending';
            const items = Array.isArray(request.data?.items) ? request.data.items : [];
            return (
              <Box key={request.id} sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, py: 1.25, borderTop: '1px solid #FDE68A', flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>Request #{request.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {items.length} product type(s) · {new Date(request.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={request.status} size="small" color={isPending ? 'warning' : request.status === 'cancelled' ? 'default' : 'success'} sx={{ textTransform: 'capitalize', fontWeight: 700 }} />
                  {isPending && (
                    <Button size="small" color="error" variant="outlined" startIcon={<CancelOutlined />} onClick={() => setCancelRequest(request)}>
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })}
        </Paper>
      )}

      {orders.length === 0 && walkInRequests.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(0,168,150,0.04) 0%, rgba(252,163,17,0.04) 100%)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <Box
            sx={{
              bgcolor: 'rgba(0,168,150,0.1)',
              borderRadius: 3,
              p: 2,
              display: 'inline-flex',
              mb: 2,
              color: colors.primary,
            }}
          >
            <Receipt sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h6" fontWeight={600} color="text.secondary">No orders yet.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Visit our store to make a purchase! Your receipts will appear here.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Receipt #</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ bgcolor: 'rgba(252,163,17,0.1)', borderRadius: 1.5, p: 0.5, display: 'flex', color: colors.secondary }}>
                        <PointOfSale fontSize="small" />
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {order.receipt_number}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{order.staff_name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} sx={{ color: colors.primary }}>
                      {formatPrice(order.total_amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.payment_method}
                      size="small"
                      color={order.payment_method === 'cash' ? 'success' : 'primary'}
                      sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleView(order.id)} startIcon={<Receipt />}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Receipt Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>{selectedOrder.receipt_number}</Typography>
              <Typography variant="body2">Date: {new Date(selectedOrder.created_at).toLocaleString()}</Typography>
              <Typography variant="body2">Staff: {selectedOrder.staff_name}</Typography>
              <Typography variant="body2">Payment: {selectedOrder.payment_method}</Typography>
              {selectedOrder.tendered_amount !== null && selectedOrder.tendered_amount !== undefined && (
                <>
                  <Typography variant="body2">Tendered: {formatPrice(selectedOrder.tendered_amount)}</Typography>
                  <Typography variant="body2">Change: {formatPrice(selectedOrder.change_amount)}</Typography>
                </>
              )}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Items:</Typography>
                {selectedOrder.items?.map((item, idx) => (
                  <Box key={idx} className="receipt-item">
                    <Typography variant="body2">{item.product_name} x{item.quantity}</Typography>
                    <Typography variant="body2">{formatPrice(item.subtotal)}</Typography>
                  </Box>
                ))}
              </Box>
              <Box className="receipt-total">
                <Typography variant="h6">Total: {formatPrice(selectedOrder.total_amount)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<LocalPrintshop />}
            onClick={handlePrint}
            disabled={!selectedOrder}
          >
            Print
          </Button>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(cancelRequest)} onClose={() => !cancelling && setCancelRequest(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel this order?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will cancel the pending walk-in request. You can no longer ask the cashier to complete it.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelRequest(null)} disabled={cancelling}>Keep Order</Button>
          <Button color="error" variant="contained" onClick={handleCancelRequest} disabled={cancelling}>
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderHistory;