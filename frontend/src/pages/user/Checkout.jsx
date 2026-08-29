import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  AddRounded,
  DeleteOutlineRounded,
  RemoveRounded,
  StorefrontRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useCart } from '../../contexts/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatPrice = (price) => `₱${Number(price || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const submitWalkInRequest = async () => {
    if (!items.length) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await API.post('/transactions/walk-in-request', {
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      });
      clearCart();
      setSuccess(response.data.message || 'Walk-in request submitted successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit walk-in request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1000, mx: 'auto', width: '100%' }}>
      <Typography sx={{ color: '#0F172A', fontSize: { xs: 28, md: 36 }, fontWeight: 900, mb: 0.6 }}>
        Walk-in Order
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Prepare your order now and pay at the store counter when you arrive.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid #A7F3D0', bgcolor: '#ECFDF5', borderRadius: 3 }}>
          <StorefrontRounded sx={{ fontSize: 52, color: '#059669', mb: 1 }} />
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#065F46' }}>Request submitted</Typography>
          <Typography sx={{ color: '#047857', mt: 0.8, mb: 2 }}>{success}</Typography>
          <Button variant="contained" onClick={() => navigate('/client/history')}>View Order History</Button>
        </Paper>
      )}

      {!success && !items.length && (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid #E2E8F0', borderRadius: 3 }}>
          <StorefrontRounded sx={{ fontSize: 52, color: '#94A3B8', mb: 1 }} />
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Your cart is empty</Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/client/dashboard')}>Browse Products</Button>
        </Paper>
      )}

      {!success && items.length > 0 && (
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 1 }}>Selected Products</Typography>
            {items.map((item) => (
              <Box key={item.id} sx={{ py: 1.7, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 750, color: '#0F172A' }}>{item.product.name}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 13 }}>{formatPrice(item.product.price)} each</Typography>
                </Box>
                <Stack direction="row" alignItems="center" sx={{ border: '1px solid #CBD5E1', borderRadius: 2 }}>
                  <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}><RemoveRounded fontSize="small" /></IconButton>
                  <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 800 }}>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}><AddRounded fontSize="small" /></IconButton>
                </Stack>
                <Typography sx={{ width: 82, textAlign: 'right', fontWeight: 800 }}>{formatPrice(item.product.price * item.quantity)}</Typography>
                <IconButton color="error" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.product.name}`}><DeleteOutlineRounded /></IconButton>
              </Box>
            ))}
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
              <Typography sx={{ fontWeight: 800 }}>Estimated Total</Typography>
              <Typography sx={{ color: '#047857', fontWeight: 900, fontSize: 20 }}>{formatPrice(total)}</Typography>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid #A7F3D0', bgcolor: '#F0FDF4', borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 800, color: '#065F46' }}>Pay in store</Typography>
            <Typography sx={{ color: '#047857', fontSize: 13.5, mt: 0.5 }}>
              This is a walk-in order request only. No online payment is collected. A cashier will confirm the order and accept payment at the counter.
            </Typography>
          </Paper>

          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.2}>
            <Button variant="outlined" onClick={() => navigate('/client/dashboard')}>Continue Shopping</Button>
            <Button variant="contained" disabled={submitting} onClick={submitWalkInRequest}>
              {submitting ? 'Submitting...' : 'Submit Walk-in Request'}
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default Checkout;
