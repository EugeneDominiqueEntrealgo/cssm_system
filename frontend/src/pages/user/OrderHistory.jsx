import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Receipt, PointOfSale, LocalPrintshop } from '@mui/icons-material';
import API from '../../api/axios';
import { colors } from '../../theme';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await API.get('/transactions/my');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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

      {orders.length === 0 ? (
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
    </Box>
  );
};

export default OrderHistory;