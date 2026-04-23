import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  alpha,
  Divider
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Download as DownloadIcon,
  ConfirmationNumber as TicketIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { downloadTicket } from '../../api/booking.api';
import EventTicketModal from './EventTicketModal';
import { useLocation, useNavigate } from 'react-router-dom';


const SuccessPage = () => {
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
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', pt: 12, pb: 10, color: '#fff' }}>
      
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Paper 
          elevation={0}
          sx={{ 
              p: { xs: 4, md: 8 }, 
              borderRadius: '32px', 
              border: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
              bgcolor: 'rgba(255,255,255,0.02)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)'
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
                bgcolor: 'rgba(45,212,191,0.05)',
                zIndex: 0
            }} 
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box 
                sx={{ 
                    width: 100, 
                    height: 100, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(45,212,191,0.1)',
                    color: '#2dd4bf',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4,
                    boxShadow: '0 20px 40px rgba(45,212,191,0.2)',
                    border: '1px solid rgba(45,212,191,0.2)'
                }}
            >
                <SuccessIcon sx={{ fontSize: 56 }} />
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: '#fff', letterSpacing: '-1.5px' }}>
                Booking Confirmed!
            </Typography>
            <Typography variant="body1" sx={{ mb: 6, lineHeight: 1.8, fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)' }}>
                Thank you for your purchase! Your spot at <strong>{eventName}</strong> is reserved. 
                A confirmation has been sent to your email.
            </Typography>

            <Box 
                sx={{ 
                    bgcolor: 'rgba(255,255,255,0.03)', 
                    p: 4, 
                    borderRadius: '24px', 
                    mb: 6,
                    border: '1px dashed rgba(255,255,255,0.1)',
                    textAlign: 'center'
                }}
            >
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800, mb: 1, display: 'block', color: 'rgba(255,255,255,0.4)' }}>
                    Booking Reference
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#2dd4bf', mb: 2 }}>
                    {bookingId}
                </Typography>
                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Total Paid: <strong style={{ color: '#fff' }}>${totalAmount.toFixed(2)}</strong>
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
                        borderRadius: '16px', 
                        py: 2.5, 
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        bgcolor: '#0d9488',
                        boxShadow: '0 10px 25px rgba(13,148,136,0.3)',
                        mb: 2,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#0f766e' }
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
                        borderRadius: '16px', 
                        py: 2, 
                        fontWeight: 900,
                        fontSize: '1rem',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }
                    }}
                >
                    Download PDF Ticket
                </Button>

                
                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                    <Button 
                        variant="text" 
                        fullWidth
                        onClick={() => navigate('/my-bookings')}
                        sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'none' }}
                    >
                        My Bookings
                    </Button>
                    <Button 
                        variant="text" 
                        fullWidth
                        onClick={() => navigate('/')}
                        startIcon={<HomeIcon />}
                        sx={{ color: '#fff', fontWeight: 700, textTransform: 'none' }}
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
