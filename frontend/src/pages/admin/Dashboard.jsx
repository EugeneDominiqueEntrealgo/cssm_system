import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Chip, Button, Stack } from '@mui/material';
import { People, CheckCircle, Pending, Description, Assessment, ArrowForward, Inventory, Receipt, WbSunny, WbCloudy, NightsStay, Storefront, LockReset, PersonAdd } from '@mui/icons-material';
import { Alert } from '@mui/material';
import API from '../../api/axios';
import { colors } from '../../theme';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Additive: pending password reset requests count (safe)
  const [pendingResetCount, setPendingResetCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/admin/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Additive: fetch pending password reset requests for notification banner
  useEffect(() => {
    const fetchResetRequests = async () => {
      try {
        const response = await API.get('/admin/pending-submissions');
        const resets = (Array.isArray(response.data) ? response.data : []).filter(
          (s) => s.type === 'password_reset'
        );
        setPendingResetCount(resets.length);
      } catch (error) {
        console.error('Failed to fetch reset requests:', error);
      }
    };
    fetchResetRequests();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        <CircularProgress size={48} sx={{ color: colors.primary }} />
      </Box>
    );
  }

  const getStatStyles = (name) => {
    switch (String(name || '').toLowerCase()) {
      case 'blue':
        return { colorHex: '#1E40AF', background: 'linear-gradient(135deg,#BFDBFE,#60A5FA)' };
      case 'green':
        return { colorHex: '#047857', background: 'linear-gradient(135deg,#CCFBF1,#86EFAC)' };
      case 'orange':
        return { colorHex: '#B45309', background: 'linear-gradient(135deg,#FED7AA,#FDBA74)' };
      case 'red':
        return { colorHex: '#B91C1C', background: 'linear-gradient(135deg,#FECACA,#FCA5A5)' };
      case 'teal':
        return { colorHex: '#0F766E', background: 'linear-gradient(135deg,#CCFBF1,#99F6E4)' };
      case 'purple':
        return { colorHex: '#6D28D9', background: 'linear-gradient(135deg,#E9D5FF,#C4B5FD)' };
      default:
        return { colorHex: '#0D9488', background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)' };
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <People />, color: 'blue', link: '/admin/accounts' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: <Inventory />, color: 'green', link: '/admin/reports' },
    { label: 'Transactions', value: stats?.totalTransactions || 0, icon: <Receipt />, color: 'orange', link: '/admin/reports' },
    { label: 'Pending Staff', value: stats?.pendingStaff || 0, icon: <Pending />, color: 'red', link: '/admin/approvals/staff' },
    { label: 'Pending Clients', value: stats?.pendingClients || 0, icon: <PersonAdd />, color: 'teal', link: '/admin/approvals/clients' },
    { label: 'Pending Submissions', value: stats?.pendingSubmissions || 0, icon: <Description />, color: 'purple', link: '/admin/approvals/submissions' },
  ];

const quickActions = [
    { label: 'Manage Accounts', icon: <People />, color: 'blue', link: '/admin/accounts', desc: 'View & manage all user accounts' },
    { label: 'Staff Approvals', icon: <CheckCircle />, color: 'orange', link: '/admin/approvals/staff', desc: 'Approve pending staff registrations' },
    { label: 'Submissions', icon: <Description />, color: 'purple', link: '/admin/approvals/submissions', desc: 'Review submitted reports' },
    { label: 'Generate Reports', icon: <Assessment />, color: 'green', link: '/admin/reports', desc: 'View system analytics & reports' },
    // Additive: product monitoring page
    { label: 'Product Monitor', icon: <Inventory />, color: 'teal', link: '/admin/product-monitor', desc: 'Monitor stock levels & export list' },
  ];

  // Personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: <WbSunny />, emoji: '🌅' };
    if (hour < 18) return { text: 'Good afternoon', icon: <WbCloudy />, emoji: '☀️' };
    return { text: 'Good evening', icon: <NightsStay />, emoji: '🌙' };
  };

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Box className="page-container">
      {/* Greeting Banner */}
      <Box className="greeting-banner">
        <Typography variant="h2">
          {greeting.text}, Admin {greeting.emoji}
        </Typography>
        <Typography variant="body1">
          {greeting.icon} Welcome back! Here's what's happening at your store today. <strong>{today}</strong>
        </Typography>
      </Box>

      {/* Additive: password reset requests notification banner */}
      {pendingResetCount > 0 && (
        <Alert
          severity="warning"
          icon={<LockReset fontSize="small" />}
          action={
            <Button
              size="small"
              onClick={() => navigate('/admin/approvals/submissions')}
              sx={{ ml: 1 }}
            >
              Review
            </Button>
          }
          sx={{ mb: 3, borderRadius: 3, alignItems: 'center' }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
            🔐 {pendingResetCount} password reset request{pendingResetCount > 1 ? 's' : ''} awaiting your approval
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => {
          const styles = getStatStyles(stat.color);
          return (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={stat.label}
              className={`animate-fade-in animate-delay-${index + 1}`}
            >
              <Card
                elevation={0}
                onClick={() => navigate(stat.link)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E8EEF3',
                  borderRadius: 3,
                  transition: 'all .22s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 18px 40px rgba(2,6,23,.06)',
                    borderColor: 'transparent',
                  },
                }}
              >
                <CardContent sx={{ p: '18px !important' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{
                      width: 52,
                      height: 52,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: styles.background,
                      color: styles.colorHex,
                      borderRadius: 2,
                    }}>
                      {stat.icon}
                    </Box>

                    <ArrowForward sx={{ color: '#CBD5E1', fontSize: 20 }} />
                  </Stack>

                  <Typography sx={{ mt: 2, color: '#0F172A', fontSize: 28, lineHeight: 1, fontWeight: 900 }}>
                    {stat.value}
                  </Typography>

                  <Typography sx={{ mt: 0.8, color: '#475569', fontSize: 13, fontWeight: 800 }}>
                    {stat.label}
                  </Typography>

                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={3} key={action.label}>
            <Card
              className="quick-action-card"
              onClick={() => navigate(action.link)}
              sx={{
                border: '1px solid rgba(0,0,0,0.04)',
                '&:hover': {
                  borderColor: colors.primary,
                  boxShadow: `0 8px 32px rgba(0, 168, 150, 0.15)`,
                },
              }}
            >
              <Box
                sx={{
                  bgcolor: `rgba(0, 168, 150, 0.1)`,
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  mb: 1.5,
                  color: colors.primary,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.1) rotate(-5deg)' },
                }}
              >
                {action.icon}
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                {action.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                {action.desc}
              </Typography>
              <Chip
                label="Go to page"
                size="small"
                icon={<ArrowForward fontSize="small" />}
                sx={{
                  bgcolor: 'rgba(0,168,150,0.08)',
                  color: colors.primary,
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(0,168,150,0.15)' },
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;