import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert, Chip, Card, Grid, Avatar } from '@mui/material';
import { CheckCircle, Cancel, PersonAdd } from '@mui/icons-material';
import API from '../../api/axios';
import { colors } from '../../theme';

const ClientApprovals = () => {
  const [pendingClients, setPendingClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const response = await API.get('/admin/pending-clients');
      setPendingClients(response.data);
    } catch (error) {
      console.error('Failed to fetch pending clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/approve-staff/${id}`, { status: 'active' });
      showAlert('Client account approved!');
      fetchPending();
    } catch (error) {
      showAlert('Failed to approve client.', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/admin/approve-staff/${id}`, { status: 'rejected' });
      showAlert('Client account rejected successfully.', 'success');
      fetchPending();
    } catch (error) {
      showAlert('Failed to reject client.', 'error');
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" className="page-title" sx={{ mb: 1, fontWeight: 900 }}>
          Client Account Approvals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and approve pending client registration requests.
        </Typography>
      </Box>

      {/* Summary Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #00A896 0%, #00897B 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,168,150,0.25)',
              border: 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonAdd sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Pending Clients
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {pendingClients.length}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 3, borderRadius: 2.5, animation: 'fadeInUp 0.3s ease' }}>
          {alert.message}
        </Alert>
      )}

      {pendingClients.length === 0 ? (
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
            <PersonAdd sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h6" fontWeight={600} color="text.secondary">
            No pending client account requests.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            New client registrations will appear here for your approval.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: 'rgba(0,168,150,0.08)',
                  '& th': {
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#0F172A',
                    borderBottom: '2px solid rgba(0,168,150,0.2)',
                  },
                }}
              >
                <TableCell>User ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingClients.map((client, index) => (
                <TableRow
                  key={client.id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(0,168,150,0.04)',
                      transition: 'background-color 0.2s ease',
                    },
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'linear-gradient(135deg, #00A896 0%, #00897B 100%)',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                        }}
                      >
                        {client.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                        {client.user_id || `#${client.id}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#0F172A' }}>
                      {client.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      {client.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      {client.phone || <Chip label="N/A" size="small" variant="outlined" />}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                      {new Date(client.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleApprove(client.id)}
                        startIcon={<CheckCircle />}
                        sx={{
                          bgcolor: '#10b981',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          py: 0.75,
                          px: 2,
                          '&:hover': {
                            bgcolor: '#059669',
                            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                          },
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleReject(client.id)}
                        startIcon={<Cancel />}
                        sx={{
                          color: '#ef4444',
                          borderColor: '#fca5a5',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          py: 0.75,
                          px: 2,
                          '&:hover': {
                            bgcolor: '#fee2e2',
                            borderColor: '#ef4444',
                          },
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ClientApprovals;
