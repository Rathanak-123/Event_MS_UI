import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  Divider,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Done as DoneIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const PaymentQR = ({ qrData = '', amount = 0, bookingId = '', loading = false }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#fff' }}>
          Scan to Pay
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>
          Please use your mobile banking app to scan the KHQR code below.
        </Typography>
      </Box>

      {/* QR Container */}
      <Box sx={{ 
        position: 'relative', 
        mx: 'auto', 
        width: { xs: 280, sm: 320 }, 
        height: { xs: 280, sm: 320 }, 
        p: 2, 
        bgcolor: '#fff', 
        borderRadius: '24px', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 5
      }}>
        {loading ? (
          <CircularProgress sx={{ color: '#0d9488' }} size={50} />
        ) : (
          <Box 
            component="img"
            src={qrData || "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=KHQR_PAYMENT_DEMO"}
            alt="KHQR Code"
            sx={{ width: '100%', height: '100%', borderRadius: '12px' }}
          />
        )}
        
        {/* Decorative corner accents */}
        <Box sx={{ position: 'absolute', top: -5, left: -5, width: 30, height: 30, borderTop: '4px solid #2dd4bf', borderLeft: '4px solid #2dd4bf', borderRadius: '8px 0 0 0' }} />
        <Box sx={{ position: 'absolute', top: -5, right: -5, width: 30, height: 30, borderTop: '4px solid #2dd4bf', borderRight: '4px solid #2dd4bf', borderRadius: '0 8px 0 0' }} />
        <Box sx={{ position: 'absolute', bottom: -5, left: -5, width: 30, height: 30, borderBottom: '4px solid #2dd4bf', borderLeft: '4px solid #2dd4bf', borderRadius: '0 0 0 8px' }} />
        <Box sx={{ position: 'absolute', bottom: -5, right: -5, width: 30, height: 30, borderBottom: '4px solid #2dd4bf', borderRight: '4px solid #2dd4bf', borderRadius: '0 0 8px 0' }} />
      </Box>

      <Stack spacing={2.5} sx={{ mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2.5, 
            bgcolor: 'rgba(255,255,255,0.03)', 
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>AMOUNT DUE</Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#2dd4bf', letterSpacing: '-1px' }}>${parseFloat(amount).toFixed(2)}</Typography>
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2, 
            border: '1px dashed rgba(255,255,255,0.1)', 
            borderRadius: '16px' 
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>BOOKING REFERENCE</Typography>
            <Typography variant="body1" sx={{ fontWeight: 800, color: '#fff' }}>{bookingId}</Typography>
          </Box>
          <IconButton onClick={handleCopy} size="small" sx={{ color: copied ? "#2dd4bf" : "rgba(255,255,255,0.4)" }}>
            {copied ? <DoneIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ color: 'rgba(255,255,255,0.3)' }}>
        <InfoIcon sx={{ fontSize: 14 }} />
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
          SUPPORTS ALL BAKONG ENABLED APPS
        </Typography>
      </Stack>
    </Box>
  );
};

export default PaymentQR;
