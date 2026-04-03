import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  Button,
  Divider,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  QrCode2 as QrIcon,
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
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Scan to Pay
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Scan this KHQR with your mobile banking app to complete the payment.
        </Typography>
      </Box>

      <Box sx={{ 
        position: 'relative', 
        mx: 'auto', 
        width: 400, 
        height: 400, 
        p: 2, 
        bgcolor: 'white', 
        borderRadius: 4, 
        border: '1px solid', 
        borderColor: alpha('#000', 0.05),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 4
      }}>
        {loading ? (
          <CircularProgress color="primary" size={60} />
        ) : (
          <Box 
            component="img"
            src={qrData || "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=KHQR_PAYMENT_DEMO"}
            alt="KHQR Code"
            sx={{ width: '100%', height: '100%', borderRadius: 2 }}
          />
        )}
      </Box>

      <Stack spacing={2} sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: alpha('#0f766e', 0.04), borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary">Amount Due</Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>${amount}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 3 }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" color="text.secondary">Booking ID</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{bookingId}</Typography>
          </Box>
          <IconButton onClick={handleCopy} size="small" color={copied ? "success" : "default"}>
            {copied ? <DoneIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
          <InfoIcon sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Supports ABA, ACLEDA, Wing & more</Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PaymentQR;
