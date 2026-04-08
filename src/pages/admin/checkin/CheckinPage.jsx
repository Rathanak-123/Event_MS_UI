import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import {
  QrCodeScanner,
  CheckCircle,
  Error as ErrorIcon,
  Event as EventIcon,
  Person as PersonIcon,
  ConfirmationNumber as TicketIcon
} from "@mui/icons-material";
import { confirmCheckin, paginateCheckins } from "../../../api/checkin.api";
import { getPaginatedEventTickets } from "../../../api/eventTicket.api";

export default function CheckinPage() {
  const [ticketCode, setTicketCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [ticketStatusMsg, setTicketStatusMsg] = useState("");

  const fetchRecentCheckins = async () => {
    try {
      setLoadingRecent(true);
      const res = await paginateCheckins({
        page: 1,
        limit: 5,
        sort_by: "created_at",
        sort_order: "desc"
      });
      setRecentCheckins(res?.items || res?.data || []);
    } catch (err) {
      console.error("Failed to fetch recent checkins:", err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentCheckins();
  }, []);

  const handleSearchTicket = async (e) => {
    e?.preventDefault();
    if (!ticketCode.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setTicketStatusMsg("");

    try {
      // Step 1: Search for the ticket details using the ticket API
      const res = await getPaginatedEventTickets({
        page: 1,
        limit: 1,
        search: ticketCode.trim(),
        filters: { ticket_code: ticketCode.trim() }
      });
      
      const items = res?.items || res?.data || [];
      if (items.length > 0) {
        // We found the ticket!
        setResult(items[0]);
        // Also check if it's already used
        if (items[0].status === "USED" || items[0].status === "ALREADY_USED") {
           setTicketStatusMsg("ALREADY USED");
        } else {
           setTicketStatusMsg("READY");
        }
      } else {
        setError("Ticket not found. Invalid ticket code.");
      }
    } catch (err) {
      console.error("Ticket search error:", err);
      setError("Failed to search ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckin = async () => {
    if (!result || !result.ticket_code) return;

    setConfirming(true);
    setError(null);

    try {
      // Actually confirm check-in via Checkins API
      await confirmCheckin({ ticket_code: result.ticket_code });
      
      setTicketStatusMsg("SUCCESS");
      fetchRecentCheckins(); // Refresh recent list
      
      // Optionally clear after 3 seconds:
      // setTimeout(() => { setResult(null); setTicketCode(""); }, 3000);
    } catch (err) {
      console.error("Check-in confirm error:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to confirm check-in."
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3, pt: 1 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
        <TicketIcon sx={{ color: '#fbbf24', fontSize: 28, transform: 'rotate(-20deg)' }} />
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#0f172a' }}>
          Ticket Check-In
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
        Validate customer tickets quickly and prevent duplicate entry
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 5, alignItems: 'center', bgcolor: '#1e293b', p: 1, pl: 2, borderRadius: 2, border: '1px solid #334155' }}>
        <TextField
          fullWidth
          placeholder="Enter Ticket Code"
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearchTicket(e);
            }
          }}
          disabled={loading}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: { color: 'white', fontSize: '0.95rem' }
          }}
        />
        <Button
          onClick={handleSearchTicket}
          disabled={loading || !ticketCode.trim()}
          variant="contained"
          sx={{
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: 1.5,
            px: 3,
            py: 1,
            whiteSpace: 'nowrap',
            textTransform: 'none',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#059669' },
            '&.Mui-disabled': { backgroundColor: '#10b981', opacity: 0.5, color: 'white' }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Check Ticket"}
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ borderRadius: 2, mb: 4, bgcolor: '#7f1d1d', color: '#fca5a5', '& .MuiAlert-icon': { color: '#fca5a5' } }}
        >
          {error}
        </Alert>
      )}

      {result && (() => {
        // Automatically find the checkin object inside result in case it is wrapped
        const dataPayload = result.booking || result.ticket_code ? result : 
                            (result.checkin ? result.checkin : 
                            (result.data ? result.data : result));
        
        const customerName = dataPayload?.customer_name || 
            (dataPayload?.booking?.customer?.first_name 
              ? `${dataPayload.booking.customer.first_name} ${dataPayload.booking.customer.last_name || ""}` 
              : "N/A");
              
        const eventTitle = dataPayload?.event_title || dataPayload?.event_name || dataPayload?.booking?.event?.title || dataPayload?.booking?.event?.event_name || "N/A";
        const ticketCode = dataPayload?.ticket_code || "N/A";
        const ticketType = dataPayload?.ticket?.ticket_type || dataPayload?.booking?.ticket?.ticket_type || "Standard";
        const bookingId = dataPayload?.booking_id || dataPayload?.booking?.id || "N/A";

        return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Result Panel */}
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1.5, fontWeight: 'bold' }}>
              Result
            </Typography>
            <Card sx={{ 
              bgcolor: '#064e3b', // Dark emerald
              color: 'white', 
              borderRadius: 2, 
              border: '1px solid #059669', 
              boxShadow: 'none',
              height: '100%' 
            }}>
              <CardContent sx={{ p: 3, position: 'relative' }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <Box sx={{ 
                    bgcolor: '#34d399', 
                    borderRadius: '20%', 
                    width: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <CheckCircle sx={{ color: '#064e3b', fontSize: 18 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" letterSpacing={1}>
                    {ticketStatusMsg === "SUCCESS" ? "CHECK-IN SUCCESSFUL" : 
                     ticketStatusMsg === "ALREADY USED" ? "TICKET ALREADY USED" : "TICKET VERIFIED - PENDING CHECK-IN"}
                  </Typography>
                </Box>

                <Box sx={{ position: 'relative', ml: 1.5 }}>
                  <Box sx={{ position: 'absolute', left: 4, top: 12, bottom: 12, width: '2px', bgcolor: '#047857' }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5, position: 'relative' }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34d399', position: 'absolute', left: 2, top: 6, zIndex: 1 }} />
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      <span style={{ color: '#6ee7b7' }}>Customer: </span> 
                      <span style={{ fontWeight: 'bold' }}>{customerName}</span>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5, position: 'relative' }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34d399', position: 'absolute', left: 2, top: 6, zIndex: 1 }} />
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      <span style={{ color: '#6ee7b7' }}>Event: </span> 
                      <span style={{ fontWeight: 'bold' }}>{eventTitle}</span>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34d399', position: 'absolute', left: 2, top: 6, zIndex: 1 }} />
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      <span style={{ color: '#6ee7b7' }}>Ticket Code: </span> 
                      <span style={{ fontWeight: 'bold' }}>{ticketCode}</span>
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleConfirmCheckin}
                    disabled={ticketStatusMsg !== "READY" || confirming}
                    sx={{ 
                      bgcolor: '#10b981', 
                      color: 'white',
                      '&:hover': { bgcolor: '#059669' }, 
                      textTransform: 'none', 
                      borderRadius: 1.5,
                      px: 3,
                      fontWeight: 'bold',
                      '&.Mui-disabled': { bgcolor: '#10b981', opacity: 0.5, color: 'white' }
                    }}
                  >
                    {confirming ? <CircularProgress size={20} color="inherit" /> : 
                     ticketStatusMsg === "SUCCESS" ? "Checked In" : 
                     ticketStatusMsg === "ALREADY USED" ? "Already Used" : "Confirm Check-In"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Ticket Details Panel */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1.5, fontWeight: 'bold' }}>
              Ticket Details
            </Typography>
            <Card sx={{ 
              bgcolor: '#1e293b', // slate-800
              color: '#f8fafc', 
              borderRadius: 2, 
              border: '1px solid #334155',
              boxShadow: 'none',
              height: '100%' 
            }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', height: '100%', boxSizing: 'border-box' }}>
                <Typography variant="body2" sx={{ display: 'flex' }}>
                  <span style={{ color: '#94a3b8', width: '100px', flexShrink: 0 }}>Customer:</span> 
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {customerName}
                  </span>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex' }}>
                  <span style={{ color: '#94a3b8', width: '100px', flexShrink: 0 }}>Event:</span> 
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {eventTitle}
                  </span>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex' }}>
                  <span style={{ color: '#94a3b8', width: '100px', flexShrink: 0 }}>Ticket Type:</span> 
                  <span>{ticketType}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex' }}>
                  <span style={{ color: '#94a3b8', width: '100px', flexShrink: 0 }}>Ticket Code:</span> 
                  <span style={{ fontWeight: 'bold' }}>{ticketCode}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex' }}>
                  <span style={{ color: '#94a3b8', width: '100px', flexShrink: 0 }}>Booking ID:</span> 
                  <span>{bookingId}</span>
                </Typography>

                <Box sx={{ position: 'absolute', bottom: 24, right: 24 }}>
                  <Chip 
                    label="• VALID" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#064e3b', 
                      color: '#34d399', 
                      fontWeight: 'bold', 
                      border: '1px solid #059669',
                      borderRadius: 1
                    }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
      })()}

      {/* Recent Check-ins Table */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1.5, fontWeight: 'bold' }}>
          Recent Check-Ins
        </Typography>
        <TableContainer component={Paper} sx={{ 
          bgcolor: '#1e293b', 
          borderRadius: 2, 
          border: '1px solid #334155',
          boxShadow: 'none'
        }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', py: 2 }}>Ticket Code</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', py: 2 }}>Customer</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', py: 2 }}>Status</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', py: 2 }}>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingRecent && recentCheckins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ borderBottom: 'none', py: 4 }}>
                    <CircularProgress size={24} sx={{ color: '#3b82f6' }} />
                  </TableCell>
                </TableRow>
              ) : recentCheckins.length > 0 ? (
                recentCheckins.map((item, index) => {
                  const custName = item.customer_name || 
                                  (item.booking?.customer?.first_name ? `${item.booking.customer.first_name} ${item.booking.customer.last_name || ""}` : "Unknown");
                  const timeObj = item.created_at || item.checkin_time;
                  const timeStr = timeObj ? new Date(timeObj).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
                  
                  // Determine status styles matching the screenshot
                  const isSuccess = item.status === "SUCCESS" || !item.status;
                  const isAlreadyUsed = item.status === "ALREADY_USED" || item.status === "ALREADY USED";
                  
                  let chipBg = '#334155';
                  let chipColor = '#f8fafc';
                  let chipIcon = null;
                  let chipLabel = item.status || "SUCCESS";

                  if (isSuccess) {
                    chipBg = '#064e3b'; // very dark green
                    chipColor = '#34d399'; // light green
                    chipIcon = <CheckCircle sx={{ fontSize: '14px !important', color: '#34d399' }} />;
                  } else if (isAlreadyUsed) {
                    chipBg = '#78350f'; // very dark amber/brown
                    chipColor = '#fbbf24'; // light amber
                    chipIcon = <ErrorIcon sx={{ fontSize: '14px !important', color: '#fbbf24' }} />; // Using warning-like icon
                    chipLabel = "ALREADY USED";
                  } else {
                    chipBg = '#7f1d1d'; // very dark red
                    chipColor = '#fca5a5'; // light red
                    chipIcon = <ErrorIcon sx={{ fontSize: '14px !important', color: '#fca5a5' }} />;
                  }
                  
                  return (
                    <TableRow key={item.id || index} hover sx={{ '&:hover': { bgcolor: '#334155' } }}>
                      <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid #334155', borderBottomWidth: index === recentCheckins.length - 1 ? 0 : 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {item.ticket_code}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid #334155', borderBottomWidth: index === recentCheckins.length - 1 ? 0 : 1 }}>
                        {custName}
                      </TableCell>
                      <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid #334155', borderBottomWidth: index === recentCheckins.length - 1 ? 0 : 1 }}>
                        <Chip
                          label={chipLabel}
                          size="small"
                          icon={chipIcon}
                          sx={{ 
                            bgcolor: chipBg, 
                            color: chipColor, 
                            fontWeight: "bold", 
                            fontSize: "0.7rem",
                            borderRadius: 1,
                            height: 24,
                            '& .MuiChip-icon': { ml: 0.5 }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', borderBottomWidth: index === recentCheckins.length - 1 ? 0 : 1 }}>
                        {timeStr}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ borderBottom: 'none', py: 4 }}>
                    <Typography variant="body2" color="#94a3b8">
                      No recent check-ins found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </Box>
  );
}
