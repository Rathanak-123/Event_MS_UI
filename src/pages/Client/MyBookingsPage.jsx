import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Stack,
  Chip,
  Grid,
  Button,
  alpha,
  useTheme,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  ConfirmationNumber as TicketIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getPaginatedBookings } from '../../api/booking.api';
import { getImageUrl } from '../../utils/imageUtils';
import EventTicketModal from './EventTicketModal';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, clientUser } = useAuth();
  
  // Set initial tab based on query parameter
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab')?.toLowerCase();
    if (tab === 'pending') return 0;
    if (tab === 'confirmed') return 1;
    if (tab === 'cancelled') return 2;
    return 1; // Default to confirmed
  };

  const [tabValue, setTabValue] = useState(getInitialTab());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Sync tabValue with URL query parameter
  useEffect(() => {
    setTabValue(getInitialTab());
  }, [location.search]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeUser = clientUser || user;
      const customerId = activeUser?.id || activeUser?.user_id;
      
      const filters = {};
      if (customerId) {
        filters.customer_id = customerId;
        filters.customer = customerId;
      }
      
      const data = await getPaginatedBookings({ filters, limit: 100 });
      let items = data?.items || data?.results || data?.data || (Array.isArray(data) ? data : []);

      // Sort items: Upcoming (Future) first, then Ongoing, then Completed (Past)
      const now = new Date().getTime();
      
      items = [...items].sort((a, b) => {
        const dateA = new Date(a.event?.event_date || a.event?.date || 0).getTime();
        const dateB = new Date(b.event?.event_date || b.event?.date || 0).getTime();
        
        const statusA = (a.event?.status || a.event_status || '').toLowerCase();
        const statusB = (b.event?.status || b.event_status || '').toLowerCase();

        // Calculate Priority Weight
        const getWeight = (status, date) => {
          if (status === 'upcoming') return 1;
          if (status === 'ongoing') return 2;
          if (status === 'completed') return 3;
          
          // Fallback if status missing: Check time
          if (date > now) return 1; // Future
          return 3; // Past
        };

        const weightA = getWeight(statusA, dateA);
        const weightB = getWeight(statusB, dateB);

        if (weightA !== weightB) return weightA - weightB;
        
        // If same weight, sort by date
        if (weightA === 1) return dateA - dateB; // Upcoming: Closest first
        return dateB - dateA; // Past: Most recent first
      });

      setBookings(items);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user || clientUser) {
      fetchBookings();
    }
  }, [user, clientUser, location.search, location.pathname]);

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed' || s === 'completed' || s === 'upcoming') {
      return { bgcolor: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf', label: 'Confirmed' };
    }
    if (s === 'pending') {
      return { bgcolor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', label: 'Pending Payment' };
    }
    if (s === 'cancelled' || s === 'failed') {
      return { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', label: 'Cancelled' };
    }
    return { bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.4)', label: status };
  };

  const filteredBookings = bookings.filter(b => {
    const status = b.status?.toLowerCase();
    if (tabValue === 0) return status === 'pending';
    if (tabValue === 1) return status === 'confirmed' || status === 'upcoming';
    if (tabValue === 2) return status === 'cancelled' || status === 'failed';
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', pb: 10, color: '#fff' }}>
      <Container maxWidth="lg">
        <Box sx={{ pt: 12, mb: 6 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(13, 148, 136, 0.1)', color: '#2dd4bf', width: 48, height: 48 }}>
              <HistoryIcon />
            </Avatar>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-2px' }}>My Bookings</Typography>
          </Stack>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.45)', maxWidth: 600 }}>
            Keep track of your event tickets, payment status, and booking history in one place.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{error}</Alert>}

        <Box sx={{ mb: 6 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)}
            sx={{
              '& .MuiTabs-indicator': { bgcolor: '#2dd4bf', height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': { 
                fontWeight: 800, 
                px: 4, 
                py: 2, 
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'none',
                fontSize: '1rem',
                '&.Mui-selected': { color: '#fff' }
              }
            }}
          >
            <Tab label="Pending" />
            <Tab label="Confirmed" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>

        {filteredBookings.length > 0 ? (
          <Stack spacing={3}>
            {filteredBookings.map((booking) => {
              const status = getStatusStyle(booking.status);
              return (
                <Paper 
                  key={booking.id}
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: '24px', 
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Box 
                        component="img" 
                        src={getImageUrl(booking.event?.image || booking.image)} 
                        sx={{ 
                          width: '100%', 
                          height: 140, 
                          objectFit: 'cover', 
                          borderRadius: '16px', 
                          border: '1px solid rgba(255,255,255,0.08)' 
                        }} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={2}>
                        <Box>
                          <Chip 
                            label={status.label} 
                            size="small" 
                            sx={{ 
                              bgcolor: status.bgcolor, 
                              color: status.color, 
                              fontWeight: 900, 
                              fontSize: '0.65rem', 
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              mb: 1
                            }} 
                          />
                          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: '#fff' }}>
                            {booking.event?.event_name || booking.event?.name || "Premium Event"}
                          </Typography>
                        </Box>
                        
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            <CalendarIcon sx={{ fontSize: 16, color: '#2dd4bf' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {booking.event?.event_date ? new Date(booking.event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Date TBA"}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            <LocationIcon sx={{ fontSize: 16, color: '#2dd4bf' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {booking.event?.venue?.name || booking.location || "Venue TBA"}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Stack spacing={3} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, display: 'block', mb: 0.5 }}>TOTAL PAID</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: '#2dd4bf', letterSpacing: '-1px' }}>
                            ${parseFloat(booking.total_amount || 0).toFixed(2)}
                          </Typography>
                        </Box>
                        
                          <Button 
                            variant="contained" 
                            size="large"
                            fullWidth={false}
                            disabled={(() => {
                              const isPending = booking.status?.toLowerCase() === 'pending';
                              if (!isPending) return false;
                              
                              const eventStatus = (booking.event?.status || booking.event_status || '').toLowerCase();
                              const hasBegunByStatus = eventStatus === 'ongoing' || eventStatus === 'completed';
                              
                              const eventDate = booking.event?.event_date || booking.event?.date;
                              const hasBegunByDate = eventDate ? new Date(eventDate) < new Date() : false;
                              
                              return hasBegunByStatus || hasBegunByDate;
                            })()}
                            startIcon={booking.status?.toLowerCase() === 'pending' ? <PaymentIcon /> : <TicketIcon />}
                            endIcon={<ChevronRightIcon />}
                            onClick={() => {
                              if (booking.status?.toLowerCase() === 'pending') {
                                navigate(`/payment/${booking.id}`, {
                                  state: { totalAmount: parseFloat(booking.total_amount || 0), eventName: booking.event?.event_name || 'Event' }
                                });
                              } else {
                                setSelectedBooking(booking);
                                setIsTicketModalOpen(true);
                              }
                            }}
                            sx={{ 
                              borderRadius: '12px', 
                              fontWeight: 900, 
                              px: 4, 
                              py: 1.5,
                              bgcolor: booking.status?.toLowerCase() === 'pending' ? '#fbbf24' : '#0d9488',
                              color: booking.status?.toLowerCase() === 'pending' ? '#000' : '#fff',
                              textTransform: 'none',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                              '&:hover': {
                                bgcolor: booking.status?.toLowerCase() === 'pending' ? '#f59e0b' : '#0f766e',
                              },
                              '&.Mui-disabled': {
                                bgcolor: 'rgba(255,255,255,0.05)',
                                color: 'rgba(255,255,255,0.2)'
                              }
                            }}
                          >
                            {(() => {
                              const isPending = booking.status?.toLowerCase() === 'pending';
                              if (!isPending) return 'View Ticket';
                              
                              const eventStatus = (booking.event?.status || booking.event_status || '').toLowerCase();
                              const hasBegunByStatus = eventStatus === 'ongoing' || eventStatus === 'completed';
                              
                              const eventDate = booking.event?.event_date || booking.event?.date;
                              const hasBegunByDate = eventDate ? new Date(eventDate) < new Date() : false;
                              
                              return (hasBegunByStatus || hasBegunByDate) ? 'Event Already Begun' : 'Complete Payment';
                            })()}
                          </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Stack>
        ) : (
          <Box 
            sx={{ 
              py: 12, 
              textAlign: 'center', 
              bgcolor: 'rgba(255,255,255,0.01)', 
              borderRadius: '32px', 
              border: '2px dashed rgba(255,255,255,0.05)' 
            }}
          >
            <TicketIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>No bookings found</Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', mb: 4 }}>
              You haven't made any bookings in this category yet.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
              sx={{ borderRadius: '12px', fontWeight: 800, color: '#fff', borderColor: 'rgba(255,255,255,0.2)', px: 4, py: 1.5 }}
            >
              Explore Events
            </Button>
          </Box>
        )}
      </Container>
      <EventTicketModal 
        open={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={selectedBooking}
      />
    </Box>
  );
};

export default MyBookingsPage;
