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
  SaveAlt as DownloadIcon
} from '@mui/icons-material';
import { getEventTickets } from '../../api/eventTicket.api';

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
      // The API endpoint /event-tickets/ might support filtering by booking_id
      // but if not, we can filter locally or the backend handles it.
      // Assuming it supports query params.
      const data = await getEventTickets({ booking: booking.id });
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Unable to load your tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentTicket = tickets[page - 1];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 6, 
          m: { xs: 2, sm: 'auto' }, 
          p: 0,
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          pt: 3, 
          px: 4,
          pb: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.05)
      }}>
        <Typography variant="h6" fontWeight={900} display="flex" alignItems="center" gap={1.5} color="primary.main">
          <TicketIcon /> Your E-Tickets
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress size={32} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 600 }}>Retrieving tickets...</Typography>
          </Box>
        ) : error ? (
            <Box sx={{ py: 10, px: 4, textAlign: 'center' }}>
                <Typography color="error" variant="body1" fontWeight={700}>{error}</Typography>
                <Button variant="outlined" sx={{ mt: 3, borderRadius: 3 }} onClick={fetchTickets}>Retry</Button>
            </Box>
        ) : tickets.length > 0 ? (
          <Box>
             {/* Ticket Card */}
             <Box sx={{ p: 4 }}>
                <Paper 
                    elevation={0}
                    sx={{ 
                        bgcolor: 'background.paper',
                        borderRadius: 6,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {/* Event Banner Area */}
                    <Box sx={{ p: 3, bgcolor: alpha(theme.palette.text.primary, 0.02), borderBottom: '1px dashed', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" color="primary" fontWeight={900} sx={{ textTransform: 'uppercase', letterSpacing: 1.5, mb: 1, fontSize: '0.75rem' }}>
                            {booking.event?.category?.name || "Official Ticket"}
                        </Typography>
                        <Typography variant="h5" fontWeight={900} sx={{ mb: 2, letterSpacing: '-0.5px' }}>
                            {booking.event?.event_name || "Event Title"}
                        </Typography>
                        <Stack direction="row" spacing={3} sx={{ opacity: 0.8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption" fontWeight={700}>
                                    {booking.event?.event_date ? new Date(booking.event.event_date).toLocaleDateString() : 'Date TBA'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption" fontWeight={700}>
                                    {booking.event?.venue?.name || 'Venue TBA'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* QR and Code Area */}
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Box 
                            sx={{ 
                                p: 2, 
                                bgcolor: 'white', 
                                display: 'inline-block', 
                                borderRadius: 4, 
                                border: '1px solid', 
                                borderColor: alpha(theme.palette.divider, 0.5),
                                mb: 3,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                            }}
                        >
                            <Box 
                                component="img" 
                                src={currentTicket.qr_code} 
                                alt="QR Code" 
                                sx={{ width: 180, height: 180, objectFit: 'contain' }} 
                            />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.7rem', mb: 0.5 }}>
                            Ticket ID
                        </Typography>
                        <Typography variant="h6" fontWeight={900} color="text.primary" sx={{ letterSpacing: 3, fontFamily: 'monospace' }}>
                            {currentTicket.ticket_code}
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary" display="block">Customer</Typography>
                                <Typography variant="body2" fontWeight={800}>{booking.customer?.first_name} {booking.customer?.last_name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary" display="block">Ticket Type</Typography>
                                <Typography variant="body2" fontWeight={800}>{booking.ticket?.ticket_type}</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Footer / Status */}
                    <Box sx={{ py: 1.5, px: 3, bgcolor: alpha(theme.palette.success.main, 0.05), textAlign: 'center' }}>
                        <Typography variant="caption" fontWeight={900} color="success.main" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            Status: {currentTicket.status || 'ACTIVE'}
                        </Typography>
                    </Box>
                </Paper>
             </Box>

             {/* Multiple Tickets Pagination */}
             {tickets.length > 1 && (
                 <Box sx={{ pb: 4, px: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                     <Typography variant="caption" color="text.secondary" fontWeight={700}>
                         Ticket {page} of {tickets.length}
                     </Typography>
                     <Pagination 
                        count={tickets.length} 
                        page={page} 
                        onChange={(e, v) => setPage(v)} 
                        size="small" 
                        color="primary"
                        sx={{
                            '& .MuiPaginationItem-root': { fontWeight: 700 }
                        }}
                     />
                 </Box>
             )}

             <Box sx={{ p: 4, pt: 0 }}>
                 <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<DownloadIcon />}
                    sx={{ py: 1.5, borderRadius: 3, fontWeight: 900, textTransform: 'none', boxShadow: 'none' }}
                 >
                     Save to Photos
                 </Button>
             </Box>
          </Box>
        ) : (
            <Box sx={{ py: 10, textAlign: 'center', px: 4 }}>
                <TicketIcon sx={{ fontSize: 48, color: 'divider', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={800}>No tickets generated yet.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Tickets are usually generated within a few minutes of successful payment.
                </Typography>
            </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};


export default EventTicketModal;
