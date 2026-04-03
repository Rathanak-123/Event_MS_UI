import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  alpha,
  useTheme,
  Divider
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Download as DownloadIcon,
  ConfirmationNumber as TicketIcon,
  ArrowForward as ArrowIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { downloadTicket } from '../../api/booking.api';
import EventTicketModal from './EventTicketModal';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


const SuccessPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    bookingId = 'N/A',
    totalAmount = 0, 
    eventName = 'Event',
    booking = null
  } = location.state || {};

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const handleDownloadTicket = async () => {
    if (bookingId === 'N/A') return;
    try {
        const blob = await downloadTicket(bookingId);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Ticket-${bookingId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (error) {
        console.error("Failed to download ticket:", error);
        alert("E-Ticket not available yet. Please check again in 'My Bookings'.");
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 12, pb: 10 }}>
      
      <Container maxWidth="sm" sx={{ py: 20 }}>
        <Paper 
          elevation={0}
          sx={{ 
              p: { xs: 4, md: 8 }, 
              borderRadius: 8, 
              border: '1px solid', 
              borderColor: 'divider',
              textAlign: 'center',
              boxShadow: '0 40px 100px rgba(0,0,0,0.08)',
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden'
          }}
        >
          {/* Decorative background element */}
          <Box 
            sx={{ 
                position: 'absolute', 
                top: -100, 
                right: -100, 
                width: 300, 
                height: 300, 
                borderRadius: '50%', 
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                zIndex: 0
            }} 
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box 
                sx={{ 
                    width: 100, 
                    height: 100, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4,
                    boxShadow: `0 20px 40px ${alpha(theme.palette.success.main, 0.2)}`
                }}
            >
                <SuccessIcon sx={{ fontSize: 56 }} />
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'text.primary', letterSpacing: '-1.5px' }}>
                Booking Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, lineHeight: 1.8, fontSize: '1.1rem' }}>
                Thank you for your purchase! Your spot at <strong>{eventName}</strong> is reserved. 
                A confirmation has been sent to your email.
            </Typography>

            <Box 
                sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.05), 
                    p: 4, 
                    borderRadius: 6, 
                    mb: 6,
                    border: '1px dashed',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    textAlign: 'center'
                }}
            >
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, mb: 1, display: 'block' }}>
                    Booking Reference
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>
                    {bookingId}
                </Typography>
                <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.primary.main, 0.1) }} />
                <Typography variant="body2" color="text.secondary">
                    Total Paid: <strong>${totalAmount.toFixed(2)}</strong>
                </Typography>
            </Box>

            <Stack spacing={2}>
                <Button 
                    variant="contained" 
                    size="large" 
                    fullWidth
                    onClick={() => setIsTicketModalOpen(true)}
                    startIcon={<TicketIcon />}
                    sx={{ 
                        borderRadius: 4, 
                        py: 2.5, 
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        boxShadow: '0 10px 25px rgba(15, 118, 110, 0.3)',
                        mb: 2
                    }}
                >
                    View E-Ticket
                </Button>

                <Button 
                    variant="outlined" 
                    size="large" 
                    fullWidth
                    onClick={handleDownloadTicket}
                    startIcon={<DownloadIcon />}
                    sx={{ 
                        borderRadius: 4, 
                        py: 2, 
                        fontWeight: 900,
                        fontSize: '1rem',
                        borderColor: 'divider',
                        color: 'text.primary'
                    }}
                >
                    Download PDF Ticket
                </Button>

                
                <Stack direction="row" spacing={2}>
                    <Button 
                        variant="outlined" 
                        fullWidth
                        onClick={() => navigate('/my-bookings')}
                        startIcon={<TicketIcon />}
                        sx={{ borderRadius: 3, py: 1.8, fontWeight: 700, borderColor: 'divider', color: 'text.primary' }}
                    >
                        My Bookings
                    </Button>
                    <Button 
                        variant="outlined" 
                        fullWidth
                        onClick={() => navigate('/')}
                        startIcon={<HomeIcon />}
                        sx={{ borderRadius: 3, py: 1.8, fontWeight: 700, borderColor: 'divider', color: 'text.primary' }}
                    >
                        Home
                    </Button>
                </Stack>
            </Stack>
          </Box>
        </Paper>
      </Container>
      <EventTicketModal 
        open={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={booking || { id: bookingId, event: { event_name: eventName } }}
      />
    </Box>

  );
};

export default SuccessPage;
