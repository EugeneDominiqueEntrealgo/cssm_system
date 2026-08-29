import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Receipt, TrendingUp } from '@mui/icons-material';
import API from '../../api/axios';
import { colors } from '../../theme';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports = () => {
  const [period, setPeriod] = useState('monthly');
  const [chartType, setChartType] = useState('sales_category');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [period, chartType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/admin/reports?period=${period}&chart=${chartType}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!reportData?.data) return null;

    if (chartType === 'sales_category') {
      return {
        labels: reportData.data.map(d => d.category),
        datasets: [{
          label: 'Sales by Category',
          data: reportData.data.map(d => parseFloat(d.total_sales)),
          backgroundColor: ['#00A896', '#FCA311', '#FF6B6B', '#9B59B6', '#3498DB', '#2ECC71', '#E91E63', '#00BCD4'],
          borderWidth: 1
        }]
      };
    } else {
      return {
        labels: reportData.data.map(d => d.name),
        datasets: [{
          label: 'Quantity Sold',
          data: reportData.data.map(d => d.total_quantity),
          backgroundColor: '#00A896',
          borderColor: '#00897B',
          borderWidth: 1
        }]
      };
    }
  };

  const formatPrice = (price) => `₱${parseFloat(price).toFixed(2)}`;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: chartType === 'sales_category' ? 'Sales by Category' : 'Top Products' }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <Box className="page-container">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" className="page-title" sx={{ mb: 1 }}>
          Sales Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View sales analytics and performance metrics.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Period</InputLabel>
            <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Chart Type</InputLabel>
            <Select value={chartType} label="Chart Type" onChange={(e) => setChartType(e.target.value)}>
              <MenuItem value="sales_category">Sales by Category</MenuItem>
              <MenuItem value="top_products">Top Products</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {reportData?.summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(0,168,150,0.08) 0%, rgba(0,168,150,0.02) 100%)',
                border: '1px solid rgba(0,168,150,0.15)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <Receipt sx={{ color: colors.primary }} />
                <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary }}>
                  {reportData.summary.total_transactions}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Total Transactions ({period})</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(252,163,17,0.08) 0%, rgba(252,163,17,0.02) 100%)',
                border: '1px solid rgba(252,163,17,0.15)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <TrendingUp sx={{ color: colors.secondary }} />
                <Typography variant="h5" fontWeight={700} sx={{ color: colors.secondary }}>
                  {formatPrice(reportData.summary.total_revenue)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">Total Revenue ({period})</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <CircularProgress size={48} sx={{ color: colors.primary }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper className="chart-container">
              {chartType === 'sales_category' ? (
                <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                  <Pie data={getChartData()} options={chartOptions} />
                </Box>
              ) : (
                <Bar data={getChartData()} options={barOptions} />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>Data Table</Typography>
              {reportData?.data?.map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2">{item.category || item.name}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {chartType === 'sales_category' ? formatPrice(item.total_sales) : `${item.total_quantity} sold`}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Reports;