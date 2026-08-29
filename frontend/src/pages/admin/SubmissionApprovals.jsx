import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { CheckCircle, Cancel, Visibility, Description } from '@mui/icons-material';
import API from '../../api/axios';
import { colors } from '../../theme';

const SubmissionApprovals = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await API.get('/admin/pending-submissions');
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/approve-submission/${id}`, { status: 'approved', admin_notes: adminNotes });
      showAlert('Submission approved!');
      setViewDialog(false);
      setAdminNotes('');
      fetchSubmissions();
    } catch (error) {
      showAlert('Failed to approve submission.', 'error');
    }
  };

  const handleReject = async (id) => {
    const notes = prompt('Enter rejection reason (optional):');
    try {
      await API.put(`/admin/approve-submission/${id}`, { status: 'rejected', admin_notes: notes || '' });
      showAlert('Submission rejected.');
      fetchSubmissions();
    } catch (error) {
      showAlert('Failed to reject submission.', 'error');
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  const getTypeChip = (type) => {
    const typeColors = { product: 'primary', promo: 'secondary', stock_update: 'warning', password_reset: 'error' };
    return (
      <Chip
        label={type.replace('_', ' ')}
        color={typeColors[type] || 'default'}
        size="small"
        sx={{ fontWeight: 600, textTransform: 'capitalize' }}
      />
    );
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
          Submission Approvals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and approve staff submissions for products and promos.
        </Typography>
      </Box>

      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2, borderRadius: 2, animation: 'fadeInUp 0.3s ease' }}>
          {alert.message}
        </Alert>
      )}

      {submissions.length === 0 ? (
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
            <Description sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h6" fontWeight={600} color="text.secondary">No pending submissions.</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Staff submissions will appear here for your review.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>#{sub.id}</Typography>
                  </TableCell>
                  <TableCell>{getTypeChip(sub.type)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{sub.submitted_by_name}</Typography>
                  </TableCell>
                  <TableCell>{new Date(sub.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Button
                        size="small" variant="outlined"
                        onClick={() => { setSelectedSubmission(sub); setViewDialog(true); }}
                        startIcon={<Visibility />}
                      >
                        View
                      </Button>
                      <Button
                        size="small" color="success" variant="contained"
                        onClick={() => handleApprove(sub.id)}
                        startIcon={<CheckCircle />}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small" color="error" variant="contained"
                        onClick={() => handleReject(sub.id)}
                        startIcon={<Cancel />}
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

      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submission Details</DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box>
              <Typography variant="subtitle2">Type: {selectedSubmission.type}</Typography>
              <Typography variant="subtitle2">Submitted by: {selectedSubmission.submitted_by_name}</Typography>
              <Typography variant="subtitle2">Date: {new Date(selectedSubmission.created_at).toLocaleString()}</Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Data:</Typography>
                {/* Additive: friendly display for password reset requests */}
                {selectedSubmission.type === 'password_reset' && selectedSubmission.data ? (
                  <Box>
                    {[
                      { label: 'Account', value: selectedSubmission.data.target_user_id_formatted || selectedSubmission.data.target_user_id },
                      { label: 'Name', value: selectedSubmission.data.target_name },
                      { label: 'Email', value: selectedSubmission.data.target_email },
                      { label: 'Role', value: selectedSubmission.data.target_role },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">{item.label}:</Typography>
                        <Typography variant="body2" fontWeight={700}>{item.value || '—'}</Typography>
                      </Box>
                    ))}
                    <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2 }}>
                      Approving this will generate a temporary password ({selectedSubmission.data.target_role}123) and force the user to change it on next login.
                    </Alert>
                  </Box>
                ) : (
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>
                    {JSON.stringify(selectedSubmission.data, null, 2)}
                  </pre>
                )}
              </Box>
              <TextField
                fullWidth label="Admin Notes" multiline rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button onClick={() => handleApprove(selectedSubmission?.id)} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubmissionApprovals;