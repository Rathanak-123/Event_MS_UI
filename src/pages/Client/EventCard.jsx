import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { getImageUrl } from '../../utils/imageUtils';
import { getPaginatedTickets } from '../../api/ticket.api';
import StatusBadge from '../../components/StatusBadge';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const {
    id,
    event_name,
    event_date,
    venue,
    image = '',
    category,
  } = event || {};

  const propTickets = event?.tickets;
  const [tickets, setTickets] = useState(propTickets || []);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if ((!propTickets || propTickets.length === 0) && id) {
      if (tickets.length > 0) return;
      const fetchTickets = async () => {
        try {
          const data = await getPaginatedTickets({ filters: { event_id: id }, limit: 20 });
          const items = data?.items || data?.results || data?.data || (Array.isArray(data) ? data : []);
          setTickets(items);
        } catch (err) {
          console.error('Failed to fetch tickets for event:', id, err);
        }
      };
      fetchTickets();
    } else if (propTickets && propTickets.length > 0) {
      setTickets(propTickets);
    }
  }, [id, propTickets]);

  const title = event_name || event?.title || event?.name || 'Unnamed Event';

  const formatDate = () => {
    const rawDate = event_date || event?.start_date || event?.date;
    if (!rawDate) return 'Date TBA';
    try {
      return new Date(rawDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return rawDate;
    }
  };

  const location = venue?.name || event?.venue_name || event?.location || 'Venue TBA';
  const date = formatDate();
  const categoryLabel =
    category?.category_name || category?.name || event?.category_name || null;

  const getDisplayPrice = () => {
    if (tickets && tickets.length > 0) {
      const validPrices = tickets.map((t) => Number(t.price)).filter((p) => !isNaN(p));
      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        return minPrice > 0 ? `$${minPrice.toFixed(2)}` : 'Free';
      }
    }
    const p = event?.price ?? event?.starting_price ?? event?.min_price ?? event?.base_price;
    if (p !== undefined && p !== null && p !== '') {
      const numP = Number(p);
      if (!isNaN(numP)) return numP > 0 ? `$${numP.toFixed(2)}` : 'Free';
    }
    return null;
  };

  const price = getDisplayPrice();

  return (
    <Card
      elevation={0}
      onClick={() => {
        if (event.status?.toLowerCase() === 'ongoing' || event.status?.toLowerCase() === 'completed') {
          // Still allow viewing the event, but the buttons inside are already disabled
          navigate(`/event/${id}`);
        } else {
          navigate(`/event/${id}`);
        }
      }}
      sx={{
        position: 'relative',
        height: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: 'rgba(255,255,255,0.15)',
          boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
        },
      }}
    >
      {/* Image */}
      <Box sx={{ position: 'relative', paddingTop: '60%' }}>
        <CardMedia
          component="img"
          image={getImageUrl(image)}
          alt={title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Dark gradient overlay on image */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        {/* Category chip top-left */}
        {categoryLabel && (
          <Chip
            label={categoryLabel.toUpperCase()}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.68rem',
              letterSpacing: '0.06em',
              border: '1px solid rgba(255,255,255,0.18)',
              height: 24,
            }}
          />
        )}

        {/* Status Badge top-right (shifted left of bookmark) */}
        <Box sx={{ position: 'absolute', top: 12, right: 48 }}>
          <StatusBadge status={event.status} />
        </Box>

        {/* Bookmark top-right */}
        <IconButton
          onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            color: saved ? '#0d9488' : 'rgba(255,255,255,0.85)',
            width: 32,
            height: 32,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
          }}
        >
          {saved ? (
            <BookmarkIcon sx={{ fontSize: 16 }} />
          ) : (
            <BookmarkBorderIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
        
        {/* Event Begun Overlay */}
        {(event.status?.toLowerCase() === 'ongoing' || 
          event.status?.toLowerCase() === 'completed' || 
          (event.event_date && new Date(event.event_date) < new Date())) && (
          <Box sx={{ 
            position: 'absolute', 
            inset: 0, 
            bgcolor: 'rgba(0,0,0,0.6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 2,
            backdropFilter: 'blur(2px)'
          }}>
            <Typography sx={{ 
              color: '#fff', 
              fontWeight: 900, 
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              border: '2px solid #fff',
              px: 2,
              py: 1,
              borderRadius: '8px',
              fontSize: '0.8rem'
            }}>
              {(event.status?.toLowerCase() === 'ongoing' || (event.event_date && new Date(event.event_date) < new Date() && event.status?.toLowerCase() !== 'completed')) ? 'Ongoing' : 'Completed'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Title */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: '#fff',
            mb: 1.2,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: '1rem',
          }}
        >
          {title}
        </Typography>

        {/* Location */}
        <Stack direction="row" alignItems="center" spacing={0.7} sx={{ mb: 0.8 }}>
          <LocationOnOutlinedIcon sx={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)' }} />
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.55)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.8rem',
            }}
          >
            {location}
          </Typography>
        </Stack>

        {/* Date + Price row */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={0.7}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }} />
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500, fontSize: '0.78rem' }}
            >
              {date}
            </Typography>
          </Stack>

          {price && (
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1rem',
                color: '#2dd4bf',
                letterSpacing: '-0.5px',
              }}
            >
              {price}
            </Typography>
          )}
        </Stack>
      </Box>
    </Card>
  );
};

export default EventCard;
