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

        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <PaymentQR 
              qrData={qrData} 
              amount={totalAmount} 
              bookingId={bookingId}
              loading={loading}
            />
            
            <Stack spacing={3} sx={{ mt: 4 }}>
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
