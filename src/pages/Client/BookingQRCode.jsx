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
          borderRadius: '32px', 
          bgcolor: '#0a0a0a',
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.08)',
          m: { xs: 2, sm: 'auto' }, 
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        pb: 1, 
        pt: 3,
        px: 4,
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5, color: '#fff', letterSpacing: '-0.5px' }}>
          <QrIcon sx={{ fontSize: 28, color: '#2dd4bf' }} /> Scan to Pay
        </Typography>
        {!loading && (
          <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pt: 4, px: 4, pb: 5 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 4, lineHeight: 1.6 }}>
          Complete your payment for <strong style={{ color: '#fff' }}>{eventName || "Premium Event"}</strong> using KHQR.
        </Typography>
        
        <Box sx={{ 
          p: 2, 
          bgcolor: '#fff', 
          display: 'inline-block', 
          borderRadius: '24px', 
          boxShadow: '0 0 40px rgba(45,212,191,0.15)',
          mb: 4,
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.02)' }
        }}>
          {loading ? (
            <Box sx={{ width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={40} thickness={4} sx={{ color: '#0d9488' }} />
            </Box>
          ) : qrData ? (
            <Box component="img" src={qrData} alt="QR Code" sx={{ width: 240, height: 240, objectFit: 'contain' }} />
          ) : (
            <Box sx={{ width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
              <Typography color="error" variant="caption" sx={{ fontWeight: 800 }}>QR Load Failed</Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ 
          bgcolor: 'rgba(255,255,255,0.02)', 
          p: 3, 
          borderRadius: '20px', 
          mb: 4, 
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
            <Stack spacing={0.5} alignItems="center">
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.6rem' }}>
                    AMOUNT DUE
                </Typography>
                <Typography variant="h3" sx={{ color: '#2dd4bf', fontWeight: 900, letterSpacing: '-2px' }}>
                    ${amount?.toFixed(2)}
                </Typography>
                {bookingId && (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', mt: 1, fontWeight: 600 }}>
                        ORDER ID: #{bookingId}
                    </Typography>
                )}
            </Stack>
        </Box>
 
        <Box sx={{ 
          bgcolor: 'rgba(45,212,191,0.05)', 
          py: 2, 
          px: 3,
          borderRadius: '16px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          border: '1px solid rgba(45,212,191,0.1)'
        }}>
            <CircularProgress size={18} thickness={6} sx={{ color: '#2dd4bf' }} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#2dd4bf', letterSpacing: '0.5px' }}>
                Verifying your payment...
            </Typography>
        </Box>
        
        <Typography variant="caption" sx={{ display: 'block', mt: 3, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
            Do not close this window until confirmation is received.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default BookingQRCode;
