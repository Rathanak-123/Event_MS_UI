import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Stack,
  Button,
  Divider,
  alpha,
  useTheme,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ChevronLeft as BackIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { generateKHQR, checkPaymentByMD5 } from '../../api/payment.api';
import PaymentQR from './PaymentQR';
import { generateEventTicket } from '../../api/eventTicket.api';


const PaymentPage = () => {
  const theme = useTheme();
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { totalAmount = 0, eventName = 'Event' } = location.state || {};
  
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [md5, setMd5] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchQR = async () => {
      setLoading(true);
      try {
        const data = await generateKHQR(bookingId, totalAmount);
        
        // Handle various backend response shapes
        const responseData = data?.data || data;
        const img = responseData?.qr_image || responseData?.qr_data || responseData?.qr_code;
        const hash = responseData?.md5 || responseData?.hash;
        
        setQrData(img || '');
        setMd5(hash || null);
      } catch (err) {
        console.error(err);
        setError("Failed to generate payment QR. Please try again or contact support.");
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [bookingId, totalAmount]);

  const handleDone = React.useCallback(async () => {
    if (checkingStatus) return;
    setCheckingStatus(true);
    try {
        // Automatically generate the event ticket
        await generateEventTicket(bookingId);
        
        // Navigate to success page
        navigate('/success', { 
            state: { 
                bookingId, 
                totalAmount,
                eventName
            } 
        });
    } catch (err) {
        console.error("Failed to generate ticket:", err);
        setError("Payment confirmation failed. Please try again or contact support.");
    } finally {
        setCheckingStatus(false);
    }
  }, [bookingId, totalAmount, eventName, navigate]);

  // Polling logic
  useEffect(() => {
    let intervalId;
    if (md5 && !isSuccess) {
      intervalId = setInterval(async () => {
        try {
          const res = await checkPaymentByMD5(md5);
          const isPaid = 
            res?.paid === true || 
            res?.data?.paid === true || 
            res?.status === 'paid' || 
            res?.data?.status === 'paid' ||
            res?.message === 'Payment confirmed' ||
            res?.status === 'COMPLETED' ||
            res?.data?.status === 'COMPLETED';

          if (isPaid) {
            clearInterval(intervalId);
            setIsSuccess(true);
            handleDone(); // Trigger ticket generation and redirect
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [md5, isSuccess, handleDone]);


  if (loading && !qrData) {
    return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 700 }}>Generating Your KHQR...</Typography>
      </Box>
    </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 12, pb: 10 }}>
      
      <Container maxWidth="md" sx={{ py: 12 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, textAlign: 'center', mb: 1, letterSpacing: '-1.5px' }}>
          Complete Payment
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 8, maxWidth: '500px', mx: 'auto' }}>
            Your booking is reserved! Please scan the QR code below to finalize your purchase.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 6, borderRadius: 3 }}>{error}</Alert>}

        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} md={7}>
            <PaymentQR 
              qrData={qrData} 
              amount={totalAmount} 
              bookingId={bookingId}
              loading={loading}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: 6, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Summary</Typography>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Event</Typography>
                        <Typography fontWeight={700} noWrap sx={{ maxWidth: '140px' }}>{eventName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">Booking ID</Typography>
                        <Typography fontWeight={700} variant="body2">{bookingId}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                            ${totalAmount.toFixed(2)}
                        </Typography>
                    </Box>
                </Stack>
              </Paper>

              <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  onClick={handleDone}
                  sx={{ 
                      borderRadius: 4, 
                      py: 2.5, 
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      boxShadow: '0 10px 25px rgba(15, 118, 110, 0.3)'
                  }}
              >
                  I've Paid
              </Button>
              
              <Button 
                  fullWidth 
                  variant="text" 
                  onClick={() => navigate(-1)}
                  sx={{ color: 'text.secondary', fontWeight: 800 }}
              >
                  Cancel & Go Back
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PaymentPage;
