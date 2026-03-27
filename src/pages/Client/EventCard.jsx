import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  Button
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  FavoriteBorder as FavoriteIcon,
  Share as ShareIcon
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

import { getImageUrl } from '../../utils/imageUtils';


const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { 
    id,
    title = "Event Title", 
    date = "Sat, Oct 12 • 7:00 PM", 
    location = "Venue Name, City", 
    price = "From $25.00", 
    category = "Music",
    image = ""
  } = event || {};



  return (
    <Card 
      onClick={() => navigate(`/event/${id}`)}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 20px 40px rgba(15, 118, 110, 0.15)',
          transform: 'translateY(-10px)',
          '& .MuiCardMedia-root': {
            transform: 'scale(1.15)',
          }
        },
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Category Chip */}
      <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
        <Chip 
          label={category} 
          size="small" 
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.9)', 
            backdropFilter: 'blur(4px)',
            fontWeight: 700,
            fontSize: '0.65rem',
            color: 'primary.main',
            textTransform: 'uppercase'
          }} 
        />
      </Box>

      {/* Favorite Button */}
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
        <IconButton 
          size="small" 
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.9)', 
            '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' } 
          }}
        >
          <FavoriteIcon fontSize="small" color="inherit" />
        </IconButton>
      </Box>

      <Box sx={{ overflow: 'hidden', height: 200 }}>
        <CardMedia
          component="img"
          image={getImageUrl(image)}
          alt={title}
          sx={{ 
            height: '100%', 
            transition: 'transform 0.5s ease',
            '&:hover': { transform: 'scale(1.1)' } 
          }}
        />

      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="h2" 
          sx={{ 
            fontSize: '1.1rem', 
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 1,
            color: 'text.primary',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            height: '2.8rem'
          }}
        >
          {title}
        </Typography>

        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
            <CalendarIcon sx={{ fontSize: 16, mr: 1, opacity: 0.8 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {date}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <LocationIcon sx={{ fontSize: 16, mr: 1, opacity: 0.6 }} />
            <Typography variant="caption" noWrap>
              {location}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.5) }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {price}
            </Typography>
            <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={(e) => { e.stopPropagation(); }}>
              <ShareIcon fontSize="inherit" />
            </IconButton>
          </Box>
          <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
            <Button 
              variant="outlined" 
              size="small" 
              fullWidth
              sx={{ borderRadius: 2 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/event/${id}`); }}
            >
              View Details
            </Button>
            <Button 
              variant="contained" 
              size="small" 
              fullWidth
              sx={{ borderRadius: 2 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/booking/${id}`); }}
            >
              Book Ticket
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCard;
