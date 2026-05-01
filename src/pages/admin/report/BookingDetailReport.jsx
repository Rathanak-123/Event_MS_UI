import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Breadcrumbs,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Event as EventIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { getBookingById, downloadTicket } from "../../../api/booking.api";
import dayjs from "dayjs";

const BookingDetailReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBookingDetail();
    }
  }, [id]);

  const fetchBookingDetail = async () => {
    setLoading(true);
    try {
      const data = await getBookingById(id);
      setBooking(data);
    } catch (error) {
      console.error("Failed to fetch booking detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    try {
      const data = await downloadTicket(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  const InfoCard = ({ title, icon, color, children }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.2)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            p: 1.25,
            borderRadius: 2,
            bgcolor: color,
            color: '#fff',
            display: 'flex',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} color={color} gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          {children}
        </Box>
      </Stack>
    </Paper>
  );

  const DetailItem = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500} color="text.primary">
        {value || "—"}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!booking && !loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">Booking not found.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>

      <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : '#f8fafc', 
          borderBottom: `1px solid ${theme.palette.divider}`, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          '@media print': { bgcolor: 'transparent', p: 1 }
        }}>
          <Typography variant="h5" fontWeight={700}>
            Booking Details - #{booking.booking_id || id}
          </Typography>
          <Button
            className="no-print"
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2, textTransform: 'none', px: 2 }}
          >
            Back to Reports
          </Button>
        </Box>

        <Box sx={{ p: 4 }}>
          {/* Top Info Cards */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <InfoCard title="Customer Info" icon={<PersonIcon />} color={theme.palette.primary.main}>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
                  {booking.customer 
                    ? `${booking.customer.first_name || ''} ${booking.customer.last_name || ''}`.trim() || "N/A"
                    : "Guest"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Email: {booking.customer?.email || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer ID: {booking.customer?.id || "—"}
                </Typography>
              </InfoCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoCard title="Ticket Status" icon={<ConfirmationNumberIcon />} color={theme.palette.info.main}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography variant="h3" fontWeight={900}>
                    {booking.quantity}
                  </Typography>
                  <Chip
                    label={booking.status?.toUpperCase() || 'PENDING'}
                    color={booking.status?.toLowerCase() === 'confirmed' ? 'success' : 'warning'}
                    sx={{ fontWeight: 800, borderRadius: 1.5, px: 1 }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Status indicates if the payment and booking are officially confirmed.
                </Typography>
              </InfoCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoCard title="Event Details" icon={<EventIcon />} color={theme.palette.secondary.main}>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }} noWrap>
                  {booking.event?.event_name || booking.event?.name || "—"}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {booking.event?.event_date ? dayjs(booking.event.event_date).format('YYYY-MM-DD') : "—"}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {booking.event?.venue?.name || booking.event?.location || "—"}
                  </Typography>
                </Stack>
              </InfoCard>
            </Grid>
          </Grid>

          {/* Details Grid */}
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <DetailItem label="Customer ID" value={booking.customer?.id} />
              <DetailItem label="First Name" value={booking.customer?.first_name} />
              <DetailItem label="Last Name" value={booking.customer?.last_name} />
              <DetailItem label="Email" value={booking.customer?.email} />
              <DetailItem label="Registration Date" value={booking.customer?.created_at ? dayjs(booking.customer.created_at).format('YYYY-MM-DD HH:mm:ss') : "—"} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DetailItem label="Booking ID" value={booking.booking_id || booking.id} />
              <DetailItem label="Booking Date" value={booking.booking_date ? dayjs(booking.booking_date).format('YYYY-MM-DD HH:mm:ss') : "—"} />
              <DetailItem label="Quantity" value={booking.quantity} />
              <DetailItem label="Total Amount" value={`$${parseFloat(booking.total_amount || 0).toFixed(2)}`} />
              <DetailItem label="Payment Method" value={booking.payment_method || "—"} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DetailItem label="Event" value={booking.event?.event_name || booking.event?.name || booking.event_name} />
              <DetailItem label="Event Date" value={(booking.event?.event_date || booking.event_date) ? dayjs(booking.event?.event_date || booking.event_date).format('YYYY-MM-DD') : "—"} />
              <DetailItem label="Ticket Type" value={booking.ticket?.ticket_type || booking.ticket?.type || "—"} />
              <DetailItem label="Venue" value={booking.event?.venue?.name || booking.event?.location || "—"} />
            </Grid>
          </Grid>
          
          {/* Check-in History Section */}
          {booking.checkin_history && booking.checkin_history.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                Check-in History
              </Typography>
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.success.main, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Ticket Code</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Check-in Time</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {booking.checkin_history.map((record) => (
                      <TableRow key={record.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{record.ticket_code}</TableCell>
                        <TableCell>{dayjs(record.checkin_time).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status} 
                            size="small" 
                            color={record.status === 'SUCCESS' || record.status === 'USED' ? 'success' : 'warning'} 
                            variant="soft"
                            sx={{ fontWeight: 700, borderRadius: 1 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}
        </Box>

        <Box className="no-print" sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : '#fcfcfc', borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            onClick={() => navigate(-1)} 
            variant="contained" 
            color="primary" 
            sx={{ borderRadius: 2, textTransform: 'none', px: 4, fontWeight: 700 }}
          >
            CLOSE
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BookingDetailReport;
