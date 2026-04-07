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

const TicketNotch = ({ top }) => (
    <Box sx={{ 
        position: 'absolute', 
        top: top || '50%', 
        left: -12, 
        right: -12, 
        display: 'flex', 
        justifyContent: 'space-between',
        zIndex: 10,
        pointerEvents: 'none'
    }}>
        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'background.paper', ml: 0 }} />
        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'background.paper', mr: 0 }} />
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
        alert("Download failed. Please try again later.");
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 8, 
          m: { xs: 2, sm: 'auto' }, 
          p: 0,
          overflow: 'hidden',
          boxShadow: '0 50px 120px rgba(0,0,0,0.15)',
          bgcolor: 'transparent'
        }
      }}
    >
      <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          pt: 4, 
          px: 5,
          pb: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
      }}>
        <Typography variant="h5" fontWeight={900} display="flex" alignItems="center" gap={2} color="primary.main" sx={{ letterSpacing: '-1px' }}>
          <TicketIcon sx={{ fontSize: 32 }} /> Your E-Tickets
        </Typography>
        <IconButton onClick={onClose} size="medium" sx={{ bgcolor: alpha(theme.palette.text.secondary, 0.05) }}>
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
                    maxWidth: 480,
                    mx: 'auto',
                    borderRadius: 8,
                    overflow: 'visible', // Visible for notches
                    boxShadow: '0 40px 100px rgba(0,0,0,0.12)',
                    bgcolor: 'white',
                    position: 'relative',
                    mb: 5
                }}
             >
                {/* 1. Header Section (Image & Brand) */}
                <Box sx={{ 
                    height: 220, 
                    position: 'relative',
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
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
                            background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.8) 100%)',
                        }}
                    />
                    
                    <Box sx={{ position: 'relative', p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box 
                            sx={{ 
                                alignSelf: 'flex-start',
                                bgcolor: '#fbbf24', 
                                px: 1.5, 
                                py: 0.5, 
                                borderRadius: 1.5,
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: 1 }}>
                                {currentTicket.booking?.event?.category?.category_name || "VIP ACCESS"}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    fontWeight: 900, 
                                    color: 'white', 
                                    maxWidth: '70%',
                                    lineHeight: 1.1,
                                    letterSpacing: '-1px'
                                }}
                            >
                                {currentTicket.booking?.event?.event_name}
                            </Typography>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>Price</Typography>
                                <Typography variant="h5" sx={{ color: 'white', fontWeight: 900 }}>${currentTicket.booking?.total_amount || '149.00'}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* 2. Info Section (White) */}
                <Box sx={{ p: 4, position: 'relative' }}>
                    <Grid container spacing={4} sx={{ mb: 5 }}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>Date & Time</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900, mt: 0.5 }}>
                                {currentTicket.booking?.event?.event_date ? new Date(currentTicket.booking.event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '24 OCT, 2024'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Starts at {currentTicket.booking?.event?.start_time || '20:00'}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>Location</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900, mt: 0.5 }}>{currentTicket.booking?.event?.venue?.name || 'Starlight Arena'}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Phnom Penh, KH</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>Gate / Section</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900, mt: 0.5 }}>Gate G4 / Sec B</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>Seat Number</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900, mt: 0.5, fontStyle: 'italic' }}>{currentTicket.booking?.ticket?.ticket_type}-ROW-12 / 42</Typography>
                        </Grid>
                    </Grid>

                    <Barcode />
                    
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            display: 'block', 
                            textAlign: 'center', 
                            fontFamily: 'monospace', 
                            color: 'text.secondary',
                            letterSpacing: 3,
                            fontWeight: 600,
                            mt: 1
                        }}
                    >
                        TICKET CODE: {currentTicket.ticket_code}
                    </Typography>

                    <TicketNotch top="calc(100% - 12px)" />
                </Box>

                {/* 3. Bottom Section (Entry Pass) */}
                <Box sx={{ px: 4, pt: 1, pb: 4 }}>
                   <Divider sx={{ borderStyle: 'dashed', borderColor: '#e2e8f0', mb: 3 }} />
                   
                   <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        bgcolor: '#f1f5f9',
                        p: 3,
                        borderRadius: 6
                    }}
                   >
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>Entry Pass</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#1e293b' }}>ADMIT ONE</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DotIcon sx={{ fontSize: 10, color: '#10b981' }} />
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Valid Ticket</Typography>
                            </Box>
                        </Box>
                        
                        <Box 
                            sx={{ 
                                bgcolor: 'white', 
                                p: 1, 
                                borderRadius: 3, 
                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                display: 'flex'
                            }}
                        >
                            <Box 
                                component="img"
                                src={currentTicket.qr_code}
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

             <Stack spacing={2} sx={{ maxWidth: 480, mx: 'auto' }}>
                 <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    startIcon={<PrintIcon />}
                    sx={{ 
                        py: 2, 
                        borderRadius: 4, 
                        fontWeight: 900, 
                        fontSize: '1.1rem',
                        bgcolor: '#111',
                        color: 'white',
                        '&:hover': { bgcolor: '#000' }
                    }}
                 >
                     Print Ticket
                 </Button>
                 
                 <Stack direction="row" spacing={2}>
                    <Button 
                        fullWidth 
                        variant="outlined" 
                        size="large"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadTicket}
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
