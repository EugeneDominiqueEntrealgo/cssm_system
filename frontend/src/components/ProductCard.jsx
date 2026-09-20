import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Button,
  Rating,
} from '@mui/material';
import {
  FavoriteBorderRounded,
  FavoriteRounded,
  ShoppingCartRounded,
  CheckRounded,
  ImageNotSupportedRounded,
} from '@mui/icons-material';

/**
 * Enhanced Product Card Component
 * Features: dark slate aesthetic, glassmorphism overlays, teal accents, hover animations
 */
const ProductCard = ({
  product,
  isFavorited,
  onFavoriteToggle,
  onAddToCart,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const addedTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(addedTimerRef.current), []);

  const handleAddToCart = (event) => {
    event.stopPropagation();
    const result = onAddToCart?.(product);
    if (!result?.ok) return;

    setIsAdded(true);
    clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setIsAdded(false), 1600);
  };

  const getImageUrl = () => {
    if (product?.image_url) return product.image_url;
    if (product?.image) return product.image;
    return null;
  };

  const getStock = () =>
    Number(product?.stock ?? product?.stock_quantity ?? 0);

  const stock = getStock();
  const isLowStock = stock > 0 && stock <= 10;
  const isOutOfStock = stock === 0;
  const imageUrl = getImageUrl();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0F172A',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',

        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: 'rgba(94, 234, 212, 0.3)',
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(94, 234, 212, 0.12)',

          '& .product-image': {
            transform: 'scale(1.08)',
          },
          '& .action-overlay': {
            opacity: 1,
            bgcolor: 'rgba(15, 23, 42, 0.65)',
          },
        },
      }}
    >
      {/* Image Container */}
      <Box
        sx={{
          position: 'relative',
          paddingBottom: '85%',
          overflow: 'hidden',
          bgcolor: '#1E293B',
        }}
      >
        {imageUrl && !imageError ? (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            className="product-image"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 38%',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 1,
              bgcolor: '#1E293B',
              color: '#64748B',
            }}
          >
            <ImageNotSupportedRounded sx={{ fontSize: 40 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              No image available
            </Typography>
          </Box>
        )}

        {/* Stock Status Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
          }}
        >
          <Chip
            label={
              isOutOfStock
                ? 'Out of Stock'
                : isLowStock
                  ? `Low Stock (${stock})`
                  : 'In Stock'
            }
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.68rem',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
              bgcolor: isOutOfStock
                ? 'rgba(239, 68, 68, 0.2)'
                : isLowStock
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(13, 148, 136, 0.25)',
              color: isOutOfStock
                ? '#EF4444'
                : isLowStock
                  ? '#F59E0B'
                  : '#5EEAD4',
              border: '1px solid',
              borderColor: isOutOfStock
                ? 'rgba(239, 68, 68, 0.3)'
                : isLowStock
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(94, 234, 212, 0.3)',
            }}
          />
        </Box>

        {/* Favorite Button */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 3,
          }}
        >
          <Tooltip title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle?.(product.id);
              }}
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: isFavorited ? '#F43F5E' : '#94A3B8',
                transition: 'all 0.2s ease',

                '&:hover': {
                  bgcolor: '#0F172A',
                  color: isFavorited ? '#F43F5E' : '#F8FAFC',
                  transform: 'scale(1.1)',
                },
              }}
            >
              {isFavorited ? (
                <FavoriteRounded sx={{ fontSize: 18 }} />
              ) : (
                <FavoriteBorderRounded sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Hover Action Overlay */}
        <Box
          className="action-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s ease-in-out',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            p: 2,
            opacity: 0,
            zIndex: 2,
          }}
        >
          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCartRounded />}
            onClick={(e) => {
              handleAddToCart(e);
            }}
            disabled={isOutOfStock || isAdded}
            sx={{
              py: 1,
              bgcolor: '#0D9488',
              color: '#F8FAFC',
              fontWeight: 800,
              fontSize: '0.8rem',
              borderRadius: '10px',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)',

              '&:hover': {
                bgcolor: '#0D9488',
                filter: 'brightness(1.1)',
                boxShadow: '0 6px 20px rgba(13, 148, 136, 0.6)',
              },
              '&.Mui-disabled': {
                bgcolor: isAdded ? '#0F766E' : 'rgba(255, 255, 255, 0.1)',
                color: isAdded ? '#CCFBF1' : '#64748B',
                boxShadow: 'none',
              },
            }}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : isAdded ? (
              <><CheckRounded sx={{ fontSize: 18 }} /> Added</>
            ) : (
              'Add to Cart'
            )}
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2.2,
          '&:last-child': { pb: 2.2 },
        }}
      >
        {/* Rating */}
        {product.rating && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
            <Rating
              value={Number(product.rating)}
              readOnly
              size="small"
              precision={0.5}
              sx={{
                fontSize: '0.85rem',
                '& .MuiRating-iconFilled': { color: '#F59E0B' },
                '& .MuiRating-iconEmpty': { color: '#334155' },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}
            >
              ({product.reviews ?? 0})
            </Typography>
          </Stack>
        )}

        {/* Title */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            fontSize: '0.92rem',
            color: '#F8FAFC',
            lineHeight: 1.35,
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.name}
        </Typography>

        {/* Description */}
        {product.description && (
          <Typography
            variant="body2"
            sx={{
              color: '#94A3B8',
              fontSize: '0.78rem',
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.description}
          </Typography>
        )}

        {/* Price Tag */}
        <Stack
          direction="row"
          alignItems="baseline"
          spacing={1}
          sx={{ mt: 'auto', pt: 1 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontSize: '1.25rem',
              color: '#5EEAD4',
              lineHeight: 1,
            }}
          >
            ₱{Number(product.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Typography>

          {product.original_price && product.original_price > product.price && (
            <Typography
              variant="body2"
              sx={{
                textDecoration: 'line-through',
                color: '#64748B',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              ₱{Number(product.original_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductCard;