import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Stack,
  Button,
  alpha,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import {
  ChevronLeft as BackIcon,
  ShieldOutlined as ShieldIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { generateKHQR, checkPaymentByMD5 } from '../../api/payment.api';
import PaymentQR from './PaymentQR';
import { generateEventTicket } from '../../api/eventTicket.api';

const PaymentPage = () => {
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
        await generateEventTicket(bookingId);
        navigate('/success', { state: { bookingId, totalAmount, eventName } });
    } catch (err) {
        console.error("Failed to generate ticket:", err);
        setError("Payment confirmation failed. Please try again.");
    } finally {
        setCheckingStatus(false);
    }
  }, [bookingId, totalAmount, eventName, navigate, checkingStatus]);

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
            handleDone();
          }
        } catch (error) { console.error("Polling error:", error); }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [md5, isSuccess, handleDone]);

  if (loading && !qrData) {
    return (
      <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#2dd4bf' }} />
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 800, color: '#fff' }}>Generating Secure KHQR...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', pt: 12, pb: 10, color: '#fff' }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Avatar sx={{ bgcolor: 'rgba(13, 148, 136, 0.1)', color: '#2dd4bf', width: 64, height: 64, mx: 'auto', mb: 3 }}>
            <PaymentIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-2px' }}>
            Complete Payment
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.45)', maxWidth: '500px', mx: 'auto' }}>
            Your spot for <strong>{eventName}</strong> is reserved. Please scan the QR code to finalize your booking.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 6, borderRadius: '16px', bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>{error}</Alert>}

        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} md={7}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: '32px', 
                bgcolor: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.06)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative Glow */}
              <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, bgcolor: 'rgba(45,212,191,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />
              
              <PaymentQR 
                qrData={qrData} 
                amount={totalAmount} 
                bookingId={bookingId}
                loading={loading}
              />
              
              <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                  <ShieldIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>SECURE ENCRYPTED TRANSACTION</Typography>
                </Stack>
                <Button 
                    fullWidth 
                    variant="text" 
                    onClick={() => navigate(-1)}
                    startIcon={<BackIcon />}
                    sx={{ color: 'rgba(255,255,255,0.45)', fontWeight: 800, textTransform: 'none', '&:hover': { color: '#fff' } }}
                >
                    Cancel & Go Back
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PaymentPage;
