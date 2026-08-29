import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { FavoriteBorderRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
        <FavoriteBorderRounded sx={{ fontSize: 56, color: '#00A896', mb: 2 }} />
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          Favorites
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Your saved products will appear here.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/client/dashboard')}>
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default Favorites;
