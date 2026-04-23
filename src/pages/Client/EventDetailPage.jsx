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
  Snackbar,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  ArrowBack as BackIcon,
  Share as ShareIcon,
  FavoriteBorder as FavoriteIcon,
  Favorite as FavoriteFilledIcon,
  AccessTime as TimeIcon,
  ChevronLeft as LeftIcon,
  ChevronRight as RightIcon,
  ShieldOutlined as ShieldIcon,
  Schedule as ScheduleIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEventById } from '../../api/events.api';
import { getPaginatedTickets } from '../../api/ticket.api';
import { createBooking } from '../../api/booking.api';
import { generateKHQR } from '../../api/payment.api';
import { generateEventTicket } from '../../api/eventTicket.api';
import TicketSelector from './TicketSelector';
import BookingQRCode from './BookingQRCode';
import { getImageUrl } from '../../utils/imageUtils';

const EventDetailPage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, clientUser } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [paymentMd5, setPaymentMd5] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
        setError("Event not found or failed to load data.");
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

  const selectedTicketsList = tickets.filter(t => selectedTickets[t.id] > 0);
  const totalSelected = selectedTicketsList.reduce((sum, t) => sum + selectedTickets[t.id], 0);
  const subtotal = selectedTicketsList.reduce((sum, t) => sum + (t.price * selectedTickets[t.id]), 0);
  const totalAmount = subtotal;

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      setSnackbar({ open: true, message: 'Please login to book tickets', severity: 'warning' });
      setTimeout(() => navigate('/login', { state: { returnUrl: `/event/${id}` } }), 1500);
      return;
    }
    
    if (totalSelected === 0) {
      setSnackbar({ open: true, message: 'Please select at least one ticket', severity: 'error' });
      return;
    }

    const isOngoingOrCompleted = event?.status?.toLowerCase() === 'ongoing' || event?.status?.toLowerCase() === 'completed';
    const hasBegunByDate = event?.event_date ? new Date(event.event_date) < new Date() : false;

    if (isOngoingOrCompleted || hasBegunByDate) {
      setSnackbar({ open: true, message: 'Event have already begun or completed. Cannot book tickets anymore.', severity: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const ticketIds = Object.keys(selectedTickets).filter(tid => selectedTickets[tid] > 0);
      const primaryTicketId = ticketIds[0];
      const quantity = selectedTickets[primaryTicketId];
      
      const response = await createBooking({
        event: parseInt(id),
        ticket: parseInt(primaryTicketId),
        quantity: quantity,
        customer: clientUser?.id,
      });

      const newBookingId = response.id || response.data?.id;
      setCreatedBookingId(newBookingId);
      setQrModalOpen(true);
      setQrLoading(true);

      const khqrRes = await generateKHQR(newBookingId, totalAmount);
      const md5 = khqrRes?.data?.md5 || khqrRes?.md5;
      const img = khqrRes?.data?.qr_image || khqrRes?.qr_image || khqrRes?.data?.qr_code || khqrRes?.qr_code;
      
      setPaymentMd5(md5);
      setQrData(img || null);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to create booking. Please try again.', severity: 'error' });
    } finally {
      setQrLoading(false);
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setQrModalOpen(false);
    try {
      await generateEventTicket(createdBookingId);
    } catch (err) { console.error(err); }

    setSnackbar({ open: true, message: 'Payment Successful!', severity: 'success' });
    setTimeout(() => {
      navigate('/success', { 
        state: { 
          bookingId: createdBookingId, 
          totalAmount: totalAmount,
          eventName: event?.event_name,
          booking: { id: createdBookingId, event, customer: clientUser, total_amount: totalAmount, status: 'Confirmed' }
        } 
      });
    }, 1500);
  };

  const handleSaveForLater = async () => {
    if (!isAuthenticated) {
      setSnackbar({ open: true, message: 'Please login to save bookings', severity: 'warning' });
      setTimeout(() => navigate('/login', { state: { returnUrl: `/event/${id}` } }), 1500);
      return;
    }

    if (totalSelected === 0) {
      navigate('/my-bookings?tab=pending');
      return;
    }

    const isOngoingOrCompleted = event?.status?.toLowerCase() === 'ongoing' || event?.status?.toLowerCase() === 'completed';
    const hasBegunByDate = event?.event_date ? new Date(event.event_date) < new Date() : false;

    if (isOngoingOrCompleted || hasBegunByDate) {
      setSnackbar({ open: true, message: 'Event have already begun or completed.', severity: 'warning' });
      return;
    }

    try {
      const ticketIds = Object.keys(selectedTickets).filter(tid => selectedTickets[tid] > 0);
      const primaryTicketId = ticketIds[0];
      const quantity = selectedTickets[primaryTicketId];
      
      await createBooking({
        event: parseInt(id),
        ticket: parseInt(primaryTicketId),
        quantity: quantity,
        customer: clientUser?.id,
      });
      
      setSnackbar({ open: true, message: 'Booking saved for later!', severity: 'success' });
      setTimeout(() => navigate('/my-bookings?tab=pending'), 1000);
    } catch (err) {
      console.error("Save failed:", err);
      setSnackbar({ open: true, message: 'Failed to save booking. Please try again.', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', pt: 12 }}>
        <Container maxWidth="lg">
          <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 6, mb: 6, bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Skeleton width="70%" height={60} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3, bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{error}</Alert>
          <Button onClick={() => navigate('/')} variant="outlined" size="large" sx={{ borderRadius: 3, color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>Back to Home</Button>
        </Container>
      </Box>
    );
  }


  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', pb: 10, color: '#fff' }}>
      
      {/* ──────────────── HERO SECTION ──────────────── */}
      <Box sx={{ position: 'relative', pt: { xs: 8, md: 10 }, pb: 4 }}>
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              height: { xs: '320px', md: '520px' }, 
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {/* Main Background Image */}
            <Box 
              component="img" 
              src={getImageUrl(event.image)} 
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />

            {/* Overlays */}
            <Box 
              sx={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.2) 100%)',
                zIndex: 1
              }} 
            />

            {/* Content within Hero */}
            <Box sx={{ position: 'absolute', bottom: 40, left: 40, right: 40, zIndex: 2 }}>
              <Stack spacing={2}>
                <Chip 
                  label={event.category?.category_name?.toUpperCase() || 'EVENT'} 
                  sx={{ 
                    alignSelf: 'flex-start', 
                    bgcolor: 'rgba(45, 212, 191, 0.2)', 
                    color: '#2dd4bf', 
                    fontWeight: 800, 
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    height: 28
                  }} 
                />
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 900, 
                    fontSize: { xs: '2.4rem', md: '4.2rem' },
                    lineHeight: 1.05,
                    letterSpacing: '-2.5px',
                    mb: 1
                  }}
                >
                  {event.event_name}
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '1.1rem', mb: 3, maxWidth: 600 }}>
                  {event.description?.slice(0, 100)}...
                </Typography>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.08)', width: 40, height: 40 }}>
                      <CalendarIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        {event.start_time} - {event.end_time || 'Late'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.08)', width: 40, height: 40 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {event.venue?.name || event.location}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        {event.venue?.address || event.location}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ──────────────── MAIN CONTENT AREA ──────────────── */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          
          {/* LEFT COLUMN: Details, Tickets, Schedule */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              
              {/* About Event Section */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: '24px', 
                  bgcolor: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.06)' 
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>About Event</Typography>
                </Box>
                
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  {event.description}
                </Typography>
              </Paper>

              {/* Tickets Section */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: '24px', 
                  bgcolor: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.06)' 
                }}
              >
                <TicketSelector 
                  tickets={tickets} 
                  selectedTickets={selectedTickets} 
                  onQuantityChange={handleQuantityChange} 
                />
              </Paper>

            </Stack>
          </Grid>

          {/* RIGHT COLUMN: Checkout Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: 100 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: '24px', 
                  bgcolor: '#fff', 
                  color: '#000'
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, letterSpacing: '-0.5px' }}>
                  Checkout
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.1em', display: 'block', mb: 2 }}>
                    EVENT SUMMARY
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box 
                      component="img" 
                      src={getImageUrl(event.image)} 
                      sx={{ width: 64, height: 64, borderRadius: '12px', objectFit: 'cover' }} 
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
                        {event.event_name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarIcon sx={{ fontSize: 12, color: 'rgba(0,0,0,0.4)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                          April 30, 2026 • 18:32
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationIcon sx={{ fontSize: 12, color: 'rgba(0,0,0,0.4)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                          {event.venue?.name || event.location}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.1em', display: 'block', mb: 2 }}>
                    TICKETS
                  </Typography>
                  <Stack spacing={1.5}>
                    {selectedTicketsList.length > 0 ? (
                      selectedTicketsList.map(t => (
                        <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(0,0,0,0.7)' }}>
                            {t.name} <Box component="span" sx={{ fontWeight: 900, color: '#000', ml: 1 }}>x {selectedTickets[t.id]}</Box>
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            ${(t.price * selectedTickets[t.id]).toFixed(2)}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.3)', fontStyle: 'italic' }}>No tickets selected</Typography>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, pt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Total Price</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#0d9488', letterSpacing: '-2px' }}>
                    ${totalAmount.toFixed(2)}
                  </Typography>
                </Box>

                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  disabled={totalSelected === 0 || submitting || (event?.status?.toLowerCase() === 'ongoing' || event?.status?.toLowerCase() === 'completed' || (event?.event_date ? new Date(event.event_date) < new Date() : false))}
                  onClick={handleBookNow}
                  sx={{ 
                    bgcolor: '#0d9488',
                    color: '#fff',
                    borderRadius: "16px", 
                    py: 2, 
                    fontWeight: 900,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(13,148,136,0.3)',
                    '&:hover': {
                      bgcolor: '#0f766e',
                      boxShadow: '0 12px 32px rgba(13,148,136,0.4)'
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#f4f4f4',
                      color: 'rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  {(event?.status?.toLowerCase() === 'ongoing' || event?.status?.toLowerCase() === 'completed' || (event?.event_date ? new Date(event.event_date) < new Date() : false))
                    ? 'Event Already Begun' 
                    : (submitting ? <CircularProgress size={24} color="inherit" /> : 'Book Ticket Now')}
                </Button>
              </Paper>

              <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={handleSaveForLater}
                  disabled={event?.status?.toLowerCase() === 'ongoing' || event?.status?.toLowerCase() === 'completed' || (event?.event_date ? new Date(event.event_date) < new Date() : false)}
                  startIcon={saved ? <FavoriteFilledIcon sx={{ color: '#ef4444' }} /> : <FavoriteIcon />}
                  sx={{ 
                    borderRadius: '16px', 
                    py: 1.8, 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    color: '#fff', 
                    fontWeight: 800, 
                    bgcolor: 'rgba(255,255,255,0.03)',
                    '&.Mui-disabled': {
                      borderColor: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {(event?.status?.toLowerCase() === 'ongoing' || event?.status?.toLowerCase() === 'completed' || (event?.event_date ? new Date(event.event_date) < new Date() : false)) ? 'Event Begun' : 'Save for Later'}
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<ShareIcon />}
                  sx={{ borderRadius: '16px', py: 1.8, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 800, bgcolor: 'rgba(255,255,255,0.03)' }}
                >
                  Share
                </Button>
              </Stack>

              {/* Secure Badge */}
              <Stack direction="row" spacing={2} sx={{ p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'rgba(255,255,255,0.02)' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(45,212,191,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldIcon sx={{ color: '#2dd4bf' }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>100% Secure Booking</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, display: 'block' }}>
                    Your data and payment are fully protected and encrypted.
                  </Typography>
                </Box>
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

      <BookingQRCode 
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        qrData={qrData}
        amount={totalAmount}
        bookingId={createdBookingId}
        md5={paymentMd5}
        onSuccess={handlePaymentSuccess}
        loading={qrLoading}
        eventName={event?.event_name}
      />
    </Box>
  );
};

export default EventDetailPage;
