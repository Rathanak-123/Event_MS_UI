import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Chip,
  Paper,
  Divider,
  IconButton,
  alpha,
  useTheme,
  Skeleton,
  Alert,
  Snackbar
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  ArrowBack as BackIcon,
  Share as ShareIcon,
  FavoriteBorder as FavoriteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEventById } from '../../api/events.api';
import { getPaginatedTickets } from '../../api/ticket.api';
import TicketSelector from './TicketSelector';

import { getImageUrl } from '../../utils/imageUtils';


const EventDetailPage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventData, ticketData] = await Promise.all([
          getEventById(id),
          getPaginatedTickets({ filters: { event_id: id }, limit: 100 })
        ]);
        const event = eventData?.data || eventData;
        setEvent(event);
        
        const tickets = ticketData?.items || ticketData?.results || ticketData?.data || (Array.isArray(ticketData) ? ticketData : []);
        setTickets(tickets);
      } catch (err) {
        console.error(err);
        setError("Event not found or failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleQuantityChange = (ticketId, quantity) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: quantity
    }));
  };

  const totalSelected = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleBookNow = () => {
    if (!isAuthenticated) {
      setSnackbar({ open: true, message: 'Please login to book tickets', severity: 'warning' });
      setTimeout(() => navigate('/login', { state: { returnUrl: `/event/${id}` } }), 1500);
      return;
    }
    
    if (totalSelected === 0) {
      setSnackbar({ open: true, message: 'Please select at least one ticket', severity: 'error' });
      return;
    }

    // Pass selected tickets to booking page via state
    navigate(`/booking/${id}`, { state: { selectedTickets } });
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 12 }}>
        <Container maxWidth="lg">
          <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 6, mb: 6 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Skeleton width="70%" height={60} sx={{ mb: 2 }} />
              <Skeleton width="40%" height={30} sx={{ mb: 4 }} />
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>
          <Button onClick={() => navigate('/')} variant="contained" size="large" sx={{ borderRadius: 3 }}>Back to Home</Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      
      {/* Hero Section */}
      <Box sx={{ position: 'relative', pt: 12 }}>
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              height: { xs: '300px', md: '500px' }, 
              borderRadius: 6,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Box 
              component="img" 
              src={getImageUrl(event.image)} 
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />

            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                zIndex: 1
              }} 
            />
            <Typography 
              variant="h2" 
              sx={{ 
                position: 'absolute', 
                bottom: 30, 
                left: 30, 
                color: 'white', 
                fontWeight: 900, 
                zIndex: 2,
                fontSize: { xs: '2rem', md: '3.5rem' },
                lineHeight: 1.1,
                letterSpacing: '-1.5px'
              }}
            >
              {event.event_name || event.title || event.name}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="lg" sx={{ mt: -8, mb: 10, position: 'relative', zIndex: 10 }}>
        <Grid container spacing={4}>
          {/* Left Column: Details */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
              <IconButton 
                onClick={() => navigate(-1)}
                sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}
              >
                <BackIcon />
              </IconButton>
              
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, letterSpacing: '-1.5px', color: 'text.primary' }}>
                {event.event_name || event.title || event.name}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3, mr: 2, display: 'flex' }}>
                    <CalendarIcon color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Date & Time</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {new Date(event.event_date || event.start_date || event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.start_time || event.event_time || 'TBA'} {event.end_time ? `- ${event.end_time}` : ''}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 3, mr: 2, display: 'flex' }}>
                    <LocationIcon color="secondary" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {event.venue?.name || event.venue_name || "Location TBA"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.venue?.address || event.venue_address || ""}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>About Event</Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                    whiteSpace: 'pre-line', 
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    mb: 6
                }}
              >
                {event.description || "No description provided for this event. Join us for an unforgettable experience!"}
              </Typography>

              <Divider sx={{ mb: 6 }} />

              {/* Ticket Selection Area */}
              <TicketSelector 
                tickets={tickets} 
                selectedTickets={selectedTickets} 
                onQuantityChange={handleQuantityChange} 
              />
            </Paper>
          </Grid>

          {/* Right Column: Sticky Booking Card */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: 100 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    borderRadius: 6, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.06)',
                    bgcolor: 'background.paper'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Booking Summary</Typography>
                
                {totalSelected > 0 ? (
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    {tickets.filter(t => selectedTickets[t.id] > 0).map(t => (
                      <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{t.name} x {selectedTickets[t.id]}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>${(t.price * selectedTickets[t.id]).toFixed(2)}</Typography>
                      </Box>
                    ))}
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                        ${Object.keys(selectedTickets).reduce((sum, id) => {
                          const ticket = tickets.find(t => t.id === parseInt(id));
                          return sum + (ticket ? ticket.price * selectedTickets[id] : 0);
                        }, 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Box sx={{ mb: 4, p: 3, bgcolor: alpha(theme.palette.text.primary, 0.02), borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Select your tickets to continue</Typography>
                  </Box>
                )}

                <Button 
                    fullWidth 
                    variant="contained" 
                    size="large" 
                    disabled={totalSelected === 0}
                    onClick={handleBookNow}
                    sx={{ 
                        borderRadius: 4, 
                        py: 2.5, 
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        boxShadow: '0 10px 25px rgba(15, 118, 110, 0.3)'
                    }}
                >
                    Book Now
                </Button>
                
                <Typography variant="caption" sx={{ display: 'block', mt: 3, textAlign: 'center', color: 'text.secondary', fontWeight: 500 }}>
                  * All purchases are subject to terms & conditions
                </Typography>
              </Paper>

              <Stack direction="row" spacing={2}>
                <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<FavoriteIcon />}
                    sx={{ borderRadius: 3, py: 1.5, borderColor: 'divider', color: 'text.primary', fontWeight: 700 }}
                >
                    Save
                </Button>
                <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<ShareIcon />}
                    sx={{ borderRadius: 3, py: 1.5, borderColor: 'divider', color: 'text.primary', fontWeight: 700 }}
                >
                    Share
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventDetailPage;
