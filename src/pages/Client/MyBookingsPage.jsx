import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getPaginatedBookings } from '../../api/booking.api';
import { getImageUrl } from '../../utils/imageUtils';

const MyBookingsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming 'user' object from AuthContext contains the customer identifier
      // or we can filter by 'customer_email' or similar if 'id' is not the customer ID.
      // Based on AuthContext.jsx, we merged the customer profile into 'user'.
      const customerId = user?.customer_id || user?.id;
      
      const filters = {};
      if (customerId) {
        filters.customer_id = customerId;
      }

      const data = await getPaginatedBookings({ filters, limit: 100 });
      // Support different response structures
      const items = data?.items || data?.results || data?.data || (Array.isArray(data) ? data : []);
      setBookings(items);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed' || s === 'completed' || s === 'upcoming') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'cancelled' || s === 'failed') return 'error';
    return 'default';
  };

  const filteredBookings = bookings.filter(b => {
    const status = b.status?.toLowerCase();
    if (tabValue === 0) return status === 'upcoming' || status === 'confirmed' || status === 'pending';
    if (tabValue === 1) return status === 'completed';
    if (tabValue === 2) return status === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', pt: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pb: 10 }}>
      <Typography variant="h3" fontWeight={800} gutterBottom sx={{ pt: 12, letterSpacing: '-1.5px' }}>My Bookings</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
        Manage your tickets and view your event history.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)}
            sx={{
                '& .MuiTab-root': { fontWeight: 700, px: 4, py: 2 },
                '& .Mui-selected': { color: 'primary.main' }
            }}
        >
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Box>

      {filteredBookings.length > 0 ? (
        <Stack spacing={3}>
          {filteredBookings.map((booking) => (
            <Paper 
                key={booking.id}
                elevation={0}
                sx={{ 
                    p: 3, 
                    borderRadius: 4, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    '&:hover': { 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                        transform: 'translateY(-4px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Box 
                    component="img" 
                    src={getImageUrl(booking.event?.image || booking.image)} 
                    sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 3, bgcolor: alpha(theme.palette.text.primary, 0.05) }} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h6" fontWeight={800}>{booking.event?.event_name || booking.event?.name || booking.event_name || "Event Name"}</Typography>
                        <Chip 
                            label={booking.status} 
                            size="small" 
                            color={getStatusColor(booking.status)}
                            sx={{ fontWeight: 700, height: 24, fontSize: '0.65rem', textTransform: 'uppercase' }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" sx={{ opacity: 0.6 }} /> 
                        {booking.event?.event_date ? new Date(booking.event.event_date).toLocaleDateString() : (booking.date || "Date TBA")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" sx={{ opacity: 0.6 }} /> 
                        {booking.event?.venue?.name || booking.location || "Location TBA"}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Stack spacing={2} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                        <Typography variant="h6" fontWeight={900} color="primary.main">
                            ${parseFloat(booking.total_amount || 0).toFixed(2)}
                        </Typography>
                        <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<TicketIcon />}
                            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                        >
                            View Ticket
                        </Button>
                    </Stack>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Box sx={{ py: 10, textAlign: 'center', bgcolor: alpha(theme.palette.text.secondary, 0.03), borderRadius: 6, border: '1px dashed', borderColor: 'divider' }}>
            <TicketIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No bookings found in this category.</Typography>
            <Button variant="text" sx={{ mt: 2, fontWeight: 700 }} onClick={() => window.location.href = '/'}>Browse Events</Button>
        </Box>
      )}
    </Container>
  );
};

export default MyBookingsPage;
