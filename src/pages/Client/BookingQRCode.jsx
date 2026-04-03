import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack
} from '@mui/material';
import { Close as CloseIcon, QrCode2 as QrIcon } from '@mui/icons-material';
import { checkPaymentByMD5 } from '../../api/payment.api';

const BookingQRCode = ({ open, onClose, qrData, amount, bookingId, md5, onSuccess, loading, eventName }) => {
  
  useEffect(() => {
    let intervalId;

    if (open && md5 && !loading) {
      // Start polling
      intervalId = setInterval(async () => {
        try {
          const res = await checkPaymentByMD5(md5);
          
          // Capture ONLY strict success indicators from the backend
          const isPaid = 
            res?.paid === true || 
            res?.data?.paid === true || 
            res?.status === 'paid' || 
            res?.data?.status === 'paid' ||
            res?.message === 'Payment confirmed';

          if (isPaid) {
            clearInterval(intervalId);
            onSuccess();
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000); 
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [open, md5, loading, onSuccess]);

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: { xs: 4, sm: 6 }, 
          m: { xs: 2, sm: 'auto' }, 
          p: 0.5 
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, px: { xs: 2, sm: 3 } }}>
        <Typography variant="subtitle1" fontWeight={900} display="flex" alignItems="center" gap={1}>
          <QrIcon color="primary" sx={{ fontSize: 22 }} /> Scan to Pay
        </Typography>
        {!loading && (
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pt: 1, px: { xs: 2, sm: 3 } }}>
        <Typography variant="body2" color="text.secondary" mb={2.5} sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' }, lineHeight: 1.4 }}>
          Scan this KHQR with your mobile banking app to complete your payment for<br />
          <strong style={{ color: '#001A33' }}>{eventName || "your booking"}</strong>.
        </Typography>
        
        <Box sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          bgcolor: 'white', 
          display: 'inline-block', 
          borderRadius: 4, 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          mb: 2.5
        }}>
          {loading ? (
            <Box sx={{ width: { xs: 220, sm: 260 }, height: { xs: 220, sm: 260 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={32} thickness={4} />
            </Box>
          ) : qrData ? (
            <Box component="img" src={qrData} alt="QR Code" sx={{ width: { xs: 220, sm: 260 }, height: { xs: 220, sm: 260 }, objectFit: 'contain' }} />
          ) : (
            <Box sx={{ width: { xs: 220, sm: 260 }, height: { xs: 220, sm: 260 }, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
              <Typography color="error" variant="caption" fontWeight={700}>Failed to load QR Image</Typography>
              <Typography variant="caption" color="text.secondary">Try again</Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ 
          bgcolor: '#f8fafb', 
          p: { xs: 1.5, sm: 2 }, 
          borderRadius: 3, 
          mb: 2.5, 
          border: '1px solid', 
          borderColor: '#eef1f4'
        }}>
            <Stack spacing={0}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem' }}>
                    Amount Due
                </Typography>
                <Typography variant="h5" color="#13795B" fontWeight={900} sx={{ letterSpacing: '-0.5px' }}>
                    ${amount?.toFixed(2)}
                </Typography>
                {bookingId && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, opacity: 0.7, fontSize: '0.7rem' }}>
                        Booking ID: #{bookingId}
                    </Typography>
                )}
            </Stack>
        </Box>

        <Button 
            variant="contained" 
            fullWidth 
            onClick={onClose}
            disabled={loading}
            sx={{ 
                py: 1.5, 
                borderRadius: 3, 
                fontWeight: 800, 
                fontSize: '0.95rem',
                bgcolor: '#13795B',
                boxShadow: 'none',
                textTransform: 'none',
                '&:hover': { bgcolor: '#0e6047', boxShadow: 'none' }
            }}
        >
            Done
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default BookingQRCode;
