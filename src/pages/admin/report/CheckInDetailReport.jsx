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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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
  CheckCircle as CheckCircleIcon,
  QrCode as QrCodeIcon,
} from "@mui/icons-material";
import { getBookingById } from "../../../api/booking.api";
import dayjs from "dayjs";

const DetailItem = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500} color="text.primary">
      {value || "—"}
    </Typography>
  </Box>
);

const InfoCard = ({ title, icon, children, color }) => {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%', bgcolor: alpha(color, 0.02) }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(color, 0.1), color: color, display: 'flex' }}>
          {icon}
        </Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
};

const CheckInDetailReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await getBookingById(id);
      if (data) {
        setBooking(data.data || data);
      }
    } catch (error) {
      console.error("Failed to fetch detail", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Detail not found</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>Go Back</Button>
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
          <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircleIcon color="success" />
            Check-in Detail Report
          </Typography>
          <Button
            className="no-print"
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2, textTransform: 'none', px: 2 }}
          >
            Back to List
          </Button>
        </Box>

        <Box sx={{ p: 4 }}>
          {/* Top Info Cards */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <InfoCard title="Customer" icon={<PersonIcon />} color={theme.palette.primary.main}>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
                  {booking.customer 
                    ? `${booking.customer.first_name || ''} ${booking.customer.last_name || ''}`.trim() || "N/A"
                    : "Guest"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.customer?.email || "No email provided"}
                </Typography>
              </InfoCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoCard title="Event Details" icon={<EventIcon />} color={theme.palette.secondary.main}>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }} noWrap>
                  {booking.event?.event_name || booking.event?.name || "—"}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {booking.event?.venue?.name || booking.event?.location || "—"}
                  </Typography>
                </Stack>
              </InfoCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoCard title="Check-in Status" icon={<CheckCircleIcon />} color={theme.palette.success.main}>
                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
                  {booking.is_checked_in ? "CHECKED IN" : "NOT CHECKED IN"}
                </Typography>
                <Chip 
                  label={booking.status?.toUpperCase() || "PENDING"} 
                  color={booking.status === 'confirmed' ? 'success' : 'warning'} 
                  size="small" 
                  sx={{ mt: 1, fontWeight: 700, borderRadius: 1 }}
                />
              </InfoCard>
            </Grid>
          </Grid>

          {/* Details Grid */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={4}>
              <DetailItem label="Ticket Code (Primary)" value={booking.checkin_history?.[0]?.ticket_code || "N/A"} />
              <DetailItem label="Booking ID" value={booking.booking_id || booking.id} />
              <DetailItem label="Ticket Type" value={booking.ticket?.ticket_type || booking.ticket?.type || "—"} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DetailItem label="Quantity" value={booking.quantity} />
              <DetailItem label="Total Amount" value={`$${parseFloat(booking.total_amount || 0).toFixed(2)}`} />
              <DetailItem label="Booking Date" value={booking.booking_date ? dayjs(booking.booking_date).format('YYYY-MM-DD HH:mm:ss') : "—"} />
            </Grid>
            <Grid item xs={12} sm={4}>
               <DetailItem label="Event Date" value={(booking.event?.event_date || booking.event_date) ? dayjs(booking.event?.event_date || booking.event_date).format('YYYY-MM-DD') : "—"} />
               <DetailItem label="Venue" value={booking.event?.venue?.name || booking.event?.location || "—"} />
               <DetailItem label="Payment" value={booking.payment_method || "—"} />
            </Grid>
          </Grid>

          {/* Scan History Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCodeIcon sx={{ color: theme.palette.info.main }} />
              Scan History & Logs
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Ticket Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check-in Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Result Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {booking.checkin_history && booking.checkin_history.length > 0 ? (
                    booking.checkin_history.map((record) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No scan records found for this booking</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        </Box>

        <Box className="no-print" sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : '#fcfcfc', borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
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

export default CheckInDetailReport;
