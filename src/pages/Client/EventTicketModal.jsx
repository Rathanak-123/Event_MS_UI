import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Stack,
  Divider,
  alpha,
  useTheme,
  Button,
  Pagination,
  Grid
} from '@mui/material';
import { 
  Close as CloseIcon, 
  ConfirmationNumber as TicketIcon, 
  CalendarToday as CalendarIcon, 
  LocationOn as LocationIcon,
  SaveAlt as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  FiberManualRecord as DotIcon
} from '@mui/icons-material';
import { getEventTickets, getPaginatedEventTickets } from '../../api/eventTicket.api';
import { getImageUrl } from '../../utils/imageUtils';



const Barcode = () => (
  <Box sx={{ display: 'flex', gap: '3px', height: '55px', alignItems: 'center', justifyContent: 'center', width: '100%', mb: 2 }}>
    {[...Array(40)].map((_, i) => (
      <Box 
        key={i} 
        sx={{ 
          width: i % 7 === 0 ? '4px' : i % 3 === 0 ? '1px' : '2px', 
          height: '100%', 
          bgcolor: '#111',
          opacity: 0.8
        }} 
      />
    ))}
  </Box>
);

const TicketNotch = () => (
    <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: -16, 
        right: -16, 
        display: 'flex', 
        justifyContent: 'space-between',
        zIndex: 10,
        pointerEvents: 'none',
        transform: 'translateY(-50%)'
    }}>
        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#f8fafc' }} />
        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#f8fafc' }} />
    </Box>
);

