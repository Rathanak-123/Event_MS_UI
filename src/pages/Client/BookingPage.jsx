import React, { useState, useEffect } from 'react';
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

const BookingPage = () => {
  const theme = useTheme();
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedTickets = {} } = location.state || {};
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
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
        event_id: parseInt(eventId),
        ticket_id: parseInt(primaryTicketId),
        quantity: quantity,
        total_amount: calculateTotal().toString(),
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        status: 'Pending'
      };

      const response = await createBooking(bookingData);
      
      // Navigate to payment
      navigate(`/payment/${response.id}`, { 
        state: { 
            totalAmount: calculateTotal(),
            eventName: event.event_name || event.title
        } 
      });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to create booking. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

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
                  <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth 
                        label="First Name" 
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 3 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth 
                        label="Last Name" 
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 3 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                        fullWidth 
                        label="Email Address" 
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 3 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                        fullWidth 
                        label="Phone Number" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 3 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 4 }}>
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
    </Box>
  );
};

export default BookingPage;
