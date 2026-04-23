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
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material';
import {
  ChevronLeft as BackIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  ShieldOutlined as ShieldIcon,
  EmailOutlined as EmailIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getEventById } from '../../api/events.api';
import { createBooking } from '../../api/booking.api';
import { getPaginatedTickets } from '../../api/ticket.api';
import { generateKHQR } from '../../api/payment.api';
import BookingQRCode from './BookingQRCode';
import { useAuth } from '../../context/AuthContext';
import { generateEventTicket } from '../../api/eventTicket.api';
import { getImageUrl } from '../../utils/imageUtils';

const BookingPage = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clientUser } = useAuth();
  
  const { selectedTickets = {} } = location.state || {};
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({ email: '' });

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
  const bookingIdRef = React.useRef(null);
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

  const calculateTotal = () => {
    if (!event || !event.tickets) return 0;
    return Object.keys(selectedTickets).reduce((sum, id) => {
      const ticket = event.tickets.find(t => t.id === parseInt(id));
      return sum + (ticket ? ticket.price * selectedTickets[id] : 0);
    }, 0);
  };

  const subtotal = calculateTotal();
  const totalAmount = subtotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
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
      setBookingTotal(totalAmount);

      const newBookingId = response.id || response.data?.id;
      setCreatedBookingId(newBookingId);
      bookingIdRef.current = newBookingId;
      setQrModalOpen(true);
      setQrLoading(true);

      try {
        const khqrRes = await generateKHQR(newBookingId, totalAmount);
        const md5 = khqrRes?.data?.md5 || khqrRes?.md5;
        setPaymentMd5(md5);
        const img = khqrRes?.data?.qr_image || khqrRes?.qr_image || khqrRes?.data?.qr_code || khqrRes?.qr_code;
        setQrData(img || null);
      } catch (err) {
        console.error("Failed to generate QR:", err);
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
    try {
        const idToUse = bookingIdRef.current || createdBookingId;
        await generateEventTicket(idToUse);
    } catch (err) { console.error(err); }

    setSnackbar({ open: true, message: 'Payment Successful!', severity: 'success' });
    setTimeout(() => {
        navigate('/success', { 
            state: { 
                bookingId: bookingIdRef.current || createdBookingId, 
                totalAmount: bookingTotal,
                eventName: event?.event_name,
                booking: { id: bookingIdRef.current || createdBookingId, event, customer: clientUser, total_amount: bookingTotal, status: 'Confirmed' }
            } 
        });
    }, 2000);
  }, [createdBookingId, bookingTotal, event, navigate, clientUser]);

  const handleCloseQR = useCallback(() => {
    setQrModalOpen(false);
    navigate(`/payment/${bookingIdRef.current || createdBookingId}`, { state: { totalAmount: bookingTotal, eventName: event?.event_name } });
  }, [createdBookingId, bookingTotal, event, navigate]);

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', pt: 12, pb: 10, color: '#fff' }}>
      <Container maxWidth="lg">
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ mb: 4, fontWeight: 800, color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}
        >
          Back to Event
        </Button>

        <Grid container spacing={6}>
          {/* Left: Contact Info */}
          <Grid item xs={12} md={7}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-1.5px' }}>Check Out</Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.45)', mb: 6 }}>
              Secure your spot at the ultimate event. Enter your details to proceed.
            </Typography>

            <Paper 
              elevation={0} 
              sx={{ 
                p: 5, 
                borderRadius: '24px', 
                bgcolor: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.06)' 
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                <Avatar sx={{ bgcolor: 'rgba(13,148,136,0.1)', color: '#2dd4bf' }}>
                  <EmailIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Contact Information</Typography>
              </Stack>

              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <TextField 
                    fullWidth 
                    label="Email Address" 
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    variant="outlined"
                    InputProps={{
                      sx: { 
                        borderRadius: '12px', 
                        bgcolor: 'rgba(255,255,255,0.03)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
                      },
                      readOnly: !!clientUser?.email,
                    }}
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }}
                    helperText={clientUser?.email ? 'Using your verified account email' : ''}
                    FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.3)' } }}
                  />

                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    fullWidth 
                    disabled={submitting}
                    sx={{ 
                      py: 2.2, 
                      borderRadius: '16px', 
                      fontWeight: 900, 
                      fontSize: '1.1rem',
                      bgcolor: '#0d9488',
                      boxShadow: '0 10px 30px rgba(13,148,136,0.2)',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#0f766e', boxShadow: '0 12px 40px rgba(13,148,136,0.3)' }
                    }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Booking & Pay'}
                  </Button>
                </Stack>
              </form>
            </Paper>

            {/* Secure Badge */}
            <Stack direction="row" spacing={2} sx={{ mt: 4, p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'rgba(255,255,255,0.01)' }}>
              <ShieldIcon sx={{ color: '#2dd4bf' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                Your booking is encrypted and secure. By proceeding, you agree to our terms of service and refund policy.
              </Typography>
            </Stack>
          </Grid>

          {/* Right: Summary */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: '24px', 
                bgcolor: '#fff', 
                color: '#000',
                position: { md: 'sticky' },
                top: 100
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, letterSpacing: '-0.5px' }}>Order Summary</Typography>
              
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box 
                    component="img" 
                    src={getImageUrl(event?.image)} 
                    sx={{ width: 80, height: 80, borderRadius: '16px', objectFit: 'cover' }} 
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 0.8 }}>
                      {event?.event_name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CalendarIcon sx={{ fontSize: 14, color: 'rgba(0,0,0,0.4)' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                        {new Date(event?.event_date).toLocaleDateString()} • {event?.start_time}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LocationIcon sx={{ fontSize: 14, color: 'rgba(0,0,0,0.4)' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                        {event?.venue?.name || event?.location}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.1em', display: 'block', mb: 2.5 }}>
                  TICKET DETAILS
                </Typography>
                <Stack spacing={2}>
                  {event?.tickets?.filter(t => selectedTickets[t.id] > 0).map(t => (
                    <Box key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'rgba(0,0,0,0.7)' }}>
                        {t.name} <Box component="span" sx={{ fontWeight: 900, color: '#000', ml: 1 }}>x {selectedTickets[t.id]}</Box>
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 900 }}>
                        ${(t.price * selectedTickets[t.id]).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ mb: 4, pt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Total Payable</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#0d9488', letterSpacing: '-2px' }}>
                    ${totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>{snackbar.message}</Alert>
      </Snackbar>

      <BookingQRCode 
        open={qrModalOpen}
        onClose={handleCloseQR}
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

export default BookingPage;