const EventTicketModal = ({ open, onClose, booking }) => {
  const theme = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (open && booking?.id) {
      fetchTickets();
    }
  }, [open, booking?.id]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching tickets for booking:", booking?.id);
      const data = await getPaginatedEventTickets({ 
          filters: { "booking.id": booking.id },
          limit: 100 
      });
      let rawData = data?.data;
      let items = Array.isArray(rawData) ? rawData : [];
      
      console.log("Raw Data from Paginate:", rawData);
      console.log("Processed Items Array:", items); 
      setTickets(items);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Unable to load your tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentTicket = tickets[page - 1];

  const handleDownloadTicket = async () => {
    if (!booking?.id) return;
    try {
        const { downloadTicket } = await import('../../api/booking.api');
        const blob = await downloadTicket(booking.id);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Ticket-${booking.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (error) {
        console.error("Failed to download ticket:", error);
        const errorMsg = error.response?.status 
            ? `Server returned ${error.response.status}`
            : error.message;
        alert(`Download failed: ${errorMsg}\n\nPlease check if the backend API (/bookings/${booking.id}/ticket/) is running and supports ticket downloads.`);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3, 
          m: { xs: 2, sm: 'auto' }, 
          p: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }
      }}
    >
      <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          position: 'relative',
          pt: 3, 
          px: 3,
          pb: 2,
          bgcolor: 'background.paper',
      }}>
        <TicketIcon sx={{ color: '#145c47', fontSize: 32, position: 'absolute', left: 24, transform: 'rotate(90deg)' }} />
        <Typography variant="h6" fontWeight={800} color="text.primary">
          Your E-Tickets
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#f1f5f9', position: 'absolute', right: 24 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, bgcolor: 'background.paper' }}>
        {loading ? (
          <Box sx={{ py: 15, textAlign: 'center' }}>
            <CircularProgress size={48} thickness={5} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 3, fontWeight: 800 }}>Preparing your tickets...</Typography>
          </Box>
        ) : error ? (
            <Box sx={{ py: 15, px: 5, textAlign: 'center' }}>
                <Typography color="error" variant="h6" fontWeight={800}>{error}</Typography>
                <Button variant="contained" sx={{ mt: 4, borderRadius: 4, py: 1.5, px: 4, fontWeight: 900 }} onClick={fetchTickets}>Retry Connection</Button>
            </Box>
        ) : tickets.length > 0 ? (
          <Box sx={{ px: { xs: 2, md: 8 }, py: 4, bgcolor: '#f8fafc' }}>
             {/* Ticket Container (Vertical) */}
             <Box 
                sx={{ 
                    maxWidth: 500,
                    mx: 'auto',
                    borderRadius: 4,
                    overflow: 'visible',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    bgcolor: 'white',
                    position: 'relative',
                    mb: 5
                }}
             >
                {/* 1. Header Section (Image & Brand) */}
                <Box sx={{ 
                    height: 240, 
                    position: 'relative',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    overflow: 'hidden'
                }}>
                    <Box 
                        sx={{ 
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${getImageUrl(currentTicket.booking?.event?.image || currentTicket.booking?.event?.cover_image)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                    <Box 
                        sx={{ 
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.9) 100%)',
                        }}
                    />
                    
                    <Box sx={{ position: 'relative', p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 3 }}>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    fontWeight: 900, 
                                    color: 'white', 
                                    lineHeight: 1.1,
                                    maxWidth: '75%',
                                    letterSpacing: '-0.5px'
                                }}
                            >
                                {currentTicket.booking?.event?.event_name || 'Improving life chances and making hope'}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <Box sx={{ bgcolor: 'white', px: 1.5, py: 0.3, borderRadius: 4, mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: '#111', fontWeight: 900, fontSize: '0.65rem' }}>PRICE</Typography>
                                </Box>
                                <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, lineHeight: 1 }}>${currentTicket.booking?.total_amount || '0.01'}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* 2. Info Section (White) */}
                <Box sx={{ p: 4, pt: 5 }}>
                    <Grid container spacing={4} sx={{ mb: 5 }}>
                        <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2 }}>Date & Time</Typography>
                            <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 900, mt: 0.5 }}>
                                {currentTicket.booking?.event?.event_date ? new Date(currentTicket.booking.event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '28 Mar 2026'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Starts at {currentTicket.booking?.event?.start_time || '17:32:00'}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2 }}>Location</Typography>
                            <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 900, mt: 0.5 }}>{currentTicket.booking?.event?.venue?.name || 'Vel Vang'}</Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{currentTicket.booking?.event?.venue?.city || 'Phnom Penh, KH'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2 }}>Gate / Section</Typography>
                            <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 900, mt: 0.5 }}>Gate G4 / Sec B</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2 }}>Seat Number</Typography>
                            <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 900, mt: 0.5 }}>{currentTicket.booking?.ticket?.ticket_type || 'VIP'}-ROW-12 / 42</Typography>
                        </Grid>
                    </Grid>

                    <Barcode />
                    
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            display: 'block', 
                            textAlign: 'center', 
                            fontFamily: 'monospace', 
                            color: '#64748b',
                            letterSpacing: 3,
                            fontWeight: 700,
                            mt: 1
                        }}
                    >
                        TICKET CODE: {currentTicket.ticket_code || 'TIX RWDJ9U'}
                    </Typography>
                </Box>

                {/* Notch and Separator */}
                <Box sx={{ position: 'relative', my: 2 }}>
                    <TicketNotch />
                    <Divider sx={{ borderStyle: 'dashed', borderColor: '#e2e8f0', mx: 3 }} />
                </Box>

                {/* 3. Bottom Section (Entry Pass) */}
                <Box sx={{ px: 4, pt: 2, pb: 4 }}>
                    <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        bgcolor: '#f1f5f9',
                        p: 3,
                        px: 4,
                        borderRadius: '40px'
                    }}
                    >
                        <Box>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Entry Pass</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>ADMIT ONE</Typography>
                        </Box>
                        
                        <Box 
                            sx={{ 
                                display: 'flex',
                                mixBlendMode: 'multiply'
                            }}
                        >
                            <Box 
                                component="img"
                                src={currentTicket.qr_code || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example'}
                                alt="QR"
                                sx={{ width: 80, height: 80 }}
                            />
                        </Box>
                    </Box>
                </Box>
             </Box>

             {/* Multiple Tickets Controls */}
             {tickets.length > 1 && (
                 <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                     <Typography variant="subtitle2" color="text.secondary" fontWeight={800}>
                         Ticket {page} of {tickets.length}
                     </Typography>
                     <Pagination 
                        count={tickets.length} 
                        page={page} 
                        onChange={(e, v) => setPage(v)} 
                        size="small" 
                        color="primary"
                        sx={{
                            '& .MuiPaginationItem-root': { fontWeight: 900, borderRadius: 2 }
                        }}
                     />
                 </Box>
             )}

             <Stack direction="row" spacing={2} sx={{ maxWidth: 480, mx: 'auto' }}>
                 <Button 
                     fullWidth 
                     variant="contained" 
                     size="large"
                     startIcon={<DownloadIcon />}
                     onClick={handleDownloadTicket}
                     sx={{ 
                         py: 1.8, 
                         borderRadius: 4, 
                         fontWeight: 900, 
                         bgcolor: '#111',
                         color: 'white',
                         '&:hover': { bgcolor: '#000' }
                     }}
                 >
                     Download
                 </Button>
                 <Button 
                     fullWidth 
                     variant="outlined" 
                     size="large"
                     startIcon={<ShareIcon />}
                     sx={{ 
                         py: 1.8, 
                         borderRadius: 4, 
                         fontWeight: 900, 
                         color: '#111', 
                         borderColor: '#e2e8f0',
                         bgcolor: 'white',
                         '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                     }}
                 >
                     Share
                 </Button>
             </Stack>
          </Box>
        ) : (
            <Box sx={{ py: 15, textAlign: 'center', px: 5 }}>
                <TicketIcon sx={{ fontSize: 80, color: 'divider', mb: 3 }} />
                <Typography variant="h5" color="text.secondary" fontWeight={900}>No tickets found.</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: '300px', mx: 'auto' }}>
                    Tickets are usually generated within a few minutes of successful payment.
                </Typography>
                <Button variant="outlined" sx={{ mt: 5, borderRadius: 4, py: 1.5, px: 3, fontWeight: 800 }} onClick={fetchTickets}>Refresh Status</Button>
            </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};


export default EventTicketModal;
