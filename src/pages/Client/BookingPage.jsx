import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  alpha,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ChevronLeft as BackIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getEventById } from '../../api/events.api';
import { createBooking } from '../../api/booking.api';
import { getPaginatedTickets } from '../../api/ticket.api';
import { generateKHQR } from '../../api/payment.api';
import BookingQRCode from './BookingQRCode';
import { useAuth } from '../../context/AuthContext';
import { generateEventTicket } from '../../api/eventTicket.api';


const BookingPage = () => {
  const theme = useTheme();
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clientUser } = useAuth();
  
  const { selectedTickets = {} } = location.state || {};
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
  });

  // Auto-fill email from logged in profile
  useEffect(() => {
    const profileEmail = clientUser?.email || '';
    if (profileEmail) {
      setFormData(prev => ({ ...prev, email: profileEmail }));
    }
  }, [clientUser]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [bookingTotal, setBookingTotal] = useState(0);
  const [paymentMd5, setPaymentMd5] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, ticketData] = await Promise.all([
          getEventById(eventId),
          getPaginatedTickets({ filters: { event_id: eventId }, limit: 100 })
        ]);
        
        const rawEvent = eventData?.data || eventData;
        const tickets = ticketData?.items || ticketData?.results || ticketData?.data || (Array.isArray(ticketData) ? ticketData : []);
        
        // Attach tickets to event so calculateTotal works
        setEvent({ ...rawEvent, tickets });
      } catch (err) {
        console.error(err);
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    if (!event || !event.tickets) return 0;
    return Object.keys(selectedTickets).reduce((sum, id) => {
      const ticket = event.tickets.find(t => t.id === parseInt(id));
      return sum + (ticket ? ticket.price * selectedTickets[id] : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Mocking multiple ticket logic or choosing the first one as primary
      // Real implementation would depend on backend schema
      const ticketIds = Object.keys(selectedTickets).filter(id => selectedTickets[id] > 0);
      const primaryTicketId = ticketIds[0];
      const quantity = selectedTickets[primaryTicketId];
      
      const bookingData = {
        event: parseInt(eventId),
        ticket: parseInt(primaryTicketId),
        quantity: quantity,
        customer: clientUser?.id,
      };

      const response = await createBooking(bookingData);
      
      // Capture total synchronously before any async operations change state
      const total = calculateTotal();
      setBookingTotal(total);

      const newBookingId = response.id || response.data?.id;
      setCreatedBookingId(newBookingId);
      setQrModalOpen(true);
      setQrLoading(true);

      // Attempt to load KHQR automatically
      try {
        const khqrRes = await generateKHQR(newBookingId, total);
        
        // Store MD5 for polling
        const md5 = khqrRes?.data?.md5 || khqrRes?.md5 || khqrRes?.data?.md5_hash || khqrRes?.md5_hash;
        setPaymentMd5(md5);

        // Handle both nested and non-nested response shapes
        const img =
          khqrRes?.data?.qr_image ||
          khqrRes?.qr_image ||
          khqrRes?.data?.qr_code ||
          khqrRes?.qr_code ||
          khqrRes?.data?.qr_data ||
          khqrRes?.qr_data;
        setQrData(img || null);
      } catch (err) {
        console.error("Failed to generate QR:", err);
        setQrData(null);
        setSnackbar({ open: true, message: 'Could not fetch payment QR.', severity: 'warning' });
      } finally {
        setQrLoading(false);
      }

    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to create booking. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = useCallback(async () => {
    setQrModalOpen(false);
    
    // Automatically generate the event ticket upon payment success
    try {
        await generateEventTicket(createdBookingId);
    } catch (err) {
        console.error("Auto-generation of ticket failed:", err);
        // We still proceed to success page as the booking is paid
    }

    setSnackbar({ 
      open: true, 
      message: 'Payment Successful! Your tickets are ready.', 
      severity: 'success' 
    });

    // Navigate to success page or my bookings after a slight delay
    setTimeout(() => {
        navigate('/success', { 
            state: { 
                bookingId: createdBookingId, 
                totalAmount: bookingTotal,
                eventName: event?.event_name || event?.title,
                booking: {
                    id: createdBookingId,
                    event: event,
                    customer: clientUser,
                    total_amount: bookingTotal,
                    status: 'Confirmed'
                }
            } 
        });
    }, 2000);
  }, [createdBookingId, bookingTotal, event, navigate]);

  const handleCloseQR = useCallback(() => {
    setQrModalOpen(false);
    // Optionally navigate away after scanning
    navigate(`/payment/${createdBookingId}`, { 
      state: { 
          totalAmount: bookingTotal,
          eventName: event?.event_name || event?.title
      } 
    });
  }, [createdBookingId, bookingTotal, event, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 12, pb: 10 }}>
      <Container maxWidth="lg">
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ mb: 4, fontWeight: 700 }}
        >
          Back to Event
        </Button>

        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-1.5px' }}>Check Out</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>Complete your booking details to secure your tickets.</Typography>

            <Paper elevation={0} sx={{ p: 5, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 4 }}>Contact Information</Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField 
                        fullWidth 
                        label="Gmail Address" 
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          sx: { borderRadius: 3 },
                          readOnly: !!clientUser?.email,
                        }}
                        helperText={clientUser?.email ? 'Auto-filled from your profile' : ''}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        size="large" 
                        fullWidth 
                        disabled={submitting}
                        sx={{ 
                            py: 2.5, 
                            borderRadius: 4, 
                            fontWeight: 900, 
                            fontSize: '1.1rem',
                            boxShadow: '0 10px 25px rgba(15, 118, 110, 0.3)'
                        }}
                    >
                      {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking & Pay'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    borderRadius: 6, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Order Summary</Typography>
                
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{event?.event_name || event?.title}</Typography>
                    <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                        <EventIcon fontSize="small" /> {new Date(event?.event_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                        <LocationIcon fontSize="small" /> {event?.venue?.name}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2} sx={{ mb: 3 }}>
                    {event?.tickets?.filter(t => selectedTickets[t.id] > 0).map(t => (
                        <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">{t.name} x {selectedTickets[t.id]}</Typography>
                            <Typography variant="body2" fontWeight={700}>${(t.price * selectedTickets[t.id]).toFixed(2)}</Typography>
                        </Box>
                    ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                        ${calculateTotal().toFixed(2)}
                    </Typography>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <BookingQRCode 
        open={qrModalOpen}
        onClose={handleCloseQR}
        qrData={qrData}
        amount={bookingTotal}
        bookingId={createdBookingId}
        md5={paymentMd5}
        onSuccess={handlePaymentSuccess}
        loading={qrLoading}
        eventName={event?.event_name || event?.title}
      />
    </Box>
  );
};

export default BookingPage;
